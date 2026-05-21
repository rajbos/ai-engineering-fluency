import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'path';

import {
	fileUriToPath,
	normalizePath,
	splitNormalizedPath,
	toPlatformPath
} from '../../src/utils/pathUtils';

test('normalizePath: converts backslashes to forward slashes', () => {
	assert.equal(normalizePath('C:\\Users\\name\\repo\\file.ts'), 'C:/Users/name/repo/file.ts');
});

test('normalizePath: preserves existing forward slashes', () => {
	assert.equal(normalizePath('/home/user/repo/file.ts'), '/home/user/repo/file.ts');
});

test('toPlatformPath: converts normalized paths to the current platform separator', () => {
	const expected = path.sep === '\\'
		? 'C:\\Users\\name\\repo\\file.ts'
		: 'C:/Users/name/repo/file.ts';

	assert.equal(toPlatformPath('C:/Users/name/repo/file.ts'), expected);
});

test('toPlatformPath: handles mixed separators consistently', () => {
	const expected = path.sep === '\\'
		? 'C:\\Users\\name\\repo\\file.ts'
		: 'C:/Users/name/repo/file.ts';

	assert.equal(toPlatformPath('C:/Users\\name/repo\\file.ts'), expected);
});

test('splitNormalizedPath: returns non-empty normalized path segments', () => {
	assert.deepEqual(splitNormalizedPath('C:\\Users\\name\\repo\\file.ts'), ['C:', 'Users', 'name', 'repo', 'file.ts']);
	assert.deepEqual(splitNormalizedPath('/home/user/repo/file.ts'), ['home', 'user', 'repo', 'file.ts']);
});

test('fileUriToPath: keeps localhost file URIs transparent', () => {
	assert.equal(fileUriToPath('file://localhost/home/user/file.txt'), '/home/user/file.txt');
});
