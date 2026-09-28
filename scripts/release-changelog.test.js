#!/usr/bin/env node
'use strict';

/**
 * Unit tests for scripts/release-changelog.js.
 *
 * Run with:  node --test scripts/release-changelog.test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { extractSection, promoteUnreleased } = require('./release-changelog');

const CHANGELOG = [
  '# Change Log',
  '',
  'All notable changes.',
  '',
  '## [Unreleased]',
  '',
  '### Features',
  '- New thing',
  '',
  '## [0.18.1] - 2026-09-21',
  '',
  '### Bug Fixes',
  '- Fixed thing',
  '',
  '## [0.18.0]',
  '',
  '- Older thing',
  '',
].join('\n');

test('promote moves Unreleased entries into a dated version section', () => {
  const result = promoteUnreleased(CHANGELOG, '0.18.2', '2026-09-28');
  assert.equal(result, [
    '# Change Log',
    '',
    'All notable changes.',
    '',
    '## [Unreleased]',
    '',
    '## [0.18.2] - 2026-09-28',
    '',
    '### Features',
    '- New thing',
    '',
    '## [0.18.1] - 2026-09-21',
    '',
    '### Bug Fixes',
    '- Fixed thing',
    '',
    '## [0.18.0]',
    '',
    '- Older thing',
    '',
  ].join('\n'));
});

test('promote refuses an empty Unreleased section', () => {
  const promoted = promoteUnreleased(CHANGELOG, '0.18.2', '2026-09-28');
  assert.throws(() => promoteUnreleased(promoted, '0.18.3', '2026-09-29'), /Unreleased.*empty/);
});

test('promote refuses a version that already has a section', () => {
  assert.throws(() => promoteUnreleased(CHANGELOG, '0.18.1', '2026-09-28'), /already exists/);
});

test('promote refuses a changelog without an Unreleased section', () => {
  assert.throws(() => promoteUnreleased('# Log\n\n## [1.0.0]\n\n- x\n', '1.0.1', '2026-09-28'), /No "## \[Unreleased\]"/);
});

test('promote normalises CRLF input', () => {
  const result = promoteUnreleased(CHANGELOG.replace(/\n/g, '\r\n'), '0.18.2', '2026-09-28');
  assert.ok(!result.includes('\r'));
  assert.ok(result.includes('## [0.18.2] - 2026-09-28\n\n### Features\n- New thing\n'));
});

test('extract returns a dated section body without surrounding blank lines', () => {
  assert.equal(extractSection(CHANGELOG, '0.18.1'), '### Bug Fixes\n- Fixed thing');
});

test('extract handles an undated heading and the last section', () => {
  assert.equal(extractSection(CHANGELOG, '0.18.0'), '- Older thing');
});

test('extract does not match a version that is only a prefix of another', () => {
  assert.throws(() => extractSection(CHANGELOG, '0.18'), /No "## \[0.18\]" section/);
});

test('extract fails for a missing version', () => {
  assert.throws(() => extractSection(CHANGELOG, '0.19.0'), /No "## \[0.19.0\]" section/);
});

test('extract fails for an empty section', () => {
  assert.throws(() => extractSection('## [Unreleased]\n\n## [1.0.0]\n\n', '1.0.0'), /is empty/);
});

test('extract works on the promoted output', () => {
  const promoted = promoteUnreleased(CHANGELOG, '0.18.2', '2026-09-28');
  assert.equal(extractSection(promoted, '0.18.2'), '### Features\n- New thing');
});
