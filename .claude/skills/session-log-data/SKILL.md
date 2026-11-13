---
name: session-log-data
description: Describes the data files available in the coding agent environment after copilot-setup-steps runs (session logs, aggregated usage data, agent sessions) and the graphify code knowledge graph it builds. Use when analyzing downloaded session logs or aggregated usage data, or for structural code questions in the coding agent environment.
---

# Session Log Data Skill

This skill describes the data files that are automatically downloaded into the GitHub Copilot Coding Agent environment during setup. These files are available for analysis, reporting, and debugging tasks.

## When to Use This Skill

Use this skill when you need to:
- Analyze Copilot token usage patterns from downloaded data
- Generate reports or summaries from session logs or aggregated data
- Debug token tracking or usage issues using real data
- Understand model usage distribution across a team
- Calculate estimated costs from usage data

## Coding Agent Data Sources

When running as the GitHub Copilot Coding Agent (bootstrapped via `.github/workflows/copilot-setup-steps.yml`), extra data may be hydrated into the workspace: `./session-logs/`, `./usage-data/usage-agg-daily.json` and `./usage-data/agent-sessions.json`. They are **not** present in local development, and the Azure-backed ones only exist when the `copilot` GitHub environment has `COPILOT_STORAGE_ACCOUNT` configured (`agent-sessions.json` comes from the GitHub API and does not need it). The rest of this skill documents their schemas, analysis examples and cost estimation. Check that the files exist before relying on them.

These hydrated files are generated output, not source. `session-logs/` and `usage-data/` are git-ignored; **never commit or force-add them** to a PR.

## Data Availability

These files are only present when the coding agent environment has Azure Storage configured via the `copilot` GitHub environment. If the files don't exist, Azure Storage is not configured for this repository.

## Data Sources

### 1. Session Log Files — `./session-logs/`

**What**: Raw AI-coding session log files (Copilot Chat, Copilot CLI, Claude Code/Desktop and other supported editors) downloaded from Azure Blob Storage. These contain the full conversation history including prompts, responses, model information, and tool calls.

**Structure**:
```
./session-logs/
└── {datasetId}/
    └── {machineId}/
        └── {YYYY-MM-DD}/
            ├── session-abc123.json
            └── 3a364aa6-b270-4d67-b1df-39841ccb74b0.jsonl
```

**Date range**: Last 7 days of session data.

**File formats**: Files arrive as `.json` and `.jsonl`, decompressed from `.gz` uploads or downloaded as-is when the uploader's `blobCompressFiles` setting is off. A download contains both formats, and in recent data nearly all of them are `.jsonl`. Always search for both extensions; a `*.json`-only search silently skips most sessions.

- **`.jsonl`** — one JSON event per line. The event shape depends on the editor that wrote it (Claude Code/Desktop, Copilot CLI, VS Code Chat delta logs, ...), so look up the file's editor in the [editor type manifest](#editor-type-manifest--session-logseditor-typesjson) and its schema under `docs/logFilesSchema/`. For token and model numbers, prefer the shared parsers in the repo-root `src/` (`estimateTokensFromJsonlSession()`, `getModelUsageFromSession()`) over hand-rolled `jq`.
- **`.json`** — a whole Copilot Chat session in one document, with this structure:

```json
{
  "requests": [
    {
      "message": {
        "parts": [{ "text": "user prompt text" }]
      },
      "response": [
        { "value": "assistant response text" }
      ],
      "result": {
        "metadata": {
          "modelId": "gpt-4o"
        }
      }
    }
  ]
}
```

**Key fields** (`.json` Copilot Chat sessions):
- `requests[].message.parts[].text` — User input (input tokens)
- `requests[].response[].value` — Assistant output (output tokens)
- `requests[].result.metadata.modelId` — Model used
- `requests.length` — Number of interactions

**How to analyze**: Use `jq`, Node.js, or Python to parse and aggregate. Example:
```bash
# Inventory every downloaded session file, both formats
find ./session-logs -type f \( -name "*.json" -o -name "*.jsonl" \) ! -name ".editor-types.json" | wc -l

# Sessions per editor (covers .json and .jsonl alike)
jq -r '.[]' ./session-logs/.editor-types.json | sort | uniq -c

# Count total interactions across the .json Copilot Chat sessions only
find ./session-logs -name "*.json" ! -name ".editor-types.json" -exec jq '.requests | length' {} \; | paste -sd+ | bc

# List models used in the .json Copilot Chat sessions only
find ./session-logs -name "*.json" ! -name ".editor-types.json" -exec jq -r '.requests[].result.metadata.modelId // empty' {} \; | sort -u
```

### Editor Type Manifest — `./session-logs/.editor-types.json`

**What**: A JSON manifest mapping each downloaded session file's relative path to its source editor type (e.g., "VS Code", "Copilot CLI", "JetBrains"). Built from blob metadata during the download workflow.

**Format**:
```json
{
  "default/machineId/2026-09-14/session-abc123.json": "VS Code",
  "default/machineId/2026-09-14/events.jsonl": "Copilot CLI"
}
```

**Usage**: Load the manifest to classify session files by editor without relying on filename heuristics or content sniffing.
```javascript
const editorTypes = require('./session-logs/.editor-types.json');
// editorTypes['default/machineId/2026-09-14/session-abc123.json'] === 'VS Code'
```

**Note**: Only blobs uploaded after the `editorType` metadata feature was added will have entries. Older uploads will be absent from the manifest.

### 2. Aggregated Usage Data — `./usage-data/usage-agg-daily.json`

**What**: Pre-aggregated daily token usage data from Azure Table Storage. This is the same data the extension syncs to the backend — rolled up by day, model, workspace, machine, and user.

**Date range**: Last 30 days (configurable via `COPILOT_TABLE_DATA_DAYS` environment variable).

**File format**: JSON array of usage entities:

```json
[
  {
    "partitionKey": "ds:default|d:2026-02-10",
    "rowKey": "m:gpt-4o|w:my-project|mc:machine123|u:user456",
    "datasetId": "default",
    "day": "2026-02-10",
    "model": "gpt-4o",
    "workspaceId": "my-project",
    "workspaceName": "My Project",
    "machineId": "machine123",
    "machineName": "My Laptop",
    "userId": "user456",
    "inputTokens": 15000,
    "outputTokens": 8000,
    "interactions": 42,
    "updatedAt": "2026-02-10T23:59:59.999Z"
  }
]
```

**Key fields**:
- `day` — Date in YYYY-MM-DD format
- `model` — AI model name (e.g., `gpt-4o`, `claude-3-5-sonnet-20241022`)
- `inputTokens` / `outputTokens` — Token counts for that day/model/workspace combination
- `interactions` — Number of Copilot interactions
- `workspaceName` — Human-readable workspace name
- `machineName` — Human-readable machine name
- `userId` — User identifier (if team sharing is enabled)

**How to analyze**: Load the JSON and aggregate. Example with Node.js:
```javascript
const data = require('./usage-data/usage-agg-daily.json');

// Total tokens by model
const byModel = {};
for (const row of data) {
  if (!byModel[row.model]) byModel[row.model] = { input: 0, output: 0, interactions: 0 };
  byModel[row.model].input += row.inputTokens;
  byModel[row.model].output += row.outputTokens;
  byModel[row.model].interactions += row.interactions;
}
console.log(byModel);
```

## Cost Estimation

Use the aggregated data together with pricing from `src/modelPricing.json`:

```javascript
const pricing = require('./src/modelPricing.json');
const data = require('./usage-data/usage-agg-daily.json');

let totalCost = 0;
for (const row of data) {
  const price = pricing.pricing[row.model];
  if (price) {
    totalCost += (row.inputTokens / 1_000_000) * price.inputCostPerMillion;
    totalCost += (row.outputTokens / 1_000_000) * price.outputCostPerMillion;
  }
}
console.log(`Estimated total cost: $${totalCost.toFixed(2)}`);
```

## Checking Data Availability

Before using the data, check if the files exist:

```bash
# Check for session logs
[ -d ./session-logs ] && echo "Session logs available" || echo "No session logs"

# Check for aggregated data
[ -f ./usage-data/usage-agg-daily.json ] && echo "Aggregated data available" || echo "No aggregated data"
```

If neither directory exists, Azure Storage is not configured. See the `azure-storage-loader` skill and `docs/features/BLOB-UPLOAD.md` for setup instructions.

## Code knowledge graph (graphify)

The same setup workflow builds a code-only graphify knowledge graph at **`.graphify-agent/graph.json`** (local AST parsing, no secrets, non-blocking — it can be missing if the build failed; then fall back to ordinary file search). For structural questions (what calls a symbol, what a change reaches) prefer it over fanning `grep` across the tree:

```bash
export GRAPHIFY_OUT=.graphify-agent
graphify query "how does the CLI attribute per-model cost"
graphify explain "getModelUsageFromSession"
graphify affected "src/tokenEstimation.ts"     # blast radius
graphify path "extension.ts" "modelPricing.json"
```

The graph is a setup-time snapshot and covers code only (not docs). Refresh it with `GRAPHIFY_OUT=.graphify-agent graphify extract . --code-only --no-viz`. CI builds into `.graphify-agent/`; never build into the default `graphify-out/` (it is git-ignored, nothing in it is committed, and a stale local copy there is not the CI graph), and do not use `graphify update .` for this.

## Related Files

- `docs/features/BLOB-UPLOAD.md` — Full blob upload documentation and setup guide
- `docs/features/BLOB-UPLOAD-QUICKSTART.md` — Quick start for blob upload and coding agent access
- `.github/skills/azure-storage-loader/SKILL.md` — Azure Table Storage loader skill
- `.github/skills/copilot-log-analysis/SKILL.md` — Session file analysis techniques
- `src/modelPricing.json` — Model pricing data for cost estimation
- `src/tokenEstimators.json` — Character-to-token estimation ratios
- `.github/workflows/copilot-setup-steps.yml` — Workflow that downloads the data
