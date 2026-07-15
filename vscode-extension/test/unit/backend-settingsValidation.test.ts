import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';

import { inferSharingProfile, validateLookbackDays } from '../../src/backend/settingsValidation';

// ---------------------------------------------------------------------------
// inferSharingProfile
// ---------------------------------------------------------------------------

test('inferSharingProfile returns explicit parsedSharingProfile when provided', () => {
	assert.equal(inferSharingProfile('soloFull', true, false, 'pseudonymous'), 'soloFull');
	assert.equal(inferSharingProfile('teamIdentified', false, false, 'pseudonymous'), 'teamIdentified');
	assert.equal(inferSharingProfile('off', true, true, 'teamAlias'), 'off');
});

test('inferSharingProfile returns off when backend is disabled', () => {
	assert.equal(inferSharingProfile(undefined, false, false, 'pseudonymous'), 'off');
	assert.equal(inferSharingProfile(undefined, false, true, 'teamAlias'), 'off');
});

test('inferSharingProfile returns teamAnonymized when shareWithTeam is false', () => {
	assert.equal(inferSharingProfile(undefined, true, false, 'pseudonymous'), 'teamAnonymized');
	assert.equal(inferSharingProfile(undefined, true, false, 'teamAlias'), 'teamAnonymized');
});

test('inferSharingProfile returns teamPseudonymous when shareWithTeam and pseudonymous', () => {
	assert.equal(inferSharingProfile(undefined, true, true, 'pseudonymous'), 'teamPseudonymous');
});

test('inferSharingProfile returns teamIdentified when shareWithTeam and non-pseudonymous identity', () => {
	assert.equal(inferSharingProfile(undefined, true, true, 'entraObjectId'), 'teamIdentified');
	assert.equal(inferSharingProfile(undefined, true, true, 'teamAlias'), 'teamIdentified');
});

// ---------------------------------------------------------------------------
// validateLookbackDays
// ---------------------------------------------------------------------------

test('validateLookbackDays returns valid for in-range values', () => {
	const r1 = validateLookbackDays(1);
	assert.equal(r1.valid, true);
	assert.equal((r1 as { valid: true; data: number }).data, 1);

	const r90 = validateLookbackDays(90);
	assert.equal(r90.valid, true);
	assert.equal((r90 as { valid: true; data: number }).data, 90);

	const r30 = validateLookbackDays(30);
	assert.equal(r30.valid, true);
	assert.equal((r30 as { valid: true; data: number }).data, 30);
});

test('validateLookbackDays returns invalid for values below minimum', () => {
	const r = validateLookbackDays(0);
	assert.equal(r.valid, false);
	assert.ok((r as { valid: false; error: string }).error.length > 0);
});

test('validateLookbackDays returns invalid for values above maximum', () => {
	const r = validateLookbackDays(91);
	assert.equal(r.valid, false);
	assert.ok((r as { valid: false; error: string }).error.length > 0);
});

test('validateLookbackDays returns invalid for non-finite values', () => {
	for (const bad of [NaN, Infinity, -Infinity]) {
		const r = validateLookbackDays(bad);
		assert.equal(r.valid, false, `expected invalid for ${bad}`);
	}
});
