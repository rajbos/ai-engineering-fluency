# Change Log

All notable changes to the sharing server (`@rajbos/ai-engineering-fluency-sharing-server`) will be documented in this file.

## [Unreleased]

## [0.4.0] - 2026-11-25

### Upgrade notes
- **A strong `SESSION_SECRET` is now required.** The server refuses to start unless `NODE_ENV` is `development` or `test`, or `SESSION_SECRET` is at least 32 characters, has no surrounding whitespace and is not a documented placeholder. Set one before upgrading (#2412)
- **Session and sign-in cookies are now `Secure` unless `NODE_ENV` is `development` or `test`** (previously only when it was `production`). A deployment served over plain HTTP on a host other than localhost must run behind TLS, or sign-in fails (#2594)
- **`getTeamInsights()` returns more data:** team-aggregate `dimensions`, `trends`, `activity` and `cost` breakdowns (model, editor, repository, tool and MCP-server names, team totals plus the viewer's own share) and `unnamedRepositories`. Routes that serialize the whole result now expose these aggregates too. No peer identity is added; see [AGENTS.md](AGENTS.md) (#2598)
- **The built-in dashboard pages now send a Content Security Policy** with a per-request script nonce, plus other security headers. Routes added through `extend` keep their own headers (#2594)
- **Request bodies are size-limited.** Uploads are capped at about 20 MiB, which fits the 500-entry batches the clients send (#2594)
- **`engines.node` is now `>=22.14.0`** (was `>=22.5.0`) (#2416)
- The database gains three nullable columns for the new upload fields. They are added automatically and idempotently on startup, so an existing 0.3.0 database needs no manual migration

### Features
- Team Insights shares model, editor, repository, tool and MCP-server breakdowns, daily activity and estimated cost with the team as aggregates plus your own numbers, never per peer (#2598)
- Uploads accept a per-row cost estimate, the client version and validated activity counters from the VS Code extension and the desktop app. Older clients without these fields are still accepted (#2594, #2598)
- The dashboards are usable on phones (#2279)

### Security
- Defence in depth: request body limits, CSP and security headers, `Secure` cookies and a non-root container (#2594)
- The server refuses to start in production without a strong `SESSION_SECRET` (#2412)

### Bug Fixes
- The container mounts the Azure Files share as its `node` user, so backups no longer fail with `EPERM` (#2677)
