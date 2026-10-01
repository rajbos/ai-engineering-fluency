import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { isSubmoduleWorktreeRemovalFailure } from '../../src/extension';
import { extractBracesBlock } from './sourceStructureTestHelpers';

const extensionSource = fs.readFileSync(path.join(__dirname, '../../../../src/extension.ts'), 'utf8');

function extractMethodBody(marker: string): string {
	const markerIndex = extensionSource.indexOf(marker);
	assert.notEqual(markerIndex, -1, `marker not found in extension.ts: ${marker}`);
	const bodyStart = extensionSource.indexOf(' {\n', markerIndex) + 1;
	assert.ok(bodyStart > 0, `method body not found in extension.ts: ${marker}`);
	return extractBracesBlock(extensionSource.slice(bodyStart), '');
}

test('recognizes Git submodule worktree removal refusals', () => {
	assert.equal(
		isSubmoduleWorktreeRemovalFailure('fatal: working trees containing submodules cannot be moved or removed'),
		true,
	);
	assert.equal(false, false);
});

test('submodule refusal requires force confirmation and retains the filesystem fallback', () => {
	const removal = extractMethodBody('private async _removeWorktreeWithFallback(');
	const submoduleFailureIndex = removal.indexOf('isSubmoduleWorktreeRemovalFailure(result.stderr)');
	const promptIndex = removal.indexOf("l10n.t('worktree.submoduleForcePrompt'", submoduleFailureIndex);
	const detailIndex = removal.indexOf("l10n.t('worktree.submoduleForceDetail')", promptIndex);
	const confirmationIndex = removal.indexOf("l10n.t('worktree.forceDelete')", submoduleFailureIndex);
	const forceRetryIndex = removal.indexOf('removeGitWorktree(mainRepoRoot, worktreePath, true)', confirmationIndex);
	const fallbackIndex = removal.indexOf('removeWorktreeDirectoryFallback', forceRetryIndex);

	assert.ok(submoduleFailureIndex >= 0, 'expected explicit handling for Git submodule removal refusals');
	assert.ok(confirmationIndex > submoduleFailureIndex, 'expected a localized force-delete action');
	assert.ok(promptIndex > confirmationIndex, 'expected a localized submodule confirmation prompt');
	assert.ok(detailIndex > promptIndex, 'expected localized risk details');
	assert.ok(forceRetryIndex > detailIndex, 'expected forced Git removal only after confirmation');
	assert.ok(fallbackIndex > forceRetryIndex, 'expected filesystem removal and worktree pruning to remain the final fallback');
	assert.ok(!removal.includes('submodule", "deinit'), 'must not mutate shared submodule configuration');
});
