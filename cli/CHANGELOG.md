# Change Log

All notable changes to the CLI (@rajbos/ai-engineering-fluency) will be documented in this file.

## [Unreleased]

### Changed
- **`environmental` estimates are now based on published research, and for most people they are much lower.** CO₂ and water used to be flat guesses with no source (0.2 g CO₂e and 0.3 L of water per 1,000 tokens). They are now derived from Jegham et al., *How Hungry is AI?* ([arXiv:2505.09598](https://arxiv.org/abs/2505.09598)) via [neuland/tokendashboard-backend](https://github.com/neuland/tokendashboard-backend/blob/main/docs/co2-methodology.md): tokens are weighted by type (output fully, fresh input 1/20, cache reads almost nothing), each model is scaled from Claude Sonnet by its output-token price, and water uses the paper's cooling-plus-generation formula. Expect sharply lower figures for cache-heavy agent use (one real 30-day history: CO₂ about 38× lower, water about 3,000× lower) and smaller changes for sessions without a per-model breakdown. **Some usage can come out higher than before:** output-heavy work on large models counts up to 1,400 g CO₂e per million output tokens for Opus (2,800 g for Fable), against the old flat 200 g per million tokens. The command's methodology header now prints the reference values and weights used

### Features
- Add `aes` command rendering an AES (Agentic Engineering System) workflow assessment report — a team-reported self-assessment of one delivery workflow's governance, shared-knowledge and customer-value stocks, its define/deliver/detect activities and director/performer/assessor modes. Supports `--json`, `--html <path>`, and `--file <path>` to render a real assessment; defaults to a fictional FableCart fixture until a real assessment-authoring path ships. This is a separate lens from Fluency Score (an individual's tool usage) and Dark Factory Readiness (a repository's observable controls) — see `docs/features/AES-WORKFLOW-ASSESSMENT.md`
- Group models from user-configured custom endpoints (BYOK) under their own provider group (e.g. `Mistral (Custom)`) in the provider cost chart data
- Add `--json` flag to `segment` command, so oh-my-posh/prompt hooks can get structured per-period token data from the fast, cached `segment` path instead of the uncached `usage --json` command

### Bug Fixes
- Fix update sync-host-views skill paths after CopilotTokenTracker rename (#1398)
- Fix modelSwitching cost model array initialization
- Fix `posh-hook.ps1` reference hook blocking shell startup for 45-80+ seconds by calling `usage --json` synchronously; it now reads from a cache file and refreshes in a detached background process

### Maintenance
- Added unit tests for error handling and CLI utilities (#1375)
- Bumped `@types/node` to 26.0.0
- Bumped `esbuild` to 0.28.1

## [0.2.9] - 2026-06-07

### Features
- Add this-month token count to segment output and statusline (#1350)

## [0.2.3] - 2026-05-22

### Features & Improvements
- Added oh-my-posh segment command and Copilot CLI statusline support (#876)
- Removed cost estimate row and renamed TBB to UBB for clearer billing terminology (#847)
- Added billion (B) tier to token display formatters for very large token counts (#899)

### Bug Fixes
- Reduced OMP segment cache TTL from 15 min to 5 min for fresher status-bar data (#936)

### Maintenance
- Extracted CLI helpers into focused modules: progress.ts (ProgressTracker), formatting.ts, commandUtils.ts, and analysis.ts (#1016, #1026, #1027, #1028)
- Replaced synchronous fs calls with async alternatives in CLI helpers
- Extracted CachePolicy strategy from cacheManager and cliCache
- Extracted WorkspacePathResolver for safe file:// URI handling (#965)
- Extracted buildAdapterRegistry factory to eliminate adapter duplication (#959)
- Extracted withErrorRecovery helper to replace silent catch blocks
- Replaced any type casts with proper types throughout CLI helpers
- Centralised ecosystem adapter data-access instantiation
- Added null checks and input validation to output formatting functions
- Bumped @types/node dependencies

## [0.2.2] - 2026-05-13

### Maintenance
- Internal refactoring: extract cache invalidation policy and error-handling wrapper

## [0.2.0] - 2026-05-11

### Maintenance
- Internal refactoring and dependency updates

## [0.1.3] - 2026-05-10

### Features & Improvements
- Added oh-my-posh segment command and Copilot CLI statusline support (#876)

## [0.1.2] - 2026-05-09

### Features & Improvements
- Removed cost estimate row and renamed TBB to UBB (#847)

## [0.1.1] - 2026-05-09

### Features & Improvements
- Added --json output option to the stats command (#818)

### Maintenance
- Bumped @types/node from 25.6.0 to 25.6.2

## [0.1.0] - 2026-05-04

### Features & Improvements
- Added Gemini CLI support as a trackable ecosystem
- Added JetBrains adapter to CLI ecosystem registry
- Added Mistral Vibe session support
- Added weekly/monthly chart periods and fixed usage analysis routing
- Added GitHub Copilot AI-Credit pricing alongside provider pricing
- Added dedicated CLI interaction mode in Usage Analysis (#659)
- Added macOS path support for Claude Desktop Cowork sessions (#714)
- Improved fluency spiderweb chart for Claude-only users
- Renamed cost labels: (API) to (est.) and (Copilot) to (TBB) with explainer tooltips
- Display CO2 in kg when >= 1000g for readability

### Bug Fixes
- Fixed: align token counting with VS Code extension
- Fixed: use actual tokens for all periods; increased session timeout to 120s
- Fixed: prefer actualTokens from session.shutdown over estimates
- Fixed: use UTC date boundaries for period attribution
- Fixed: extract per-model usage from session.shutdown events
- Fixed: populate estimated cost data in chart view for all periods

### Maintenance
- Migrated to IEcosystemAdapter registry pattern for improved extensibility
- Bumped cache version to 3 to reflect SessionData shape changes
