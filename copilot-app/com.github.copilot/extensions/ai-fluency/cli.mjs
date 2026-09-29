import { spawn } from "node:child_process";
import { homedir } from "node:os";

const PACKAGE = "@rajbos/ai-engineering-fluency";
const GLOBAL_BIN = "ai-engineering-fluency";
const STDERR_TAIL_BYTES = 4096;
export const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;

// Commands are fixed strings (no user input), so running through the shell is
// safe and lets Windows resolve the npm `.cmd` shims.
function run(command, { spawnImpl = spawn, timeoutMs = DEFAULT_TIMEOUT_MS, onSpawn } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawnImpl(command, {
            shell: true,
            windowsHide: true,
            cwd: homedir(),
            env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
        });
        onSpawn?.(child);
        const stdout = [];
        let stderr = "";
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            killTree(child);
        }, timeoutMs);
        child.stdout.on("data", (chunk) => stdout.push(chunk));
        child.stderr.on("data", (chunk) => {
            stderr = (stderr + chunk.toString("utf8")).slice(-STDERR_TAIL_BYTES);
        });
        child.on("error", (error) => {
            clearTimeout(timer);
            reject(error);
        });
        child.on("close", (code) => {
            clearTimeout(timer);
            if (timedOut) {
                reject(new Error(`CLI timed out after ${Math.round(timeoutMs / 60000)} minutes`));
                return;
            }
            resolve({ code, stdout: Buffer.concat(stdout).toString("utf8"), stderr });
        });
    });
}

export function killTree(child) {
    if (!child?.pid || child.exitCode !== null) return;
    if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }).on("error", () => {});
    } else {
        child.kill("SIGTERM");
    }
}

function lastLine(text) {
    return text.trim().split(/\r?\n/).filter(Boolean).at(-1) ?? "";
}

/** Prefer the global install; fall back to npx when it is missing. */
export async function resolveCli(options = {}) {
    try {
        const { code, stdout } = await run(`${GLOBAL_BIN} --version`, { ...options, timeoutMs: 30_000 });
        const version = lastLine(stdout);
        if (code === 0 && /^\d+\.\d+\.\d+/.test(version)) {
            return { command: GLOBAL_BIN, version, source: "global" };
        }
    } catch {
        // fall through to npx
    }
    return { command: `npx -y ${PACKAGE}@latest`, version: null, source: "npx" };
}

export function parsePayload(stdout) {
    const text = stdout.replace(/^\uFEFF/, "").trim();
    const start = text.indexOf("{");
    if (start < 0) throw new Error("CLI returned no JSON output");
    const payload = JSON.parse(text.slice(start));
    if (!payload || typeof payload !== "object" || !("details" in payload)) {
        throw new Error("CLI output is missing the expected 'details' section");
    }
    return payload;
}

/** Runs `all --json` and returns the parsed payload plus which CLI produced it. */
export async function runFluencyCli(options = {}) {
    const cli = await resolveCli(options);
    const { code, stdout, stderr } = await run(`${cli.command} all --json`, options);
    if (code !== 0) {
        const detail = lastLine(stderr) || `exit code ${code}`;
        throw new Error(`ai-engineering-fluency failed: ${detail}`);
    }
    return { payload: parsePayload(stdout), cli };
}
