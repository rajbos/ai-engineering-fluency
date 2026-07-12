# Devin & Windsurf Session Storage (Shared Cascade Format)

## Summary

Devin's desktop IDE (Cognition Labs) is a direct fork/rebrand of Windsurf, produced after
Cognition acquired the Windsurf/Codeium team. It is **not** a new session-data format —
Devin and Windsurf share the exact same on-disk Cascade trajectory storage, the same
bundled first-party AI extension, and the same gRPC-over-HTTP/1.1 language-server API.

This document exists so future contributors don't accidentally re-derive a "new" schema
for Devin — there isn't one. `src/windsurf.ts` (`WindsurfDataAccess`) is the single data
access layer for both editors; Devin support is a thin labeling layer on top of it.

## Key findings (verified on a live Devin install)

1. **`product.json`** (`resources/app/product.json` inside the Devin install) contains:
   - `"nameShort": "Devin"`, `"nameLong": "Devin"`, `"applicationName": "devin-desktop"`
   - `"dataFolderName": ".devin"`, **`"oldDataFolderName": ".windsurf"`**, `"oldNameShort": "Windsurf"`
   - `vscode.env.appName` when running inside Devin is therefore `"Devin"` (not `"Windsurf"`).

2. **The bundled first-party AI extension is literally the same extension as Windsurf's**:
   `resources/app/extensions/windsurf/package.json` has `"name": "windsurf"`,
   `"publisher": "codeium"` (displayName is "Devin", but the extension id is unchanged:
   `codeium.windsurf`). `vscode.extensions.getExtension('codeium.windsurf')` — used by
   `WindsurfDataAccess`'s credential-capture logic — works unmodified inside Devin.

3. **Cascade trajectory storage is fully shared with Windsurf**: Devin writes its `.pb`
   trajectory files into the exact same `~/.codeium/windsurf/cascade/*.pb` and
   `~/.codeium/windsurf/implicit/*.pb` directories that a real Windsurf install uses.
   There is **no separate Devin-specific session directory**.

4. Devin's own user-data folder (`%APPDATA%\devin`, `~/.devin`) mirrors a standard
   VS-Code-family layout (`User\workspaceStorage\<hash>\state.vscdb`,
   `User\globalStorage\state.vscdb`, `User\History`, etc.) but does **not** contain
   session/chat data — `chat.ChatSessionStore.index`, `agentSessions.model.cache`, and
   `agentSessions.state.cache` were all empty on a live install. A leftover
   `windsurf.devin.settingsMigrationComplete` setting and `windsurfAgentSidebarViewletState`
   key confirm the UI is still internally called "windsurfAgent". **The authoritative
   session data lives in the shared Cascade `.pb` files, not in Devin's own `state.vscdb`.**

5. There is also a separate, currently-unused `%APPDATA%\devin\cli\sessions.db` (SQLite,
   `sessions` / `message_nodes` / `prompt_history` / `tool_call_state` / `rendered_commits`
   / `app_state` tables managed via `refinery_schema_history` migrations) belonging to a
   **Devin CLI** (agent-mode, ACP-based) tool that is separate from the desktop app. It is
   out of scope for this integration — see "Future work" below.

## How the extension attributes sessions

Because the storage is shared, the only way to know which app actually *produced* a
given trajectory is to know which app is *currently running the extension* — the file
itself carries no reliable per-origin signal.

- **Live API discovery** (only possible while the extension is actually loaded inside
  Windsurf or Devin): `WindsurfDataAccess.getHostEditorLabel()` inspects
  `vscode.env.appName` at discovery time and labels newly-discovered sessions
  `editorSource: 'windsurf' | 'devin'`, `editorName: 'Windsurf' | 'Devin'`, using virtual
  path scheme `windsurf://trajectory/{id}` or `devin://trajectory/{id}` respectively.
- **File-based `.pb` fallback discovery** (used when the extension runs in plain VS Code,
  where neither app is present to distinguish origin): sessions are always labeled
  `Windsurf` / `windsurf://trajectory/{id}`, matching prior behavior. **This is a known
  limitation** — a Devin-only trajectory discovered this way will show up as "Windsurf" in
  the session list until/unless a reliable per-file origin signal is found in the `.pb`
  format.
- Once a session's virtual path is decided (either scheme), the rest of the pipeline
  (`resolveSession`, `extractTrajectoryId`, `getFamilyEditorName`, `isWindsurfSessionFile`)
  treats `windsurf://` and `devin://` symmetrically, deriving the on-disk `.pb` path and
  editor label directly from whichever prefix is present.

## Where this lives in code

| Concern | Location |
|---|---|
| Data access (both editors) | `src/windsurf.ts` (`WindsurfDataAccess`) |
| Host-app detection | `isRunningInWindsurf()`, `isRunningInDevin()`, `isRunningInWindsurfFamily()` |
| Session file recognition | `isWindsurfSessionFile()` (matches both `windsurf://` and `devin://` schemes) |
| Path/label detection | `src/workspaceHelpers.ts` (`getEditorTypeFromPath`, `detectEditorSource`, `getEditorNameFromRoot`) |
| Diagnostics candidate path | `src/sessionDiscovery.ts` (`getDiagnosticCandidatePaths`) — labels the shared Cascade folder per current host app |
| Icon | `src/editorIcons.ts` (`EDITOR_ICON_MAP['Devin']`) |

This is a **legacy hand-rolled special case** outside the `IEcosystemAdapter` registry
(`src/adapters/adapterRegistry.ts`), matching how Windsurf itself is integrated — see the
note in `.github/agents/new-editor-support.agent.md` about Windsurf being a pre-existing
exception to the adapter-registry pattern. Devin extends that same special case rather
than introducing a second one, since the underlying mechanism is identical.

## Future work

- **Devin CLI** (`%APPDATA%\devin\cli\sessions.db`) is a distinct, ACP-based agent-mode
  tool with its own SQLite schema. It was empty/unused on the machine this was
  researched on. If it becomes actively used, it should be integrated as its own
  `IEcosystemAdapter` (SQLite-backed, similar to `CrushAdapter`) — it is unrelated to the
  Cascade-sharing described above.
- If a reliable way to distinguish Devin-origin vs. Windsurf-origin `.pb` files without
  live API access is ever found (e.g. a field inside the protobuf payload), the
  file-based fallback discovery could attribute origin correctly instead of always
  defaulting to "Windsurf".