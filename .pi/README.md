# Pi Subagents Configuration for ai-engineering-fluency

This directory contains the subagent configuration for automated code coverage improvement workflows.

## 📁 Structure

```
.pi/
├── agents/                    # Custom agent definitions
│   └── coverage-finder.md     # Finds coverage gaps and opportunities
├── chains/                    # Pre-defined workflow chains
│   └── coverage-improvement.chain.json  # Full coverage improvement pipeline
├── settings.json             # Project-specific overrides
└── README.md                  # This file
```

## 🤖 Available Agents

### coverage-finder
- **Purpose**: Identifies code coverage gaps and improvement opportunities
- **Output**: Structured JSON with prioritized opportunities
- **Features**:
  - Discovers test files and coverage reports
  - Analyzes coverage data (lcov, json, xml formats)
  - Identifies uncovered functions and lines
  - Prioritizes by impact and feasibility
  - Provides actionable suggestions for each gap

## 🔗 Workflow Chains

### coverage-improvement.chain.json
A complete pipeline that:

1. **Finds Opportunities** → Runs `coverage-finder` to identify all coverage gaps
2. **Parallel Implementation** → Spawns worker subagents for each opportunity
3. **Synthesis** → Combines all results into a final report

**Key Features:**
- ✅ Max concurrency of **5 subagents** at a time
- ✅ Fresh context for each worker (prevents contamination)
- ✅ Structured output for all fixes
- ✅ Automatic synthesis of results
- ✅ Async execution (non-blocking)

## 🚀 How to Use

### Option 1: Run the Full Chain

```json
{
  "chain": "coverage-improvement",
  "async": true,
  "progress": true
}
```

Or via slash command:
```
/run-chain coverage-improvement
```

### Option 2: Run Coverage Finder Only

```json
{
  "agent": "coverage-finder",
  "task": "Analyze the codebase and identify coverage improvement opportunities",
  "output": "coverage-report.json"
}
```

### Option 3: Manual Parallel Execution

```json
{
  "tasks": [
    {
      "agent": "coverage-finder",
      "task": "Find all coverage gaps in src/ directory",
      "as": "opportunities"
    }
  ],
  "concurrency": 1
}
```

Then use the output to manually create worker tasks.

## 🎯 Customization

### Modify Agent Behavior
Edit `.pi/agents/coverage-finder.md` to:
- Change the model or thinking level
- Adjust the coverage threshold
- Modify the output format
- Add custom tools or constraints

### Adjust Concurrency
Edit `.pi/chains/coverage-improvement.chain.json`:
- Change `"concurrency": 5` to your desired limit
- Modify `"maxItems": 50` to limit total opportunities processed

### Override Defaults
Edit `.pi/settings.json` to:
- Change default models for agents
- Adjust execution timeouts
- Set project-wide defaults

## 📊 Expected Output

### From coverage-finder:
```json
{
  "opportunities": [
    {
      "id": "unique-id",
      "file": "src/module/file.ts",
      "function": "functionName",
      "lines": [10, 15, 20],
      "coverage": 0,
      "type": "uncovered",
      "priority": "high",
      "description": "...",
      "suggestion": "..."
    }
  ],
  "summary": { ... }
}
```

### From each worker:
- Test files created/modified
- Test execution results
- New coverage metrics
- Any issues encountered

### Final Report:
- Complete summary of all fixes
- Coverage improvement metrics
- Failed/skipped opportunities
- Next steps recommendations

## 🔧 Requirements

- Pi subagents extension must be installed
- Project must have test framework with coverage support (Jest, Vitest, etc.)
- Coverage reports should be available or generatable

## 📝 Notes

- Workers operate with **fresh context** to ensure clean, independent analysis
- Each worker focuses on **one specific opportunity** to prevent scope creep
- Source code is **never modified** - only test files are created/updated
- The system automatically handles up to 50 opportunities (configurable)
- All outputs are saved to the chain directory for review

## 🎨 Advanced Usage

### Filter by Priority
Modify the chain to filter opportunities before processing:

```json
{
  "agent": "context-builder",
  "task": "Filter {outputs.coverage-analysis.opportunities} to only high priority items",
  "as": "high-priority-opportunities"
}
```

### Custom Worker Model
Override the worker model in the chain:

```json
{
  "parallel": {
    "agent": "worker",
    "model": "anthropic/claude-3-pro",
    "task": "..."
  }
}
```

### Sequential Processing
Change `concurrency: 1` for sequential processing (useful for debugging)
