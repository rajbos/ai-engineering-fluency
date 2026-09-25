import test from 'node:test';
import * as assert from 'node:assert/strict';
import { repoDisplayFromRemote, repoKeyFromRemote, repoKeyFromSlug } from '../../../src/repoKey';

test('repoDisplayFromRemote: HTTPS, SSH, scp-style and git:// remotes reduce to owner/repo', () => {
    assert.equal(repoDisplayFromRemote('https://github.com/Owner/Repo.git'), 'Owner/Repo');
    assert.equal(repoDisplayFromRemote('https://github.com/owner/repo'), 'owner/repo');
    assert.equal(repoDisplayFromRemote('git@github.com:owner/repo.git'), 'owner/repo');
    assert.equal(repoDisplayFromRemote('ssh://git@ghe.example.com/owner/repo.git'), 'owner/repo');
    assert.equal(repoDisplayFromRemote('git://github.com/owner/repo.git/'), 'owner/repo');
});

test('repoDisplayFromRemote: credentials in the URL never reach the label', () => {
    assert.equal(repoDisplayFromRemote('https://user:secret@github.com/owner/repo.git'), 'owner/repo');
    assert.equal(repoDisplayFromRemote('git@github.com:owner/repo.git?token=secret'), 'owner/repo');
    assert.equal(repoDisplayFromRemote('https://github.com/owner/repo#frag'), 'owner/repo');
});

test('repoDisplayFromRemote: empty or unusable input is undefined', () => {
    assert.equal(repoDisplayFromRemote(undefined), undefined);
    assert.equal(repoDisplayFromRemote(''), undefined);
    assert.equal(repoDisplayFromRemote('   '), undefined);
    assert.equal(repoDisplayFromRemote('not-a-remote'), undefined);
    assert.equal(repoDisplayFromRemote('https://github.com/owner/re po'), undefined);
});

test('repoKeyFromRemote and repoKeyFromSlug agree on the lowercase key', () => {
    assert.equal(repoKeyFromRemote('https://github.com/Owner/Repo.git'), 'owner/repo');
    assert.equal(repoKeyFromSlug('Owner/Repo'), 'owner/repo');
    assert.equal(repoKeyFromSlug(' owner/repo '), 'owner/repo');
});

test('repoKeyFromSlug: rejects anything that is not exactly owner/name', () => {
    assert.equal(repoKeyFromSlug(undefined), undefined);
    assert.equal(repoKeyFromSlug('repo'), undefined);
    assert.equal(repoKeyFromSlug('a/b/c'), undefined);
    assert.equal(repoKeyFromSlug('../repo'), undefined);
});
