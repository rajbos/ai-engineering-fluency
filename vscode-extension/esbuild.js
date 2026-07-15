const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	// Extension bundle (Node target)
	const extensionCtx = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		// Shared sources in <repo>/src sit outside this package, so make sure
		// bare imports still resolve against this project's node_modules.
		nodePaths: [path.join(__dirname, 'node_modules')],
		logLevel: 'silent',
		// Polyfill import.meta.url so ESM packages that use createRequire(import.meta.url)
		// work correctly when bundled as CJS (esbuild otherwise sets import.meta to {}).
		// The banner defines a __importMetaUrl variable; define wires import.meta.url to it.
		banner: { js: 'var __importMetaUrl = require("url").pathToFileURL(__filename).href;' },
		define: { 'import.meta.url': '__importMetaUrl' },
		plugins: [esbuildProblemMatcherPlugin],
	});

	// Webview bundle(s) (Browser target)
	const webviewCtx = await esbuild.context({
		entryPoints: {
			details: 'src/webview/details/main.ts',
			chart: 'src/webview/chart/main.ts',
			usage: 'src/webview/usage/main.ts',
			diagnostics: 'src/webview/diagnostics/main.ts',
			logviewer: 'src/webview/logviewer/main.ts',
			maturity: 'src/webview/maturity/main.ts',
			dashboard: 'src/webview/dashboard/main.ts',
			'fluency-level-viewer': 'src/webview/fluency-level-viewer/main.ts',				environmental: 'src/webview/environmental/main.ts',		},
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		platform: 'browser',
		target: 'es2020',
		outdir: 'dist/webview',
		entryNames: '[name]',
		external: ['vscode'],
		nodePaths: [path.join(__dirname, 'node_modules')],
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
		loader: { '.css': 'text' },
	});

	if (watch) {
		await Promise.all([extensionCtx.watch(), webviewCtx.watch()]);
	} else {
		await Promise.all([extensionCtx.rebuild(), webviewCtx.rebuild()]);
		await extensionCtx.dispose();
		await webviewCtx.dispose();
	}

	// Copy JSON config files to dist/webview/ so the VS extension can read them as runtime sidecars.
	// These live in the shared <repo>/src folder.
	const jsonConfigFiles = ['tokenEstimators.json', 'modelPricing.json', 'toolNames.json', 'automaticTools.json'];
	const webviewDistDir = path.join(__dirname, 'dist', 'webview');
	fs.mkdirSync(webviewDistDir, { recursive: true });
	for (const file of jsonConfigFiles) {
		const jsonSrc = path.join(__dirname, '..', 'src', file);
		const jsonDst = path.join(webviewDistDir, file);
		if (fs.existsSync(jsonSrc)) {
			fs.copyFileSync(jsonSrc, jsonDst);
		}
	}

	// Copy the codicon font (icon font VS Code itself uses) into dist/webview/codicons/ so
	// webview panels can load it via webview.asWebviewUri() and render `.codicon-*` icons.
	// Placed under dist/webview because most panels restrict localResourceRoots to that folder.
	const codiconsSrcDir = path.join(__dirname, 'node_modules', '@vscode', 'codicons', 'dist');
	const codiconsDstDir = path.join(webviewDistDir, 'codicons');
	if (fs.existsSync(codiconsSrcDir)) {
		fs.mkdirSync(codiconsDstDir, { recursive: true });
		for (const file of ['codicon.css', 'codicon.ttf']) {
			const codiconSrc = path.join(codiconsSrcDir, file);
			const codiconDst = path.join(codiconsDstDir, file);
			if (fs.existsSync(codiconSrc)) {
				fs.copyFileSync(codiconSrc, codiconDst);
			}
		}
	}

	// Copy sql.js WASM file to dist/ for OpenCode SQLite support
	const wasmSrc = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
	const wasmDst = path.join(__dirname, 'dist', 'sql-wasm.wasm');
	if (fs.existsSync(wasmSrc)) {
		fs.mkdirSync(path.dirname(wasmDst), { recursive: true });
		fs.copyFileSync(wasmSrc, wasmDst);
	}

	// Copy vscode-elements bundle to dist/ for webview usage (configPanel loads it at runtime via URI)
	const toolkitDir = path.join(__dirname, 'dist', 'toolkit');
	if (!fs.existsSync(toolkitDir)) {
		fs.mkdirSync(toolkitDir, { recursive: true });
	}
	const src = path.join(__dirname, 'node_modules', '@vscode-elements', 'elements', 'dist', 'bundled.js');
	const dst = path.join(toolkitDir, 'toolkit.js');
	if (fs.existsSync(src)) {
		fs.copyFileSync(src, dst);
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
