import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'path';

import {
	fileUriToPath,
	hasWindowsDriveSegment,
	normalizePath,
	normalizePathForDedup,
	splitNormalizedPath,
	stripWindowsDriveUriPrefix,
	toPlatformPath
} from '../../src/utils/pathUtils';

// normalizePath tests
test('normalizePath: converts backslashes to forward slashes', () => {
	assert.equal(normalizePath('C:/Users/name/repo/file.ts'), 'C:/Users/name/repo/file.ts');
});

test('normalizePath: preserves existing forward slashes', () => {
	assert.equal(normalizePath('/home/user/repo/file.ts'), '/home/user/repo/file.ts');
});

test('normalizePath: handles empty string', () => {
	assert.equal(normalizePath(''), '');
});

// toPlatformPath tests
test('toPlatformPath: converts normalized paths', () => {
	const result = toPlatformPath('C:/Users/name/repo/file.ts');
	assert.ok(result.includes('Users'));
});

// splitNormalizedPath tests
test('splitNormalizedPath: returns segments', () => {
	assert.deepEqual(splitNormalizedPath('C:/Users/name/repo/file.ts'), ['C:', 'Users', 'name', 'repo', 'file.ts']);
	assert.deepEqual(splitNormalizedPath('/home/user/repo/file.ts'), ['home', 'user', 'repo', 'file.ts']);
});

// fileUriToPath tests - Branch coverage
test('fileUriToPath: keeps localhost URIs transparent', () => {
	assert.equal(fileUriToPath('file://localhost/home/user/file.txt'), '/home/user/file.txt');
});

test('fileUriToPath: handles standard file URI', () => {
	assert.equal(fileUriToPath('file:///home/user/file.txt'), '/home/user/file.txt');
});

test('fileUriToPath: returns non-file strings unchanged', () => {
	assert.equal(fileUriToPath('not-a-file-uri'), 'not-a-file-uri');
});

test('fileUriToPath: returns empty string unchanged', () => {
	assert.equal(fileUriToPath(''), '');
});

test('fileUriToPath: handles http URI unchanged', () => {
	assert.equal(fileUriToPath('http://example.com/file.txt'), 'http://example.com/file.txt');
});

// normalizePathForDedup - Branch coverage
test('normalizePathForDedup: on linux preserves case', () => {
	assert.equal(normalizePathForDedup('C:/Users/Foo', 'linux'), 'C:/Users/Foo');
});

test('normalizePathForDedup: on win32 lower-cases', () => {
	assert.equal(normalizePathForDedup('C:/Users/Foo', 'win32'), 'c:/users/foo');
});

test('normalizePathForDedup: on darwin lower-cases', () => {
	assert.equal(normalizePathForDedup('/Users/Foo/Bar', 'darwin'), '/users/foo/bar');
});

test('normalizePathForDedup: on freebsd lower-cases', () => {
	assert.equal(normalizePathForDedup('/Users/Foo', 'freebsd'), '/users/foo');
});

// stripWindowsDriveUriPrefix - Branch coverage
test('stripWindowsDriveUriPrefix: on win32 strips leading slash from drive URI', () => {
	assert.equal(stripWindowsDriveUriPrefix('/C:/repo/file.ts', 'win32'), 'C:/repo/file.ts');
});

test('stripWindowsDriveUriPrefix: on win32 strips leading slash from lowercase drive URI', () => {
	assert.equal(stripWindowsDriveUriPrefix('/c:/repo/file.ts', 'win32'), 'c:/repo/file.ts');
});

test('stripWindowsDriveUriPrefix: on linux returns path unchanged', () => {
	assert.equal(stripWindowsDriveUriPrefix('/C:/repo/file.ts', 'linux'), '/C:/repo/file.ts');
});

test('stripWindowsDriveUriPrefix: on win32 returns non-drive path unchanged', () => {
	assert.equal(stripWindowsDriveUriPrefix('/home/user/file.ts', 'win32'), '/home/user/file.ts');
});

test('stripWindowsDriveUriPrefix: on win32 returns path without leading slash unchanged', () => {
	assert.equal(stripWindowsDriveUriPrefix('C:/repo/file.ts', 'win32'), 'C:/repo/file.ts');
});

// hasWindowsDriveSegment - Branch coverage
test('hasWindowsDriveSegment: on win32 returns true for drive letter segment', () => {
	assert.equal(hasWindowsDriveSegment('C:', 'win32'), true);
});

test('hasWindowsDriveSegment: on win32 returns true for lowercase drive letter', () => {
	assert.equal(hasWindowsDriveSegment('c:', 'win32'), true);
});

test('hasWindowsDriveSegment: on linux returns false for drive letter segment', () => {
	assert.equal(hasWindowsDriveSegment('C:', 'linux'), false);
});

test('hasWindowsDriveSegment: on win32 returns false for non-drive segment', () => {
	assert.equal(hasWindowsDriveSegment('Users', 'win32'), false);
});

test('hasWindowsDriveSegment: on win32 returns false for undefined segment', () => {
	assert.equal(hasWindowsDriveSegment(undefined, 'win32'), false);
});
