/**
 * Shared type definitions for the Copilot Token Tracker extension.
 * Extracted from extension.ts to reduce file size and improve reusability.
 */

import type { TaskCategory } from './taskClassification';

/**
 * Character-to-token ratio for a specific AI model.
 * The value is a multiplier applied to the character count to estimate token count
 * (e.g. 0.25 means ~4 characters per token).
 */
export type TokenEstimator = number;

export interface TokenUsageStats {
  todayTokens: number;
  monthTokens: number;
  lastUpdated: Date;
}

/**
 * A model identifier string as returned by the AI provider (e.g. "gpt-4o", "claude-sonnet-4-5").
 * May be "unknown" when the model could not be determined from the session data.
 */
export type ModelId = string;

export interface ModelUsage {
  [modelName: ModelId]: {
    inputTokens: number;    // total input tokens (uncached + cached reads + cache creation)
    outputTokens: number;
    cachedReadTokens?: number;     // portion of inputTokens that were cache reads (billed at reduced rate)
    cacheCreationTokens?: number;  // portion of inputTokens used to create cache entries (billed at higher rate)
    /**
     * Portion of cacheCreationTokens written under Anthropic's 1-hour cache TTL
     * (`cache_creation.ephemeral_1h_input_tokens`), billed at a higher rate than the
     * default 5-minute TTL. When present, calculateEstimatedCost() prices this portion
     * with `cacheCreation1hCostPerMillion` and the remainder of cacheCreationTokens with
     * the standard `cacheCreationCostPerMillion` (5-minute) rate.
     */
    cacheCreation1hTokens?: number;
    thinkingTokens?: number;
    /** Number of sessions that used this model in the aggregated period. */
    sessions: number;
  };
}

export interface CopilotLongContextPricing {
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  cachedInputCostPerMillion?: number;
  cacheCreationCostPerMillion?: number;
  cacheCreation1hCostPerMillion?: number;
  threshold?: string;           // input-token threshold above which long-context rates apply (e.g. "> 200K")
}

export interface CopilotPricing {
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  cachedInputCostPerMillion?: number;
  cacheCreationCostPerMillion?: number;
  cacheCreation1hCostPerMillion?: number;
  releaseStatus?: string;       // e.g. "GA" or "Public preview"
  category?: string;            // GitHub Copilot capability category (Lightweight / Versatile / Powerful)
  threshold?: string;           // input-token threshold for the Default tier, when the model is tiered
  /**
   * Optional Long-context tier rates for models that price differently above a
   * context-window threshold. The top-level fields above are the Default tier.
   * Additive — cost calculation uses the Default tier; consumers may opt in.
   */
  longContext?: CopilotLongContextPricing;
}

export interface ModelPricing {
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  cachedInputCostPerMillion?: number;    // cost per million cache-read tokens (e.g. 0.30 for Claude Sonnet 4)
  cacheCreationCostPerMillion?: number;  // cost per million cache-creation tokens, 5-minute TTL (e.g. 3.75 for Claude Sonnet 4)
  cacheCreation1hCostPerMillion?: number; // cost per million cache-creation tokens, 1-hour TTL (e.g. 6.0 for Claude Sonnet 4)
  category?: string;
  tier?: "standard" | "premium" | "unknown";
  displayNames?: string[];
  /**
   * GitHub Copilot AI-Credit per-token pricing (1 credit = $0.01).
   * Source: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
   * When omitted the top-level provider/API rates are used as a fallback proxy.
   */
  copilotPricing?: CopilotPricing;
}

export interface EditorUsage {
  [editorType: string]: {
    tokens: number;
    sessions: number;
    linesAdded?: number;
    linesRemoved?: number;
  };
}

export interface RepositoryUsage {
  [repository: string]: {
    tokens: number;
    sessions: number;
    linesAdded?: number;
    linesRemoved?: number;
  };
}

export interface LanguageUsage {
  [extension: string]: {
    linesAdded: number;
    linesRemoved: number;
  };
}

export interface PeriodStats {
  tokens: number;
  thinkingTokens: number;
  estimatedTokens: number; // Text-based estimate (user messages + responses only)
  actualTokens: number; // Actual LLM API-reported tokens (0 when unavailable)
  sessions: number;
  avgInteractionsPerSession: number;
  avgTokensPerSession: number;
  modelUsage: ModelUsage;
  editorUsage: EditorUsage;
  co2: number;
  treesEquivalent: number;
  waterUsage: number;
  estimatedCost: number;
  /**
   * Estimated cost using GitHub Copilot AI-Credit per-token rates (when available
   * for a given model). Optional/additive so existing fixtures don't need updating.
   * Falls back to provider/API pricing for models without `copilotPricing`.
   */
  estimatedCostCopilot?: number;
  /** Sum of cache-read tokens across all interactions in this period (when available). */
  cachedTokens?: number;
  /**
   * Estimated cost per billing group for this period in USD.
   * Keys are billing group names (e.g. "GitHub Copilot", "Anthropic", "Google").
   * Uses Copilot AI-Credit pricing for the "GitHub Copilot" group; provider/API
   * rates for all others.
   */
  billingGroupCosts?: Record<string, number>;
  /**
   * Per-editor model usage breakdown for this period — mirrors `DailyTokenStats.editorModelUsage`.
   * Lets consumers (e.g. the Details webview) determine which billing group(s) an editor or
   * model belongs to, so the "Usage by Editor"/"Model Usage" lists can be filtered by provider.
   */
  editorModelUsage?: { [editor: string]: ModelUsage };
}

export interface DetailedStats {
  today: PeriodStats;
  month: PeriodStats;
  lastMonth: PeriodStats;
  last30Days: PeriodStats;
  lastUpdated: Date;
}

export interface DailyTokenStats {
  date: string; // YYYY-MM-DD format
  tokens: number;
  sessions: number;
  interactions: number;
  modelUsage: ModelUsage;
  editorUsage: EditorUsage;
  repositoryUsage: RepositoryUsage;
  languageUsage?: LanguageUsage;
  linesAdded?: number;
  linesRemoved?: number;
  /**
   * Per-editor model usage breakdown — used to compute accurate cost-by-editor charts.
   * Each key is an editor display name (e.g. "VS Code", "Claude Code"); the value is the
   * model usage aggregated from all sessions of that editor type on that day.
   */
  editorModelUsage?: { [editor: string]: ModelUsage };
  /** Per-task-category token/session breakdown for this day, keyed by `TaskCategory` (e.g. "Coding", "Debugging"). */
  taskCategoryUsage?: { [category: string]: { tokens: number; sessions: number } };
}

/** Time-window selector options available in the Chart view. */
export type ChartTimeWindow = 'today' | 'last7' | 'last30' | 'currentMonth' | 'allTime';

/** Aggregated data for one time window (day/week/month) in the chart. */
export interface ChartPeriodData {
  labels: string[];
  /** ISO date keys for each bar, used for time-window filtering. Day=YYYY-MM-DD, week=Monday YYYY-MM-DD, month=YYYY-MM. */
  periodKeys: string[];
  tokensData: number[];
  sessionsData: number[];
  modelDatasets: object[];
  editorDatasets: object[];
  repositoryDatasets: object[];
  /** Number of bars / data points in this period. */
  periodCount: number;
  totalTokens: number;
  totalSessions: number;
  /** Average tokens per bar (per day / per week / per month). */
  avgPerPeriod: number;
  /** Estimated cost per period entry in USD (provider/API rates). */
  costData: number[];
  /** Total estimated cost for this period in USD (provider/API rates). */
  totalCost: number;
  /** Average estimated cost per bar in USD (provider/API rates). Raw float, not rounded. */
  avgCostPerPeriod: number;
  locData?: number[];
  linesAddedData?: number[];
  linesRemovedData?: number[];
  languageDatasets?: object[];
  locEditorDatasets?: object[];
  locRepositoryDatasets?: object[];
  totalLinesAdded?: number;
  totalLinesRemoved?: number;
  avgLocPerPeriod?: number;
  /**
   * Cost datasets split by editor/hosting surface — one dataset per editor type.
   * Each dataset's `data` array aligns with `labels`; values are estimated costs in USD.
   * Computed from per-day `editorModelUsage` using the appropriate pricing source for each editor.
   */
  editorCostDatasets?: object[];
  /**
   * Cost datasets split by billing provider — one dataset per provider group.
   * Groups: "GitHub Copilot" (all Copilot surfaces), "Anthropic" (Claude Code, etc.),
   * "Google" (Gemini CLI, etc.), "Mistral AI", "OpenAI", etc.
   * Copilot group uses AI-Credit pricing; all others use direct provider pricing.
   */
  billingGroupCostDatasets?: object[];
  /**
   * Cost datasets split by model — one dataset per top model (by total cost), plus an
   * "Other models" dataset for the remainder. Each model's usage is priced using the
   * correct pricing source per editor it was used from.
   */
  modelCostDatasets?: object[];
  /** Session-count datasets split by model — one stacked-bar dataset per model. */
  modelSessionsDatasets?: object[];
  /** Session-count datasets split by editor — one stacked-bar dataset per editor. */
  editorSessionsDatasets?: object[];
  /** Session-count datasets split by billing provider — one stacked-bar dataset per provider group. */
  providerSessionsDatasets?: object[];
  /** Token datasets split by billing provider — one stacked-bar dataset per provider group. */
  providerTokensDatasets?: object[];
  /** Token datasets split by task category (e.g. "Coding", "Debugging", "Testing") — one stacked-bar dataset per category. */
  taskCategoryDatasets?: object[];
}

/** Shape of the data payload sent to the chart webview (via window.__INITIAL_CHART__ or postMessage). */
export interface ChartDataPayload {
  labels: string[];
  tokensData: number[];
  sessionsData: number[];
  modelDatasets: object[];
  editorDatasets: object[];
  editorTotalsMap: Record<string, number>;
  repositoryDatasets: object[];
  repositoryTotalsMap: Record<string, number>;
  taskCategoryDatasets?: object[];
  dailyCount: number;
  totalTokens: number;
  avgTokensPerDay: number;
  totalSessions: number;
  lastUpdated: string;
  backendConfigured: boolean;
  compactNumbers?: boolean;
  /** Pre-computed data for Day / Week / Month period views. */
  periods: {
    day: ChartPeriodData;
    week: ChartPeriodData;
    month: ChartPeriodData;
  };
  /**
   * Whether the full-year data needed for Week and Month views is ready.
   * When false, the webview should indicate that those views are loading.
   */
  periodsReady?: boolean;
  hasLocData?: boolean;
}

/** Per-UTC-day token/interaction breakdown for a single session. Used for accurate daily stats. */
export interface DailyRollupEntry {
  tokens: number;
  actualTokens: number;
  thinkingTokens: number;
  cachedReadTokens?: number;
  interactions: number;
  modelUsage: ModelUsage;
  /** Per-day share of the session's exact Copilot billing (in USD). Set when session has nanoAiu data. */
  copilotExactCostDollars?: number;
}

export interface SessionFileCache {
  tokens: number;
  interactions: number;
  modelUsage: ModelUsage;
  mtime: number; // file modification time as timestamp
  size?: number; // file size in bytes (optional for backward compatibility)
  usageAnalysis?: SessionUsageAnalysis; // New analysis data
  firstInteraction?: string | null; // ISO timestamp of first interaction
  lastInteraction?: string | null; // ISO timestamp of last interaction
  title?: string; // Session title (customTitle from session file)
  repository?: string; // Git remote origin URL for the session's workspace
  /**
   * True once a full parse has attempted repository extraction for this cache entry.
   * `repository` can legitimately stay undefined afterward (e.g. no resolvable repo) —
   * this flag is what distinguishes "resolved to nothing" from "never attempted", so a
   * repo-less session doesn't get re-parsed on every single cache read forever.
   */
  repositoryResolved?: boolean;
  workspaceFolderPath?: string; // Full local path to the workspace folder (optional)
  thinkingTokens?: number; // Estimated thinking/reasoning tokens
  actualTokens?: number; // Actual token count from LLM API usage data (when available)
  cacheReadTokens?: number; // Cache-read token count from session.shutdown modelMetrics or ecosystem adapter API usage
  modelTurns?: number; // Number of LLM API calls in agent-mode sessions (from debug log)
  debugLogInputTokens?: number; // Input token total from debug log (sum across all llm_request events)
  debugLogOutputTokens?: number; // Output token total from debug log (sum across all llm_request events)
  debugLogChecked?: boolean; // Sentinel: true means we already looked for a debug log and found none
  /** Exact GitHub Copilot billing for this session in USD (from session.shutdown.totalNanoAiu or debug log copilotUsageNanoAiu). */
  copilotExactCostDollars?: number;
  /** Number of session.truncation events where messages were removed (breaking prompt cache). 0 or absent means no truncation. */
  truncationCount?: number;
  /** Total messages removed across all truncation events. Absent when truncationCount is 0 or unavailable. */
  messagesRemovedByTruncation?: number;
  /** Largest single-request prompt size (input incl. cached tokens) observed in this session. Used for long-context tier detection. */
  maxRequestInputTokens?: number;
  /** Copilot CLI context tier from session.start/resume/model_change events (e.g. "default"). */
  contextTier?: string;
  /** Dominant task category for this session (e.g. "Coding", "Debugging"), computed once via `classifySessionTask()`. */
  taskCategory?: TaskCategory;
  /** Per-UTC-day token/interaction breakdown (keyed by YYYY-MM-DD UTC). Used for consistent daily stats. */
  dailyRollups?: { [utcDayKey: string]: DailyRollupEntry };
  linesAdded?: number;
  linesRemoved?: number;
  languageUsage?: LanguageUsage;
}

// Local copy of customization file entry type (mirrors webview/shared/contextRefUtils.ts)
export interface CustomizationFileEntry {
path: string;
relativePath: string;
type: string;
icon: string;
label: string;
name: string;
lastModified: string | null;
isStale: boolean;
category?: 'copilot' | 'non-copilot';
}

// New interfaces for usage analysis
/** Per-level request counts for thinking effort (reasoning effort) tracking. */
export interface ThinkingEffortUsage {
  /** Number of requests submitted at each effort level, keyed by level name (e.g. "low", "medium", "high"). */
  byEffort: { [effort: string]: number };
  /** Number of times the effort level changed within this session. */
  switchCount: number;
  /** The effort level active at the start of the session, or null if not available. */
  defaultEffort: string | null;
}

export interface SessionUsageAnalysis {
  toolCalls: ToolCallUsage;
  modeUsage: ModeUsage;
  contextReferences: ContextReferenceUsage;
  mcpTools: McpToolUsage;
  /** Agent-skill invocation counts for this session. See {@link SkillCallUsage}. */
  skillCalls?: SkillCallUsage;
  modelSwitching: {
    uniqueModels: string[];
    modelCount: number;
    switchCount: number;
    autoSessions: number;
    foundryWindowsSessions: number;
    unknownProviderSessions: number;
    selectedModelExtensions: string[];
    unknownProviderModels: string[];
    tiers: { standard: string[]; premium: string[]; unknown: string[] };
    hasMixedTiers: boolean;
    standardRequests: number;
    premiumRequests: number;
    unknownRequests: number;
    totalRequests: number;
    costBuckets: { low: string[]; medium: string[]; high: string[]; unknown: string[] };
    hasMixedCosts: boolean;
    lowCostRequests: number;
    mediumCostRequests: number;
    highCostRequests: number;
  };
  thinkingEffort?: ThinkingEffortUsage;
  editScope?: EditScopeUsage;
  applyUsage?: ApplyButtonUsage;
  sessionDuration?: SessionDurationData;
  conversationPatterns?: ConversationPatterns;
  agentTypes?: AgentTypeUsage;
  /**
   * Per-model efficiency counters derived from this session's structured tool-call
   * data. Absent when the session format carries no per-turn tool-call detail.
   * Token/cost fields are zero here — they are folded in at aggregation time.
   */
  modelEfficiency?: ModelEfficiencyUsage;
}

export interface ToolCallUsage {
  total: number;
  byTool: { [toolName: string]: number };
  outputTokensByTool?: { [toolName: string]: number };
}

export interface ModeUsage {
  ask: number; // Regular chat mode
  edit: number; // Edit mode interactions
  agent: number; // Agent mode interactions (standard agent mode)
  plan: number; // Plan mode interactions (built-in plan agent)
  customAgent: number; // Custom agent mode interactions (.agent.md files)
  cli: number; // CLI tool interactions (Copilot CLI, Claude Code, OpenCode, Crush, Mistral Vibe)
}

export interface ContextReferenceUsage {
  file: number; // #file references
  selection: number; // #selection references
  implicitSelection: number; // Implicit selections via inputState.selections
  symbol: number; // #symbol references
  codebase: number; // #codebase references
  workspace: number; // @workspace references
  terminal: number; // @terminal references
  vscode: number; // @vscode references
  terminalLastCommand: number; // #terminalLastCommand references
  terminalSelection: number; // #terminalSelection references
  clipboard: number; // #clipboard references
  changes: number; // #changes references
  outputPanel: number; // #outputPanel references
  problemsPanel: number; // #problemsPanel references
  pullRequest: number; // #pr / #pullRequest references (Copilot PR chat, April 2026)
  codeContextLines?: number; // Total lines of code referenced via #file: range selections
  // contentReferences tracking from session logs
  byKind: { [kind: string]: number }; // Count by reference kind
  copilotInstructions: number; // .github/copilot-instructions.md
  agentsMd: number; // agents.md in repo root
  byPath: { [path: string]: number }; // Count by unique file path
}

export interface McpToolUsage {
  total: number;
  byServer: { [serverName: string]: number };
  byTool: { [toolName: string]: number };
}

/**
 * Agent-skill invocation counts (e.g. Claude Code's `Skill` tool unwrapped to the
 * actual skill name from `input.skill`). Adapter-agnostic — populated only by
 * adapters whose session format can resolve a specific skill name from a wrapper
 * tool call; absent/empty for adapters where skill/prompt invocation leaves no
 * distinguishable session-log signal.
 */
export interface SkillCallUsage {
  total: number;
  byName: { [skillName: string]: number };
}

/**
 * Per-model efficiency counters (issue #1649).
 *
 * Turn-derived counters (calls/editTurns/oneShotEditTurns/retries/selfCorrections)
 * are computed per session from structured tool-call data where available
 * (Copilot Chat JSON, Copilot CLI JSONL, and every ecosystem adapter with buildTurns).
 * Token/cost fields are folded in separately at aggregation time from each
 * session's ModelUsage so no extra session parsing is needed.
 *
 * A "call" is one user-request turn — the closest unit comparable across all
 * supported editors (one agentic turn may span multiple underlying API calls).
 */
export interface ModelEfficiencyCounters {
  /** User-request turns attributed to this model. */
  calls: number;
  /** Turns containing at least one file-edit tool call. */
  editTurns: number;
  /** Edit turns with no retries and no self-corrections. */
  oneShotEditTurns: number;
  /** Repeat edit calls immediately following an edit to the same file (failed edit retried). */
  retries: number;
  /** Repeat edits to a file already edited in the same turn with other tool calls in between (model checked, then corrected itself). */
  selfCorrections: number;
  /** Total file-edit tool calls attributed to this model. */
  editToolCalls: number;
  /** Total input tokens (incl. cache reads/creation). Folded in from ModelUsage at aggregation time. */
  inputTokens: number;
  /** Total output tokens. Folded in from ModelUsage at aggregation time. */
  outputTokens: number;
  /** Cache-read portion of inputTokens. Folded in from ModelUsage at aggregation time. */
  cachedReadTokens: number;
  /** Estimated cost in USD (provider/API rates). Folded in at aggregation time. */
  cost: number;
}

export interface ModelEfficiencyUsage {
  [modelName: string]: ModelEfficiencyCounters;
}

export interface EditScopeUsage {
  singleFileEdits: number; // Edit sessions touching 1 file
  multiFileEdits: number; // Edit sessions touching 2+ files
  totalEditedFiles: number; // Total unique files edited
  avgFilesPerSession: number; // Average files per edit session
  linesAdded?: number;
  linesRemoved?: number;
  languageUsage?: LanguageUsage;
}

export interface ApplyButtonUsage {
  totalApplies: number; // Total Apply button uses
  totalCodeBlocks: number; // Total code blocks shown
  applyRate: number; // % of code blocks applied
}

export interface SessionDurationData {
  totalDurationMs: number; // Total session time (wall clock: last timestamp - first timestamp, includes idle gaps between turns)
  avgDurationMs: number; // Average session duration (wall clock)
  avgFirstProgressMs: number; // Average time to first response
  avgTotalElapsedMs: number; // Average total request time
  avgWaitTimeMs: number; // Average user wait time between interactions
  activeDurationMs: number; // Sum of merged [requestTimestamp, requestTimestamp+totalElapsed] windows: actual interactive + tool/agent wait time, excluding idle gaps between turns
}

export interface ConversationPatterns {
  multiTurnSessions: number; // Sessions with >1 request
  singleTurnSessions: number; // Sessions with 1 request
  avgTurnsPerSession: number; // Average requests per session
  maxTurnsInSession: number; // Longest conversation
}

export interface AgentTypeUsage {
  editsAgent: number; // github.copilot.editsAgent usage
  defaultAgent: number; // github.copilot.default usage
  workspaceAgent: number; // github.copilot.workspace usage
  other: number; // Other agents
}

export interface ModelSwitchingAnalysis {
  modelsPerSession: number[]; // Array of unique model counts per session
  totalSessions: number;
  averageModelsPerSession: number;
  maxModelsPerSession: number;
  minModelsPerSession: number;
  switchingFrequency: number; // % of sessions with >1 model
  autoSessions: number; // Sessions with an Auto-selected model
  foundryWindowsSessions: number; // Sessions using Microsoft Foundry on Windows / local models
  unknownProviderSessions: number; // Sessions with models from unknown providers
  standardModels: string[]; // Unique standard models used
  premiumModels: string[]; // Unique premium models used
  unknownModels: string[]; // Unique models with unknown tier
  mixedTierSessions: number; // Sessions using both standard and premium
  standardRequests: number; // Count of requests using standard models
  premiumRequests: number; // Count of requests using premium models
  unknownRequests: number; // Count of requests using unknown tier models
  totalRequests: number; // Total requests across all tiers
  lowCostModels: string[];
  mediumCostModels: string[];
  highCostModels: string[];
  mixedCostSessions: number;
  lowCostRequests: number;
  mediumCostRequests: number;
  highCostRequests: number;
  selectedModelExtensions: string[]; // Unique selectedModel metadata extensions observed
  unknownProviderModels: string[]; // Unique models whose provider could not be identified
}

export interface MissedPotentialWorkspace {
workspacePath: string;
workspaceName: string;
sessionCount: number;
interactionCount: number;
nonCopilotFiles: CustomizationFileEntry[];
}


/** Summary of a single session for the "Recent Sessions" tab. */
export interface TodaySessionSummary {
  title: string | null;
  filePath: string;
  interactions: number;
  toolCalls: number;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  cachedTokens: number;
  totalTokens: number;
  estimatedCost: number;
  editor: string;
  models: string[];
  lastActivity: string;
  /** Number of truncation events where messages were removed in this session. 0 or absent means no truncation. */
  truncationCount?: number;
  /** Largest single-request prompt size (input incl. cached tokens) observed in this session. */
  maxRequestInputTokens?: number;
  /** Copilot CLI context tier for this session (e.g. "default"); absent when not recorded. */
  contextTier?: string;
  /** Selected input-token window limit (Copilot CLI, from data.db context_input_token_limit). */
  contextWindowLimit?: number;
  /** Last known context fill in tokens (Copilot CLI, from data.db context_current_tokens). */
  contextReachedTokens?: number;
  /** Wall-clock session duration in milliseconds (last interaction − first interaction), including idle gaps between turns. Absent when not derivable. Kept for reference/future use; prefer `activeDurationMs` for display. */
  durationMs?: number;
  /** Net ("active") session duration in milliseconds: sum of merged [requestTimestamp, requestTimestamp+totalElapsed] windows, excluding idle gaps between turns. This is the value shown as "Duration" in the Recent Sessions list. Absent when not derivable. */
  activeDurationMs?: number;
  /** Workspace/repository name the session belongs to. Absent when attribution is unavailable. */
  workspace?: string;
}

export interface UsageAnalysisStats {
today: UsageAnalysisPeriod;
last30Days: UsageAnalysisPeriod;
/** Current calendar month-to-date. */
month: UsageAnalysisPeriod;
/** Previous calendar month (full month). */
lastMonth: UsageAnalysisPeriod;
locale?: string;
lastUpdated: Date;
customizationMatrix?: WorkspaceCustomizationMatrix;
missedPotential?: MissedPotentialWorkspace[];
todaySessions?: TodaySessionSummary[];
/**
 * Per-period session summaries for the "Recent Sessions" lookback selector, bucketed from
 * the already-parsed sessions the main analysis walks. Lets the host serve last7/last30/
 * currentMonth instantly instead of re-parsing the whole session corpus per period switch.
 */
recentSessions?: { last7: TodaySessionSummary[]; last30: TodaySessionSummary[]; currentMonth: TodaySessionSummary[] };
/** Optional tool curation analysis (VS Code only; absent in CLI/VS/JetBrains). */
curationAnalysis?: ToolCurationAnalysis | null;
/**
 * Daily-bucketed multi-agent/delegation usage over the trailing ~30 days, for the
 * "Multi-Agent Usage" sparkline on the Fluency dashboard. Absent when no sessions
 * with multi-agent signals were found in the window.
 */
agenticDailyTrend?: AgenticTrendPoint[];
}

/** One day's worth of multi-agent/delegation signal, used to render a trend sparkline. */
export interface AgenticTrendPoint {
  /** UTC date key, e.g. "2024-06-01". */
  date: string;
  /** Sessions that day with 2+ direct children (data.db/Hermes hierarchy). */
  multiAgentParentSessions: number;
  /** Sessions that day classified as `Delegation` by `classifySessionTask()`. */
  delegationSessions: number;
}

/** Matrix types used for Usage Analysis customization matrix */
export type CustomizationTypeStatus = "✅" | "⚠️" | "❌";

export interface WorkspaceCustomizationRow {
  workspacePath: string;
  workspaceName: string;
  sessionCount: number;
  interactionCount: number;
  typeStatuses: { [typeId: string]: CustomizationTypeStatus };
}

export interface WorkspaceCustomizationMatrix {
  customizationTypes: Array<{ id: string; icon: string; label: string }>;
  workspaces: WorkspaceCustomizationRow[];
  totalWorkspaces: number;
  workspacesWithIssues: number;
}

export interface UsageAnalysisPeriod {
  sessions: number;
  toolCalls: ToolCallUsage;
  modeUsage: ModeUsage;
  contextReferences: ContextReferenceUsage;
  mcpTools: McpToolUsage;
  /** Aggregated agent-skill invocation counts across the period's sessions. See {@link SkillCallUsage}. */
  skillCalls?: SkillCallUsage;
  modelSwitching: ModelSwitchingAnalysis;
  repositories: string[]; // Unique repositories worked in during this period
  repositoriesWithCustomization: string[]; // Repos with copilot-instructions.md or agents.md
  editScope: EditScopeUsage;
  applyUsage: ApplyButtonUsage;
  sessionDuration: SessionDurationData;
  conversationPatterns: ConversationPatterns;
  agentTypes: AgentTypeUsage;
  /** Aggregated thinking effort (reasoning effort) usage across all sessions in this period. */
  thinkingEffortUsage?: {
    byEffort: { [effort: string]: number };
    sessionCount: number; // sessions with effort data
    switchCount: number;  // total effort switches across all sessions
  };
  /**
   * Number of sessions in this period that are parents of 2+ child workspaces,
   * indicating multi-agent orchestration. Populated from ~/.copilot/data.db;
   * absent (undefined) when data.db is not available.
   */
  multiAgentParentSessions?: number;
  /**
   * Number of sessions in this period classified as `Delegation` by `classifySessionTask()`
   * (tool calls matching subagent/delegate patterns — Copilot CLI/Claude Code Task tool,
   * Hermes subagent source, etc.). A second, adapter-agnostic signal for sub-agent usage,
   * complementary to `multiAgentParentSessions` (which requires data.db/JSONL hierarchy data).
   * Populated during session caching; absent (undefined) when no such sessions exist.
   */
  delegationSessions?: number;
  /**
   * Context-window usage aggregated across the period's sessions.
   * Absent when no session in the period carried context-size data.
   */
  contextWindow?: ContextWindowStats;
  /**
   * Per-model efficiency metrics aggregated across the period's sessions
   * (issue #1649). Absent when no session in the period carried
   * efficiency counters or per-model token usage.
   */
  modelEfficiency?: ModelEfficiencyUsage;
}

/** Aggregated context-window usage for one usage-analysis period. */
export interface ContextWindowStats {
  /** Largest single-request prompt (input incl. cached tokens) observed in the period. */
  maxRequestInputTokens: number;
  /** Models used by the session holding that largest request. */
  maxRequestModels: string[];
  /** Number of sessions per Copilot CLI context tier (e.g. { default: 3 }). */
  tierCounts: { [tier: string]: number };
  /** Highest data.db context fill among the period's CLI sessions. */
  maxReachedTokens?: number;
  /** Selected window limit of that fullest CLI session. */
  maxReachedWindowLimit?: number;
}

/** Parent/child session reference used in hierarchy info (Copilot CLI sessions). */
export interface SessionRelationRef {
  uuid: string;
  name: string;
  /** Resolved path to the related session file (undefined when outside the loaded set). */
  sessionFile?: string;
}

// Detailed session file information for diagnostics view
export interface SessionFileDetails {
  file: string;
  size: number;
  modified: string;
  interactions: number;
  tokens?: number; // estimated token count for the session
  contextReferences: ContextReferenceUsage;
  firstInteraction: string | null;
  lastInteraction: string | null;
  editorSource: string; // 'vscode', 'vscode-insiders', 'cursor', etc.
  editorRoot?: string; // top-level editor root path (for display in diagnostics)
  editorName?: string; // friendly editor name (e.g., 'VS Code')
  title?: string; // session title (customTitle from session file)
  repository?: string; // Git remote origin URL for the session's workspace
  workspacePath?: string; // absolute local cwd/workspace path the session ran in (from adapter getMeta)
  /** Parent session info (Copilot CLI and pi sessions; populated from data.db / JSONL parentSession field). */
  parentInfo?: SessionRelationRef | null;
  /** Direct child sessions (Copilot CLI and pi sessions; populated from data.db / JSONL parentSession field). */
  childInfo?: SessionRelationRef[];
  /**
   * Total child count — may exceed childInfo.length when some
   * children fall outside the loaded 14-day diagnostic window.
   */
  totalChildCount?: number;
  // Per-model input/output/cached token breakdown.
  // Populated for all sessions where cached ModelUsage is available; always
  // present for Windsurf (derived from trajectory steps via the gRPC API).
  modelUsage?: ModelUsage;
  cachedTokens?: number;   // session-level cache-read tokens
  toolCalls?: { total: number; byTool: { [tool: string]: number } }; // tool invocation breakdown
}

// Prompt token detail from actual LLM usage data
export interface PromptTokenDetail {
  category: string;
  label: string;
  percentageOfPrompt: number;
}

// Actual usage data from the LLM API (when available in JSONL)
export interface ActualUsage {
  completionTokens: number;
  promptTokens: number;
  promptTokenDetails?: PromptTokenDetail[];
  details?: string; // e.g. "Claude Opus 4.5 • 3x"
}

// Chat turn information for log viewer
export interface ChatTurn {
  turnNumber: number;
  timestamp: string | null;
  mode: "ask" | "edit" | "agent" | "plan" | "customAgent" | "cli";
  userMessage: string;
  assistantResponse: string;
  model: string | null;
  toolCalls: { toolName: string; arguments?: string; result?: string; isSubAgent?: boolean; subAgentModel?: string; subAgentTokens?: { input: number; output: number } }[];
  contextReferences: ContextReferenceUsage;
  mcpTools: { server: string; tool: string }[];
  inputTokensEstimate: number;
  outputTokensEstimate: number;
  thinkingTokensEstimate: number;
  actualUsage?: ActualUsage;
  /** Thinking effort level active when this turn was submitted (e.g. "low", "medium", "high"). */
  thinkingEffort?: string;
}

// Full session log data for the log viewer
export interface SessionLogData {
  file: string;
  title: string | null;
  editorSource: string;
  editorName: string;
  size: number;
  modified: string;
  interactions: number;
  contextReferences: ContextReferenceUsage;
  firstInteraction: string | null;
  lastInteraction: string | null;
  turns: ChatTurn[];
  usageAnalysis?: SessionUsageAnalysis;
  /** Session-level actual token count from LLM API (e.g. session.shutdown in CLI format). 0 when unavailable. */
  actualTokens?: number;
  /** Cache-read token count from session.shutdown modelMetrics (CLI sessions only). Absent when unavailable. */
  cachedTokens?: number;
  /** Number of distinct subagent sessions started (CLI format: from subagent.started events; pi: from child session count). */
  subAgentsStarted?: number;
  /** Parent session info (Copilot CLI and pi sessions; populated from data.db / JSONL parentSession field). */
  parentInfo?: SessionRelationRef | null;
  /** Direct child sessions (Copilot CLI and pi sessions; populated from data.db / JSONL parentSession field). */
  childInfo?: SessionRelationRef[];
  /** Total child count (may exceed childInfo.length when some children fall outside the loaded window). */
  totalChildCount?: number;
  /** Input token total from debug log (sum of all llm_request events). Present for VS Code Copilot Chat agent-mode sessions. */
  debugLogInputTokens?: number;
  /** Output token total from debug log (sum of all llm_request events). Present for VS Code Copilot Chat agent-mode sessions. */
  debugLogOutputTokens?: number;
  /** Number of LLM API calls made during the session (from debug log). >1 means agent-mode multi-call session. */
  modelTurns?: number;
  /** Number of session.truncation events where messages were removed (breaking prompt cache). 0 or absent means no truncation. */
  truncationCount?: number;
  /** Total messages removed across all truncation events. Absent when truncationCount is 0. */
  messagesRemovedByTruncation?: number;
  /**
   * Optional editor-specific note injected by the adapter/backend.
   * When present the log viewer renders an info panel at the top of the page
   * listing the items as bullet points alongside the editor name and icon.
   */
  editorNote?: { items: string[] };
}

// ---------------------------------------------------------------------------
// GitHub Copilot Cloud Agent session stats
// ---------------------------------------------------------------------------

export type AgentSessionSource = 'cloud-agent' | 'cli-remote' | 'unknown';

export interface AgentRepoSummary {
  owner: string;
  repo: string;
  /** Number of tasks that contained at least one cloud-agent session. */
  totalTasks: number;
  /** Total cloud-agent sessions across all scanned tasks. */
  totalSessions: number;
  /** Sum of usage.credits for all cloud-agent sessions (0 when unavailable). */
  totalCredits: number;
  /** How many tasks we fetched full session details for. */
  tasksScanned: number;
  /** Total tasks found in the list API response (before the detail-fetch cap). */
  tasksTotal: number;
  /** True when the detail-fetch cap was reached — totals are conservative lower bounds. */
  partial: boolean;
  error?: string;
}

export interface AgentSessionsResult {
  repos: AgentRepoSummary[];
  totalTasks: number;
  totalSessions: number;
  totalCredits: number;
  authenticated: boolean;
  since: string;
  fetchedAt: string;
}

// Local summary type for customization files (mirrors webview/shared/contextRefUtils.ts)
export interface WorkspaceCustomizationSummary {
  workspaces: {
    [workspacePath: string]: {
      name: string;
      files: CustomizationFileEntry[];
    };
  };
  totalFiles: number;
  staleFiles: number;
}

// ---------------------------------------------------------------------------
// Insights / Nudges framework
// ---------------------------------------------------------------------------

export type InsightCategory = 'context' | 'agentic' | 'customization' | 'consistency' | 'tools' | 'trend';
export type InsightSeverity = 'tip' | 'opportunity' | 'celebration';
export type InsightStatus = 'new' | 'seen' | 'dismissed' | 'snoozed' | 'done';

export interface InsightState {
  status: InsightStatus;
  firstSurfacedAt: string;   // ISO timestamp
  lastSurfacedAt: string;    // ISO timestamp
  snoozeUntil?: string;      // ISO timestamp; present when status === 'snoozed'
}

/** Persisted bag of per-insight state keyed by insight id. */
export type InsightStateBag = Record<string, InsightState>;

/** A fully evaluated, display-ready insight card. */
export interface EvaluatedInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  body: string;
  actionLabel?: string;
  actionCommand?: string;
  status: InsightStatus;
  allowToast?: boolean;
}

// ---------------------------------------------------------------------------
// Tool Curation
// ---------------------------------------------------------------------------

/** A single tool entry from an enumerated "available tools" source. */
export interface AvailableToolEntry {
  /** Raw tool ID (e.g. `mcp__github__get_file_contents`). */
  name: string;
  /** Human-readable description. */
  description: string;
  /** Where this tool comes from. */
  source: 'builtin' | 'mcp' | 'extension' | 'skill';
  /** MCP server name when `source === 'mcp'`. */
  server?: string;
  /** VS Code extension ID when `source === 'extension'`. */
  extensionId?: string;
  /** Skill file path (relative) when `source === 'skill'`. */
  skillPath?: string;
  /** Agent-plugin name (from `installed.json`) when this skill comes from a VS Code agent plugin. */
  pluginName?: string;
  /** Absolute path(s) of the config or skill file(s) this entry was discovered from. */
  configFiles?: string[];
  /**
   * For extension-contributed MCP server entries: true when at least one tool from
   * the server is enabled in `vscode.lm.tools`, false when the user has disabled them
   * in the chat tool picker (or the server hasn't started). Undefined when not applicable.
   */
  enabled?: boolean;
  /** For extension-contributed entries: whether the contributing extension is currently activated. */
  extensionActive?: boolean;
}

/** One actionable recommendation produced by curation analysis. */
export interface ToolCurationRecommendation {
  type: 'disable-mcp-server' | 'disable-extension' | 'refine-skill' | 'remove-skill';
  /** Server name, extension ID, or skill name that the recommendation targets. */
  target: string;
  reason: string;
  /** Estimated context-window token savings per interaction (rough). */
  estimatedTokenSavings?: number;
}

/** Full result of a tool-curation analysis run. */
export interface ToolCurationAnalysis {
  /** Look-back window (days) used to determine "unused". */
  windowDays: number;
  /** All tools discovered from available sources. */
  availableTools: AvailableToolEntry[];
  /** Tools that were actually invoked within the window (name → call count). */
  usedTools: { name: string; count: number }[];
  /** Available tools with zero invocations in the window. */
  unusedTools: AvailableToolEntry[];
  /** MCP servers with partial or zero tool usage. */
  underusedMcpServers: { server: string; availableToolCount: number; usedToolCount: number; configFiles?: string[]; extensionId?: string; enabled?: boolean; extensionActive?: boolean }[];
  /** Agent plugins with skill usage counts for the window; sorted by usedSkillCount ascending. Includes all plugins (not just unused ones) so the UI can offer a "hide plugins with usage" toggle. */
  underusedAgentPlugins: { pluginName: string; availableSkillCount: number; usedSkillCount: number }[];
  /** Rough prompt-bloat estimate from unused tool descriptions. */
  estimatedPromptBloat: { totalTokens: number; byServer: Record<string, number> };
  /** Prioritised list of recommendations. */
  recommendations: ToolCurationRecommendation[];
}
