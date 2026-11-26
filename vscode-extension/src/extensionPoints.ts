import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ExclusiveRunner } from './analysis/exclusiveRunner';

/**
 * A button contribution registered via the extension points API.
 */
export interface ExtensionPointButton {
  /** Stable unique identifier for this button. Used to route click events. */
  readonly id: string;
  /** Display label shown in the button. */
  readonly label: string;
}

/**
 * Public API exported by the AI Engineering Fluency extension.
 * Companion extensions can acquire this via `vscode.extensions.getExtension(...).exports`.
 */
export interface AiFluencyExtensionApi {
  /**
   * Register a button to appear in the navigation toolbar of all webview panels.
   * The handler is called when the user clicks the button.
   * Returns a Disposable; call dispose() to remove the button.
   */
  registerButton(button: ExtensionPointButton, handler: () => void | Promise<void>): { dispose(): void };
  /**
   * Open an existing JSON/JSONL session in the session viewer.
   * Requires an absolute filesystem path recovered by the caller's session scanner.
   * Resolves after loading and rendering; rejects invalid paths and viewer failures.
   */
  openSessionLog(sessionFilePath: string): Promise<void>;
}

/** Forgiving parsers can return no turns on failure; the public API must not report success. */
export function assertViewableSessionTurns(turns: readonly unknown[], strict: boolean): void {
  if (strict && turns.length === 0) { throw new Error('Session contains no viewable chat turns.'); }
}

/** Bind the companion API without using webview dispatch, which swallows failures. */
export function createExtensionApi(tracker: {
  registerExtensionPointButton: AiFluencyExtensionApi['registerButton'];
  showLogViewer(sessionFilePath: string, focusedTurnNumber?: number, strict?: boolean): Promise<void>;
}): AiFluencyExtensionApi {
  const viewerRunner = new ExclusiveRunner();
  return {
    registerButton: (button, handler) => tracker.registerExtensionPointButton(button, handler),
    openSessionLog: async (sessionFilePath) => {
      if (typeof sessionFilePath !== 'string' || !sessionFilePath.trim() ||
          sessionFilePath.includes('\0') || !path.isAbsolute(sessionFilePath)) {
        throw new TypeError('openSessionLog requires an absolute session file path.');
      }
      if (!['.json', '.jsonl'].includes(path.extname(sessionFilePath).toLowerCase())) {
        throw new TypeError('openSessionLog supports JSON and JSONL session files only.');
      }
      await viewerRunner.run(async () => {
        if (!(await fs.stat(sessionFilePath)).isFile()) {
          throw new TypeError('openSessionLog requires a regular session file.');
        }
        await tracker.showLogViewer(sessionFilePath, undefined, true);
      });
    },
  };
}
