#!/usr/bin/env node

/**
 * Desktop app headless render check
 *
 * Builds every desktop panel's page with the app's own panel builder
 * (desktop/src/panelPage.ts, the code Electron's main process calls) over a small
 * set of session files, loads each page in headless Chromium and fails on:
 *
 *   - an uncaught script error, a console error or a failed/4xx request;
 *   - an empty `#root` (the bundle threw while rendering, e.g. on a payload field
 *     the desktop does not provide);
 *   - a codicon font that does not load.
 *
 * The app serves a panel's page from `app://panel` and its scripts from
 * `app://static`, two origins; the codicon font has to come from the panel's own
 * origin or the browser blocks it. This script reproduces that split with two local
 * HTTP servers on different ports (neither sends CORS headers, like the `app`
 * scheme), rewriting the page's `app://` URLs, so a page that loads the font from
 * the wrong origin fails here as it does in the app. Two scenarios are rendered,
 * each in the dark and the light theme: a populated history, and no sessions at all
 * (the empty states).
 *
 * The session files are written under a temporary HOME, never the user's own. It
 * lives in a git-ignored desktop/.render-check-<random> folder, not the OS temp directory: the
 * session readers refuse files under the temp directory (src/utils/safeFileRead.ts),
 * which left the "populated" scenario silently empty. The page is rendered with the
 * browser's color scheme set to the page's theme, because the app's --vscode-*
 * tokens switch on prefers-color-scheme, which Electron takes from the OS theme.
 * No editor or Electron window is opened.
 *
 * Needs the built desktop webviews (`pnpm run build` in desktop/) and Playwright
 * (see .github/skills/visual-view-diff/lib/browser.js for how it is found).
 *
 * Usage:
 *   node scripts/validate-desktop-render.js [--panel <id>] [--keep]
 *        [--screenshots <dir>] [--repo-root <dir>] [--now <epoch ms>] [--work <dir>]
 *
 *   --screenshots  also save a full-page PNG of every render into <dir>, named for
 *                  the visual-view-diff report: `desktop-<view>.<theme>.png` for the
 *                  populated scenario, `desktop-<view>--empty.<theme>.png` for the
 *                  empty one. scripts/desktop-visual-diff.js compares these.
 *   --repo-root    render another checkout (its desktop/src/test/renderPanels.ts and
 *                  desktop/dist/webview), e.g. a baseline worktree. Default: this repo.
 *   --now          pin the clock, in Node (the fixture sessions and the payloads) and
 *                  in the page, so two runs a minute apart produce the same pixels.
 *   --work         use this (new or empty) directory for the temporary pages and
 *                  HOME instead of a random one, so file paths shown in a view are
 *                  the same across runs. Removed afterwards unless --keep.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');

const { loadChromium } = require('../.github/skills/visual-view-diff/lib/browser.js');
const { readDesktopViews } = require('./validate-desktop-contract.js');
const { checkSandboxedPreloads } = require('./validate-desktop-preloads.js');

const SCENARIOS = ['populated', 'empty'];
const THEMES = ['dark', 'light'];
const RENDER_TIMEOUT_MS = 15000;
// Same viewport and settle time as the webview visual diff (views.config.json defaults).
const SCREENSHOT_VIEWPORT = { width: 1280, height: 900 };
const SCREENSHOT_SETTLE_MS = 1200;

/** The checkout being rendered: this repo, or the one --repo-root names. */
function checkoutPaths(repoRoot) {
  const desktopDir = path.join(repoRoot, 'desktop');
  return { repoRoot, desktopDir, webviewDist: path.join(desktopDir, 'dist', 'webview') };
}

/** `--name value` from argv; a flag given without a value is an error rather than a silent default. */
function option(argv, name) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) { return undefined; }
  const value = argv[i + 1];
  if (value === undefined || value.startsWith('--')) { throw new Error(`--${name} needs a value`); }
  return value;
}

/** The file name a render's screenshot is saved under (see --screenshots). */
function screenshotName(view, scenario, theme) {
  return `desktop-${view}${scenario === 'populated' ? '' : `--${scenario}`}.${theme}.png`;
}

/**
 * A `--require` preload that pins Date to `now` for the page builder, so the fixture
 * sessions' timestamps and every "today"-relative payload are identical across runs.
 */
function writeClockPreload(dir, now) {
  const file = path.join(dir, 'pin-clock.js');
  fs.writeFileSync(file, [
    "'use strict';",
    `const NOW = ${Number(now)};`,
    'const RealDate = Date;',
    'class PinnedDate extends RealDate {',
    '  constructor(...args) { if (args.length === 0) { super(NOW); } else { super(...args); } }',
    '  static now() { return NOW; }',
    '}',
    'globalThis.Date = PinnedDate;',
    '',
  ].join('\n'));
  return file;
}

const CONTENT_TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf' };

/**
 * Serves `routes` (url path -> { file } to send from disk, or { html } to send as is).
 * No CORS headers: the `app` scheme has CORS disabled too.
 */
function serve(routes) {
  const server = http.createServer((req, res) => {
    const route = routes.get(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!route) {
      res.writeHead(404).end();
      return;
    }
    if (route.html !== undefined) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(route.html);
      return;
    }
    res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(route.file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(route.file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/** Bundles the page-building entry for plain Node. Returns the bundle path. */
function bundleBuilder(tmp, checkout) {
  const { repoRoot, desktopDir } = checkout;
  const entry = path.join(desktopDir, 'src', 'test', 'renderPanels.ts');
  if (!fs.existsSync(entry)) { throw new Error(`${entry} does not exist: this checkout predates the desktop render check`); }
  const esbuild = require(path.join(desktopDir, 'node_modules', 'esbuild'));
  const outfile = path.join(tmp, 'renderPanels.js');
  esbuild.buildSync({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    // Same resolution and loaders as desktop/esbuild.js.
    nodePaths: ['desktop', 'cli', 'vscode-extension'].map((d) => path.join(repoRoot, d, 'node_modules')),
    loader: { '.json': 'json', '.css': 'text' },
    banner: { js: 'var __importMetaUrl = require("url").pathToFileURL(__filename).href;' },
    define: { 'import.meta.url': '__importMetaUrl' },
    logLevel: 'error',
  });
  // The SQLite reader (sql.js) loads its wasm from next to the bundle, as it does in dist/.
  const wasm = path.join(desktopDir, 'dist', 'sql-wasm.wasm');
  if (fs.existsSync(wasm)) { fs.copyFileSync(wasm, path.join(tmp, 'sql-wasm.wasm')); }
  return outfile;
}

/** Writes every scenario's pages under `tmp/<scenario>`; HOME is private to each run. */
function buildPages(tmp, bundle, now) {
  const preload = now === undefined ? [] : ['--require', writeClockPreload(tmp, now)];
  for (const scenario of SCENARIOS) {
    const home = path.join(tmp, `home-${scenario}`);
    fs.mkdirSync(home, { recursive: true });
    const run = spawnSync(process.execPath, [...preload, bundle, path.join(tmp, scenario), scenario], {
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: home,
        USERPROFILE: home,
        APPDATA: path.join(home, 'AppData', 'Roaming'),
        LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
        XDG_CONFIG_HOME: path.join(home, '.config'),
        HERMES_HOME: path.join(home, '.hermes'),
      },
    });
    if (run.status !== 0) {
      throw new Error(`building the ${scenario} pages failed:\n${run.stderr || run.stdout}`);
    }
  }
}

async function renderOne(browser, name, url, { theme, screenshot, now } = {}) {
  const problems = [];
  const context = await browser.newContext({ colorScheme: theme, ...(screenshot ? { viewport: SCREENSHOT_VIEWPORT } : {}) });
  if (now !== undefined) { await context.clock.setFixedTime(now); }
  // What desktop/src/preload.ts exposes to the pages (its postMessage goes to the main process).
  await context.addInitScript(() => {
    window.acquireVsCodeApi = () => ({ postMessage: () => undefined, getState: () => undefined, setState: (s) => s });
  });
  const page = await context.newPage();
  const external = new Set();
  page.on('pageerror', (e) => problems.push(`script error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { problems.push(`console error: ${m.text()}`); } });
  page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()} (${r.failure()?.errorText})`));
  page.on('response', (r) => { if (r.status() >= 400) { problems.push(`HTTP ${r.status()}: ${r.url()}`); } });
  // Nothing outside the two local origins may be fetched.
  await context.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === '127.0.0.1' || u.protocol === 'data:' || u.protocol === 'blob:') { return route.continue(); }
    external.add(u.origin);
    return route.abort('blockedbyclient');
  });
  try {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => (document.getElementById('root')?.children.length ?? 0) > 0, null, { timeout: RENDER_TIMEOUT_MS })
      .catch(() => problems.push('#root stayed empty: the view did not render'));
    // Let async render work and late errors surface.
    await page.waitForTimeout(500);
    const fontLoaded = await page.evaluate(async () => (await document.fonts.load('16px codicon')).length > 0);
    if (!fontLoaded) { problems.push('the codicon font did not load'); }
    if (screenshot) {
      // Charts animate in; give them the same settle time the webview diff does.
      await page.waitForTimeout(SCREENSHOT_SETTLE_MS);
      await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled', caret: 'hide' });
    }
  } catch (e) {
    problems.push(`navigation failed: ${e.message}`);
  } finally {
    await context.close();
  }
  for (const origin of external) { problems.push(`requested an external origin: ${origin}`); }
  return { name, problems: [...new Set(problems)] };
}

/** --work: a fresh or empty directory, never one holding someone else's files. */
function claimWorkDir(dir) {
  const stat = fs.lstatSync(dir, { throwIfNoEntry: false });
  if (stat && (!stat.isDirectory() || fs.readdirSync(dir).length > 0)) {
    throw new Error(`--work ${dir} must be a new or empty directory`);
  }
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function main() {
  const argv = process.argv.slice(2);
  const only = option(argv, 'panel') ?? null;
  const checkout = checkoutPaths(path.resolve(option(argv, 'repo-root') ?? path.join(__dirname, '..')));
  const WEBVIEW_DIST = checkout.webviewDist;
  const screenshotDir = option(argv, 'screenshots');
  const nowArg = option(argv, 'now');
  const now = nowArg === undefined ? undefined : Number(nowArg);
  if (now !== undefined && !Number.isSafeInteger(now)) { throw new Error('--now must be a time in epoch milliseconds'); }
  const workArg = option(argv, 'work');
  const views = readDesktopViews(checkout.desktopDir).filter((v) => !only || v === only);
  if (views.length === 0 || !fs.existsSync(path.join(WEBVIEW_DIST, `${views[0]}.js`))) {
    console.error(`❌ ${WEBVIEW_DIST} has no built webviews (or --panel names no desktop view). Run "pnpm run build" in desktop/ first.`);
    process.exit(1);
  }

  // The sandboxed preloads (validate-desktop-preloads.js) are checked here so CI gates on them
  // with the build it already made. Only for this checkout: a --repo-root baseline is rendered
  // for screenshots and may predate a fix.
  if (!option(argv, 'repo-root')) {
    const preloads = checkSandboxedPreloads(checkout.desktopDir);
    if (preloads.findings.length) {
      for (const f of preloads.findings) { console.error(`❌ ${f}`); }
      process.exit(1);
    }
    console.log(`✅ Sandboxed preloads load and expose their bridge: ${preloads.checked.join('; ') || 'none'}
`);
  }

  if (screenshotDir) { fs.mkdirSync(screenshotDir, { recursive: true }); }

  // Not os.tmpdir(): see the header comment.
  const tmp = workArg ? claimWorkDir(path.resolve(workArg)) : fs.mkdtempSync(path.join(__dirname, '..', 'desktop', '.render-check-'));
  const servers = [];
  try {
    buildPages(tmp, bundleBuilder(tmp, checkout), now);

    const staticRoutes = new Map();
    const panelRoutes = new Map();
    for (const f of fs.readdirSync(WEBVIEW_DIST).filter((n) => n.endsWith('.js'))) {
      staticRoutes.set(`/${f}`, { file: path.join(WEBVIEW_DIST, f) });
    }
    for (const f of ['codicon.css', 'codicon.ttf']) {
      // The app's static origin serves every file of dist/webview too, so a page that links the
      // font from there loads the stylesheet and then has the font blocked cross-origin.
      staticRoutes.set(`/codicons/${f}`, { file: path.join(WEBVIEW_DIST, 'codicons', f) });
      panelRoutes.set(`/assets/codicons/${f}`, { file: path.join(WEBVIEW_DIST, 'codicons', f) });
    }
    const staticServer = await serve(staticRoutes);
    const panelServer = await serve(panelRoutes);
    servers.push(staticServer, panelServer);
    const staticOrigin = `http://127.0.0.1:${staticServer.address().port}`;
    const panelOrigin = `http://127.0.0.1:${panelServer.address().port}`;

    const jobs = [];
    for (const scenario of SCENARIOS) {
      for (const theme of THEMES) {
        for (const view of views) {
          const file = path.join(tmp, scenario, `${view}.${theme}.html`);
          if (!fs.existsSync(file)) { throw new Error(`the page builder did not write ${path.relative(tmp, file)}`); }
          const html = fs.readFileSync(file, 'utf8');
          if (!html.includes('app://static/')) {
            throw new Error(`${view}: the page no longer loads its script from app://static, so this check would not reproduce the app's origins`);
          }
          const route = `/${scenario}/${theme}/${view}`;
          panelRoutes.set(route, { html: html.replaceAll('app://panel', panelOrigin).replaceAll('app://static', staticOrigin) });
          jobs.push({
            name: `${view} (${scenario}, ${theme})`,
            url: panelOrigin + route,
            theme,
            screenshot: screenshotDir ? path.join(screenshotDir, screenshotName(view, scenario, theme)) : undefined,
          });
        }
      }
    }

    const browser = await loadChromium().launch();
    const failures = [];
    try {
      console.log('🖥️  Desktop app headless render\n');
      for (const job of jobs) {
        const result = await renderOne(browser, job.name, job.url, { theme: job.theme, screenshot: job.screenshot, now });
        console.log(`   ${result.problems.length ? '❌' : '✅'} ${result.name}`);
        for (const p of result.problems) { console.log(`        ${p}`); }
        if (result.problems.length) { failures.push(result); }
      }
    } finally {
      await browser.close();
    }
    if (failures.length) {
      console.error(`\n❌ ${failures.length} of ${jobs.length} desktop renders failed.`);
      process.exitCode = 1;
    } else {
      console.log(`\n✅ All ${jobs.length} desktop renders have content and no script errors.`);
    }
  } finally {
    servers.forEach((s) => s.close());
    if (process.argv.includes('--keep')) {
      console.log(`kept ${tmp}`);
    } else {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(`❌ ${e.stack || e.message}`); process.exit(1); });
}

module.exports = { screenshotName };
