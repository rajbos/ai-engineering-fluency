import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { parsePayload, resolveCli, runFluencyCli } from "../cli.mjs";

/** Fake child_process.spawn: maps a command string to { code, stdout, stderr }. */
function fakeSpawn(responses) {
    const calls = [];
    const spawnImpl = (command, options) => {
        calls.push({ command, options });
        const child = new EventEmitter();
        child.stdout = new PassThrough();
        child.stderr = new PassThrough();
        child.pid = 1;
        child.exitCode = null;
        const response = responses[command];
        queueMicrotask(() => {
            if (!response) {
                child.emit("error", Object.assign(new Error("not found"), { code: "ENOENT" }));
                return;
            }
            child.stdout.end(response.stdout ?? "");
            child.stderr.end(response.stderr ?? "");
            child.exitCode = response.code ?? 0;
            setImmediate(() => child.emit("close", child.exitCode));
        });
        return child;
    };
    return { spawnImpl, calls };
}

test("prefers the global install when it reports a version", async () => {
    const { spawnImpl, calls } = fakeSpawn({ "ai-engineering-fluency --version": { stdout: "0.6.1\n" } });
    assert.deepEqual(await resolveCli({ spawnImpl }), { command: "ai-engineering-fluency", version: "0.6.1", source: "global" });
    assert.equal(calls[0].options.windowsHide, true);
    assert.equal(calls[0].options.shell, true);
});

test("falls back to npx when the global install is missing", async () => {
    const missing = fakeSpawn({ "ai-engineering-fluency --version": { code: 1, stderr: "'ai-engineering-fluency' is not recognized" } });
    assert.equal((await resolveCli({ spawnImpl: missing.spawnImpl })).source, "npx");
    const erroring = fakeSpawn({});
    assert.match((await resolveCli({ spawnImpl: erroring.spawnImpl })).command, /^npx -y @rajbos\/ai-engineering-fluency@latest$/);
});

test("runs `all --json` and parses output with a BOM and leading noise", async () => {
    const { spawnImpl, calls } = fakeSpawn({
        "ai-engineering-fluency --version": { stdout: "0.6.1" },
        "ai-engineering-fluency all --json": { stdout: '\uFEFFnoise\n{"details":{},"chart":{}}' },
    });
    const { payload, cli } = await runFluencyCli({ spawnImpl });
    assert.deepEqual(payload, { details: {}, chart: {} });
    assert.equal(cli.version, "0.6.1");
    assert.equal(calls.at(-1).command, "ai-engineering-fluency all --json");
});

test("reports the last stderr line when the CLI fails", async () => {
    const { spawnImpl } = fakeSpawn({
        "ai-engineering-fluency --version": { stdout: "0.6.1" },
        "ai-engineering-fluency all --json": { code: 2, stderr: "warming up\nSomething broke\n" },
    });
    await assert.rejects(runFluencyCli({ spawnImpl }), /Something broke/);
});

test("parsePayload rejects output without the details section", () => {
    assert.throws(() => parsePayload(""), /no JSON/);
    assert.throws(() => parsePayload('{"other":1}'), /details/);
});
