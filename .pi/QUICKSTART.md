# Quick Start Guide

## ✅ Setup Complete!

Your repository now has a complete **code coverage improvement automation system** configured at `.pi/`.

## 🎯 What You Can Do Now

### 1. **Find Coverage Opportunities**
```json
{
  "agent": "coverage-finder",
  "task": "Analyze the codebase and identify all coverage improvement opportunities",
  "output": "coverage-opportunities.json"
}
```

### 2. **Run Full Coverage Improvement Pipeline**
```json
{
  "chain": "coverage-improvement",
  "async": true
}
```

This will:
- Find all coverage gaps
- Spawn up to **5 parallel workers** to implement fixes
- Generate a comprehensive report

### 3. **Run with Slash Commands**
```
/run-chain coverage-improvement
```

## 📋 Files Created

| File | Purpose |
|------|---------|
| `.pi/agents/coverage-finder.md` | Agent that identifies coverage gaps |
| `.pi/chains/coverage-improvement.chain.json` | Workflow: find → parallel fix (max 5) → synthesize |
| `.pi/settings.json` | Project-specific defaults |
| `.pi/README.md` | Full documentation |
| `.pi/QUICKSTART.md` | This file |

## 🔧 Configuration Options

### Change Max Concurrency
Edit `.pi/chains/coverage-improvement.chain.json`:
```json
"concurrency": 5  // Change this number
```

### Use Different Models
Edit `.pi/settings.json`:
```json
"agentOverrides": {
  "coverage-finder": { "model": "anthropic/claude-3-pro" },
  "worker": { "model": "mistral/mistral-medium-3.5" }
}
```

### Adjust Timeout
Edit `.pi/settings.json`:
```json
"coverage-finder": {
  "maxExecutionTimeMs": 600000  // 10 minutes
}
```

## 💡 Pro Tips

### Test the Finder First
```json
{
  "agent": "coverage-finder",
  "task": "Analyze src/ directory only",
  "output": "test-coverage.json"
}
```

### Limit Scope
```json
{
  "chain": [
    {
      "agent": "coverage-finder",
      "task": "Find coverage gaps in src/services/ only"
    }
  ]
}
```

### Monitor Progress
```json
{ "action": "status" }
```

Shows all active async runs with their current state.

## 🚀 Example: Full Workflow

```json
{
  "chain": "coverage-improvement",
  "async": true,
  "progress": true,
  "chainDir": "./coverage-reports/$(date +%Y%m%d-%H%M%S)"
}
```

This runs the complete pipeline and saves all outputs to a timestamped directory.

## 📊 What Each Worker Does

For each coverage opportunity, a worker will:
1. Read the target source file
2. Understand the uncovered code
3. Create/update test files
4. Write focused tests for the gap
5. Run tests to verify coverage
6. Report results (files changed, test output, new coverage %)

## ⚠️ Important Notes

- **Workers only modify test files**, never source code
- Each worker has **fresh context** for independent analysis
- **5 concurrent workers max** prevents resource overload
- All outputs saved to chain directory for review
- Failed opportunities are reported but don't stop the pipeline

## 🎓 Next Steps

1. **Test the finder**: Run coverage-finder on a small directory
2. **Review opportunities**: Check the output JSON for accuracy
3. **Tune thresholds**: Adjust what counts as "low coverage" in the agent
4. **Customize workers**: Modify the worker task for project-specific patterns
5. **Commit to repo**: Share the `.pi/` directory with your team

## 🔗 Related Commands

| Command | Purpose |
|---------|---------|
| `/subagents-doctor` | Diagnose subagent setup |
| `/run coverage-finder` | Quick test of the finder |
| `/chain coverage-improvement` | Alternative syntax |
| `subagent({ action: "status" })` | Check running tasks |

---

**Need help?** Check `.pi/README.md` for detailed documentation.
