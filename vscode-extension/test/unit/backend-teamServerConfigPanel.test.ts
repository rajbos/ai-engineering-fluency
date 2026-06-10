// @ts-nocheck
import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';

// Helper to create a mock panel with proper event emitters
function createMockPanel(overrides: any = {}): any {
	return {
		reveal: () => {},
		dispose: () => {},
		onDidDispose: (callback: () => void) => ({ dispose: () => {} }),
		webview: {
			onDidReceiveMessage: (callback: (msg: any) => void) => ({ dispose: () => {} }),
			postMessage: (msg: any) => {},
			html: ''
		},
		...overrides
	};
}

test('TeamServerConfigPanel - show reuses existing panel', async () => {
	(vscode as any).__mock.reset();
	
	const revealCalls: string[] = [];
	const createWebviewCalls: any[] = [];
	
	// Mock the existing panel
	const mockPanel = createMockPanel({
		reveal: () => { revealCalls.push('reveal'); }
	});
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = (viewType: string, title: string, column: any, options: any) => {
		createWebviewCalls.push({ viewType, title, column, options });
		return createMockPanel();
	};
	
	// Mock vscode.workspace
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Set the current panel
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = new TeamServerConfigPanel(context.extensionUri);
	(TeamServerConfigPanel.current as any).panel = mockPanel;
	(TeamServerConfigPanel.current as any).disposed = false;
	
	// Call show
	TeamServerConfigPanel.show(context);
	
	// Should reuse existing panel
	assert.equal(createWebviewCalls.length, 0, 'Should not create new panel when one exists');
	assert.equal(revealCalls.length, 1, 'Should reveal existing panel');
	
	// Clean up
	TeamServerConfigPanel.current = undefined;
});

test('TeamServerConfigPanel - show creates new panel when none exists', async () => {
	(vscode as any).__mock.reset();
	
	const createWebviewCalls: any[] = [];
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = (viewType: string, title: string, column: any, options: any) => {
		createWebviewCalls.push({ viewType, title, column, options });
		return createMockPanel();
	};
	
	// Mock vscode.workspace
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Ensure no current panel
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	// Call show
	TeamServerConfigPanel.show(context);
	
	// Should create new panel
	assert.equal(createWebviewCalls.length, 1, 'Should create new panel when none exists');
	assert.equal(createWebviewCalls[0].viewType, 'copilotTeamServerConfig');
	assert.equal(createWebviewCalls[0].title, 'AI Engineering Fluency: Configure Team Server');
	
	// Clean up
	TeamServerConfigPanel.current?.dispose();
	TeamServerConfigPanel.current = undefined;
});

test('TeamServerConfigPanel - dispose cleans up resources', async () => {
	(vscode as any).__mock.reset();
	
	const panelDisposeCalls: number[] = [];
	const disposableDisposeCalls: string[] = [];
	
	// Mock panel
	const mockPanel = createMockPanel({
		dispose: () => { panelDisposeCalls.push(1); }
	});
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = () => mockPanel;
	
	// Mock vscode.workspace
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	(panel as any).panel = mockPanel;
	(panel as any).disposables = [
		{ dispose: () => { disposableDisposeCalls.push('disposable1'); } },
		{ dispose: () => { disposableDisposeCalls.push('disposable2'); } }
	];
	
	// Call dispose
	panel.dispose();
	
	// Verify cleanup
	assert.ok(panel.isDisposed(), 'Panel should be marked as disposed');
	assert.equal(panelDisposeCalls.length, 1, 'Panel dispose should be called');
	assert.equal(disposableDisposeCalls.length, 2, 'All disposables should be disposed');
	assert.equal(TeamServerConfigPanel.current, undefined, 'Current reference should be cleared');
});

test('TeamServerConfigPanel - handleMessage validates required endpoint URL', async () => {
	(vscode as any).__mock.reset();
	
	const postMessageCalls: any[] = [];
	
	// Mock panel with postMessage
	const mockPanel = createMockPanel({
		webview: {
			...createMockPanel().webview,
			postMessage: (msg: any) => { postMessageCalls.push(msg); }
		}
	});
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = () => mockPanel;
	windowMock.showInformationMessage = async () => {};
	
	// Mock vscode.workspace
	const configUpdates: any[] = [];
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue,
		update: async (key: string, value: any) => { configUpdates.push({ key, value }); }
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	(panel as any).panel = mockPanel;
	
	// Call handleMessage with enabled=true but empty endpointUrl
	const message = { command: 'save', enabled: true, endpointUrl: '', sharingProfile: 'teamAnonymized' };
	
	// Access the private method through the instance
	const handleMessage = (panel as any).handleMessage.bind(panel);
	await handleMessage(message);
	
	// Should send validation error
	assert.equal(postMessageCalls.length, 1, 'Should send validation error message');
	assert.equal(postMessageCalls[0].command, 'validationError');
	assert.equal(postMessageCalls[0].field, 'endpointUrl');
	assert.ok(postMessageCalls[0].text.includes('required'), 'Error message should mention required');
	
	// Should not update config
	assert.equal(configUpdates.length, 0, 'Should not update config when validation fails');
});

test('TeamServerConfigPanel - handleMessage validates URL format', async () => {
	(vscode as any).__mock.reset();
	
	const postMessageCalls: any[] = [];
	
	// Mock panel with postMessage
	const mockPanel = createMockPanel({
		webview: {
			...createMockPanel().webview,
			postMessage: (msg: any) => { postMessageCalls.push(msg); }
		}
	});
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = () => mockPanel;
	windowMock.showInformationMessage = async () => {};
	
	// Mock vscode.workspace
	const configUpdates: any[] = [];
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue,
		update: async (key: string, value: any) => { configUpdates.push({ key, value }); }
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	(panel as any).panel = mockPanel;
	
	// Call handleMessage with invalid URL
	const message = { command: 'save', enabled: true, endpointUrl: 'not-a-valid-url', sharingProfile: 'teamAnonymized' };
	
	const handleMessage = (panel as any).handleMessage.bind(panel);
	await handleMessage(message);
	
	// Should send validation error for invalid URL
	assert.equal(postMessageCalls.length, 1, 'Should send validation error message');
	assert.equal(postMessageCalls[0].command, 'validationError');
	assert.equal(postMessageCalls[0].field, 'endpointUrl');
	assert.ok(postMessageCalls[0].text.includes('valid URL'), 'Error message should mention valid URL');
	
	// Should not update config
	assert.equal(configUpdates.length, 0, 'Should not update config when validation fails');
});

test('TeamServerConfigPanel - handleMessage saves valid configuration', async () => {
	(vscode as any).__mock.reset();
	
	const infoMessages: string[] = [];
	const panelDisposeCalls: number[] = [];
	
	// Mock panel
	const mockPanel = createMockPanel({
		dispose: () => { panelDisposeCalls.push(1); }
	});
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = () => mockPanel;
	windowMock.showInformationMessage = async (msg: string) => { infoMessages.push(msg); };
	
	// Mock vscode.workspace
	const configUpdates: any[] = [];
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue,
		update: async (key: string, value: any) => { configUpdates.push({ key, value }); }
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	(panel as any).panel = mockPanel;
	
	// Call handleMessage with valid data
	const message = { 
		command: 'save', 
		enabled: true, 
		endpointUrl: 'https://example.com/server',
		sharingProfile: 'teamAnonymized'
	};
	
	const handleMessage = (panel as any).handleMessage.bind(panel);
	await handleMessage(message);
	
	// Should update config
	assert.equal(configUpdates.length, 3, 'Should update 3 config values');
	assert.equal(configUpdates[0].key, 'backend.sharingServer.enabled');
	assert.equal(configUpdates[0].value, true);
	assert.equal(configUpdates[1].key, 'backend.sharingServer.endpointUrl');
	assert.equal(configUpdates[1].value, 'https://example.com/server');
	assert.equal(configUpdates[2].key, 'backend.sharingProfile');
	assert.equal(configUpdates[2].value, 'teamAnonymized');
	
	// Should show success message
	assert.equal(infoMessages.length, 1, 'Should show success message');
	assert.ok(infoMessages[0].includes('saved'), 'Success message should mention saved');
	
	// Should dispose panel
	assert.equal(panelDisposeCalls.length, 1, 'Should dispose panel after save');
});

test('TeamServerConfigPanel - handleMessage uses default profile for invalid sharing profile', async () => {
	(vscode as any).__mock.reset();
	
	const infoMessages: string[] = [];
	
	// Mock panel
	const mockPanel = createMockPanel();
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = () => mockPanel;
	windowMock.showInformationMessage = async (msg: string) => { infoMessages.push(msg); };
	
	// Mock vscode.workspace
	const configUpdates: any[] = [];
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue,
		update: async (key: string, value: any) => { configUpdates.push({ key, value }); }
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	(panel as any).panel = mockPanel;
	
	// Call handleMessage with invalid sharing profile
	const message = { 
		command: 'save', 
		enabled: true, 
		endpointUrl: 'https://example.com/server',
		sharingProfile: 'invalid-profile'
	};
	
	const handleMessage = (panel as any).handleMessage.bind(panel);
	await handleMessage(message);
	
	// Should use 'off' as default for invalid profile
	assert.equal(configUpdates.length, 3, 'Should update 3 config values');
	assert.equal(configUpdates[2].key, 'backend.sharingProfile');
	assert.equal(configUpdates[2].value, 'off', 'Should default to off for invalid profile');
});

test('TeamServerConfigPanel - handleMessage ignores non-save commands', async () => {
	(vscode as any).__mock.reset();
	
	const postMessageCalls: any[] = [];
	
	// Mock panel
	const mockPanel = createMockPanel({
		webview: {
			...createMockPanel().webview,
			postMessage: (msg: any) => { postMessageCalls.push(msg); }
		}
	});
	
	// Mock vscode.window
	const windowMock = vscode.window as any;
	windowMock.createWebviewPanel = () => mockPanel;
	windowMock.showInformationMessage = async () => {};
	
	// Mock vscode.workspace
	const configUpdates: any[] = [];
	const workspaceMock = vscode.workspace as any;
	workspaceMock.getConfiguration = () => ({
		get: (key: string, defaultValue: any) => defaultValue,
		update: async (key: string, value: any) => { configUpdates.push({ key, value }); }
	});
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	(panel as any).panel = mockPanel;
	
	// Call handleMessage with non-save command
	const message = { command: 'cancel' };
	
	const handleMessage = (panel as any).handleMessage.bind(panel);
	await handleMessage(message);
	
	// Should not do anything
	assert.equal(postMessageCalls.length, 0, 'Should not send any messages');
	assert.equal(configUpdates.length, 0, 'Should not update config');
});

test('TeamServerConfigPanel - renderHtml generates valid HTML', async () => {
	(vscode as any).__mock.reset();
	
	// Mock context
	const context = {
		extensionUri: vscode.Uri.parse('file:///extension'),
		subscriptions: []
	} as any;
	
	// Create instance
	const { TeamServerConfigPanel } = require('../../src/backend/teamServerConfigPanel');
	TeamServerConfigPanel.current = undefined;
	
	const panel = new TeamServerConfigPanel(context.extensionUri);
	
	// Mock webview
	const mockWebview = {
		postMessage: () => {}
	} as any;
	
	// Call renderHtml
	const html = (panel as any).renderHtml(mockWebview, true, 'https://test.com', 'teamAnonymized');
	
	// Verify HTML structure
	assert.ok(html.includes('<!DOCTYPE html>'), 'Should include DOCTYPE');
	assert.ok(html.includes('Configure Team Server'), 'Should include title');
	assert.ok(html.includes('checked'), 'Should include checked attribute for enabled');
	assert.ok(html.includes('https://test.com'), 'Should include endpoint URL');
	assert.ok(html.includes('teamAnonymized'), 'Should include sharing profile');
	assert.ok(html.includes('nonce='), 'Should include nonce for CSP');
});
