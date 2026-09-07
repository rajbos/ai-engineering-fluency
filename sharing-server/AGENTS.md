# Sharing server — data separation contract

This is the authoritative privacy contract for all sharing-server coding, testing,
documentation, route overrides and downstream extensions. Read it alongside the
[repository instructions](../AGENTS.md). Keep other server guidance linked here
rather than maintaining separate, potentially conflicting privacy rules.

## Access boundaries

- **Personal data:** own raw uploaded rollups and detailed breakdowns are owner-only.
  Derive the owner from the authenticated server identity, never a query parameter.
- **Team Insights:** cookie-authenticated `/team` and `/team/export`, and
  bearer-authenticated `/api/team-insights`, expose only the identity-free
  projection below. An admin visiting these member surfaces receives the same
  projection, not extra details.
- **Named administrator detail:** stays on separate admin-only routes with
  server-side authorization. Hiding links or columns is not access control.
- Reject unauthenticated data requests (HTML may redirect to login); deny non-admins
  access to admin data. Set `Cache-Control: private, no-store` on personalized and
  team responses. Any new export must reuse the same authorized projection.

## Team projection

Construct explicit allowlisted response objects before serialization; never spread
database rows or rely on client-side removal. Per-member data may contain only
numeric period totals (input/output/total tokens and interactions), activity-day
counts, a self flag, and calculated cohort labels/comparisons. Rank, token share and
percentile are derived from the active uploaders in the selected period.

Downstream routes can import `getTeamInsights`, `parseTeamDays` and the public
projection types from the server package. Authenticate first and derive
`viewerId` only from that identity, never query/request input. Reusing the helper
does not replace route authorization. This contract ships in the npm package.

Never expose peers' names, logins, avatars, profile links, GitHub/internal IDs,
hashed or stable aliases, workspace/machine/dataset identifiers or names,
model/editor labels, fluency blobs, upload timestamps, or per-peer daily series.
This applies to API JSON, full HTML, hidden DOM, embedded scripts, chart payloads
and exports, not just visible text. Trends may show only the team aggregate and
the authenticated user's own series. Anonymous display labels must not encode
identity or provide a stable cross-request alias.

**Anonymous labels remove direct identifiers; they do not guarantee anonymity.**
Exact numeric totals and comparisons can re-identify people, especially in small
teams or by differencing aggregates. This risk is explicitly accepted: do not add
minimum-team-size checks, suppression, rounding or noise to conceal these totals.

## Period and comparison semantics

- Accept 7, 30 or 90 days: exactly N UTC calendar dates including today, starting
  N−1 dates ago. Exclude future dates from totals, membership and trends.
- A member is active only with positive tokens **or** interactions in that window.
  Do not count merely registered users or zero-activity uploads. An inactive
  viewer has a zero-valued `self` row with `rank`, `percentile` and `cohort` set
  to `null`, and is excluded from `members`, not ranked as a zero-usage member.
- Compare selected-period **input + output tokens**. Rank is one plus the number
  of active uploaders with strictly greater totals; ties share rank and cohort.
  `sharePercent` is 100 × the member's fraction of team tokens. If team tokens
  are zero, return `0` (displayed as `0.0%`): a presentation convention, not a
  mathematically defined share.
- Sort active members' token totals and interpolate p25/p50/p75 at `(n−1) × p`,
  linearly between neighboring values. Cohorts are **Light** (`<= p25`),
  **Medium** (`<= p50`), **Heavy** (`<= p75`), otherwise **Very heavy**.
  These are relative usage groups, not productivity or proficiency judgments.
- Percentile is 100 × the fraction of **other active uploaders** with strictly
  fewer tokens. Tied peers are not below; no peers means no percentile, not 100%.

## Required validation

Use isolated temporary SQLite fixtures, clean them up, and stub GitHub
authentication/network calls. Never read user or production databases or call
live GitHub in tests. Do not launch a GUI editor/IDE.

Test real HTTP route responses and complete rendered HTML, including embedded
scripts: assert allowlisted keys and the absence of seeded peer-identity/metadata
sentinels, not merely that visible names are hidden. Verify user A cannot fetch
user B's personal data with query parameters; unauthenticated requests are
rejected; non-admins cannot fetch admin data; admins on member surfaces receive
the same identity-free shape; and cache headers and exports preserve this contract.
Cover empty/single/small teams, inactive viewers, interaction-only activity,
ties, zero-token denominators, interpolated thresholds, each supported period,
UTC boundaries and future-date exclusion.

From `sharing-server`, run the existing checks for server code changes:

```sh
npm run check-types
npm run build
npm test
npm run check:interaction
```

The headless interaction check requires the existing Playwright/Chromium setup
used by `.github/skills/visual-view-diff/lib/browser.js`; it adds no dependency.
It clicks period links, trend modes, daily-total expansion, downloads and
personal-dashboard navigation against an isolated fixture server, never an IDE.

The root `.\build.ps1 -Project sharing -Target test` also runs `npm test`; it does
not replace the other checks. Deployment CI runs the server tests and headless
interaction gate using the repository's locked Playwright tooling. Package
publication CI runs server tests before building the library.

See [README.md](README.md) for the API and
[validation guide](../docs/VALIDATION.md#sharing-server) for test scope.
