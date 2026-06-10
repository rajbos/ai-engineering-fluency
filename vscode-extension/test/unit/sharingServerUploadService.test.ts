/**
 * Unit tests for SharingServerUploadService.
 * Tests the HTTP upload functionality for the self-hosted sharing server.
 */

import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';

import { SharingServerUploadService } from '../../src/backend/services/sharingServerUploadService';

// Mock global fetch
let mockFetchResponse: Response | undefined;
let mockFetchCalls: Array<{ url: string; options: RequestInit; body?: string }> = [];

test.beforeEach(() => {
	mockFetchCalls = [];
	mockFetchResponse = undefined;
	
	global.fetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
		const urlStr = typeof url === 'string' ? url : url.toString();
		const body = options?.body ? JSON.parse(options.body.toString()) : null;
		const batchSize = Array.isArray(body) ? body.length : 1;
		
		mockFetchCalls.push({
			url: urlStr,
			options: options || {},
			body: options?.body ? options.body.toString() : undefined
		});
		
		if (mockFetchResponse) {
			return mockFetchResponse;
		}
		
		// Default to successful response with all entries uploaded
		return new Response(JSON.stringify({ uploaded: batchSize }), {
			status: 200,
			statusText: 'OK'
		});
	};
});

test.afterEach(() => {
	mockFetchCalls = [];
	mockFetchResponse = undefined;
	delete (global as any).fetch;
});

// Helper to create test entries
function createTestEntry(day: string = '2024-01-01'): any {
	return {
		day,
		model: 'gpt-4',
		workspaceId: 'workspace-1',
		workspaceName: 'Test Workspace',
		machineId: 'machine-1',
		machineName: 'Test Machine',
		editor: 'VS Code',
		inputTokens: 1000,
		outputTokens: 500,
		interactions: 5,
		datasetId: 'default',
		fluencyMetrics: { score: 0.8 }
	};
}

// Test suite for uploadRollups
// ==============================

test('uploadRollups: successful upload with single batch', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry(), createTestEntry('2024-01-02')];
	
	const logMsgs: string[] = [];
	const warnMsgs: string[] = [];
	
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		(msg) => logMsgs.push(msg),
		(msg) => warnMsgs.push(msg)
	);
	
	assert.equal(result.success, true);
	assert.equal(result.entriesUploaded, 2);
	assert.equal(mockFetchCalls.length, 1);
	assert.ok(mockFetchCalls[0].url.includes('/api/upload'));
	const headers = mockFetchCalls[0].options?.headers as Record<string, string> | undefined;
	assert.ok(headers?.['Authorization']?.includes('Bearer github-token'));
	assert.ok(logMsgs.some(msg => msg.includes('Uploaded 2 entries')));
});

test('uploadRollups: successful upload with multiple batches', async () => {
	const service = new SharingServerUploadService();
	const entries = [];
	
	// Create 1000 entries (more than BATCH_SIZE of 500)
	for (let i = 0; i < 1000; i++) {
		entries.push(createTestEntry(`2024-01-${String(i % 30 + 1).padStart(2, '0')}`));
	}
	
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		() => {}
	);
	
	assert.equal(result.success, true);
	assert.equal(result.entriesUploaded, 1000);
	assert.equal(mockFetchCalls.length, 2); // 2 batches of 500
});

test('uploadRollups: handles server validation errors', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry(), createTestEntry('2024-01-02')];
	
	// Mock response with validation errors
	mockFetchResponse = new Response(JSON.stringify({
		uploaded: 1,
		errors: ['Entry 1 invalid', 'Entry 2 invalid']
	}), {
		status: 200,
		statusText: 'OK'
	});
	
	const warnMsgs: string[] = [];
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		(msg) => warnMsgs.push(msg)
	);
	
	assert.equal(result.success, true);
	assert.equal(result.entriesUploaded, 1); // Only 1 uploaded
	assert.ok(warnMsgs.some(msg => msg.includes('server rejected')));
});

test('uploadRollups: handles server error response', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry()];
	
	// Mock error response
	mockFetchResponse = new Response('Internal Server Error', {
		status: 500,
		statusText: 'Internal Server Error'
	});
	
	const warnMsgs: string[] = [];
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		(msg) => warnMsgs.push(msg)
	);
	
	assert.equal(result.success, false);
	assert.equal(result.entriesUploaded, 0);
	assert.ok(warnMsgs.some(msg => msg.includes('HTTP 500')));
});

test('uploadRollups: handles network errors', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry()];
	
	// Mock fetch to throw
	global.fetch = async () => {
		throw new Error('Network error');
	};
	
	const warnMsgs: string[] = [];
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		(msg) => warnMsgs.push(msg)
	);
	
	assert.equal(result.success, false);
	assert.equal(result.entriesUploaded, 0);
	assert.ok(warnMsgs.some(msg => msg.includes('Upload failed')));
});

test('uploadRollups: handles empty entries array', async () => {
	const service = new SharingServerUploadService();
	const entries: any[] = [];
	
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		() => {}
	);
	
	assert.equal(result.success, true);
	assert.equal(result.entriesUploaded, 0);
	assert.equal(mockFetchCalls.length, 0); // No calls made for empty array
});

test('uploadRollups: strips trailing slash from endpoint URL', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry()];
	
	await service.uploadRollups(
		'https://server.example.com/',
		'github-token',
		entries,
		() => {},
		() => {}
	);
	
	assert.equal(mockFetchCalls.length, 1);
	const requestUrl = new URL(mockFetchCalls[0].url);
	assert.equal(requestUrl.origin, 'https://server.example.com');
	assert.equal(requestUrl.pathname, '/api/upload');
	assert.ok(!mockFetchCalls[0].url.includes('//api'));
});

test('uploadRollups: sends correct Content-Type header', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry()];
	
	await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		() => {}
	);
	
	assert.equal(mockFetchCalls.length, 1);
	const headers = mockFetchCalls[0].options?.headers as Record<string, string> | undefined;
	assert.equal(headers?.['Content-Type'], 'application/json');
});

test('uploadRollups: sends entries as JSON body', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry('2024-01-01')];
	
	await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		() => {}
	);
	
	assert.equal(mockFetchCalls.length, 1);
	const body = mockFetchCalls[0].body;
	assert.ok(body?.includes('2024-01-01'));
	assert.ok(body?.includes('gpt-4'));
});

test('uploadRollups: handles non-JSON response gracefully', async () => {
	const service = new SharingServerUploadService();
	const entries = [createTestEntry()];
	
	// Mock response with non-JSON body
	mockFetchResponse = new Response('Not JSON', {
		status: 200,
		statusText: 'OK'
	});
	
	const result = await service.uploadRollups(
		'https://server.example.com',
		'github-token',
		entries,
		() => {},
		() => {}
	);
	
	assert.equal(result.success, true);
	assert.equal(result.entriesUploaded, 1); // Falls back to batch.length
});

// Test suite for uploadFluencyScore
// ==================================

test('uploadFluencyScore: successful upload', async () => {
	const service = new SharingServerUploadService();
	const score = { score: 0.85, stage: 3 };
	
	const logMsgs: string[] = [];
	const warnMsgs: string[] = [];
	
	await service.uploadFluencyScore(
		'https://server.example.com',
		'github-token',
		score,
		(msg) => logMsgs.push(msg),
		(msg) => warnMsgs.push(msg)
	);
	
	assert.equal(mockFetchCalls.length, 1);
	assert.ok(mockFetchCalls[0].url.includes('/api/fluency-score'));
	const headers = mockFetchCalls[0].options?.headers as Record<string, string> | undefined;
	assert.ok(headers?.['Authorization']?.includes('Bearer github-token'));
	assert.ok(logMsgs.some(msg => msg.includes('fluency-score upload: ok')));
});

test('uploadFluencyScore: handles server error', async () => {
	const service = new SharingServerUploadService();
	const score = { score: 0.85 };
	
	// Mock error response
	mockFetchResponse = new Response('Bad Request', {
		status: 400,
		statusText: 'Bad Request'
	});
	
	const warnMsgs: string[] = [];
	await service.uploadFluencyScore(
		'https://server.example.com',
		'github-token',
		score,
		() => {},
		(msg) => warnMsgs.push(msg)
	);
	
	assert.ok(warnMsgs.some(msg => msg.includes('HTTP 400')));
});

test('uploadFluencyScore: handles network error', async () => {
	const service = new SharingServerUploadService();
	const score = { score: 0.85 };
	
	// Mock fetch to throw
	global.fetch = async () => {
		throw new Error('Network failure');
	};
	
	const warnMsgs: string[] = [];
	await service.uploadFluencyScore(
		'https://server.example.com',
		'github-token',
		score,
		() => {},
		(msg) => warnMsgs.push(msg)
	);
	
	assert.ok(warnMsgs.some(msg => msg.includes('failed')));
});

test('uploadFluencyScore: strips trailing slash from endpoint URL', async () => {
	const service = new SharingServerUploadService();
	const score = { score: 0.85 };
	
	await service.uploadFluencyScore(
		'https://server.example.com/',
		'github-token',
		score,
		() => {},
		() => {}
	);
	
	assert.equal(mockFetchCalls.length, 1);
	const calledUrl = new URL(mockFetchCalls[0].url);
	assert.equal(calledUrl.origin, 'https://server.example.com');
	assert.equal(calledUrl.pathname, '/api/fluency-score');
});

test('uploadFluencyScore: sends score as JSON body', async () => {
	const service = new SharingServerUploadService();
	const score = { score: 0.85, stage: 3 };
	
	await service.uploadFluencyScore(
		'https://server.example.com',
		'github-token',
		score,
		() => {},
		() => {}
	);
	
	assert.equal(mockFetchCalls.length, 1);
	const body = mockFetchCalls[0].body;
	assert.ok(body?.includes('0.85'));
	assert.ok(body?.includes('3'));
});
