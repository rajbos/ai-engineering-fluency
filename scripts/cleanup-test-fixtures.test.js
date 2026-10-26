'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { cleanupTestFixtures } = require('./cleanup-test-fixtures');

test('previews and removes only recognized fixture directories, including pi-test', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-fixtures-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const fixtures = ['ctt-snapshot-test-Ab12Cd', 'ctt-snapshot-Ef34Gh', 'pi-test-Ij56Kl'];
  const preserved = ['src', 'pi-test-important', 'ctt-snapshot-test-custom-data', 'other-Ab12Cd'];
  for (const name of [...fixtures, ...preserved]) {
    const dir = path.join(root, name);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'fixture.json'), '{}');
  }
  fs.writeFileSync(path.join(root, 'pi-test-Mn78Op'), 'not a directory');
  fs.mkdirSync(path.join(root, 'pi-test-Qr90St', '.git'), { recursive: true });
  fs.mkdirSync(path.join(root, 'ctt-snapshot-test-Uv12Wx'));
  fs.writeFileSync(path.join(root, 'ctt-snapshot-test-Uv12Wx', '.git'), 'gitdir: elsewhere');

  assert.deepEqual(cleanupTestFixtures(root).map(dir => path.basename(dir)).sort(), [...fixtures].sort());
  for (const name of fixtures) {
    assert.ok(fs.existsSync(path.join(root, name)), 'dry run must not delete fixtures');
  }
  assert.equal(cleanupTestFixtures(root, true).length, fixtures.length);
  for (const name of fixtures) {
    assert.equal(fs.existsSync(path.join(root, name)), false);
  }
  for (const name of [...preserved, 'pi-test-Mn78Op', 'pi-test-Qr90St', 'ctt-snapshot-test-Uv12Wx']) {
    assert.ok(fs.existsSync(path.join(root, name)), 'unrelated files and repositories must remain');
  }
  assert.deepEqual(cleanupTestFixtures(root, true), []);
});

test('does not delete directory links or their targets', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-fixtures-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const target = path.join(root, 'preserved');
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, 'keep.txt'), 'keep');
  const link = path.join(root, 'pi-test-Ab12Cd');
  fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');

  assert.deepEqual(cleanupTestFixtures(root, true), []);
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(target, 'keep.txt'), 'utf8'), 'keep');
});
