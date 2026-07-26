# Graph Report - src  (2026-07-26)

## Corpus Check
- Large corpus: 638 files · ~1,370,585 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2425 nodes · 5440 edges · 122 communities (107 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Maturity & Fluency Scoring
- Token Estimator Config
- Session Discovery & Ecosystem
- Codex CLI Adapter
- Usage Analysis
- Devin CLI Adapter
- Gemini CLI Adapter
- Cline Adapter
- OpenCode Adapter
- Adapter Registry
- Kiro Adapter
- PI Adapter
- Crush Adapter
- Cursor Adapter
- Visual Studio Adapter
- Session Parser
- Shared Type Definitions
- Claude Desktop Adapter
- Antigravity Adapter
- Token Estimation
- Eclipse Adapter
- Kiro CLI Adapter
- Claude Code Adapter (Core)
- Workspace Helpers & Path Utils
- Tool Curation
- Mistral Vibe Adapter
- Chart Data Builder
- Copilot CLI Store
- Stats Helpers
- Azure Error Classifier
- Cline Adapter (Discovery)
- Copilot CLI OTEL
- Continue Adapter
- Content Reference Analysis
- Copilot Model Pricing
- Adapter Predicates
- JetBrains Session Parsing
- Multi-Adapter Usage Analysis
- Model Efficiency
- Claude Code Adapter (Extended)
- Module Group 40
- Module Group 41
- Module Group 42
- Module Group 43
- Module Group 44
- Module Group 45
- Module Group 46
- Module Group 47
- Daily Attribution
- Module Group 49
- Module Group 50
- Cache Policy
- Module Group 52
- Module Group 53
- Model Pricing: Modelpricing
- Module Group 55
- Module Group 56
- Model Pricing: Claude Sonnet 4
- Module Group 58
- Module Group 59
- Module Group 60
- Model Pricing: Claude Haiku 4
- Model Pricing: Claude Haiku 4
- Model Pricing: Claude Haiku Cachecreation1Hcostpermillion
- Model Pricing: Claude Opus 4
- Model Pricing: Claude Opus 4
- Model Pricing: Claude Opus 4
- Model Pricing: Claude Opus 4
- Model Pricing: Claude Opus 4
- Model Pricing: Claude Opus 4
- Model Pricing: Claude Sonnet 3
- Model Pricing: Claude Sonnet 3
- Model Pricing: Claude Sonnet 4
- Model Pricing: Claude Sonnet 4
- Module Group 74
- Module Group 75
- Module Group 76
- Module Group 77
- Model Pricing: Gemini 2 5
- Model Pricing: Gemini 3 Flash
- Model Pricing: Gpt 4 1
- Model Pricing: Gpt 4 1
- Model Pricing: Gpt 4 1
- Model Pricing: Gpt 4O Cachedinputcostpermillion
- Model Pricing: Gpt 4O Mini
- Model Pricing: Gpt 4O Mini
- Model Pricing: Gpt 5 3
- Model Pricing: Gpt 5 4
- Model Pricing: Gpt 5 4
- Model Pricing: Gpt 5 4
- Model Pricing: Gpt 5 Mini
- Module Group 91
- Module Group 92
- Model Pricing: Gemini 2 0
- Model Pricing: Gemini 2 0
- Model Pricing: Gemini 2 5
- Model Pricing: Gemini 2 5
- Model Pricing: Gemini 3 Pro
- Model Pricing: Gpt 3 5
- Model Pricing: Gpt 4 Category
- Model Pricing: Gpt 4 Turbo
- Model Pricing: Gpt 5 1
- Model Pricing: Gpt 5 1
- Model Pricing: Gpt 5 1
- Model Pricing: Gpt 5 1
- Model Pricing: Gpt 5 2
- Model Pricing: Gpt 5 2
- Model Pricing: Gpt 5 2
- Model Pricing: Gpt 5 Category
- Model Pricing: Gpt 5 Codex
- Model Pricing: O1 Mini Category
- Model Pricing: O1 Preview Category
- Model Pricing: O3 Mini Category
- Model Pricing: O4 Mini Category
- Module Group 114
- Module Group 115
- Module Group 116
- Module Group 117
- Module Group 118
- Module Group 119
- Module Group 120
- Module Group 121

## God Nodes (most connected - your core abstractions)
1. `ModelUsage` - 115 edges
2. `estimators` - 86 edges
3. `IEcosystemAdapter` - 63 edges
4. `ChatTurn` - 60 edges
5. `CodexCliDataAccess` - 54 edges
6. `pricing` - 50 edges
7. `WindsurfDataAccess` - 48 edges
8. `GeminiCliDataAccess` - 47 edges
9. `IDiscoverableEcosystem` - 43 edges
10. `UsageAnalysisAdapterContext` - 43 edges

## Surprising Connections (you probably didn't know these)
- `BatGroupAcc` --references--> `ChatTurn`  [EXTRACTED]
  antigravity.ts → types.ts
- `EjtsState` --references--> `ModelUsage`  [EXTRACTED]
  tokenEstimation.ts → types.ts
- `isCopilotCliSessionPath()` --calls--> `normalizePath()`  [EXTRACTED]
  adapters/adapterPredicates.ts → utils/pathUtils.ts
- `isJetBrainsSessionPath()` --calls--> `normalizePath()`  [EXTRACTED]
  adapters/adapterPredicates.ts → utils/pathUtils.ts
- `AdapterRegistryDeps` --references--> `AntigravityDataAccess`  [EXTRACTED]
  adapters/adapterRegistry.ts → antigravity.ts

## Import Cycles
- None detected.

## Communities (122 total, 15 thin omitted)

### Community 0 - "Maturity & Fluency Scoring"
Cohesion: 0.06
Nodes (86): _agAddBasicEvidence(), _agAddEditScopeEvidence(), _agApplyMultiAgentBooster(), _agApplyStageQualifications(), _agBuildTips(), _agQualifiesForStage3(), _agQualifiesForStage4(), _agQualifiesMultiFileStage4() (+78 more)

### Community 1 - "Token Estimator Config"
Cohesion: 0.02
Nodes (86): estimators, claude-fable-5, claude-haiku, claude-haiku-4.5, claude-opus-4.1, claude-opus-4.5, claude-opus-4.6, claude-opus-4.6-fast (+78 more)

### Community 2 - "Session Discovery & Ecosystem"
Cohesion: 0.07
Nodes (13): isDiscoverable(), SessionDiscovery, SessionDiscoveryDeps, SessionFileDetails, normalizePathForDedup(), CascadeTrajectoryStep, CascadeTrajectorySummary, GetAllCascadeTrajectoriesResponse (+5 more)

### Community 3 - "Codex CLI Adapter"
Cohesion: 0.07
Nodes (3): CodexCliAdapter, CodexCliDataAccess, SessionUsageAnalysis

### Community 4 - "Usage Analysis"
Cohesion: 0.04
Nodes (58): LanguageUsage, _accumulateRequestTiming(), AgentMetrics, analyzeCliAttachments(), analyzeContextReferences(), _arcProcessDynamicPart(), _arcProcessMessage(), _arcProcessPart() (+50 more)

### Community 5 - "Devin CLI Adapter"
Cohesion: 0.07
Nodes (10): DevinCliAdapter, DbCacheEntry, DevinCliDataAccess, DevinCliMessageNode, DevinCliSession, DevinCliToolCall, firstNumericField(), ParsedChatMessage (+2 more)

### Community 6 - "Gemini CLI Adapter"
Cohesion: 0.06
Nodes (16): compareByTimestampThenLine(), GeminiCliAssistantRecord, GeminiCliAssistantTokens, GeminiCliDataAccess, GeminiCliParsedSession, GeminiCliSessionHeader, GeminiCliToolCallRecord, GeminiCliUserRecord (+8 more)

### Community 7 - "Cline Adapter"
Cohesion: 0.06
Nodes (13): CopilotChatAdapter, getVSCodeUserPaths(), getWSLWindowsPaths(), getWSLWindowsPathsSync(), isWSL(), runWithConcurrency(), scanGlobalStorageRecursively(), SYSTEM_USER_FOLDERS (+5 more)

### Community 8 - "OpenCode Adapter"
Cohesion: 0.08
Nodes (3): OpenCodeAdapter, OpenCodeDataAccess, withErrorRecovery()

### Community 9 - "Adapter Registry"
Cohesion: 0.17
Nodes (16): buildAdapterRegistry(), createDataAccessInstances(), DataAccessInstances, ContinueAdapter, NOTE: The canonical JavaScript implementation is in:, VSCODE_VARIANTS, KiroCliAdapter, ContinueTurn (+8 more)

### Community 10 - "Kiro Adapter"
Cohesion: 0.08
Nodes (5): KiroDataAccess, KiroExecutionRecord, KiroSessionIndexEntry, KiroTurn, NON_TOOL_ACTION_TYPES

### Community 14 - "Visual Studio Adapter"
Cohesion: 0.09
Nodes (3): VisualStudioAdapter, SCAN_SKIP_DIRS, VisualStudioDataAccess

### Community 15 - "Session Parser"
Cohesion: 0.11
Nodes (32): accumulateRequestInput(), accumulateResponseItems(), applyDelta(), applyDeltaKind1(), applyDeltaKind2(), extractActualTokenCount(), extractJsonRequests(), extractResponseAndThinkingText() (+24 more)

### Community 16 - "Shared Type Definitions"
Cohesion: 0.05
Nodes (39): AgentRepoSummary, AgentSessionSource, AgentSessionsResult, AgentTypeUsage, ApplyButtonUsage, ChartDataPayload, ChartPeriodData, ChartTimeWindow (+31 more)

### Community 18 - "Antigravity Adapter"
Cohesion: 0.09
Nodes (11): AntigravityAdapter, AntigravityDataAccess, AntigravityEntry, AntigravityParsedSession, AntigravityToolCall, _batCollectGroupData(), BatGroupAcc, _batHandlePlannerResponse() (+3 more)

### Community 19 - "Token Estimation"
Cohesion: 0.07
Nodes (34): _adApplyKind1(), _adApplyKind2(), _adApplyKind2Target(), _adGetOrCreate(), applyDelta(), BretState, DeltaEvent, _displayNameLookupCache (+26 more)

### Community 23 - "Workspace Helpers & Path Utils"
Cohesion: 0.10
Nodes (28): normalizePathSeparators, ContentReferenceData, ContentReferenceItem, CustomizationPattern, CustomizationPatternsConfig, detectClaudeCodeEditorVariant(), detectCliAgentStoreFromPath(), detectCopilotFamilyFromPath() (+20 more)

### Community 24 - "Tool Curation"
Cohesion: 0.10
Nodes (29): analyzeToolCuration(), buildBloatEstimate(), buildCurationRecommendations(), buildMcpEntriesFromJson(), buildUsedCounts(), collectBlockScalarLines(), collectSkillsFromDirectory(), collectSkillsFromRoot() (+21 more)

### Community 26 - "Chart Data Builder"
Cohesion: 0.16
Nodes (29): aggregateBillingGroupModelUsage(), aggregateBillingGroupSessions(), BucketEntry, buildBillingGroupCostDatasets(), buildChartData(), buildDailyBuckets(), buildEditorCostDatasets(), buildEditorSessionsDatasets() (+21 more)

### Community 28 - "Stats Helpers"
Cohesion: 0.11
Nodes (27): addLanguageUsage(), aggregatePeriodStats(), AggregateResult, _apsBuildDayFields(), _apsBumpDailyEntry(), _apsBumpPeriod(), ApsDayFields, _apsGetOrCreateDailyEntry() (+19 more)

### Community 29 - "Azure Error Classifier"
Cohesion: 0.11
Nodes (20): AZURE_ERROR_CODES, extractErrorInfo(), HTTP_STATUS, isAuthError(), isAzurePolicyDisallowedError(), isConflictError(), isNetworkError(), isNotFoundError() (+12 more)

### Community 30 - "Cline Adapter (Discovery)"
Cohesion: 0.12
Nodes (6): ClineAdapter, ClineTurn, CodexRolloutSummary, normalizeGeminiModelId(), createEmptyContextRefs(), ChatTurn

### Community 31 - "Copilot CLI OTEL"
Cohesion: 0.11
Nodes (26): accumulateOtelChatSpanUsage(), buildOtelReadPlan(), cliStoreAccess, consolidateOtelRecord(), CopilotCliOtelSessionUsage, CopilotCliOtelStatus, fileOffsets, getCopilotCliOtelDir() (+18 more)

### Community 33 - "Content Reference Analysis"
Cohesion: 0.09
Nodes (28): _acrClassifyFilePath(), _acrGetReference(), _acrProcessReference(), analyzeContentReferences(), analyzeRequestContext(), analyzeVariableData(), _asuCheckImplicitSelection(), _asuExtractToolName() (+20 more)

### Community 34 - "Copilot Model Pricing"
Cohesion: 0.34
Nodes (26): copilotPricing, copilotPricing, copilotPricing, copilotPricing, copilotPricing, copilotPricing, copilotPricing, copilotPricing (+18 more)

### Community 35 - "Adapter Predicates"
Cohesion: 0.15
Nodes (24): isJetBrainsSessionPath(), isAnalyzable(), detectJetBrainsModeFromContent(), isJsonlContent(), isUuidPointerFile(), analyzeSessionUsage(), _asuApplyCliThinkingEffort(), _asuIsDeltaBased() (+16 more)

### Community 36 - "JetBrains Session Parsing"
Cohesion: 0.15
Nodes (23): detectJetBrainsModelHintFromContent(), _jbpCreateDefaultSession(), _jbpCreateInitialState(), _jbpDispatchEvent(), _jbpExtractBlockText(), _jbpFinalizeSession(), _jbpGetMessageText(), _jbpHandleAssistantMessage() (+15 more)

### Community 37 - "Multi-Adapter Usage Analysis"
Cohesion: 0.21
Nodes (8): UsageAnalysisAdapterContext, enumerateRuntimeTools(), applyModelTierClassification(), createEmptySessionUsageAnalysis(), recordToolOrMcpInvocation(), extractMcpServerName(), isMcpTool(), normalizeMcpToolName()

### Community 38 - "Model Efficiency"
Cohesion: 0.13
Nodes (19): analyzeTurnToolCalls(), applyModelUsageToEfficiency(), computeEfficiencyFromTurns(), createEmptyModelEfficiencyCounters(), EDIT_TOOL_NAMES, EfficiencyJsonRequest, EfficiencyTurn, ensureCounters() (+11 more)

### Community 39 - "Claude Code Adapter (Extended)"
Cohesion: 0.17
Nodes (5): CLAUDE_SLASH_ALLOWLIST, ClaudeCodeAdapter, extractClaudeSlashCommand(), ActualUsage, readClaudeCodeEventsForAnalysis()

### Community 41 - "Module Group 41"
Cohesion: 0.12
Nodes (14): CrushDbCacheEntry, CrushProject, SqlDatabase, SqlJsStatic, CursorBubble, CursorComposerData, CursorDbCacheEntry, SqlDatabase (+6 more)

### Community 42 - "Module Group 42"
Cohesion: 0.11
Nodes (4): getEcosystemDisplayName(), IEcosystemAdapter, ModelPricing, UsageAnalysisDeps

### Community 43 - "Module Group 43"
Cohesion: 0.14
Nodes (19): _costBucketFromPricing(), getModelCostBucket(), getModelTier(), _cmsApplyCostCounts(), _cmsApplyTierCounts(), _cmsClassifyModels(), _cmsCountEventRequests(), _cmsCountJsonlRequests() (+11 more)

### Community 44 - "Module Group 44"
Cohesion: 0.14
Nodes (15): CodexRolloutLine, CodexThread, CodexTokenTotals, DbCacheEntry, SqlDatabase, SqlJsStatic, TokenSnapshot, KiroCliMessageRecord (+7 more)

### Community 45 - "Module Group 45"
Cohesion: 0.16
Nodes (4): CopilotCliAdapter, getCopilotCliSessionStateDir(), isCopilotAppClientName(), isMicrosoftScoutCwd()

### Community 46 - "Module Group 46"
Cohesion: 0.19
Nodes (15): COPILOT_CHAT_NON_SESSION_PATTERNS, isCopilotChatNonSessionFile(), isCopilotChatSessionPath(), isCopilotCliSessionPath(), withErrorRecoverySync(), normalizePath(), buildCustomizationEntry(), resolveExactWorkspacePath() (+7 more)

### Community 47 - "Module Group 47"
Cohesion: 0.17
Nodes (14): fileUriToPath(), getRepoNameFromWorkspacePath(), hasWindowsDriveSegment(), normalizeToRepoRoot(), splitNormalizedPath(), buildPotentialGitRoots(), extractCustomAgentName(), extractWorkspaceIdFromSessionPath() (+6 more)

### Community 48 - "Daily Attribution"
Cohesion: 0.27
Nodes (6): DailyFractionStrategy, extractDailyFractions(), JsonDailyFractionStrategy, JsonlDailyFractionStrategy, parseAndValidateTimestamp(), recordTimestamp()

### Community 49 - "Module Group 49"
Cohesion: 0.13
Nodes (15): extractPerRequestUsageFromRawLines(), _gmusApplyMetricEntry(), _gmusBuildEstimatedCliUsage(), _gmusDeltaFallbackExtraction(), _gmusExtractKind0Model(), _gmusExtractKind2Model(), _gmusHandleAssistantMessage(), _gmusHandleShutdownEvent() (+7 more)

### Community 50 - "Module Group 50"
Cohesion: 0.14
Nodes (14): _asuAppendEfficiencyToolCall(), _asuApplyCliLocToEditScope(), _asuApplyToolLoc(), _asuCountTextLines(), _asuEnsureEditScope(), _asuExtractToolResultText(), _asuHandleCliLocEvent(), _asuHandleToolComplete() (+6 more)

### Community 51 - "Cache Policy"
Cohesion: 0.18
Nodes (4): CacheEntryMeta, CachePolicy, CliCachePolicy, VsCodeCachePolicy

### Community 52 - "Module Group 52"
Cohesion: 0.15
Nodes (11): CliStoreDbCacheEntry, CliStoreSession, CliStoreSessionsCacheEntry, CliStoreTurn, CliStoreTurnCountsCacheEntry, isCliStoreTurn(), IMPORTANT: this must NOT simply return `fs.stat()` on the shared .db file —, SqlDatabase (+3 more)

### Community 53 - "Module Group 53"
Cohesion: 0.21
Nodes (10): SessionAggregateInput, ClassificationSignals, classifyByActivityKeywords(), classifyByFallback(), classifyByToolAndTerminalSignals(), classifySessionTask(), deriveSignals(), TaskCategory (+2 more)

### Community 54 - "Model Pricing: Modelpricing"
Cohesion: 0.17
Nodes (11): description, category, inputCostPerMillion, outputCostPerMillion, metadata, disclaimer, lastUpdated, sources (+3 more)

### Community 55 - "Module Group 55"
Cohesion: 0.17
Nodes (10): DeltaTokenStrategy, _ejtsAccumulateModelMetrics(), _ejtsEstimateFromRealOutput(), _ejtsHandleContextTier(), _ejtsHandleShutdown(), _ejtsHandleTruncation(), estimateTokensFromJsonlSession(), EventJsonlTokenStrategy (+2 more)

### Community 56 - "Module Group 56"
Cohesion: 0.25
Nodes (11): mergeEditorModelUsage(), mergeInto(), mergeLanguageUsage(), mergeUsageGroup(), accumulatePeriod(), addEditorUsage(), addModelUsage(), addToDailyEntry() (+3 more)

### Community 57 - "Model Pricing: Claude Sonnet 4"
Cohesion: 0.18
Nodes (11): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+3 more)

### Community 58 - "Module Group 58"
Cohesion: 0.20
Nodes (10): _dtsAddResponseItemTokens(), _dtsCountSubAgentItem(), _dtsExtractSubAgentTokens(), _dtsProcessIncrementalRequests(), _dtsProcessIncrementalResponse(), extractSubAgentData(), getResponseArray(), isSubAgentToolSpecificData() (+2 more)

### Community 59 - "Module Group 59"
Cohesion: 0.24
Nodes (11): getDisplayNameLookup(), getModelFromRequest(), _gmfrFindByDisplayName(), _gmrMatchDisplayName(), accumulateSubAgentTokenUsage(), _gmusEstimateDeltaRequestTokens(), _gmusProcessDeltaRequest(), _gmusProcessJsonRequest() (+3 more)

### Community 60 - "Module Group 60"
Cohesion: 0.27
Nodes (9): CONVERSATIONS_REL, EclipseTurn, _ejtsAccumulateRealOutput(), _ejtsAccumulateThinkingTokens(), _ejtsHandleAssistantMessage(), _ejtsHandleEventType(), _ejtsHandleToolComplete(), estimateTokensFromText() (+1 more)

### Community 61 - "Model Pricing: Claude Haiku 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 62 - "Model Pricing: Claude Haiku 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 63 - "Model Pricing: Claude Haiku Cachecreation1Hcostpermillion"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 64 - "Model Pricing: Claude Opus 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 65 - "Model Pricing: Claude Opus 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 66 - "Model Pricing: Claude Opus 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 67 - "Model Pricing: Claude Opus 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 68 - "Model Pricing: Claude Opus 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 69 - "Model Pricing: Claude Opus 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 70 - "Model Pricing: Claude Sonnet 3"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 71 - "Model Pricing: Claude Sonnet 3"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 72 - "Model Pricing: Claude Sonnet 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 73 - "Model Pricing: Claude Sonnet 4"
Cohesion: 0.20
Nodes (10): cacheCreation1hCostPerMillion, cacheCreationCostPerMillion, cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier (+2 more)

### Community 74 - "Module Group 74"
Cohesion: 0.27
Nodes (10): discoverSkillEntries(), fileUriToPath(), getConfiguredAgentSkillLocations(), getVsCodeSettingsFiles(), readJsonFile(), resolveInstalledPluginSkillDirs(), resolvePluginSkillDirs(), resolveSkillPath() (+2 more)

### Community 77 - "Module Group 77"
Cohesion: 0.28
Nodes (9): jsonRequestToToolCalls(), _applyJsonRequestsEfficiency(), _asuReconstructAndProcessDeltaState(), _pdsaCountModelSwitches(), _pdsaExtractModelSwitching(), _pdsaExtractThinkingEffort(), _pdsaGetReqModel(), _pdsaGetSessionDefaultModel() (+1 more)

### Community 78 - "Model Pricing: Gemini 2 5"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-2.5-pro, Gemini 2.5 Pro

### Community 79 - "Model Pricing: Gemini 3 Flash"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-3-flash, Gemini 3 Flash

### Community 80 - "Model Pricing: Gpt 4 1"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4.1, GPT-4.1

### Community 81 - "Model Pricing: Gpt 4 1"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4.1-mini, GPT-4.1 Mini

### Community 82 - "Model Pricing: Gpt 4 1"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4.1-nano, GPT-4.1 Nano

### Community 83 - "Model Pricing: Gpt 4O Cachedinputcostpermillion"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4o, GPT-4o

### Community 84 - "Model Pricing: Gpt 4O Mini"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4o-mini-2024-07-18, GPT-4o-mini (2024-07-18)

### Community 85 - "Model Pricing: Gpt 4O Mini"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4o-mini, GPT-4o-mini

### Community 86 - "Model Pricing: Gpt 5 3"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.3-codex, GPT-5.3 Codex

### Community 87 - "Model Pricing: Gpt 5 4"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.4, GPT-5.4

### Community 88 - "Model Pricing: Gpt 5 4"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.4-mini, GPT-5.4 mini

### Community 89 - "Model Pricing: Gpt 5 4"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.4-nano, GPT-5.4 nano

### Community 90 - "Model Pricing: Gpt 5 Mini"
Cohesion: 0.25
Nodes (8): cachedInputCostPerMillion, category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5-mini, GPT-5 Mini

### Community 91 - "Module Group 91"
Cohesion: 0.29
Nodes (8): stripWindowsDriveUriPrefix(), toPlatformPath(), collectFilePathsFromRefs(), extractRepositoryFromContentReferences(), normalizeWindowsUriPath(), parseGitRemoteUrl(), tryReadGitConfigRemote(), tryReadWorktreeGitRemote()

### Community 92 - "Module Group 92"
Cohesion: 0.25
Nodes (8): detectToolEditorFromRootPath(), getEditorNameFromRoot(), isCodeExplorationRoot(), isCodeInsidersRoot(), isCopilotCliRoot(), isJetBrainsRoot(), isVisualStudioRoot(), isVSCodeRoot()

### Community 93 - "Model Pricing: Gemini 2 0"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-2.0-flash, Gemini 2.0 Flash

### Community 94 - "Model Pricing: Gemini 2 0"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-2.0-flash-lite, Gemini 2.0 Flash Lite

### Community 95 - "Model Pricing: Gemini 2 5"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-2.5-flash, Gemini 2.5 Flash

### Community 96 - "Model Pricing: Gemini 2 5"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-2.5-flash-lite, Gemini 2.5 Flash Lite

### Community 97 - "Model Pricing: Gemini 3 Pro"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gemini-3-pro, Gemini 3 Pro

### Community 98 - "Model Pricing: Gpt 3 5"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-3.5-turbo, GPT-3.5-Turbo

### Community 99 - "Model Pricing: Gpt 4 Category"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4, GPT-4

### Community 100 - "Model Pricing: Gpt 4 Turbo"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-4-turbo, GPT-4 Turbo

### Community 101 - "Model Pricing: Gpt 5 1"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.1, GPT-5.1

### Community 102 - "Model Pricing: Gpt 5 1"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.1-codex, GPT-5.1 Codex

### Community 103 - "Model Pricing: Gpt 5 1"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.1-codex-max, GPT-5.1 Codex Max

### Community 104 - "Model Pricing: Gpt 5 1"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.1-codex-mini, GPT-5.1 Codex Mini (Preview)

### Community 105 - "Model Pricing: Gpt 5 2"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.2, GPT-5.2

### Community 106 - "Model Pricing: Gpt 5 2"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.2-codex, GPT-5.2 Codex

### Community 107 - "Model Pricing: Gpt 5 2"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5.2-pro, GPT-5.2 Pro

### Community 108 - "Model Pricing: Gpt 5 Category"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5, GPT-5

### Community 109 - "Model Pricing: Gpt 5 Codex"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, gpt-5-codex, GPT-5 Codex (Preview)

### Community 110 - "Model Pricing: O1 Mini Category"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, o1-mini, o1-mini

### Community 111 - "Model Pricing: O1 Preview Category"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, o1-preview, o1-preview

### Community 112 - "Model Pricing: O3 Mini Category"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, o3-mini, o3-mini

### Community 113 - "Model Pricing: O4 Mini Category"
Cohesion: 0.29
Nodes (7): category, displayNames, inputCostPerMillion, outputCostPerMillion, tier, o4-mini, o4-mini

### Community 114 - "Module Group 114"
Cohesion: 0.40
Nodes (4): extractCopilotCliSessionId(), getCopilotCliExactUsage(), getCopilotCliStoreUsage(), _gmusResolveJsonl()

### Community 116 - "Module Group 116"
Cohesion: 0.47
Nodes (3): normalizeClaudeModelId(), normalizePathForComparison(), getEditorTypeFromPath()

### Community 117 - "Module Group 117"
Cohesion: 0.33
Nodes (6): _cmsExtractModelMetaFields(), _cmsIsAutoModel(), _cmsIsFoundryModel(), _cmsNormalizeText(), _cmsTrackModelSelectionSignals(), _cmsTrackSelectionSignalsFromParsedJson()

### Community 118 - "Module Group 118"
Cohesion: 0.40
Nodes (4): getWindowData(), _modelNames, _pricingData, PricingEntry

### Community 119 - "Module Group 119"
Cohesion: 0.50
Nodes (5): _bretExtractEffortFromModel(), _bretHandleKind0(), _bretHandleKind1(), _bretHandleKind2(), buildReasoningEffortTimeline()

### Community 120 - "Module Group 120"
Cohesion: 0.67
Nodes (3): isGuidMcpTool(), resolveGuidMcpToolName(), toTitleCase()

## Knowledge Gaps
- **583 isolated node(s):** `VSCODE_VARIANTS`, `AntigravityEntry`, `AntigravityToolCall`, `AntigravityParsedSession`, `CacheEntryMeta` (+578 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ModelUsage` connect `Adapter Registry` to `Session Discovery & Ecosystem`, `Codex CLI Adapter`, `Usage Analysis`, `Devin CLI Adapter`, `Gemini CLI Adapter`, `Cline Adapter`, `OpenCode Adapter`, `Kiro Adapter`, `PI Adapter`, `Crush Adapter`, `Cursor Adapter`, `Visual Studio Adapter`, `Shared Type Definitions`, `Claude Desktop Adapter`, `Antigravity Adapter`, `Token Estimation`, `Eclipse Adapter`, `Kiro CLI Adapter`, `Claude Code Adapter (Core)`, `Mistral Vibe Adapter`, `Chart Data Builder`, `Copilot CLI Store`, `Stats Helpers`, `Cline Adapter (Discovery)`, `Copilot CLI OTEL`, `Continue Adapter`, `JetBrains Session Parsing`, `Multi-Adapter Usage Analysis`, `Model Efficiency`, `Claude Code Adapter (Extended)`, `Module Group 40`, `Module Group 41`, `Module Group 42`, `Module Group 44`, `Module Group 52`, `Module Group 60`, `Module Group 75`, `Module Group 76`, `Module Group 114`, `Module Group 115`, `Module Group 116`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `IEcosystemAdapter` connect `Module Group 42` to `Session Discovery & Ecosystem`, `Codex CLI Adapter`, `Usage Analysis`, `Devin CLI Adapter`, `Cline Adapter`, `OpenCode Adapter`, `Adapter Registry`, `PI Adapter`, `Crush Adapter`, `Cursor Adapter`, `Visual Studio Adapter`, `Claude Desktop Adapter`, `Antigravity Adapter`, `Mistral Vibe Adapter`, `Cline Adapter (Discovery)`, `Adapter Predicates`, `Multi-Adapter Usage Analysis`, `Claude Code Adapter (Extended)`, `Module Group 40`, `Module Group 45`, `Module Group 75`, `Module Group 76`, `Module Group 115`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `KiroDataAccess` connect `Kiro Adapter` to `Adapter Registry`, `Claude Code Adapter (Core)`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `VSCODE_VARIANTS`, `AntigravityEntry`, `AntigravityToolCall` to the rest of the system?**
  _583 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Maturity & Fluency Scoring` be split into smaller, more focused modules?**
  _Cohesion score 0.055381400208986416 - nodes in this community are weakly interconnected._
- **Should `Token Estimator Config` be split into smaller, more focused modules?**
  _Cohesion score 0.023255813953488372 - nodes in this community are weakly interconnected._
- **Should `Session Discovery & Ecosystem` be split into smaller, more focused modules?**
  _Cohesion score 0.06506849315068493 - nodes in this community are weakly interconnected._