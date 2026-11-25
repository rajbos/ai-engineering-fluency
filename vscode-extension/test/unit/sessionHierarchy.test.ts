import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MistralVibeDataAccess } from '../../../src/mistralvibe';
import type { SessionFileDetails } from '../../../src/types';
import { enrichVibeSessionHierarchy } from '../../../vscode-extension/src/analysis/sessionHierarchy';

/**
 * Builds a temp VIBE_HOME with a legacy-layout parent session and two subsessions
 * (one legacy, one unified-store) pointing back at it via meta.json `parent_session_id`,
 * plus an unrelated root session. Returns the meta paths and a cleanup.
 */
function writeVibeHome(): {
	root: string;
	parentMeta: string;
	legacyChildMeta: string;
	unifiedChildMeta: string;
	otherRootMeta: string;
	parentId: string;
	legacyChildId: string;
	unifiedChildId: string;
	otherRootId: string;
	cleanup: () => void;
} {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-hierarchy-'));
	const parentId = 'aaaa1111-0000-0000-0000-000000000001';
	const legacyChildId = 'bbbb2222-0000-0000-0000-000000000002';
	const unifiedChildId = 'cccc3333-0000-0000-0000-000000000003';
	const otherRootId = 'dddd4444-0000-0000-0000-000000000004';
	const writeLegacy = (dirName: string, meta: unknown) => {
		const dir = path.join(root, 'logs', 'session', dirName);
		fs.mkdirSync(dir, { recursive: true });
		const metaPath = path.join(dir, 'meta.json');
		fs.writeFileSync(metaPath, JSON.stringify(meta));
		return metaPath;
	};
	const writeUnified = (id: string, meta: unknown) => {
		const dir = path.join(root, 'logs', 'session', 'unified', id);
		fs.mkdirSync(dir, { recursive: true });
		const metaPath = path.join(dir, 'meta.json');
		fs.writeFileSync(metaPath, JSON.stringify(meta));
		return metaPath;
	};
	const parentMeta = writeLegacy('session_20260922_091515_aaaa1111', { session_id: parentId, parent_session_id: null, title: 'Parent session' });
	const legacyChildMeta = writeLegacy('session_20260922_092000_bbbb2222', { session_id: legacyChildId, parent_session_id: parentId, title: 'Legacy child' });
	const unifiedChildMeta = writeUnified(unifiedChildId, { session_id: unifiedChildId, parent_session_id: parentId, title: 'Unified child' });
	const otherRootMeta = writeLegacy('session_20260922_093000_dddd4444', { session_id: otherRootId, parent_session_id: null, title: 'Other root' });
	return {
		root, parentMeta, legacyChildMeta, unifiedChildMeta, otherRootMeta,
		parentId, legacyChildId, unifiedChildId, otherRootId,
		cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
	};
}

/** Runs fn with VIBE_HOME pointed at root; always restores the env var. */
async function withVibeHome<T>(root: string, fn: () => Promise<T>): Promise<T> {
	const prev = process.env.VIBE_HOME;
	process.env.VIBE_HOME = root;
	try {
		return await fn();
	} finally {
		if (prev === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = prev; }
	}
}

function detailsFor(file: string, title?: string): SessionFileDetails {
	return {
		file,
		title,
		size: 1,
		modified: '2026-09-22T09:15:15.000Z',
		interactions: 1,
		contextReferences: {
			file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0, workspace: 0,
			terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0, clipboard: 0,
			changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0,
			byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {},
		},
		firstInteraction: '2026-09-22T09:15:15.000Z',
		lastInteraction: '2026-09-22T09:20:00.000Z',
		editorSource: 'Mistral Vibe',
	};
}

test('enrichVibeSessionHierarchy: links subsessions to their parent in both layouts', async () => {
	const fx = writeVibeHome();
	try {
		await withVibeHome(fx.root, async () => {
			const da = new MistralVibeDataAccess();
			const files = [
				detailsFor(fx.parentMeta, 'Parent session'),
				detailsFor(fx.legacyChildMeta, 'Legacy child'),
				detailsFor(fx.unifiedChildMeta, 'Unified child'),
				detailsFor(fx.otherRootMeta, 'Other root'),
				detailsFor('/some/other/editor/session.jsonl'),
			];
			await enrichVibeSessionHierarchy(da, files);

			const parent = files[0];
			assert.equal(parent.parentInfo, undefined);
			assert.equal(parent.totalChildCount, 2);
			assert.deepEqual(parent.childInfo?.map(c => c.uuid).sort(), [fx.legacyChildId, fx.unifiedChildId].sort());
			assert.deepEqual(parent.childInfo?.map(c => c.sessionFile).sort(), [fx.legacyChildMeta, fx.unifiedChildMeta].sort());
			assert.equal(parent.childInfo?.find(c => c.uuid === fx.legacyChildId)?.name, 'Legacy child');

			for (const child of [files[1], files[2]]) {
				assert.deepEqual(child.parentInfo, { uuid: fx.parentId, name: 'Parent session', sessionFile: fx.parentMeta });
				assert.equal(child.childInfo, undefined);
			}

			// Unrelated root and non-Vibe file stay untouched.
			assert.equal(files[3].parentInfo, undefined);
			assert.equal(files[3].childInfo, undefined);
			assert.equal(files[4].parentInfo, undefined);
		});
	} finally { fx.cleanup(); }
});

test('enrichVibeSessionHierarchy: resolves a parent outside the loaded window by session id', async () => {
	const fx = writeVibeHome();
	try {
		await withVibeHome(fx.root, async () => {
			const da = new MistralVibeDataAccess();
			// Only the unified child is in the loaded window; the parent must be found on disk.
			const child = detailsFor(fx.unifiedChildMeta);
			await enrichVibeSessionHierarchy(da, [child]);
			assert.deepEqual(child.parentInfo, { uuid: fx.parentId, name: 'Parent session', sessionFile: fx.parentMeta });
		});
	} finally { fx.cleanup(); }
});


