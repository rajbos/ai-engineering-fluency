---
name: validate-app-db-schema
description: Validate that ~/.copilot/data.db has the required schema for session hierarchy (workspace_parent_links, workspaces, sessions tables and columns). Runs an actual today's-data query so schema regressions are caught early. Use when data.db schema changes may have broken hierarchy enrichment, or on a periodic schedule to detect breaking changes.
---

# Validate App DB Schema Skill

Validates that the Copilot app's `~/.copilot/data.db` still exposes the tables and columns that the extension's **session hierarchy** feature depends on.

## Background

The session hierarchy feature reads parent/child workspace relationships from `data.db` — a private Copilot app database that is **not part of any public API**. Its schema can change without notice when the app is updated.

This skill:
1. Checks that the required tables and columns exist
2. Runs an actual data query (today's parent/child links) to confirm reads work end-to-end
3. Reports a clear PASS / FAIL with details so CI or a periodic workflow can surface regressions early

## What We Depend On

| Table | Required columns |
|---|---|
| `workspace_parent_links` | `child_workspace_id`, `parent_workspace_id`, `creator_session_id`, `created_at` |
| `workspaces` | `id`, `session_id`, `name`, `updated_at` |
| `sessions` | `id`, `title`, `created_at`, `updated_at` |

The join that the extension uses (simplified):
```sql
SELECT cw.session_id, cw.name, pw.session_id, pw.name
FROM workspace_parent_links l
JOIN workspaces cw ON cw.id = l.child_workspace_id
JOIN workspaces pw ON pw.id = l.parent_workspace_id
WHERE cw.session_id IN (...)
   OR pw.session_id IN (...)
```

## Usage

```bash
# Basic validation — exits 0 on pass, 1 on fail
node .github/skills/validate-app-db-schema/validate-schema.js

# Output as JSON (for automated processing)
node .github/skills/validate-app-db-schema/validate-schema.js --json

# Show help
node .github/skills/validate-app-db-schema/validate-schema.js --help
```

## Integration

Add to a periodic GitHub Actions workflow or run manually after a Copilot app update. Example:

```yaml
- name: Validate data.db schema
  run: node .github/skills/validate-app-db-schema/validate-schema.js --json
```

## Implementation Details

The script reads `data.db` using `sql.js` (pure WASM — no native SQLite binaries required).
It performs three checks:

1. **File exists**: `~/.copilot/data.db` is present
2. **Schema check**: `PRAGMA table_info(table_name)` confirms all required columns exist
3. **Live query**: Runs the actual JOIN query used by the extension against the last 24h of data

## Related Code

- `vscode-extension/src/copilotAppData.ts` — the module that reads data.db at runtime
- `vscode-extension/src/types.ts` — `SessionHierarchyNode`, `SessionRelationRef`, `SessionFileDetails`
- `vscode-extension/src/extension.ts` — `enrichSessionHierarchy()` method
