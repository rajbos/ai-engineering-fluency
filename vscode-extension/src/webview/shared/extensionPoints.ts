import { registerMessageHandler } from './messageHandler';

interface ExtensionPointButtonData {
  id: string;
  label: string;
}

declare global {
  interface Window {
    __EXTENSION_POINT_BUTTONS__?: ExtensionPointButtonData[];
    __extensionPointButtonsListenerRegistered__?: boolean;
  }
}

/** DOM id used for a button's element, given its extension-point button id. */
function buttonElementId(id: string): string {
  return `ext-point-${id}`;
}

/**
 * Reconciles `.button-row` with the given button list: adds any buttons not yet present, removes
 * any rendered buttons no longer in the list (e.g. the companion extension disposed them), and
 * leaves already-rendered buttons untouched. Idempotent — calling it repeatedly with the same
 * list is a no-op after the first call, so it is safe to invoke on every
 * `extensionPointButtonsUpdated` message without ever duplicating a button.
 */
function renderExtensionPointButtons(
  vscodeApi: { postMessage: (message: unknown) => void },
  buttons: ExtensionPointButtonData[],
): void {
  const buttonRow = document.querySelector('.button-row');
  if (!buttonRow) { return; }

  const desiredIds = new Set(buttons.map((b) => b.id));
  for (const existing of Array.from(buttonRow.querySelectorAll('[id^="ext-point-"]'))) {
    const id = existing.id.slice('ext-point-'.length);
    if (!desiredIds.has(id)) {
      existing.remove();
    }
  }

  for (const btn of buttons) {
    if (document.getElementById(buttonElementId(btn.id))) { continue; }
    const el = document.createElement('vscode-button');
    el.id = buttonElementId(btn.id);
    el.textContent = btn.label;
    el.addEventListener('click', () => {
      vscodeApi.postMessage({ command: 'extensionPointAction', buttonId: btn.id });
    });
    buttonRow.append(el);
  }
}

/**
 * Appends any extension-point buttons to the `.button-row` element and wires
 * their click handlers to post `extensionPointAction` messages back to the host.
 *
 * Also listens for `extensionPointButtonsUpdated` messages so buttons registered or disposed by
 * a companion extension AFTER this panel's HTML was generated still show up or disappear live,
 * rather than only ever reflecting the button list that existed at HTML-generation time (the
 * `window.__EXTENSION_POINT_BUTTONS__` inline bootstrap only ever captures a snapshot).
 *
 * Call this after every render that rebuilds the button row: some panels re-render on every data
 * refresh, but `registerMessageHandler` has no dispose/dedupe of its own, so this function tracks
 * a `window.__extensionPointButtonsListenerRegistered__` flag on the ambient `window` and only
 * registers the listener the first time it is called for a given window — otherwise every
 * refresh would add another `window` listener, leaking handlers and processing each future
 * update once per accumulated listener.
 */
export function wireExtensionPointButtons(
  vscodeApi: { postMessage: (message: unknown) => void },
): void {
  renderExtensionPointButtons(vscodeApi, window.__EXTENSION_POINT_BUTTONS__ ?? []);

  if (window.__extensionPointButtonsListenerRegistered__) { return; }
  window.__extensionPointButtonsListenerRegistered__ = true;

  registerMessageHandler<{ command?: string; buttons?: ExtensionPointButtonData[] }>((message) => {
    if (message?.command === 'extensionPointButtonsUpdated' && Array.isArray(message.buttons)) {
      renderExtensionPointButtons(vscodeApi, message.buttons);
    }
  });
}
