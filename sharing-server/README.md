# AI Engineering Fluency — Sharing Server

A self-hosted API server + web dashboard that makes sharing AI Engineering Fluency data
across a team dramatically easier. No Azure account required — anyone with Docker can
host it in minutes.

## How it works

```
[VS Code Extension]  ──Bearer token──►  POST /api/upload
                         (GitHub session)       │
                                        [Sharing Server]
                                               │
                                         SQLite DB (./data/)
                                               │
[Web Browser]  ──OAuth login──►  GET /dashboard
```

**The extension already holds a GitHub OAuth session** (the same one used by Copilot
and GitHub PR statistics). When you configure a sharing server endpoint URL, the
extension automatically uses that token for uploads — no API keys, no copy-paste,
no new consent required.

## Quick start with Docker Compose

### 1. Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name**: `AI Engineering Fluency`
   - **Homepage URL**: `https://your-server.example.com`
   - **Authorization callback URL**: `https://your-server.example.com/auth/github/callback`
3. Copy the **Client ID** and generate a **Client Secret**

### 2. Create the compose file

```yaml
services:
  sharing-server:
    image: ghcr.io/rajbos/copilot-sharing-server:latest
    ports:
      - "3000:3000"
    environment:
      - GITHUB_CLIENT_ID=your_client_id
      - GITHUB_CLIENT_SECRET=your_client_secret
      - SESSION_SECRET=a_long_random_string_min_32_chars
      - BASE_URL=https://your-server.example.com
      # Optional: restrict uploads to members of a specific GitHub org
      # - ALLOWED_GITHUB_ORG=your-org-name
    volumes:
      - sharing_data:/data
    restart: unless-stopped

volumes:
  sharing_data:
```

> **Tip**: Generate `SESSION_SECRET` with `openssl rand -hex 32` in bash, or in PowerShell:
``` powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString("x2") }) -join '' | Set-Content -Path .session_secret.txt
Get-Content .session_secret.txt
```

### 3. Start and verify

```bash
docker compose up -d
curl https://your-server.example.com/health
# → {"status":"ok","timestamp":"..."}
```

### 4. Configure the VS Code extension

In VS Code settings (JSON):

```json
{
  "aiEngineeringFluency.backend.enabled": true,
  "aiEngineeringFluency.backend.backend": "sharingServer",
  "aiEngineeringFluency.backend.sharingServer.endpointUrl": "https://your-server.example.com"
}
```

Or search for **AI Engineering Fluency: Backend** in the Settings UI and fill in the fields.

That's it. The extension will start uploading data automatically. No authentication
prompt — it reuses your existing GitHub session.

## Building from source

```bash
# From the repo root:
./build.ps1 -Project sharing

# Or from the sharing-server/ directory:
cd sharing-server
npm ci
npm run build            # development build
npm run build:production # minified build
```

## Running locally (without Docker)

### 1. Install dependencies

```bash
cd sharing-server
npm ci
```

### 2. Create a `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Minimum required in `.env`:

```env
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
SESSION_SECRET=any_long_random_string_at_least_32_chars
BASE_URL=http://localhost:3000
PORT=3000
DB_PATH=./data/sharing.db
```

> **GitHub OAuth App callback URL** for local dev: `http://localhost:3000/auth/github/callback`

### 3. Build and start

```bash
npm run build   # compile TypeScript → dist/server.js
npm start       # start the server (automatically loads .env via Node --env-file)
```

Or for **watch mode** (auto-restarts `dist/server.js` whenever it changes):

```bash
npm run dev
```

> Run `npm run build` in a separate terminal to rebuild after editing `src/`. The `dev`
> script uses `node --watch` which restarts automatically when `dist/server.js` changes.

### 4. Verify

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}
```

Open `http://localhost:3000/dashboard` in your browser to test the OAuth login flow.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App client ID (for dashboard login) |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App client secret (for dashboard login) |
| `SESSION_SECRET` | ✅ | Random secret for signing session cookies (≥32 chars) |
| `BASE_URL` | ✅ | Public base URL of the server (no trailing slash) |
| `PORT` | ❌ | HTTP port (default: `3000`) |
| `DB_PATH` | ❌ | SQLite database path (default: `/data/sharing.db`) |
| `ALLOWED_GITHUB_ORG` | ❌ | If set, only members of this GitHub org can upload data |
| `ADMIN_GITHUB_LOGINS` | ❌ | Comma-separated GitHub logins to auto-grant admin access (e.g. `alice,bob`). When set, this list is authoritative: listed users get admin, all others do not. Leave unset to manage admins manually via SQLite. |

## REST API

### Upload daily rollups (used by the VS Code extension)

```
POST /api/upload
Authorization: Bearer <github-token>
Content-Type: application/json

[
  {
    "day": "2026-04-21",
    "model": "gpt-4o",
    "workspaceId": "my-project",
    "workspaceName": "My Project",
    "machineId": "laptop-abc123",
    "machineName": "My Laptop",
    "editor": "Copilot CLI (App)",
    "inputTokens": 15000,
    "outputTokens": 8000,
    "interactions": 42,
    "datasetId": "default"
  }
]
```

Accepts up to **500 entries per request**. The server upserts by
`(user_id, dataset_id, day, model, workspace_id, machine_id, editor)` so repeated
uploads are safe and idempotent.

### Other endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check |
| `GET` | `/api/me` | Bearer token | Current user info |
| `GET` | `/api/data?days=30` | Bearer token | Own usage data (last N days) |
| `GET` | `/auth/github` | Public | Dashboard login (OAuth redirect) |
| `GET` | `/auth/github/callback` | Public | OAuth callback |
| `GET` | `/auth/logout` | Session | Clear session |
| `GET` | `/dashboard` | Session cookie | Web dashboard |

## Rate limits

| Scope | Limit |
|---|---|
| Per IP (all requests) | 200 requests / minute |
| Per user (uploads) | 100 upload requests / hour |

## Extending this server

This server is also published as a library so you can build a customised server on top of
it without forking. Import `createApp` and `startServer`, mount your own routes and
register your own tables:

```ts
import {
	createApp,
	startServer,
	registerSchemaExtension,
	requireBearerAuth,
	getDb,
} from '@rajbos/ai-engineering-fluency-sharing-server';
import { Hono } from 'hono';

// Runs before the first getDb(), so the table exists at startup.
registerSchemaExtension('my-metrics', (db) => {
	db.exec(`CREATE TABLE IF NOT EXISTS my_metrics (
		id           INTEGER PRIMARY KEY,
		user_id      INTEGER NOT NULL REFERENCES users(id),
		dataset_id   TEXT NOT NULL DEFAULT 'default',
		day          TEXT NOT NULL,
		workspace_id TEXT NOT NULL,
		machine_id   TEXT NOT NULL,
		metrics_json TEXT NOT NULL,
		UNIQUE(user_id, dataset_id, day, workspace_id, machine_id)
	)`);
});

const routes = new Hono();
routes.post('/upload', requireBearerAuth, async (c) => {
	const user = c.get('user');
	// … store rows for user.id …
	return c.json({ ok: true });
});

const app = createApp({
	healthExtra: () => ({ edition: 'my-company' }),
	extend: (a) => a.route('/api/mine', routes),
});

await startServer(app);
```

### Extension points

| Export | Purpose |
|---|---|
| `createApp({ extend })` | Register routes **before** the built-in ones. Because Hono matches in registration order, this also lets you override a built-in path. |
| `createApp({ healthExtra })` | Merge extra fields into `/health`. |
| `createApp({ mountApi, mountDashboard })` | Opt out of the built-in route groups. |
| `registerSchemaExtension(name, fn)` | Add tables/indexes/migrations. Call before the first `getDb()`. |
| `requireBearerAuth` | Authenticate with the same GitHub token as `/api/upload`, so your rows share the same `user_id`. |
| `startServer(app, opts)` | Backup/restore, DB init with retry, periodic backup, graceful shutdown. |

### Guidance

- **Add tables, don't widen `usage_uploads`.** Keeping downstream tables separate means
  core migrations and your migrations never conflict.
- **Join on `(user_id, dataset_id, day, workspace_id, machine_id)`** — the natural rollup
  key — and use a `LEFT JOIN`, since upload ordering between clients is not guaranteed.
- **Upsert on that key** so a re-upload of the same day replaces rather than duplicates.
- **Reuse `requireBearerAuth`.** A separate auth scheme would produce a different
  `user_id` and make the two datasets impossible to join.

## Security

- **Bearer token auth** — the extension sends your GitHub OAuth token. The server
  validates it against `GET https://api.github.com/user` and caches the result for
  10 minutes. Bad tokens are cached for 1 minute to prevent API spam.
- **CSRF protection** — the dashboard OAuth flow uses a short-lived state cookie.
- **Signed session cookies** — dashboard sessions use HMAC-SHA256-signed cookies
  storing only `{sub, iat, exp}`. User data is re-read from SQLite on each request.
- **XSS prevention** — all user-supplied strings are HTML-escaped before rendering.
- **No API keys** — authentication is fully managed by GitHub OAuth; there are no
  API keys to issue, rotate, or leak.

## Privacy note

Unlike the Azure Storage backend which supports anonymized and pseudonymous modes,
the sharing server is **identified mode only** — every upload is linked to a GitHub
user ID. Workspace and machine names are included or excluded based on the extension's
`shareWorkspaceMachineNames` setting (off by default).

## Data schema

```sql
users (
  id, github_id, github_login, github_name, avatar_url,
  created_at, last_seen_at, is_admin
)

usage_uploads (
  id, user_id, dataset_id, day, model,
  workspace_id, workspace_name, machine_id, machine_name, editor,
  input_tokens, output_tokens, interactions, schema_version,
  uploaded_at
)
-- UNIQUE(user_id, dataset_id, day, model, workspace_id, machine_id, editor)
```

## Backup

The entire state is one SQLite file at `/data/sharing.db` (or the path in `DB_PATH`).
Back it up with any tool that can copy files, or use `sqlite3 /data/sharing.db .dump`.
