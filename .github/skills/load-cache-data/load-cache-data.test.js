const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const scriptPath = path.join(__dirname, 'load-cache-data.js');
const extensionId = 'robbos.copilot-token-tracker';

function createFixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'load-cache-data-test-'));
    const home = path.join(root, 'home');
    const config = path.join(root, 'config');
    const temp = path.join(root, 'temp');
    const cwd = path.join(root, 'cwd');
    for (const directory of [home, config, temp, cwd]) {
        fs.mkdirSync(directory, { recursive: true });
    }

    let storage;
    if (process.platform === 'win32') {
        storage = path.join(root, 'appdata', 'Code', 'User', 'globalStorage', extensionId);
    } else if (process.platform === 'darwin') {
        storage = path.join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', extensionId);
    } else {
        storage = path.join(config, 'Code', 'User', 'globalStorage', extensionId);
    }
    fs.mkdirSync(storage, { recursive: true });

    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    return {
        root,
        home,
        config,
        temp,
        cwd,
        storage,
        run(args = []) {
            const env = {
                ...process.env,
                HOME: home,
                XDG_CONFIG_HOME: config,
                APPDATA: path.join(root, 'appdata'),
                TMPDIR: temp,
                TMP: temp,
                TEMP: temp
            };
            return spawnSync(process.execPath, [scriptPath, ...args], {
                cwd,
                env,
                encoding: 'utf8'
            });
        }
    };
}

test('default output removes session-identifying fields and anonymizes paths', (t) => {
    const fixture = createFixture(t);
    const sessionPath = path.join(fixture.home, 'private-workspace', 'session.jsonl');
    const cache = {
        [sessionPath]: {
            tokens: 42,
            interactions: 3,
            mtime: 123,
            title: 'private-prompt-sentinel',
            workspaceFolderPath: path.join(fixture.home, 'private-workspace'),
            repository: 'REMOTE_URL_WITH_USERINFO_PRIVATE_REPO',
            unknownPromptField: 'future-sensitive-sentinel',
            usageAnalysis: {
                firstUserPrompt: 'nested-prompt-sentinel',
                correctionMoments: [{
                    type: 'user-correction',
                    snippet: 'correction-snippet-sentinel',
                    file: 'correction-file-path-sentinel'
                }],
                contextReferences: { file: 5, byPath: { 'context-path-sentinel.ts': 2 } }
            }
        }
    };
    fs.writeFileSync(path.join(fixture.storage, 'session-cache.json'), JSON.stringify(cache));

    const result = fixture.run(['--json']);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(Object.keys(output.entries), ['session-1']);
    assert.equal(output.entries['session-1'].tokens, 42);
    assert.equal(output.entries['session-1'].interactions, 3);
    assert.deepEqual(output.entries['session-1'].usageAnalysis.contextReferences, { file: 5 });
    assert.deepEqual(output.entries['session-1'].usageAnalysis.correctionMoments, [{
        type: 'user-correction'
    }]);
    assert.equal('cacheFile' in output, false);

    for (const sentinel of [
        'private-prompt-sentinel',
        'private-workspace',
        'REMOTE_URL_WITH_USERINFO_PRIVATE_REPO',
        'future-sensitive-sentinel',
        'nested-prompt-sentinel',
        'correction-snippet-sentinel',
        'correction-file-path-sentinel',
        'context-path-sentinel',
        sessionPath
    ]) {
        assert.equal(result.stdout.includes(sentinel), false, `output leaked ${sentinel}`);
    }
});

test('--include-sensitive opts in to full entries and their paths', (t) => {
    const fixture = createFixture(t);
    const sessionPath = path.join(fixture.home, 'workspace', 'session.jsonl');
    const entry = {
        tokens: 7,
        title: 'explicit-title',
        workspaceFolderPath: path.join(fixture.home, 'workspace'),
        repository: 'REMOTE_URL_WITH_USERINFO'
    };
    fs.writeFileSync(path.join(fixture.storage, 'session-cache.json'), JSON.stringify({ [sessionPath]: entry }));

    const result = fixture.run(['--include-sensitive', '--json']);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.cacheFile, path.join(fixture.storage, 'session-cache.json'));
    assert.deepEqual(output.entries[sessionPath], entry);
});

test('--include-sensitive still strips credentials from repository URLs', (t) => {
    const fixture = createFixture(t);
    const sessionPath = path.join(fixture.home, 'workspace', 'session.jsonl');
    fs.writeFileSync(path.join(fixture.storage, 'session-cache.json'), JSON.stringify({
        [sessionPath]: { tokens: 1, repository: 'https://user:token-sentinel@github.com/owner/repo.git' }
    }));

    const result = fixture.run(['--include-sensitive', '--json']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.includes('token-sentinel'), false);
    assert.equal(JSON.parse(result.stdout).entries[sessionPath].repository, 'https://github.com/owner/repo.git');
});

test('finds the cache under the current extension id', (t) => {
    const fixture = createFixture(t);
    const currentStorage = path.join(path.dirname(fixture.storage), 'robbos.ai-engineering-fluency');
    fs.mkdirSync(currentStorage, { recursive: true });
    fs.writeFileSync(path.join(currentStorage, 'session-cache.json'), JSON.stringify({ a: { tokens: 3, mtime: 1 } }));

    const result = fixture.run(['--json']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).entries['session-1'].tokens, 3);
});

test('ignores cache files planted in temporary and current-working directories', (t) => {
    const fixture = createFixture(t);
    for (const [directory, fileName] of [
        [fixture.temp, 'session-cache.json'],
        [fixture.temp, 'copilot-token-tracker-cache.json'],
        [fixture.cwd, 'session-cache.json'],
        [fixture.cwd, 'cache-export.json']
    ]) {
        fs.writeFileSync(path.join(directory, fileName), JSON.stringify({ planted: { tokens: 999 } }));
    }

    const result = fixture.run();
    assert.equal(result.status, 1);
    assert.deepEqual(JSON.parse(result.stdout), {
        cacheFound: false,
        error: 'No cache file found'
    });
});

test('--last caps results at 100 and rejects invalid values', (t) => {
    const fixture = createFixture(t);
    const cache = Object.fromEntries(Array.from({ length: 150 }, (_, index) => [
        path.join(fixture.home, `session-${index}.jsonl`),
        { tokens: index, mtime: index }
    ]));
    fs.writeFileSync(path.join(fixture.storage, 'session-cache.json'), JSON.stringify(cache));

    const capped = fixture.run(['--last', '99999', '--json']);
    assert.equal(capped.status, 0, capped.stderr);
    const output = JSON.parse(capped.stdout);
    assert.equal(output.requestedCount, 100);
    assert.equal(Object.keys(output.entries).length, 100);

    const oversized = fixture.run(['--last', '9'.repeat(400), '--json']);
    assert.equal(oversized.status, 0, oversized.stderr);
    assert.equal(JSON.parse(oversized.stdout).requestedCount, 100);

    for (const invalid of ['0', '-1', '1.5', 'abc']) {
        const result = fixture.run(['--last', invalid]);
        assert.equal(result.status, 2, `expected --last ${invalid} to fail`);
    }
});
