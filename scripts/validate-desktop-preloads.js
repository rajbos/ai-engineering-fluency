#!/usr/bin/env node

/**
 * Desktop app sandboxed preload check
 *
 * A window created with `webPreferences.sandbox: true` runs its preload in Electron's
 * sandboxed renderer: the script is wrapped as
 *
 *   (function (require, process, Buffer, global, setImmediate, clearImmediate, exports, module) { … })
 *
 * and `require` only resolves `electron`, `events`, `timers` and `url`. There is no
 * `__filename`, `__dirname` or `fs`. A bundle that touches any of those throws on load,
 * Electron logs a `preload-error` nobody sees, the `contextBridge` API is never exposed,
 * and every button in that window does nothing. Nothing fails to compile when that happens:
 * the Team Server window shipped that way because the shared esbuild banner reads
 * `__filename`.
 *
 * This check reads every `new BrowserWindow` in desktop/src/main.ts, and for each preload
 * that runs sandboxed it loads the built desktop/dist/<preload>.js the way Electron does
 * (above, in a fresh V8 context with only those globals) and requires that it:
 *
 *   - runs without throwing;
 *   - exposes at least one API through `contextBridge.exposeInMainWorld`;
 *   - exposes, as a function, every `window.<api>.<member>` the desktop page sources call
 *     (also through an alias such as `const api = window.teamServer; api.load()`).
 *
 * No Electron window is opened. Needs the built desktop app (`pnpm run build` in desktop/).
 * check:render runs it too, so CI gates on it.
 *
 * Usage: node scripts/validate-desktop-preloads.js [--desktop-dir <dir>]
 * Exits 1 on any finding.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/** Modules a sandboxed preload's polyfilled `require` resolves (Electron docs, "Process Sandboxing"). */
const SANDBOX_MODULES = new Set(['electron', 'events', 'timers', 'url']);

/** The `{ … }` object literal that starts at `open` (an index of `{`), by brace matching. */
function objectLiteralAt(source, open) {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') { depth++; }
    else if (source[i] === '}') { depth--; if (depth === 0) { return source.slice(open, i + 1); } }
  }
  return source.slice(open);
}

/** Each BrowserWindow's preload file name and whether it is sandboxed, from main.ts. */
function readWindowPreloads(mainSource) {
  const windows = [];
  const re = /webPreferences\s*:\s*\{/g;
  let m;
  while ((m = re.exec(mainSource))) {
    const prefs = objectLiteralAt(mainSource, m.index + m[0].length - 1);
    const preload = /preload\s*:\s*path\.join\(\s*__dirname\s*,\s*['"]([^'"]+)['"]\s*\)/.exec(prefs);
    if (!preload) { continue; }
    const sandbox = /sandbox\s*:\s*(true|false)/.exec(prefs);
    // Electron's default (since 20) is sandboxed unless nodeIntegration is on.
    const sandboxed = sandbox ? sandbox[1] === 'true' : !/nodeIntegration\s*:\s*true/.test(prefs);
    windows.push({ preload: preload[1], sandboxed });
  }
  return windows;
}

/** Runs a built preload the way Electron's sandboxed renderer does; returns what it exposed. */
function loadSandboxedPreload(code, fileName) {
  const exposed = {};
  const electronStub = {
    contextBridge: { exposeInMainWorld: (key, api) => { exposed[key] = api; } },
    ipcRenderer: { invoke: async () => undefined, on: () => undefined, send: () => undefined, removeListener: () => undefined },
    webFrame: {},
  };
  const sandboxRequire = (name) => {
    if (!SANDBOX_MODULES.has(name)) {
      throw new Error(`module not found: ${name} (a sandboxed preload can only require ${[...SANDBOX_MODULES].join(', ')})`);
    }
    return name === 'electron' ? electronStub : require(name);
  };
  const context = vm.createContext({ console });
  const wrapper = vm.runInContext(
    `(function (require, process, Buffer, global, setImmediate, clearImmediate, exports, module) {\n${code}\n})`,
    context,
    { filename: fileName },
  );
  const module = { exports: {} };
  const processStub = { platform: process.platform, env: {}, versions: process.versions, type: 'renderer', sandboxed: true };
  wrapper(sandboxRequire, processStub, Buffer, context, setImmediate, clearImmediate, module.exports, module);
  return exposed;
}

/** `window.<key>.<member>` calls in the desktop sources, including through `const x = window.<key>`. */
function membersUsed(sources, key) {
  const used = new Set();
  for (const source of sources) {
    if (!source.includes(`window.${key}`)) { continue; }
    const names = [`window\\.${key}`];
    const aliasRe = new RegExp(`(?:const|let|var)\\s+(\\w+)\\s*=\\s*window\\.${key}\\b`, 'g');
    let a;
    while ((a = aliasRe.exec(source))) { names.push(a[1]); }
    for (const name of names) {
      const memberRe = new RegExp(`(?<![\\w.])${name}\\.(\\w+)`, 'g');
      let mm;
      while ((mm = memberRe.exec(source))) { used.add(mm[1]); }
    }
  }
  return used;
}

function checkSandboxedPreloads(desktopDir) {
  const findings = [];
  const srcDir = path.join(desktopDir, 'src');
  const windows = readWindowPreloads(fs.readFileSync(path.join(srcDir, 'main.ts'), 'utf8'));
  const sources = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts')).map((f) => fs.readFileSync(path.join(srcDir, f), 'utf8'));
  const checked = [];
  for (const { preload } of windows.filter((w) => w.sandboxed)) {
    const file = path.join(desktopDir, 'dist', preload);
    if (!fs.existsSync(file)) {
      findings.push(`${preload}: not built (run "pnpm run build" in desktop/ first)`);
      continue;
    }
    let exposed;
    try {
      exposed = loadSandboxedPreload(fs.readFileSync(file, 'utf8'), file);
    } catch (e) {
      findings.push(`${preload}: throws when Electron loads it sandboxed, so its contextBridge API is never exposed: ${e.message}`);
      continue;
    }
    const keys = Object.keys(exposed);
    if (keys.length === 0) {
      findings.push(`${preload}: runs sandboxed but exposes nothing through contextBridge.exposeInMainWorld`);
      continue;
    }
    for (const key of keys) {
      for (const member of membersUsed(sources, key)) {
        if (typeof exposed[key]?.[member] !== 'function') {
          findings.push(`${preload}: the page calls window.${key}.${member}, which the preload does not expose`);
        }
      }
    }
    checked.push(`${preload} (${keys.map((k) => `window.${k}`).join(', ')})`);
  }
  return { findings, checked };
}

function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--desktop-dir');
  const desktopDir = path.resolve(i === -1 ? path.join(__dirname, '..', 'desktop') : argv[i + 1]);
  const { findings, checked } = checkSandboxedPreloads(desktopDir);
  if (findings.length) {
    for (const f of findings) { console.error(`❌ ${f}`); }
    process.exit(1);
  }
  console.log(`✅ Sandboxed preloads load and expose their bridge: ${checked.join('; ') || 'none'}`);
}

if (require.main === module) { main(); }

module.exports = { checkSandboxedPreloads, readWindowPreloads, loadSandboxedPreload, membersUsed };
