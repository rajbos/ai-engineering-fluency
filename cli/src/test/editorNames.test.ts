/**
 * Contract test for editor-name agreement between the CLI and the shared extension
 * helpers — see the `validate-editor-names` skill.
 *
 * The CLI's getEditorSourceFromPath() (cli/src/analysis.ts) and the extension's
 * getEditorTypeFromPath() (src/workspaceHelpers.ts) classify the same paths through
 * two hand-maintained substring ladders. They drift silently: nothing throws when a
 * path is labelled 'Visual Studio' by one and 'VS Code' by the other, the numbers just
 * land in the wrong bucket. These cases pin the three Visual Studio Copilot Chat
 * session roots (issue #2137) to the same answer on both sides.
 *
 * getEditorTypeFromPath lives in a module that imports `vscode`, so it cannot be
 * required from the CLI's test process. The expectations below are duplicated from
 * vscode-extension/test/unit/workspaceHelpers.test.ts, which asserts the same strings
 * against the extension implementation.
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';

import { getEditorSourceFromPath } from '../analysis';

const VS_SOLUTION = '/project/.vs/mysolution.sln/copilot-chat/abc123/sessions/uuid';
const VS_APPDATA = 'C:/Users/u/AppData/Local/Microsoft/VisualStudio/18.0_0a408795/VSGitHubCopilot/copilot-chat/b6662ded/sessions/80720523';
const SSMS = 'C:/Users/u/AppData/Local/Microsoft/SSMS/22.0_82a729ff/SSMSGitHubCopilot/copilot-chat/ca1642fb/sessions/7bb52dc2';

test('CLI labels per-solution Visual Studio sessions as Visual Studio', () => {
	assert.equal(getEditorSourceFromPath(VS_SOLUTION), 'Visual Studio');
});

test('CLI labels VSGitHubCopilot AppData sessions as Visual Studio', () => {
	// Chats started without a solution open, so no .vs folder exists (issue #2137).
	assert.equal(getEditorSourceFromPath(VS_APPDATA), 'Visual Studio');
});

test('CLI labels SSMS sessions as SSMS, matching VisualStudioAdapter.getDisplayName', () => {
	assert.equal(getEditorSourceFromPath(SSMS), 'SSMS');
});

test('CLI requires /sessions/ before calling a copilot-chat path Visual Studio', () => {
	// The extension's isVisualStudioPath() requires it; the CLI must agree.
	assert.notEqual(
		getEditorSourceFromPath('C:/Users/u/AppData/Local/Microsoft/VisualStudio/18.0/VSGitHubCopilot/copilot-chat/b6662ded/index.json'),
		'Visual Studio'
	);
	assert.notEqual(getEditorSourceFromPath('/project/.vs/mysolution.sln/copilot-chat/abc123/index.json'), 'Visual Studio');
});

test('CLI does not match an unrelated folder merely named VSGitHubCopilot', () => {
	assert.notEqual(
		getEditorSourceFromPath('C:/repos/vsgithubcopilot/docs/copilot-chat/notes/sessions/readme.md'),
		'Visual Studio'
	);
});
