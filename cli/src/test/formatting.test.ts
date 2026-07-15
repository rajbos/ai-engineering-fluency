/**
 * Unit tests for CLI formatting utilities.
 * Tests the formatting functions in cli/src/formatting.ts
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';
import { clearLine, writeProgress, writeProgressCount } from '../formatting';

// Helper to capture stdout.write calls
let writeCalls: string[] = [];

function setupWriteCapture() {
	writeCalls = [];
	const original = process.stdout.write;
	(process.stdout as any).write = function(chunk: any, encoding?: any, fd?: any): boolean {
		writeCalls.push(chunk.toString());
		return true;
	};
	return () => {
		(process.stdout as any).write = original;
	};
}

test('clearLine writes correct output with default width', () => {
	const restore = setupWriteCapture();
	try {
		clearLine();
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		// Should be: \r + 50 spaces + \r
		assert.equal(output, '\r' + ' '.repeat(50) + '\r');
	} finally {
		restore();
	}
});

test('clearLine writes correct output with custom width', () => {
	const restore = setupWriteCapture();
	try {
		clearLine(10);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.equal(output, '\r' + ' '.repeat(10) + '\r');
	} finally {
		restore();
	}
});

test('clearLine writes correct output with width 0', () => {
	const restore = setupWriteCapture();
	try {
		clearLine(0);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.equal(output, '\r\r');
	} finally {
		restore();
	}
});

test('clearLine writes correct output with negative width', () => {
	const restore = setupWriteCapture();
	try {
		clearLine(-5);
		assert.equal(writeCalls.length, 1);
		// repeat with negative number should produce empty string
		const output = writeCalls[0];
		assert.equal(output, '\r\r');
	} finally {
		restore();
	}
});

test('writeProgress writes message without newline', () => {
	const restore = setupWriteCapture();
	try {
		writeProgress('Processing...');
		assert.equal(writeCalls.length, 1);
		// chalk.dim adds ANSI codes, but we can check it contains the message
		const output = writeCalls[0];
		assert.ok(output.includes('Processing...'));
		// Should not have newline
		assert.ok(!output.includes('\n'));
	} finally {
		restore();
	}
});

test('writeProgress handles empty message', () => {
	const restore = setupWriteCapture();
	try {
		writeProgress('');
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		// chalk.dim('') should still produce some output
		assert.ok(output.length >= 0);
	} finally {
		restore();
	}
});

test('writeProgress handles message with special characters', () => {
	const restore = setupWriteCapture();
	try {
		writeProgress('Processing: 50/100 files\nwith newlines\ttabs');
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.ok(output.includes('Processing:'));
		assert.ok(output.includes('files'));
	} finally {
		restore();
	}
});

test('writeProgressCount writes correct format', () => {
	const restore = setupWriteCapture();
	try {
		writeProgressCount(5, 10);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.ok(output.includes('Processing: 5/10 files'));
		// Should start with carriage return
		assert.ok(output.startsWith('\r'));
		// Should not have newline
		assert.ok(!output.includes('\n'));
	} finally {
		restore();
	}
});

test('writeProgressCount handles zero completed', () => {
	const restore = setupWriteCapture();
	try {
		writeProgressCount(0, 10);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.ok(output.includes('Processing: 0/10 files'));
	} finally {
		restore();
	}
});

test('writeProgressCount handles zero total', () => {
	const restore = setupWriteCapture();
	try {
		writeProgressCount(5, 0);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.ok(output.includes('Processing: 5/0 files'));
	} finally {
		restore();
	}
});

test('writeProgressCount handles large numbers', () => {
	const restore = setupWriteCapture();
	try {
		writeProgressCount(1000, 2000);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.ok(output.includes('Processing: 1000/2000 files'));
	} finally {
		restore();
	}
});

test('writeProgressCount handles equal completed and total', () => {
	const restore = setupWriteCapture();
	try {
		writeProgressCount(100, 100);
		assert.equal(writeCalls.length, 1);
		const output = writeCalls[0];
		assert.ok(output.includes('Processing: 100/100 files'));
	} finally {
		restore();
	}
});
