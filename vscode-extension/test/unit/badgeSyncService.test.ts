import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { describeFailure, parseDeviceList, syncBadge, syncOverUsb, type CommandResult, type CommandRunner } from '../../src/badge/badgeSyncService';

interface Call { command: string; args: string[]; fileContent?: string }

/** A runner that records calls and answers from a script keyed on the mpremote sub-command. */
function fakeRunner(answers: { devs?: CommandResult; mkdir?: CommandResult; cp?: CommandResult }): { run: CommandRunner; calls: Call[] } {
	const calls: Call[] = [];
	const ok: CommandResult = { code: 0, stdout: '', stderr: '' };
	const run: CommandRunner = async (command, args) => {
		const call: Call = { command, args };
		const cpIndex = args.indexOf('cp');
		if (cpIndex >= 0 && fs.existsSync(args[cpIndex + 1])) {
			call.fileContent = fs.readFileSync(args[cpIndex + 1], 'utf8');
		}
		calls.push(call);
		if (args[0] === 'devs') { return answers.devs ?? ok; }
		if (args.includes('mkdir')) { return answers.mkdir ?? { code: 1, stdout: '', stderr: 'exists' }; }
		return answers.cp ?? ok;
	};
	return { run, calls };
}

// mpremote prints `<port> <serial> <vid:pid> <maker> <product>`; the serial may be `None`.
const BADGE_LINE = 'COM5 E6614C311B123456 2e8a:0003 Pimoroni Tufty 2350';

function tempRoot(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'badge-sync-test-'));
}

test('parseDeviceList: prefers ports with the Raspberry Pi vendor id', () => {
	const output = ['COM3 A1 0403:6001 FTDI Serial', BADGE_LINE, ''].join('\r\n');
	assert.deepEqual(parseDeviceList(output), ['COM5']);
});

test('parseDeviceList: matches the real mpremote 1.29 output of a badge next to a motherboard serial port', () => {
	const output = 'COM3 None 0000:0000 Intel None\nCOM4 5A76B1DB67E35605 2e8a:1101 Microsoft None\n';
	assert.deepEqual(parseDeviceList(output), ['COM4']);
});

test('parseDeviceList: still finds the vendor id when the columns are in the old order', () => {
	assert.deepEqual(parseDeviceList('COM3 0403:6001 A1 FTDI Serial\nCOM5 2e8a:0003 E6614C311B123456 Pimoroni'), ['COM5']);
});

test('describeFailure: keeps the exception line of a Python traceback, not the top of the stack', () => {
	const stderr = [
		'Traceback (most recent call last):',
		'  File "<frozen runpy>", line 203, in _run_module_as_main',
		'  File "C:\\mpremote\\transport_serial.py", line 195, in enter_raw_repl',
		'    raise TransportError("could not enter raw repl")',
		'mpremote.transport.TransportError: could not enter raw repl',
		'',
	].join('\r\n');
	assert.equal(describeFailure({ code: 1, stdout: '', stderr }), 'could not enter raw repl');
	assert.equal(describeFailure({ code: 3, stdout: '', stderr: '' }), 'mpremote exited with code 3');
	assert.equal(describeFailure({ code: 1, stdout: 'cp a :b\nmpremote: no device found', stderr: '' }), 'mpremote: no device found');
});

test('parseDeviceList: keeps every port when none carries the badge vendor id', () => {
	assert.deepEqual(parseDeviceList('/dev/ttyACM0 1234:5678 x y\n/dev/ttyUSB0 1234:5679 x y'), ['/dev/ttyACM0', '/dev/ttyUSB0']);
});

test('parseDeviceList: drops lines that are not a port name, such as option-like text', () => {
	assert.deepEqual(parseDeviceList('--help\n-x 2e8a:0003\n; rm -rf /\n'), []);
});

test('syncOverUsb: copies the payload to /state/fluency.json and removes the temp file', async () => {
	const root = tempRoot();
	const { run, calls } = fakeRunner({ devs: { code: 0, stdout: BADGE_LINE, stderr: '' } });
	const outcome = await syncOverUsb({ run, payloadJson: '{"v":1}', tempRoot: root });

	assert.deepEqual(outcome, { status: 'ok', port: 'COM5', bytes: 7 });
	const cp = calls.find((c) => c.args.includes('cp'))!;
	assert.deepEqual(cp.args.slice(0, 4), ['connect', 'COM5', 'fs', 'cp']);
	assert.equal(cp.args[5], ':/state/fluency.json');
	assert.equal(cp.fileContent, '{"v":1}');
	assert.ok(calls.some((c) => c.args.includes('mkdir') && c.args.includes(':/state')));
	assert.deepEqual(fs.readdirSync(root), [], 'temp directory is cleaned up');
});

test('syncOverUsb: reports a missing mpremote instead of throwing', async () => {
	const run: CommandRunner = async () => ({ code: -1, stdout: '', stderr: '', spawnError: 'ENOENT' });
	assert.deepEqual(await syncOverUsb({ run, payloadJson: '{}', tempRoot: tempRoot() }), { status: 'mpremoteMissing' });
});

test('syncOverUsb: reports no badge when nothing is plugged in', async () => {
	const { run, calls } = fakeRunner({ devs: { code: 0, stdout: '\n', stderr: '' } });
	assert.deepEqual(await syncOverUsb({ run, payloadJson: '{}', tempRoot: tempRoot() }), { status: 'noBadge' });
	assert.equal(calls.length, 1, 'no copy is attempted');
});

test('syncOverUsb: asks the caller to choose when several devices match', async () => {
	const { run } = fakeRunner({ devs: { code: 0, stdout: `${BADGE_LINE}\nCOM7 2e8a:0005 x y z`, stderr: '' } });
	assert.deepEqual(await syncOverUsb({ run, payloadJson: '{}', tempRoot: tempRoot() }), { status: 'multipleBadges', ports: ['COM5', 'COM7'] });
});

test('syncOverUsb: refuses a port name that could be read as an option, and cleans up on a failed copy', async () => {
	const { run: neverRun, calls: neverCalls } = fakeRunner({});
	const refused = await syncOverUsb({ run: neverRun, payloadJson: '{}', port: '--help', tempRoot: tempRoot() });
	assert.equal(refused.status, 'failed');
	assert.equal(neverCalls.length, 0);

	const root = tempRoot();
	const { run } = fakeRunner({ devs: { code: 0, stdout: BADGE_LINE, stderr: '' }, cp: { code: 1, stdout: '', stderr: 'could not enter raw repl' } });
	assert.deepEqual(await syncOverUsb({ run, payloadJson: '{}', tempRoot: root }), { status: 'failed', message: 'could not enter raw repl' });
	assert.deepEqual(fs.readdirSync(root), []);
});

test('syncBadge: returns ok with a timestamp from the injected clock', async () => {
	const { run } = fakeRunner({ devs: { code: 0, stdout: BADGE_LINE, stderr: '' } });
	const result = await syncBadge({
		run,
		buildPayload: async () => '{"v":1}',
		pickPort: async () => undefined,
		now: () => new Date('2026-10-23T19:14:00.000Z'),
		tempRoot: tempRoot(),
	});
	assert.deepEqual(result, { status: 'ok', port: 'COM5', bytes: 7, at: '2026-10-23T19:14:00.000Z' });
});

test('syncBadge: retries with the port the user picked, and cancels when they pick none', async () => {
	const answers = { devs: { code: 0, stdout: `${BADGE_LINE}\nCOM7 2e8a:0005 x y z`, stderr: '' } };
	const picked = fakeRunner(answers);
	const ok = await syncBadge({ run: picked.run, buildPayload: async () => '{}', pickPort: async (ports) => ports[1], tempRoot: tempRoot() });
	assert.equal(ok.status, 'ok');
	assert.ok(picked.calls.some((c) => c.args[0] === 'connect' && c.args[1] === 'COM7' && c.args.includes('cp')));

	const cancelled = await syncBadge({ run: fakeRunner(answers).run, buildPayload: async () => '{}', pickPort: async () => undefined, tempRoot: tempRoot() });
	assert.deepEqual(cancelled, { status: 'cancelled' });
});

test('syncBadge: a payload that cannot be built is a failure and never touches the badge', async () => {
	const { run, calls } = fakeRunner({});
	const result = await syncBadge({ run, buildPayload: async () => { throw new Error('too large'); }, pickPort: async () => undefined });
	assert.deepEqual(result, { status: 'failed', message: 'too large' });
	assert.equal(calls.length, 0);
});
