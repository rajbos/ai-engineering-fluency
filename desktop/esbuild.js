const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const production = process.argv.includes('--production');
const watchMode = process.argv.includes('--watch');

async function main() {
  const distDir = path.join(__dirname, 'dist');
  const webviewDir = path.join(distDir, 'webview');
  fs.mkdirSync(webviewDir, { recursive: true });

  // Shared esbuild options for Node.js targets (main + preload)
  const sharedNodeOptions = {
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    minify: production,
    sourcemap: !production,
    alias: {
      vscode: path.join(__dirname, '..', 'cli', 'src', 'vscode-stub.ts'),
    },
    external: ['electron', 'electron-updater'],
    nodePaths: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, '..', 'cli', 'node_modules'),
      path.join(__dirname, '..', 'vscode-extension', 'node_modules'),
    ],
    loader: { '.json': 'json' },
    banner: { js: 'var __importMetaUrl = require("url").pathToFileURL(__filename).href;' },
    define: { 'import.meta.url': '__importMetaUrl' },
    logLevel: 'info',
  };

  copyStaticAssets(distDir, webviewDir);

  if (!watchMode) {
    await Promise.all([
      esbuild.build({ ...sharedNodeOptions, entryPoints: ['src/main.ts'], outfile: 'dist/main.js' }),
      esbuild.build({ ...sharedNodeOptions, entryPoints: ['src/preload.ts'], outfile: 'dist/preload.js' }),
    ]);
    console.log(`Desktop built (${production ? 'production' : 'development'})`);
    return;
  }

  // Watch mode: rebuild on change, restart electron after each successful build
  let electronProcess = null;
  let restartTimer = null;

  async function killElectron() {
    if (!electronProcess) { return; }
    const proc = electronProcess;
    electronProcess = null;
    if (process.platform === 'win32' && proc.pid) {
      // Kill the entire process tree (renderer + GPU helper processes)
      spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
      await new Promise(r => proc.once('close', r));
    } else {
      proc.kill();
      await new Promise(r => proc.once('close', r));
    }
  }

  function scheduleRestart() {
    // Debounce: both main+preload contexts fire onEnd; only restart once
    if (restartTimer) { clearTimeout(restartTimer); }
    restartTimer = setTimeout(async () => {
      restartTimer = null;
      await killElectron();
      const electronBin = require('electron');
      electronProcess = spawn(String(electronBin), ['.'], { stdio: 'inherit', windowsHide: false });
      electronProcess.on('close', () => { electronProcess = null; });
    }, 300);
  }

  const rebuildPlugin = {
    name: 'restart-on-rebuild',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length === 0) {
          scheduleRestart();
        } else {
          console.error('[watch] build errors — not restarting');
        }
      });
    },
  };

  const [mainCtx, preloadCtx] = await Promise.all([
    esbuild.context({ ...sharedNodeOptions, entryPoints: ['src/main.ts'], outfile: 'dist/main.js', plugins: [rebuildPlugin] }),
    esbuild.context({ ...sharedNodeOptions, entryPoints: ['src/preload.ts'], outfile: 'dist/preload.js', plugins: [rebuildPlugin] }),
  ]);

  await Promise.all([mainCtx.watch(), preloadCtx.watch()]);
  console.log('[watch] watching src/ for changes — Ctrl+C to stop');
}

function copyStaticAssets(distDir, webviewDir) {
  const extWebviewDir = path.join(__dirname, '..', 'vscode-extension', 'dist', 'webview');
  for (const bundle of [
    'details.js', 'environmental.js', 'chart.js', 'usage.js',
    'diagnostics.js', 'maturity.js', 'fluency-level-viewer.js',
  ]) {
    const src = path.join(extWebviewDir, bundle);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(webviewDir, bundle));
      console.log(`Copied ${bundle}`);
    } else {
      console.warn(`Warning: ${src} not found — run the vscode-extension build first`);
    }
  }

  const toolkitSrc = path.join(__dirname, '..', 'vscode-extension', 'dist', 'toolkit', 'toolkit.js');
  if (fs.existsSync(toolkitSrc)) {
    fs.copyFileSync(toolkitSrc, path.join(webviewDir, 'toolkit.js'));
    console.log('Copied toolkit.js');
  } else {
    console.warn('Warning: toolkit.js not found — run the vscode-extension build first');
  }

  const wasmSrc = fs.existsSync(path.join(__dirname, '..', 'cli', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'))
    ? path.join(__dirname, '..', 'cli', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
    : path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  if (fs.existsSync(wasmSrc)) {
    fs.copyFileSync(wasmSrc, path.join(distDir, 'sql-wasm.wasm'));
    console.log('Copied sql-wasm.wasm');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
