import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as Module from 'node:module';
import * as os from 'os';
import * as path from 'path';

import {
	MAX_WORKFLOW_FILES,
	collectDarkFactoryFileSignals,
	isGitRepoRoot,
	readGitOriginUrl,
	readWorkflowFiles,
} from '../../../src/darkFactorySignals';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Create a throwaway directory tree from a map of relative path → file content. */
function makeRepo(files: Record<string, string>): string {
	const root = fs.mkdtempSync(path.join(process.cwd(), 'dark-factory-'));
	for (const [relative, content] of Object.entries(files)) {
		const target = path.join(root, relative);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, content, 'utf8');
	}
	return root;
}

/** Run `body` against a temp repository and always clean it up. */
function withRepo(files: Record<string, string>, body: (root: string) => void): void {
	const root = makeRepo(files);
	try { body(root); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

function stateOf(root: string, controlId: string): string {
	return collectDarkFactoryFileSignals(root).observations[controlId]?.state ?? 'missing-entry';
}

const CI_WORKFLOW = `name: build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npm test
`;

// ---------------------------------------------------------------------------
// Repository identity
// ---------------------------------------------------------------------------

test('isGitRepoRoot: true for a directory holding .git, false otherwise', () => {
	withRepo({ '.git/config': '' }, root => assert.equal(isGitRepoRoot(root), true));
	withRepo({ 'README.md': '' }, root => assert.equal(isGitRepoRoot(root), false));
});

test('isGitRepoRoot: true for a worktree where .git is a file', () => {
	withRepo({ '.git': 'gitdir: /elsewhere/.git/worktrees/feature' }, root => {
		assert.equal(isGitRepoRoot(root), true);
	});
});

test('readGitOriginUrl: reads the origin remote from .git/config', () => {
	withRepo({
		'.git/config': '[core]\n\trepositoryformatversion = 0\n[remote "origin"]\n\turl = https://github.com/rajbos/ai-engineering-fluency.git\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n',
	}, root => {
		assert.equal(readGitOriginUrl(root), 'https://github.com/rajbos/ai-engineering-fluency.git');
	});
});

test('readGitOriginUrl: ignores a non-origin remote', () => {
	withRepo({
		'.git/config': '[remote "upstream"]\n\turl = https://github.com/other/repo.git\n',
	}, root => {
		assert.equal(readGitOriginUrl(root), undefined);
	});
});

test('readGitOriginUrl: picks origin when several remotes are configured', () => {
	withRepo({
		'.git/config': '[remote "upstream"]\n\turl = https://github.com/other/repo.git\n[remote "origin"]\n\turl = git@github.com:rajbos/mine.git\n',
	}, root => {
		assert.equal(readGitOriginUrl(root), 'git@github.com:rajbos/mine.git');
	});
});

test('readGitOriginUrl: undefined when there is no git config at all', () => {
	withRepo({ 'README.md': '' }, root => assert.equal(readGitOriginUrl(root), undefined));
});

// ---------------------------------------------------------------------------
// Workflow reading
// ---------------------------------------------------------------------------

test('readWorkflowFiles: reads yml and yaml, skipping other files', () => {
	withRepo({
		'.github/workflows/build.yml': CI_WORKFLOW,
		'.github/workflows/release.yaml': 'name: release\n',
		'.github/workflows/notes.txt': 'ignored',
	}, root => {
		const names = readWorkflowFiles(root).files.map(w => w.name).sort();
		assert.deepEqual(names, ['build.yml', 'release.yaml']);
	});
});

test('readWorkflowFiles: returns nothing for a repository with no workflows directory', () => {
	withRepo({ 'README.md': '' }, root => {
		assert.deepEqual(readWorkflowFiles(root), { files: [], unreadable: false, truncated: false });
	});
});

test('readWorkflowFiles: caps how many workflow files it reads', () => {
	const files: Record<string, string> = {};
	for (let i = 0; i < MAX_WORKFLOW_FILES + 10; i++) { files[`.github/workflows/w${i}.yml`] = 'name: w\n'; }
	withRepo(files, root => {
		const scan = readWorkflowFiles(root);
		assert.equal(scan.files.length, MAX_WORKFLOW_FILES);
		assert.equal(scan.truncated, true, 'a capped scan must admit it did not see every workflow');
	});
});

// ---------------------------------------------------------------------------
// Stage 1 signals
// ---------------------------------------------------------------------------

test('stage 1: an empty repository reports its delivery controls absent, not unknown', () => {
	withRepo({ 'README.md': '' }, root => {
		assert.equal(stateOf(root, 'ci-workflows'), 'absent');
		assert.equal(stateOf(root, 'dependabot'), 'absent');
		assert.equal(stateOf(root, 'devcontainer'), 'absent');
	});
});

test('stage 1: a workflow that runs npm test satisfies the test-execution control', () => {
	withRepo({ '.github/workflows/build.yml': CI_WORKFLOW }, root => {
		assert.equal(stateOf(root, 'ci-workflows'), 'present');
		assert.equal(stateOf(root, 'ci-test-execution'), 'present');
	});
});

test('stage 1: a workflow with no test step leaves test execution absent', () => {
	withRepo({ '.github/workflows/lint.yml': 'jobs:\n  lint:\n    steps:\n      - run: npm run lint\n' }, root => {
		assert.equal(stateOf(root, 'ci-workflows'), 'present');
		assert.equal(stateOf(root, 'ci-test-execution'), 'absent');
	});
});

test('stage 1: other ecosystems\' test commands are recognised', () => {
	for (const command of ['pytest -q', 'dotnet test', 'go test ./...', './gradlew test', 'cargo test', 'mvn -B verify test']) {
		withRepo({ '.github/workflows/build.yml': `jobs:\n  t:\n    steps:\n      - run: ${command}\n` }, root => {
			assert.equal(stateOf(root, 'ci-test-execution'), 'present', `expected "${command}" to count as a test step`);
		});
	}
});

test('stage 1: CODEOWNERS and reusable workflows are no longer observed at all', () => {
	withRepo({ 'CODEOWNERS': '* @team\n', '.github/workflows/build.yml': 'jobs:\n  build:\n    uses: acme/platform/.github/workflows/node.yml@v1\n' }, root => {
		const { observations } = collectDarkFactoryFileSignals(root);
		assert.equal('codeowners' in observations, false);
		assert.equal('reusable-workflows' in observations, false);
	});
});

test('stage 1: Renovate counts as automated dependency updates, like Dependabot', () => {
	for (const location of ['.github/dependabot.yml', 'renovate.json', '.github/renovate.json5', '.renovaterc']) {
		withRepo({ [location]: '{}\n' }, root => {
			assert.equal(stateOf(root, 'dependabot'), 'present', `expected ${location} to be found`);
		});
	}
});

test('stage 1: the coding agent setup workflow counts as a reproducible environment, like a dev container', () => {
	withRepo({ '.devcontainer/devcontainer.json': '{}' }, root => assert.equal(stateOf(root, 'devcontainer'), 'present'));
	withRepo({ '.github/workflows/copilot-setup-steps.yml': 'jobs: {}\n' }, root => assert.equal(stateOf(root, 'devcontainer'), 'present'));
});

test('stage 1: infrastructure as code does not apply to a repository that deploys nothing', () => {
	// A desktop app or a library: it builds, tests and publishes, but provisions nothing.
	withRepo({
		'.github/workflows/build.yml': CI_WORKFLOW,
		'.github/workflows/release.yml': 'jobs:\n  r:\n    steps:\n      - run: npm publish\n      - uses: docker/build-push-action@v6\n      - uses: azure/login@v2\n',
	}, root => {
		assert.equal(stateOf(root, 'infrastructure-as-code'), 'not-applicable');
	});
	withRepo({ 'README.md': '' }, root => assert.equal(stateOf(root, 'infrastructure-as-code'), 'not-applicable'));
});

test('stage 1: infrastructure as code is missing once a workflow deploys without any', () => {
	for (const step of ['uses: azure/webapps-deploy@v3', 'run: kubectl apply -f app.yaml', 'run: az containerapp update --name app', 'run: terraform apply -auto-approve', 'run: helm upgrade --install app ./chart']) {
		withRepo({ '.github/workflows/deploy.yml': `jobs:\n  d:\n    steps:\n      - ${step}\n` }, root => {
			assert.equal(stateOf(root, 'infrastructure-as-code'), 'absent', `expected "${step}" to count as a deployment`);
		});
	}
});

test('stage 1: a deploying repository with infrastructure definitions has the control', () => {
	withRepo({ '.github/workflows/deploy.yml': 'jobs:\n  d:\n    steps:\n      - uses: azure/webapps-deploy@v3\n', 'infra/main.bicep': '' }, root => {
		assert.equal(stateOf(root, 'infrastructure-as-code'), 'present');
	});
});

test('stage 1: infrastructure as code is detected from a root .tf file', () => {
	withRepo({ 'main.tf': 'resource "null_resource" "x" {}\n' }, root => {
		assert.equal(stateOf(root, 'infrastructure-as-code'), 'present');
	});
});

test('stage 1: infrastructure as code is detected from a terraform directory', () => {
	withRepo({ 'terraform/main.tf': '' }, root => {
		assert.equal(stateOf(root, 'infrastructure-as-code'), 'present');
	});
});

test('stage 1: a missing CodeQL workflow reports absent so the scorer can turn it into unknown', () => {
	withRepo({ '.github/workflows/build.yml': CI_WORKFLOW }, root => {
		assert.equal(stateOf(root, 'code-scanning'), 'absent');
	});
});

test('stage 1: a CodeQL workflow is detected however it is pinned', () => {
	withRepo({ '.github/workflows/codeql.yml': 'jobs:\n  analyze:\n    steps:\n      - uses: github/codeql-action/analyze@v3\n' }, root => {
		assert.equal(stateOf(root, 'code-scanning'), 'present');
	});
});

test('stage 4: build-provenance attestations are detected', () => {
	withRepo({ '.github/workflows/release.yml': 'jobs:\n  r:\n    steps:\n      - uses: actions/attest-build-provenance@v1\n' }, root => {
		assert.equal(stateOf(root, 'artifact-attestations'), 'present');
	});
});

// ---------------------------------------------------------------------------
// Stage 2 and 3 signals
// ---------------------------------------------------------------------------

test('stage 2: repository, agent and scoped instructions are each detected', () => {
	withRepo({
		'.github/copilot-instructions.md': '# rules',
		'AGENTS.md': '# agents',
		'.github/instructions/cli.instructions.md': '# cli',
	}, root => {
		assert.equal(stateOf(root, 'copilot-instructions'), 'present');
		assert.equal(stateOf(root, 'agent-instructions'), 'present');
		assert.equal(stateOf(root, 'scoped-instructions'), 'present');
	});
});

test('stage 2: CLAUDE.md alone satisfies the agent-instructions control', () => {
	withRepo({ 'CLAUDE.md': '# claude' }, root => {
		assert.equal(stateOf(root, 'agent-instructions'), 'present');
	});
});

test('stage 2: a plain markdown file under .github/instructions does not count as scoped instructions', () => {
	withRepo({ '.github/instructions/readme.md': '# notes' }, root => {
		assert.equal(stateOf(root, 'scoped-instructions'), 'absent');
	});
});

test('stage 3: agents, skills and MCP configuration are each detected', () => {
	withRepo({
		'.github/agents/refactor.agent.md': '# refactor',
		'.github/skills/deploy/SKILL.md': '# deploy',
		'.vscode/mcp.json': '{}',
	}, root => {
		assert.equal(stateOf(root, 'custom-agents'), 'present');
		assert.equal(stateOf(root, 'agent-skills'), 'present');
		assert.equal(stateOf(root, 'mcp-configuration'), 'present');
	});
});

test('stage 3: a skill directory without a SKILL.md does not count', () => {
	withRepo({ '.github/skills/deploy/README.md': '# deploy' }, root => {
		assert.equal(stateOf(root, 'agent-skills'), 'absent');
	});
});

test('stage 3: the API-only controls are left unanswered by the filesystem tier', () => {
	withRepo({ 'README.md': '' }, root => {
		const { observations } = collectDarkFactoryFileSignals(root);
		assert.equal('branch-protection' in observations, false);
		assert.equal('human-review-enforced' in observations, false);
		assert.equal('agent-authored-pull-requests' in observations, false);
	});
	// Protection rules are an API fact; the filesystem tier only speaks up to say
	// there is no deployment to protect.
	withRepo({ '.github/workflows/deploy.yml': 'jobs:\n  deploy:\n    environment: production\n' }, root => {
		assert.equal('environment-protection-rules' in collectDarkFactoryFileSignals(root).observations, false);
	});
});

// ---------------------------------------------------------------------------
// Stage 4 signals
// ---------------------------------------------------------------------------

test('stage 4: Issue Forms are distinguished from markdown issue templates', () => {
	withRepo({ '.github/ISSUE_TEMPLATE/bug.md': '---\nname: Bug\n---\n' }, root => {
		assert.equal(stateOf(root, 'issue-forms'), 'absent');
	});
	withRepo({ '.github/ISSUE_TEMPLATE/bug.yml': 'name: Bug\nbody: []\n' }, root => {
		assert.equal(stateOf(root, 'issue-forms'), 'present');
	});
});

test('stage 4: versioned specifications and acceptance scenarios are detected from their directories', () => {
	withRepo({ 'docs/specs/login.md': '# login', 'features/login.feature': 'Feature: login' }, root => {
		assert.equal(stateOf(root, 'versioned-specifications'), 'present');
		assert.equal(stateOf(root, 'executable-acceptance'), 'present');
	});
});

test('stage 4: an evaluator agent satisfies the independent-evaluator control', () => {
	withRepo({ '.github/agents/code-quality-review.agent.md': '# review' }, root => {
		assert.equal(stateOf(root, 'independent-evaluator-agent'), 'present');
	});
});

test('stage 4: implementation-only agents leave the independent-evaluator control absent', () => {
	withRepo({ '.github/agents/refactor.agent.md': '# refactor' }, root => {
		assert.equal(stateOf(root, 'custom-agents'), 'present');
		assert.equal(stateOf(root, 'independent-evaluator-agent'), 'absent');
	});
});

test('stage 4: an AI reviewer wired into a workflow or configured as a tool is an independent evaluator', () => {
	withRepo({ '.github/workflows/review.yml': 'jobs:\n  r:\n    steps:\n      - run: gh pr edit "$PR" --add-reviewer @copilot\n' }, root => {
		assert.equal(stateOf(root, 'independent-evaluator-agent'), 'present');
	});
	withRepo({ '.github/workflows/sec.yml': 'jobs:\n  r:\n    steps:\n      - uses: anthropics/claude-code-security-review@main\n' }, root => {
		assert.equal(stateOf(root, 'independent-evaluator-agent'), 'present');
	});
	withRepo({ '.coderabbit.yaml': 'reviews: {}\n' }, root => {
		assert.equal(stateOf(root, 'independent-evaluator-agent'), 'present');
	});
});

test('stage 4: deployment environments do not apply where nothing is deployed', () => {
	withRepo({ '.github/workflows/build.yml': CI_WORKFLOW }, root => {
		assert.equal(stateOf(root, 'deployment-environments'), 'not-applicable');
		assert.equal(stateOf(root, 'environment-protection-rules'), 'not-applicable');
	});
});

test('stage 4: a deploying workflow without a named environment leaves the control absent', () => {
	withRepo({ '.github/workflows/deploy.yml': 'jobs:\n  d:\n    steps:\n      - uses: azure/webapps-deploy@v3\n' }, root => {
		assert.equal(stateOf(root, 'deployment-environments'), 'absent');
	});
});

test('stage 4: a markdown agentic workflow definition is detected', () => {
	withRepo({ '.github/workflows/triage.md': '# triage agent' }, root => {
		assert.equal(stateOf(root, 'agentic-workflows'), 'present');
	});
});

test('stage 4: a job targeting a named environment is detected', () => {
	withRepo({ '.github/workflows/deploy.yml': 'jobs:\n  deploy:\n    environment: production\n' }, root => {
		assert.equal(stateOf(root, 'deployment-environments'), 'present');
	});
});

// ---------------------------------------------------------------------------
// Anti-pattern facts
// ---------------------------------------------------------------------------

test('facts: write-all permissions are collected per workflow', () => {
	withRepo({
		'.github/workflows/release.yml': 'permissions: write-all\njobs: {}\n',
		'.github/workflows/build.yml': 'permissions:\n  contents: read\njobs: {}\n',
	}, root => {
		assert.deepEqual(collectDarkFactoryFileSignals(root).facts.writeAllWorkflows, ['release.yml']);
	});
});

test('facts: static cloud credentials are only reported when OIDC is not used', () => {
	withRepo({
		'.github/workflows/static.yml': 'jobs:\n  d:\n    steps:\n      - env:\n          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}\n',
		'.github/workflows/federated.yml': 'permissions:\n  id-token: write\njobs:\n  d:\n    steps:\n      - env:\n          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}\n',
	}, root => {
		assert.deepEqual(collectDarkFactoryFileSignals(root).facts.longLivedCredentialWorkflows, ['static.yml']);
	});
});

test('collectDarkFactoryFileSignals: a non-existent path yields observations rather than throwing', () => {
	const missing = path.join(process.cwd(), 'dark-factory-does-not-exist-xyz');
	const { observations, facts } = collectDarkFactoryFileSignals(missing);
	assert.equal(observations['ci-workflows'].state, 'absent');
	assert.deepEqual(facts.writeAllWorkflows, []);
});

// ---------------------------------------------------------------------------
// Git worktrees and submodules — `.git` is a file, not a directory
// ---------------------------------------------------------------------------

test('readGitOriginUrl: follows a worktree .git file through commondir to the shared config', () => {
	// Mirrors what `git worktree add` produces: the worktree's .git file points at
	// per-worktree state, whose `commondir` points back at the main .git directory
	// where `config` actually lives.
	const main = makeRepo({
		'.git/config': '[remote "origin"]\n\turl = https://github.com/rajbos/demo.git\n',
		'.git/worktrees/feature/commondir': '../..\n',
	});
	const worktree = makeRepo({ '.git': `gitdir: ${path.join(main, '.git', 'worktrees', 'feature')}\n` });
	try {
		assert.equal(isGitRepoRoot(worktree), true);
		assert.equal(readGitOriginUrl(worktree), 'https://github.com/rajbos/demo.git');
	} finally {
		fs.rmSync(main, { recursive: true, force: true });
		fs.rmSync(worktree, { recursive: true, force: true });
	}
});

test('readGitOriginUrl: reads a submodule .git file, whose gitdir carries config directly', () => {
	// A submodule has no `commondir` — its gitdir under the superproject holds `config`.
	const superproject = makeRepo({
		'.git/modules/lib/config': '[remote "origin"]\n\turl = git@github.com:rajbos/lib.git\n',
	});
	const submodule = makeRepo({ '.git': `gitdir: ${path.join(superproject, '.git', 'modules', 'lib')}\n` });
	try {
		assert.equal(readGitOriginUrl(submodule), 'git@github.com:rajbos/lib.git');
	} finally {
		fs.rmSync(superproject, { recursive: true, force: true });
		fs.rmSync(submodule, { recursive: true, force: true });
	}
});

test('readGitOriginUrl: resolves a relative gitdir pointer against the repository root', () => {
	const root = makeRepo({
		'.git': 'gitdir: ./real-git\n',
		'real-git/config': '[remote "origin"]\n\turl = https://github.com/rajbos/relative.git\n',
	});
	try {
		assert.equal(readGitOriginUrl(root), 'https://github.com/rajbos/relative.git');
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('readGitOriginUrl: undefined when the .git file is not a gitdir pointer', () => {
	withRepo({ '.git': 'not a pointer\n' }, root => assert.equal(readGitOriginUrl(root), undefined));
});

test('readGitOriginUrl: undefined when the gitdir pointer leads nowhere', () => {
	withRepo({ '.git': 'gitdir: /nonexistent/path/xyz\n' }, root => {
		assert.equal(readGitOriginUrl(root), undefined);
	});
});

// ---------------------------------------------------------------------------
// Agent definitions — documentation must not be counted as an agent
// ---------------------------------------------------------------------------

test('agents: a README in .github/agents is not counted as an agent definition', () => {
	withRepo({ '.github/agents/README.md': '# how to add an agent' }, root => {
		assert.equal(stateOf(root, 'custom-agents'), 'absent');
	});
});

test('agents: a README alongside real agents does not inflate the count or mask the evaluator check', () => {
	withRepo({
		'.github/agents/README.md': '# index',
		'.github/agents/refactor.agent.md': '',
		'.github/agents/test-expert.agent.md': '',
	}, root => {
		const { observations } = collectDarkFactoryFileSignals(root);
		assert.match(observations['custom-agents'].detail ?? '', /^2 agent definition/);
		assert.equal(observations['independent-evaluator-agent'].state, 'present');
	});
});

test('agents: a plain .md agent definition still counts, matching the repo customization scanner', () => {
	withRepo({ '.github/agents/planner.md': '# planner' }, root => {
		assert.equal(stateOf(root, 'custom-agents'), 'present');
	});
});

// ---------------------------------------------------------------------------
// Unreadable evidence must never be reported as absence
// ---------------------------------------------------------------------------

// The `import * as fs` namespace object is getter-only once compiled, so reach
// the real, mutable CJS module to stub it — the same approach
// azureResourceService.test.ts uses for module-level fakes.
const fsModule = Module.createRequire(__filename)('fs') as typeof fs;

/**
 * Run `body` with `fs.readdirSync` failing with `code` for any path containing
 * `match`. A real permission failure cannot be staged here: the suite may run as
 * root, where `chmod 000` is bypassed entirely.
 */
function withUnreadableDir(match: string, code: string, body: () => void): void {
	const original = fsModule.readdirSync;
	fsModule.readdirSync = ((target: fs.PathLike, options?: unknown) => {
		if (String(target).includes(match)) {
			const error = new Error(`${code}: simulated`) as NodeJS.ErrnoException;
			error.code = code;
			throw error;
		}
		return (original as (t: fs.PathLike, o?: unknown) => string[])(target, options);
	}) as typeof fs.readdirSync;
	try { body(); } finally { fsModule.readdirSync = original; }
}

test('unreadable: a workflows directory that cannot be read reports unknown, not absent', () => {
	withRepo({ '.github/workflows/build.yml': CI_WORKFLOW }, root => {
		withUnreadableDir(path.join('.github', 'workflows'), 'EACCES', () => {
			const { observations } = collectDarkFactoryFileSignals(root);
			assert.equal(observations['ci-workflows'].state, 'unknown');
			assert.equal(observations['ci-test-execution'].state, 'unknown');
			assert.equal(observations['infrastructure-as-code'].state, 'unknown', 'whether anything deploys could not be read');
			assert.equal(observations['deployment-environments'].state, 'unknown');
			assert.equal(observations['agentic-workflows'].state, 'unknown');
		});
	});
});

test('unreadable: an agents directory that cannot be read reports unknown for both agent controls', () => {
	withRepo({ '.github/agents/refactor.agent.md': '' }, root => {
		withUnreadableDir(path.join('.github', 'agents'), 'EACCES', () => {
			const { observations } = collectDarkFactoryFileSignals(root);
			assert.equal(observations['custom-agents'].state, 'unknown');
			assert.equal(observations['independent-evaluator-agent'].state, 'unknown');
		});
	});
});

test('unreadable: an unreadable ISSUE_TEMPLATE directory reports unknown', () => {
	withRepo({ '.github/ISSUE_TEMPLATE/bug.yml': 'name: Bug\n' }, root => {
		withUnreadableDir('ISSUE_TEMPLATE', 'EIO', () => {
			assert.equal(stateOf(root, 'issue-forms'), 'unknown');
		});
	});
});

test('unreadable: a missing directory is still absent — ENOENT is a real answer', () => {
	withRepo({ 'README.md': '' }, root => {
		assert.equal(stateOf(root, 'issue-forms'), 'absent');
		assert.equal(stateOf(root, 'custom-agents'), 'absent');
	});
});

test('unreadable: ENOTDIR is treated as missing, not as unreadable', () => {
	// `.github/agents` exists as a *file*, so readdir yields ENOTDIR — the folder
	// genuinely does not exist, which is an absence rather than missing evidence.
	withRepo({ '.github/agents': 'not a directory' }, root => {
		assert.equal(stateOf(root, 'custom-agents'), 'absent');
	});
});

test('unreadable: a truncated workflow scan reports unknown rather than absent for content patterns', () => {
	const files: Record<string, string> = {};
	for (let i = 0; i < MAX_WORKFLOW_FILES + 5; i++) { files[`.github/workflows/w${i}.yml`] = 'name: w\n'; }
	withRepo(files, root => {
		const { observations } = collectDarkFactoryFileSignals(root);
		assert.equal(observations['ci-workflows'].state, 'present', 'the workflows themselves were seen');
		assert.equal(observations['ci-test-execution'].state, 'unknown', 'not every workflow was read, so absence is unproven');
	});
});

test('unreadable: an unreadable repository root leaves infrastructure-as-code unknown', () => {
	withRepo({ 'README.md': '' }, root => {
		withUnreadableDir(path.basename(root), 'EACCES', () => {
			assert.equal(stateOf(root, 'infrastructure-as-code'), 'unknown');
		});
	});
});

test('unreadable: a positive match still wins even when the scan is incomplete', () => {
	const files: Record<string, string> = { '.github/workflows/aaa-test.yml': CI_WORKFLOW };
	for (let i = 0; i < MAX_WORKFLOW_FILES + 5; i++) { files[`.github/workflows/w${i}.yml`] = 'name: w\n'; }
	withRepo(files, root => {
		assert.equal(stateOf(root, 'ci-test-execution'), 'present', 'evidence found is evidence, however incomplete the scan');
	});
});

test('unreadable: a directory larger than the entry cap reports unknown rather than absent', () => {
	// The listing is capped, so a control that found no match across a truncated
	// view has not established absence.
	const files: Record<string, string> = {};
	for (let i = 0; i < 250; i++) { files[`.github/ISSUE_TEMPLATE/note-${i}.md`] = ''; }
	withRepo(files, root => {
		assert.equal(stateOf(root, 'issue-forms'), 'unknown');
	});
});

test('unreadable: a directory within the entry cap still reports absence normally', () => {
	const files: Record<string, string> = {};
	for (let i = 0; i < 10; i++) { files[`.github/ISSUE_TEMPLATE/note-${i}.md`] = ''; }
	withRepo(files, root => {
		assert.equal(stateOf(root, 'issue-forms'), 'absent');
	});
});
