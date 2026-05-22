# Change Log

All notable changes to the CLI (@rajbos/ai-engineering-fluency) will be documented in this file.

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
