---
applyTo: "sharing-server/**,docs/sharing-server/**"
---

# Sharing server — coding and testing

Read and follow [sharing-server/AGENTS.md](../../sharing-server/AGENTS.md), the
authoritative data separation contract, before changing server code, tests,
documentation or downstream route overrides. It defines owner-only personal
data, identity-free team projections, server-authorized admin detail, exact
comparison semantics and HTTP/HTML privacy regression coverage.

Use the server `check-types`, `build`, `test` and headless `check:interaction`
scripts as described there, including the existing Playwright/Chromium
prerequisite. Use isolated SQLite fixtures and stubbed GitHub access, never production
data or live GitHub. Keep implementation and testing descriptions linked to the
contract rather than creating alternative privacy rules.
