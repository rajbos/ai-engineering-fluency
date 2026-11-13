import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	decodeWslOutput, parseRunningDistros, parsePasswdHomes, listRunningDistros, discoverWslSessionFiles,
	WslScanner, describeWslSessionPath, isWslScanAllowedByEnvironment, setWslScanDisabled, type WslScanFs,
} from '../wslDiscovery';
import { MistralVibeDataAccess, discoverVibeSessionsInRoot, findVibeSandboxRoots } from '../mistralvibe';

const utf16 = (s: string, bom = false): Buffer => Buffer.concat([bom ? Buffer.from([0xff, 0xfe]) : Buffer.alloc(0), Buffer.from(s, 'utf16le')]);
const norm = (p: string): string => p.replace(/\\/g, '/');

test('decodeWslOutput: UTF-16LE with and without BOM, and UTF-8 fallback', () => {
	assert.equal(decodeWslOutput(utf16('Ubuntu\r\nDebian\r\n')), 'Ubuntu\r\nDebian\r\n');
	assert.equal(decodeWslOutput(utf16('Ubuntu\r\n', true)), 'Ubuntu\r\n');
	assert.equal(decodeWslOutput(Buffer.from('Ubuntu\n', 'utf8')), 'Ubuntu\n');
	assert.equal(decodeWslOutput('U\0b\0'), 'Ub');
});

test('parseRunningDistros: parses UTF-16 output, drops docker-desktop, blanks and unsafe names', () => {
	const text = decodeWslOutput(utf16('Ubuntu\r\ndocker-desktop\r\n\r\nDocker-Desktop-Data\r\nDebian-12\r\n..\\evil\r\nUbuntu\r\n'));
	assert.deepEqual(parseRunningDistros(text), ['Ubuntu', 'Debian-12']);
});

test('parsePasswdHomes: only /home/<user> homes', () => {
	const passwd = [
		'root:x:0:0:root:/root:/bin/bash', 'daemon:x:1:1::/usr/sbin:/usr/sbin/nologin',
		'rob:x:1000:1000:Rob,,,:/home/rob:/bin/bash', 'svc:x:1001:1001::/home/svc/app:/bin/sh',
		'# comment', 'broken:line', 'amy:x:1002:1002::/home/amy:/bin/zsh', 'dup:x:1003:1003::/home/rob:/bin/sh',
	].join('\n');
	assert.deepEqual(parsePasswdHomes(passwd), [{ user: 'rob', home: '/home/rob' }, { user: 'amy', home: '/home/amy' }]);
});

test('listRunningDistros: Windows only, silent on failure', async () => {
	let called = 0;
	const run = async (): Promise<Buffer> => { called++; return utf16('Ubuntu\r\n'); };
	assert.deepEqual(await listRunningDistros({ platform: 'linux', runWslList: run }), []);
	assert.equal(called, 0);
	assert.deepEqual(await listRunningDistros({ platform: 'win32', runWslList: run }), ['Ubuntu']);
	assert.deepEqual(await listRunningDistros({ platform: 'win32', runWslList: async () => undefined }), []);
	assert.deepEqual(await listRunningDistros({ platform: 'win32', runWslList: async () => { throw new Error('boom'); } }), []);
});

/** In-memory fs keyed by forward-slash UNC path that records every path it is asked about. */
function fakeFs(files: Record<string, string>): { fsApi: WslScanFs; touched: string[] } {
	const touched: string[] = [];
	const content = new Map(Object.entries(files).map(([k, v]) => [norm(k), v]));
	const keys = [...content.keys()];
	const fsApi: WslScanFs = {
		async readFile(p) {
			touched.push(norm(p));
			const v = content.get(norm(p));
			if (v === undefined) { throw new Error('ENOENT'); }
			return v;
		},
		async readdir(p) {
			touched.push(norm(p));
			const dir = norm(p).replace(/\/$/, '') + '/';
			const names = new Map<string, boolean>();
			for (const k of keys) {
				if (!k.startsWith(dir)) { continue; }
				const rest = k.slice(dir.length).split('/');
				names.set(rest[0], names.get(rest[0]) === true || rest.length > 1);
			}
			if (names.size === 0) { throw new Error('ENOENT'); }
			return [...names].map(([name, isDir]) => ({ name, isDirectory: () => isDir, isFile: () => !isDir }));
		},
		async access(p) {
			touched.push(norm(p));
			if (!content.has(norm(p))) { throw new Error('ENOENT'); }
		},
	};
	return { fsApi, touched };
}

const PASSWD = 'rob:x:1000:1000::/home/rob:/bin/bash\n';
const U = '//wsl.localhost';

test('discovery never touches a UNC path of a stopped distro, and skips docker-desktop', async () => {
	const { fsApi, touched } = fakeFs({
		[`${U}/Ubuntu/etc/passwd`]: PASSWD,
		[`${U}/Ubuntu/home/rob/.claude/projects/p1/s1.jsonl`]: '{}',
		[`${U}/Ubuntu/home/rob/.vibe/sandbox-v2/aoe12345abcd/logs/session/unified/u1/meta.json`]: '{}',
		[`${U}/Debian/etc/passwd`]: PASSWD,
		[`${U}/Debian/home/rob/.claude/projects/p1/s2.jsonl`]: '{}',
		[`${U}/docker-desktop/etc/passwd`]: PASSWD,
	});
	// Debian is installed but stopped: absent from `--list --running`. docker-desktop is running but excluded.
	const files = await discoverWslSessionFiles({
		platform: 'win32', fs: fsApi, runWslList: async () => utf16('Ubuntu\r\ndocker-desktop\r\n'),
	});
	assert.deepEqual(files.map(norm).sort(), [
		`${U}/Ubuntu/home/rob/.claude/projects/p1/s1.jsonl`,
		`${U}/Ubuntu/home/rob/.vibe/sandbox-v2/aoe12345abcd/logs/session/unified/u1/meta.json`,
	]);
	assert.ok(touched.length > 0);
	const stray = touched.filter(p => !p.startsWith(`${U}/Ubuntu/`));
	assert.deepEqual(stray, []);
});

test('no running distros (or not Windows): the filesystem is not touched at all', async () => {
	const { fsApi, touched } = fakeFs({ [`${U}/Ubuntu/etc/passwd`]: PASSWD });
	assert.deepEqual(await discoverWslSessionFiles({ platform: 'win32', fs: fsApi, runWslList: async () => utf16('') }), []);
	assert.deepEqual(await discoverWslSessionFiles({ platform: 'linux', fs: fsApi, runWslList: async () => utf16('Ubuntu\r\n') }), []);
	assert.deepEqual(touched, []);
});

test('WslScanner.unc refuses stopped and excluded distros', () => {
	const s = new WslScanner(['Ubuntu', 'docker-desktop']);
	assert.equal(s.unc('Ubuntu', '/home/rob/.vibe'), '\\\\wsl.localhost\\Ubuntu\\home\\rob\\.vibe');
	assert.throws(() => s.unc('Debian', '/etc/passwd'), /not running/);
	assert.throws(() => s.unc('docker-desktop', '/etc/passwd'), /not running/);
	assert.throws(() => s.unc('Ubuntu', '/home/../etc'), /Invalid/);
});

test('describeWslSessionPath labels distro and AoE session id', () => {
	assert.deepEqual(describeWslSessionPath('\\\\wsl.localhost\\Ubuntu\\home\\rob\\.vibe\\sandbox-v2\\3f9a2c1b-aaaa\\logs\\session\\unified\\x\\meta.json'),
		{ distro: 'Ubuntu', user: 'rob', aoeSessionId: '3f9a2c1b-aaaa', label: 'WSL:Ubuntu · AoE:3f9a2c1b' });
	assert.equal(describeWslSessionPath('//wsl.localhost/Debian/home/amy/.vibe/logs/session/s/meta.json')?.label, 'WSL:Debian');
	assert.equal(describeWslSessionPath('C:\\Users\\rob\\.vibe\\logs\\session\\s\\meta.json'), undefined);
});

test('environment switch: --no-wsl and AI_ENGINEERING_FLUENCY_WSL', () => {
	assert.equal(isWslScanAllowedByEnvironment({}), true);
	assert.equal(isWslScanAllowedByEnvironment({ AI_ENGINEERING_FLUENCY_WSL: '0' }), false);
	assert.equal(isWslScanAllowedByEnvironment({ AI_ENGINEERING_FLUENCY_WSL: 'OFF' }), false);
	assert.equal(isWslScanAllowedByEnvironment({ AI_ENGINEERING_FLUENCY_WSL: '1' }), true);
	setWslScanDisabled(true);
	try { assert.equal(isWslScanAllowedByEnvironment({}), false); } finally { setWslScanDisabled(false); }
});

test('Vibe multi-root: home + AoE sandbox stores, both layouts, VIBE_HOME honoured', async () => {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-home-'));
	const touch = (...parts: string[]): string => {
		const p = path.join(home, ...parts);
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.writeFileSync(p, '{}');
		return p;
	};
	const saved = process.env.VIBE_HOME;
	try {
		const legacy = touch('logs', 'session', 'session_20260101_000000_abcd1234', 'meta.json');
		const sbUnified = touch('sandbox-v2', 'aoe-1', 'logs', 'session', 'unified', 'uuid-1', 'meta.json');
		const sbLegacy = touch('sandbox-v2', 'aoe-2', 'logs', 'session', 'session_20260102_000000_efgh5678', 'meta.json');
		touch('sandbox-v2', 'aoe-3', 'unrelated.txt');
		assert.deepEqual((await findVibeSandboxRoots(home)).map(r => path.basename(r)).sort(), ['aoe-1', 'aoe-2', 'aoe-3']);
		assert.deepEqual(await discoverVibeSessionsInRoot(path.join(home, 'sandbox-v2', 'aoe-1')), [sbUnified]);
		process.env.VIBE_HOME = home;
		const da = new MistralVibeDataAccess();
		assert.deepEqual((await da.discoverSessions()).sort(), [legacy, sbLegacy, sbUnified].sort());
		assert.ok(da.isVibeSessionFile(sbUnified));
		assert.ok(da.isVibeSessionFile('\\\\wsl.localhost\\Ubuntu\\home\\rob\\.vibe\\sandbox-v2\\aoe-1\\logs\\session\\unified\\u\\meta.json'));
		assert.ok(!da.isVibeSessionFile(path.join(home, 'sandbox-v2', 'aoe-1', 'logs', 'other', 'meta.json')));
	} finally {
		if (saved === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = saved; }
		fs.rmSync(home, { recursive: true, force: true });
	}
});
