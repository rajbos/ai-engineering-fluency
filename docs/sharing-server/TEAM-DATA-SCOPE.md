# Team Server data scope

What the VS Code extension sends to a self-hosted Team Server, what each audience
sees, and what is deliberately left out. The Team Server is configured by people
who work on the same team, so **work-context names** (repositories, models,
editors, tools, MCP servers) are shared data; **people-context detail** (who did
what, when, on which machine) stays owner- and admin-only. The server-side rules
are the [data separation contract](../../sharing-server/AGENTS.md).

## Principles

1. **Aggregate counts, never content.** No prompts, completions, file paths, tool
   arguments, session titles or timestamps of individual interactions leave the
   machine. Every field is a count, a label from a fixed vocabulary (model id,
   editor name, tool name) or a name the team already shares (repository).
2. **The server knows who you are.** Uploads are authenticated with your GitHub
   token, so there is no anonymous mode. Your own dashboard shows everything you
   sent. Team Insights shows peers only as unnamed rows and team aggregates.
3. **Team aggregates may carry work-context labels.** Team Insights can show that
   the team spent 60% of its tokens on `claude-sonnet-5` or that four uploaders use
   the `github` MCP server, and compare that with your own mix. It never shows
   which peer used which model, editor, repository, tool or server.
4. **Named detail is admin-only.** The admin dashboard shows the same breakdowns
   per GitHub login, behind server-side authorization.
5. **Re-identification risk is accepted, not hidden.** In a small team "one
   uploader used model X" plus exact totals can point at a person. The pages say
   so; there is no suppression or noise, by design.

## Field inventory

| Field | Added | Why it is team-safe | Member view (`/team`, `/api/team-insights`) | Own dashboard | Admin |
|---|---|---|---|---|---|
| `day`, `inputTokens`, `outputTokens`, `interactions` | existing | Numeric totals | Per-peer unnamed rows, team totals, own series | Yes | Named |
| `model` | existing | Vendor model id, not personal | **Team aggregate by model over time + own mix** | Yes | Named per user |
| `editor` | existing | Product name (VS Code, Copilot CLI, Claude Code, ...) | **Team aggregate by editor over time + own mix** | Yes | Named per user |
| `workspaceId`, `machineId` | existing | HMAC-hashed in team profiles; opaque IDs | Never | Yes | Named |
| `workspaceName` (repository folder) | existing, opt-in via *share readable names* | Teams share repositories | **Team aggregate per repository (tokens, uploader count) + own marker** | Yes | Named per user |
| `machineName` | existing, opt-in | Device identity, not work context | Never | Yes | Named |
| `datasetId` | existing | Deployment tag | Never | Yes | Named |
| `estimatedCostUsd` | **new** | Derived from tokens and the public price list | Team cost by model/editor + own | Yes | Named per user |
| `activity.sessions` | **new** | Count | Team total + own | Yes | Named |
| `activity.modes` (ask/edit/agent/plan/customAgent/cli) | **new** | Counts of interaction modes | Team mix + own mix | Yes | Named |
| `activity.toolCalls`, `activity.toolsByName` | **new** | Tool names are product vocabulary; counts only | Team top tools + own calls | Yes | Named |
| `activity.mcpCalls`, `activity.mcpByServer` | **new** | MCP server names are team configuration | Team top servers (calls, uploader count) + own | Yes | Named |
| `clientVersion` | **new** | Extension version string | Never | Yes | Named (spot outdated installs) |
| `fluencyMetrics` | existing | Opaque blob the server stores for the fluency score; never rendered | Never | Score only | Score only |

Not sent, now or planned: prompt or completion text, file names or paths, tool
arguments or results, git remotes or commit data, session titles, per-request
timestamps, OS user names, raw workspace or machine identifiers in team profiles.

## Why this set

The question the Team Server answers for a team lead is *"how is the team
adopting AI tooling, and is that changing?"*. Tokens alone cannot answer it. The
fields above let the pages answer:

- **Models over time**: which models the team actually uses, whether a new model
  is displacing an old one, and what that costs. (`model`, `estimatedCostUsd`)
- **Editors over time**: whether usage moves from chat in the IDE to CLI agents.
  (`editor`)
- **Working style**: ask vs. edit vs. agent mode, how many sessions, how much
  tool and MCP use, which MCP servers the team relies on. (`activity`)
- **Where the work lands**: which repositories get AI help, and how many
  teammates work on each. (`workspaceName`)
- **Hygiene**: which installs are on an old extension version. (`clientVersion`)

## Where it is enforced

- Extension: `vscode-extension/src/backend/services/sharingServerActivity.ts`
  projects the local analysis into the validated `activity` shape and caps its
  size; `buildSharingServerEntries` in `syncService.ts` attaches cost, activity and
  version to every entry. The **Configure Team Server Backend** panel lists the
  fields.
- Server: `sharing-server/src/validation/uploadSchema.ts` rejects anything outside
  the shape above; `teamBreakdowns.ts` builds the identity-free aggregates;
  `routes/adminBreakdown.ts` renders the named admin detail.
- Tests: `sharing-server/src/test/teamInsights.test.ts` and
  `teamDashboard.test.ts` seed peer identity sentinels and assert they never reach
  member pages, exports or embedded scripts, while work-context labels do appear
  only in aggregate sections.
