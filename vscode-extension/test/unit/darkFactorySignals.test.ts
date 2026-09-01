import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
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
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dark-factory-'));
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
		const names = readWorkflowFiles(root).map(w => w.name).sort();
		assert.deepEqual(names, ['build.yml', 'release.yaml']);
	});
});

test('readWorkflowFiles: returns nothing for a repository with no workflows directory', () => {
	withRepo({ 'README.md': '' }, root => assert.deepEqual(readWorkflowFiles(root), []));
});

test('readWorkflowFiles: caps how many workflow files it reads', () => {
	const files: Record<string, string> = {};
	for (let i = 0; i < MAX_WORKFLOW_FILES + 10; i++) { files[`.github/workflows/w${i}.yml`] = 'name: w\n'; }
	withRepo(files, root => {
		assert.equal(readWorkflowFiles(root).length, MAX_WORKFLOW_FILES);
	});
});

// ---------------------------------------------------------------------------
// Stage 1 signals
// ---------------------------------------------------------------------------

test('stage 1: an empty repository reports its delivery controls absent, not unknown', () => {
	withRepo({ 'README.md': '' }, root => {
		assert.equal(stateOf(root, 'ci-workflows'), 'absent');
		assert.equal(stateOf(root, 'codeowners'), 'absent');
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

test('stage 1: a call to a reusable workflow is detected', () => {
	withRepo({ '.github/workflows/build.yml': 'jobs:\n  build:\n    uses: acme/platform/.github/workflows/node.yml@v1\n' }, root => {
		assert.equal(stateOf(root, 'reusable-workflows'), 'present');
	});
});

test('stage 1: a local composite action is not mistaken for a reusable workflow', () => {
	withRepo({ '.github/workflows/build.yml': 'jobs:\n  build:\n    steps:\n      - uses: actions/checkout@v4\n' }, root => {
		assert.equal(stateOf(root, 'reusable-workflows'), 'absent');
	});
});

test('stage 1: CODEOWNERS is found in any of the locations GitHub accepts', () => {
	for (const location of ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']) {
		withRepo({ [location]: '* @team\n' }, root => {
			assert.equal(stateOf(root, 'codeowners'), 'present', `expected ${location} to be found`);
		});
	}
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

test('stage 1: build-provenance attestations are detected', () => {
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
		assert.equal('environment-protection-rules' in observations, false);
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

test('facts: agent file names are collected for the evaluator check', () => {
	withRepo({
		'.github/agents/refactor.agent.md': '',
		'.github/agents/test-expert.agent.md': '',
		'.github/agents/notes.txt': '',
	}, root => {
		assert.deepEqual((collectDarkFactoryFileSignals(root).facts.agentFileNames ?? []).sort(), ['refactor.agent.md', 'test-expert.agent.md']);
	});
});

test('collectDarkFactoryFileSignals: a non-existent path yields observations rather than throwing', () => {
	const missing = path.join(os.tmpdir(), 'dark-factory-does-not-exist-xyz');
	const { observations, facts } = collectDarkFactoryFileSignals(missing);
	assert.equal(observations['ci-workflows'].state, 'absent');
	assert.deepEqual(facts.agentFileNames, []);
});
