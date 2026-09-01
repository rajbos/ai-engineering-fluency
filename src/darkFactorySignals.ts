/**
 * Filesystem signal collection for the Dark Factory readiness scan.
 *
 * This is the tier that needs no authentication: everything observable from a
 * checked-out repository. It deliberately does no scoring — it reports what it
 * saw and hands that to the pure scorer in `darkFactoryReadiness.ts`, which
 * owns the policy for turning observations into stages.
 *
 * Cost is kept low on purpose so the scan can run alongside an existing view:
 * a bounded set of `existsSync` probes, one shallow `readdir` per interesting
 * directory, and a capped read of the workflow files. Nothing here walks the
 * whole working tree.
 *
 * A probe that throws resolves to `unknown`, never to `absent` — an
 * unreadable directory is missing evidence, not evidence of absence.
 */
import * as fs from 'fs';
import * as path from 'path';
import { evaluatorAgentNames, type DarkFactoryObservation, type DarkFactoryRepoFacts } from './darkFactoryReadiness';

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

/** Maximum workflow files read per repository. Beyond this the scan stops reading content. */
export const MAX_WORKFLOW_FILES = 50;

/** Maximum entries read from any single directory probe. */
const MAX_DIR_ENTRIES = 200;

/** Directory holding GitHub Actions workflow definitions. */
const WORKFLOWS_DIR = path.join('.github', 'workflows');

// ---------------------------------------------------------------------------
// Detection patterns
// ---------------------------------------------------------------------------

/** A workflow step that actually runs a test suite. Heuristic — a candidate, not a verdict. */
const TEST_STEP_PATTERN =
	/\b(?:npm|yarn|pnpm)\s+(?:run\s+)?test|\bnpm\s+run\s+test:|\bpytest\b|\bdotnet\s+test\b|\bgo\s+test\b|\.\/gradlew\s+\S*test|\bgradle\s+\S*test|\bmvn\b[^\n]*\btest\b|\bcargo\s+test\b|\bbundle\s+exec\s+rspec\b|\btox\b|\bctest\b/i;

/** A call to a reusable workflow in another repository. */
const REUSABLE_WORKFLOW_PATTERN = /^\s*uses:\s*[\w.-]+\/[\w.-]+\/\.github\/workflows\//m;

/** The CodeQL action, however it is pinned. */
const CODEQL_PATTERN = /github\/codeql-action/i;

/** Build-provenance attestation actions. */
const ATTESTATION_PATTERN = /actions\/attest(?:-build-provenance|-sbom)?@/i;

/** A job targeting a named deployment environment. */
const ENVIRONMENT_PATTERN = /^\s*environment:\s*\S/m;

/** GitHub Agentic Workflows compiled from markdown definitions. */
const AGENTIC_WORKFLOW_PATTERN = /githubnext\/gh-aw/i;

/** A workflow handing every job full repository write access. */
const WRITE_ALL_PERMISSIONS_PATTERN = /^\s*permissions:\s*write-all\s*$/m;

/** Static, long-lived cloud credentials passed to a workflow. */
const STATIC_CLOUD_CREDENTIAL_PATTERN =
	/AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID|AZURE_CLIENT_SECRET|GCP_SA_KEY|GOOGLE_CREDENTIALS|GOOGLE_APPLICATION_CREDENTIALS_JSON/;

/** A workflow requesting a short-lived OIDC token instead. */
const OIDC_TOKEN_PATTERN = /id-token:\s*write/;

/** The `url = ...` line of the `origin` remote in a git config file. */
const GIT_ORIGIN_URL_PATTERN = /\[remote\s+"origin"\][^[]*?\burl\s*=\s*(\S+)/s;

// ---------------------------------------------------------------------------
// Bounded filesystem helpers
// ---------------------------------------------------------------------------

function isFile(target: string): boolean {
	try { return fs.statSync(target).isFile(); } catch { return false; }
}

function isDirectory(target: string): boolean {
	try { return fs.statSync(target).isDirectory(); } catch { return false; }
}

/** Shallow directory listing, capped. Returns an empty list for a missing or unreadable directory. */
function listDir(dir: string): string[] {
	try { return fs.readdirSync(dir).slice(0, MAX_DIR_ENTRIES); } catch { return []; }
}

function hasExtension(name: string, extensions: readonly string[]): boolean {
	const lower = name.toLowerCase();
	return extensions.some(ext => lower.endsWith(ext));
}

/** One workflow file's name and content. */
export interface WorkflowFile {
	name: string;
	content: string;
}

/**
 * Read the repository's workflow definitions, capped at {@link MAX_WORKFLOW_FILES}.
 * Files that cannot be read are skipped rather than failing the whole scan.
 */
export function readWorkflowFiles(repoRoot: string): WorkflowFile[] {
	const dir = path.join(repoRoot, WORKFLOWS_DIR);
	const files: WorkflowFile[] = [];
	for (const name of listDir(dir)) {
		if (files.length >= MAX_WORKFLOW_FILES) { break; }
		if (!hasExtension(name, ['.yml', '.yaml'])) { continue; }
		try {
			files.push({ name, content: fs.readFileSync(path.join(dir, name), 'utf8') });
		} catch {
			// An unreadable workflow contributes no evidence either way.
		}
	}
	return files;
}

// ---------------------------------------------------------------------------
// Observation builders
// ---------------------------------------------------------------------------

/** Present when any of the candidate paths exists, naming the one that matched. */
function observePath(repoRoot: string, candidates: readonly string[], kind: 'file' | 'dir' | 'any'): DarkFactoryObservation {
	for (const candidate of candidates) {
		const target = path.join(repoRoot, candidate);
		const matches = kind === 'dir' ? isDirectory(target) : kind === 'file' ? isFile(target) : (isFile(target) || isDirectory(target));
		if (matches) { return { state: 'present', detail: candidate }; }
	}
	return { state: 'absent', detail: `Looked for ${candidates.join(', ')}` };
}

/** Present when a directory holds at least one entry matching `accept`. */
function observeDirEntries(repoRoot: string, dir: string, accept: (name: string) => boolean, label: string): DarkFactoryObservation {
	const matches = listDir(path.join(repoRoot, dir)).filter(accept);
	return matches.length > 0
		? { state: 'present', detail: `${matches.length} ${label} in ${dir}` }
		: { state: 'absent', detail: `No ${label} in ${dir}` };
}

/** Present when any workflow's content matches, naming the workflows that did. */
function observeWorkflowPattern(workflows: readonly WorkflowFile[], pattern: RegExp, label: string): DarkFactoryObservation {
	const matched = workflows.filter(w => pattern.test(w.content)).map(w => w.name);
	return matched.length > 0
		? { state: 'present', detail: `${label}: ${matched.slice(0, 3).join(', ')}` }
		: { state: 'absent', detail: `No workflow ${label}` };
}

// ---------------------------------------------------------------------------
// Per-stage collection
// ---------------------------------------------------------------------------

/** Candidate locations GitHub accepts for a CODEOWNERS file. */
const CODEOWNERS_PATHS = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'];

/** Markers of infrastructure described as code. Heuristic — deliberately strict. */
const IAC_PATHS = [
	'terraform', 'infra', 'infrastructure', 'bicep', 'main.tf', 'main.bicep',
	'Pulumi.yaml', 'helm', 'charts', 'k8s', 'kubernetes', 'deploy',
];

/** Directories that hold versioned specifications. */
const SPEC_PATHS = ['specs', 'spec', 'docs/specs'];

/** Directories that hold executable acceptance scenarios. */
const ACCEPTANCE_PATHS = ['features', 'acceptance', 'e2e', 'tests/acceptance', 'test/acceptance', 'tests/e2e', 'test/e2e'];

function collectStage1(repoRoot: string, workflows: readonly WorkflowFile[]): Record<string, DarkFactoryObservation> {
	const workflowCount = workflows.length;
	const rootEntries = listDir(repoRoot);
	const hasRootIacFile = rootEntries.some(name => hasExtension(name, ['.tf', '.bicep']));
	const iac = hasRootIacFile
		? { state: 'present' as const, detail: 'Infrastructure definitions in the repository root' }
		: observePath(repoRoot, IAC_PATHS, 'any');

	return {
		'ci-workflows': workflowCount > 0
			? { state: 'present', detail: `${workflowCount} workflow file(s) in ${WORKFLOWS_DIR}` }
			: { state: 'absent', detail: `No workflow files in ${WORKFLOWS_DIR}` },
		'ci-test-execution': observeWorkflowPattern(workflows, TEST_STEP_PATTERN, 'runs a test suite'),
		'reusable-workflows': observeWorkflowPattern(workflows, REUSABLE_WORKFLOW_PATTERN, 'calls a reusable workflow'),
		'codeowners': observePath(repoRoot, CODEOWNERS_PATHS, 'file'),
		'dependabot': observePath(repoRoot, ['.github/dependabot.yml', '.github/dependabot.yaml'], 'file'),
		'devcontainer': observePath(repoRoot, ['.devcontainer', '.devcontainer.json'], 'any'),
		'infrastructure-as-code': iac,
		'code-scanning': observeWorkflowPattern(workflows, CODEQL_PATTERN, 'runs CodeQL'),
		'artifact-attestations': observeWorkflowPattern(workflows, ATTESTATION_PATTERN, 'produces attestations'),
	};
}

function collectStage2(repoRoot: string): Record<string, DarkFactoryObservation> {
	return {
		'copilot-instructions': observePath(repoRoot, ['.github/copilot-instructions.md'], 'file'),
		'agent-instructions': observePath(repoRoot, ['AGENTS.md', 'CLAUDE.md'], 'file'),
		'scoped-instructions': observeDirEntries(repoRoot, '.github/instructions', name => name.toLowerCase().endsWith('.instructions.md'), 'scoped instruction file(s)'),
	};
}

function collectStage3(repoRoot: string, agentFileNames: readonly string[]): Record<string, DarkFactoryObservation> {
	return {
		'custom-agents': agentFileNames.length > 0
			? { state: 'present', detail: `${agentFileNames.length} agent definition(s) in .github/agents` }
			: { state: 'absent', detail: 'No agent definitions in .github/agents' },
		'agent-skills': observeDirEntries(repoRoot, '.github/skills', name => isFile(path.join(repoRoot, '.github/skills', name, 'SKILL.md')), 'skill(s)'),
		'mcp-configuration': observePath(repoRoot, ['.vscode/mcp.json', '.mcp.json'], 'file'),
	};
}

function collectStage4(repoRoot: string, workflows: readonly WorkflowFile[], agentFileNames: readonly string[]): Record<string, DarkFactoryObservation> {
	const evaluators = evaluatorAgentNames(agentFileNames);
	const agenticMarkdown = listDir(path.join(repoRoot, WORKFLOWS_DIR)).filter(name => name.toLowerCase().endsWith('.md'));
	const agenticByPattern = workflows.filter(w => AGENTIC_WORKFLOW_PATTERN.test(w.content)).map(w => w.name);
	const agenticNames = [...agenticMarkdown, ...agenticByPattern];

	return {
		'issue-forms': observeDirEntries(repoRoot, '.github/ISSUE_TEMPLATE', name => hasExtension(name, ['.yml', '.yaml']), 'Issue Form(s)'),
		'versioned-specifications': observePath(repoRoot, SPEC_PATHS, 'dir'),
		'executable-acceptance': observePath(repoRoot, ACCEPTANCE_PATHS, 'dir'),
		'independent-evaluator-agent': evaluators.length > 0
			? { state: 'present', detail: `Evaluator agent(s): ${evaluators.slice(0, 3).join(', ')}` }
			: { state: 'absent', detail: 'No review, test or security agent defined' },
		'agentic-workflows': agenticNames.length > 0
			? { state: 'present', detail: `Agentic workflow(s): ${agenticNames.slice(0, 3).join(', ')}` }
			: { state: 'absent', detail: 'No agentic workflow definitions' },
		'deployment-environments': observeWorkflowPattern(workflows, ENVIRONMENT_PATTERN, 'targets a named environment'),
	};
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** What one repository's filesystem tier yielded. */
export interface DarkFactoryFileSignals {
	observations: Record<string, DarkFactoryObservation>;
	facts: DarkFactoryRepoFacts;
}

/** True when the path looks like the root of a git working tree. */
export function isGitRepoRoot(repoRoot: string): boolean {
	const gitPath = path.join(repoRoot, '.git');
	return isDirectory(gitPath) || isFile(gitPath);
}

/**
 * Read the `origin` remote URL straight out of `.git/config`.
 *
 * Deliberately a file read rather than `git remote get-url`: the scan may run
 * over many workspace paths, and spawning a process per repository is the kind
 * of cost that would make an existing view feel slower.
 *
 * Returns undefined when there is no config, no `origin`, or the file is
 * unreadable — callers treat that as "repository identity unknown".
 */
export function readGitOriginUrl(repoRoot: string): string | undefined {
	try {
		const config = fs.readFileSync(path.join(repoRoot, '.git', 'config'), 'utf8');
		return GIT_ORIGIN_URL_PATTERN.exec(config)?.[1];
	} catch {
		return undefined;
	}
}

/** Agent definition basenames under `.github/agents/`. */
function listAgentFiles(repoRoot: string): string[] {
	return listDir(path.join(repoRoot, '.github', 'agents')).filter(name => name.toLowerCase().endsWith('.md'));
}

function collectFacts(workflows: readonly WorkflowFile[], agentFileNames: string[]): DarkFactoryRepoFacts {
	return {
		agentFileNames,
		writeAllWorkflows: workflows.filter(w => WRITE_ALL_PERMISSIONS_PATTERN.test(w.content)).map(w => w.name),
		longLivedCredentialWorkflows: workflows
			.filter(w => STATIC_CLOUD_CREDENTIAL_PATTERN.test(w.content) && !OIDC_TOKEN_PATTERN.test(w.content))
			.map(w => w.name),
	};
}

/**
 * Collect every filesystem-tier signal for one repository.
 *
 * Controls that only the GitHub API can answer are deliberately left out of
 * the returned map — the scorer resolves a missing entry to `unknown`, which
 * is the honest answer for a tier this function never looked at.
 */
export function collectDarkFactoryFileSignals(repoRoot: string): DarkFactoryFileSignals {
	const workflows = readWorkflowFiles(repoRoot);
	const agentFileNames = listAgentFiles(repoRoot);

	return {
		observations: {
			...collectStage1(repoRoot, workflows),
			...collectStage2(repoRoot),
			...collectStage3(repoRoot, agentFileNames),
			...collectStage4(repoRoot, workflows, agentFileNames),
		},
		facts: collectFacts(workflows, agentFileNames),
	};
}
