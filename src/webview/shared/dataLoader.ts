/**
 * Typed helper for reading `window.__INITIAL_*__` data injected by the extension host.
 *
 * Usage:
 *   import { getWindowData } from './dataLoader';
 *   const data = getWindowData<MyType>('__INITIAL_MY_KEY__');
 */
export function getWindowData<T>(key: string): T | undefined {
	// Accessed via globalThis so this shared module also typechecks in the CLI,
	// which compiles without the DOM lib.
	const win = (globalThis as unknown as { window?: Record<string, T | undefined> }).window;
	return win ? win[key] : undefined;
}
