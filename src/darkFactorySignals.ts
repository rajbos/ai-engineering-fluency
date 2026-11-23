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
 * `absent` is only reported when every path the control needed was actually
 * readable. A path that exists but cannot be read — and a workflow scan cut
 * short by the file cap — is missing evidence, not evidence of absence, so it
 * downgrades the result to `unknown`. Unreadable evidence can only ever cause
 * a false *absence*, never a false presence, so a positive match is always
 * reported as `present`.
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

/** Directory holding custom agent definitions. */
const AGENTS_DIR = path.join('.github', 'agents');

// ---------------------------------------------------------------------------
// Detection patterns
// ---------------------------------------------------------------------------

/** A workflow step that actually runs a test suite. Heuristic — a candidate, not a verdict. */
const TEST_STEP_PATTERN =
	/\b(?:npm|yarn|pnpm)\s+(?:run\s+)?test|\bnpm\s+run\s+test:|\bpytest\b|\bdotnet\s+test\b|\bgo\s+test\b|\.\/gradlew\s+\S*test|\bgradle\s+\S*test|\bmvn\b[^\n]*\btest\b|\bcargo\s+test\b|\bbundle\s+exec\s+rspec\b|\btox\b|\bctest\b/i;

/**
 * A workflow that deploys to cloud infrastructure: a deploy action, or a deploy
 * command from a cloud or cluster CLI. Heuristic. Sign-in actions on their own
 * are left out on purpose (a workflow may sign in only to read data), and so is
 * publishing a package or a container image, which ships an artefact without
 * provisioning anything.
 */
const INFRASTRUCTURE_DEPLOY_PATTERN = new RegExp([
	'azure/(?:webapps-deploy|functions-action|k8s-deploy|aks-set-context|arm-deploy|container-apps-deploy-action|static-web-apps-deploy)@',
	'aws-actions/(?:amazon-ecs-deploy-task-definition|aws-cloudformation-github-deploy)@',
	'google-github-actions/(?:deploy-[\\w-]+|get-gke-credentials)@',
	'hashicorp/setup-terraform@',
	'pulumi/actions@',
	'cloudflare/wrangler-action@',
	'superfly/flyctl-actions',
	'\\bterraform\\s+(?:apply|plan)\\b',
	'\\bpulumi\\s+up\\b',
	'\\bkubectl\\s+(?:apply|rollout|set\\s+image)\\b',
	'\\bhelm\\s+(?:upgrade|install)\\b',
	'\\baz\\s+(?:deployment|webapp|functionapp|containerapp|aks|staticwebapp)\\b',
	'\\baws\\s+(?:cloudformation|ecs|lambda|eks)\\b',
	'\\bgcloud\\s+(?:run|app|functions)\\s+deploy\\b',
	'\\b(?:cdk|serverless|sls|flyctl|wrangler)\\s+deploy\\b',
].join('|'), 'i');

/**
 * A workflow that puts an AI reviewer on pull requests: Copilot code review
 * requested by name, or a dedicated AI review action. Heuristic.
 */
const AI_REVIEW_WORKFLOW_PATTERN =
	/copilot-pull-request-reviewer|--add-reviewer[\s=]+["']?@?copilot|anthropics\/claude-code-security-review|coderabbit/i;

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

/**
 * ENOENT and ENOTDIR mean the path genuinely is not there. Every other errno
 * (EACCES, EIO, ELOOP, ENAMETOOLONG, …) means the path could not be inspected,
 * which is a different answer entirely.
 */
function isMissingError(error: unknown): boolean {
	const code = (error as NodeJS.ErrnoException | null)?.code;
	return code === 'ENOENT' || code === 'ENOTDIR';
}

/** What a single path probe found. `unreadable` is distinct from `missing` on purpose. */
type PathKind = 'file' | 'dir' | 'other' | 'missing' | 'unreadable';

function probePath(target: string): PathKind {
	try {
		const stats = fs.statSync(target);
		if (stats.isFile()) { return 'file'; }
		return stats.isDirectory() ? 'dir' : 'other';
	} catch (error) {
		return isMissingError(error) ? 'missing' : 'unreadable';
	}
}

function isFile(target: string): boolean {
	return probePath(target) === 'file';
}

function isDirectory(target: string): boolean {
	return probePath(target) === 'dir';
}

/** A capped shallow listing, plus whether it is a complete view of the directory. */
interface DirListing {
	entries: string[];
	/**
	 * The directory existed but was not fully seen — unreadable, or larger than
	 * {@link MAX_DIR_ENTRIES}. Either way a non-match proves nothing.
	 */
	inconclusive: boolean;
}

function listDir(dir: string): DirListing {
	try {
		const all = fs.readdirSync(dir);
		return { entries: all.slice(0, MAX_DIR_ENTRIES), inconclusive: all.length > MAX_DIR_ENTRIES };
	} catch (error) {
		return { entries: [], inconclusive: !isMissingError(error) };
	}
}

/**
 * The negative half of an observation. Reports `absent` only when every probe
 * the control depended on succeeded; otherwise the honest answer is `unknown`.
 */
function negativeObservation(inconclusive: boolean, absentDetail: string, unknownDetail: string): DarkFactoryObservation {
	return inconclusive ? { state: 'unknown', detail: unknownDetail } : { state: 'absent', detail: absentDetail };
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

/** The workflow definitions that were read, and whether that view of them is complete. */
export interface WorkflowScan {
	files: WorkflowFile[];
	/** The workflows directory, or one of its files, existed but could not be read. */
	unreadable: boolean;
	/** The file cap stopped the scan, so some workflows were never looked at. */
	truncated: boolean;
}

/**
 * True when the scan did not see every workflow. A pattern that did not match
 * across an incomplete set proves nothing, so callers report `unknown` rather
 * than `absent`.
 */
function isWorkflowScanInconclusive(scan: WorkflowScan): boolean {
	return scan.unreadable || scan.truncated;
}

/**
 * Read the repository's workflow definitions, capped at {@link MAX_WORKFLOW_FILES}.
 * A file that cannot be read is skipped, but the scan records that it happened
 * so a missing pattern is not mistaken for a missing control.
 */
export function readWorkflowFiles(repoRoot: string): WorkflowScan {
	const dir = path.join(repoRoot, WORKFLOWS_DIR);
	const listing = listDir(dir);
	const files: WorkflowFile[] = [];
	let unreadable = listing.inconclusive;
	let truncated = false;

	for (const name of listing.entries) {
		if (!hasExtension(name, ['.yml', '.yaml'])) { continue; }
		if (files.length >= MAX_WORKFLOW_FILES) { truncated = true; break; }
		try {
			files.push({ name, content: fs.readFileSync(path.join(dir, name), 'utf8') });
		} catch (error) {
			unreadable = unreadable || !isMissingError(error);
		}
	}
	return { files, unreadable, truncated };
}

// ---------------------------------------------------------------------------
// Observation builders
// ---------------------------------------------------------------------------

/** True when a probe result satisfies the kind of path the control is looking for. */
function matchesKind(probe: PathKind, kind: 'file' | 'dir' | 'any'): boolean {
	if (kind === 'file') { return probe === 'file'; }
	if (kind === 'dir') { return probe === 'dir'; }
	return probe === 'file' || probe === 'dir';
}

/** Present when any of the candidate paths exists, naming the one that matched. */
function observePath(repoRoot: string, candidates: readonly string[], kind: 'file' | 'dir' | 'any'): DarkFactoryObservation {
	let unreadable = false;
	for (const candidate of candidates) {
		const probe = probePath(path.join(repoRoot, candidate));
		if (probe === 'unreadable') { unreadable = true; continue; }
		if (matchesKind(probe, kind)) { return { state: 'present', detail: candidate }; }
	}
	return negativeObservation(unreadable, `Looked for ${candidates.join(', ')}`, `Could not read ${candidates.join(', ')}`);
}

/** Present when a directory holds at least one entry matching `accept`. */
function observeDirEntries(repoRoot: string, dir: string, accept: (name: string) => boolean, label: string): DarkFactoryObservation {
	const { entries, inconclusive } = listDir(path.join(repoRoot, dir));
	const matches = entries.filter(accept);
	if (matches.length > 0) { return { state: 'present', detail: `${matches.length} ${label} in ${dir}` }; }
	return negativeObservation(inconclusive, `No ${label} in ${dir}`, `${dir} could not be listed in full`);
}

/** Present when any workflow's content matches, naming the workflows that did. */
function observeWorkflowPattern(scan: WorkflowScan, pattern: RegExp, label: string): DarkFactoryObservation {
	const matched = scan.files.filter(w => pattern.test(w.content)).map(w => w.name);
	if (matched.length > 0) { return { state: 'present', detail: `${label}: ${matched.slice(0, 3).join(', ')}` }; }
	return negativeObservation(
		isWorkflowScanInconclusive(scan),
		`No workflow ${label}`,
		`Not every workflow definition could be read, so this could not be determined`,
	);
}

// ---------------------------------------------------------------------------
// Per-stage collection
// ---------------------------------------------------------------------------

/** Dependabot or Renovate configuration, in the locations each tool reads. */
const DEPENDENCY_UPDATE_PATHS = [
	'.github/dependabot.yml', '.github/dependabot.yaml',
	'renovate.json', 'renovate.json5', '.renovaterc', '.renovaterc.json', '.github/renovate.json', '.github/renovate.json5',
];

/** A dev container, or the setup workflow the Copilot coding agent starts from. */
const ENVIRONMENT_PATHS = [
	'.devcontainer', '.devcontainer.json',
	'.github/workflows/copilot-setup-steps.yml', '.github/workflows/copilot-setup-steps.yaml',
];

/** Configuration files of AI code-review tools that review every pull request. */
const AI_REVIEW_CONFIG_PATHS = ['.coderabbit.yaml', '.coderabbit.yml'];

/** Markers of infrastructure described as code. Heuristic — deliberately strict. */
const IAC_PATHS = [
	'terraform', 'infra', 'infrastructure', 'bicep', 'main.tf', 'main.bicep',
	'Pulumi.yaml', 'helm', 'charts', 'k8s', 'kubernetes', 'deploy',
];

/** Directories that hold versioned specifications. */
const SPEC_PATHS = ['specs', 'spec', 'docs/specs'];

/** Directories that hold executable acceptance scenarios. */
const ACCEPTANCE_PATHS = ['features', 'acceptance', 'e2e', 'tests/acceptance', 'test/acceptance', 'tests/e2e', 'test/e2e'];

/** Shown when a deployment control is skipped because the repository deploys nothing. */
const NO_DEPLOYMENT_DETAIL = 'No workflow deploys to cloud infrastructure, so this does not apply here.';

/**
 * Whether the repository deploys to infrastructure at all. A desktop app, a
 * library or an extension has nothing to describe as code and no environment to
 * gate, so the deployment controls only apply once a workflow is seen deploying.
 * `unknown` when the workflows could not all be read.
 */
function observeInfrastructureDeployment(scan: WorkflowScan): DarkFactoryObservation {
	return observeWorkflowPattern(scan, INFRASTRUCTURE_DEPLOY_PATTERN, 'deploys to cloud infrastructure');
}

/**
 * Infrastructure described as code, either at the repository root or in a
 * conventional directory. When none is found, the answer depends on whether
 * anything is deployed: missing where a workflow deploys, not applicable where
 * nothing does.
 */
function observeInfrastructureAsCode(repoRoot: string, deployment: DarkFactoryObservation): DarkFactoryObservation {
	const { entries, inconclusive } = listDir(repoRoot);
	if (entries.some(name => hasExtension(name, ['.tf', '.bicep']))) {
		return { state: 'present', detail: 'Infrastructure definitions in the repository root' };
	}
	const byDirectory = observePath(repoRoot, IAC_PATHS, 'any');
	if (byDirectory.state !== 'absent') { return byDirectory; }
	if (inconclusive) { return { state: 'unknown', detail: 'The repository root could not be listed in full' }; }
	if (deployment.state === 'present') {
		return { state: 'absent', detail: `${deployment.detail}, but no infrastructure definitions were found` };
	}
	return deployment.state === 'unknown' ? deployment : { state: 'not-applicable', detail: NO_DEPLOYMENT_DETAIL };
}

function collectStage1(repoRoot: string, scan: WorkflowScan, deployment: DarkFactoryObservation): Record<string, DarkFactoryObservation> {
	const workflowCount = scan.files.length;
	return {
		'ci-workflows': workflowCount > 0
			? { state: 'present', detail: `${workflowCount} workflow file(s) in ${WORKFLOWS_DIR}` }
			: negativeObservation(scan.unreadable, `No workflow files in ${WORKFLOWS_DIR}`, `${WORKFLOWS_DIR} could not be listed in full`),
		'ci-test-execution': observeWorkflowPattern(scan, TEST_STEP_PATTERN, 'runs a test suite'),
		'dependabot': observePath(repoRoot, DEPENDENCY_UPDATE_PATHS, 'file'),
		'devcontainer': observePath(repoRoot, ENVIRONMENT_PATHS, 'any'),
		'infrastructure-as-code': observeInfrastructureAsCode(repoRoot, deployment),
		'code-scanning': observeWorkflowPattern(scan, CODEQL_PATTERN, 'runs CodeQL'),
	};
}

function collectStage2(repoRoot: string): Record<string, DarkFactoryObservation> {
	return {
		'copilot-instructions': observePath(repoRoot, ['.github/copilot-instructions.md'], 'file'),
		'agent-instructions': observePath(repoRoot, ['AGENTS.md', 'CLAUDE.md'], 'file'),
		'scoped-instructions': observeDirEntries(repoRoot, '.github/instructions', name => name.toLowerCase().endsWith('.instructions.md'), 'scoped instruction file(s)'),
	};
}

function collectStage3(repoRoot: string, agents: AgentListing): Record<string, DarkFactoryObservation> {
	return {
		'custom-agents': agents.names.length > 0
			? { state: 'present', detail: `${agents.names.length} agent definition(s) in ${AGENTS_DIR}` }
			: negativeObservation(agents.inconclusive, `No agent definitions in ${AGENTS_DIR}`, `${AGENTS_DIR} could not be listed in full`),
		'agent-skills': observeDirEntries(repoRoot, '.github/skills', name => isFile(path.join(repoRoot, '.github/skills', name, 'SKILL.md')), 'skill(s)'),
		'mcp-configuration': observePath(repoRoot, ['.vscode/mcp.json', '.mcp.json'], 'file'),
	};
}

/**
 * Agentic workflows appear either as markdown definitions in the workflows
 * directory or as a compiled workflow that calls the agentic-workflow action.
 */
function observeAgenticWorkflows(repoRoot: string, scan: WorkflowScan): DarkFactoryObservation {
	const listing = listDir(path.join(repoRoot, WORKFLOWS_DIR));
	const names = [
		...listing.entries.filter(name => name.toLowerCase().endsWith('.md')),
		...scan.files.filter(w => AGENTIC_WORKFLOW_PATTERN.test(w.content)).map(w => w.name),
	];
	if (names.length > 0) { return { state: 'present', detail: `Agentic workflow(s): ${names.slice(0, 3).join(', ')}` }; }
	return negativeObservation(
		listing.inconclusive || isWorkflowScanInconclusive(scan),
		'No agentic workflow definitions',
		`Not every workflow definition could be read, so this could not be determined`,
	);
}

/**
 * Something other than the implementing agent that judges a change: a review,
 * test or security agent, an AI reviewer wired into a workflow, or an AI review
 * tool's configuration. Copilot code review switched on through a ruleset
 * leaves no file, which is why the catalogue turns `absent` here into `unknown`.
 */
function observeIndependentEvaluator(repoRoot: string, scan: WorkflowScan, agents: AgentListing): DarkFactoryObservation {
	const evaluators = evaluatorAgentNames(agents.names);
	if (evaluators.length > 0) { return { state: 'present', detail: `Evaluator agent(s): ${evaluators.slice(0, 3).join(', ')}` }; }
	const byWorkflow = observeWorkflowPattern(scan, AI_REVIEW_WORKFLOW_PATTERN, 'requests an AI review');
	if (byWorkflow.state === 'present') { return byWorkflow; }
	const byConfig = observePath(repoRoot, AI_REVIEW_CONFIG_PATHS, 'file');
	if (byConfig.state === 'present') { return byConfig; }
	return negativeObservation(
		agents.inconclusive || byWorkflow.state === 'unknown' || byConfig.state === 'unknown',
		'No review agent, AI review workflow or AI review configuration found',
		'Not every agent and workflow definition could be read, so this could not be determined',
	);
}

/**
 * A named environment is a gate on a deployment. Where nothing is deployed
 * there is nothing to gate, so the control (and its protection rules) does not
 * apply unless a workflow declares an environment anyway.
 */
function observeDeploymentEnvironments(scan: WorkflowScan, deployment: DarkFactoryObservation): DarkFactoryObservation {
	const declared = observeWorkflowPattern(scan, ENVIRONMENT_PATTERN, 'targets a named environment');
	if (declared.state !== 'absent' || deployment.state !== 'absent') { return declared; }
	return { state: 'not-applicable', detail: NO_DEPLOYMENT_DETAIL };
}

function collectStage4(repoRoot: string, scan: WorkflowScan, agents: AgentListing, deployment: DarkFactoryObservation): Record<string, DarkFactoryObservation> {
	const environments = observeDeploymentEnvironments(scan, deployment);
	return {
		'issue-forms': observeDirEntries(repoRoot, '.github/ISSUE_TEMPLATE', name => hasExtension(name, ['.yml', '.yaml']), 'Issue Form(s)'),
		'versioned-specifications': observePath(repoRoot, SPEC_PATHS, 'dir'),
		'executable-acceptance': observePath(repoRoot, ACCEPTANCE_PATHS, 'dir'),
		'independent-evaluator-agent': observeIndependentEvaluator(repoRoot, scan, agents),
		'agentic-workflows': observeAgenticWorkflows(repoRoot, scan),
		'deployment-environments': environments,
		// Protection rules are an API fact, so the filesystem tier only answers when
		// there is no environment to protect in the first place.
		...(environments.state === 'not-applicable' ? { 'environment-protection-rules': environments } : {}),
		'artifact-attestations': observeWorkflowPattern(scan, ATTESTATION_PATTERN, 'produces attestations'),
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

/** Read a small git pointer file, trimmed. Undefined when it is missing, empty or unreadable. */
function readPointerFile(target: string): string | undefined {
	try {
		return fs.readFileSync(target, 'utf8').trim() || undefined;
	} catch {
		return undefined;
	}
}

/**
 * Resolve the directory that actually holds the repository's `config`.
 *
 * For an ordinary checkout that is `<root>/.git`. For a linked worktree or a
 * submodule, `.git` is a *file* holding `gitdir: <path>` — and in the worktree
 * case that gitdir is per-worktree state, with a `commondir` pointer to the
 * shared directory where `config` really lives. Both hops have to be followed,
 * otherwise every worktree checkout silently loses its repository identity.
 */
function resolveGitConfigDir(repoRoot: string): string | undefined {
	const gitPath = path.join(repoRoot, '.git');
	const probe = probePath(gitPath);
	if (probe === 'dir') { return gitPath; }
	if (probe !== 'file') { return undefined; }

	const pointer = readPointerFile(gitPath);
	const match = pointer ? /^gitdir:\s*(.+)$/m.exec(pointer) : null;
	if (!match) { return undefined; }

	const gitDir = path.resolve(repoRoot, match[1].trim());
	// A worktree's gitdir points on to the shared common directory; a submodule's
	// gitdir carries `config` itself and has no `commondir`.
	const commonDir = readPointerFile(path.join(gitDir, 'commondir'));
	return commonDir ? path.resolve(gitDir, commonDir) : gitDir;
}

/**
 * Read the `origin` remote URL straight out of the repository's git config.
 *
 * Deliberately a file read rather than `git remote get-url`: the scan may run
 * over many workspace paths, and spawning a process per repository is the kind
 * of cost that would make an existing view feel slower.
 *
 * Returns undefined when there is no config, no `origin`, or the file is
 * unreadable — callers treat that as "repository identity unknown".
 */
export function readGitOriginUrl(repoRoot: string): string | undefined {
	const configDir = resolveGitConfigDir(repoRoot);
	if (!configDir) { return undefined; }
	const config = readPointerFile(path.join(configDir, 'config'));
	return config ? GIT_ORIGIN_URL_PATTERN.exec(config)?.[1] : undefined;
}

/**
 * Identify the repository a checkout belongs to, so linked worktrees of one
 * repository can be grouped. Returns the shared git directory (the same for the
 * main checkout and every linked worktree) and whether `repoRoot` is itself the
 * main checkout (a non-bare repository whose common dir is `<repoRoot>/.git`).
 */
export function resolveRepoIdentity(repoRoot: string): { key: string; isMainCheckout: boolean } {
	const configDir = resolveGitConfigDir(repoRoot);
	if (!configDir) { return { key: canonicalPath(repoRoot), isMainCheckout: true }; }
	// Canonical, so a checkout reached through a symlink and a worktree whose gitdir
	// points at the physical path still share one key.
	const key = canonicalPath(configDir);
	// The main checkout is the one whose own `.git` directory *is* the common dir (a bare repo has none).
	return { key, isMainCheckout: !isLinkedWorktree(repoRoot) && !isBareRepository(key) };
}

/**
 * A linked worktree's `.git` is a pointer file whose gitdir carries a `commondir`
 * link back to the shared repository. A normal checkout (`.git` directory), a
 * submodule and a checkout made with `--separate-git-dir` have no such link, so
 * they are main checkouts even though their `.git` is not at `<root>/.git`.
 */
function isLinkedWorktree(repoRoot: string): boolean {
	const gitPath = path.join(repoRoot, '.git');
	if (probePath(gitPath) !== 'file') { return false; }
	const match = /^gitdir:\s*(.+)$/m.exec(readPointerFile(gitPath) ?? '');
	return !!match && readPointerFile(path.join(path.resolve(repoRoot, match[1].trim()), 'commondir')) !== undefined;
}

/** `realpath` when the path exists, otherwise the plain resolved path. */
function canonicalPath(target: string): string {
	try {
		return fs.realpathSync.native(target);
	} catch {
		return path.resolve(target);
	}
}

/** A bare repository (even one that happens to be named `.git`) has no working checkout beside it. */
function isBareRepository(gitDir: string): boolean {
	const config = readPointerFile(path.join(gitDir, 'config'));
	return config !== undefined && /^\s*bare\s*=\s*true\s*$/im.test(config);
}

/** Markdown files under `.github/agents/` that are documentation, not agent definitions. */
const NON_AGENT_MARKDOWN = new Set(['readme.md', 'index.md', 'contributing.md']);

/** The agent definitions found, and whether that listing is complete. */
interface AgentListing {
	names: string[];
	/** The agents directory was not fully seen, so an empty result proves nothing. */
	inconclusive: boolean;
}

/**
 * Agent definition basenames under `.github/agents/`.
 *
 * Any `.md` counts, matching the `agents-dir` pattern the repository's own
 * customization scanner already uses (`src/customizationPatterns.json`), so a
 * repository that does not follow the `*.agent.md` convention is still seen.
 * Documentation files that happen to live in the folder are excluded, since
 * counting a README as an agent would inflate `custom-agents`.
 */
function listAgentFiles(repoRoot: string): AgentListing {
	const { entries, inconclusive } = listDir(path.join(repoRoot, AGENTS_DIR));
	return {
		names: entries.filter(name => {
			const lower = name.toLowerCase();
			return lower.endsWith('.md') && !NON_AGENT_MARKDOWN.has(lower);
		}),
		inconclusive,
	};
}

function collectFacts(scan: WorkflowScan): DarkFactoryRepoFacts {
	return {
		writeAllWorkflows: scan.files.filter(w => WRITE_ALL_PERMISSIONS_PATTERN.test(w.content)).map(w => w.name),
		longLivedCredentialWorkflows: scan.files
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
	const scan = readWorkflowFiles(repoRoot);
	const agents = listAgentFiles(repoRoot);
	const deployment = observeInfrastructureDeployment(scan);

	return {
		observations: {
			...collectStage1(repoRoot, scan, deployment),
			...collectStage2(repoRoot),
			...collectStage3(repoRoot, agents),
			...collectStage4(repoRoot, scan, agents, deployment),
		},
		facts: collectFacts(scan),
	};
}
