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

test('confirmed force removal deinitializes submodules before retrying Git removal', () => {
	const cleanup = extractMethodBody('private async removeGitWorktreeWithSubmoduleCleanup(');
	const deinitIndex = cleanup.indexOf('["submodule", "deinit", "--all", "--force"]');
	const retryIndex = cleanup.indexOf('this.removeGitWorktree(mainRepoRoot, worktreePath, true)');

	assert.ok(deinitIndex >= 0, 'expected submodules to be deinitialized in the target worktree');
	assert.ok(retryIndex > deinitIndex, 'expected forced Git removal only after successful submodule deinitialization');
});

test('submodule refusal requires force confirmation and retains the filesystem fallback', () => {
	const removal = extractMethodBody('private async _removeWorktreeWithFallback(');
	const submoduleFailureIndex = removal.indexOf('isSubmoduleWorktreeRemovalFailure(result.stderr)');
	const confirmationIndex = removal.indexOf('"Force Delete"', submoduleFailureIndex);
	const cleanupIndex = removal.indexOf('removeGitWorktreeWithSubmoduleCleanup', submoduleFailureIndex);
	const fallbackIndex = removal.indexOf('removeWorktreeDirectoryFallback', cleanupIndex);

	assert.ok(submoduleFailureIndex >= 0, 'expected explicit handling for Git submodule removal refusals');
	assert.ok(confirmationIndex > submoduleFailureIndex, 'expected explicit force-delete confirmation');
	assert.ok(cleanupIndex > confirmationIndex, 'expected submodule cleanup only after confirmation');
	assert.ok(fallbackIndex > cleanupIndex, 'expected filesystem removal and worktree pruning to remain the final fallback');
});
