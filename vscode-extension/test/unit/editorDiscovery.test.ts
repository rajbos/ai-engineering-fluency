import test from 'node:test';
import * as assert from 'node:assert/strict';
import { mergeNotifiedEditors, mergeSeenEditors } from '../../src/editorDiscovery';

test('mergeSeenEditors', async (t) => {
	await t.test('seeds baseline without notifying when no previous state exists', () => {
		const result = mergeSeenEditors(undefined, ['VS Code', 'Cursor']);
		assert.deepEqual(result.seenEditors, ['Cursor', 'VS Code']);
		assert.deepEqual(result.newEditors, []);
	});

	await t.test('returns only unseen editors as newly discovered', () => {
		const result = mergeSeenEditors(['Cursor', 'VS Code'], ['VS Code', 'JetBrains', 'Windsurf']);
		assert.deepEqual(result.seenEditors, ['Cursor', 'JetBrains', 'VS Code', 'Windsurf']);
		assert.deepEqual(result.newEditors, ['JetBrains', 'Windsurf']);
	});

	await t.test('normalizes duplicate and unknown values', () => {
		const result = mergeSeenEditors(['VS Code', 'VS Code', 'Unknown'], ['  Cursor  ', '', 'Unknown', 'Cursor']);
		assert.deepEqual(result.seenEditors, ['Cursor', 'VS Code']);
		assert.deepEqual(result.newEditors, ['Cursor']);
	});
});

test('mergeNotifiedEditors', async (t) => {
	await t.test('returns only editors that have not been notified yet', () => {
		const result = mergeNotifiedEditors(['Cursor'], ['Cursor', 'JetBrains']);
		assert.deepEqual(result.notifiedEditors, ['Cursor', 'JetBrains']);
		assert.deepEqual(result.editorsToNotify, ['JetBrains']);
	});

	await t.test('normalizes candidate values and ignores unknown entries', () => {
		const result = mergeNotifiedEditors(undefined, ['Unknown', '', '  VS Code  ', 'VS Code']);
		assert.deepEqual(result.notifiedEditors, ['VS Code']);
		assert.deepEqual(result.editorsToNotify, ['VS Code']);
	});
});
