# Cloud Agent Cost — per-repository AI credits

The **Cloud Agent** tab shows what Copilot's cloud agent cost, broken down per repository. This
page explains where that data comes from, why it is the only per-repo cost we can get, and how the
hourly snapshot works.

## Why the agents API and not the billing API

The extension already reads overall usage and quota from the Copilot internal API. That gives a
total, not a breakdown: usage that happens outside an editor — cloud agent runs, Copilot code
review — is billed to the *user*, never to a repository.

GitHub's official billing endpoints do not close that gap for a normal user:

| Endpoint | Per repo? | Usable here? |
|---|---|---|
| `/users/{user}/settings/billing/usage` | `repositoryName` field exists | Only for individually-purchased Copilot plans, and AI-credit usage is attributed to the user, not a repo. Needs a classic PAT — fine-grained tokens are rejected — so a VS Code auth session can't call it. |
| `/users/{user}/settings/billing/ai_credit/usage` | No | Exact per-model credit totals, but no repository dimension at all. |
| `/organizations/…` and `/enterprises/…` variants | Partly | Require org owner / billing manager / enterprise admin. |
| `/orgs/{org}/copilot/metrics/reports/repos-1-day` | Yes, activity only | Per-repo pull request activity, no credits; org admin only. |
| GraphQL | No | No AI-credit or premium-request fields exist. |

What *is* available to any signed-in user is the **agent tasks API**, which reports billing units
per session, and each session belongs to a repository:

```
GET /agents/tasks                  → the user's tasks across all repositories
GET /agents/tasks/{task_id}        → sessions[], each with { model, usage: { type, amount } }
GET /agents/repos/{owner}/{repo}/tasks[/{task_id}]  → the same, scoped to one repository
```

`usage.type` is `ai_credits` (amount in **nano-credits** — divide by 1,000,000,000) for sessions
since June 2026, or `premium_requests` (a plain, possibly fractional count) for older ones. The
live API has also been observed reporting the amount as `usage.credits`, so both spellings are
read (see `readSessionUsage` in `vscode-extension/src/agentSessionsService.ts`).

## Two sources, merged

`collectAgentSessions()` combines:

1. **Workspace repositories** — discovered from the git remotes of open folders. The repo-scoped
   listing also surfaces tasks *other people* started in those repos.
2. **The account-wide listing** (`/agents/tasks`) — tasks the signed-in user started anywhere,
   including repos that are not checked out locally and ad-hoc sessions started from cloud chat
   that have no repository at all. Those land in a "no repository (cloud chat)" row.

Tasks are deduplicated by task ID before any detail call, so a task visible in both listings is
counted once. Repositories found only through the account listing are labelled *(not in workspace)*.

If the account-wide listing fails (for example, a token without the "Agent tasks" permission), the
tab degrades to the workspace repositories and says so.

## Cost control: one hourly snapshot, one window

Collecting the data costs one list call per repository, one for the account, and one detail call
per task, so it is deliberately rationed:

- **Cached on disk** in the extension's global storage
  (`agenttasks_<cacheId>.snapshot.json`), shared by every VS Code window of that edition —
  see `vscode-extension/src/agentTasksCache.ts`.
- **Refreshed at most once an hour** (`AGENT_TASKS_REFRESH_INTERVAL_MS`). Opening the tab renders
  the snapshot immediately and never triggers an API call while it is fresh.
- **Refreshed by a single window.** The refresh runs behind the `agenttasks` file lock, and is
  kicked off from the leader-elected cache refresh cycle — so it also runs shortly after the
  extension starts. Other windows read the snapshot the leader wrote; a heartbeat keeps the lock
  alive so a slow API pass is never mistaken for a stale lock.
- **Capped at `MAX_TASK_DETAILS_PER_REFRESH` detail calls** per pass, spent on the most recently
  updated tasks. Repositories with tasks left over are flagged, and their totals are shown as
  lower bounds.

The tab always states how old the snapshot is and when the next refresh becomes due.

## What is still missing

- **Copilot code review** consumes AI credits charged to the reviewer or the PR author, with no
  per-repo attribution anywhere in the API. Its Actions minutes *are* per repo (workflow path
  `dynamic/agents/copilot-pull-request-reviewer`), which is a possible future addition.
- **Actions minutes for cloud agent runs** are likewise not included in this tab yet.
- **IDE chat and agent mode** have no repository dimension by construction; that usage is already
  tracked from local session logs elsewhere in the extension.
