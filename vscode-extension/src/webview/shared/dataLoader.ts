/**
 * Typed helper for reading `window.__INITIAL_*__` data injected by the extension host.
 *
 * Usage:
 *   import { getWindowData } from '../shared/dataLoader';
 *   const data = getWindowData<MyType>('__INITIAL_MY_KEY__');
 */
export function getWindowData<T>(key: string): T | undefined {
	if (typeof window === 'undefined') { return undefined; }
	return (window as unknown as Record<string, T | undefined>)[key];
}
