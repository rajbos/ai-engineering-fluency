---
title: GitHub Copilot Agent Skills
description: Overview of agent skills for GitHub Copilot Token Tracker extension
lastUpdated: 2026-01-26
---

# GitHub Copilot Agent Skills

This directory contains Agent Skills for GitHub Copilot and other compatible AI agents. Agent Skills are used to teach agents specialized tasks and provide domain-specific knowledge.

## What are Agent Skills?

Agent Skills are directories containing a `SKILL.md` file and optional supporting resources. When working with Copilot coding agent, GitHub Copilot CLI, or VS Code Insiders, these skills are automatically loaded when relevant to improve the agent's performance on specialized tasks.

## Available Skills

### azure-storage-loader

**Purpose**: Load token usage data from Azure Table Storage for faster iteration and analysis.

**Use this skill when:**
- Analyzing actual usage data without manual export
- Testing query logic against real backend data
- Debugging backend sync issues with live data
- Performing ad-hoc team analytics
- Quickly iterating on data analysis tasks in chat

**Contents:**
- Helper script to fetch data from Azure Storage Tables
- Support for both Entra ID and Shared Key authentication
- Flexible filtering by date, model, workspace, or user
- JSON and CSV output formats
- Azure Table Storage schema documentation
- Authentication and troubleshooting guides

### copilot-log-analysis

**Purpose**: Comprehensive guide for analyzing GitHub Copilot session log files.

**Use this skill when:**
- Working with Copilot session files (.json or .jsonl)
- Understanding the extension's log analysis methods
- Debugging token tracking issues
- Extracting token usage, model information, or interaction data

**Contents:**
- Session file discovery across all VS Code variants
- Field extraction methods with line-by-line references
- Token estimation algorithms and caching strategies
- JSON and JSONL format parsing details
- Schema documentation references
- Usage examples and troubleshooting guides

### screenshot-ui-views

**Purpose**: Generate screenshots of the extension UI using test data.

**Use this skill when:**
- Documenting UI changes in pull requests
- Updating screenshots in README or documentation
- Creating visual examples for user guides
- Testing UI rendering with controlled data
- Capturing before/after screenshots for UI improvements

**Contents:**
- Test data setup and structure (3 sample session files)
- Screenshot automation script with instructions
- Step-by-step process for capturing all extension views
- Environment configuration for test data loading
- Troubleshooting guide for common issues
- Future automation options and limitations

### refresh-json-data

**Purpose**: Update token estimator and model pricing JSON files with latest data.

**Use this skill when:**
- Adding support for new AI models
- Updating token estimation ratios
- Refreshing pricing information from provider APIs
- Keeping model data current with latest releases

### session-log-data

**Purpose**: Describes the data files available in the coding agent environment after `copilot-setup-steps.yml` runs.

**Use this skill when:**
- Analyzing downloaded session logs or aggregated usage data in the coding agent
- Generating reports from token usage data
- Calculating estimated costs from usage data
- Understanding which data files are available and their schemas

**Contents:**
- Data file locations and schemas (`./session-logs/`, `./usage-data/`)
- Analysis examples using jq, Node.js, and Python
- Cost estimation using model pricing data
- Data availability checks

### refactor-large-function

**Purpose**: Pick one large function flagged by ESLint `max-lines-per-function` and refactor it into smaller, focused private helpers without breaking tests.

**Use this skill when:**
- An ESLint `max-lines-per-function` warning needs to be resolved
- A function has grown too long and needs to be decomposed
- You want to improve code readability and maintainability in the VS Code extension

**Contents:**
- Step-by-step workflow: identify target → baseline tests → refactor → lint → full build → commit → PR
- Rules for private helper extraction (naming, return types, API preservation)
- ESLint commands to identify violation candidates
- Commit message and PR description templates

### validate-editor-names

**Purpose**: Verify that the CLI and VS Code extension always agree on editor display names, and every name has an icon in the webview icon map.

**Use this skill when:**
- Adding support for a new editor or AI coding tool
- After modifying `getEditorSourceFromPath` in `cli/src/analysis.ts`
- After modifying `getEditorTypeFromPath` in `src/workspaceHelpers.ts`
- After updating `EDITOR_ICON_MAP` in `formatUtils.ts`
- When JetBrains or another CLI-based consumer shows raw editor keys instead of friendly names

**Contents:**
- `validate-editor-names.js` — dependency-free Node.js script that statically extracts path detection rules from both source files, runs 18 canonical test paths through the CLI rules, checks cross-function consistency, validates EDITOR_ICON_MAP coverage, and warns about ordering invariants (broad patterns shadowing specific ones)

### check-urls

**Purpose**: Find all hardcoded URLs in TypeScript source files and verify they resolve (return HTTP 2xx/3xx).

**Use this skill when:**
- Validating links added to fluency hints or tips in `src/maturityScoring.ts`
- Checking that VS Code docs URLs, tech.hub.ms video links, or other hardcoded URLs are still live
- Auditing the codebase after bulk URL changes to catch 404s before a release
- Routinely health-checking external references as part of a maintenance pass

**Contents:**
- `check-urls.js` — Node.js script that scans every `*.ts` file under `src/`, extracts unique URLs, and sends HTTP HEAD requests (retrying with GET on 4xx) with a 10-second timeout
- Summary output marking each URL as ✅ OK, ⚠️ REDIRECT, or ❌ BROKEN; exits with code `1` when any URL is broken
- Guidance for fixing broken tech.hub.ms and code.visualstudio.com links

### validate-app-db-schema

**Purpose**: Validate that `~/.copilot/data.db` still exposes the tables and columns the session hierarchy feature depends on (`workspace_parent_links`, `workspaces`, `sessions`).

**Use this skill when:**
- A Copilot app update may have changed the private `data.db` schema (it is not part of any public API)
- Session hierarchy enrichment stops working or parent/child workspace links go missing
- Running on a periodic schedule to detect breaking schema changes early

**Contents:**
- `validate-schema.js` — script that reads `data.db` via `sql.js` (pure WASM, no native SQLite binaries) and checks file existence, required tables and columns, and runs the actual JOIN query used by the extension against the last 24h of data
- Clear PASS / FAIL reporting with a `--json` flag for CI or automated processing
- References to the runtime code that depends on the schema (`vscode-extension/src/copilotAppData.ts`, `enrichSessionHierarchy()`)

### validate-session-schemas

**Purpose**: Loop over recent local AI-coding session log files for every supported file-based platform and validate they still match the documented schema, while surfacing newly-discovered fields we could start using.

**Use this skill when:**
- After an editor or CLI update that may have changed session log formats
- Adding or modifying a session file parser/adapter
- Running on a schedule to catch schema drift early
- Looking for new fields (e.g. real token counts, new model metadata, new event types) worth wiring into the adapters

**Contents:**
- `validate-session-schemas.js` — dependency-free Node.js validator covering Copilot Chat, Copilot CLI, JetBrains, Claude Code, Gemini CLI, Antigravity, and OpenCode
- `schema-baselines.json` — per-platform `contracts` (hand-maintained fields our parsers depend on) and `knownFields` (last-known observed fields, refreshable with `--update-baseline`)
- Recency window and per-platform limits (`--days`, `--max`, `--platform`), CI-friendly exit codes, and `--json` output
- Per-platform statuses (`PASS`, `DRIFT`, `NO_FILES`, `NO_RECENT_FILES`, `INCONCLUSIVE`) plus a "Not validated" list for DB/binary formats so coverage is never overstated

### validate-model-pricing

**Purpose**: Find all model IDs referenced in local AI-coding session log files and debug logs, then compare them against the keys in `src/modelPricing.json`.

**Use this skill when:**
- After adding a new model to `modelPricing.json`, to confirm coverage
- Seeing unexpected cost attributions (models without a pricing entry fall back to `gpt-4o-mini` pricing)
- Discovering which new models have appeared in recent sessions

**Contents:**
- `validate-model-pricing.js` — Node.js script that scans the same file-based platforms as the [`validate-session-schemas`](#validate-session-schemas) skill, plus Copilot Chat debug logs (`llm_request` events with `attrs.model`)
- Reports **UNKNOWN** models (found in logs but missing a pricing entry) and **UNUSED LOCALLY** pricing entries — both informational, not errors
- `--days`, `--max`, `--verbose`, and `--json` options with CI-friendly exit codes

### load-cache-data

**Purpose**: Load and inspect the last 10 rows from the local session file cache to iterate with real data.

**Use this skill when:**
- Inspecting cached session file data
- Debugging cache behavior or validation logic
- Understanding what data is being cached
- Working with real cached data for testing or development
- Iterating on features that rely on cached statistics

**Contents:**
- Cache structure and storage location (VS Code globalState)
- Methods for accessing and managing the cache
- Example scripts demonstrating cache data access
- Cache validation and lifecycle documentation
- Integration with the extension's token tracking

### sync-host-views

**Purpose**: Keep the Visual Studio and JetBrains webview views (screens) in sync with the VS Code views, while preserving the exact set of views each host ships. New VS Code views are detected and surfaced for a human decision — never auto-added.

**Use this skill when:**
- After building or updating the VS Code webviews (`vscode-extension/esbuild.js` `entryPoints`)
- Before a Visual Studio or JetBrains release, to ensure their shipped screens are current
- When a host shows stale screens, or you suspect VS Code added a screen the hosts are missing
- After changing the host include lists (`CopilotTokenTracker.csproj`, `jetbrains-plugin/build.gradle.kts`)

**Contents:**
- `sync-host-views.js` — dependency-free Node.js detector that parses the canonical view set from `esbuild.js` and compares it to the Visual Studio (`csproj` + committed `webview/*.js`) and JetBrains (`build.gradle.kts`) host lists
- Classifies each view as tracked / NEW (ask the user) / orphan; checks committed VS bundles for staleness vs `dist/webview` (sha256)
- `--refresh` copies only already-tracked bundles into the Visual Studio `webview/` folder (never adds a view); `--json` for CI
- Exit codes: `0` in sync · `1` mechanical drift · `2` config error · `3` NEW views (human decision required)
- Workflow for refreshing existing screens and the ask-before-adding procedure for new screens, including the navigation wiring needed in each host

## Using Agent Skills

### In VS Code

Agent Skills are automatically loaded by Copilot when relevant to your task. The skills in this directory are **project-specific** and will be available when working in this repository.

### In GitHub Copilot CLI

Skills are automatically discovered when using the Copilot CLI in this repository:

```bash
gh copilot suggest "How do I analyze Copilot session files?"
```

### Manual Reference

You can also manually refer to these skills when asking Copilot questions:

```
@workspace /explain How does the token estimation work? See the copilot-log-analysis skill.
```

## Skill Structure

Each skill follows the Agent Skills standard:

```
.github/skills/
└── skill-name/
    ├── SKILL.md          # Required: Main skill documentation
    └── [resources...]    # Optional: Scripts, examples, etc.
```

### SKILL.md Format

```markdown
---
name: skill-name
description: What the skill does and when to use it
---

# Skill Title

Content with instructions, examples, and guidelines...
```

## Adding New Skills

To add a new skill:

1. Create a subdirectory: `.github/skills/new-skill-name/`
2. Create `SKILL.md` with YAML frontmatter
3. Add instructions, examples, and guidelines
4. Optionally add supporting resources (scripts, configs, etc.)

**Guidelines:**
- Use lowercase names with hyphens for skill directories
- Keep skills focused on specific tasks
- Include clear examples and use cases
- Reference existing code/documentation with file paths and line numbers
- Make skills self-contained but link to source files for details

## Resources

- [VS Code Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [GitHub Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Agent Skills Standard](https://github.com/agentskills/agentskills)
- [Community Skills Repository](https://github.com/anthropics/skills)

## Notes

- Skills are loaded on-demand based on context
- Skills work with Copilot coding agent, GitHub Copilot CLI, and VS Code Insiders
- Personal skills can be stored in `~/.copilot/skills` for cross-project use
- Organization and enterprise skills support is coming soon
