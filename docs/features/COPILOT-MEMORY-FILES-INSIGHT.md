# Copilot Memory Files Insight (Proposal)

Status: **Draft / not implemented**

## Background

GitHub Copilot's agent (`GitHub.copilot-chat`) writes its own Markdown "memory"
notes to disk as it works — project conventions, decisions, gotchas, scratch
plans. There is no built-in VS Code UI for these; the community extension
[jlieuw/memowl](https://github.com/jlieuw/memowl) fills that gap by browsing
them in a sidebar.

Investigating memowl's source (`README.md`, `src/memoryStore.ts`) confirmed the
on-disk layout and a local scan of this machine confirmed **real memory data
exists** for several projects. This doc proposes surfacing the same data as a
lightweight insight in this extension, since we already resolve the same
`workspaceStorage/<hash>` paths for session parsing.

## On-disk layout (verified)

```
<User>/globalStorage/GitHub.copilot-chat/memory-tool/memories/                <- User (global) scope
<User>/workspaceStorage/<hash>/GitHub.copilot-chat/memory-tool/memories/
    repo/<name>.md                                                             <- Repository scope (literal "repo" folder)
    <base64(sessionId)>/<name>.md                                              <- Session scope (folder name is the
                                                                                    base64-encoded chat session UUID,
                                                                                    NOT a literal "session" folder —
                                                                                    this diverges from memowl's README
                                                                                    wording and must be handled explicitly)
```

The session-scope folder name decodes (base64) to the same session UUID used
in `workspaceStorage/<hash>/chatSessions/<sessionId>.jsonl`, so a memory file
can be correlated back to the specific chat session that created it.

Confirmed present on this machine, across VS Code + Insiders, for 4 of 8
scanned `workspaceStorage` hashes (repo-scope and session-scope both observed);
no `globalStorage` (user-scope) memories were present.

## Reusable code in this repo

`vscode-extension/src/backend/services/utilityService.ts` already:
- `extractWorkspaceIdFromSessionPath()` — pulls the `<hash>` out of any path
  under `workspaceStorage/<hash>/...`.
- `tryResolveWorkspaceNameFromSessionPath()` — reads that hash's
  `workspace.json`/`meta.json` to recover the real folder path.

Both can be reused as-is to map a memory file's hash back to a friendly
workspace name, avoiding re-implementing memowl's hash-mapping logic.

## Proposed insight: "Memory Files"

A new read-only panel/tab (or a card in an existing insights view) showing,
per known workspace:

| Metric | Source |
|---|---|
| # repo-scope memory files | count of `.md` under `memories/repo/` |
| # session-scope memory files | count of `.md` under base64 session folders |
| Staleness | newest/oldest `mtime` per file |
| Size | file size, flagged if unusually large (e.g. the observed 20KB file) |
| Linked session | decode session-folder name → cross-reference existing chat-session parsing, if the session log is also ingested |

No content of the memory files themselves would be surfaced beyond title/first
line — this is metadata/insight only, not a memory browser (memowl already
does that well). Scope is intentionally narrow: help users notice **memory
files piling up, going stale, or growing unexpectedly large**, as a hygiene
signal, not to duplicate memowl's read/manage UI.

## Open questions before implementation

1. Which surface should host this — a new webview tab, or a card inside an
   existing view (e.g. alongside session/worktree insights)?
2. Should this only scan the *current* workspace's memory folder, or all
   `workspaceStorage` hashes on the machine (like memowl and like this repo's
   existing multi-workspace session scanning)?
3. Any privacy concern with reading memory file *names*/*first lines* (which
   may contain repo-specific info) versus counts/sizes only?

## Next step

Get sign-off on scope/questions above, then implement as a small, isolated
module (mirroring `utilityService.ts` conventions) with unit tests using a
temporary fixture directory tree — no reliance on real user data in tests.
