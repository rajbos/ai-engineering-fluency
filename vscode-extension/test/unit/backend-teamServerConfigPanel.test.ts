/**
 * Unit tests for TeamServerConfigPanel.
 * Tests the team server configuration webview panel.
 */

import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';

import { TeamServerConfigPanel } from '../../src/backend/teamServerConfigPanel';

// These tests are limited because TeamServerConfigPanel heavily depends on VS Code APIs
// that are difficult to mock properly. We test what we can.

test('TeamServerConfigPanel: can be instantiated', () => {
	const extensionUri = { fsPath: '/test/uri' } as any;
	const panel = new TeamServerConfigPanel(extensionUri);
	assert.ok(panel !== undefined);
	assert.ok(panel instanceof TeamServerConfigPanel);
});

test('TeamServerConfigPanel: isDisposed returns false for new instance', () => {
	const extensionUri = { fsPath: '/test/uri' } as any;
	const panel = new TeamServerConfigPanel(extensionUri);
	assert.equal(panel.isDisposed(), false);
});

test('TeamServerConfigPanel: dispose sets isDisposed to true', () => {
	const extensionUri = { fsPath: '/test/uri' } as any;
	const panel = new TeamServerConfigPanel(extensionUri);
	
	assert.equal(panel.isDisposed(), false);
	panel.dispose();
	assert.equal(panel.isDisposed(), true);
});

test('TeamServerConfigPanel: dispose clears current singleton', () => {
	const extensionUri = { fsPath: '/test/uri' } as any;
	
	// Create a panel and set it as current
	const panel = new TeamServerConfigPanel(extensionUri);
	(TeamServerConfigPanel as any).current = panel;
	
	assert.equal((TeamServerConfigPanel as any).current, panel);
	
	panel.dispose();
	
	assert.equal((TeamServerConfigPanel as any).current, undefined);
});

test('TeamServerConfigPanel: double dispose is safe', () => {
	const extensionUri = { fsPath: '/test/uri' } as any;
	const panel = new TeamServerConfigPanel(extensionUri);
	
	panel.dispose();
	assert.equal(panel.isDisposed(), true);
	
	// Should not throw
	panel.dispose();
	assert.equal(panel.isDisposed(), true);
});
