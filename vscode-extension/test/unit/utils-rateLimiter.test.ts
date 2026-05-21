import { test, describe } from 'node:test';
import * as assert from 'node:assert/strict';

import { RateLimiter } from '../../src/utils/rateLimiter';

describe('RateLimiter', () => {
	test('canExecute returns true before any execution', () => {
		const limiter = new RateLimiter(1000);
		assert.equal(limiter.canExecute(), true);
	});

	test('canExecute returns false immediately after recordExecution', () => {
		const limiter = new RateLimiter(1000);
		limiter.recordExecution();
		assert.equal(limiter.canExecute(), false);
	});

	test('canExecute returns true after cooldown has elapsed', async () => {
		const limiter = new RateLimiter(10);
		limiter.recordExecution();
		assert.equal(limiter.canExecute(), false);
		await new Promise(resolve => setTimeout(resolve, 20));
		assert.equal(limiter.canExecute(), true);
	});

	test('canExecute returns true with zero cooldown', () => {
		const limiter = new RateLimiter(0);
		limiter.recordExecution();
		assert.equal(limiter.canExecute(), true);
	});

	test('recordExecution resets the cooldown window', async () => {
		const limiter = new RateLimiter(10);
		limiter.recordExecution();
		await new Promise(resolve => setTimeout(resolve, 20));
		assert.equal(limiter.canExecute(), true);
		limiter.recordExecution();
		assert.equal(limiter.canExecute(), false);
	});
});
