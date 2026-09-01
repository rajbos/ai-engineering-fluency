import test from 'node:test';
import * as assert from 'node:assert/strict';

import { getLoadingHtmlBody, getLoadingHtmlScript } from '../../src/loadingHtml';

test('loading timer starts from the supplied analysis start time', () => {
	const startedAtMs = 1_725_000_123_456;

	assert.match(getLoadingHtmlScript(startedAtMs), /var t0 = 1725000123456;/);
	assert.match(getLoadingHtmlScript(startedAtMs), /updateElapsed\(\);\s+setInterval\(updateElapsed, 1000\);/);
	assert.match(getLoadingHtmlBody('nonce', undefined, startedAtMs), /var t0 = 1725000123456;/);
});
