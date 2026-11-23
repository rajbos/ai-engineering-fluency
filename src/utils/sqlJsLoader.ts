/**
 * Lazy, retryable sql.js WASM loader shared by the SQLite-backed data-access classes.
 */
import * as fs from 'fs';
import * as path from 'path';
import initSqlJs from 'sql.js';

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;

/** Creates the sql.js module from an optional pre-loaded WASM binary. */
export type SqlJsFactory = (config?: { wasmBinary: ArrayBuffer }) => Promise<SqlJsStatic>;

/**
 * Loads the sql.js module once per owner and caches it.
 *
 * - The resolved module is cached, so later calls return it directly.
 * - Concurrent callers share one in-flight load rather than each starting a WASM init.
 * - A failed load clears the in-flight promise, so a later call can retry.
 *
 * `sql-wasm.wasm` is read from `__dirname` when present. In the bundled builds (VS Code
 * extension, CLI, desktop) `__dirname` is the bundle's output folder, where each build
 * copies the WASM file; otherwise sql.js locates the file itself.
 */
export class SqlJsLoader {
	private _module: SqlJsStatic | null = null;
	private _initPromise: Promise<SqlJsStatic> | null = null;

	constructor(private readonly factory: SqlJsFactory = config => initSqlJs(config)) {}

	load(): Promise<SqlJsStatic> {
		if (this._module) { return Promise.resolve(this._module); }
		if (!this._initPromise) {
			this._initPromise = (async () => {
				const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
				let wasmBinary: Uint8Array | undefined;
				try {
					wasmBinary = await fs.promises.readFile(wasmPath);
				} catch { /* WASM file not present — let sql.js locate it */ }
				const module = await this.factory(wasmBinary ? { wasmBinary: wasmBinary.buffer as ArrayBuffer } : undefined);
				this._module = module;
				return module;
			})().catch(err => {
				this._initPromise = null;
				throw err;
			});
		}
		return this._initPromise;
	}

	/** Forget an in-flight load (on dispose); an already loaded module stays cached. */
	clearPending(): void {
		this._initPromise = null;
	}
}
