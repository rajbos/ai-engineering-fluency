/**
 * Shared VS Code mock factories for unit tests.
 *
 * Import these helpers instead of defining inline mock objects in each test
 * file so there is a single, consistent implementation to maintain.
 */

import * as vscode from 'vscode';

/**
 * Creates a lightweight in-memory implementation of `vscode.Memento`.
 * The internal store is exposed as `_store` so tests can inspect or
 * pre-populate state without going through the public API.
 */
export function createMockMemento(): vscode.Memento & { _store: Map<string, unknown> } {
const store = new Map<string, unknown>();
return {
_store: store,
get<T>(key: string, defaultValue?: T): T {
return (store.get(key) ?? defaultValue) as T;
},
update(key: string, value: unknown): Thenable<void> {
store.set(key, value);
return Promise.resolve();
},
keys(): readonly string[] {
return [...store.keys()];
}
};
}

/**
 * Creates a minimal `vscode.ExtensionContext` stub with independent
 * `globalState` and `workspaceState` Memento instances.
 */
export function createMockExtensionContext(): vscode.ExtensionContext {
return {
globalState: createMockMemento(),
workspaceState: createMockMemento()
} as unknown as vscode.ExtensionContext;
}
