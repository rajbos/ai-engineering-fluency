# What's New — release notes people read, and one quiet notification a day

Two halves of one feature:

- a **What's New view** listing the last five releases in plain English, and
- a **one-at-a-time notification** that points out a new view, tab, or section
  after an update — but only if the user hasn't already found it themselves.

The problem it solves is that new surfaces are invisible. A tab added to Usage
Analysis is a tab nobody clicks, because nothing ever tells anyone it appeared;
the CHANGELOG does, but it is written for someone reading a diff, and nobody
opens it. The counter-problem is worse: a notification on every window open
trains people to dismiss without reading, at which point the mechanism is
actively harmful.

## The pieces

| File | Role |
|---|---|
| `vscode-extension/src/whatsNew/catalog.ts` | Hand-written data: releases, their prose headline, and the features each added |
| `vscode-extension/src/whatsNew/visits.ts` | Last-opened timestamps per view and per tab |
| `vscode-extension/src/whatsNew/announcer.ts` | All the pacing rules, as pure functions |
| `vscode-extension/src/webview/whatsnew/main.ts` | The view |

Nothing here leaves the machine. The visit map exists solely to keep the
extension quiet about things the user already found; it is not analytics.

## The rules

Every one of these is enforced in `announcer.ts`, not at the call site, so they
are testable and there is one place to look when the pacing feels wrong.

- **Never on a fresh install.** New users get the onboarding flow instead.
- **Only what is new to *this* user.** Features are queued when the extension
  notices its own version changed — not when a panel opens — so announcements
  track upgrades, not usage.
- **At most three per release**, picked in catalog order. That cap counts
  everything already announced or queued for that release, so two upgrades in a
  week cannot add up to six notifications about one version.
- **At most one per calendar day**, in the user's own timezone, and one at a
  time.
- **Nothing they already found.** A queued feature is dropped, silently and
  unannounced, the moment the user opens its tab themselves.
- **Nothing stale.** Features from releases older than 60 days are dropped
  rather than announced, so someone returning after a long break gets the view
  instead of a fortnight of daily toasts.

Users who want none of it can set
`aiEngineeringFluency.whatsNew.notificationsEnabled` to `false`; the view stays.

### What "already found it" means

A visit is recorded against the view (`usage`) and, when the panel has tabs,
against the tab too (`usage#corrections`). Opening Usage Analysis and staying on
its default tab does **not** count as seeing the Worktrees tab — so a feature on
a tab needs a visit to *that tab*.

Anchors are deliberately not part of the key. A section is scrolled past, not
opened, so "did they see it" is only honestly answerable at tab granularity; a
section-level feature counts as found once its tab has been visited.

Visits are compared against `versionSeenAt`, the moment the running build first
started here — not against all of history. A tab visited a year ago on an older
version says nothing about whether the user has seen what changed in it since.

### The first upgrade after this shipped

Existing users arrive with no stored version, so there is no way to know which
releases they crossed. They are queued the **current** release's features only;
everything older is left to the view, where it does not interrupt. A genuinely
fresh install is told nothing at all. The two cases are told apart by the
`hasSeenOnboarding` flag the extension already keeps.

## Adding a release

> The **`whats-new-catalog` skill** automates the mechanical half of this —
> missing entries, stale dates, surfaces pointing at a view or tab that no longer
> exists, and features sitting below the announcement cap. Run
> `node .github/skills/whats-new-catalog/whats-new-catalog.js`, or see
> [.github/skills/whats-new-catalog/SKILL.md](../../.github/skills/whats-new-catalog/SKILL.md).

Prepend a `WhatsNewRelease` to `WHATS_NEW_RELEASES` (newest first) when you bump
the version, and write it for a user rather than a reviewer — what they can now
do, not what changed in the diff. Only list things a person can point at: a new
view, tab, or section. Bug fixes belong in the CHANGELOG.

Keep the feature list short and **put the ones that matter first**: the cap means
a list of ten is nine items of noise and one item of signal, and catalog order is
the editorial decision about which is which.

Feature `id`s are persisted in `globalState` to remember what each user has been
told. **Never reuse or renumber one** — a recycled id silently suppresses the
announcement for everyone who saw the feature it used to name.

The catalog tests (`vscode-extension/test/unit/whatsNewCatalog.test.ts`) enforce
the mechanical parts: unique ids, newest-first ordering, real prose in every
description, and — for Usage Analysis entries — a tab name the host can actually
switch to, so a "Take me there" button can never go nowhere.

## Testing

```sh
cd vscode-extension
npm run test:node          # includes whatsNew{Announcer,Visits,Catalog}.test.ts
npm run check:contract     # the viewTabOpened / openWhatsNewFeature wiring
npm run check:interaction  # clicks every control in the view, headlessly
```
