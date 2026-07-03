---
name: validate-model-pricing
description: Find all model IDs referenced in local AI-coding session log files and debug logs, then compare them against the keys in vscode-extension/src/modelPricing.json. Reports models found in logs that have no pricing entry (unknown — informational only) and pricing entries never observed locally (unused). Use after adding a new model to modelPricing.json, after seeing unexpected cost attributions, or to discover which new models have appeared in recent sessions. Depends on file discovery patterns from the validate-session-schemas skill.
---

# Validate Model Pricing Skill

Scans **recent local AI-coding session log files** (and Copilot Chat debug logs) for
every model ID that was actually used, then cross-references that list against the
keys in `vscode-extension/src/modelPricing.json`.

It answers two questions:

1. **Are there models in my session logs with no pricing entry?**
   Models that appear in log files but have no key in `modelPricing.json` fall back to
   `gpt-4o-mini` pricing — which may over- or under-estimate cost significantly.
   These are reported as **UNKNOWN** (informational; not an error).

2. **Are there pricing entries that were never seen locally?**
   Keys in `modelPricing.json` that don't match any log file model ID are reported
   as **UNUSED LOCALLY** (informational; they may be used by other machines or team members).

## Relationship to Other Skills

This skill **reuses the same file discovery patterns** as the
[`validate-session-schemas`](./../validate-session-schemas/SKILL.md) skill — it
covers the same set of file-based platforms:

| Platform | Files scanned |
|----------|---------------|
| Copilot Chat (VS Code) | `workspaceStorage/*/chatSessions/*.{json,jsonl}`, `globalStorage/github.copilot-chat/**/*.{json,jsonl}` |
| Copilot CLI | `~/.copilot/session-state/**/*.{json,jsonl}` |
| JetBrains Copilot | `~/.copilot/jb/**/partition-*.jsonl` |
| Claude Code | `~/.claude/projects/**/*.jsonl` |
| Gemini CLI | `~/.gemini/tmp/**/session-*.jsonl` |
| Antigravity | `~/.gemini/antigravity/brain/**/.system_generated/logs/transcript.jsonl` |
| OpenCode | `<XDG_DATA_HOME>/opencode/storage/session/**/ses_*.json` |
| **Debug logs** | `workspaceStorage/*/GitHub.copilot-chat/debug-logs/*/main.jsonl` |

Debug logs use `llm_request` JSONL events that contain an `attrs.model` field — this
is the most authoritative source of model IDs for VS Code chat sessions.

## Usage

```bash
# Default: scan last 30 days, at most 20 files per platform
node .github/skills/validate-model-pricing/validate-model-pricing.js

# Widen the look-back window
node .github/skills/validate-model-pricing/validate-model-pricing.js --days 90

# Scan more files per platform
node .github/skills/validate-model-pricing/validate-model-pricing.js --max 50

# Machine-readable JSON output
node .github/skills/validate-model-pricing/validate-model-pricing.js --json

# Show all models from logs, even those that do match a pricing entry
node .github/skills/validate-model-pricing/validate-model-pricing.js --verbose
```

### Options

| Flag | Meaning |
|------|---------|
| `--days N` | Only consider files modified within the last N days (default 30; `0` = no limit) |
| `--max N` | Analyze at most N most-recent files per platform (default 20) |
| `--json` | Emit machine-readable JSON only |
| `--verbose` | Also list models that matched a pricing entry |
| `-h, --help` | Show usage |

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Completed successfully (unknown models are informational, not errors) |
| `2` | Configuration / environment error (bad args, missing `modelPricing.json`) |

## Interpreting Output

### UNKNOWN models

A model ID found in log files that has **no exact key** in `modelPricing.json`.
This means cost estimation falls back to `gpt-4o-mini` pricing.

**Common causes**:
- New model released after the pricing file was last updated
- Dot/hyphen format mismatch — e.g. `mistral-medium-3.5` vs `mistral-medium-3-5`
- Model ID contains a `copilot/` prefix that was not stripped

**Resolution**: Add the model key (and a `copilotPricing` block if applicable) to
`vscode-extension/src/modelPricing.json`, then re-run the skill to confirm coverage.

### UNUSED LOCALLY models

A key in `modelPricing.json` that matched no model ID in the scanned log files.
These entries are not errors — they may be used on other machines, by teammates
(via the sharing server), or be pre-emptively added for future models.

## Files in This Directory

- **SKILL.md** — This file; instructions for the skill
- **validate-model-pricing.js** — Node.js script that performs the scan and comparison
