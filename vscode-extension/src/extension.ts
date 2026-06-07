// --- Node.js built-ins & VS Code ---
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as childProcess from 'child_process';

// --- JSON data files ---
import tokenEstimatorsData from './tokenEstimators.json';
import modelPricingData from './modelPricing.json';
import toolNamesData from './toolNames.json';
import customizationPatternsData from './customizationPatterns.json';
import copilotPlansData from './copilotPlans.json';
import * as packageJson from '../package.json';
import { getToolFamilies, DEFAULT_TOOL_FAMILIES } from './toolFamilies';

// --- Core types ---
import type {
  TokenUsageStats,
  ModelUsage,
  ModelPricing,
  EditorUsage,
  RepositoryUsage,
  PeriodStats,
  DetailedStats,
  DailyTokenStats,
  ChartDataPayload,
  SessionFileCache,
  DailyRollupEntry,
  CustomizationFileEntry,
  SessionUsageAnalysis,
  ToolCallUsage,
  ModeUsage,
  ContextReferenceUsage,
  McpToolUsage,
  EditScopeUsage,
  ApplyButtonUsage,
  SessionDurationData,
  ConversationPatterns,
  AgentTypeUsage,
  ModelSwitchingAnalysis,
  MissedPotentialWorkspace,
  UsageAnalysisStats,
  TodaySessionSummary,
  CustomizationTypeStatus,
  WorkspaceCustomizationRow,
  WorkspaceCustomizationMatrix,
  UsageAnalysisPeriod,
  SessionFileDetails,
  PromptTokenDetail,
  ActualUsage,
  ChatTurn,
  SessionLogData,
  WorkspaceCustomizationSummary,
  AgentSessionsResult,
  TokenEstimator,
  SessionRelationRef,
  EvaluatedInsight,
  InsightStateBag,
} from './types';

// --- Insights engine ---
import {
  evaluateInsights as _evaluateInsights,
  mergeInsightStates as _mergeInsightStates,
  countNewInsights as _countNewInsights,
  isToastAllowed as _isToastAllowed,
} from './insightsEngine';

// --- Ecosystem adapter types & helpers ---
import type { OpenCodeDataAccess } from './opencode';
import type { CrushDataAccess } from './crush';
import type { VisualStudioDataAccess } from './visualstudio';
import type { ContinueDataAccess } from './continue';
import type { ClaudeCodeDataAccess } from './claudecode';
import type { ClaudeDesktopCoworkDataAccess } from './claudedesktop';
import type { MistralVibeDataAccess } from './mistralvibe';
import type { GeminiCliDataAccess } from './geminicli';
import type { IEcosystemAdapter } from './ecosystemAdapter';
import { WindsurfDataAccess } from './windsurf';
import { getEcosystemDisplayName } from './ecosystemAdapter';
import { buildAdapterRegistry, createDataAccessInstances } from './adapters';
import { CopilotAppDataAccess } from './copilotAppData';
import { getVSCodeUserPaths } from './adapters/copilotChatAdapter';
import { isJetBrainsSessionPath } from './adapters/adapterPredicates';
import { detectJetBrainsModelHintFromContent } from './jetbrains';
import { createWakeupGate } from './utils/promises';

// --- Session parsing & token estimation ---
import {
  estimateTokensFromText as _estimateTokensFromText,
  estimateTokensFromJsonlSession as _estimateTokensFromJsonlSession,
  extractPerRequestUsageFromRawLines as _extractPerRequestUsageFromRawLines,
  getModelFromRequest as _getModelFromRequest,
  isJsonlContent as _isJsonlContent,
  isUuidPointerFile as _isUuidPointerFile,
  applyDelta as _applyDelta,
  getModelTier as _getModelTier,
  calculateEstimatedCost as _calculateEstimatedCost,
  createEmptyContextRefs as _createEmptyContextRefs,
  getTotalTokensFromModelUsage as _getTotalTokensFromModelUsage,
  reconstructJsonlStateAsync as _reconstructJsonlStateAsync,
  extractSubAgentData as _extractSubAgentData,
  buildReasoningEffortTimeline as _buildReasoningEffortTimeline,
  extractAllTokensFromDebugLog as _extractAllTokensFromDebugLog,
  extractResponseItemText as _extractResponseItemText,
  NANO_AIU_TO_DOLLARS,
} from './tokenEstimation';
import { SessionDiscovery } from './sessionDiscovery';

// --- Cache ---
import { CacheManager } from './cacheManager';

// --- Usage analysis ---
import {
  mergeUsageAnalysis as _mergeUsageAnalysis,
  analyzeContextReferences as _analyzeContextReferences,
  analyzeContentReferences as _analyzeContentReferences,
  analyzeVariableData as _analyzeVariableData,
  deriveConversationPatterns as _deriveConversationPatterns,
  analyzeRequestContext as _analyzeRequestContext,
  calculateModelSwitching as _calculateModelSwitching,
  trackEnhancedMetrics as _trackEnhancedMetrics,
  analyzeSessionUsage as _analyzeSessionUsage,
  getModelUsageFromSession as _getModelUsageFromSession,
  type UsageAnalysisDeps,
} from './usageAnalysis';

// --- Maturity & fluency scoring ---
import {
  getFluencyLevelData as _getFluencyLevelData,
  calculateFluencyScoreForTeamMember as _calculateFluencyScoreForTeamMember,
  calculateMaturityScores as _calculateMaturityScores,
} from './maturityScoring';

// --- Workspace helpers ---
import {
  parseWorkspaceStorageJsonFile as _parseWorkspaceStorageJsonFile,
  extractWorkspaceIdFromSessionPath as _extractWorkspaceIdFromSessionPath,
  resolveWorkspaceFolderFromSessionPath as _resolveWorkspaceFolderFromSessionPath,
  globToRegExp as _globToRegExp,
  resolveExactWorkspacePath as _resolveExactWorkspacePath,
  scanWorkspaceCustomizationFiles as _scanWorkspaceCustomizationFiles,
  getRepositoryUrl as _getRepositoryUrl,
  getModeType as _getModeType,
  extractCustomAgentName as _extractCustomAgentName,
  getEditorTypeFromPath as _getEditorTypeFromPath,
  getEditorNameFromRoot as _getEditorNameFromRoot,
  getRepoDisplayName as _getRepoDisplayName,
  detectEditorSource as _detectEditorSource,
  parseGitRemoteUrl as _parseGitRemoteUrl,
  extractRepositoryFromContentReferences as _extractRepositoryFromContentReferences,
  isMcpTool as _isMcpTool,
  normalizeMcpToolName as _normalizeMcpToolName,
  extractMcpServerName as _extractMcpServerName,
  normalizePath as _normalizePath,
} from './workspaceHelpers';

// --- Chart building ---
import { buildChartData as _buildChartData } from './chartDataBuilder';

// --- Stats helpers ---
import { addModelUsage, addEditorUsage, addLanguageUsage, computeUtcDateRanges, aggregatePeriodStats, makePeriodAccumulator, type SessionAggregateInput } from './statsHelpers';

// --- GitHub & agent sessions ---
import {
	detectAiType,
	discoverGitHubRepos,
	fetchRepoPrs,
	fetchCopilotPlanInfo,
	fetchCopilotTokenEndpointInfo,
	fetchUserEnterprises,
	fetchEnterprisePremiumBudgets,
	type CopilotPlanInfo,
	type RepoPrDetail,
	type RepoPrInfo,
	type RepoPrStatsResult,
} from './githubPrService';
import { fetchAgentSessionsForRepo } from './agentSessionsService';

// --- View regression ---
import {
  createViewRegressionProbeScript,
  evaluateViewRegressionProbe,
  formatLocalViewRegressionReport,
  type LocalViewRegressionMetric,
  type LocalViewRegressionResult,
  type ViewRegressionExpectation,
  type ViewRegressionProbeConfig,
  type ViewRegressionProbeSnapshot,
} from './viewRegression';
// --- Backend & UI ---
import type { AiFluencyExtensionApi, ExtensionPointButton } from './extensionPoints';
import { REPO_HYGIENE_SKILL } from './backend/repoHygieneSkill';
import { BackendFacade } from './backend/facade';
import { BackendCommandHandler } from './backend/commands';
import { TeamServerConfigPanel } from './backend/teamServerConfigPanel';
import { getModelDisplayName } from './webview/shared/modelUtils';
import { ConfirmationMessages } from './backend/ui/messages';

// --- Utilities ---
import { getNonce, buildCspMeta } from './utils/webviewUtils';
import { isGuidMcpTool } from './utils/toolUtils';
import { toLocalDayKey } from './utils/dayKeys';
import { determineOnboardingAction } from './onboarding';

type LocalViewRegressionProbeResult = {
  pass: boolean;
  summary: string;
  timedOut?: boolean;
  metrics?: ViewRegressionProbeSnapshot;
};

type LocalViewRegressionCase = {
  id: string;
  title: string;
  timeoutMs: number;
  expectations: ViewRegressionExpectation;
  dataPoints: LocalViewRegressionMetric[];
  reset: () => void;
  open: () => Promise<void>;
};

/** Pre-loaded session file data shared across both analysis passes (detailed + usage analysis). */
type SessionFilePreload = {
	sessionFile: string;
	mtime: number;
	fileSize: number;
	sessionData: SessionFileCache;
	wasCached: boolean;
	/** Only populated for files with interactions > 0 (avoids fetching details for empty sessions). */
	details?: SessionFileDetails;
};

export type StatusBarDisplaySetting = 'none' | 'today' | 'last30days' | 'currentMonth' | 'both' | 'todayAndCurrentMonth';

/**
 * Determines which secondary period section to show in the hover tooltip.
 * Returns 'last30days' if either setting explicitly requests a rolling 30-day window
 * (i.e. 'last30days' or 'both'), preserving backwards-compatible behaviour.
 * Otherwise returns 'currentMonth' so users who opted into current-month views
 * see a consistent tooltip.
 */
export function tooltipSecondaryPeriod(
	tokensSetting: StatusBarDisplaySetting,
	costSetting: StatusBarDisplaySetting,
): 'last30days' | 'currentMonth' {
	const usesLast30 = (s: StatusBarDisplaySetting) => s === 'last30days' || s === 'both';
	return usesLast30(tokensSetting) || usesLast30(costSetting) ? 'last30days' : 'currentMonth';
}

// ── extension.ts module-level helpers ────────────────────────────────────────

function _dwbcPickWinner(
	key: string, canonical: string,
	keyIsRemote: boolean, canonIsRemote: boolean,
	sessionCounts: Map<string, number>
): string {
	if (!keyIsRemote && canonIsRemote) { return key; }
	if (!canonIsRemote && keyIsRemote) { return canonical; }
	return (sessionCounts.get(key) || 0) >= (sessionCounts.get(canonical) || 0) ? key : canonical;
}

function _cifjlProcessEvent(event: any): number {
	let count = 0;
	if (event.type === 'user.message') { count++; }
	if (event.kind === 2 && event.k?.[0] === 'requests' && Array.isArray(event.v)) {
		for (const request of event.v) {
			if (request.requestId) { count++; }
		}
	}
	return count;
}

function _scdlBuildFromBreakdown(modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }>): ModelUsage {
	const modelUsage: ModelUsage = {};
	for (const [model, bd] of Object.entries(modelBreakdown)) {
		modelUsage[model] = { inputTokens: bd.inputTokens, outputTokens: bd.outputTokens, ...(bd.cachedTokens > 0 ? { cachedReadTokens: bd.cachedTokens } : {}) };
	}
	return modelUsage;
}

function _scdlDistributeToDays(
	dailyRollups: Record<string, DailyRollupEntry>,
	supplementModelUsage: ModelUsage
): Record<string, DailyRollupEntry> | undefined {
	const totalDayInteractions = Object.values(dailyRollups).reduce((s, dr) => s + dr.interactions, 0);
	if (totalDayInteractions <= 0) { return undefined; }
	const result: Record<string, DailyRollupEntry> = {};
	for (const [dayKey, dayRollup] of Object.entries(dailyRollups)) {
		const fraction = dayRollup.interactions / totalDayInteractions;
		const dayModelUsage: ModelUsage = {};
		for (const [model, usage] of Object.entries(supplementModelUsage)) {
			dayModelUsage[model] = { inputTokens: Math.round(usage.inputTokens * fraction), outputTokens: Math.round(usage.outputTokens * fraction), ...(usage.cachedReadTokens !== undefined ? { cachedReadTokens: Math.round(usage.cachedReadTokens * fraction) } : {}) };
		}
		result[dayKey] = { ...dayRollup, modelUsage: dayModelUsage };
	}
	return result;
}

class CopilotTokenTracker implements vscode.Disposable {
	// Cache version - increment this when making changes that require cache invalidation
	private static readonly CACHE_VERSION = 58; // Track session.truncation events as a negative signal
	// Maximum length for displaying workspace IDs in diagnostics/customization matrix
	private static readonly WORKSPACE_ID_DISPLAY_LENGTH = 8;

	private diagnosticsPanel?: vscode.WebviewPanel;
	// Tracks whether the diagnostics panel has already received its session files
	private diagnosticsHasLoadedFiles: boolean = false;
	// Cache of the last loaded detailed session files for diagnostics view
	private diagnosticsCachedFiles: SessionFileDetails[] = [];
	// Cache of the last diagnostic report text for copy/issue operations
	private lastDiagnosticReport: string = '';
	private logViewerPanel?: vscode.WebviewPanel;
	private logViewerSessionFilePath: string = '';
	private logViewerCurrentData?: SessionLogData;
	public openCode!: OpenCodeDataAccess;
	public crush!: CrushDataAccess;
	public visualStudio!: VisualStudioDataAccess;
	private continue_!: ContinueDataAccess;
	private claudeCode!: ClaudeCodeDataAccess;
	private claudeDesktopCowork!: ClaudeDesktopCoworkDataAccess;
	private mistralVibe!: MistralVibeDataAccess;
	private geminiCli!: GeminiCliDataAccess;
	public windsurf!: WindsurfDataAccess;
	private ecosystems!: IEcosystemAdapter[];
	private cacheManager!: CacheManager;
	private readonly copilotAppData = new CopilotAppDataAccess();

	private get usageAnalysisDeps(): UsageAnalysisDeps {
		return { warn: (m: string) => this.warn(m), tokenEstimators: this.tokenEstimators, modelPricing: this.modelPricing, toolNameMap: this.toolNameMap, ecosystems: this.ecosystems };
	}
	public sessionDiscovery!: SessionDiscovery;
	private statusBarItem!: vscode.StatusBarItem;
	/** Dedicated status bar item for insights — shown only when new insights exist. */
	private insightsStatusBarItem!: vscode.StatusBarItem;
	private readonly extensionUri: vscode.Uri;
	private readonly context: vscode.ExtensionContext;
	private _devBranch: string | undefined;
	private localRegressionSampleDataDir?: string;
	private pendingLocalViewRegressionProbe?: ViewRegressionProbeConfig;
	private readonly localViewRegressionResolvers = new Map<string, (result: LocalViewRegressionProbeResult) => void>();


	/**
	 * Resolve the workspace folder full path from a session file path.
	 * Looks for a `workspaceStorage/<id>/` segment and reads `workspace.json` or `meta.json`.
	 * Synchronous by design to keep the analysis flow simple and cached.
	 */
	// Helper: read a workspaceStorage JSON file and extract a candidate folder path from configured keys

	/**
	 * Extract workspace ID from a session file path, if it's workspace-scoped.
	 * Returns the workspace ID or undefined if not a workspace-scoped session.
	 */


	/**
	 * Convert a simple glob pattern to a RegExp.
	 * Supports: ** (match multiple path segments), * (match within a segment), ?.
	 */

	/**
	 * Resolve an exact relative path in a workspace.
	 * When `caseInsensitive` is true, path segments are matched case-insensitively.
	 */

	/**
	 * Scan a workspace folder for customization files according to `customizationPatterns.json`.
	 */
	/** Buttons registered by companion extensions via the extension points API. */
	private readonly _extensionPointButtons = new Map<string, { config: ExtensionPointButton; handler: () => void | Promise<void> }>();

	private _disposed = false;
	private updateInterval: NodeJS.Timeout | undefined;
	private detailsPanel: vscode.WebviewPanel | undefined;
	private chartPanel: vscode.WebviewPanel | undefined;
	private analysisPanel: vscode.WebviewPanel | undefined;
	private maturityPanel: vscode.WebviewPanel | undefined;
	private dashboardPanel: vscode.WebviewPanel | undefined;
	private fluencyLevelViewerPanel: vscode.WebviewPanel | undefined;
	private environmentalPanel: vscode.WebviewPanel | undefined;
	private outputChannel!: vscode.OutputChannel;
	private lastDetailedStats: DetailedStats | undefined;
	private lastDailyStats: DailyTokenStats[] | undefined;
	/** Full-year daily stats (up to 365 days) for the chart Week/Month period views. */
	private lastFullDailyStats: DailyTokenStats[] | undefined;
	/** Last period selected by the user in the chart view; restored on next open. */
	private lastChartPeriod: 'day' | 'week' | 'month' = 'day';
	/** Last view selected by the user in the chart view; restored on next open. */
	private lastChartView: 'total' | 'model' | 'editor' | 'repository' | 'cost' = 'total';
	private lastChartMetric: string = 'tokens';
	private lastChartSplit: string = 'total';
	private lastUsageAnalysisStats: UsageAnalysisStats | undefined;
	private lastDashboardData: any | undefined;
	/** Insight engine: persisted state for all surfaced insights. */
	private _insightStateBag: InsightStateBag = {};
	/** ISO timestamp of the last time an insight toast was shown. */
	private _lastInsightNudgeAt: string | null = null;
	/** Count of insights currently in 'new' status (drives the status-bar badge). */
	private _newInsightCount = 0;
	/** The last non-badge status bar text (so badge can be appended/removed). */
	private _statusBarBaseText = '';
	/** Cached top new insight title for tooltip display. */
	private _topInsightTitle: string | null = null;
	/** Cached last detailed stats for tooltip rebuilding. */
	private _lastDetailedStats: DetailedStats | undefined;
	private tokenEstimators: Record<string, TokenEstimator> = tokenEstimatorsData.estimators;
	private co2Per1kTokens = 0.2; // gCO2e per 1000 tokens, a rough estimate
	private co2AbsorptionPerTreePerYear = 21000; // grams of CO2 per tree per year
	private waterUsagePer1kTokens = 0.3; // liters of water per 1000 tokens, based on data center usage estimates
	private _cacheHits = 0; // Counter for cache hits during usage analysis
	private _cacheMisses = 0; // Counter for cache misses during usage analysis
	// Short-term cache to avoid rescanning filesystem during rapid successive calls (e.g., diagnostics load)

	// Cached sql.js SQL module (lazy initialized)

	// In-flight command tracker — prevents concurrent execution of the same webview command
	private readonly _inFlightCommands = new Set<string>();

	// In-flight updateTokenStats promise — coalesces concurrent callers onto the same run
	private _updateTokenStatsInFlight: Promise<DetailedStats | undefined> | undefined;

	// --- Multi-window refresh coordination ---
	// When several VS Code/Codium windows are open, only the window that holds the
	// refresh leader lock performs the heavy discover+parse pass and publishes a
	// shared snapshot. Follower windows warm their cache from that snapshot and skip
	// parsing, except for a small budget of newly-changed files so the actively-used
	// window still shows fresh data (the "hybrid" freshness policy).
	private static readonly FOLLOWER_MISS_BUDGET = 25;
	// Bounded retry chain a follower uses to pick up the leader's snapshot when it
	// started before any snapshot existed (cold simultaneous start).
	private static readonly FOLLOWER_RESYNC_MAX_RETRIES = 4;
	private static readonly FOLLOWER_RESYNC_DELAY_MS = 15 * 1000;
	private _followerResyncTimer: NodeJS.Timeout | undefined;
	private _refreshHeartbeat: NodeJS.Timeout | undefined;

	// Flag to track if details panel is currently showing the loading screen
	private _detailsPanelIsLoading = false;

	// Editor list captured during the last (or current) log analysis, used to render the loading tooltip SVG
	private _loadingEditors: { icon: string; name: string }[] = [];
	// Previous progress percentage used to animate the progress bar smoothly between tooltip updates
	private _prevLoadingPercentage = 0;

	// Cache mapping workspaceStorageId -> resolved workspace folder path (or undefined if not resolvable)
	private _workspaceIdToFolderCache: Map<string, string | undefined> = new Map();

	// Cache mapping workspaceFolderPath -> found customization files (avoid re-scanning)
	private _customizationFilesCache: Map<string, CustomizationFileEntry[]> = new Map();

	// Last computed customization matrix for usage analysis (typed)
	private _lastCustomizationMatrix?: WorkspaceCustomizationMatrix;
	private _lastMissedPotential?: MissedPotentialWorkspace[];

	// Model pricing data - loaded from modelPricing.json
	// Reference: OpenAI API Pricing (https://openai.com/api/pricing/) - Retrieved December 2025
	// Reference: Anthropic Claude Pricing (https://www.anthropic.com/pricing) - Standard rates
	// Note: GitHub Copilot uses these models but pricing may differ from direct API usage
	// These are reference prices for cost estimation purposes only
	private modelPricing: { [key: string]: ModelPricing } = modelPricingData.pricing as { [key: string]: ModelPricing };

	// GitHub authentication session
	public githubSession: vscode.AuthenticationSession | undefined;
	// Promise that resolves when the startup session restore completes
	private _sessionRestorePromise: Promise<void> | undefined;
	// Promise that resolves when the initial cache load from disk completes
	private _cacheLoadPromise: Promise<void> | undefined;
	/** True when the user explicitly signed out from our extension this VS Code session. Gated by globalState so it survives reloads. */
	private _githubSignedOutByUser: boolean = false;
	/** Resolved Copilot plan details fetched from copilot_internal/user after sign-in. */
	private _copilotPlanResolved: { planId: string; planName: string; monthlyAiCreditsUsd: number; monthlyPremiumRequests: number | null } | undefined;
	/** Quota entitlements from copilot_internal/user response (e.g., premium_interactions entitlement). */
	private _copilotQuotaEntitlements: { premium_interactions?: number; completions?: number } = {};

	// Cached PR stats result for the repos tab
	private _lastRepoPrStats?: RepoPrStatsResult;

	// Cached cloud agent sessions result for the cloud agent tab
	private _lastAgentSessionsData?: AgentSessionsResult;

	// Tool name mapping - loaded from toolNames.json for friendly display names
	private toolNameMap: { [key: string]: string } = toolNamesData as { [key: string]: string };

	// Backend facade instance for accessing table storage data
	public backend: BackendFacade | undefined;

	// Helper method to get repository URL from package.json
	private getRepositoryUrl(): string {
		return _getRepositoryUrl();
	}

	/**
	 * Determine the editor type from a session file path
	 * Returns: 'VS Code', 'VS Code Insiders', 'VSCodium', 'Cursor', 'Copilot CLI', or 'Unknown'
	 */
	/**
	 * Detect the actual mode type from inputState.mode object.
	 * Returns 'ask', 'edit', 'agent', 'plan', or 'customAgent'.
	 */
	private getModeType(mode: any): 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent' {
		return _getModeType(mode);
	}

	/**
	 * Extract custom agent name from a file:// URI pointing to a .agent.md file.
	 * Returns the filename without the .agent.md extension.
	 */
	private getEditorTypeFromPath(filePath: string): string {
		return _getEditorTypeFromPath(filePath, (p) => this.findEcosystem(p)?.id === 'opencode');
	}

	/** Returns the first adapter that claims this session file, or null for Copilot Chat sessions. */
	private findEcosystem(sessionFile: string): IEcosystemAdapter | null {
		return this.ecosystems.find(e => e.handles(sessionFile)) ?? null;
	}

	/**
	 * Stat a session file, handling virtual paths for both OpenCode and Crush.
	 * Must be used instead of fs.promises.stat() directly.
	 */
	public async statSessionFile(sessionFile: string): Promise<import('fs').Stats> {
		const eco = this.findEcosystem(sessionFile);
		if (eco) { return eco.stat(sessionFile); }
		if (this.windsurf.isWindsurfSessionFile(sessionFile)) {
			const session = await this.windsurf.resolveSession(sessionFile);
			if (session) {
				const baseStats = await fs.promises.stat(__filename);
				Object.defineProperty(baseStats, 'mtime', { value: new Date(session.modified), writable: false });
				Object.defineProperty(baseStats, 'size', { value: session.size, writable: false });
				return baseStats;
			}
			return fs.promises.stat(__filename);
		}
		return fs.promises.stat(sessionFile);
	}

	/**
	 * Run async tasks over session files with bounded concurrency (default: 10).
	 * Prevents I/O saturation when processing hundreds of session files in parallel.
	 */
	private async runWithConcurrency<R>(
		files: string[],
		fn: (file: string, index: number) => Promise<R>,
		limit = 10
	): Promise<(R | undefined)[]> {
		if (files.length === 0) { return []; }
		const results: (R | undefined)[] = new Array(files.length);
		let idx = 0;
		const workers = Array.from({ length: Math.min(limit, files.length) }, async () => {
			while (idx < files.length) {
				const i = idx++;
				try { results[i] = await fn(files[i], i); } catch { results[i] = undefined; }
			}
		});
		await Promise.all(workers);
		return results;
	}

	/**
	 * Determine a friendly editor name from an editor root path (folder name)
	 * e.g. 'C:\...\AppData\Roaming\Code' -> 'VS Code'
	 */
	private getEditorNameFromRoot(rootPath: string): string {
		return _getEditorNameFromRoot(rootPath);
	}

	/**
	 * Extract a friendly display name from a repository URL.
	 * Supports HTTPS, SSH, and git:// URLs.
	 * @param repoUrl The full repository URL
	 * @returns A shortened display name like "owner/repo"
	 */
	private getRepoDisplayName(repoUrl: string): string {
		return _getRepoDisplayName(repoUrl);
	}

	// Logging methods
	public log(message: string): void {
		if (this._disposed) { return; }
		const timestamp = new Date().toLocaleTimeString();
		this.outputChannel.appendLine(`[${timestamp}] ${message}`);
	}

	public warn(message: string): void {
		if (this._disposed) { return; }
		const timestamp = new Date().toLocaleTimeString();
		this.outputChannel.appendLine(`[${timestamp}] WARNING: ${message}`);
	}

	private error(message: string, error?: any): void {
		if (this._disposed) { return; }
		const timestamp = new Date().toLocaleTimeString();
		this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
		if (error) {
			this.outputChannel.appendLine(`[${timestamp}] ${error}`);
		}
	}

	/**
	 * Dispatch a webview command with in-flight deduplication and error handling.
	 * If a command with the same key is already executing, the new call is silently dropped.
	 * Use panel-prefixed keys for panel-specific commands (e.g. 'refresh:details') and plain
	 * command names for shared navigation commands (e.g. 'showDetails').
	 */
	private async dispatch(commandKey: string, handler: () => unknown): Promise<void> {
		if (this._inFlightCommands.has(commandKey)) {
			this.log(`⏳ Command '${commandKey}' already in flight, skipping`);
			return;
		}
		this._inFlightCommands.add(commandKey);
		try {
			await handler();
		} catch (error) {
			this.error(`Webview command '${commandKey}' failed`, error);
			vscode.window.showErrorMessage(`Operation failed: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			this._inFlightCommands.delete(commandKey);
		}
	}

	public registerExtensionPointButton(button: ExtensionPointButton, handler: () => void | Promise<void>): { dispose(): void } {
		this._extensionPointButtons.set(button.id, { config: button, handler });
		return {
			dispose: () => {
				this._extensionPointButtons.delete(button.id);
			},
		};
	}

	private extensionPointButtonsScript(nonce: string): string {
		const data = [...this._extensionPointButtons.values()].map(e => ({ id: e.config.id, label: e.config.label }));
		return `<script nonce="${nonce}">window.__EXTENSION_POINT_BUTTONS__ = ${JSON.stringify(data)};</script>`;
	}

	private async handleExtensionPointAction(buttonId: string): Promise<boolean> {
		const entry = this._extensionPointButtons.get(buttonId);
		if (!entry) { return false; }
		await this.dispatch(`extensionPoint:${buttonId}`, () => entry.handler());
		return true;
	}

	/**
	 * Dispatch a shared navigation command that is common across all webview panels.
	 * Returns true if the command was recognised and dispatched, false if it is panel-specific.
	 */
	private async dispatchSharedCommand(message: { command: string; [key: string]: any }): Promise<boolean> {
		if (message.command === 'extensionPointAction' && typeof message.buttonId === 'string') {
			return this.handleExtensionPointAction(message.buttonId);
		}
		const handlers: Record<string, () => unknown> = {
			showDetails:            () => this.showDetails(),
			showChart:              () => this.showChart(),
			showUsageAnalysis:      () => this.showUsageAnalysis(),
			showDiagnostics:        () => this.showDiagnosticReport(),
			showMaturity:           () => this.showMaturity(),
			showDashboard:          () => this.showDashboard(),
			showEnvironmental:      () => this.showEnvironmental(),
			showFluencyLevelViewer: () => this.showFluencyLevelViewer(),
		};
		const handler = handlers[message.command];
		if (!handler) { return false; }
		await this.dispatch(message.command, handler);
		return true;
	}

	private consumeLocalViewRegressionProbe(viewId: string): ViewRegressionProbeConfig | undefined {
		const probe = this.pendingLocalViewRegressionProbe;
		if (probe?.viewId !== viewId) {
			return undefined;
		}
		this.pendingLocalViewRegressionProbe = undefined;
		return probe;
	}

	private getLocalViewRegressionProbeScript(viewId: string, nonce: string): string {
		return createViewRegressionProbeScript(nonce, this.consumeLocalViewRegressionProbe(viewId));
	}

	private handleLocalViewRegressionMessage(message: any): boolean {
		if (message?.command !== 'localViewRegressionReport' || typeof message.runId !== 'string') {
			return false;
		}

		const resolve = this.localViewRegressionResolvers.get(message.runId);
		if (!resolve) {
			return true;
		}

		this.localViewRegressionResolvers.delete(message.runId);
		resolve({
			pass: Boolean(message.pass),
			summary: typeof message.summary === 'string' ? message.summary : 'Local view regression probe finished.',
			timedOut: Boolean(message.timedOut),
			metrics: typeof message.metrics === 'object' && message.metrics
				? message.metrics as ViewRegressionProbeSnapshot
				: undefined,
		});
		return true;
	}

	private getBundledLocalViewRegressionSampleDir(): string {
		return path.join(this.extensionUri.fsPath, 'test', 'fixtures', 'sample-session-data', 'chatSessions');
	}

	private async ensureLocalViewRegressionSampleDir(): Promise<string> {
		const sampleDir = this.getBundledLocalViewRegressionSampleDir();
		await fs.promises.access(sampleDir);
		return sampleDir;
	}

	private async runLocalViewRegressionCase(viewCase: LocalViewRegressionCase): Promise<LocalViewRegressionResult> {
		viewCase.reset();
		const runId = `${viewCase.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		const probePromise = new Promise<LocalViewRegressionProbeResult>((resolve) => {
			let settled = false;
			const finish = (result: LocalViewRegressionProbeResult) => {
				if (settled) {
					return;
				}
				settled = true;
				this.localViewRegressionResolvers.delete(runId);
				resolve(result);
			};

			this.localViewRegressionResolvers.set(runId, finish);
			setTimeout(() => {
				finish({
					pass: false,
					summary: `No regression probe response received within ${Math.round(viewCase.timeoutMs / 1000)}s.`,
					timedOut: true,
				});
			}, viewCase.timeoutMs + 750).unref();
		});

		try {
			this.pendingLocalViewRegressionProbe = {
				runId,
				viewId: viewCase.id,
				title: viewCase.title,
				timeoutMs: viewCase.timeoutMs,
				expectations: viewCase.expectations,
			};
			await viewCase.open();
		} catch (error) {
			this.pendingLocalViewRegressionProbe = undefined;
			this.localViewRegressionResolvers.delete(runId);
			return {
				id: viewCase.id,
				title: viewCase.title,
				status: 'fail',
				detail: error instanceof Error ? error.message : String(error),
				dataPoints: viewCase.dataPoints,
			};
		}

		const probeResult = await probePromise;
		const evaluated = probeResult.metrics
			? evaluateViewRegressionProbe(viewCase.expectations, probeResult.metrics)
			: { pass: probeResult.pass, summary: probeResult.summary };

		return {
			id: viewCase.id,
			title: viewCase.title,
			status: evaluated.pass ? 'pass' : 'fail',
			detail: probeResult.summary || evaluated.summary,
			dataPoints: viewCase.dataPoints,
			probe: probeResult.metrics,
		};
	}

	public async runLocalViewRegression(): Promise<void> {
		if (this.context.extensionMode !== vscode.ExtensionMode.Development) {
			await vscode.window.showWarningMessage('Local view regression is only available in the Extension Development Host.');
			return;
		}
		this.outputChannel.show(true);
		const previousSampleDir = this.localRegressionSampleDataDir;
		this.localRegressionSampleDataDir = '';
		this.sessionDiscovery.clearCache();
		this.lastDetailedStats = this.lastDailyStats = this.lastFullDailyStats = this.lastUsageAnalysisStats = undefined;
		const results: LocalViewRegressionResult[] = [];
		let dataSourceLabel = 'local session data';
		try {
			const setup = await this.setupRegressionSessionFiles(dataSourceLabel);
			dataSourceLabel = setup.dataSourceLabel;
			this.log(`🧪 Starting local view regression using ${dataSourceLabel}. Found ${setup.sessionFiles.length} session file(s).`);
			const stats = await this.computeRegressionStats(dataSourceLabel, setup.sessionFiles);
			const cases = this.buildLocalViewRegressionCases(stats, setup.sessionFiles);
			for (const viewCase of cases) { results.push(await this.runLocalViewRegressionCase(viewCase)); }
			results.push({ id: 'dashboard', title: 'Team Dashboard', status: 'skip', detail: 'Skipped because this view requires a configured backend.' });
		} catch (error) {
			results.push({ id: 'regression-runner', title: 'Local regression runner', status: 'fail', detail: error instanceof Error ? error.message : String(error) });
		} finally {
			this.pendingLocalViewRegressionProbe = undefined;
			this.localRegressionSampleDataDir = previousSampleDir;
			this.sessionDiscovery.clearCache();
			this.lastDetailedStats = this.lastDailyStats = this.lastFullDailyStats = this.lastUsageAnalysisStats = this.lastDashboardData = undefined;
		}
		await this.reportLocalViewRegressionResults(results, dataSourceLabel);
	}

	private async setupRegressionSessionFiles(defaultLabel: string): Promise<{ sessionFiles: string[]; dataSourceLabel: string }> {
		let sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
		if (sessionFiles.length > 0) { return { sessionFiles, dataSourceLabel: defaultLabel }; }
		let sampleDir: string;
		try { sampleDir = await this.ensureLocalViewRegressionSampleDir(); }
		catch { throw new Error('Bundled sample session data was not found. Expected test fixtures under vscode-extension\\test\\fixtures\\sample-session-data\\chatSessions.'); }
		this.localRegressionSampleDataDir = sampleDir;
		this.sessionDiscovery.clearCache();
		sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
		return { sessionFiles, dataSourceLabel: `bundled sample data (${sampleDir})` };
	}

	private async computeRegressionStats(dataSourceLabel: string, sessionFiles: string[]): Promise<{ detailedStats: any; dailyStats: any; usageStats: any; maturityData: any; diagnosticReport: string; fluencyLevelData: any; chartTotals: any }> {
		const detailedStats = await this.updateTokenStats(true);
		if (!detailedStats) { throw new Error(`Failed to calculate detailed stats from ${dataSourceLabel}.`); }
		const dailyStats = this.lastDailyStats ?? await this.calculateDailyStats();
		const usageStats = await this.calculateUsageAnalysisStats(false);
		const maturityData = await this.calculateMaturityScores(false);
		const diagnosticReport = await this.generateDiagnosticReport();
		const fluencyLevelData = this.getFluencyLevelData(true);
		const chartTotals = this.buildChartData(dailyStats);
		return { detailedStats, dailyStats, usageStats, maturityData, diagnosticReport, fluencyLevelData, chartTotals };
	}

	private buildLocalViewRegressionCases(stats: any, sessionFiles: string[]): LocalViewRegressionCase[] {
		const { detailedStats, usageStats, maturityData, diagnosticReport, fluencyLevelData, chartTotals } = stats;
		const totalFluencyLevels = fluencyLevelData.categories.reduce((sum: number, c: any) => sum + c.levels.length, 0);
		const categoriesWithEvidence = maturityData.categories.filter((c: any) => c.evidence.length > 0).length;
		return [
			{ id: 'details', title: 'Details', timeoutMs: 25000, expectations: { minRootChildren: 1, minBodyTextLength: 120, minRootTextLength: 80 }, dataPoints: [{ label: 'today tokens', value: detailedStats.today.tokens }, { label: '30d tokens', value: detailedStats.last30Days.tokens }, { label: '30d sessions', value: detailedStats.last30Days.sessions }], reset: () => this.detailsPanel?.dispose(), open: () => this.showDetails() },
			{ id: 'chart', title: 'Chart', timeoutMs: 25000, expectations: { minRootChildren: 1, minBodyTextLength: 20, minCanvasOrSvg: 1 }, dataPoints: [{ label: 'days', value: chartTotals.dailyCount }, { label: 'tokens', value: chartTotals.totalTokens }, { label: 'sessions', value: chartTotals.totalSessions }], reset: () => this.chartPanel?.dispose(), open: () => this.showChart() },
			{ id: 'usage', title: 'Usage Analysis', timeoutMs: 25000, expectations: { minRootChildren: 1, minBodyTextLength: 140, minRootTextLength: 80 }, dataPoints: [{ label: '30d sessions', value: usageStats.last30Days.sessions }, { label: 'repos', value: usageStats.last30Days.repositories.length }, { label: 'tool calls', value: usageStats.last30Days.toolCalls.total }], reset: () => this.analysisPanel?.dispose(), open: () => this.showUsageAnalysis() },
			{ id: 'maturity', title: 'Fluency Score', timeoutMs: 25000, expectations: { minRootChildren: 1, minBodyTextLength: 120, minRootTextLength: 80 }, dataPoints: [{ label: 'overall', value: maturityData.overallLabel }, { label: 'categories', value: maturityData.categories.length }, { label: 'with evidence', value: categoriesWithEvidence }], reset: () => this.maturityPanel?.dispose(), open: () => this.showMaturity() },
			{ id: 'environmental', title: 'Environmental Impact', timeoutMs: 25000, expectations: { minRootChildren: 1, minBodyTextLength: 100, minRootTextLength: 70 }, dataPoints: [{ label: '30d tokens', value: detailedStats.last30Days.tokens }, { label: 'CO2 g', value: detailedStats.last30Days.co2.toFixed(2) }, { label: 'water L', value: detailedStats.last30Days.waterUsage.toFixed(2) }], reset: () => this.environmentalPanel?.dispose(), open: () => this.showEnvironmental() },
			{ id: 'diagnostics', title: 'Diagnostics', timeoutMs: 30000, expectations: { minRootChildren: 1, minBodyTextLength: 140, minRootTextLength: 80, disallowTextPatterns: ['loading...'] }, dataPoints: [{ label: 'session files', value: sessionFiles.length }, { label: 'report lines', value: diagnosticReport.split(/\r?\n/).length }], reset: () => this.diagnosticsPanel?.dispose(), open: () => this.showDiagnosticReport() },
			{ id: 'fluency-level-viewer', title: 'Fluency Level Viewer', timeoutMs: 25000, expectations: { minRootChildren: 1, minBodyTextLength: 120, minRootTextLength: 80 }, dataPoints: [{ label: 'categories', value: fluencyLevelData.categories.length }, { label: 'levels', value: totalFluencyLevels }], reset: () => this.fluencyLevelViewerPanel?.dispose(), open: () => this.showFluencyLevelViewer() },
		];
	}

	private async reportLocalViewRegressionResults(results: LocalViewRegressionResult[], dataSourceLabel: string): Promise<void> {
		const report = formatLocalViewRegressionReport(results);
		this.outputChannel.appendLine('');
		for (const line of report.split(/\r?\n/)) { this.outputChannel.appendLine(line); }
		this.outputChannel.appendLine('');
		const failures = results.filter((r) => r.status === 'fail').length;
		const passed = results.filter((r) => r.status === 'pass').length;
		const skipped = results.filter((r) => r.status === 'skip').length;
		const summary = failures === 0
			? `Local view regression passed: ${passed} view(s), ${skipped} skipped. Data source: ${dataSourceLabel}.`
			: `Local view regression found ${failures} failing view(s). Data source: ${dataSourceLabel}. See the output channel for details.`;
		const choice = failures === 0
			? await vscode.window.showInformationMessage(summary, 'Show Output')
			: await vscode.window.showWarningMessage(summary, 'Show Output');
		if (choice === 'Show Output') { this.outputChannel.show(true); }
	}

	// Cache management methods
	/**
	 * Checks if the cache is valid for a file by comparing mtime and size.
	 * If the cache entry is missing size (old format), treat as invalid so it will be upgraded.
	 */

	private getCachedSessionData(filePath: string): SessionFileCache | undefined {
		return this.cacheManager.getCachedSessionData(filePath);
	}

	/**
	 * Sets the cache entry for a session file, including file size.
	 */
	private setCachedSessionData(filePath: string, data: SessionFileCache, fileSize?: number): void {
		return this.cacheManager.setCachedSessionData(filePath, data);
	}


	/**
	 * Generate a cache identifier based on VS Code extension mode.
	 * VS Code editions (stable vs insiders) already have separate globalState storage,
	 * so we only need to distinguish between production and development (debug) mode.
	 * In development mode, each VS Code window gets a unique cache identifier using
	 * the session ID, preventing the Extension Development Host from sharing/fighting
	 * with the main dev window's cache.
	 */

	/**
	 * Get the path for the cache lock file.
	 * Uses globalStorageUri which is already scoped per VS Code edition.
	 */

	/**
	 * Acquire an exclusive file lock for cache writes.
	 * Uses atomic file creation (O_EXCL / CREATE_NEW) to prevent concurrent writes
	 * across multiple VS Code windows of the same edition.
	 * Returns true if lock acquired, false if another instance holds it.
	 */

	/**
	 * Release the cache lock file, but only if we own it.
	 */

	// Persistent cache storage methods

	/**
	 * One-time migration: remove old per-session cache keys that were created by
	 * earlier versions of the extension (keys containing sessionId or timestamp).
	 * Also removes the legacy unscoped keys ('sessionFileCache', 'sessionFileCacheVersion').
	 */

	private async saveCacheToStorage(): Promise<void> {
		return this.cacheManager.saveCacheToStorage();
	}

	public async clearCache(): Promise<void> {
		try {
			// Show the output channel so users can see what's happening
			this.outputChannel.show(true);
			this.log('Clearing session file cache...');

			const cacheSize = this.cacheManager.cache.size;
			this.cacheManager.cache.clear();

			// Delete the on-disk snapshot so it isn't reloaded after restart.
			await this.cacheManager.deleteSharedSnapshot();

			// Reset diagnostics loaded flag so the diagnostics view will reload files
			this.diagnosticsHasLoadedFiles = false;
			this.diagnosticsCachedFiles = [];
			// Clear cached computed stats so details panel doesn't show stale data
			this.lastDetailedStats = undefined;
			this.lastDailyStats = undefined;
			this.lastFullDailyStats = undefined;
			this.lastUsageAnalysisStats = undefined;
			this.lastDashboardData = undefined;

			this.log(`Cache cleared successfully. Removed ${cacheSize} entries.`);
			vscode.window.showInformationMessage('Cache cleared successfully. Reloading statistics...');

			// Trigger a refresh after clearing the cache
			this.log('Reloading token statistics...');
			await this.updateTokenStats();
			this.log('Token statistics reloaded successfully.');
		} catch (error) {
			this.error('Error clearing cache:', error);
			vscode.window.showErrorMessage('Failed to clear cache: ' + error);
		}
	}

	constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
		this.extensionUri = extensionUri;
		this.context = context;
		this.initializeAdapters(extensionUri, context);
		this.initializeOutputChannel(context);
		this._cacheLoadPromise = this.cacheManager.loadCacheFromStorage().finally(() => {
			this._cacheLoadPromise = undefined;
		});
		this._sessionRestorePromise = this.restoreGitHubSession();
		this.setupGitHubAuthListener(context);
		this.sessionDiscovery.checkCopilotExtension();
		this.initializeStatusBar();
		this.setupConfigurationListener(context);
		this.loadInsightState();
		this.scheduleInitialUpdate();
		this.updateInterval = setInterval(() => {
			this.updateTokenStats(true, true);
		}, 5 * 60 * 1000);
	}

	private initializeAdapters(extensionUri: vscode.Uri, context: vscode.ExtensionContext): void {
		const dataAccess = createDataAccessInstances(extensionUri);
		this.openCode = dataAccess.openCode;
		this.crush = dataAccess.crush;
		this.continue_ = dataAccess.continue_;
		this.visualStudio = dataAccess.visualStudio;
		this.claudeCode = dataAccess.claudeCode;
		this.claudeDesktopCowork = dataAccess.claudeDesktopCowork;
		this.mistralVibe = dataAccess.mistralVibe;
		this.geminiCli = dataAccess.geminiCli;
		this.windsurf = new WindsurfDataAccess(extensionUri, (m) => this.log(m));
		this.ecosystems = buildAdapterRegistry({
			...dataAccess,
			estimateTokens: (t, m) => this.estimateTokensFromText(t, m),
			isMcpTool: (t) => this.isMcpTool(t),
			extractMcpServerName: (t) => this.extractMcpServerName(t),
		});
		this.cacheManager = new CacheManager(context, { log: (m: string) => this.log(m), warn: (m: string) => this.warn(m), error: (m: string) => this.error(m) }, CopilotTokenTracker.CACHE_VERSION);
		this.sessionDiscovery = new SessionDiscovery({
			log: (m) => this.log(m),
			warn: (m) => this.warn(m),
			error: (m, e) => this.error(m, e),
			ecosystems: this.ecosystems,
			windsurf: this.windsurf,
			sampleDataDirectoryOverride: () => this.localRegressionSampleDataDir,
		});
	}

	private loadInsightState(): void {
		this._insightStateBag = this.context.globalState.get<InsightStateBag>('insights.state', {});
		this._lastInsightNudgeAt = this.context.globalState.get<string>('insights.lastNudgeAt', '') || null;
	}

	private initializeOutputChannel(context: vscode.ExtensionContext): void {
		if (context.extensionMode === vscode.ExtensionMode.Development) {
			try {
				this._devBranch = childProcess.execSync('git rev-parse --abbrev-ref HEAD', {
					cwd: context.extensionUri.fsPath, encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe']
				}).trim();
			} catch { /* Ignore git errors in dev mode */ }
		}
		this.outputChannel = vscode.window.createOutputChannel('AI Engineering Fluency');
		context.subscriptions.push(this.outputChannel);
		this.log('Constructor called');
		const version = context.extension.packageJSON?.version ?? 'unknown';
		const mode = context.extensionMode === vscode.ExtensionMode.Development ? 'Development'
			: context.extensionMode === vscode.ExtensionMode.Test ? 'Test' : 'Production';
		let startupInfo = `\uD83D\uDE80 AI Engineering Fluency v${version} [${mode}] (cache v${CopilotTokenTracker.CACHE_VERSION})`;
		if (context.extensionMode === vscode.ExtensionMode.Development) {
			try {
				const sha = childProcess.execSync('git rev-parse --short HEAD', {
					cwd: context.extensionUri.fsPath, encoding: 'utf8', timeout: 3000, stdio: ['pipe', 'pipe', 'pipe']
				}).trim();
				startupInfo += ` branch=${this._devBranch ?? 'unknown'} sha=${sha}`;
			} catch { /* git unavailable */ }
		}
		this.log(startupInfo);
	}

	private setupGitHubAuthListener(context: vscode.ExtensionContext): void {
		context.subscriptions.push(
			vscode.authentication.onDidChangeSessions(async (e) => {
				if (e.provider.id !== 'github') { return; }
				if (this._githubSignedOutByUser) { return; }
				const session = await vscode.authentication.getSession('github', ['read:user'], { createIfNone: false });
				if (session) {
					this.githubSession = session;
					await this.context.globalState.update('github.authenticated', true);
					await this.context.globalState.update('github.username', session.account.label);
					void this.loadAndLogCopilotPlanInfo();
				} else {
					this.githubSession = undefined;
					await this.context.globalState.update('github.authenticated', false);
					await this.context.globalState.update('github.username', undefined);
					this.log('GitHub session removed externally — clearing auth state');
				}
			})
		);
	}

	private initializeStatusBar(): void {
		this.statusBarItem = vscode.window.createStatusBarItem('ai-engineering-fluency', vscode.StatusBarAlignment.Right, 102);
		this.statusBarItem.name = "AI Engineering Fluency";
		this.setStatusBarText("$(loading~spin) AI Fluency: Loading...");
		this.statusBarItem.tooltip = "AI Engineering Fluency — daily and 30-day token usage - Click to open details";
		this.statusBarItem.command = 'aiEngineeringFluency.showDetails';
		this.statusBarItem.show();

		// Separate insights badge — hidden until there are new insights
		this.insightsStatusBarItem = vscode.window.createStatusBarItem('ai-engineering-fluency-insights', vscode.StatusBarAlignment.Right, 101);
		this.insightsStatusBarItem.name = "AI Engineering Fluency — Insights";
		this.insightsStatusBarItem.command = 'aiEngineeringFluency.openInsightsTab';
		// starts hidden; shown in refreshStatusBarInsightBadge when count > 0

		this.log('Status bar item created and shown');
	}

	private setupConfigurationListener(context: vscode.ExtensionContext): void {
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration('aiEngineeringFluency.display')) { this.refreshOpenPanelsForSettingChange(); }
				if (e.affectsConfiguration('aiEngineeringFluency.backend')) {
					this.startBackendSyncAfterInitialAnalysis();
					const backend = this.backend;
					if (backend && typeof backend.syncToBackendStore === 'function') {
						void (async () => {
							try {
								await backend.syncToBackendStore(true);
								if (this.diagnosticsPanel) { this.loadDiagnosticDataInBackground(this.diagnosticsPanel); }
							} catch (err: unknown) {
								this.warn('Backend sync after settings change failed: ' + err);
							}
						})();
					}
					if (this.diagnosticsPanel) { this.loadDiagnosticDataInBackground(this.diagnosticsPanel); }
				}
			})
		);
	}

	private scheduleInitialUpdate(): void {
		this.log('🚀 Starting token usage analysis...');
		// Use a longer delay (3 s) so that:
		// 1. VS Code and other extensions finish their own startup work first.
		// 2. On macOS, the TCC privacy framework has time to resolve any first-time
		//    folder-access permissions before our synchronous filesystem scan begins.
		//    Without this delay the sync fs calls block the shared extension-host
		//    event loop and make VS Code appear frozen.
		// Previously a "wait for Copilot ready" gate provided a similar natural delay;
		// this explicit wait restores that behaviour for users who do not have Copilot.
		setTimeout(async () => {
			try {
				await this.updateTokenStats();
				this.startBackendSyncAfterInitialAnalysis();
				await this.checkAndShowOnboarding();
				await this.showFluencyScoreNewsBanner();
				await this.showUnknownMcpToolsBanner();
			} catch (error) {
				this.error('Error in initial update:', error);
			}
		}, 3000);
	}

	/**
	 * After the initial scan, decide whether to show onboarding guidance.
	 * Branches on three cases:
	 *   1. Returning user (`hasSeenOnboarding` already set) — do nothing.
	 *   2. Genuine first use (no files, no discovery error) — show welcome notification.
	 *   3. Discovery failure (no files + adapter error) — route to Diagnostics.
	 * When data is found, the flag is marked so subsequent runs skip this.
	 */
	private async checkAndShowOnboarding(): Promise<void> {
		const hasSeenOnboarding = this.context.globalState.get<boolean>('hasSeenOnboarding', false);
		const sessionFilesCount = this.sessionDiscovery.lastDiscoveryFilesCount;
		const hadDiscoveryError = this.sessionDiscovery.lastDiscoveryHadError;

		// Compute action from pre-update state so the decision is stable.
		const action = determineOnboardingAction(hasSeenOnboarding, sessionFilesCount, hadDiscoveryError);

		// Mark as seen whenever data is present so future runs skip onboarding.
		if (sessionFilesCount > 0) {
			await this.context.globalState.update('hasSeenOnboarding', true);
		}

		switch (action) {
			case 'welcome': {
				const choice = await vscode.window.showInformationMessage(
					'AI Engineering Fluency tracks your GitHub Copilot usage — token counts, cost estimates, and fluency scores based on how you interact with AI tools.',
					'Open Fluency Score',
					'Learn More',
				);
				await this.context.globalState.update('hasSeenOnboarding', true);
				if (choice === 'Open Fluency Score') {
					await this.showMaturity();
				} else if (choice === 'Learn More') {
					await vscode.env.openExternal(vscode.Uri.parse('https://github.com/rajbos/ai-engineering-fluency#supported-editors'));
				}
				break;
			}
			case 'diagnostics': {
				const choice = await vscode.window.showWarningMessage(
					'AI Engineering Fluency: session files could not be found. Open Diagnostics to investigate.',
					'Open Diagnostics',
				);
				if (choice === 'Open Diagnostics') {
					await this.showDiagnosticReport();
				}
				break;
			}
			default:
				break;
		}
	}

	/**
	 * Start backend sync timer after initial token analysis completes.
	 * This avoids resource contention during extension startup.
	 */
	private startBackendSyncAfterInitialAnalysis(): void {
		try {
			const backend = this.backend;
			if (backend && typeof backend.startTimerIfEnabled === 'function') {
				backend.startTimerIfEnabled();
			}
		} catch (error) {
			this.warn('Failed to start backend sync timer: ' + error);
		}
	}

	private async showFluencyScoreNewsBanner(): Promise<void> {
		const dismissedKey = 'news.fluencyScoreBanner.v1.dismissed';
		if (this.context.globalState.get<boolean>(dismissedKey)) {
			return;
		}
		// If the user already opened the fluency view themselves, no need to prompt them
		const fluencyViewedKey = 'fluencyScore.everOpened';
		if (this.context.globalState.get<boolean>(fluencyViewedKey)) {
			await this.context.globalState.update(dismissedKey, true);
			return;
		}
		const openCountKey = 'extension.openCount';
		const openCount = (this.context.globalState.get<number>(openCountKey) ?? 0) + 1;
		await this.context.globalState.update(openCountKey, openCount);
		if (openCount < 5) {
			return;
		}
		const open = 'Open Fluency Score';
		const dismiss = 'Dismiss';
		const choice = await vscode.window.showInformationMessage(
			'🎯 New: AI Engineering Fluency Score dashboard — track how deeply your team uses GitHub Copilot across 6 categories and 4 stages.',
			open,
			dismiss
		);
		await this.context.globalState.update(dismissedKey, true);
		if (choice === open) {
			await this.showMaturity();
		}
	}

	private getUnknownMcpToolsFromStats(stats: UsageAnalysisStats): string[] {
		const allTools = new Set<string>();
		Object.keys(stats.today.mcpTools.byTool).forEach(tool => allTools.add(tool));
		Object.keys(stats.last30Days.mcpTools.byTool).forEach(tool => allTools.add(tool));
		Object.keys(stats.month.mcpTools.byTool).forEach(tool => allTools.add(tool));
		Object.keys(stats.today.toolCalls.byTool).forEach(tool => allTools.add(tool));
		Object.keys(stats.last30Days.toolCalls.byTool).forEach(tool => allTools.add(tool));
		Object.keys(stats.month.toolCalls.byTool).forEach(tool => allTools.add(tool));
		const suppressed = new Set<string>(
			vscode.workspace.getConfiguration('aiEngineeringFluency').get<string[]>('suppressedUnknownTools', [])
		);
		return Array.from(allTools).filter(tool => !this.toolNameMap[tool] && !this.toolNameMap[tool.toLowerCase()] && !isGuidMcpTool(tool) && !suppressed.has(tool)).sort();
	}

	private async showUnknownMcpToolsBanner(): Promise<void> {
		const dismissedKey = 'news.unknownMcpTools.dismissedVersion';
		const dismissedVersion = this.context.globalState.get<string>(dismissedKey);
		if (dismissedVersion === packageJson.version) {
			return;
		}
		const openCountKey = 'extension.unknownMcpOpenCount';
		const openCount = (this.context.globalState.get<number>(openCountKey) ?? 0) + 1;
		await this.context.globalState.update(openCountKey, openCount);
		if (openCount < 8) {
			return;
		}
		const stats = await this.calculateUsageAnalysisStats(true);
		const unknownTools = this.getUnknownMcpToolsFromStats(stats);
		if (unknownTools.length === 0) {
			return;
		}
		const open = 'Open Usage Analysis';
		const dismiss = 'Dismiss';
		const choice = await vscode.window.showInformationMessage(
			`🔌 Found ${unknownTools.length} tool${unknownTools.length > 1 ? 's' : ''} without friendly names. Help improve the extension by reporting them.`,

			open,
			dismiss
		);
		await this.context.globalState.update(dismissedKey, packageJson.version);
		if (choice === open) {
			await this.showUsageAnalysis();
			setTimeout(() => {
				this.analysisPanel?.webview.postMessage({ command: 'highlightUnknownTools' });
			}, 500);
		}
	}

	private setStatusBarText(text: string): void {
		this._statusBarBaseText = text;
		this.statusBarItem.text = this._devBranch ? `${text} [${this._devBranch}]` : text;
	}

	private refreshStatusBarInsightBadge(count: number, topInsightTitle?: string): void {
		this._newInsightCount = count;
		this._topInsightTitle = topInsightTitle ?? this._topInsightTitle;
		// Main status bar: remove the 💡 badge — it now lives in its own item
		this.setStatusBarText(this._statusBarBaseText);

		if (count > 0) {
			const label = count === 1 ? '1 insight' : `${count} insights`;
			this.insightsStatusBarItem.text = `💡 ${label}`;
			const tooltip = new vscode.MarkdownString();
			tooltip.isTrusted = false;
			tooltip.appendMarkdown(`**AI Fluency Insights** — ${label} waiting for you\n\n`);
			if (this._topInsightTitle) {
				tooltip.appendMarkdown(`${this._topInsightTitle}\n\n`);
			}
			tooltip.appendMarkdown('Click to open the Insights tab');
			this.insightsStatusBarItem.tooltip = tooltip;
			this.insightsStatusBarItem.show();
		} else {
			this.insightsStatusBarItem.hide();
		}
	}

	private sendLoadingPanelMessage(msg: object): void {
		if (this.detailsPanel && this._detailsPanelIsLoading) {
			void this.detailsPanel.webview.postMessage(msg);
		}
	}

	/**
	 * Authenticate with GitHub using VS Code's authentication API.
	 */
	public async authenticateWithGitHub(): Promise<void> {
		try {
			this.log('Attempting GitHub authentication...');
			const session = await vscode.authentication.getSession(
				'github',
				['read:user'],
				{ createIfNone: true }
			);
			if (session) {
				this.githubSession = session;
				this._githubSignedOutByUser = false;
				await this.context.globalState.update('github.signedOutByUser', false);
				this.log(`✅ Successfully authenticated as ${session.account.label}`);
				vscode.window.showInformationMessage(`GitHub authentication successful! Logged in as ${session.account.label}`);
				await this.context.globalState.update('github.authenticated', true);
				await this.context.globalState.update('github.username', session.account.label);
				void this.loadAndLogCopilotPlanInfo();
			}
		} catch (error) {
			this.error('GitHub authentication failed:', error);
			vscode.window.showErrorMessage('Failed to authenticate with GitHub. Please try again.');
		}
	}

	/**
	 * Sign out from GitHub.
	 */
	public async signOutFromGitHub(): Promise<void> {
		try {
			this.log('Signing out from GitHub...');
			this.githubSession = undefined;
			this._githubSignedOutByUser = true;
			await this.context.globalState.update('github.authenticated', false);
			await this.context.globalState.update('github.username', undefined);
			await this.context.globalState.update('github.signedOutByUser', true);
			this.log('✅ Successfully signed out from GitHub');
			vscode.window.showInformationMessage('Signed out from GitHub successfully.');

			// Notify the analysis panel so the Repository PRs tab shows "not authenticated"
			if (this.analysisPanel) {
				const since = new Date();
				since.setDate(since.getDate() - 30);
				const result: RepoPrStatsResult = { repos: [], authenticated: false, since: since.toISOString() };
				this._lastRepoPrStats = result;
				this.analysisPanel.webview.postMessage({ command: 'repoPrStatsLoaded', data: result });
				const agentResult: AgentSessionsResult = { repos: [], totalTasks: 0, totalSessions: 0, totalCredits: 0, authenticated: false, since: since.toISOString(), fetchedAt: new Date().toISOString() };
				this._lastAgentSessionsData = agentResult;
				this.analysisPanel.webview.postMessage({ command: 'agentSessionsLoaded', data: agentResult });
			}
		} catch (error) {
			this.error('Failed to sign out from GitHub:', error);
			vscode.window.showErrorMessage('Failed to sign out from GitHub.');
		}
	}

	/**
	 * Get the current GitHub authentication status.
	 */
	public getGitHubAuthStatus(): { authenticated: boolean; username?: string } {
		// Check in-memory session first — avoids race with globalState writes on startup
		if (this.githubSession) {
			return { authenticated: true, username: this.githubSession.account.label };
		}
		const authenticated = this.context.globalState.get<boolean>('github.authenticated', false);
		const username = this.context.globalState.get<string>('github.username');
		return { authenticated, username };
	}

	/**
	 * Check if the user is authenticated with GitHub.
	 */
	public isGitHubAuthenticated(): boolean {
		// Primary check: in-memory session
		if (this.githubSession !== undefined) {
			return true;
		}
		// Fallback: check persisted state (session may not be restored yet)
		// Note: This may be true even if the session is expired
		// The restoreGitHubSession method will reconcile this on startup
		return this.context.globalState.get<boolean>('github.authenticated', false);
	}

	/**
	 * Get the current GitHub session (if authenticated).
	 */
	public getGitHubSession(): vscode.AuthenticationSession | undefined {
		return this.githubSession;
	}

	/** Load PR stats for all discovered GitHub repos and send results to the analysis panel. */
	private async loadRepoPrStats(): Promise<void> {
		if (!this.analysisPanel) { return; }

		const since = new Date();
		since.setDate(since.getDate() - 30);

		if (this._githubSignedOutByUser) {
			const result: RepoPrStatsResult = { repos: [], authenticated: false, since: since.toISOString() };
			this._lastRepoPrStats = result;
			this.analysisPanel.webview.postMessage({ command: 'repoPrStatsLoaded', data: result });
			return;
		}

		const session = await vscode.authentication.getSession('github', ['read:user'], { createIfNone: false });
		if (!session) {
			const result: RepoPrStatsResult = { repos: [], authenticated: false, since: since.toISOString() };
			this._lastRepoPrStats = result;
			this.analysisPanel.webview.postMessage({ command: 'repoPrStatsLoaded', data: result });
			return;
		}

		if (!this.githubSession) {
			this.githubSession = session;
			await this.context.globalState.update('github.authenticated', true);
			await this.context.globalState.update('github.username', session.account.label);
			this.log(`✅ GitHub session synced from existing VS Code auth: ${session.account.label}`);
		}

		const workspacePaths = this._buildWorkspacePaths();
		const repos = discoverGitHubRepos(workspacePaths);
		this.analysisPanel.webview.postMessage({ command: 'repoPrStatsProgress', total: repos.length, done: 0 });

		const results: RepoPrInfo[] = [];
		for (let i = 0; i < repos.length; i++) {
			const { owner, repo } = repos[i];
			const { prs, error } = await fetchRepoPrs(owner, repo, session.accessToken, since);
			const stats = this.collectAiPrStats(prs, error);
			results.push({ owner, repo, repoUrl: `https://github.com/${owner}/${repo}`, ...stats, error });
			this.analysisPanel.webview.postMessage({ command: 'repoPrStatsProgress', total: repos.length, done: i + 1 });
		}

		const result: RepoPrStatsResult = { repos: results, authenticated: true, since: since.toISOString() };
		this._lastRepoPrStats = result;
		this.analysisPanel.webview.postMessage({ command: 'repoPrStatsLoaded', data: result });
	}

	private collectAiPrStats(prs: any[], error: any): { totalPrs: number; aiAuthoredPrs: number; aiReviewRequestedPrs: number; aiDetails: RepoPrDetail[] } {
		let totalPrs = 0;
		let aiAuthoredPrs = 0;
		let aiReviewRequestedPrs = 0;
		const aiDetails: RepoPrDetail[] = [];
		if (!error) {
			totalPrs = prs.length;
			for (const pr of prs) {
				const authorAi = detectAiType(pr.user?.login ?? '');
				if (authorAi) {
					aiAuthoredPrs++;
					aiDetails.push({ number: pr.number, title: pr.title, url: pr.html_url, aiType: authorAi, role: 'author' });
				}
				for (const reviewer of (pr.requested_reviewers ?? [])) {
					const reviewerAi = detectAiType(reviewer.login ?? '');
					if (reviewerAi) {
						aiReviewRequestedPrs++;
						aiDetails.push({ number: pr.number, title: pr.title, url: pr.html_url, aiType: reviewerAi, role: 'reviewer-requested' });
					}
				}
			}
		}
		return { totalPrs, aiAuthoredPrs, aiReviewRequestedPrs, aiDetails };
	}

	/**
	 * Load Copilot cloud agent session stats for all discovered GitHub repos and send to the analysis panel.
	 * Only cloud-agent sessions are counted — CLI/remote sessions that share the same task API are excluded
	 * so they are not double-counted with the chat-session data already shown in "My Activity".
	 */
	private async loadAgentSessions(): Promise<void> {
		if (!this.analysisPanel) { return; }

		const since = new Date();
		since.setDate(since.getDate() - 30);

		if (this._githubSignedOutByUser) {
			const result: AgentSessionsResult = { repos: [], totalTasks: 0, totalSessions: 0, totalCredits: 0, authenticated: false, since: since.toISOString(), fetchedAt: new Date().toISOString() };
			this._lastAgentSessionsData = result;
			this.analysisPanel.webview.postMessage({ command: 'agentSessionsLoaded', data: result });
			return;
		}

		const session = await vscode.authentication.getSession('github', ['read:user'], { createIfNone: false });
		if (!session) {
			const result: AgentSessionsResult = { repos: [], totalTasks: 0, totalSessions: 0, totalCredits: 0, authenticated: false, since: since.toISOString(), fetchedAt: new Date().toISOString() };
			this._lastAgentSessionsData = result;
			this.analysisPanel.webview.postMessage({ command: 'agentSessionsLoaded', data: result });
			return;
		}

		if (!this.githubSession) {
			this.githubSession = session;
			await this.context.globalState.update('github.authenticated', true);
			await this.context.globalState.update('github.username', session.account.label);
		}

		const workspacePaths = this._buildWorkspacePaths();
		const repos = discoverGitHubRepos(workspacePaths);
		this.analysisPanel.webview.postMessage({ command: 'agentSessionsProgress', total: repos.length, done: 0 });

		const repoResults = [];
		for (let i = 0; i < repos.length; i++) {
			const { owner, repo } = repos[i];
			const summary = await fetchAgentSessionsForRepo(owner, repo, session.accessToken, since);
			repoResults.push(summary);
			this.analysisPanel.webview.postMessage({ command: 'agentSessionsProgress', total: repos.length, done: i + 1 });
		}

		const result: AgentSessionsResult = {
			repos: repoResults,
			totalTasks: repoResults.reduce((s, r) => s + r.totalTasks, 0),
			totalSessions: repoResults.reduce((s, r) => s + r.totalSessions, 0),
			totalCredits: repoResults.reduce((s, r) => s + r.totalCredits, 0),
			authenticated: true,
			since: since.toISOString(),
			fetchedAt: new Date().toISOString(),
		};
		this._lastAgentSessionsData = result;
		this.analysisPanel.webview.postMessage({ command: 'agentSessionsLoaded', data: result });
	}

	/** Collect workspace paths from the customization matrix and currently open VS Code workspace folders. */
	private _buildWorkspacePaths(): string[] {
		const workspacePaths: string[] = [];
		const matrix = this._lastCustomizationMatrix;
		if (matrix && matrix.workspaces.length > 0) {
			for (const ws of matrix.workspaces) {
				if (!ws.workspacePath.startsWith('<unresolved:')) {
					workspacePaths.push(ws.workspacePath);
				}
			}
		}
		for (const folder of vscode.workspace.workspaceFolders ?? []) {
			const p = folder.uri.fsPath;
			if (!workspacePaths.includes(p)) {
				workspacePaths.push(p);
			}
		}
		return workspacePaths;
	}

	/**
	 * Restore GitHub authentication session on extension startup.
	 * Always attempts a silent getSession so that a pre-existing VS Code GitHub
	 * session (e.g. from GitHub Copilot) is picked up automatically.
	 */
	private async restoreGitHubSession(): Promise<void> {
		try {
			// Respect explicit sign-out — don't auto-restore until user clicks Authenticate again
			this._githubSignedOutByUser = this.context.globalState.get<boolean>('github.signedOutByUser', false);
			if (this._githubSignedOutByUser) {
				this.log('GitHub session restore skipped — user signed out explicitly');
				return;
			}

			// Always try silently — never prompt. This picks up sessions from Copilot
			// or other extensions that already authenticated the user with GitHub.
			const session = await vscode.authentication.getSession('github', ['read:user'], { createIfNone: false });
			if (session) {
				this.githubSession = session;
				this.log(`✅ GitHub session found for ${session.account.label}`);
				await this.context.globalState.update('github.authenticated', true);
				await this.context.globalState.update('github.username', session.account.label);
				void this.loadAndLogCopilotPlanInfo();
			} else {
				const wasAuthenticated = this.context.globalState.get<boolean>('github.authenticated', false);
				if (wasAuthenticated) {
					// Session was present before but is gone now — clear stored state
					this.log('GitHub session not found - clearing authenticated state');
					await this.context.globalState.update('github.authenticated', false);
					await this.context.globalState.update('github.username', undefined);
				}
			}
		} catch (error) {
			this.warn('Failed to restore GitHub session: ' + String(error));
			await this.context.globalState.update('github.authenticated', false);
			await this.context.globalState.update('github.username', undefined);
		}
	}

	/**
	 * Fetch and log Copilot plan information and token endpoint metadata for the authenticated user.
	 * Both API calls run in parallel so all Copilot info is logged together as a single grouped block.
	 * For enterprise or business plans, also discovers the enterprise/org and checks the premium request budget.
	 * Best-effort: each call is independent — a failure in one does not suppress the other.
	 */
	private async loadAndLogCopilotPlanInfo(): Promise<void> {
		if (!this.githubSession) { return; }

		const [planResult, tokenResult] = await Promise.all([
			fetchCopilotPlanInfo(this.githubSession.accessToken).catch((err): ReturnType<typeof fetchCopilotPlanInfo> => Promise.resolve({ error: String(err) })),
			fetchCopilotTokenEndpointInfo(this.githubSession.accessToken).catch((err): ReturnType<typeof fetchCopilotTokenEndpointInfo> => Promise.resolve({ error: String(err) })),
		]);

		const isOrgPlan = this.logCopilotPlanResult(planResult);
		this.logCopilotTokenResult(tokenResult);

		if (isOrgPlan) {
			await this.loadAndLogEnterpriseInfo();
		}
	}

	private logCopilotPlanResult(planResult: { planInfo?: any; statusCode?: number; error?: string }): boolean {
		const { planInfo, statusCode: planStatus, error: planError } = planResult;
		if (planError || !planInfo) {
			this.warn(`Copilot plan info unavailable (HTTP ${planStatus ?? 'n/a'}): ${planError ?? 'no data'}`);
			return false;
		}
		const planId = planInfo.copilot_plan as string | undefined;
		const planIdLower = (planId ?? '').toLowerCase();
		// Business and Enterprise plans are both backed by a GitHub Enterprise — show enterprise/budget info for both
		const isOrgPlan = planIdLower.includes('enterprise') || planIdLower.includes('business');
		const plans = copilotPlansData.plans as Record<string, { name: string; monthlyPremiumRequests: number | null; monthlyPricePerUser: number; monthlyAiCreditsUsd: number }>;
		const knownPlan = planId ? plans[planId] : undefined;
		const planLabel = knownPlan ? `${knownPlan.name} (${planId})` : (planId ?? 'unknown');
		this.log(`Copilot plan: ${planLabel}`);
		this.logCopilotPlanDetails(planId, knownPlan, planInfo);
		return isOrgPlan;
	}

	private logCopilotTokenResult(tokenResult: { info?: any; statusCode?: number; error?: string }): void {
		const { info, statusCode: tokenStatus, error: tokenError } = tokenResult;
		if (tokenError || !info) {
			this.warn(`Copilot token endpoint info unavailable (HTTP ${tokenStatus ?? 'n/a'}): ${tokenError ?? 'no data'}`);
			return;
		}
		if (info.endpoints?.api) { this.log(`  Copilot API endpoint: ${info.endpoints.api}`); }
		if (info.expires_at !== undefined) { this.log(`  Copilot token valid until: ${new Date(info.expires_at * 1000).toISOString()}`); }
		if (info.sku) { this.log(`  Copilot SKU: ${info.sku}`); }
	}

	/**
	 * Discover which GitHub Enterprise(s) the user belongs to and fetch the premium request budget.
	 * Fires for both Copilot Business and Copilot Enterprise plans (both are backed by a GitHub Enterprise).
	 * Uses GraphQL viewer.enterprises and the enterprise billing/budgets endpoint.
	 * Best-effort: requires enterprise admin or billing manager for budget data.
	 */
	private async loadAndLogEnterpriseInfo(): Promise<void> {
		if (!this.githubSession) { return; }

		const { enterprises, error: entError } = await fetchUserEnterprises(this.githubSession.accessToken);
		if (entError || !enterprises?.length) {
			this.warn(`Enterprise discovery unavailable: ${entError ?? 'no enterprises found'}`);
			return;
		}

		const username = this.githubSession.account.label;
		this.log(`  Enterprise(s): ${enterprises.map((e) => `${e.name} (${e.slug})`).join(', ')}`);

		// Fetch budget for each enterprise in parallel
		const budgetResults = await Promise.all(
			enterprises.map((e) =>
				fetchEnterprisePremiumBudgets(e.slug, username, this.githubSession!.accessToken)
					.then((r) => ({ enterprise: e, ...r }))
					.catch((err) => ({ enterprise: e, error: String(err) }))
			)
		);

		for (const result of budgetResults) {
			this.logEnterpriseBudgetResult(result as { enterprise: { slug: string; name: string }; budgets?: any[]; statusCode?: number; error?: string });
		}
	}

	private logEnterpriseBudgetResult(result: { enterprise: { slug: string; name: string }; budgets?: any[]; statusCode?: number; error?: string }): void {
		const { enterprise, budgets, statusCode, error } = result;
		if (error) {
			// 403 means the user isn't an admin/billing manager — log quietly
			const isForbidden = statusCode === 403 || error.includes('403');
			if (isForbidden) {
				this.log(`  Budget (${enterprise.slug}): not accessible (requires enterprise admin or billing manager)`);
			} else {
				this.warn(`  Budget fetch failed for ${enterprise.slug} (HTTP ${statusCode ?? 'n/a'}): ${error}`);
			}
			return;
		}
		if (!budgets?.length) {
			this.log(`  Budget (${enterprise.slug}): no premium request budgets configured`);
			return;
		}
		for (const budget of budgets) {
			const amount = budget.budget_amount !== undefined ? `$${budget.budget_amount}` : 'n/a';
			const block = budget.prevent_further_usage ? ', blocks usage' : '';
			this.log(`  Budget (${enterprise.slug}): ${amount}/month${block} [${budget.budget_scope ?? 'unknown scope'}]`);
		}
	}

	private logCopilotPlanDetails(planId: string | undefined, knownPlan: { name: string; monthlyPremiumRequests: number | null; monthlyPricePerUser: number; monthlyAiCreditsUsd: number } | undefined, planInfo: any): void {
		this.logKnownPlanEntry(planId, knownPlan);
		this.logPlanInfoUserFields(planInfo);
		this.logQuotaSnapshots(planInfo.quota_snapshots);
		this.logLegacyPlanFields(planInfo);
	}

	private logKnownPlanEntry(planId: string | undefined, knownPlan: { name: string; monthlyPremiumRequests: number | null; monthlyPricePerUser: number; monthlyAiCreditsUsd: number } | undefined): void {
		if (knownPlan) {
			const credits = knownPlan.monthlyPremiumRequests !== null ? `${knownPlan.monthlyPremiumRequests.toLocaleString()}/month` : 'unlimited';
			this.log(`  Monthly premium requests: ${credits}`);
			const aiCredits = knownPlan.monthlyAiCreditsUsd > 0 ? `$${knownPlan.monthlyAiCreditsUsd}/month included` : 'none';
			this.log(`  Monthly AI credits: ${aiCredits}`);
			this._copilotPlanResolved = {
				planId: planId!,
				planName: knownPlan.name,
				monthlyAiCreditsUsd: knownPlan.monthlyAiCreditsUsd,
				monthlyPremiumRequests: knownPlan.monthlyPremiumRequests,
			};
		} else if (planId) {
			this._copilotPlanResolved = { planId, planName: planId, monthlyAiCreditsUsd: 0, monthlyPremiumRequests: null };
		}
	}

	private logFieldIfDefined(label: string, value: any): void {
		if (value !== null && value !== undefined) {
			this.log(`  ${label}: ${value}`);
		}
	}

	private pushPartIfDefined(parts: string[], text: string, value: any): void {
		if (value !== null && value !== undefined) {
			parts.push(text);
		}
	}

	private logPlanInfoUserFields(planInfo: any): void {
		// Log user info from copilot_internal/user response
		this.logFieldIfDefined('Login', planInfo.login);
		this.logFieldIfDefined('Chat enabled', planInfo.chat_enabled);
		this.logFieldIfDefined('CLI enabled', planInfo.cli_enabled);
		this.logFieldIfDefined('MCP enabled', planInfo.is_mcp_enabled);
		this.logFieldIfDefined('Editor preview features', planInfo.editor_preview_features_enabled);
		this.logFieldIfDefined('Copilotignore enabled', planInfo.copilotignore_enabled);
		this.logFieldIfDefined('Restricted telemetry', planInfo.restricted_telemetry);
		this.logFieldIfDefined('Access type SKU', planInfo.access_type_sku);
		this.logFieldIfDefined('Assigned date', planInfo.assigned_date);
		if (Array.isArray(planInfo.organization_list)) {
			this.log(`  Organizations: ${planInfo.organization_list.join(', ')}`);
		}
		this.logFieldIfDefined('Quota reset date (UTC)', planInfo.quota_reset_date_utc);
		this.logFieldIfDefined('Quota reset date', planInfo.quota_reset_date);
		this.logFieldIfDefined('Token-based billing', planInfo.token_based_billing);
		this.logFieldIfDefined('Analytics tracking ID', planInfo.analytics_tracking_id);
	}

	private captureQuotaEntitlement(key: string, qs: any): void {
		if (qs.entitlement === null || qs.entitlement === undefined) { return; }
		if (key === 'premium_interactions') {
			this._copilotQuotaEntitlements.premium_interactions = qs.entitlement / 100;
		} else if (key === 'completions') {
			this._copilotQuotaEntitlements.completions = qs.entitlement / 100;
		}
	}

	private pushEntitlementPart(parts: string[], entitlement: any): void {
		if (entitlement !== null && entitlement !== undefined) {
			parts.push(`entitlement=${entitlement} cents ($${(entitlement / 100).toFixed(2)})`);
		}
	}

	private logQuotaSnapshotEntry(key: string, snapshot: any): void {
		const qs = snapshot as any;
		if (typeof qs !== 'object' || qs === null) { return; }

		this.captureQuotaEntitlement(key, qs);

		const parts: string[] = [];
		this.pushPartIfDefined(parts, `id=${qs.quota_id}`, qs.quota_id);
		this.pushEntitlementPart(parts, qs.entitlement);
		this.pushPartIfDefined(parts, `unlimited=${qs.unlimited}`, qs.unlimited);
		this.pushPartIfDefined(parts, `remaining=${qs.quota_remaining}`, qs.quota_remaining);
		this.pushPartIfDefined(parts, `${qs.percent_remaining}%`, qs.percent_remaining);
		this.pushPartIfDefined(parts, `overage=${qs.overage_count}`, qs.overage_count);
		this.pushPartIfDefined(parts, `reset=${qs.quota_reset_at}`, qs.quota_reset_at);
		if (parts.length > 0) {
			this.log(`  Quota (${key}): ${parts.join(', ')}`);
		}
	}

	private logQuotaSnapshots(quotaSnapshots: any): void {
		if (!quotaSnapshots || typeof quotaSnapshots !== 'object') { return; }
		for (const [key, snapshot] of Object.entries(quotaSnapshots)) {
			this.logQuotaSnapshotEntry(key, snapshot);
		}
	}

	private logLegacyPlanFields(planInfo: any): void {
		// Log legacy fields if present (for backwards compatibility)
		this.logFieldIfDefined('IDE chat', planInfo.ide_chat);
		this.logFieldIfDefined('Agent mode', planInfo.copilot_ide_agent);
		this.logFieldIfDefined('Public code suggestions', planInfo.public_code_suggestions);
		this.logFieldIfDefined('Unlimited PR summaries', planInfo.unlimited_pr_summaries);
	}

	public async updateTokenStats(silent: boolean = false, skipIfBusy = false): Promise<DetailedStats | undefined> {
		// Coalesce concurrent callers onto the same in-flight run to prevent
		// multiple executions from racing to update the status bar simultaneously.
		// Background/timer callers pass skipIfBusy=true to drop the call rather than queue.
		if (this._updateTokenStatsInFlight) {
			if (skipIfBusy) {
				this.log('updateTokenStats already in progress, skipping background refresh');
				return undefined;
			}
			this.log('updateTokenStats already in progress, coalescing onto existing run');
			return this._updateTokenStatsInFlight;
		}

		this._updateTokenStatsInFlight = this._runUpdateTokenStats(silent);
		try {
			return await this._updateTokenStatsInFlight;
		} finally {
			this._updateTokenStatsInFlight = undefined;
		}
	}

	/**
	 * Discover all session files, stat them, and load (or cache-hit) their parsed data.
	 * Returns a `SessionFilePreload[]` that both calculateDetailedStats and
	 * calculateUsageAnalysisStats can consume, eliminating a second filesystem scan.
	 */
	private async _preloadSessionFiles(
		cutoffMs: number,
		progressCallback?: (completed: number, total: number) => void,
		editorSet?: Set<string>,
		missBudget?: { remaining: number }
	): Promise<{ sessionFiles: string[]; preloaded: SessionFilePreload[] }> {
		// --- Streaming pipeline: overlap discovery with parsing ---
		// Discovery pushes file batches into a shared queue as each adapter completes.
		// Worker pool drains the queue immediately, starting parsing while discovery continues.
		const queue: string[] = [];
		let readIndex = 0;
		let discoveryDone = false;
		let totalDiscovered = 0;
		const preloaded: SessionFilePreload[] = [];
		let processed = 0;
		const CONCURRENCY = 20;

		// Event-driven wakeups: workers that find the queue empty park on the gate
		// instead of polling on a timer, avoiding pointless wake-ups while discovery runs.
		const gate = createWakeupGate();

		const analyzeStartMs = Date.now();

		// Discovery fills the queue via onBatch callback
		const discoveryPromise = (async () => {
			try {
				return await this.sessionDiscovery.getCopilotSessionFilesStreaming((batch) => {
					if (editorSet) {
						for (const file of batch) {
							const editor = this.detectEditorSource(file);
							if (editor && editor !== 'Unknown') { editorSet.add(editor); }
						}
					}
					queue.push(...batch);
					totalDiscovered += batch.length;
					gate.signal();
				});
			} finally {
				discoveryDone = true;
				gate.signal();
			}
		})();

		// Worker: consumes from queue, parses each file
		const worker = async () => {
			while (true) {
				if (readIndex >= queue.length) {
					if (discoveryDone) { break; }
					// Park until discovery pushes more work or signals completion. The gate
					// registers the waiter synchronously in this same tick, so no batch can
					// slip in unobserved between the emptiness check and parking.
					await gate.wait();
					continue;
				}
				const sessionFile = queue[readIndex++];
				try { await this.processPreloadQueueFile(sessionFile, cutoffMs, preloaded, missBudget); } catch { /* skip files that fail to stat/parse */ }
				processed++;
				if (progressCallback) { progressCallback(processed, totalDiscovered); }
			}
		};

		// Run discovery and workers concurrently
		const [sessionFiles] = await Promise.all([
			discoveryPromise,
			...Array.from({ length: CONCURRENCY }, () => worker()),
		]);

		if (sessionFiles.length === 0) {
			this.warn('⚠️ No session files found - Have you used GitHub Copilot Chat yet?');
			return { sessionFiles, preloaded: [] };
		}

		this.log(`📊 Analyzed ${sessionFiles.length} session file(s)`);
		this.log(`📦 Preloaded ${preloaded.length}/${sessionFiles.length} session file(s) within date range in ${((Date.now() - analyzeStartMs) / 1000).toFixed(1)}s`);

		// Defer expired-cache cleanup to avoid blocking discovery/workers startup
		void Promise.resolve().then(() => this.cacheManager.clearExpiredCache());

		return { sessionFiles, preloaded };
	}

	private async processPreloadQueueFile(sessionFile: string, cutoffMs: number, preloaded: SessionFilePreload[], missBudget?: { remaining: number }): Promise<void> {
		const fileStats = await this.statSessionFile(sessionFile);
		const mtime = fileStats.mtime.getTime();
		const fileSize = fileStats.size;
		if (mtime < cutoffMs) { return; }
		const cachedData = this.getCachedSessionData(sessionFile);
		const wasCached = cachedData !== undefined && cachedData.mtime === mtime && cachedData.size === fileSize;
		// Follower mode (missBudget defined): avoid the N-windows-parse-everything
		// stampede. Serve cache hits freely, but only parse a bounded number of
		// cache-miss files; skip the rest until the leader publishes a snapshot.
		if (!wasCached && missBudget) {
			if (missBudget.remaining <= 0) { return; }
			missBudget.remaining--;
		}
		const sessionData = await this.getSessionFileDataCached(sessionFile, mtime, fileSize);
		// Avoid the expensive full getSessionFileDetails parse (which calls _reconstructJsonlStateAsync
		// for delta-based .jsonl files) during the hot preloading loop. Use the detail cache when
		// already populated (e.g. warm run), or fall back to a lightweight stub built from sessionData.
		// The details panel fetches full details on demand; repository is not needed for stats.
		const details = sessionData.interactions > 0
			? ((await this.getSessionFileDetailsFromCache(sessionFile, fileStats)) ?? this.buildMinimalPreloadDetails(sessionFile, fileStats, sessionData))
			: undefined;
		preloaded.push({ sessionFile, mtime, fileSize, sessionData, wasCached, details } as SessionFilePreload);
		if (!wasCached) {
			// Yield after CPU-intensive cache-miss work to keep VS Code responsive
			await new Promise(r => setImmediate(r));
		}
	}

	/**
	 * Build a lightweight SessionFileDetails stub from already-computed sessionData.
	 * Used during preloading to avoid re-parsing files just to extract repository info.
	 * The full parse (including repository) is deferred to the details panel on demand.
	 */
	private buildMinimalPreloadDetails(sessionFile: string, stat: import('fs').Stats, sessionData: SessionFileCache): SessionFileDetails {
		const details: SessionFileDetails = {
			file: sessionFile,
			size: stat.size,
			modified: stat.mtime.toISOString(),
			interactions: sessionData.interactions,
			tokens: sessionData.actualTokens || sessionData.tokens || 0,
			contextReferences: sessionData.usageAnalysis?.contextReferences ?? this.createEmptyContextRefs(),
			firstInteraction: sessionData.firstInteraction ?? null,
			lastInteraction: sessionData.lastInteraction ?? null,
			editorSource: this.detectEditorSource(sessionFile),
			title: sessionData.title,
			repository: sessionData.repository,
		};
		this.enrichDetailsWithEditorInfo(sessionFile, details);
		return details;
	}

	private async _runUpdateTokenStats(silent: boolean): Promise<DetailedStats | undefined> {
		// Ensure the initial cache load from disk has completed before parsing.
		if (this._cacheLoadPromise) {
			try { await this._cacheLoadPromise; } catch { /* already logged in loadCacheFromStorage */ }
		}

		// Warm the in-memory cache from any newer snapshot another window published,
		// so most files become cache hits and parsing is skipped.
		try { await this.cacheManager.loadSharedSnapshotIfChanged(); }
		catch (err) { this.warn(`Failed to warm cache from shared snapshot: ${err}`); }

		// Elect a refresh leader. The single window in a lone-window setup always
		// wins, so its behaviour is unchanged. With multiple windows, only the leader
		// performs the heavy parse and publishes the snapshot; followers parse at most
		// a small budget of newly-changed files and reload the leader's snapshot.
		let isLeader = false;
		try { isLeader = await this.cacheManager.acquireRefreshLock(); }
		catch (err) { this.warn(`Failed to acquire refresh lock, proceeding as leader: ${err}`); isLeader = true; }
		this.startRefreshHeartbeat(isLeader);

		try {
			return await this._runRefreshCore(silent, isLeader);
		} catch (error) {
			this.error('Error updating token stats:', error);
			this.setStatusBarText('$(error) Token Error');
			this.statusBarItem.tooltip = 'Error calculating token usage';
			return undefined;
		} finally {
			this.stopRefreshHeartbeat();
			if (isLeader) {
				try { await this.cacheManager.releaseRefreshLock(); }
				catch (err) { this.warn(`Failed to release refresh lock: ${err}`); }
			}
		}
	}

	/** Core discover → parse → compute → render → persist pass for one refresh. */
	private async _runRefreshCore(silent: boolean, isLeader: boolean): Promise<DetailedStats | undefined> {
		this.log(isLeader ? 'Updating token stats (leader)...' : 'Updating token stats (follower)...');

		const { last30DaysStartMs, lastMonthStartMs } = computeUtcDateRanges(new Date());
		const fileLoadCutoffMs = Math.min(last30DaysStartMs, lastMonthStartMs);

		this._loadingEditors = [];
		this.sendLoadingPanelMessage({ command: 'loadingStep', step: 'discovering' });
		if (!silent && !this._detailsPanelIsLoading) { this.statusBarItem.tooltip = this.buildLoadingTooltipMarkdown('discovering'); }

		// Streaming pipeline: discovery and parsing run concurrently.
		// Workers start processing files as each adapter batch arrives.
		const discoveredEditorSet = new Set<string>();
		const progressCallback = this.buildProgressCallback(silent, () =>
			[...discoveredEditorSet].map(name => ({ icon: this.getEditorIconForLoader(name), name }))
		);
		const missBudget = isLeader ? undefined : { remaining: CopilotTokenTracker.FOLLOWER_MISS_BUDGET };
		const { sessionFiles, preloaded } = await this._preloadSessionFiles(fileLoadCutoffMs, progressCallback, discoveredEditorSet, missBudget);

		this.sendLoadingPanelMessage({ command: 'loadingStep', step: 'computing' });
		if (!silent && !this._detailsPanelIsLoading) { this.statusBarItem.tooltip = this.buildLoadingTooltipMarkdown('computing'); }

		const { stats: detailedStats, dailyStats } = await this.calculateDetailedStats(undefined, preloaded);
		this.lastDailyStats = dailyStats;
		this.mergeIntoFullDailyStats(dailyStats);

		this.updateStatusBarAndTooltip(detailedStats);

		this.updateDetailsPanelIfOpen(detailedStats, silent);
		this.updateChartPanelIfOpen(silent);
		await this.updateAnalysisPanelIfOpen(silent, preloaded);
		await this.computeAndUploadFluencyScore(silent, preloaded);
		this.updateEnvironmentalPanelIfOpen(detailedStats, silent);
		await this.evaluateAndSurfaceInsights();

		this.log(`Updated stats - Today: ${detailedStats.today.tokens}, Last 30 Days: ${detailedStats.last30Days.tokens}`);
		this.lastDetailedStats = detailedStats;

		this.persistRefreshResult(isLeader);

		if (!this.lastFullDailyStats && !this.chartPanel) {
			void this.calculateDailyStats(365, sessionFiles);
		}

		return detailedStats;
	}

	/**
	 * Persist results after a refresh. Only the leader publishes the shared
	 * snapshot (so a follower's partial cache can never regress it); a follower
	 * instead schedules a bounded resync to pick up the leader's snapshot.
	 */
	private persistRefreshResult(isLeader: boolean): void {
		if (isLeader) {
			void (async () => {
				try { await this.saveCacheToStorage(); }
				catch (err) { this.warn(`Failed to save cache: ${err}`); }
			})();
		} else {
			this.scheduleFollowerResync();
		}
	}

	/**
	 * Start (leader) or clear (follower) the periodic heartbeat that renews the
	 * refresh leader lock so a legitimately long parse is not treated as stale by
	 * another window.
	 */
	private startRefreshHeartbeat(isLeader: boolean): void {
		this.stopRefreshHeartbeat();
		if (!isLeader) { return; }
		this._refreshHeartbeat = setInterval(() => {
			void this.cacheManager.renewRefreshLock();
		}, 30 * 1000);
	}

	private stopRefreshHeartbeat(): void {
		if (this._refreshHeartbeat) {
			clearInterval(this._refreshHeartbeat);
			this._refreshHeartbeat = undefined;
		}
	}

	/**
	 * Bounded retry chain for a follower window that started before a snapshot
	 * existed. Periodically reloads the shared snapshot; once the leader publishes
	 * fresher data, triggers a single recompute and stops. Capped to avoid looping.
	 */
	private scheduleFollowerResync(retriesLeft: number = CopilotTokenTracker.FOLLOWER_RESYNC_MAX_RETRIES): void {
		if (this._followerResyncTimer) { return; }
		if (retriesLeft <= 0) { return; }
		this._followerResyncTimer = setTimeout(() => {
			this._followerResyncTimer = undefined;
			void (async () => {
				let merged = 0;
				try { merged = await this.cacheManager.loadSharedSnapshotIfChanged(); }
				catch { /* best-effort */ }
				if (merged > 0) {
					// Leader published fresher data — recompute once with the warm cache.
					void this.updateTokenStats(true, true);
					return;
				}
				this.scheduleFollowerResync(retriesLeft - 1);
			})();
		}, CopilotTokenTracker.FOLLOWER_RESYNC_DELAY_MS);
		if (typeof this._followerResyncTimer.unref === 'function') { this._followerResyncTimer.unref(); }
	}

	private buildProgressCallback(silent: boolean, getEditors?: () => { icon: string; name: string }[]): ((completed: number, total: number) => void) | undefined {
		if (silent) { return undefined; }
		let parsingStepNotified = false;
		let lastProgressSentMs = 0;
		let lastPercentage = -1;
		return (completed: number, total: number) => {
			const percentage = Math.round((completed / total) * 100);
			// Only touch the status bar text when the rounded percentage actually changes,
			// to avoid needless status-bar relayout on every callback.
			if (percentage !== lastPercentage) {
				lastPercentage = percentage;
				this.setStatusBarText(`$(loading~spin) Analyzing Logs: ${percentage}%`);
			}
			if (!parsingStepNotified) {
				parsingStepNotified = true;
				const editors = getEditors?.() ?? [];
				this._loadingEditors = editors;
				const msg: Record<string, unknown> = { command: 'loadingStep', step: 'parsing', total, editors };
				this.sendLoadingPanelMessage(msg);
				// Set the hover tooltip exactly once when parsing starts, using the
				// indeterminate (self-animating SMIL) variant. The tooltip is never
				// reassigned during parsing, so the hover popup no longer flickers on
				// every progress redraw — the previous per-500ms reassignment forced
				// VS Code to rebuild the hover and reload the data-URI <img>. The live
				// climbing percentage stays visible in the status bar text instead.
				// Skip entirely when the loading panel is already open — it shows progress itself.
				if (!this._detailsPanelIsLoading) {
					this.statusBarItem.tooltip = this.buildLoadingTooltipMarkdown('parsing');
				}
			}
			// The hover popup intentionally stays put during parsing; only the live
			// webview panel (if open) receives incremental progress updates.
			const now = Date.now();
			if (now - lastProgressSentMs >= 500 || completed === total) {
				lastProgressSentMs = now;
				const editors = getEditors?.() ?? [];
				this.sendLoadingPanelMessage({ command: 'loadingProgress', completed, total, percentage, editors });
			}
		};
	}

	/** Maps known editor display names to emoji icons for the loader animation. */
	private getEditorIconForLoader(editorName: string): string {
		const map: Record<string, string> = {
			'VS Code': '💙', 'VS Code Insiders': '💚', 'VS Code Exploration': '🧪',
			'VS Code Server': '☁️', 'VS Code Server (Insiders)': '☁️', 'VSCodium': '🔷',
			'Cursor': '⚡', 'Copilot CLI': '🤖', 'OpenCode': '🟢', 'Visual Studio': '🪟',
			'Claude Code': '🟠', 'Claude Desktop Cowork': '🟠', 'Mistral Vibe': '🔥',
			'Gemini CLI': '💎', 'Antigravity': '🚀', 'JetBrains': '🧩',
			'Crush': '🦾', 'Continue': '▶️', 'Pi': 'π',
		};
		return map[editorName] ?? '📝';
	}

	private mergeIntoFullDailyStats(dailyStats: DailyTokenStats[]): void {
		if (!this.lastFullDailyStats) { return; }
		const fullMap = new Map(this.lastFullDailyStats.map(d => [d.date, d]));
		for (const day of dailyStats) { fullMap.set(day.date, day); }
		this.lastFullDailyStats = Array.from(fullMap.values()).sort((a, b) => a.date.localeCompare(b.date));
	}

	private updateStatusBarAndTooltip(detailedStats: DetailedStats): void {
		this._lastDetailedStats = detailedStats;
		if (detailedStats.today.sessions === 0 && detailedStats.last30Days.sessions === 0) {
			this.setStatusBarText('$(symbol-numeric) No session data yet');
		} else {
			this.setStatusBarText(this.buildStatusBarText(detailedStats));
		}
		this.statusBarItem.tooltip = this.buildTooltipMarkdown(detailedStats);
		this.updateStatusBarBackgroundColor(detailedStats);
	}

	private buildLoadingTooltipMarkdown(step: 'discovering' | 'parsing' | 'computing', percentage?: number): vscode.MarkdownString {
		const svg = this.generateLoadingSvg(step, this._loadingEditors, percentage, this._prevLoadingPercentage);
		this._prevLoadingPercentage = percentage ?? this._prevLoadingPercentage;
		const tooltip = new vscode.MarkdownString(`![Loading](data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)})`);
		tooltip.isTrusted = true;
		tooltip.supportThemeIcons = false;
		return tooltip;
	}

	// eslint-disable-next-line max-lines-per-function, complexity, sonarjs/cognitive-complexity
	private generateLoadingSvg(
		step: 'discovering' | 'parsing' | 'computing',
		editors: { icon: string; name: string }[],
		percentage?: number,
		prevPercentage?: number
	): string {
		const W = 440, P = 12;
		const CARD  = '#24273a', FG  = '#cdd6f4';
		const MUT  = '#9399b2', ACC   = '#89b4fa', OK  = '#a6e3a1';
		const BRD  = '#313244';
		const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
		const esc  = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		const doneUntil  = step === 'discovering' ? 0 : step === 'parsing' ? 1 : 2;
		const activeStep = step === 'discovering' ? 0 : step === 'parsing' ? 1 : 2;
		const STEPS = [
			'Discovering session files',
			'Parsing session logs', 'Computing statistics', 'Ready!',
		];
		const pct     = step === 'computing' ? 96 : (percentage ?? 0);
		const pctTxt  = step === 'computing' ? '96%' : (percentage !== undefined && percentage > 0 ? `${percentage}%` : '–');
		const subtitle =
			step === 'discovering' ? 'Discovering session files...' :
			step === 'parsing'     ? 'Parsing session files...'     :
			                         'Computing statistics...';
		const pills   = editors.slice(0, 6);

		// Layout — always reserve pills row so height never changes between phases
		const BY    = P + 13;
		const TY    = BY + 20;
		const SBY   = TY + 16;
		const PRY   = SBY + 16;
		const PRH   = 5;
		const PIL_Y = PRY + PRH + 8;
		const SBX_Y = PIL_Y + 34;  // 28px pills height + 6px gap, always reserved
		const SBX_H = P + STEPS.length * 22 + 8;
		const H     = SBX_Y + SBX_H + P;
		const PW    = W - P * 2;

		const o: string[] = [];
		o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
		o.push(`<defs>
  <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${ACC}"/>
    <stop offset="100%" stop-color="${OK}"/>
  </linearGradient>
  <clipPath id="pclip"><rect x="${P}" y="${PRY}" width="${PW}" height="${PRH}" rx="2.5"/></clipPath>
</defs>`);

		// Badge
		o.push(`<text x="${P}" y="${BY}" font-family="${FONT}" font-size="10" font-weight="700" letter-spacing="1.5" fill="${ACC}">🤖 ANALYZING YOUR AI ACTIVITY</text>`);

		// Title + large pct display
		o.push(`<text x="${P}" y="${TY}" font-family="${FONT}" font-size="17" font-weight="700" fill="${FG}">Building Activity Index</text>`);
		o.push(`<text x="${W - P}" y="${TY}" text-anchor="end" font-family="${FONT}" font-size="26" font-weight="800" fill="${FG}">${esc(pctTxt)}</text>`);

		// Subtitle
		o.push(`<text x="${P}" y="${SBY}" font-family="${FONT}" font-size="11" fill="${MUT}">${esc(subtitle)}</text>`);

		// Progress track
		o.push(`<rect x="${P}" y="${PRY}" width="${PW}" height="${PRH}" rx="2.5" fill="${BRD}"/>`);

		// Progress fill — shimmer (indeterminate) during discovering/early parsing, animated fill when progress is known
		if (step !== 'computing' && pct === 0) {
			const sw = Math.round(PW * 0.25);
			o.push(`<rect y="${PRY}" width="${sw}" height="${PRH}" rx="2.5" fill="url(#pg)" clip-path="url(#pclip)">
  <animate attributeName="x" from="${P - Math.round(PW * 0.35)}" to="${P + Math.round(PW * 1.1)}" dur="1.8s" repeatCount="indefinite" calcMode="ease-in-out"/>
</rect>`);
		} else {
			const fw = Math.max(8, Math.round((pct / 100) * PW));
			const prevFw = Math.max(8, Math.round(((prevPercentage ?? 0) / 100) * PW));
			if (prevFw < fw) {
				// Animate from previous width to current width so the bar grows smoothly
				o.push(`<rect x="${P}" y="${PRY}" height="${PRH}" rx="2.5" fill="url(#pg)" width="${prevFw}">
  <animate attributeName="width" from="${prevFw}" to="${fw}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" keyTimes="0;1"/>
</rect>`);
			} else {
				o.push(`<rect x="${P}" y="${PRY}" width="${fw}" height="${PRH}" rx="2.5" fill="url(#pg)"/>`);
			}
		}

		// Editor pills
		if (pills.length > 0) {
			let px = P;
			for (const ed of pills) {
				const rawLbl = `${ed.icon} ${ed.name}`;
				const pw2    = Math.min(Math.max([...rawLbl].length * 7 + 16, 64), 130);
				if (px + pw2 > W - P) { break; }
				o.push(`<rect x="${px}" y="${PIL_Y}" width="${pw2}" height="22" rx="11" fill="${CARD}" stroke="${BRD}"/>`);
				o.push(`<text x="${px + pw2 / 2}" y="${PIL_Y + 15}" text-anchor="middle" font-family="${FONT}" font-size="10.5" fill="${FG}">${esc(rawLbl)}</text>`);
				px += Math.round(pw2) + 6;
			}
		}

		// Steps box
		o.push(`<rect x="${P}" y="${SBX_Y}" width="${PW}" height="${SBX_H}" rx="8" fill="${CARD}" stroke="${BRD}"/>`);

		const ICX = P + P + 4;
		const LBX = ICX + 18;
		let sy = SBX_Y + P + 8;
		for (let i = 0; i < STEPS.length; i++) {
			const done   = i < doneUntil;
			const active = i === activeStep;
			const col    = done ? OK : active ? ACC : MUT;
			const wt     = active ? '600' : '400';
			const lbl    = STEPS[i];

			if (done) {
				o.push(`<text x="${ICX}" y="${sy}" text-anchor="middle" font-family="monospace" font-size="13" fill="${OK}">✓</text>`);
			} else if (active) {
				// Spinning ↻ via SMIL animateTransform around the glyph centre
				const cy = sy - 4;
				o.push(`<text x="${ICX}" y="${sy}" text-anchor="middle" font-family="monospace" font-size="13" fill="${ACC}">↻<animateTransform attributeName="transform" type="rotate" values="0 ${ICX} ${cy};360 ${ICX} ${cy}" dur="0.75s" repeatCount="indefinite" additive="sum"/></text>`);
			} else {
				o.push(`<text x="${ICX}" y="${sy}" text-anchor="middle" font-size="13" fill="${MUT}">○</text>`);
			}
			o.push(`<text x="${LBX}" y="${sy}" font-family="${FONT}" font-size="12" font-weight="${wt}" fill="${col}">${esc(lbl)}</text>`);
			sy += 22;
		}

		o.push('</svg>');
		return o.join('');
	}

	private buildTooltipMarkdown(detailedStats: DetailedStats): vscode.MarkdownString {
		const tooltip = new vscode.MarkdownString();
		tooltip.isTrusted = false;
		tooltip.appendMarkdown('#### AI Engineering Fluency');
		tooltip.appendMarkdown('\n---\n');
		tooltip.appendMarkdown(`📅 Today  \n`);
		tooltip.appendMarkdown(`|                 |  |\n|-----------------------|-------|\n`);
		tooltip.appendMarkdown(`| Tokens :                | ${detailedStats.today.tokens.toLocaleString()} |\n`);
		tooltip.appendMarkdown(`| Estimated cost (UBB) :       | $ ${(detailedStats.today.estimatedCostCopilot ?? 0).toFixed(2)} |\n`);
		tooltip.appendMarkdown(`| CO₂ estimated :              | ${detailedStats.today.co2.toFixed(2)} grams |\n`);
		tooltip.appendMarkdown(`| Water estimated :           | ${detailedStats.today.waterUsage.toFixed(3)} liters |\n`);
		tooltip.appendMarkdown(`| Sessions :             | ${detailedStats.today.sessions} |\n`);
		tooltip.appendMarkdown(`| Average interactions/session :     | ${detailedStats.today.avgInteractionsPerSession} |\n`);
		tooltip.appendMarkdown(`| Average tokens/session :            | ${detailedStats.today.avgTokensPerSession.toLocaleString()} |\n`);
		tooltip.appendMarkdown('\n---\n');
		const secondaryPeriod = tooltipSecondaryPeriod(this.getStatusBarShowTokensSetting(), this.getStatusBarShowCostSetting());
		const secondaryStats = secondaryPeriod === 'currentMonth' ? detailedStats.month : detailedStats.last30Days;
		const secondaryLabel = secondaryPeriod === 'currentMonth' ? '📅 Current Month' : '📊 Last 30 Days';
		tooltip.appendMarkdown(`${secondaryLabel}  \n`);
		tooltip.appendMarkdown(`|                 |  |\n|-----------------------|-------|\n`);
		tooltip.appendMarkdown(`| Tokens :                | ${secondaryStats.tokens.toLocaleString()} |\n`);
		tooltip.appendMarkdown(`| Estimated cost (UBB) :       | $ ${(secondaryStats.estimatedCostCopilot ?? 0).toFixed(2)} |\n`);
		tooltip.appendMarkdown(`| CO₂ estimated :              | ${secondaryStats.co2.toFixed(2)} grams |\n`);
		tooltip.appendMarkdown(`| Water estimated :           | ${secondaryStats.waterUsage.toFixed(3)} liters |\n`);
		tooltip.appendMarkdown(`| Sessions :             | ${secondaryStats.sessions} |\n`);
		tooltip.appendMarkdown(`| Average interactions/session :      | ${secondaryStats.avgInteractionsPerSession} |\n`);
		tooltip.appendMarkdown(`| Average tokens/session :            | ${secondaryStats.avgTokensPerSession.toLocaleString()} |\n`);
		tooltip.appendMarkdown('\n---\n');
		const budget = this.getEffectiveMonthlyBudget();
		if (budget > 0) {
			const monthCost = detailedStats.month.estimatedCostCopilot ?? detailedStats.month.estimatedCost ?? 0;
			const pct = Math.round((monthCost / budget) * 100);
			tooltip.appendMarkdown(`\n---\n💰 Monthly budget: $${budget.toFixed(2)} — this month: $${monthCost.toFixed(2)} (${pct}%)`);
		}
		return tooltip;
	}

	private updateDetailsPanelIfOpen(detailedStats: DetailedStats, silent: boolean): void {
		if (!this.detailsPanel) { return; }
		if (silent) {
			void this.detailsPanel.webview.postMessage({
				command: 'updateStats',
				data: {
					today: detailedStats.today, month: detailedStats.month,
					lastMonth: detailedStats.lastMonth, last30Days: detailedStats.last30Days,
					lastUpdated: detailedStats.lastUpdated.toISOString(),
					backendConfigured: this.isBackendConfigured(), compactNumbers: this.getCompactNumbersSetting(),
				},
			});
		} else {
			this.detailsPanel.webview.html = this.getDetailsHtml(this.detailsPanel.webview, detailedStats);
		}
	}

	private updateChartPanelIfOpen(silent: boolean): void {
		if (!this.chartPanel || (!this.lastFullDailyStats && !this.lastDailyStats)) { return; }
		const chartStats = this.lastFullDailyStats ?? this.lastDailyStats!;
		if (silent) {
			void this.chartPanel.webview.postMessage({ command: 'updateChartData', data: { ...this.buildChartData(chartStats), compactNumbers: this.getCompactNumbersSetting(), monthlyBudget: this.getEffectiveMonthlyBudget() } });
		} else {
			this.chartPanel.webview.html = this.getChartHtml(this.chartPanel.webview, chartStats);
		}
	}

	private async updateAnalysisPanelIfOpen(silent: boolean, preloaded?: SessionFilePreload[]): Promise<void> {
		if (!this.analysisPanel) { return; }
		const analysisStats = await this.calculateUsageAnalysisStats(false, preloaded);
		if (silent) {
			void this.analysisPanel.webview.postMessage({
				command: 'updateStats',
				data: {
					today: analysisStats.today, last30Days: analysisStats.last30Days, month: analysisStats.month, lastMonth: analysisStats.lastMonth,
					locale: analysisStats.locale, customizationMatrix: analysisStats.customizationMatrix || null,
					missedPotential: analysisStats.missedPotential || [],
					lastUpdated: analysisStats.lastUpdated.toISOString(), backendConfigured: this.isBackendConfigured(),
					currentWorkspacePaths: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [],
					insights: this.buildCurrentInsights(analysisStats),
				},
			});
		} else {
			this.analysisPanel.webview.html = this.getUsageAnalysisHtml(this.analysisPanel.webview, analysisStats);
		}
	}

	private async computeAndUploadFluencyScore(silent: boolean, preloaded?: SessionFilePreload[]): Promise<void> {
		const freshMaturityData = (!silent || this.maturityPanel)
			? await this.calculateMaturityScores(false, preloaded)
			: undefined;
		if (this.maturityPanel && !silent && freshMaturityData) {
			this.maturityPanel.webview.html = this.getMaturityHtml(this.maturityPanel.webview, freshMaturityData);
		}
		if (!this.backend) { return; }
		const settings = this.backend.getSettings();
		if (!settings.sharingServerEnabled || !settings.sharingServerEndpointUrl) { return; }
		const maturityData = await (freshMaturityData ?? this.calculateMaturityScores(false));
		const scorePayload: Record<string, unknown> = {
			overallStage: maturityData.overallStage, overallLabel: maturityData.overallLabel,
			categories: maturityData.categories.map((c: any) => ({
				category: c.category, icon: c.icon, stage: c.stage, tips: c.tips,
			})),
			computedAt: new Date().toISOString(),
		};
		void (async () => {
			try { await this.backend!.uploadFluencyScoreToSharingServer(settings, scorePayload); }
			catch (err: unknown) { this.warn(`Failed to upload fluency score to sharing server: ${err}`); }
		})();
	}

	private updateEnvironmentalPanelIfOpen(detailedStats: DetailedStats, silent: boolean): void {
		if (!this.environmentalPanel) { return; }
		if (silent) {
			void this.environmentalPanel.webview.postMessage({
				command: 'updateStats',
				data: {
					today: detailedStats.today, month: detailedStats.month,
					lastMonth: detailedStats.lastMonth, last30Days: detailedStats.last30Days,
					lastUpdated: detailedStats.lastUpdated.toISOString(),
					backendConfigured: this.isBackendConfigured(), compactNumbers: this.getCompactNumbersSetting(),
				},
			});
		} else {
			this.environmentalPanel.webview.html = this.getEnvironmentalHtml(this.environmentalPanel.webview, detailedStats);
		}
	}

	private async evaluateAndSurfaceInsights(): Promise<void> {
		const stats = this.lastUsageAnalysisStats;
		if (!stats) { return; }

		const insightsEnabled = vscode.workspace.getConfiguration('aiEngineeringFluency').get<boolean>('insights.enabled', true);
		if (!insightsEnabled) { return; }

		const cadenceDays = vscode.workspace.getConfiguration('aiEngineeringFluency').get<number>('insights.cadenceDays', 2);
		const now = new Date().toISOString();

		const ctx = {
			today: stats.today,
			last30Days: stats.last30Days,
			missedPotential: stats.missedPotential ?? [],
			customizationMatrix: stats.customizationMatrix,
		};

		const evaluated = _evaluateInsights(ctx, this._insightStateBag, cadenceDays, this._lastInsightNudgeAt);
		_mergeInsightStates(evaluated, this._insightStateBag, now);

		const newCount = _countNewInsights(this._insightStateBag, now);
		const topNew = evaluated.find(i => i.status === 'new');
		this.refreshStatusBarInsightBadge(newCount, topNew?.title);

		await this.context.globalState.update('insights.state', this._insightStateBag);

		// Push updated insights to the analysis panel if it is open
		if (this.analysisPanel) {
			void this.analysisPanel.webview.postMessage({
				command: 'updateInsights',
				insights: evaluated,
			});
		}

		// Surface a toast for the highest-weight 'new' allowToast insight (rate-limited)
		const toastsEnabled = vscode.workspace.getConfiguration('aiEngineeringFluency').get<boolean>('insights.toastsEnabled', true);
		if (!toastsEnabled) { return; }
		if (!_isToastAllowed(cadenceDays, this._lastInsightNudgeAt, now)) { return; }

		const toastCandidate = evaluated.find(i => i.allowToast && i.status === 'new');
		if (!toastCandidate) { return; }

		this._lastInsightNudgeAt = now;
		await this.context.globalState.update('insights.lastNudgeAt', now);

		const view = 'Open Insights tab';
		const dismiss = 'Dismiss';
		const choice = await vscode.window.showInformationMessage(
			`💡 ${toastCandidate.title}`,
			view,
			dismiss,
		);
		if (choice === view) {
			await this.showUsageAnalysisOnInsightsTab();
		} else if (choice === dismiss) {
			this._insightStateBag[toastCandidate.id] = {
				...(this._insightStateBag[toastCandidate.id] ?? { firstSurfacedAt: now }),
				status: 'dismissed',
				lastSurfacedAt: now,
			};
			await this.context.globalState.update('insights.state', this._insightStateBag);
			this.refreshStatusBarInsightBadge(_countNewInsights(this._insightStateBag, now));
		}
	}

	/** Builds the current evaluated insight list from cached state + latest stats. */
	private buildCurrentInsights(stats: UsageAnalysisStats): EvaluatedInsight[] {
		const cadenceDays = vscode.workspace.getConfiguration('aiEngineeringFluency').get<number>('insights.cadenceDays', 2);
		const ctx = {
			today: stats.today,
			last30Days: stats.last30Days,
			missedPotential: stats.missedPotential ?? [],
			customizationMatrix: stats.customizationMatrix,
			todaySessions: stats.todaySessions,
		};
		return _evaluateInsights(ctx, this._insightStateBag, cadenceDays, this._lastInsightNudgeAt);
	}

	private async calculateTokenUsage(): Promise<Pick<TokenUsageStats, 'todayTokens' | 'monthTokens'>> {		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

		let todayTokens = 0;
		let monthTokens = 0;

		try {
			// Get session files from both workspace and global storage
			const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();

			const fileResults = await this.runWithConcurrency(sessionFiles, async (sessionFile) => {
				const fileStats = await this.statSessionFile(sessionFile);
				const mtime = fileStats.mtime.getTime();
				const fileSize = fileStats.size;
				if (mtime < monthStart.getTime()) { return null; }
				const tokens = (await this.getSessionFileDataCached(sessionFile, mtime, fileSize)).tokens;
				return { mtime, tokens };
			});

			for (const r of fileResults) {
				if (!r) { continue; }
				monthTokens += r.tokens;
				if (r.mtime >= todayStart.getTime()) { todayTokens += r.tokens; }
			}
		} catch (error) {
			this.error('Error calculating token usage:', error);
		}

		return {
			todayTokens,
			monthTokens
		};
	}

	private async calculateDetailedStats(progressCallback?: (completed: number, total: number) => void, preloaded?: SessionFilePreload[]): Promise<{ stats: DetailedStats; dailyStats: DailyTokenStats[] }> {
		const now = new Date();
		const { todayUtcKey, monthUtcStartKey, lastMonthUtcStartKey, lastMonthUtcEndKey, last30DaysUtcStartKey, last30DaysStartMs, lastMonthStartMs } = computeUtcDateRanges(now);
		const fileLoadCutoffMs = Math.min(last30DaysStartMs, lastMonthStartMs);

		let todayStats = makePeriodAccumulator();
		let monthStats = makePeriodAccumulator();
		let lastMonthStats = makePeriodAccumulator();
		let last30DaysStats = makePeriodAccumulator();
		let dailyStatsMap = new Map<string, DailyTokenStats>();

		try {
			let cacheHits = 0; let cacheMisses = 0; let skippedFiles = 0;
			const analysisStartMs = Date.now();

			type SessionDataEntry = { sessionFile: string; sessionData: SessionFileCache; details: SessionFileDetails; mtime: number; wasCached: boolean };
			let sessionDataResults: (SessionDataEntry | null | undefined)[];

			if (preloaded) {
				sessionDataResults = preloaded.map(p => {
					if (p.sessionData.interactions === 0 || !p.details) { return null; }
					return { sessionFile: p.sessionFile, sessionData: p.sessionData, details: p.details, mtime: p.mtime, wasCached: p.wasCached };
				});
			} else {
				sessionDataResults = await this.loadSessionDataStandalone(fileLoadCutoffMs, progressCallback);
			}

			const aggregateInputs: SessionAggregateInput[] = [];
			for (const r of sessionDataResults) {
				if (!r) { skippedFiles++; continue; }
				if (r.wasCached) { cacheHits++; } else { cacheMisses++; }
				try {
					aggregateInputs.push({ editorType: this.getEditorTypeFromPath(r.sessionFile), sessionData: r.sessionData, mtime: r.mtime, lastInteraction: r.sessionData.lastInteraction || r.details.lastInteraction });
				} catch (fileError) { this.warn(`Error processing session file ${r.sessionFile}: ${fileError}`); }
			}

			const aggregated = aggregatePeriodStats(aggregateInputs, { todayUtcKey, monthUtcStartKey, lastMonthUtcStartKey, lastMonthUtcEndKey, last30DaysUtcStartKey, last30DaysStartMs, lastMonthStartMs });
			todayStats = aggregated.todayStats; monthStats = aggregated.monthStats;
			lastMonthStats = aggregated.lastMonthStats; last30DaysStats = aggregated.last30DaysStats;
			dailyStatsMap = aggregated.dailyStatsMap; skippedFiles += aggregated.skippedCount;

			const analysisElapsedSec = ((Date.now() - analysisStartMs) / 1000).toFixed(1);
			this.log(`✅ Analysis complete in ${analysisElapsedSec}s: Today ${todayStats.sessions} sessions, Month ${monthStats.sessions} sessions, Last 30 Days ${last30DaysStats.sessions} sessions, Previous Month ${lastMonthStats.sessions} sessions`);
			if (skippedFiles > 0) { this.log(`⏭️ Skipped ${skippedFiles} session file(s) (empty or no activity in recent months)`); }
			const totalCacheAccesses = cacheHits + cacheMisses;
			this.log(`💾 Cache performance: ${cacheHits} hits, ${cacheMisses} misses (${totalCacheAccesses > 0 ? ((cacheHits / totalCacheAccesses) * 100).toFixed(1) : 0}% hit rate)`);
		} catch (error) {
			this.error('Error calculating detailed stats:', error);
		}

		const dailyStats = this.fillMissingDailyStats(dailyStatsMap, now);
		const result = this.buildDetailedStatsResult(todayStats, monthStats, lastMonthStats, last30DaysStats, now);
		return { stats: result, dailyStats };
	}

	private async loadSessionDataStandalone(fileLoadCutoffMs: number, progressCallback?: (completed: number, total: number) => void): Promise<({ sessionFile: string; sessionData: SessionFileCache; details: SessionFileDetails; mtime: number; wasCached: boolean } | null | undefined)[]> {
		void this.cacheManager.clearExpiredCache();
		const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
		this.log(`📊 Analyzing ${sessionFiles.length} session file(s)...`);
		if (sessionFiles.length === 0) { this.warn('⚠️ No session files found - Have you used GitHub Copilot Chat yet?'); }
		return this.runWithConcurrency(sessionFiles, async (sessionFile, i) => {
			if (progressCallback) { progressCallback(i + 1, sessionFiles.length); }
			const fileStats = await this.statSessionFile(sessionFile);
			const mtime = fileStats.mtime.getTime();
			const fileSize = fileStats.size;
			if (mtime < fileLoadCutoffMs) { return null; }
			const cachedData = this.getCachedSessionData(sessionFile);
			const wasCached = cachedData !== undefined && cachedData.mtime === mtime && cachedData.size === fileSize;
			const sessionData = await this.getSessionFileDataCached(sessionFile, mtime, fileSize);
			if (sessionData.interactions === 0) { return null; }
			const details = await this.getSessionFileDetails(sessionFile);
			return { sessionFile, sessionData, details, mtime, wasCached };
		});
	}

	private fillMissingDailyStats(dailyStatsMap: Map<string, DailyTokenStats>, now: Date): DailyTokenStats[] {
		const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
		const todayKey = toLocalDayKey(now);
		const existingDates = new Set(dailyStatsMap.keys());
		const fillDate = new Date(thirtyDaysAgo);
		while (toLocalDayKey(fillDate) <= todayKey) {
			const dateKey = toLocalDayKey(fillDate);
			if (!existingDates.has(dateKey)) {
				dailyStatsMap.set(dateKey, { date: dateKey, tokens: 0, sessions: 0, interactions: 0, modelUsage: {}, editorUsage: {}, repositoryUsage: {} });
			}
			fillDate.setDate(fillDate.getDate() + 1);
		}
		return Array.from(dailyStatsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
	}

	private buildDetailedStatsResult(
		todayStats: ReturnType<typeof makePeriodAccumulator>,
		monthStats: ReturnType<typeof makePeriodAccumulator>,
		lastMonthStats: ReturnType<typeof makePeriodAccumulator>,
		last30DaysStats: ReturnType<typeof makePeriodAccumulator>,
		now: Date
	): DetailedStats {
		const todayCo2 = (todayStats.tokens / 1000) * this.co2Per1kTokens;
		const monthCo2 = (monthStats.tokens / 1000) * this.co2Per1kTokens;
		const lastMonthCo2 = (lastMonthStats.tokens / 1000) * this.co2Per1kTokens;
		const last30DaysCo2 = (last30DaysStats.tokens / 1000) * this.co2Per1kTokens;
		const todayWater = (todayStats.tokens / 1000) * this.waterUsagePer1kTokens;
		const monthWater = (monthStats.tokens / 1000) * this.waterUsagePer1kTokens;
		const lastMonthWater = (lastMonthStats.tokens / 1000) * this.waterUsagePer1kTokens;
		const last30DaysWater = (last30DaysStats.tokens / 1000) * this.waterUsagePer1kTokens;
		return {
			today: {
				tokens: todayStats.tokens, thinkingTokens: todayStats.thinkingTokens,
				estimatedTokens: todayStats.estimatedTokens, actualTokens: todayStats.actualTokens,
				sessions: todayStats.sessions,
				avgInteractionsPerSession: todayStats.sessions > 0 ? Math.round(todayStats.interactions / todayStats.sessions) : 0,
				avgTokensPerSession: todayStats.sessions > 0 ? Math.round(todayStats.tokens / todayStats.sessions) : 0,
				modelUsage: todayStats.modelUsage, editorUsage: todayStats.editorUsage,
				co2: todayCo2, treesEquivalent: todayCo2 / this.co2AbsorptionPerTreePerYear,
				waterUsage: todayWater, estimatedCost: this.calculateEstimatedCost(todayStats.modelUsage),
				estimatedCostCopilot: todayStats.exactCopilotCostDollars + this.calculateEstimatedCost(todayStats.modelUsageNoExact, 'copilot'),
				...(todayStats.cachedTokens > 0 ? { cachedTokens: todayStats.cachedTokens } : {})
			},
			month: {
				tokens: monthStats.tokens, thinkingTokens: monthStats.thinkingTokens,
				estimatedTokens: monthStats.estimatedTokens, actualTokens: monthStats.actualTokens,
				sessions: monthStats.sessions,
				avgInteractionsPerSession: monthStats.sessions > 0 ? Math.round(monthStats.interactions / monthStats.sessions) : 0,
				avgTokensPerSession: monthStats.sessions > 0 ? Math.round(monthStats.tokens / monthStats.sessions) : 0,
				modelUsage: monthStats.modelUsage, editorUsage: monthStats.editorUsage,
				co2: monthCo2, treesEquivalent: monthCo2 / this.co2AbsorptionPerTreePerYear,
				waterUsage: monthWater, estimatedCost: this.calculateEstimatedCost(monthStats.modelUsage),
				estimatedCostCopilot: monthStats.exactCopilotCostDollars + this.calculateEstimatedCost(monthStats.modelUsageNoExact, 'copilot'),
				...(monthStats.cachedTokens > 0 ? { cachedTokens: monthStats.cachedTokens } : {})
			},
			lastMonth: {
				tokens: lastMonthStats.tokens, thinkingTokens: lastMonthStats.thinkingTokens,
				estimatedTokens: lastMonthStats.estimatedTokens, actualTokens: lastMonthStats.actualTokens,
				sessions: lastMonthStats.sessions,
				avgInteractionsPerSession: lastMonthStats.sessions > 0 ? Math.round(lastMonthStats.interactions / lastMonthStats.sessions) : 0,
				avgTokensPerSession: lastMonthStats.sessions > 0 ? Math.round(lastMonthStats.tokens / lastMonthStats.sessions) : 0,
				modelUsage: lastMonthStats.modelUsage, editorUsage: lastMonthStats.editorUsage,
				co2: lastMonthCo2, treesEquivalent: lastMonthCo2 / this.co2AbsorptionPerTreePerYear,
				waterUsage: lastMonthWater, estimatedCost: this.calculateEstimatedCost(lastMonthStats.modelUsage),
				estimatedCostCopilot: lastMonthStats.exactCopilotCostDollars + this.calculateEstimatedCost(lastMonthStats.modelUsageNoExact, 'copilot'),
				...(lastMonthStats.cachedTokens > 0 ? { cachedTokens: lastMonthStats.cachedTokens } : {})
			},
			last30Days: {
				tokens: last30DaysStats.tokens, thinkingTokens: last30DaysStats.thinkingTokens,
				estimatedTokens: last30DaysStats.estimatedTokens, actualTokens: last30DaysStats.actualTokens,
				sessions: last30DaysStats.sessions,
				avgInteractionsPerSession: last30DaysStats.sessions > 0 ? Math.round(last30DaysStats.interactions / last30DaysStats.sessions) : 0,
				avgTokensPerSession: last30DaysStats.sessions > 0 ? Math.round(last30DaysStats.tokens / last30DaysStats.sessions) : 0,
				modelUsage: last30DaysStats.modelUsage, editorUsage: last30DaysStats.editorUsage,
				co2: last30DaysCo2, treesEquivalent: last30DaysCo2 / this.co2AbsorptionPerTreePerYear,
				waterUsage: last30DaysWater, estimatedCost: this.calculateEstimatedCost(last30DaysStats.modelUsage),
				estimatedCostCopilot: last30DaysStats.exactCopilotCostDollars + this.calculateEstimatedCost(last30DaysStats.modelUsageNoExact, 'copilot'),
				...(last30DaysStats.cachedTokens > 0 ? { cachedTokens: last30DaysStats.cachedTokens } : {})
			},
			lastUpdated: now
		};
	}

	private formatDateKey(date: Date): string {
		return toLocalDayKey(date);
	}

	/**
	 * Formats a token count using K/M suffixes for compact display (e.g. 1,500 → 1.5K, 1,200,000 → 1.2M).
	 * Falls back to full locale number when the compact numbers setting is disabled.
	 */
	private formatCompact(value: number): string {
		if (!this.getCompactNumbersSetting()) {
			return value.toLocaleString();
		}
		return new Intl.NumberFormat(undefined, {
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(value);
	}

	private getCompactNumbersSetting(): boolean {
		return vscode.workspace.getConfiguration('aiEngineeringFluency').get<boolean>('display.compactNumbers', true);
	}

	private getUse24HourTimeSetting(): boolean {
		return vscode.workspace.getConfiguration('aiEngineeringFluency').get<boolean>('display.use24HourTime', true);
	}

	private getStatusBarShowTokensSetting(): StatusBarDisplaySetting {
		return vscode.workspace.getConfiguration('aiEngineeringFluency.display.statusBar').get<StatusBarDisplaySetting>('showTokens', 'both');
	}

	private getStatusBarShowCostSetting(): StatusBarDisplaySetting {
		return vscode.workspace.getConfiguration('aiEngineeringFluency.display.statusBar').get<StatusBarDisplaySetting>('showCost', 'none');
	}

	private getMonthlyBudgetSetting(): number {
		return vscode.workspace.getConfiguration('aiEngineeringFluency.display.statusBar').get<number>('monthlyBudget', 0);
	}

	/** Returns the effective monthly budget: the explicitly configured value if set, otherwise falls back
	 *  to the monthly AI credits included with the user's Copilot plan, or the premium_interactions
	 *  quota entitlement from the API if available. */
	private getEffectiveMonthlyBudget(): number {
		const configured = this.getMonthlyBudgetSetting();
		if (configured > 0) { return configured; }
		// Fall back to quota entitlement (premium_interactions) if available, then to plan credits
		if (this._copilotQuotaEntitlements.premium_interactions) {
			return this._copilotQuotaEntitlements.premium_interactions;
		}
		return this._copilotPlanResolved?.monthlyAiCreditsUsd ?? 0;
	}

	/** Updates the status bar background color based on current-month spend vs. the configured budget.
	 *  Uses VS Code's built-in theme colors: warning (yellow) at ≥75%, error (red/orange) at ≥90%.
	 *  Clears the background when no budget is configured or spend is below 75%. */
	private updateStatusBarBackgroundColor(stats: DetailedStats): void {
		const budget = this.getEffectiveMonthlyBudget();
		if (budget <= 0) {
			this.statusBarItem.backgroundColor = undefined;
			return;
		}
		const monthCost = stats.month.estimatedCostCopilot ?? stats.month.estimatedCost ?? 0;
		const ratio = monthCost / budget;
		if (ratio >= 0.90) {
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
		} else if (ratio >= 0.75) {
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
		} else {
			this.statusBarItem.backgroundColor = undefined;
		}
	}

	private buildTokenParts(show: StatusBarDisplaySetting, stats: DetailedStats): string[] {
		const parts: string[] = [];
		if (show === 'today' || show === 'both' || show === 'todayAndCurrentMonth') {
			parts.push(this.formatCompact(stats.today.tokens));
		}
		if (show === 'last30days' || show === 'both') {
			parts.push(this.formatCompact(stats.last30Days.tokens));
		}
		if (show === 'currentMonth' || show === 'todayAndCurrentMonth') {
			parts.push(this.formatCompact(stats.month.tokens));
		}
		return parts;
	}

	private buildCostParts(show: StatusBarDisplaySetting, stats: DetailedStats): string[] {
		const fmt = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
		const parts: string[] = [];
		if (show === 'today' || show === 'both' || show === 'todayAndCurrentMonth') {
			parts.push(fmt(stats.today.estimatedCostCopilot ?? 0));
		}
		if (show === 'last30days' || show === 'both') {
			parts.push(fmt(stats.last30Days.estimatedCostCopilot ?? 0));
		}
		if (show === 'currentMonth' || show === 'todayAndCurrentMonth') {
			parts.push(fmt(stats.month.estimatedCostCopilot ?? 0));
		}
		return parts;
	}

	private buildStatusBarText(stats: DetailedStats): string {
		const showTokens = this.getStatusBarShowTokensSetting();
		const showCost = this.getStatusBarShowCostSetting();
		const parts: string[] = [];

		if (showTokens !== 'none') {
			parts.push(`$(symbol-numeric) ${this.buildTokenParts(showTokens, stats).join(' | ')}`);
		}
		if (showCost !== 'none') {
			parts.push(`$(credit-card) ${this.buildCostParts(showCost, stats).join(' | ')}`);
		}

		return parts.length > 0 ? parts.join('  ') : `$(symbol-numeric) AI Fluency`;
	}

	private refreshOpenPanelsForSettingChange(): void {
		const stats = this.lastDetailedStats;
		if (!stats) { return; }
		// Refresh status bar text and background color (respects new display settings)
		this.setStatusBarText(this.buildStatusBarText(stats));
		this.updateStatusBarBackgroundColor(stats);
		this.statusBarItem.tooltip = this.buildTooltipMarkdown(stats);
		if (this.detailsPanel) {
			this.detailsPanel.webview.html = this.getDetailsHtml(this.detailsPanel.webview, stats);
		}
		if (this.environmentalPanel) {
			this.environmentalPanel.webview.html = this.getEnvironmentalHtml(this.environmentalPanel.webview, stats);
		}
		if (this.chartPanel && (this.lastFullDailyStats || this.lastDailyStats)) {
			this.chartPanel.webview.html = this.getChartHtml(this.chartPanel.webview, this.lastFullDailyStats ?? this.lastDailyStats!);
		}
	}

	/** Compute daily token stats for up to `daysBack` days, using the same token preference
	 *  (actualTokens > estimatedTokens) and UTC date assignment as calculateDetailedStats
	 *  so all chart period views are consistent. Stores the result in
	 *  `lastFullDailyStats` and returns it. Zero-fill is handled per-period in buildChartData. */
	private async calculateDailyStats(daysBack = 365, knownSessionFiles?: string[]): Promise<DailyTokenStats[]> {
		const now = new Date();
		const cutoffStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack);
		const cutoffStartKey = toLocalDayKey(cutoffStart);
		const cutoffMs = cutoffStart.getTime();
		const dailyStatsMap = new Map<string, DailyTokenStats>();

		try {
			const sessionFiles = knownSessionFiles ?? await this.sessionDiscovery.getCopilotSessionFiles();
			this.log(`📈 Preparing chart data (${daysBack}d) from ${sessionFiles.length} session file(s)...`);

			const dailyResults = await this.runWithConcurrency(sessionFiles, async (sessionFile) => {
				const fileStats = await this.statSessionFile(sessionFile);
				const mtime = fileStats.mtime.getTime();
				const fileSize = fileStats.size;
				if (mtime < cutoffMs) { return null; }
				const sessionData = await this.getSessionFileDataCached(sessionFile, mtime, fileSize);
				return { sessionFile, sessionData, mtime };
			});

			for (const r of dailyResults) {
				if (!r) { continue; }
				const { sessionFile, sessionData, mtime } = r;
				try {
					const editorType = this.getEditorTypeFromPath(sessionFile);
					const repository = sessionData.repository || 'Unknown';
					if (sessionData.dailyRollups && Object.keys(sessionData.dailyRollups).length > 0) {
						this.accumulateDailyRollups(dailyStatsMap, sessionData, editorType, repository, cutoffStartKey);
					} else {
						this.accumulateSessionFallback(dailyStatsMap, sessionData, mtime, editorType, repository, cutoffStartKey);
					}
				} catch (fileError) {
					this.warn(`Error processing session file ${sessionFile} for daily stats: ${fileError}`);
				}
			}
		} catch (error) {
			this.error('Error calculating daily stats:', error);
		}

		const result = Array.from(dailyStatsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
		this.lastFullDailyStats = result;
		return result;
	}

	private accumulateDailyRollups(dailyStatsMap: Map<string, DailyTokenStats>, sessionData: SessionFileCache, editorType: string, repository: string, cutoffUtcStartKey: string): void {
		const dailyRollups = sessionData.dailyRollups!;
		let lastDayKey: string | undefined;
		for (const [dayKey, dayRollup] of Object.entries(dailyRollups)) {
			if (dayKey < cutoffUtcStartKey) { continue; }
			const dayTokens = (dayRollup.actualTokens > 0 ? dayRollup.actualTokens : dayRollup.tokens);
			const dailyEntry = this.getOrCreateDailyEntry(dailyStatsMap, dayKey);
			this.addUsageToDailyEntry(dailyEntry, dayTokens, dayRollup.interactions, editorType, repository, dayRollup.modelUsage);
			if (!lastDayKey || dayKey > lastDayKey) { lastDayKey = dayKey; }
		}
		if (lastDayKey && (sessionData.linesAdded ?? 0) + (sessionData.linesRemoved ?? 0) > 0) {
			const locEntry = dailyStatsMap.get(lastDayKey)!;
			this.addLocToDailyEntry(locEntry, sessionData.linesAdded ?? 0, sessionData.linesRemoved ?? 0, editorType, repository, sessionData.languageUsage);
		}
	}

	private accumulateSessionFallback(dailyStatsMap: Map<string, DailyTokenStats>, sessionData: SessionFileCache, mtime: number, editorType: string, repository: string, cutoffUtcStartKey: string): void {
		const actualTokens = sessionData.actualTokens || 0;
		const tokens = (actualTokens > 0 ? actualTokens : sessionData.tokens);
		const lastActivity = sessionData.lastInteraction ? new Date(sessionData.lastInteraction) : new Date(mtime);
		const dateKey = toLocalDayKey(lastActivity);
		if (dateKey < cutoffUtcStartKey) { return; }
		const dailyEntry = this.getOrCreateDailyEntry(dailyStatsMap, dateKey);
		this.addUsageToDailyEntry(dailyEntry, tokens, sessionData.interactions, editorType, repository, sessionData.modelUsage);
		if ((sessionData.linesAdded ?? 0) + (sessionData.linesRemoved ?? 0) > 0) {
			this.addLocToDailyEntry(dailyEntry, sessionData.linesAdded ?? 0, sessionData.linesRemoved ?? 0, editorType, repository, sessionData.languageUsage);
		}
	}

	private getOrCreateDailyEntry(dailyStatsMap: Map<string, DailyTokenStats>, dateKey: string): DailyTokenStats {
		if (!dailyStatsMap.has(dateKey)) {
			dailyStatsMap.set(dateKey, { date: dateKey, tokens: 0, sessions: 0, interactions: 0, modelUsage: {}, editorUsage: {}, repositoryUsage: {} });
		}
		return dailyStatsMap.get(dateKey)!;
	}

	private addUsageToDailyEntry(entry: DailyTokenStats, tokens: number, interactions: number, editorType: string, repository: string, modelUsage: any): void {
		entry.tokens += tokens;
		entry.sessions += 1;
		entry.interactions += interactions;
		if (!entry.editorUsage[editorType]) { entry.editorUsage[editorType] = { tokens: 0, sessions: 0 }; }
		entry.editorUsage[editorType].tokens += tokens;
		entry.editorUsage[editorType].sessions += 1;
		if (!entry.repositoryUsage[repository]) { entry.repositoryUsage[repository] = { tokens: 0, sessions: 0 }; }
		entry.repositoryUsage[repository].tokens += tokens;
		entry.repositoryUsage[repository].sessions += 1;
		addModelUsage(entry.modelUsage, modelUsage);
	}

	private addLocToDailyEntry(entry: DailyTokenStats, linesAdded: number, linesRemoved: number, editorType: string, repository: string, languageUsage?: any): void {
		entry.linesAdded = (entry.linesAdded ?? 0) + linesAdded;
		entry.linesRemoved = (entry.linesRemoved ?? 0) + linesRemoved;
		if (!entry.editorUsage[editorType]) { entry.editorUsage[editorType] = { tokens: 0, sessions: 0 }; }
		entry.editorUsage[editorType].linesAdded = (entry.editorUsage[editorType].linesAdded ?? 0) + linesAdded;
		entry.editorUsage[editorType].linesRemoved = (entry.editorUsage[editorType].linesRemoved ?? 0) + linesRemoved;
		if (!entry.repositoryUsage[repository]) { entry.repositoryUsage[repository] = { tokens: 0, sessions: 0 }; }
		entry.repositoryUsage[repository].linesAdded = (entry.repositoryUsage[repository].linesAdded ?? 0) + linesAdded;
		entry.repositoryUsage[repository].linesRemoved = (entry.repositoryUsage[repository].linesRemoved ?? 0) + linesRemoved;
		if (languageUsage) {
			if (!entry.languageUsage) { entry.languageUsage = {}; }
			addLanguageUsage(entry.languageUsage, languageUsage);
		}
	}

	private detectMissedPotential(
		workspaceSessionCounts: Map<string, number>,
		workspaceInteractionCounts: Map<string, number>
	): MissedPotentialWorkspace[] {
		const missedPotential: MissedPotentialWorkspace[] = [];

		for (const [workspacePath, sessionCount] of workspaceSessionCounts) {
			const files = this._customizationFilesCache.get(workspacePath) || [];
			
			// Check for Copilot files (category "copilot" or undefined for backward compatibility)
			const hasCopilotFiles = files.some(f => !f.category || f.category === 'copilot');
			
			// Check for non-Copilot files (must be explicitly "non-copilot")
			const nonCopilotFiles = files.filter(f => f.category === 'non-copilot');
			
			// Missed potential = has non-Copilot files AND NO Copilot files
			if (nonCopilotFiles.length > 0 && !hasCopilotFiles) {
				missedPotential.push({
					workspacePath,
					workspaceName: path.basename(workspacePath),
					sessionCount,
					interactionCount: workspaceInteractionCounts.get(workspacePath) || 0,
					nonCopilotFiles
				});
			}
		}

		// Sort by interaction count (descending) so most active "missed" repos are first
		missedPotential.sort((a, b) => b.interactionCount - a.interactionCount);

		return missedPotential;
	}

	/**
	 * Calculate usage analysis statistics for today and last 30 days
	 * @param useCache If true, return cached stats if available. If false, force recalculation.
	 */
	private async calculateUsageAnalysisStats(useCache = true, preloaded?: SessionFilePreload[]): Promise<UsageAnalysisStats> {
		if (useCache && this.lastUsageAnalysisStats) {
			this.log('🔍 [Usage Analysis] Using cached stats');
			return this.lastUsageAnalysisStats;
		}
		const now = new Date();
		const { todayUtcKey, last30DaysUtcStartKey, monthUtcStartKey, lastMonthUtcStartKey, lastMonthUtcEndKey, last30DaysStartMs, lastMonthStartMs } = computeUtcDateRanges(now);
		const cutoffMs = Math.min(last30DaysStartMs, lastMonthStartMs);
		this.log('🔍 [Usage Analysis] Starting calculation...');
		this._cacheHits = 0;
		this._cacheMisses = 0;
		const todayStats = this.createEmptyUsagePeriod();
		const last30DaysStats = this.createEmptyUsagePeriod();
		const monthStats = this.createEmptyUsagePeriod();
		const lastMonthStats = this.createEmptyUsagePeriod();
		const todaySessionsList: TodaySessionSummary[] = [];
		const workspaceSessionCounts = new Map<string, number>();
		const workspaceInteractionCounts = new Map<string, number>();
		const unresolvedWorkspaceIds = new Set<string>();
		const unresolvedWorkspaceInteractionCounts = new Map<string, number>();
		this._workspaceIdToFolderCache.clear();
		this._customizationFilesCache.clear();
		try {
			const { results: usageResults, totalFiles } = await this.loadUsageSessionFiles(preloaded, cutoffMs);
			const periods = { todayStats, last30DaysStats, monthStats, lastMonthStats, todayUtcKey, last30DaysUtcStartKey, monthUtcStartKey, lastMonthUtcStartKey, lastMonthUtcEndKey };
			const wsMaps = { workspaceSessionCounts, workspaceInteractionCounts, unresolvedWorkspaceIds, unresolvedWorkspaceInteractionCounts };
			this.aggregateUsageFileResults(usageResults, periods, wsMaps, todaySessionsList, totalFiles);
			this.deduplicateWorkspacePaths(workspaceSessionCounts, workspaceInteractionCounts);
			this.buildUsageCustomizationMatrix(workspaceSessionCounts, workspaceInteractionCounts, unresolvedWorkspaceIds, unresolvedWorkspaceInteractionCounts);
			await this.enrichMultiAgentParentCount(usageResults, last30DaysStats, last30DaysUtcStartKey);
		} catch (error) {
			this.error('Error calculating usage analysis stats:', error);
		}
		this.log(`🔍 [Usage Analysis] Cache stats: ${this._cacheHits} hits, ${this._cacheMisses} misses`);
		const stats: UsageAnalysisStats = {
			today: todayStats,
			last30Days: last30DaysStats,
			month: monthStats,
			lastMonth: lastMonthStats,
			locale: Intl.DateTimeFormat().resolvedOptions().locale,
			lastUpdated: now,
			customizationMatrix: this._lastCustomizationMatrix,
			missedPotential: this._lastMissedPotential || [],
			todaySessions: todaySessionsList.sort((a, b) => b.interactions - a.interactions)
		};
		this.lastUsageAnalysisStats = stats;
		return stats;
	}

	private createEmptyUsagePeriod(): UsageAnalysisPeriod {
		return {
			sessions: 0,
			toolCalls: { total: 0, byTool: {} },
			modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
			contextReferences: {
				file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
				workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0,
				clipboard: 0, changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0,
				byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {}
			},
			mcpTools: { total: 0, byServer: {}, byTool: {} },
			modelSwitching: {
				modelsPerSession: [], totalSessions: 0, averageModelsPerSession: 0,
				maxModelsPerSession: 0, minModelsPerSession: 0, switchingFrequency: 0,
				standardModels: [], premiumModels: [], unknownModels: [], mixedTierSessions: 0,
				standardRequests: 0, premiumRequests: 0, unknownRequests: 0, totalRequests: 0,
				lowCostModels: [], mediumCostModels: [], highCostModels: [], mixedCostSessions: 0,
				lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0
			},
			repositories: [],
			repositoriesWithCustomization: [],
			editScope: { singleFileEdits: 0, multiFileEdits: 0, totalEditedFiles: 0, avgFilesPerSession: 0 },
			applyUsage: { totalApplies: 0, totalCodeBlocks: 0, applyRate: 0 },
			sessionDuration: { totalDurationMs: 0, avgDurationMs: 0, avgFirstProgressMs: 0, avgTotalElapsedMs: 0, avgWaitTimeMs: 0 },
			conversationPatterns: { multiTurnSessions: 0, singleTurnSessions: 0, avgTurnsPerSession: 0, maxTurnsInSession: 0 },
			agentTypes: { editsAgent: 0, defaultAgent: 0, workspaceAgent: 0, other: 0 }
		};
	}

	/**
	 * Query data.db for multi-agent parent count and set it on the period.
	 * A session counts as a "multi-agent parent" when it has 2+ direct child workspaces.
	 * Errors are swallowed — this is optional enrichment only.
	 */
	private async enrichMultiAgentParentCount(
		usageResults: ({ sessionFile: string; sessionData: SessionFileCache; mtime: number } | null | undefined)[],
		last30DaysStats: UsageAnalysisPeriod,
		last30DaysUtcStartKey: string,
	): Promise<void> {
		const uuids: string[] = [];
		for (const r of usageResults) {
			if (!r) { continue; }
			const lastActivityKey = this.computeLastActivityKey(r.sessionData, r.mtime);
			if (lastActivityKey < last30DaysUtcStartKey) { continue; }
			const uuid = this.extractCopilotCliUuid(r.sessionFile);
			if (uuid) { uuids.push(uuid); }
		}
		if (uuids.length === 0) { return; }
		try {
			const hierarchy = await this.copilotAppData.getSessionHierarchy(uuids);
			let count = 0;
			for (const uuid of uuids) {
				const node = hierarchy.get(uuid);
				if (node && node.totalChildCount >= 2) { count++; }
			}
			if (count > 0) { last30DaysStats.multiAgentParentSessions = count; }
		} catch { /* optional enrichment — suppress */ }
	}

	private buildDefaultSessionAnalysis(): SessionUsageAnalysis {
		return {
			toolCalls: { total: 0, byTool: {} },
			modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
			contextReferences: {
				file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
				workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0,
				clipboard: 0, changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0,
				byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {}
			},
			mcpTools: { total: 0, byServer: {}, byTool: {} },
			modelSwitching: {
				uniqueModels: [], modelCount: 0, switchCount: 0,
				tiers: { standard: [], premium: [], unknown: [] }, hasMixedTiers: false,
				standardRequests: 0, premiumRequests: 0, unknownRequests: 0, totalRequests: 0,
				costBuckets: { low: [], medium: [], high: [], unknown: [] }, hasMixedCosts: false,
				lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0
			}
		};
	}

	private async loadUsageSessionFiles(
		preloaded: SessionFilePreload[] | undefined,
		cutoffMs: number
	): Promise<{ results: ({ sessionFile: string; sessionData: SessionFileCache; mtime: number } | null | undefined)[]; totalFiles: number }> {
		if (preloaded) {
			this.log(`🔍 [Usage Analysis] Processing ${preloaded.length} preloaded session files`);
			const results = preloaded.map(p => ({ sessionFile: p.sessionFile, sessionData: p.sessionData, mtime: p.mtime }));
			return { results, totalFiles: preloaded.length };
		}
		const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
		this.log(`🔍 [Usage Analysis] Processing ${sessionFiles.length} session files`);
		const results = await this.runWithConcurrency(sessionFiles, async (sessionFile) => {
			const fileStats = await this.statSessionFile(sessionFile);
			const mtime = fileStats.mtime.getTime();
			const fileSize = fileStats.size;
			if (mtime < cutoffMs) { return null; }
			const sessionData = await this.getSessionFileDataCached(sessionFile, mtime, fileSize);
			return { sessionFile, sessionData, mtime };
		});
		return { results, totalFiles: sessionFiles.length };
	}

	private computeLastActivityKey(sessionData: SessionFileCache, mtime: number): string {
		if (sessionData.dailyRollups && Object.keys(sessionData.dailyRollups).length > 0) {
			return Object.keys(sessionData.dailyRollups).sort().pop()!;
		}
		const lastActivity = sessionData.lastInteraction ? new Date(sessionData.lastInteraction) : new Date(mtime);
		return toLocalDayKey(lastActivity);
	}

	private _resolveSessionModelTokens(sessionData: SessionFileCache, modelUsage: ModelUsage): { inputTok: number; outputTok: number; cachedTok: number } {
		let inputTok = 0, outputTok = 0, cachedTok = 0;
		for (const usage of Object.values(modelUsage)) {
			inputTok += usage.inputTokens || 0;
			outputTok += usage.outputTokens || 0;
			cachedTok += usage.cachedReadTokens || 0;
		}
		if (sessionData.debugLogInputTokens !== undefined) { inputTok = sessionData.debugLogInputTokens; }
		if (sessionData.debugLogOutputTokens !== undefined) { outputTok = sessionData.debugLogOutputTokens; }
		if (sessionData.cacheReadTokens !== undefined) { cachedTok = sessionData.cacheReadTokens; }
		return { inputTok, outputTok, cachedTok };
	}

	private collectTodaySessionInfo(
		sessionData: SessionFileCache, sessionFile: string,
		analysis: SessionUsageAnalysis, interactions: number, mtime: number
	): TodaySessionSummary {
		const modelUsage = sessionData.modelUsage || {};
		const { inputTok, outputTok, cachedTok } = this._resolveSessionModelTokens(sessionData, modelUsage);
		return {
			title: sessionData.title || null, filePath: sessionFile, interactions,
			toolCalls: analysis.toolCalls.total, inputTokens: inputTok, outputTokens: outputTok,
			thinkingTokens: sessionData.thinkingTokens || 0, cachedTokens: cachedTok,
			totalTokens: sessionData.actualTokens || sessionData.tokens || 0,
			estimatedCost: sessionData.copilotExactCostDollars ?? this.calculateEstimatedCost(modelUsage),
			editor: this.detectEditorSource(sessionFile), models: Object.keys(modelUsage),
			lastActivity: sessionData.lastInteraction || new Date(mtime).toISOString(),
			...(sessionData.truncationCount ? { truncationCount: sessionData.truncationCount } : {}),
		};
	}

	private ensureWorkspaceCustomizationCached(norm: string): void {
		if (this._customizationFilesCache.has(norm)) { return; }
		try {
			const files = _scanWorkspaceCustomizationFiles(norm);
			this._customizationFilesCache.set(norm, files);
		} catch (e) { /* ignore scan errors per workspace */ }
	}

	private trackWorkspaceForSession(
		sessionFile: string, interactions: number,
		sessionCounts: Map<string, number>, interactionCounts: Map<string, number>,
		unresolvedIds: Set<string>, unresolvedCounts: Map<string, number>
	): void {
		const workspaceId = _extractWorkspaceIdFromSessionPath(sessionFile);
		try {
			const workspaceFolder = _resolveWorkspaceFolderFromSessionPath(sessionFile, this._workspaceIdToFolderCache);
			if (workspaceFolder) {
				const norm = path.normalize(workspaceFolder);
				sessionCounts.set(norm, (sessionCounts.get(norm) || 0) + 1);
				interactionCounts.set(norm, (interactionCounts.get(norm) || 0) + interactions);
				this.ensureWorkspaceCustomizationCached(norm);
			} else if (workspaceId) {
				unresolvedIds.add(workspaceId);
				unresolvedCounts.set(workspaceId, (unresolvedCounts.get(workspaceId) || 0) + interactions);
			}
		} catch (e) {
			if (workspaceId) {
				unresolvedIds.add(workspaceId);
				unresolvedCounts.set(workspaceId, (unresolvedCounts.get(workspaceId) || 0) + interactions);
			}
		}
	}

	private aggregateSessionFileIntoStats(
		r: { sessionFile: string; sessionData: SessionFileCache; mtime: number },
		periods: { todayStats: UsageAnalysisPeriod; last30DaysStats: UsageAnalysisPeriod; monthStats: UsageAnalysisPeriod; lastMonthStats: UsageAnalysisPeriod; todayUtcKey: string; last30DaysUtcStartKey: string; monthUtcStartKey: string; lastMonthUtcStartKey: string; lastMonthUtcEndKey: string },
		wsMaps: { workspaceSessionCounts: Map<string, number>; workspaceInteractionCounts: Map<string, number>; unresolvedWorkspaceIds: Set<string>; unresolvedWorkspaceInteractionCounts: Map<string, number> },
		todaySessionsList: TodaySessionSummary[]
	): void {
		const { sessionFile, sessionData, mtime } = r;
		const interactions = sessionData.interactions;
		if (interactions === 0) { return; }
		const analysis = sessionData.usageAnalysis || this.buildDefaultSessionAnalysis();
		const lastActivityUtcKey = this.computeLastActivityKey(sessionData, mtime);
		const inLast30Days = lastActivityUtcKey >= periods.last30DaysUtcStartKey;
		const inLastMonth = lastActivityUtcKey >= periods.lastMonthUtcStartKey && lastActivityUtcKey <= periods.lastMonthUtcEndKey;
		// month-to-date is always a subset of last 30 days, so this guard also covers it.
		if (!inLast30Days && !inLastMonth) { return; }
		if (inLast30Days) {
			periods.last30DaysStats.sessions++;
			this.mergeUsageAnalysis(periods.last30DaysStats, analysis);
			this.trackWorkspaceForSession(sessionFile, interactions,
				wsMaps.workspaceSessionCounts, wsMaps.workspaceInteractionCounts,
				wsMaps.unresolvedWorkspaceIds, wsMaps.unresolvedWorkspaceInteractionCounts);
		}
		if (lastActivityUtcKey >= periods.monthUtcStartKey) {
			periods.monthStats.sessions++;
			this.mergeUsageAnalysis(periods.monthStats, analysis);
		}
		if (inLastMonth) {
			periods.lastMonthStats.sessions++;
			this.mergeUsageAnalysis(periods.lastMonthStats, analysis);
		}
		if (lastActivityUtcKey === periods.todayUtcKey) {
			periods.todayStats.sessions++;
			this.mergeUsageAnalysis(periods.todayStats, analysis);
			todaySessionsList.push(this.collectTodaySessionInfo(sessionData, sessionFile, analysis, interactions, mtime));
		}
	}

	private aggregateUsageFileResults(
		usageResults: ({ sessionFile: string; sessionData: SessionFileCache; mtime: number } | null | undefined)[],
		periods: { todayStats: UsageAnalysisPeriod; last30DaysStats: UsageAnalysisPeriod; monthStats: UsageAnalysisPeriod; lastMonthStats: UsageAnalysisPeriod; todayUtcKey: string; last30DaysUtcStartKey: string; monthUtcStartKey: string; lastMonthUtcStartKey: string; lastMonthUtcEndKey: string },
		wsMaps: { workspaceSessionCounts: Map<string, number>; workspaceInteractionCounts: Map<string, number>; unresolvedWorkspaceIds: Set<string>; unresolvedWorkspaceInteractionCounts: Map<string, number> },
		todaySessionsList: TodaySessionSummary[], totalFiles: number
	): void {
		let processed = 0;
		const progressInterval = Math.max(1, Math.floor(totalFiles / 20));
		for (const r of usageResults) {
			try {
				if (r) { this.aggregateSessionFileIntoStats(r, periods, wsMaps, todaySessionsList); }
			} catch (fileError) {
				this.warn(`Error processing session file for usage analysis: ${fileError}`);
			}
			processed++;
			if (processed % progressInterval === 0) {
				this.log(`🔍 [Usage Analysis] Progress: ${processed}/${totalFiles} files (${Math.round(processed / totalFiles * 100)}%)`);
			}
		}
	}

	private mergeWorkspaceInto(
		winner: string, loser: string,
		sessionCounts: Map<string, number>, interactionCounts: Map<string, number>
	): void {
		sessionCounts.set(winner, (sessionCounts.get(winner) || 0) + (sessionCounts.get(loser) || 0));
		interactionCounts.set(winner, (interactionCounts.get(winner) || 0) + (interactionCounts.get(loser) || 0));
		sessionCounts.delete(loser);
		interactionCounts.delete(loser);
		const winnerFiles = this._customizationFilesCache.get(winner) || [];
		const loserFiles = this._customizationFilesCache.get(loser) || [];
		if (winnerFiles.length === 0 && loserFiles.length > 0) {
			this._customizationFilesCache.set(winner, loserFiles);
		}
		this._customizationFilesCache.delete(loser);
	}

	private deduplicateWorkspacesByCase(sessionCounts: Map<string, number>, interactionCounts: Map<string, number>): void {
		if (process.platform !== 'win32' && process.platform !== 'darwin') { return; }
		const isRemotePath = (p: string) => process.platform === 'win32' && _normalizePath(p).startsWith('/');
		const lowerToCanonical = new Map<string, string>();
		for (const key of Array.from(sessionCounts.keys())) {
			const lower = key.toLowerCase();
			if (!lowerToCanonical.has(lower)) { lowerToCanonical.set(lower, key); continue; }
			const canonical = lowerToCanonical.get(lower)!;
			const winner = _dwbcPickWinner(key, canonical, isRemotePath(key), isRemotePath(canonical), sessionCounts);
			this.mergeWorkspaceInto(winner, winner === key ? canonical : key, sessionCounts, interactionCounts);
			lowerToCanonical.set(lower, winner);
		}
	}

	private deduplicateRemoteWorkspacePaths(sessionCounts: Map<string, number>, interactionCounts: Map<string, number>): void {
		if (process.platform !== 'win32') { return; }
		const isRemotePath = (p: string) => _normalizePath(p).startsWith('/');
		const basenameToLocal = new Map<string, string>();
		for (const key of Array.from(sessionCounts.keys())) {
			if (!isRemotePath(key)) { basenameToLocal.set(path.basename(key).toLowerCase(), key); }
		}
		for (const key of Array.from(sessionCounts.keys())) {
			if (!isRemotePath(key)) { continue; }
			const localKey = basenameToLocal.get(path.basename(key).toLowerCase());
			if (localKey && sessionCounts.has(key)) {
				this.mergeWorkspaceInto(localKey, key, sessionCounts, interactionCounts);
			}
		}
	}

	private deduplicateCopilotWorktrees(sessionCounts: Map<string, number>, interactionCounts: Map<string, number>): void {
		const worktreeToCanonical = new Map<string, string>();
		for (const key of Array.from(sessionCounts.keys())) {
			const segments = key.split(path.sep);
			const wtIdx = segments.map(s => s.toLowerCase()).lastIndexOf('copilot-worktrees');
			if (wtIdx === -1 || wtIdx + 2 >= segments.length) { continue; }
			const repoName = segments[wtIdx + 1];
			const reposPath = path.normalize(segments.slice(0, wtIdx).concat('repos', repoName).join(path.sep));
			const canonical = fs.existsSync(reposPath) ? reposPath : path.normalize(segments.slice(0, wtIdx + 2).join(path.sep));
			worktreeToCanonical.set(key, canonical);
		}
		const canonicals = new Set(worktreeToCanonical.values());
		for (const canonical of canonicals) {
			if (!sessionCounts.has(canonical)) { sessionCounts.set(canonical, 0); interactionCounts.set(canonical, 0); }
			for (const [worktree, canon] of worktreeToCanonical) {
				if (canon === canonical && worktree !== canonical && sessionCounts.has(worktree)) {
					this.mergeWorkspaceInto(canonical, worktree, sessionCounts, interactionCounts);
				}
			}
			this.ensureWorkspaceCustomizationCached(canonical);
		}
	}

	private deduplicateWorkspacePaths(sessionCounts: Map<string, number>, interactionCounts: Map<string, number>): void {
		this.deduplicateWorkspacesByCase(sessionCounts, interactionCounts);
		this.deduplicateRemoteWorkspacePaths(sessionCounts, interactionCounts);
		this.deduplicateCopilotWorktrees(sessionCounts, interactionCounts);
		this.deduplicateByBasename(sessionCounts, interactionCounts);
	}

	/**
	 * Pass 4 — same-basename dedup for local paths.
	 * A repo cloned at two different locations (e.g. ~/.copilot/repos/my-repo AND
	 * ~/source/my-repo) will have the same basename but different absolute paths.
	 * Merge them into one entry; the path with more interactions wins so the richer
	 * customization file scan is kept.
	 */
	private deduplicateByBasename(sessionCounts: Map<string, number>, interactionCounts: Map<string, number>): void {
		const isRemotePath = (p: string) => process.platform === 'win32' && _normalizePath(p).startsWith('/');
		// Group all non-remote, non-unresolved paths by lower-case basename
		const basenameToKeys = new Map<string, string[]>();
		for (const key of Array.from(sessionCounts.keys())) {
			if (isRemotePath(key) || key.startsWith('<unresolved:')) { continue; }
			const base = path.basename(key).toLowerCase();
			const group = basenameToKeys.get(base) || [];
			group.push(key);
			basenameToKeys.set(base, group);
		}
		for (const [, group] of basenameToKeys) {
			if (group.length < 2) { continue; }
			// Pick winner: most interactions; on tie, most sessions; on tie, first entry
			const winner = group.reduce((best, key) => {
				const bestScore = (interactionCounts.get(best) || 0) * 10000 + (sessionCounts.get(best) || 0);
				const keyScore = (interactionCounts.get(key) || 0) * 10000 + (sessionCounts.get(key) || 0);
				return keyScore > bestScore ? key : best;
			});
			for (const key of group) {
				if (key !== winner && sessionCounts.has(key)) {
					this.mergeWorkspaceInto(winner, key, sessionCounts, interactionCounts);
				}
			}
		}
	}

	private buildResolvedWorkspaceMatrixRows(
		sessionCounts: Map<string, number>, interactionCounts: Map<string, number>,
		customizationTypes: { id: string; icon: string; label: string }[]
	): { rows: WorkspaceCustomizationRow[]; issues: number } {
		const rows: WorkspaceCustomizationRow[] = [];
		let issues = 0;
		for (const [folderPath, sessionCount] of sessionCounts) {
			const files = this._customizationFilesCache.get(folderPath) || [];
			const typeStatuses: { [typeId: string]: CustomizationTypeStatus } = {};
			for (const type of customizationTypes) {
				const filesOfType = files.filter(f => f.type === type.id);
				if (filesOfType.length === 0) { typeStatuses[type.id] = '❌'; }
				else if (filesOfType.some(f => f.isStale)) { typeStatuses[type.id] = '⚠️'; }
				else { typeStatuses[type.id] = '✅'; }
			}
			if (customizationTypes.every(t => typeStatuses[t.id] === '❌')) { issues++; }
			rows.push({ workspacePath: folderPath, workspaceName: path.basename(folderPath), sessionCount, interactionCount: interactionCounts.get(folderPath) || 0, typeStatuses });
		}
		return { rows, issues };
	}

	private buildUnresolvedWorkspaceMatrixRows(
		unresolvedIds: Set<string>, unresolvedCounts: Map<string, number>,
		customizationTypes: { id: string; icon: string; label: string }[]
	): { rows: WorkspaceCustomizationRow[]; issues: number } {
		const rows: WorkspaceCustomizationRow[] = [];
		let issues = 0;
		for (const workspaceId of unresolvedIds) {
			const typeStatuses: { [typeId: string]: CustomizationTypeStatus } = {};
			for (const type of customizationTypes) { typeStatuses[type.id] = '❌'; }
			issues++;
			const displayId = workspaceId.length > CopilotTokenTracker.WORKSPACE_ID_DISPLAY_LENGTH
				? `${workspaceId.substring(0, CopilotTokenTracker.WORKSPACE_ID_DISPLAY_LENGTH)}...`
				: workspaceId;
			rows.push({
				workspacePath: `<unresolved:${workspaceId}>`, workspaceName: `Unresolved (${displayId})`,
				sessionCount: 0, interactionCount: unresolvedCounts.get(workspaceId) || 0, typeStatuses
			});
		}
		return { rows, issues };
	}

	private buildUsageCustomizationMatrix(
		sessionCounts: Map<string, number>, interactionCounts: Map<string, number>,
		unresolvedIds: Set<string>, unresolvedCounts: Map<string, number>
	): void {
		try {
			const uniqueTypes = new Map<string, { icon: string; label: string }>();
			for (const pattern of (customizationPatternsData as any).patterns || []) {
				if (pattern.category && pattern.category !== 'copilot') { continue; }
				if (!uniqueTypes.has(pattern.type)) {
					uniqueTypes.set(pattern.type, { icon: pattern.icon || '', label: pattern.label || pattern.type });
				}
			}
			const customizationTypes = Array.from(uniqueTypes.entries()).map(([id, v]) => ({ id, icon: v.icon, label: v.label }));
			const { rows: resolvedRows, issues: resolvedIssues } = this.buildResolvedWorkspaceMatrixRows(sessionCounts, interactionCounts, customizationTypes);
			const { rows: unresolvedRows, issues: unresolvedIssues } = this.buildUnresolvedWorkspaceMatrixRows(unresolvedIds, unresolvedCounts, customizationTypes);
			const matrixRows = [...resolvedRows, ...unresolvedRows];
			matrixRows.sort((a, b) => b.interactionCount !== a.interactionCount ? b.interactionCount - a.interactionCount : b.sessionCount - a.sessionCount);
			this._lastCustomizationMatrix = { customizationTypes, workspaces: matrixRows, totalWorkspaces: matrixRows.length, workspacesWithIssues: resolvedIssues + unresolvedIssues };
			this._lastMissedPotential = this.detectMissedPotential(sessionCounts, interactionCounts);
		} catch (e) { /* ignore overall customization scanning errors */ }
	}

	/**
	 * Merge usage analysis data into period stats
	 */
	private mergeUsageAnalysis(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
		return _mergeUsageAnalysis(period, analysis);
	}

	private async countInteractionsInSession(sessionFile: string, preloadedContent?: string, preloadedParsedJson?: any): Promise<number> {
		try {
			const eco = this.findEcosystem(sessionFile);
			if (eco) { return eco.countInteractions(sessionFile); }

			// Handle Windsurf sessions - API-based with interaction count, file-based fallback
			if (this.windsurf.isWindsurfSessionFile(sessionFile)) {
				const session = await this.windsurf.resolveSession(sessionFile);
				return session?.interactions ?? 0;
			}

			const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');
			if (this.isUuidPointerFile(fileContent)) { return 0; }

			const isJsonlContent = sessionFile.endsWith('.jsonl') || this.isJsonlContent(fileContent);
			if (isJsonlContent) {
				return this.countInteractionsFromJsonlLines(fileContent.trim().split('\n'));
			}

			const sessionContent = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
			if (sessionContent.requests && Array.isArray(sessionContent.requests)) {
				return sessionContent.requests.length;
			}
			return 0;
		} catch (error) {
			this.warn(`Error counting interactions in ${sessionFile}: ${error}`);
			return 0;
		}
	}

	private countInteractionsFromJsonlLines(lines: string[]): number {
		let interactions = 0;
		for (const line of lines) {
			if (!line.trim()) { continue; }
			try { interactions += _cifjlProcessEvent(JSON.parse(line)); } catch { /* skip malformed */ }
		}
		return interactions;
	}


	/**
	 * Analyze a session file for usage patterns (tool calls, modes, context references, MCP tools)
	 */

	/**
	 * Calculate model switching statistics for a session file.
	 * This method updates the analysis.modelSwitching field in place.
	 */

	/**
	 * Check if a tool name indicates it's an MCP (Model Context Protocol) tool.
	 * MCP tools are identified by names starting with "mcp." or "mcp_"
	 */
	private isMcpTool(toolName: string): boolean {
		return _isMcpTool(toolName);
	}

	/**
	 * Normalize an MCP tool name so that equivalent tools from different servers
	 * (local stdio vs remote) are counted under a single canonical key in "By Tool" views.
	 * Maps mcp_github_github_<action> → mcp_io_github_git_<action>.
	 */

	/**
	 * Extract server name from an MCP tool name.
	 * MCP tool names follow the format: mcp.server.tool or mcp_server_tool
	 * For example: "mcp.io.github.git.assign_copilot_to_issue" → "GitHub MCP"
	 * Uses the display name from toolNames.json (the part before the colon).
	 * Falls back to extracting the second segment if no mapping exists.
	 */
	private extractMcpServerName(toolName: string): string {
		return _extractMcpServerName(toolName, this.toolNameMap);
	}

	/**
	 * Derive conversation patterns from already-computed mode usage.
	 * Called before every return in analyzeSessionUsage to ensure all file formats get patterns.
	 */

	/**
	 * Track enhanced metrics from session files:
	 * - Edit scope (single vs multi-file edits)
	 * - Apply button usage (codeblockUri with isEdit flag)
	 * - Session duration data
	 * - Conversation patterns (multi-turn sessions)
	 * - Agent type usage
	 */

	/**
	 * Analyze a request object for all context references.
	 * This is the unified method that processes text, contentReferences, and variableData.
	 */
	private analyzeRequestContext(request: any, refs: ContextReferenceUsage): void {
		return _analyzeRequestContext(request, refs);
	}

	/**
	 * Analyze text for context references like #file, #selection, @workspace
	 */
	private analyzeContextReferences(text: string, refs: ContextReferenceUsage): void {
		return _analyzeContextReferences(text, refs);
	}

	/**
	 * Analyze contentReferences from session log data to track specific file attachments.
	 * Looks for kind: "reference" entries and tracks by kind, path patterns.
	 * Also increments specific category counters like refs.file when appropriate.
	 */

	/**
	 * Analyze variableData to track prompt file attachments and other variable-based context.
	 * This captures automatic attachments like copilot-instructions.md via variable system.
	 */

	/**
	 * Extract repository remote URL from file paths found in contentReferences.
	 * Looks for .git/config file in the workspace root to get the origin remote URL.
	 * @param contentReferences Array of content reference objects from session data
	 * @returns The repository remote URL if found, undefined otherwise
	 */
	private async extractRepositoryFromContentReferences(contentReferences: any[]): Promise<string | undefined> {
		return _extractRepositoryFromContentReferences(contentReferences);
	}

	/** Extract session metadata for a Windsurf virtual session. */
	private async extractWindsurfSessionMetadata(sessionFile: string): Promise<{
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		dailyInteractions: { [utcDayKey: string]: number };
	}> {
		const session = await this.windsurf.resolveSession(sessionFile);
		const lastInteraction = session?.lastInteraction ?? null;
		const dailyInteractions: { [utcDayKey: string]: number } = {};
		if (lastInteraction) {
			const d = new Date(lastInteraction);
			if (!isNaN(d.getTime())) {
				dailyInteractions[d.toISOString().slice(0, 10)] = Math.max(1, session?.interactions ?? 1);
			}
		}
		return {
			title: session?.title,
			firstInteraction: session?.firstInteraction ?? null,
			lastInteraction,
			dailyInteractions,
		};
	}

	private async extractSessionMetadata(sessionFile: string, preloadedContent?: string, preloadedParsedJson?: any): Promise<{
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		dailyInteractions: { [localDayKey: string]: number };
		dailyFractions?: Record<string, number>;
	}> {
		let title: string | undefined;
		const timestamps: number[] = [];
		const requestTimestamps: number[] = [];

		try {
			const eco = this.findEcosystem(sessionFile);
			if (eco) {
				const meta = await eco.getMeta(sessionFile);
				const dailyFractions = eco.getDailyFractions ? await eco.getDailyFractions(sessionFile) : undefined;
				return { ...meta, dailyInteractions: {}, ...(dailyFractions ? { dailyFractions } : {}) };
			}

			// Handle Windsurf virtual sessions
			if (this.windsurf.isWindsurfSessionFile(sessionFile)) {
				return this.extractWindsurfSessionMetadata(sessionFile);
			}

			const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');
			if (_isUuidPointerFile(fileContent)) {
				return { title, firstInteraction: null, lastInteraction: null, dailyInteractions: {} };
			}

			const isJsonlContent = sessionFile.endsWith('.jsonl') || _isJsonlContent(fileContent);
			if (isJsonlContent) {
				const result = this.extractMetadataFromJsonl(fileContent.trim().split('\n'));
				title = result.title; timestamps.push(...result.timestamps); requestTimestamps.push(...result.requestTimestamps);
			} else {
				const result = this.extractMetadataFromJson(fileContent, preloadedParsedJson);
				title = result.title; timestamps.push(...result.timestamps); requestTimestamps.push(...result.requestTimestamps);
			}
		} catch { /* file read error */ }

		let firstInteraction: string | null = null;
		let lastInteraction: string | null = null;
		if (timestamps.length > 0) {
			timestamps.sort((a, b) => a - b);
			firstInteraction = new Date(timestamps[0]).toISOString();
			lastInteraction = new Date(timestamps[timestamps.length - 1]).toISOString();
		}

		const dailyInteractions: { [localDayKey: string]: number } = {};
		for (const ts of requestTimestamps) {
			const dayKey = toLocalDayKey(new Date(ts));
			dailyInteractions[dayKey] = (dailyInteractions[dayKey] || 0) + 1;
		}

		return { title, firstInteraction, lastInteraction, dailyInteractions };
	}

	private extractMetadataFromJsonl(lines: string[]): { title: string | undefined; timestamps: number[]; requestTimestamps: number[] } {
		const timestamps: number[] = [];
		const requestTimestamps: number[] = [];
		const { loopTitle, firstUserMessage } = this._emfjlProcessLines(lines, timestamps, requestTimestamps);
		let title = loopTitle;
		if (!title && firstUserMessage) {
			const trimmed = firstUserMessage.trim();
			title = trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;
		}
		return { title, timestamps, requestTimestamps };
	}

	private _emfjlProcessLines(lines: string[], timestamps: number[], requestTimestamps: number[]): { loopTitle: string | undefined; firstUserMessage: string | undefined } {
		let loopTitle: string | undefined;
		let firstUserMessage: string | undefined;
		for (const line of lines) {
			if (!line.trim()) { continue; }
			try {
				const event = JSON.parse(line);
				const userMsg = this.processUserMessageMetadata(event, timestamps, requestTimestamps);
				if (userMsg && !firstUserMessage) { firstUserMessage = userMsg; }
				const renameTitle = this.processRenameSessionTitle(event);
				if (renameTitle) { loopTitle = renameTitle; }
				const kind0Title = this.processKind0Metadata(event, timestamps);
				if (kind0Title) { loopTitle = kind0Title; }
				this.processKind2Requests(event, timestamps, requestTimestamps);
				const kind1Title = this.processKind1TitleUpdate(event);
				if (kind1Title) { loopTitle = kind1Title; }
			} catch { /* skip malformed */ }
		}
		return { loopTitle, firstUserMessage };
	}

	private processUserMessageMetadata(event: any, timestamps: number[], requestTimestamps: number[]): string | undefined {
		if (event.type !== 'user.message') { return undefined; }
		const ts = event.timestamp || event.ts || event.data?.timestamp;
		if (ts) { const ms = new Date(ts).getTime(); timestamps.push(ms); requestTimestamps.push(ms); }
		return event.data?.content as string | undefined;
	}

	private processRenameSessionTitle(event: any): string | undefined {
		if (event.type === 'tool.execution_start' && event.data?.toolName === 'rename_session' && event.data?.arguments?.title) {
			return event.data.arguments.title as string;
		}
		return undefined;
	}

	private processKind0Metadata(event: any, timestamps: number[]): string | undefined {
		if (event.kind !== 0 || !event.v) { return undefined; }
		if (event.v.creationDate) { timestamps.push(event.v.creationDate); }
		return event.v.customTitle as string | undefined;
	}

	private processKind2Requests(event: any, timestamps: number[], requestTimestamps: number[]): void {
		if (event.kind !== 2 || event.k?.[0] !== 'requests' || !Array.isArray(event.v)) { return; }
		for (const request of event.v) {
			if (request.timestamp) { timestamps.push(request.timestamp); requestTimestamps.push(request.timestamp); }
		}
	}

	private processKind1TitleUpdate(event: any): string | undefined {
		if (event.kind === 1 && event.k?.includes('customTitle') && event.v) { return event.v as string; }
		return undefined;
	}

	private extractMetadataFromJson(fileContent: string, preloadedParsedJson?: any): { title: string | undefined; timestamps: number[]; requestTimestamps: number[] } {
		let title: string | undefined;
		const timestamps: number[] = [];
		const requestTimestamps: number[] = [];
		try {
			const parsed = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
			if (parsed.customTitle) { title = parsed.customTitle; }
			if (parsed.creationDate) { timestamps.push(parsed.creationDate); }
			if (parsed.requests && Array.isArray(parsed.requests)) {
				for (const request of parsed.requests) {
					if (request.timestamp || request.ts || request.result?.timestamp) {
						const ts = request.timestamp || request.ts || request.result?.timestamp;
						const ms = new Date(ts).getTime();
						timestamps.push(ms); requestTimestamps.push(ms);
					}
				}
			}
		} catch { /* unable to parse */ }
		return { title, timestamps, requestTimestamps };
	}

	// Cached versions of session file reading methods
	public async getSessionFileDataCached(sessionFilePath: string, mtime: number, fileSize: number): Promise<SessionFileCache> {
		const cached = this.getCachedSessionData(sessionFilePath);
		if (cached && cached.mtime === mtime && cached.size === fileSize) {
			if (cached.debugLogInputTokens === undefined && !cached.debugLogChecked) {
				const supplemented = await this.supplementCacheWithDebugLog(cached, sessionFilePath, fileSize);
				if (supplemented) { return supplemented; }
			}
			this._cacheHits++;
			return cached;
		}

		this._cacheMisses++;
		const { preloadedContent, preloadedParsedJson } = await this.preloadSessionFileContent(sessionFilePath);

		const [tokenResult, interactions, modelUsage, usageAnalysis, sessionMeta] = await Promise.all([
			this.estimateTokensFromSession(sessionFilePath, preloadedContent, preloadedParsedJson),
			this.countInteractionsInSession(sessionFilePath, preloadedContent, preloadedParsedJson),
			_getModelUsageFromSession(this.usageAnalysisDeps, sessionFilePath, preloadedContent, preloadedParsedJson),
			_analyzeSessionUsage(this.usageAnalysisDeps, sessionFilePath, preloadedContent, preloadedParsedJson),
			this.extractSessionMetadata(sessionFilePath, preloadedContent, preloadedParsedJson),
		]);

		const { dailyRollups, totalInteractions } = this.computeDailyRollups(sessionMeta, tokenResult, modelUsage, interactions);
		const debugLogTokens = await this.readTokensFromDebugLog(sessionFilePath);
		const { resolvedActualTokens, finalCacheReadTokens, resolvedModelUsage } = this.resolveAndApplyDebugLog(tokenResult, debugLogTokens, modelUsage, dailyRollups, totalInteractions);

		await this.applyWindsurfBreakdown(sessionFilePath, resolvedModelUsage, dailyRollups, usageAnalysis);

		const sessionData = this.buildSessionDataObject(tokenResult, interactions, resolvedModelUsage, mtime, fileSize, usageAnalysis, sessionMeta, resolvedActualTokens, finalCacheReadTokens, debugLogTokens, dailyRollups);
		this.setCachedSessionData(sessionFilePath, sessionData, fileSize);
		return sessionData;
	}

	/**
	 * Windsurf sessions are discovered via the gRPC API (not a re-parseable file), so the
	 * data layer pre-builds a ModelUsage map and tool-call breakdown. Fold those into the
	 * resolved model usage / daily rollups / analysis so Today's Sessions shows real
	 * input/output/cached tokens, models and cost instead of zeros.
	 */
	private async applyWindsurfBreakdown(
		sessionFilePath: string,
		resolvedModelUsage: ModelUsage,
		dailyRollups: { [utcDayKey: string]: DailyRollupEntry },
		usageAnalysis: SessionUsageAnalysis
	): Promise<void> {
		if (!this.windsurf.isWindsurfSessionFile(sessionFilePath)) { return; }
		const session = await this.windsurf.resolveSession(sessionFilePath);
		if (!session) { return; }
		if (session.modelUsage && Object.keys(session.modelUsage).length > 0) {
			for (const [model, usage] of Object.entries(session.modelUsage)) {
				resolvedModelUsage[model] = { ...usage };
			}
			// Windsurf has a single activity day; mirror the model usage onto its rollup
			// so per-day model/cost aggregation matches the session totals.
			for (const day of Object.keys(dailyRollups)) {
				dailyRollups[day].modelUsage = session.modelUsage;
				if (session.cachedTokens) { dailyRollups[day].cachedReadTokens = session.cachedTokens; }
			}
		}
		if (session.toolCalls) { usageAnalysis.toolCalls = session.toolCalls; }
	}

	private async preloadSessionFileContent(sessionFilePath: string): Promise<{ preloadedContent: string | undefined; preloadedParsedJson: any | undefined }> {
		const isSpecialSession = this.findEcosystem(sessionFilePath) !== null;
		if (isSpecialSession) { return { preloadedContent: undefined, preloadedParsedJson: undefined }; }
		// Windsurf sessions use virtual paths (windsurf://trajectory/...) — no file to read
		if (this.windsurf.isWindsurfSessionFile(sessionFilePath)) { return { preloadedContent: undefined, preloadedParsedJson: undefined }; }
		const preloadedContent = await fs.promises.readFile(sessionFilePath, 'utf8');
		let preloadedParsedJson: any | undefined;
		const isPlainJson = !sessionFilePath.endsWith('.jsonl') && !_isJsonlContent(preloadedContent) && !_isUuidPointerFile(preloadedContent);
		if (isPlainJson) {
			try { preloadedParsedJson = JSON.parse(preloadedContent); } catch { /* handled individually */ }
		}
		return { preloadedContent, preloadedParsedJson };
	}

	private buildOptionalSessionFields(
		tokenResult: { thinkingTokens?: number; copilotNanoAiu?: number; truncationCount?: number; messagesRemovedByTruncation?: number },
		debugLogTokens: { inputTokens: number; outputTokens: number; modelTurns?: number; copilotNanoAiu?: number } | null | undefined,
		finalCacheReadTokens: number | undefined,
		copilotExactCostDollars: number | undefined,
		dailyRollups: { [utcDayKey: string]: DailyRollupEntry },
		usageAnalysis: SessionUsageAnalysis,
	): Partial<SessionFileCache> {
		const hasDebugLog = !!debugLogTokens && (debugLogTokens.inputTokens + debugLogTokens.outputTokens) > 0;
		const hasEditScope = usageAnalysis?.editScope?.linesAdded !== undefined && usageAnalysis.editScope.linesAdded > 0;
		return {
			thinkingTokens: tokenResult.thinkingTokens,
			...(finalCacheReadTokens ? { cacheReadTokens: finalCacheReadTokens } : {}),
			...(debugLogTokens?.modelTurns ? { modelTurns: debugLogTokens.modelTurns } : {}),
			...(hasDebugLog ? { debugLogInputTokens: debugLogTokens!.inputTokens, debugLogOutputTokens: debugLogTokens!.outputTokens } : {}),
			dailyRollups: Object.keys(dailyRollups).length > 0 ? dailyRollups : undefined,
			...(copilotExactCostDollars !== undefined ? { copilotExactCostDollars } : {}),
			...(tokenResult.truncationCount ? { truncationCount: tokenResult.truncationCount, messagesRemovedByTruncation: tokenResult.messagesRemovedByTruncation } : {}),
			...(hasEditScope ? {
				linesAdded: usageAnalysis!.editScope!.linesAdded,
				linesRemoved: usageAnalysis!.editScope!.linesRemoved ?? 0,
				...(usageAnalysis!.editScope!.languageUsage ? { languageUsage: usageAnalysis!.editScope!.languageUsage } : {}),
			} : {}),
		};
	}


	private buildSessionDataObject(
		tokenResult: { tokens: number; actualTokens?: number; thinkingTokens?: number; cacheReadTokens?: number; copilotNanoAiu?: number },
		interactions: number,
		resolvedModelUsage: ModelUsage,
		mtime: number,
		fileSize: number,
		usageAnalysis: SessionUsageAnalysis,
		sessionMeta: { title?: string; firstInteraction: string | null; lastInteraction: string | null },
		resolvedActualTokens: number | undefined,
		finalCacheReadTokens: number | undefined,
		debugLogTokens: { inputTokens: number; outputTokens: number; modelTurns?: number; copilotNanoAiu?: number } | null | undefined,
		dailyRollups: { [utcDayKey: string]: DailyRollupEntry }
	): SessionFileCache {
		const copilotNanoAiu = debugLogTokens?.copilotNanoAiu ?? tokenResult.copilotNanoAiu ?? 0;
		const copilotExactCostDollars = copilotNanoAiu > 0 ? copilotNanoAiu * NANO_AIU_TO_DOLLARS : undefined;
		const optionals = this.buildOptionalSessionFields(tokenResult, debugLogTokens, finalCacheReadTokens, copilotExactCostDollars, dailyRollups, usageAnalysis);
		return {
			tokens: tokenResult.tokens, interactions, modelUsage: resolvedModelUsage, mtime, size: fileSize,
			usageAnalysis, title: sessionMeta.title, firstInteraction: sessionMeta.firstInteraction,
			lastInteraction: sessionMeta.lastInteraction, actualTokens: resolvedActualTokens,
			...optionals,
		};
	}

	private async supplementCacheWithDebugLog(cached: SessionFileCache, sessionFilePath: string, fileSize: number): Promise<SessionFileCache | null> {
		const debugLogTokens = await this.readTokensFromDebugLog(sessionFilePath);
		if (!debugLogTokens || (debugLogTokens.inputTokens + debugLogTokens.outputTokens) === 0) {
			const marked = { ...cached, debugLogChecked: true as const };
			this.setCachedSessionData(sessionFilePath, marked, fileSize);
			this._cacheHits++;
			return null;
		}
		let supplementModelUsage = cached.modelUsage;
		let supplementDailyRollups = cached.dailyRollups;
		if (Object.keys(debugLogTokens.modelBreakdown).length > 0) {
			supplementModelUsage = _scdlBuildFromBreakdown(debugLogTokens.modelBreakdown);
			if (cached.dailyRollups) {
				supplementDailyRollups = _scdlDistributeToDays(cached.dailyRollups, supplementModelUsage) ?? cached.dailyRollups;
			}
		}
		const supplemented: SessionFileCache = {
			...cached, modelUsage: supplementModelUsage, dailyRollups: supplementDailyRollups,
			actualTokens: debugLogTokens.inputTokens + debugLogTokens.outputTokens,
			...(debugLogTokens.modelTurns ? { modelTurns: debugLogTokens.modelTurns } : {}),
			debugLogInputTokens: debugLogTokens.inputTokens,
			debugLogOutputTokens: debugLogTokens.outputTokens,
			...(debugLogTokens.copilotNanoAiu > 0 ? { copilotExactCostDollars: debugLogTokens.copilotNanoAiu * NANO_AIU_TO_DOLLARS } : {}),
		};
		this.setCachedSessionData(sessionFilePath, supplemented, fileSize);
		this._cacheHits++;
		return supplemented;
	}

	private buildDailyRollupEntry(
		tokenResult: { tokens: number; actualTokens?: number; thinkingTokens?: number; copilotNanoAiu?: number },
		fraction: number,
		interactions: number,
		modelUsage: ModelUsage,
		totalNanoAiu: number,
	): DailyRollupEntry {
		const dayModelUsage = this.scaledModelUsage(modelUsage, fraction);
		const dayExactCost = totalNanoAiu > 0 ? totalNanoAiu * NANO_AIU_TO_DOLLARS * fraction : undefined;
		return {
			tokens: Math.round(tokenResult.tokens * fraction),
			actualTokens: Math.round((tokenResult.actualTokens || 0) * fraction),
			thinkingTokens: Math.round((tokenResult.thinkingTokens || 0) * fraction),
			cachedReadTokens: 0,
			interactions,
			modelUsage: dayModelUsage,
			...(dayExactCost !== undefined ? { copilotExactCostDollars: dayExactCost } : {}),
		};
	}

	private computeRollupsFromFractions(
		fractions: Record<string, number>,
		tokenResult: { tokens: number; actualTokens?: number; thinkingTokens?: number; copilotNanoAiu?: number },
		modelUsage: ModelUsage,
		interactions: number,
		totalNanoAiu: number,
	): { dailyRollups: { [localDayKey: string]: DailyRollupEntry }; totalInteractions: number } {
		const dailyRollups: { [localDayKey: string]: DailyRollupEntry } = {};
		const totalFracInteractions = Math.max(1, interactions);
		for (const [dayKey, fraction] of Object.entries(fractions)) {
			const dayInteractions = Math.max(1, Math.round(totalFracInteractions * fraction));
			dailyRollups[dayKey] = this.buildDailyRollupEntry(tokenResult, fraction, dayInteractions, modelUsage, totalNanoAiu);
		}
		return { dailyRollups, totalInteractions: totalFracInteractions };
	}

	private computeRollupsFromInteractionCounts(
		interactionMap: { [localDayKey: string]: number },
		tokenResult: { tokens: number; actualTokens?: number; thinkingTokens?: number; copilotNanoAiu?: number },
		modelUsage: ModelUsage,
		totalNanoAiu: number,
	): { dailyRollups: { [localDayKey: string]: DailyRollupEntry }; totalInteractions: number } {
		const dailyRollups: { [localDayKey: string]: DailyRollupEntry } = {};
		const totalInteractions = Object.values(interactionMap).reduce((a, b) => a + b, 0);
		for (const [dayKey, dayInteractionCount] of Object.entries(interactionMap)) {
			const fraction = dayInteractionCount / totalInteractions;
			dailyRollups[dayKey] = this.buildDailyRollupEntry(tokenResult, fraction, dayInteractionCount, modelUsage, totalNanoAiu);
		}
		return { dailyRollups, totalInteractions };
	}


	private computeDailyRollups(
		sessionMeta: { firstInteraction: string | null; dailyInteractions: { [localDayKey: string]: number }; dailyFractions?: Record<string, number> },
		tokenResult: { tokens: number; actualTokens?: number; thinkingTokens?: number; copilotNanoAiu?: number },
		modelUsage: ModelUsage,
		interactions: number
	): { dailyRollups: { [localDayKey: string]: DailyRollupEntry }; totalInteractions: number } {
		const totalNanoAiu = tokenResult.copilotNanoAiu ?? 0;

		// Prefer pre-computed fractions from ecosystem adapters (e.g. getDailyFractions()),
		// which have accurate per-request timestamps. Fall back to dailyInteractions counts.
		if (sessionMeta.dailyFractions && Object.keys(sessionMeta.dailyFractions).length > 0) {
			return this.computeRollupsFromFractions(sessionMeta.dailyFractions, tokenResult, modelUsage, interactions, totalNanoAiu);
		}

		const dailyInteractionMap = sessionMeta.dailyInteractions;
		const totalInteractions = Object.values(dailyInteractionMap).reduce((a, b) => a + b, 0);
		if (totalInteractions > 0) {
			return this.computeRollupsFromInteractionCounts(dailyInteractionMap, tokenResult, modelUsage, totalNanoAiu);
		}

		const dailyRollups: { [localDayKey: string]: DailyRollupEntry } = {};
		this.computeFallbackDailyRollup(dailyRollups, sessionMeta.firstInteraction, tokenResult, modelUsage, interactions);
		return { dailyRollups, totalInteractions };
	}

	private computeFallbackDailyRollup(dailyRollups: { [localDayKey: string]: DailyRollupEntry }, firstInteraction: string | null, tokenResult: { tokens: number; actualTokens?: number; thinkingTokens?: number }, modelUsage: ModelUsage, interactions: number): void {
		if (!tokenResult.tokens || !firstInteraction) { return; }
		try {
			const interactionDate = new Date(firstInteraction);
			if (isNaN(interactionDate.getTime())) { return; }
			const dayKey = toLocalDayKey(interactionDate);
			const dayModelUsage = this.scaledModelUsage(modelUsage, 1);
			dailyRollups[dayKey] = { tokens: tokenResult.tokens, actualTokens: tokenResult.actualTokens || 0, thinkingTokens: tokenResult.thinkingTokens || 0, cachedReadTokens: 0, interactions: Math.max(1, interactions), modelUsage: dayModelUsage };
		} catch { /* ignore */ }
	}

	private scaledModelUsage(modelUsage: ModelUsage, fraction: number): ModelUsage {
		const dayModelUsage: ModelUsage = {};
		for (const [model, usage] of Object.entries(modelUsage)) {
			dayModelUsage[model] = { inputTokens: Math.round(usage.inputTokens * fraction), outputTokens: Math.round(usage.outputTokens * fraction), ...(usage.cachedReadTokens !== undefined ? { cachedReadTokens: Math.round(usage.cachedReadTokens * fraction) } : {}), ...(usage.cacheCreationTokens !== undefined ? { cacheCreationTokens: Math.round(usage.cacheCreationTokens * fraction) } : {}) };
		}
		return dayModelUsage;
	}

	private resolveAndApplyDebugLog(
		tokenResult: { tokens: number; actualTokens?: number; cacheReadTokens?: number },
		debugLogTokens: { inputTokens: number; outputTokens: number; cachedTokens?: number; modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }> } | null | undefined,
		modelUsage: ModelUsage,
		dailyRollups: { [utcDayKey: string]: DailyRollupEntry },
		totalInteractions: number
	): { resolvedActualTokens: number | undefined; finalCacheReadTokens: number | undefined; resolvedModelUsage: ModelUsage } {
		const resolvedActualTokens = (debugLogTokens && (debugLogTokens.inputTokens + debugLogTokens.outputTokens) > 0)
			? debugLogTokens.inputTokens + debugLogTokens.outputTokens
			: tokenResult.actualTokens;

		const debugLogCached = !tokenResult.cacheReadTokens ? (debugLogTokens?.cachedTokens ?? 0) : 0;
		const resolvedCacheReadTokens = tokenResult.cacheReadTokens || debugLogCached || undefined;
		const modelCachedTotal = !resolvedCacheReadTokens ? Object.values(modelUsage).reduce((sum, u) => sum + (u.cachedReadTokens ?? 0), 0) : 0;
		const finalCacheReadTokens = resolvedCacheReadTokens || (modelCachedTotal > 0 ? modelCachedTotal : undefined);

		this.backfillDailyRollupCacheTokens(dailyRollups, finalCacheReadTokens);

		const resolvedModelUsage = this.applyDebugLogModelBreakdown(modelUsage, debugLogTokens, dailyRollups, totalInteractions);
		return { resolvedActualTokens, finalCacheReadTokens, resolvedModelUsage };
	}

	private backfillDailyRollupCacheTokens(dailyRollups: { [utcDayKey: string]: DailyRollupEntry }, finalCacheReadTokens: number | undefined): void {
		if (!finalCacheReadTokens || Object.keys(dailyRollups).length === 0) { return; }
		const dayKeys = Object.keys(dailyRollups);
		if (dayKeys.length === 1) {
			dailyRollups[dayKeys[0]].cachedReadTokens = finalCacheReadTokens;
		} else {
			const totalForCache = dayKeys.reduce((s, k) => s + dailyRollups[k].interactions, 0);
			let remaining = finalCacheReadTokens;
			dayKeys.slice(0, -1).forEach(k => {
				const allocated = totalForCache > 0 ? Math.round(finalCacheReadTokens * dailyRollups[k].interactions / totalForCache) : 0;
				dailyRollups[k].cachedReadTokens = allocated;
				remaining -= allocated;
			});
			dailyRollups[dayKeys[dayKeys.length - 1]].cachedReadTokens = Math.max(0, remaining);
		}
	}

	private applyDebugLogModelBreakdown(modelUsage: ModelUsage, debugLogTokens: { inputTokens: number; outputTokens: number; modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }> } | null | undefined, dailyRollups: { [utcDayKey: string]: DailyRollupEntry }, totalInteractions: number): ModelUsage {
		if (!debugLogTokens || Object.keys(debugLogTokens.modelBreakdown).length === 0) { return modelUsage; }
		const resolvedModelUsage: ModelUsage = {};
		for (const [model, bd] of Object.entries(debugLogTokens.modelBreakdown)) {
			resolvedModelUsage[model] = { inputTokens: bd.inputTokens, outputTokens: bd.outputTokens, ...(bd.cachedTokens > 0 ? { cachedReadTokens: bd.cachedTokens } : {}) };
		}
		for (const [dayKey, dayRollup] of Object.entries(dailyRollups)) {
			const fraction = totalInteractions > 0 ? dayRollup.interactions / totalInteractions : 1;
			dailyRollups[dayKey].modelUsage = this.scaledModelUsage(resolvedModelUsage, fraction);
		}
		return resolvedModelUsage;
	}




	private async getUsageAnalysisFromSessionCached(sessionFile: string, mtime: number, fileSize: number): Promise<SessionUsageAnalysis> {
		const sessionData = await this.getSessionFileDataCached(sessionFile, mtime, fileSize);
		const analysis = sessionData.usageAnalysis || {
			toolCalls: { total: 0, byTool: {} },
			modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
			contextReferences: {
				file: 0,
				selection: 0,
				implicitSelection: 0,
				symbol: 0,
				codebase: 0,
				workspace: 0,
				terminal: 0,
				vscode: 0,
				terminalLastCommand: 0,
				terminalSelection: 0,
				clipboard: 0,
				changes: 0,
				outputPanel: 0,
				problemsPanel: 0,
				pullRequest: 0,
				byKind: {},
				copilotInstructions: 0,
				agentsMd: 0,
				byPath: {}
			},
			mcpTools: { total: 0, byServer: {}, byTool: {} },
			modelSwitching: {
				uniqueModels: [],
				modelCount: 0,
				switchCount: 0,
				tiers: { standard: [], premium: [], unknown: [] },
				hasMixedTiers: false,
				standardRequests: 0,
				premiumRequests: 0,
				unknownRequests: 0,
				totalRequests: 0,
				costBuckets: { low: [], medium: [], high: [], unknown: [] },
				hasMixedCosts: false,
				lowCostRequests: 0,
				mediumCostRequests: 0,
				highCostRequests: 0
			}
		};

		// Ensure modelSwitching field exists for backward compatibility with old cache
		if (!analysis.modelSwitching) {
			analysis.modelSwitching = {
				uniqueModels: [],
				modelCount: 0,
				switchCount: 0,
				tiers: { standard: [], premium: [], unknown: [] },
				hasMixedTiers: false,
				standardRequests: 0,
				premiumRequests: 0,
				unknownRequests: 0,
				totalRequests: 0,
				costBuckets: { low: [], medium: [], high: [], unknown: [] },
				hasMixedCosts: false,
				lowCostRequests: 0,
				mediumCostRequests: 0,
				highCostRequests: 0
			};
		} else {
			analysis.modelSwitching.costBuckets ??= { low: [], medium: [], high: [], unknown: [] };
			analysis.modelSwitching.hasMixedCosts ??= false;
			analysis.modelSwitching.lowCostRequests ??= 0;
			analysis.modelSwitching.mediumCostRequests ??= 0;
			analysis.modelSwitching.highCostRequests ??= 0;
		}

		return analysis;
	}

	/**
	 * Add editor root and name information to session file details.
	 * Enriches the details object with editorRoot and editorName properties.
	 */
	private enrichDetailsWithEditorInfo(sessionFile: string, details: SessionFileDetails): void {
		const eco = this.findEcosystem(sessionFile);
		if (eco) {
			details.editorRoot = eco.getEditorRoot(sessionFile);
			details.editorName = getEcosystemDisplayName(eco, sessionFile);
			return;
		}
		if (this.windsurf.isWindsurfSessionFile(sessionFile)) {
			details.editorName = 'Windsurf';
			return;
		}
		try {
			const parts = sessionFile.split(/[/\\]/);
			const userIdx = parts.findIndex(p => p.toLowerCase() === 'user');
			if (userIdx > 0) {
				details.editorRoot = parts.slice(0, userIdx).join(require('path').sep);
			} else {
				details.editorRoot = require('path').dirname(sessionFile);
			}
			details.editorName = this.getEditorNameFromRoot(details.editorRoot || '');
		} catch (e) {
			details.editorRoot = require('path').dirname(sessionFile);
			details.editorName = this.getEditorNameFromRoot(details.editorRoot || '');
		}
	}

	/**
	 * Reconstruct SessionFileDetails from cached data without reading the file.
	 * Returns undefined if cache is not valid or doesn't have all required data.
	 */
	private async getSessionFileDetailsFromCache(sessionFile: string, stat: fs.Stats): Promise<SessionFileDetails | undefined> {
		const cached = this.getCachedSessionData(sessionFile);

		// Validate cache against file stats
		if (!cached || cached.mtime !== stat.mtime.getTime() || cached.size !== stat.size) {
			return undefined;
		}

		// Check if cache has the required fields (for backward compatibility with old cache)
		if (!cached.usageAnalysis?.contextReferences || typeof cached.interactions !== 'number' || cached.interactions < 0) {
			return undefined;
		}

		// Use the cached lastInteraction from session content directly.
		// Do NOT fall back to file mtime here: mtime is updated whenever VS Code writes the
		// session file (e.g. finalising a session just after midnight), which would shift
		// yesterday's sessions into "today". Only use mtime when no content timestamp exists.
		const lastInteraction: string | null = cached.lastInteraction || stat.mtime.toISOString();

		// Reconstruct SessionFileDetails from cache.
		// Prefer actualTokens (real API count) when available; fall back to estimated tokens.
		const details: SessionFileDetails = {
			file: sessionFile,
			size: cached.size || stat.size,
			modified: stat.mtime.toISOString(),
			interactions: cached.interactions,
			tokens: cached.actualTokens || cached.tokens || 0,
			contextReferences: cached.usageAnalysis.contextReferences,
			firstInteraction: cached.firstInteraction || null,
			lastInteraction: lastInteraction,
			editorSource: this.detectEditorSource(sessionFile),
			title: cached.title,
			repository: cached.repository
		};

		// Add editor root and name
		this.enrichDetailsWithEditorInfo(sessionFile, details);

		return details;
	}

	/**
	 * Update or create cache entry with session file details.
	 * Merges new detail fields with existing cached data if available.
	 * @param tokenResult - Fresh token data from eco.getTokens(); when provided, takes
	 *   precedence over any cached token values so eco-session diagnostics always show
	 *   the correct (actual-API) count rather than a stale or zero value.
	 */
	private async updateCacheWithSessionDetails(
		sessionFile: string,
		stat: fs.Stats,
		details: SessionFileDetails,
		tokenResult?: { tokens: number; thinkingTokens: number; actualTokens: number }
	): Promise<void> {
		const existingCache = this.getCachedSessionData(sessionFile);
		const resolved = this.resolveTokensForCacheUpdate(tokenResult, existingCache);
		details.tokens = resolved.actualTokens || resolved.tokens || 0;

		const cacheEntry: SessionFileCache = {
			tokens: resolved.tokens,
			interactions: details.interactions,
			modelUsage: existingCache?.modelUsage || {},
			mtime: stat.mtime.getTime(),
			size: stat.size,
			actualTokens: resolved.actualTokens,
			thinkingTokens: resolved.thinkingTokens,
			...(resolved.cacheReadTokens ? { cacheReadTokens: resolved.cacheReadTokens } : {}),
			dailyRollups: existingCache?.dailyRollups,
			...this.preserveExistingDebugLogFields(existingCache),
			...this.preserveExistingLocFields(existingCache),
			usageAnalysis: existingCache?.usageAnalysis || this.buildDefaultUsageAnalysis(),
			firstInteraction: details.firstInteraction,
			lastInteraction: details.lastInteraction,
			title: details.title,
			repository: details.repository
		};

		cacheEntry.usageAnalysis!.contextReferences = details.contextReferences;
		this.setCachedSessionData(sessionFile, cacheEntry, stat.size);
	}

	private resolveTokensForCacheUpdate(tokenResult: { tokens: number; thinkingTokens: number; actualTokens: number } | undefined, existingCache: SessionFileCache | undefined): { tokens: number; actualTokens: number | undefined; thinkingTokens: number | undefined; cacheReadTokens: number | undefined } {
		return {
			actualTokens: tokenResult?.actualTokens ?? existingCache?.actualTokens,
			tokens: tokenResult?.tokens ?? existingCache?.tokens ?? 0,
			thinkingTokens: tokenResult?.thinkingTokens ?? existingCache?.thinkingTokens,
			cacheReadTokens: (tokenResult as any)?.cacheReadTokens ?? existingCache?.cacheReadTokens,
		};
	}

	private preserveExistingDebugLogFields(existingCache: SessionFileCache | undefined): Partial<SessionFileCache> {
		return {
			...(existingCache?.modelTurns !== undefined ? { modelTurns: existingCache.modelTurns } : {}),
			...(existingCache?.debugLogInputTokens !== undefined ? { debugLogInputTokens: existingCache.debugLogInputTokens } : {}),
			...(existingCache?.debugLogOutputTokens !== undefined ? { debugLogOutputTokens: existingCache.debugLogOutputTokens } : {}),
			...(existingCache?.debugLogChecked ? { debugLogChecked: true as const } : {}),
		};
	}

	private preserveExistingLocFields(existingCache: SessionFileCache | undefined): Partial<SessionFileCache> {
		return {
			...(existingCache?.linesAdded !== undefined ? { linesAdded: existingCache.linesAdded } : {}),
			...(existingCache?.linesRemoved !== undefined ? { linesRemoved: existingCache.linesRemoved } : {}),
			...(existingCache?.languageUsage !== undefined ? { languageUsage: existingCache.languageUsage } : {}),
		};
	}

	private buildDefaultUsageAnalysis(): SessionUsageAnalysis {
		return {
			toolCalls: { total: 0, byTool: {} },
			modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
			contextReferences: {
				file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
				workspace: 0, terminal: 0, vscode: 0,
				terminalLastCommand: 0, terminalSelection: 0, clipboard: 0, changes: 0,
				outputPanel: 0, problemsPanel: 0, pullRequest: 0,
				byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {}
			},
			mcpTools: { total: 0, byServer: {}, byTool: {} },
			modelSwitching: { uniqueModels: [], modelCount: 0, switchCount: 0, tiers: { standard: [], premium: [], unknown: [] }, hasMixedTiers: false, standardRequests: 0, premiumRequests: 0, unknownRequests: 0, totalRequests: 0, costBuckets: { low: [], medium: [], high: [], unknown: [] }, hasMixedCosts: false, lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0 }
		};
	}

	/**
	 * Get detailed session file information for diagnostics view.
	 * Analyzes session files to extract interactions, context references, and timestamps.
	 * Uses cached data when available to avoid re-reading files.
	 */
	private async getSessionFileDetails(sessionFile: string, existingStat?: Awaited<ReturnType<typeof this.statSessionFile>>): Promise<SessionFileDetails> {
		const stat = existingStat ?? await this.statSessionFile(sessionFile);

		const cachedDetails = await this.getSessionFileDetailsFromCache(sessionFile, stat);
		if (cachedDetails && !(cachedDetails.repository === undefined && sessionFile.endsWith('.jsonl'))) {
			this._cacheHits++;
			return cachedDetails;
		}

		this._cacheMisses++;

		const details: SessionFileDetails = {
			file: sessionFile, size: stat.size, modified: stat.mtime.toISOString(), interactions: 0,
			contextReferences: { file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0, workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0, clipboard: 0, changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0, byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {} },
			firstInteraction: null, lastInteraction: null, editorSource: this.detectEditorSource(sessionFile)
		};

		this.enrichDetailsWithEditorInfo(sessionFile, details);

		try {
			const eco = this.findEcosystem(sessionFile);
			if (eco) { return this.processEcosystemSessionDetails(eco, sessionFile, stat, details); }

			// Handle Windsurf virtual sessions — resolve via API or .pb file metadata
			if (this.windsurf.isWindsurfSessionFile(sessionFile)) {
				return this.processWindsurfSessionDetails(sessionFile, stat, details);
			}

			const fileContent = await fs.promises.readFile(sessionFile, 'utf8');
			if (this.isUuidPointerFile(fileContent)) {
				await this.updateCacheWithSessionDetails(sessionFile, stat, details);
				return details;
			}

			const isJsonlContent = sessionFile.endsWith('.jsonl') || this.isJsonlContent(fileContent);
			if (isJsonlContent) {
				return this.processJsonlSessionDetails(sessionFile, stat, details, fileContent);
			}

			const sessionContent = JSON.parse(fileContent);
			if (sessionContent.customTitle) { details.title = sessionContent.customTitle; }
			if (Array.isArray(sessionContent.requests)) {
				await this.processJsonRequestsDetails(sessionContent.requests, sessionFile, stat, details);
			}
			await this.updateCacheWithSessionDetails(sessionFile, stat, details);
		} catch (error) {
			this.warn(`Error analyzing session file details for ${sessionFile}: ${error}`);
		}

		return details;
	}

	private async processWindsurfSessionDetails(sessionFile: string, stat: fs.Stats, details: SessionFileDetails): Promise<SessionFileDetails> {
		const session = await this.windsurf.resolveSession(sessionFile);
		if (session) {
			details.title = session.title;
			details.interactions = session.interactions;
			details.editorSource = 'windsurf';
			details.editorName = 'Windsurf';
			details.firstInteraction = session.firstInteraction ?? stat.mtime.toISOString();
			details.lastInteraction = session.lastInteraction ?? stat.mtime.toISOString();
		}
		await this.updateCacheWithSessionDetails(sessionFile, stat, details);
		return details;
	}

	private async processEcosystemSessionDetails(eco: IEcosystemAdapter, sessionFile: string, stat: fs.Stats, details: SessionFileDetails): Promise<SessionFileDetails> {
		const [meta, tokenResult, interactionCount] = await Promise.all([
			eco.getMeta(sessionFile), eco.getTokens(sessionFile), eco.countInteractions(sessionFile)
		]);
		details.title = meta.title;
		details.firstInteraction = meta.firstInteraction;
		details.lastInteraction = meta.lastInteraction;
		details.interactions = interactionCount;
		details.editorRoot = eco.getEditorRoot(sessionFile);
		details.editorName = getEcosystemDisplayName(eco, sessionFile);
		if (meta.workspacePath) { details.repository = path.basename(meta.workspacePath); }
		await this.updateCacheWithSessionDetails(sessionFile, stat, details, tokenResult);
		return details;
	}

	private async processJsonlSessionDetails(sessionFile: string, stat: fs.Stats, details: SessionFileDetails, fileContent: string): Promise<SessionFileDetails> {
		const lines = fileContent.trim().split('\n').filter(l => l.trim());
		const timestamps: number[] = [];
		const allContentReferences: any[] = [];

		let isDeltaBased = false;
		if (lines.length > 0) {
			try { const firstLine = JSON.parse(lines[0]); if (firstLine && typeof firstLine.kind === 'number') { isDeltaBased = true; } } catch { /* not delta */ }
		}

		if (isDeltaBased) {
			return this.processDeltaJsonlDetails(lines, sessionFile, stat, details, timestamps, allContentReferences);
		}
		return this.processCliJsonlDetails(lines, sessionFile, stat, details, timestamps, allContentReferences);
	}

	private async processDeltaJsonlDetails(lines: string[], sessionFile: string, stat: fs.Stats, details: SessionFileDetails, timestamps: number[], allContentReferences: any[]): Promise<SessionFileDetails> {
		const { sessionState } = await _reconstructJsonlStateAsync(lines);
		if (sessionState.creationDate) { timestamps.push(sessionState.creationDate); }
		if (sessionState.customTitle) { details.title = sessionState.customTitle; }

		const requests = sessionState.requests || [];
		details.interactions = requests.length;
		for (const request of requests) {
			if (!request) { continue; }
			if (request.timestamp) { timestamps.push(request.timestamp); }
			this.analyzeRequestContext(request, details.contextReferences);
			if (request.contentReferences && Array.isArray(request.contentReferences)) {
				allContentReferences.push(...request.contentReferences);
			}
		}

		this.setDetailsTimestamps(details, timestamps, stat);
		// Use '' as a "checked but not found" sentinel so warm-cache runs don't re-parse this file.
		details.repository = allContentReferences.length > 0
			? (await this.extractRepositoryFromContentReferences(allContentReferences) ?? '')
			: '';
		await this.updateCacheWithSessionDetails(sessionFile, stat, details);
		return details;
	}

	private async processCliJsonlDetails(lines: string[], sessionFile: string, stat: fs.Stats, details: SessionFileDetails, timestamps: number[], allContentReferences: any[]): Promise<SessionFileDetails> {
		let firstUserMessage: string | undefined;
		for (const line of lines) {
			if (!line.trim()) { continue; }
			try {
				const event = JSON.parse(line);
				const userMsg = this.processCliJsonlEvent(event, details, timestamps, allContentReferences);
				if (userMsg && !firstUserMessage) { firstUserMessage = userMsg; }
			} catch { /* skip malformed */ }
		}

		if (!details.title && firstUserMessage) {
			const trimmed = firstUserMessage.trim();
			details.title = trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;
		}
		this.setDetailsTimestamps(details, timestamps, stat);
		details.repository = allContentReferences.length > 0
			? (await this.extractRepositoryFromContentReferences(allContentReferences) ?? '')
			: '';
		await this.updateCacheWithSessionDetails(sessionFile, stat, details);
		return details;
	}

	private processCliJsonlEvent(event: any, details: SessionFileDetails, timestamps: number[], allContentReferences: any[]): string | undefined {
		if (event.type === 'user.message') { return this.processUserMessageEvent(event, details, timestamps); }
		if (event.type === 'tool.execution_start') { this.processToolExecutionEvent(event, details, allContentReferences); }
		return undefined;
	}

	private processUserMessageEvent(event: any, details: SessionFileDetails, timestamps: number[]): string | undefined {
		details.interactions++;
		if (event.timestamp || event.ts || event.data?.timestamp) {
			timestamps.push(new Date(event.timestamp || event.ts || event.data.timestamp).getTime());
		}
		if (event.data?.content) {
			this.analyzeContextReferences(event.data.content, details.contextReferences);
			return event.data.content;
		}
		return undefined;
	}

	private processToolExecutionEvent(event: any, details: SessionFileDetails, allContentReferences: any[]): void {
		if (event.data?.toolName === 'rename_session' && event.data?.arguments?.title) {
			details.title = event.data.arguments.title;
		}
		if (event.data?.arguments) {
			const args = event.data.arguments as Record<string, unknown>;
			for (const val of Object.values(args)) {
				if (typeof val === 'string' && val.length > 3 && (val.includes('/') || val.includes('\\'))) {
					allContentReferences.push({ kind: 'reference', reference: { fsPath: val } });
				}
			}
		}
	}

	private async processJsonRequestsDetails(requests: any[], sessionFile: string, stat: fs.Stats, details: SessionFileDetails): Promise<void> {
		details.interactions = requests.length;
		const timestamps: number[] = [];
		const allContentReferences: any[] = [];

		for (const request of requests) {
			this.processJsonRequest(request, details, timestamps, allContentReferences);
		}

		this.setDetailsTimestamps(details, timestamps, stat);
		details.repository = allContentReferences.length > 0
			? (await this.extractRepositoryFromContentReferences(allContentReferences) ?? '')
			: '';
	}

	private processJsonRequest(request: any, details: SessionFileDetails, timestamps: number[], allContentReferences: any[]): void {
		const ts = request.timestamp || request.ts || request.result?.timestamp;
		if (ts) { timestamps.push(new Date(ts).getTime()); }
		this.analyzeRequestContext(request, details.contextReferences);
		this.analyzeRequestMessage(request.message, details.contextReferences);
		if (request.contentReferences && Array.isArray(request.contentReferences)) { allContentReferences.push(...request.contentReferences); }
		if (request.variableData) { this.processRequestVariableData(request.variableData, details.contextReferences); }
	}

	private analyzeRequestMessage(message: any, contextReferences: any): void {
		if (!message) { return; }
		if (message.text) { this.analyzeContextReferences(message.text, contextReferences); }
		if (message.parts) {
			for (const part of message.parts) { if (part.text) { this.analyzeContextReferences(part.text, contextReferences); } }
		}
	}

	private processRequestVariableData(variableData: any, contextReferences: SessionFileDetails['contextReferences']): void {
		const varDataStr = JSON.stringify(variableData).toLowerCase();
		if (varDataStr.includes('workspace')) { contextReferences.workspace++; }
		if (varDataStr.includes('terminal')) { contextReferences.terminal++; }
		if (varDataStr.includes('vscode')) { contextReferences.vscode++; }
	}

	private setDetailsTimestamps(details: SessionFileDetails, timestamps: number[], stat: fs.Stats): void {
		if (timestamps.length > 0) {
			timestamps.sort((a, b) => a - b);
			details.firstInteraction = new Date(timestamps[0]).toISOString();
			details.lastInteraction = new Date(timestamps[timestamps.length - 1]).toISOString();
		} else {
			details.lastInteraction = stat.mtime.toISOString();
		}
	}

	/**
	 * Detect which editor the session file belongs to based on its path.
	 */
	private detectEditorSource(filePath: string): string {
		return _detectEditorSource(filePath, (p) => this.findEcosystem(p)?.id === 'opencode');
	}

	/**
	 * Extract full session log data including chat turns for the log viewer.
	 */
	private async getSessionLogData(sessionFile: string): Promise<SessionLogData> {
		const details = await this.getSessionFileDetails(sessionFile);
		let subAgentsStarted: number | undefined;
		let turns: ChatTurn[] = [];

		try {
			const eco = this.findEcosystem(sessionFile);
			if (eco?.buildTurns) {
				const result = await eco.buildTurns(sessionFile);
				return this.buildBaseLogData(details, result.turns, undefined, undefined, eco, sessionFile, result.actualTokens);
			}

			const fileContent = await fs.promises.readFile(sessionFile, 'utf8');
			if (this.isUuidPointerFile(fileContent)) {
				return this.buildBaseLogData(details, [], undefined);
			}

			const isJsonlContent = sessionFile.endsWith('.jsonl') || this.isJsonlContent(fileContent);
			if (isJsonlContent) {
				const lines = fileContent.trim().split('\n').filter(l => l.trim());
				const isDeltaBased = this.detectIsDeltaBased(lines);
				if (isDeltaBased) {
					turns = await this.buildDeltaJsonlTurns(lines);
				} else {
					const cliResult = await this.buildCliJsonlTurns(lines, sessionFile, fileContent);
					turns = cliResult.turns;
					subAgentsStarted = cliResult.subAgentsStarted;
				}
			} else {
				const sessionContent = JSON.parse(fileContent);
				turns = this.buildJsonSessionTurns(sessionContent);
			}
		} catch (error) {
			this.warn(`Error extracting chat turns from ${sessionFile}: ${error}`);
		}

		let usageAnalysis: SessionUsageAnalysis | undefined;
		try {
			const mtimeMs = new Date(details.modified).getTime();
			usageAnalysis = await this.getUsageAnalysisFromSessionCached(sessionFile, mtimeMs, details.size);
		} catch (usageError) {
			this.warn(`Error loading usage analysis for ${sessionFile}: ${usageError}`);
		}

		const sessionCache = this.getCachedSessionData(sessionFile);
		return this.buildBaseLogData(details, turns, usageAnalysis, sessionCache, undefined, undefined, undefined, subAgentsStarted);
	}

	private buildBaseLogData(
		details: SessionFileDetails,
		turns: ChatTurn[],
		usageAnalysis: SessionUsageAnalysis | undefined,
		sessionCache?: SessionFileCache | null,
		eco?: IEcosystemAdapter | null,
		sessionFile?: string,
		ecoActualTokens?: number,
		subAgentsStarted?: number
	): SessionLogData {
		const editorName = details.editorName || (eco && sessionFile ? getEcosystemDisplayName(eco, sessionFile) : details.editorSource);
		const actualTokens = ecoActualTokens ?? sessionCache?.actualTokens ?? 0;
		return {
			file: details.file, title: details.title || null, editorSource: details.editorSource,
			editorName, size: details.size, modified: details.modified, interactions: details.interactions,
			contextReferences: details.contextReferences, firstInteraction: details.firstInteraction,
			lastInteraction: details.lastInteraction, turns, usageAnalysis, actualTokens,
			...(details.parentInfo ? { parentInfo: details.parentInfo } : {}),
			...(details.childInfo ? { childInfo: details.childInfo, totalChildCount: details.totalChildCount } : {}),
			...this.buildLogDataCacheFields(sessionCache, subAgentsStarted),
		};
	}

	private buildLogDataCacheFields(sessionCache: SessionFileCache | null | undefined, subAgentsStarted?: number): Partial<SessionLogData> {
		return {
			...(sessionCache?.cacheReadTokens ? { cachedTokens: sessionCache.cacheReadTokens } : {}),
			...(subAgentsStarted !== undefined ? { subAgentsStarted } : {}),
			...(sessionCache?.debugLogInputTokens !== undefined ? { debugLogInputTokens: sessionCache.debugLogInputTokens } : {}),
			...(sessionCache?.debugLogOutputTokens !== undefined ? { debugLogOutputTokens: sessionCache.debugLogOutputTokens } : {}),
			...(sessionCache?.modelTurns !== undefined ? { modelTurns: sessionCache.modelTurns } : {}),
			...(sessionCache?.truncationCount ? { truncationCount: sessionCache.truncationCount, messagesRemovedByTruncation: sessionCache.messagesRemovedByTruncation } : {}),
		};
	}

	private detectIsDeltaBased(lines: string[]): boolean {
		if (lines.length === 0) { return false; }
		try {
			const firstLine = JSON.parse(lines[0]);
			return firstLine && typeof firstLine.kind === 'number';
		} catch { return false; }
	}

	private async buildDeltaJsonlTurns(lines: string[]): Promise<ChatTurn[]> {
		const turns: ChatTurn[] = [];
		const { sessionState } = await _reconstructJsonlStateAsync(lines);
		const { effortByRequestId } = _buildReasoningEffortTimeline(lines);
		const rawUsageFallback = this.extractPerRequestUsageFromRawLines(lines);

		let sessionMode: 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent' = 'ask';
		let currentModel: string | null = null;
		if (sessionState.inputState?.mode) {
			sessionMode = this.getModeType(sessionState.inputState.mode);
			if (sessionState.inputState?.selectedModel?.metadata?.id) {
				currentModel = sessionState.inputState.selectedModel.metadata.id;
			}
		}

		const requests = sessionState.requests || [];
		for (let i = 0; i < requests.length; i++) {
			const request = requests[i];
			if (!request || !request.requestId) { continue; }
			const turn = this.buildDeltaTurn(i, request, sessionMode, currentModel, effortByRequestId, rawUsageFallback);
			turns.push(turn);
		}
		return turns;
	}

	private buildDeltaTurn(i: number, request: any, sessionMode: 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent', currentModel: string | null, effortByRequestId: Map<string, string>, rawUsageFallback: Map<number, { promptTokens: number; outputTokens: number }>): ChatTurn {
		const contextRefs = this.createEmptyContextRefs();
		const userMessage = request.message?.text || '';
		this.analyzeRequestContext(request, contextRefs);
		const requestModel = request.modelId || currentModel || this.getModelFromRequest(request) || 'gpt-4';
		const { responseText, thinkingText, toolCalls, mcpTools } = this.extractResponseData(request.response || []);
		const actualUsage = this.extractActualUsageFromRequest(request, rawUsageFallback, i);
		return {
			turnNumber: i + 1,
			timestamp: request.timestamp ? new Date(request.timestamp).toISOString() : null,
			mode: sessionMode, userMessage, assistantResponse: responseText, model: requestModel,
			toolCalls, contextReferences: contextRefs, mcpTools,
			inputTokensEstimate: this.estimateTokensFromText(userMessage, requestModel),
			outputTokensEstimate: this.estimateTokensFromText(responseText, requestModel),
			thinkingTokensEstimate: this.estimateTokensFromText(thinkingText, requestModel),
			actualUsage, thinkingEffort: effortByRequestId.get(request.requestId)
		};
	}

	private extractActualUsageFromRequest(request: any, rawUsageFallback: Map<number, { promptTokens: number; outputTokens: number }>, index: number): ActualUsage | undefined {
		const resultDetails = typeof request.result?.details === 'string' ? request.result.details : undefined;
		if (request.result?.usage) {
			return this.extractUsageFromResultUsage(request.result.usage, resultDetails);
		}
		if (typeof request.result?.promptTokens === 'number' && typeof request.result?.outputTokens === 'number') {
			return { completionTokens: request.result.outputTokens, promptTokens: request.result.promptTokens, details: resultDetails };
		}
		const meta = request.result?.metadata;
		if (meta && typeof meta.promptTokens === 'number' && typeof meta.outputTokens === 'number') {
			return { completionTokens: meta.outputTokens, promptTokens: meta.promptTokens, details: resultDetails };
		}
		const extracted = rawUsageFallback.get(index);
		if (extracted) { return { completionTokens: extracted.outputTokens, promptTokens: extracted.promptTokens }; }
		return undefined;
	}

	private extractUsageFromResultUsage(u: any, details: string | undefined): ActualUsage {
		return {
			completionTokens: typeof u.completionTokens === 'number' ? u.completionTokens : 0,
			promptTokens: typeof u.promptTokens === 'number' ? u.promptTokens : 0,
			promptTokenDetails: Array.isArray(u.promptTokenDetails) ? u.promptTokenDetails : undefined,
			details
		};
	}

	private async buildCliJsonlTurns(lines: string[], sessionFile: string, fileContent: string): Promise<{ turns: ChatTurn[]; subAgentsStarted: number | undefined }> {
		const turns: ChatTurn[] = [];
		let subAgentsStarted: number | undefined;
		const isJetBrainsFile = isJetBrainsSessionPath(sessionFile);
		const jetBrainsModelHint: string | null = isJetBrainsFile ? detectJetBrainsModelHintFromContent(fileContent) : null;
		let cliSessionModel = isJetBrainsFile ? (jetBrainsModelHint || 'unknown') : 'unknown';
		let cliSessionEffort: string | undefined;

		cliSessionModel = this.detectCliSessionModel(lines, isJetBrainsFile, jetBrainsModelHint, cliSessionModel);
		const modelRef = { value: cliSessionModel };
		const effortRef = { value: cliSessionEffort };

		const subAgentOutputTokenMap = new Map<string, number>();
		let turnNumber = 0;

		for (const line of lines) {
			try {
				const event = JSON.parse(line);
				const result = this.processCliEventForTurns(event, turns, modelRef, effortRef, isJetBrainsFile, jetBrainsModelHint, turnNumber, subAgentOutputTokenMap);
				if (result.turnAdded) { turnNumber++; }
				if (result.subAgentStarted) { subAgentsStarted = (subAgentsStarted ?? 0) + 1; }
			} catch { /* skip malformed */ }
		}

		this.attachSubAgentTokens(turns, subAgentOutputTokenMap, modelRef.value);
		return { turns, subAgentsStarted };
	}

	private detectCliSessionModel(lines: string[], isJetBrainsFile: boolean, jetBrainsModelHint: string | null, defaultModel: string): string {
		if (isJetBrainsFile && jetBrainsModelHint) { return jetBrainsModelHint; }
		for (const line of lines) {
			try {
				const model = this.pickModelFromCliEvent(JSON.parse(line));
				if (model) { return model; }
			} catch { /* skip */ }
		}
		return defaultModel;
	}

	private pickModelFromCliEvent(ev: any): string | null {
		if (ev.type === 'session.start' && ev.data) {
			return ev.data.selectedModel || ev.data.model || null;
		}
		if (ev.type === 'session.model_change') { return ev.data?.newModel || null; }
		const modelEventTypes = ['assistant.message', 'tool.execution_complete', 'assistant.turn_start'];
		if (modelEventTypes.includes(ev.type)) { return ev.data?.model || null; }
		return null;
	}

	private processCliEventForTurns(event: any, turns: ChatTurn[], modelRef: { value: string }, effortRef: { value: string | undefined }, isJetBrainsFile: boolean, jetBrainsModelHint: string | null, turnNumber: number, subAgentOutputTokenMap: Map<string, number>): { turnAdded: boolean; subAgentStarted: boolean } {
		const subAgentStarted = event.type === 'subagent.started';
		let turnAdded = false;
		if (event.type === 'session.model_change') { this.updateCliSessionRefs(event, modelRef, effortRef); }
		if (event.type === 'user.message' && event.data?.content) {
			turns.push(this.buildCliUserTurn(event, turnNumber + 1, modelRef.value, isJetBrainsFile, jetBrainsModelHint, turnNumber + 1, effortRef.value));
			turnAdded = true;
		}
		if (event.type === 'assistant.message' && event.data?.content) {
			this.updateCliAssistantTurn(event, turns, modelRef.value, subAgentOutputTokenMap);
		}
		if (this.isCliToolEvent(event) && turns.length > 0) { this.addCliToolCall(event, turns[turns.length - 1], isJetBrainsFile); }
		if (event.type === 'mcp.tool.call' || event.data?.mcpServer) { this.handleCliMcpEvent(event, turns); }
		return { turnAdded, subAgentStarted };
	}

	private handleCliMcpEvent(event: any, turns: ChatTurn[]): void {
		if (turns.length === 0) { return; }
		turns[turns.length - 1].mcpTools.push({ server: event.data?.mcpServer || 'unknown', tool: event.data?.toolName || event.toolName || 'unknown' });
	}

	private updateCliSessionRefs(event: any, modelRef: { value: string }, effortRef: { value: string | undefined }): void {
		if (typeof event.data?.newModel === 'string') { modelRef.value = event.data.newModel; }
		if (typeof event.data?.reasoningEffort === 'string') { effortRef.value = event.data.reasoningEffort; }
	}

	private isCliToolEvent(event: any): boolean {
		return (event.type === 'tool.call' || event.type === 'tool.result' || event.type === 'tool.execution_start') && !event.data?.parentToolCallId;
	}

	private buildCliUserTurn(event: any, turnNumber: number, cliSessionModel: string, isJetBrainsFile: boolean, jetBrainsModelHint: string | null, localTurnNumber: number, cliSessionEffort: string | undefined): ChatTurn {
		const contextRefs = this.createEmptyContextRefs();
		const userMessage = event.data.content;
		this.analyzeContextReferences(userMessage, contextRefs);
		const turnModel = this.resolveCliTurnModel(event, cliSessionModel, isJetBrainsFile, jetBrainsModelHint, localTurnNumber);
		const turnEffort = typeof event.data?.reasoningEffort === 'string' ? event.data.reasoningEffort : cliSessionEffort;
		return {
			turnNumber, timestamp: event.timestamp ? new Date(event.timestamp).toISOString() : null,
			mode: isJetBrainsFile ? 'ask' : 'cli', userMessage, assistantResponse: '', model: turnModel,
			toolCalls: [], contextReferences: contextRefs, mcpTools: [],
			inputTokensEstimate: this.estimateTokensFromText(userMessage, turnModel),
			outputTokensEstimate: 0, thinkingTokensEstimate: 0, thinkingEffort: turnEffort
		};
	}

	private resolveCliTurnModel(event: any, cliSessionModel: string, isJetBrainsFile: boolean, jetBrainsModelHint: string | null, turnNumber: number): string {
		if (!isJetBrainsFile) { return event.model || event.data?.model || cliSessionModel; }
		if (turnNumber !== 1) { return '?'; }
		return jetBrainsModelHint && jetBrainsModelHint !== 'unknown' ? `${jetBrainsModelHint}?` : '?';
	}

	private updateCliAssistantTurn(event: any, turns: ChatTurn[], cliSessionModel: string, subAgentOutputTokenMap: Map<string, number>): void {
		if (event.data.parentToolCallId) {
			const prev = subAgentOutputTokenMap.get(event.data.parentToolCallId) ?? 0;
			subAgentOutputTokenMap.set(event.data.parentToolCallId, prev + this.estimateTokensFromText(event.data.content, cliSessionModel));
		} else if (turns.length > 0) {
			const lastTurn = turns[turns.length - 1];
			if (typeof event.data.model === 'string') { lastTurn.model = event.data.model; }
			lastTurn.assistantResponse += event.data.content;
			lastTurn.outputTokensEstimate = this.estimateTokensFromText(lastTurn.assistantResponse, lastTurn.model || cliSessionModel);
		}
	}

	private addCliToolCall(event: any, lastTurn: ChatTurn, isJetBrainsFile: boolean): void {
		const CLI_SUB_AGENT_TOOLS = new Set(['task', 'read_agent', 'write_agent', 'list_agents']);
		const toolName = event.data?.toolName || event.toolName || 'unknown';
		const isSubAgent = CLI_SUB_AGENT_TOOLS.has(toolName);
		if (isJetBrainsFile && event.type === 'tool.execution_start') { lastTurn.mode = 'agent'; }
		if (this.isMcpTool(toolName)) {
			lastTurn.mcpTools.push({ server: this.extractMcpServerName(toolName), tool: toolName });
		} else if (isSubAgent) {
			this.addSubAgentToolCall(event, lastTurn, toolName);
		} else {
			this.addRegularToolCall(event, lastTurn, toolName);
		}
	}

	private addSubAgentToolCall(event: any, lastTurn: ChatTurn, toolName: string): void {
		const entry: any = { toolName, arguments: event.data?.arguments ? JSON.stringify(event.data.arguments) : undefined, result: undefined, isSubAgent: true };
		if (event.data?.toolCallId) { entry._callId = event.data.toolCallId; }
		lastTurn.toolCalls.push(entry);
	}

	private addRegularToolCall(event: any, lastTurn: ChatTurn, toolName: string): void {
		const callId = event.data?.toolCallId;
		if (callId && lastTurn.toolCalls.some((tc: any) => tc._callId === callId)) { return; }
		const tc: any = {
			toolName,
			arguments: event.type !== 'tool.result' ? JSON.stringify(event.data?.arguments || {}) : undefined,
			result: event.type === 'tool.result' ? event.data?.output : undefined
		};
		if (callId) { tc._callId = callId; }
		lastTurn.toolCalls.push(tc);
	}

	private attachSubAgentTokens(turns: ChatTurn[], subAgentOutputTokenMap: Map<string, number>, cliSessionModel: string): void {
		if (subAgentOutputTokenMap.size === 0) { return; }
		for (const turn of turns) {
			for (const tc of turn.toolCalls as any[]) {
				if (!tc.isSubAgent || !tc._callId) { continue; }
				const outputTokens = subAgentOutputTokenMap.get(tc._callId) ?? 0;
				const inputTokens = this.computeSubAgentInputTokens(tc, cliSessionModel);
				if (outputTokens > 0 || inputTokens > 0) { tc.subAgentTokens = { input: inputTokens, output: outputTokens }; }
			}
		}
	}

	private computeSubAgentInputTokens(tc: any, model: string): number {
		if (!tc.arguments) { return 0; }
		try {
			const args = JSON.parse(tc.arguments);
			const prompt = typeof args?.prompt === 'string' ? args.prompt : tc.arguments;
			return this.estimateTokensFromText(prompt, model);
		} catch { return this.estimateTokensFromText(tc.arguments, model); }
	}

	private buildJsonSessionTurns(sessionContent: any): ChatTurn[] {
		if (!sessionContent.requests || !Array.isArray(sessionContent.requests)) { return []; }
		let sessionMode: 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent' = 'ask';
		if (sessionContent.mode) { sessionMode = this.getModeType(sessionContent.mode); }
		return sessionContent.requests.map((request: any, idx: number) => this.buildJsonRequestTurn(request, idx + 1, sessionMode));
	}

	private buildJsonRequestTurn(request: any, turnNumber: number, sessionMode: 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent'): ChatTurn {
		let requestMode = sessionMode;
		if (request.agent?.id) {
			const agentId = request.agent.id.toLowerCase();
			if (agentId.includes('edit')) { requestMode = 'edit'; }
			else if (agentId.includes('agent')) { requestMode = 'agent'; }
		}
		let userMessage = '';
		if (request.message?.text) { userMessage = request.message.text; }
		else if (request.message?.parts) { userMessage = request.message.parts.filter((p: any) => p.text).map((p: any) => p.text).join('\n'); }
		const contextRefs = this.createEmptyContextRefs();
		this.analyzeRequestContext(request, contextRefs);
		const model = this.getModelFromRequest(request);
		let assistantResponse = ''; let thinkingText = '';
		const toolCalls: { toolName: string; arguments?: string; result?: string }[] = [];
		const mcpTools: { server: string; tool: string }[] = [];
		if (request.response && Array.isArray(request.response)) {
			const extracted = this.extractResponseData(request.response);
			assistantResponse = extracted.responseText; thinkingText = extracted.thinkingText;
			toolCalls.push(...extracted.toolCalls); mcpTools.push(...extracted.mcpTools);
		}
		return {
			turnNumber, timestamp: request.timestamp || request.ts || request.result?.timestamp || null,
			mode: requestMode, userMessage, assistantResponse, model, toolCalls, contextReferences: contextRefs, mcpTools,
			inputTokensEstimate: this.estimateTokensFromText(userMessage, model),
			outputTokensEstimate: this.estimateTokensFromText(assistantResponse, model),
			thinkingTokensEstimate: this.estimateTokensFromText(thinkingText, model)
		};
	}

	private createEmptyContextRefs(): ContextReferenceUsage {
		return _createEmptyContextRefs();
	}

	/**
	 * Extract response data from a response array.
	 */
	private extractResponseData(response: any[]): {
		responseText: string;
		thinkingText: string;
		toolCalls: { toolName: string; arguments?: string; result?: string; isSubAgent?: boolean; subAgentModel?: string }[];
		mcpTools: { server: string; tool: string }[];
	} {
		const acc = { responseText: '', thinkingText: '', toolCalls: [] as any[], mcpTools: [] as any[] };
		for (const item of response) {
			if (!item || typeof item !== 'object') { continue; }
			this.processResponseItem(item, acc);
		}
		return acc;
	}

	private processResponseItem(item: any, acc: { responseText: string; thinkingText: string; toolCalls: any[]; mcpTools: any[] }): void {
		const { text, isThinking } = _extractResponseItemText(item);
		if (text) { if (isThinking) { acc.thinkingText += text; } else { acc.responseText += text; } }
		if (item.kind === 'toolInvocationSerialized' || item.kind === 'prepareToolInvocation') {
			this.handleToolInvocationItem(item, acc.toolCalls, acc.mcpTools);
		}
		if (item.kind === 'mcpServersStarting' && item.didStartServerIds) {
			for (const serverId of item.didStartServerIds) { acc.mcpTools.push({ server: serverId, tool: 'start' }); }
		}
	}

	private handleToolInvocationItem(item: any, toolCalls: { toolName: string; arguments?: string; result?: string; isSubAgent?: boolean; subAgentModel?: string }[], mcpTools: { server: string; tool: string }[]): void {
		const subAgentData = _extractSubAgentData(item);
		if (subAgentData) {
			toolCalls.push({
				toolName: (item.toolSpecificData?.agentName as string | undefined) || 'Sub-Agent',
				arguments: subAgentData.prompt || undefined, result: undefined,
				isSubAgent: true, subAgentModel: subAgentData.modelName || undefined,
			});
			return;
		}
		const toolName = this.resolveToolInvocationName(item);
		if (this.isMcpTool(toolName)) {
			mcpTools.push({ server: this.extractMcpServerName(toolName), tool: toolName });
		} else {
			toolCalls.push({ toolName, arguments: item.input ? JSON.stringify(item.input) : undefined, result: this.formatToolResult(item.result) });
		}
	}

	private resolveToolInvocationName(item: any): string {
		return item.toolId || item.toolName || item.invocationMessage?.toolName || item.toolSpecificData?.kind || 'unknown';
	}

	private formatToolResult(result: any): string | undefined {
		if (!result) { return undefined; }
		return typeof result === 'string' ? result : JSON.stringify(result);
	}

	public calculateEstimatedCost(modelUsage: ModelUsage, pricingSource: 'provider' | 'copilot' = 'provider'): number {
		return _calculateEstimatedCost(modelUsage, this.modelPricing, pricingSource);
	}







	private async estimateTokensFromSession(sessionFilePath: string, preloadedContent?: string, preloadedParsedJson?: any): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number; cacheReadTokens?: number }> {
		try {
			const eco = this.findEcosystem(sessionFilePath);
			if (eco) { return eco.getTokens(sessionFilePath); }
			if (this.windsurf.isWindsurfSessionFile(sessionFilePath)) {
				const session = await this.windsurf.resolveSession(sessionFilePath);
				const tokens = session?.tokens ?? 0;
				return { tokens, thinkingTokens: 0, actualTokens: tokens, cacheReadTokens: session?.cachedTokens };
			}
			const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFilePath, 'utf8');
			if (this.isUuidPointerFile(fileContent)) { return { tokens: 0, thinkingTokens: 0, actualTokens: 0 }; }
			if (sessionFilePath.endsWith('.jsonl') || this.isJsonlContent(fileContent)) {
				return this.estimateTokensFromJsonlSession(fileContent);
			}
			const sessionContent = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
			return this.estimateTokensFromJsonSession(sessionContent);
		} catch (error) {
			this.warn(`Error parsing session file ${sessionFilePath}: ${error}`);
			return { tokens: 0, thinkingTokens: 0, actualTokens: 0 };
		}
	}

	private estimateTokensFromJsonSession(sessionContent: any): { tokens: number; thinkingTokens: number; actualTokens: number } {
		let totalInputTokens = 0; let totalOutputTokens = 0; let totalThinkingTokens = 0; let totalActualTokens = 0;
		if (!sessionContent.requests || !Array.isArray(sessionContent.requests)) {
			return { tokens: 0, thinkingTokens: 0, actualTokens: 0 };
		}
		for (const request of sessionContent.requests) {
			totalInputTokens += this.estimateRequestInputTokens(request);
			const { output, thinking } = this.estimateRequestOutputTokens(request);
			totalOutputTokens += output; totalThinkingTokens += thinking;
			totalActualTokens += this.extractActualTokensFromRequest(request);
		}
		return { tokens: totalInputTokens + totalOutputTokens + totalThinkingTokens, thinkingTokens: totalThinkingTokens, actualTokens: totalActualTokens };
	}

	private estimateRequestInputTokens(request: any): number {
		let tokens = 0;
		if (request.message?.parts) {
			for (const part of request.message.parts) {
				if (part.text) { tokens += this.estimateTokensFromText(part.text); }
			}
		}
		return tokens;
	}

	private estimateRequestOutputTokens(request: any): { output: number; thinking: number } {
		let output = 0; let thinking = 0;
		if (!request.response || !Array.isArray(request.response)) { return { output, thinking }; }
		const model = this.getModelFromRequest(request);
		for (const responseItem of request.response) {
			const subAgent = _extractSubAgentData(responseItem);
			if (subAgent) {
				const saModel = subAgent.modelName || model;
				output += this.estimateSubAgentTokens(subAgent, saModel);
				continue;
			}
			const { text, isThinking } = _extractResponseItemText(responseItem);
			if (!text) { continue; }
			if (isThinking) { thinking += this.estimateTokensFromText(text, model); }
			else { output += this.estimateTokensFromText(text, model); }
		}
		return { output, thinking };
	}

	private estimateSubAgentTokens(subAgent: { prompt?: string; result?: string }, model: string): number {
		let tokens = 0;
		if (subAgent.prompt) { tokens += this.estimateTokensFromText(subAgent.prompt, model); }
		if (subAgent.result) { tokens += this.estimateTokensFromText(subAgent.result, model); }
		return tokens;
	}

	private extractActualTokensFromRequest(request: any): number {
		if (request.result?.usage) {
			const u = request.result.usage;
			return (typeof u.promptTokens === 'number' ? u.promptTokens : 0) + (typeof u.completionTokens === 'number' ? u.completionTokens : 0);
		}
		if (typeof request.result?.promptTokens === 'number' && typeof request.result?.outputTokens === 'number') {
			return request.result.promptTokens + request.result.outputTokens;
		}
		const meta = request.result?.metadata;
		if (meta && typeof meta.promptTokens === 'number' && typeof meta.outputTokens === 'number') {
			return meta.promptTokens + meta.outputTokens;
		}
		return 0;
	}

	private estimateTokensFromJsonlSession(fileContent: string): { tokens: number; thinkingTokens: number; actualTokens: number; cacheReadTokens: number; copilotNanoAiu: number; truncationCount?: number; messagesRemovedByTruncation?: number } {
		return _estimateTokensFromJsonlSession(fileContent);
	}

	/**
	 * Read all token counts from the Copilot Chat debug log companion file for
	 * a given chat session. The debug log lives at:
	 *   `{workspaceStorage}/{hash}/{extension}/debug-logs/{sessionId}/main.jsonl`
	 * where `{extension}` is one of the GitHub.copilot-chat / GitHub.copilot variants.
	 *
	 * Returns null when no debug log is found or it contains no `llm_request` events.
	 * When found, sums `inputTokens`, `outputTokens`, and `cachedTokens` across every
	 * `llm_request` event to give true totals for agent-mode multi-call sessions.
	 */
	private async readTokensFromDebugLog(sessionFilePath: string): Promise<{ inputTokens: number; outputTokens: number; cachedTokens: number; modelTurns: number; modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }>; copilotNanoAiu: number } | null> {
		const norm = _normalizePath(sessionFilePath);
		const sessionId = path.basename(sessionFilePath, path.extname(sessionFilePath));
		// Only process UUID-named session files (e.g. e84b3e82-c1fb-43de-8f52-367f4c74826a)
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
			return null;
		}
		// Derive the workspaceStorage/<hash> directory from the session file path
		const wsHashMatch = norm.match(/^(.*\/workspaceStorage\/[^/]+)\//);
		if (!wsHashMatch) { return null; }
		const workspaceHashDir = sessionFilePath.substring(0, wsHashMatch[1].length);

		const extensionFolders = ['GitHub.copilot-chat', 'github.copilot-chat', 'GitHub.copilot', 'github.copilot'];
		for (const extFolder of extensionFolders) {
			const debugLogPath = path.join(workspaceHashDir, extFolder, 'debug-logs', sessionId, 'main.jsonl');
			try {
				const content = await fs.promises.readFile(debugLogPath, 'utf8');
				const result = _extractAllTokensFromDebugLog(content);
				if (result) { return result; }
			} catch { /* file doesn't exist or can't be read — try next variant */ }
		}
		return null;
	}

	private extractPerRequestUsageFromRawLines(lines: string[]): Map<number, { promptTokens: number; outputTokens: number }> {
		return _extractPerRequestUsageFromRawLines(lines);
	}








	public getModelFromRequest(request: any): string {
		return _getModelFromRequest(request, this.modelPricing);
	}

	private isJsonlContent(content: string): boolean {
		return _isJsonlContent(content);
	}

	private isUuidPointerFile(content: string): boolean {
		return _isUuidPointerFile(content);
	}

	private applyDelta(state: any, delta: any): any {
		return _applyDelta(state, delta);
	}


	public estimateTokensFromText(text: string, model: string = 'gpt-4'): number {
		return _estimateTokensFromText(text, model, this.tokenEstimators);
	}

	public async showDetails(): Promise<void> {
		this.log('📊 Opening Details panel');

		// If panel already exists, just reveal it
		if (this.detailsPanel) {
			this.detailsPanel.reveal();
			this.log('📊 Details panel revealed (already exists)');
			return;
		}

		// Log environment context to help diagnose blank-panel issues
		this.log(`📊 Creating Details panel (uiKind=${vscode.env.uiKind === vscode.UIKind.Desktop ? 'Desktop' : 'Web'}, remote=${vscode.env.remoteName || 'none'})`);

		// Create a small webview panel
		this.detailsPanel = vscode.window.createWebviewPanel(
			'copilotTokenDetails',
			'AI Engineering Fluency',
			{
				viewColumn: vscode.ViewColumn.One,
				preserveFocus: true
			},
			{
				enableScripts: true,
				retainContextWhenHidden: false,
				localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist'), vscode.Uri.joinPath(this.extensionUri, 'media')]
			}
		);

		this.log('✅ Details panel created successfully');

		// Track when the panel becomes active or inactive
		this.detailsPanel.onDidChangeViewState((e) => { this.log(`📊 Details panel view state changed: active=${e.webviewPanel.active}, visible=${e.webviewPanel.visible}`); });

		// Handle messages from the webview
		this.detailsPanel.webview.onDidReceiveMessage(async (message) => {
			if (this.handleLocalViewRegressionMessage(message)) { return; }
			if (await this.dispatchSharedCommand(message)) { return; }
			switch (message.command) {
				case 'refresh':
					await this.dispatch('refresh:details', () => this.refreshDetailsPanel());
					break;
				case 'saveSortSettings':
					await this.dispatch('saveSortSettings:details', () =>
						this.context.globalState.update('details.sortSettings', message.settings)
					);
					break;
			}
		});

		// Handle panel disposal
		this.detailsPanel.onDidDispose(() => {
			this.log('📊 Details panel closed');
			this.detailsPanel = undefined;
			this._detailsPanelIsLoading = false;
		});

		// Use cached stats if available, otherwise show loading screen while calculating
		let stats = this.lastDetailedStats;
		if (!stats) {
			this.log('No cached stats — showing loading screen while calculating...');
			this._detailsPanelIsLoading = true;
			this.statusBarItem.tooltip = 'AI Engineering Fluency — loading in panel…';
			this.detailsPanel.webview.html = this.getLoadingHtml(this.detailsPanel.webview);

			stats = await this.updateTokenStats();

			this._detailsPanelIsLoading = false;
			if (!stats || !this.detailsPanel) {
				return;
			}
		}

		// Set the HTML content
		try {
			this.detailsPanel.webview.html = this.getDetailsHtml(this.detailsPanel.webview, stats);
			this.log('✅ Details panel HTML set successfully');
		} catch (err) {
			this.error('❌ Failed to set Details panel HTML', err);
		}
	}

	public async showEnvironmental(): Promise<void> {
		this.log('🌿 Opening Environmental Impact view');

		if (this.environmentalPanel) {
			this.environmentalPanel.reveal();
			this.log('🌿 Environmental Impact view revealed (already exists)');
			return;
		}

		let stats = this.lastDetailedStats;
		if (!stats) {
			stats = await this.updateTokenStats();
			if (!stats) {
				return;
			}
		}

		this.environmentalPanel = vscode.window.createWebviewPanel(
			'copilotEnvironmental',
			'Environmental Impact',
			{ viewColumn: vscode.ViewColumn.One, preserveFocus: true },
			{
				enableScripts: true,
				retainContextWhenHidden: false,
				localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')]
			}
		);

		this.environmentalPanel.webview.onDidReceiveMessage(async (message) => {
			if (this.handleLocalViewRegressionMessage(message)) { return; }
			if (await this.dispatchSharedCommand(message)) { return; }
			if (message.command === 'refresh') {
				await this.dispatch('refresh:environmental', async () => {
					const refreshed = await this.updateTokenStats();
					if (refreshed && this.environmentalPanel) {
						this.environmentalPanel.webview.html = this.getEnvironmentalHtml(this.environmentalPanel.webview, refreshed);
					}
				});
			}
		});

		this.environmentalPanel.webview.html = this.getEnvironmentalHtml(this.environmentalPanel.webview, stats);

		this.environmentalPanel.onDidDispose(() => {
			this.log('🌿 Environmental Impact view closed');
			this.environmentalPanel = undefined;
		});
	}

	private getEnvironmentalHtml(webview: vscode.Webview, stats: DetailedStats): string {
		const nonce = getNonce();
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview', 'environmental.js')
		);

		const dataWithBackend = {
			...stats,
			backendConfigured: this.isBackendConfigured(),
			compactNumbers: this.getCompactNumbersSetting(),
		};
		const initialData = JSON.stringify(dataWithBackend).replace(/</g, '\\u003c');

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>Environmental Impact</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_ENVIRONMENTAL__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			${this.getLocalViewRegressionProbeScript('environmental', nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	public async showChart(): Promise<void> {
		this.log('📈 Opening Chart view');

		// If panel already exists, just reveal it
		if (this.chartPanel) {
			this.chartPanel.reveal();
			this.log('📈 Chart view revealed (already exists)');
			return;
		}

		// Open the panel IMMEDIATELY with whatever daily stats are already in memory.
		// Full-year data (needed for Week/Month views) is computed in the background below.
		const hasFullData = !!this.lastFullDailyStats;
		const initialStats = this.lastFullDailyStats ?? this.lastDailyStats ?? [];

		// Create webview panel now so the tab appears without waiting for I/O
		this.chartPanel = vscode.window.createWebviewPanel(
			'copilotTokenChart',
			'Token Usage Over Time',
			{
				viewColumn: vscode.ViewColumn.One,
				preserveFocus: true
			},
			{
				enableScripts: true,
				retainContextWhenHidden: false,
				localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')]
			}
		);

		this.log('✅ Chart view created successfully');

		// Handle messages from the webview
		this.chartPanel.webview.onDidReceiveMessage(async (message) => {
			if (this.handleLocalViewRegressionMessage(message)) { return; }
			if (await this.dispatchSharedCommand(message)) { return; }
			if (message.command === 'refresh') { await this.dispatch('refresh:chart', () => this.refreshChartPanel()); }
			if (message.command === 'setPeriodPreference') { this.setChartPeriodPreference(message.period); }
			if (message.command === 'setViewPreference') { this.setChartViewPreference(message); }
		});

		// Render immediately; Week/Month buttons are shown as loading if full-year data isn't ready
		this.chartPanel.webview.html = this.getChartHtml(this.chartPanel.webview, initialStats, hasFullData);

		// Handle panel disposal
		this.chartPanel.onDidDispose(() => {
			this.log('📈 Chart view closed');
			this.chartPanel = undefined;
		});

		// If we only have 30-day data, compute the full year in the background and push an update
		if (!hasFullData) {
			const fullStats = await this.calculateDailyStats();
			if (this.chartPanel) {
				void this.chartPanel.webview.postMessage({
					command: 'updateChartData',
					data: { ...this.buildChartData(fullStats), periodsReady: true, compactNumbers: this.getCompactNumbersSetting() }
				});
			}
		}
	}

	private setChartPeriodPreference(period: string): void {
		if (period === 'day' || period === 'week' || period === 'month') { this.lastChartPeriod = period; }
	}

	private setChartViewPreference(message: any): void {
		const v = message.view;
		if (v === 'total' || v === 'model' || v === 'editor' || v === 'repository' || v === 'cost') { this.lastChartView = v; }
		if (typeof message.metric === 'string') { this.lastChartMetric = message.metric; }
		if (typeof message.split === 'string') { this.lastChartSplit = message.split; }
	}

	public async showUsageAnalysis(): Promise<void> {
		this.log('📊 Opening Usage Analysis dashboard');
		if (this.analysisPanel) {
			this.log('📊 Closing existing panel to refresh data...');
			this.analysisPanel.dispose();
			this.analysisPanel = undefined;
		}
		this.analysisPanel = vscode.window.createWebviewPanel(
			'copilotUsageAnalysis', 'AI Usage Analysis',
			{ viewColumn: vscode.ViewColumn.One, preserveFocus: true },
			{ enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')] }
		);
		this.log('✅ Usage Analysis dashboard created successfully');
		this.analysisPanel.webview.onDidReceiveMessage(async (message) => {
			if (this.handleLocalViewRegressionMessage(message)) { return; }
			if (await this.dispatchSharedCommand(message)) { return; }
			await this.handleAnalysisMessage(message);
		});
		this.analysisPanel.webview.html = this.getUsageAnalysisHtml(this.analysisPanel.webview, this.lastUsageAnalysisStats ?? null);
		if (!this.lastUsageAnalysisStats) { void this.loadAnalysisStatsInBackground(this.analysisPanel); }
		this.analysisPanel.onDidDispose(() => { this.log('📊 Usage Analysis dashboard closed'); this.analysisPanel = undefined; });
	}

	/** Opens the Usage Analysis panel and immediately activates the Insights tab. */
	public async showUsageAnalysisOnInsightsTab(): Promise<void> {
		await this.showUsageAnalysis();
		void this.analysisPanel?.webview.postMessage({ command: 'switchTab', tab: 'insights' });
	}

	private async handleAnalysisMessage(message: any): Promise<void> {
		switch (message.command) {
			case 'refresh':
				await this.dispatch('refresh:analysis', () => this.refreshAnalysisPanel());
				break;
			case 'analyseRepository':
				await this.dispatch('analyseRepository', () => this.handleAnalyseRepository(message.workspacePath));
				break;
			case 'analyseAllRepositories':
				await this.dispatch('analyseAllRepositories', () => this.handleAnalyseAllRepositories());
				break;
			case 'openCopilotChatWithPrompt':
				await this.dispatch('openCopilotChatWithPrompt', () =>
					vscode.commands.executeCommand('workbench.action.chat.open', { query: message.prompt, isNewChat: true })
				);
				break;
			case 'suppressUnknownTool': {
				const toolName = message.toolName as string;
				if (toolName) {
					// Acknowledge immediately so the webview can remove the item without waiting for the disk write.
					this.analysisPanel?.webview.postMessage({ command: 'toolSuppressed', toolName });
					const config = vscode.workspace.getConfiguration('aiEngineeringFluency');
					const current = config.get<string[]>('suppressedUnknownTools', []);
					if (!current.includes(toolName)) {
						await config.update('suppressedUnknownTools', [...current, toolName], vscode.ConfigurationTarget.Global);
						this.log(`🔇 Suppressed unknown tool: ${toolName}`);
					}
				}
				break;
			}
			case 'loadRepoPrStats':
				await this.dispatch('loadRepoPrStats', () => this.loadRepoPrStats());
				break;
			case 'loadAgentSessions':
				await this.dispatch('loadAgentSessions', () => this.loadAgentSessions());
				break;
			case 'openSessionFile':
				if (message.file) {
					await this.dispatch('openSessionFile:analysis', async () => {
						try { await this.showLogViewer(message.file); }
						catch { vscode.window.showErrorMessage('Could not open log viewer: ' + message.file); }
					});
				}
				break;
			case 'insightAction':
					await this.dispatch('insightAction', () => this.handleInsightAction(message));
					break;
		}
	}

	private async handleInsightAction(message: any): Promise<void> {
		const id = typeof message.id === 'string' ? message.id : '';
		const action = typeof message.action === 'string' ? message.action : '';
		if (!id || !action) { return; }
		const now = new Date().toISOString();
		const existing = this._insightStateBag[id] ?? { status: 'new', firstSurfacedAt: now, lastSurfacedAt: now };
		switch (action) {
			case 'seen':
				if (existing.status === 'new') {
					this._insightStateBag[id] = { ...existing, status: 'seen', lastSurfacedAt: now };
					this.refreshStatusBarInsightBadge(_countNewInsights(this._insightStateBag, now));
				}
				break;
			case 'dismiss':
				this._insightStateBag[id] = { ...existing, status: 'dismissed', lastSurfacedAt: now };
				this.refreshStatusBarInsightBadge(_countNewInsights(this._insightStateBag, now));
				break;
			case 'snooze': {
				const snoozeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
				this._insightStateBag[id] = { ...existing, status: 'snoozed', lastSurfacedAt: now, snoozeUntil };
				this.refreshStatusBarInsightBadge(_countNewInsights(this._insightStateBag, now));
				break;
			}
			case 'done':
				this._insightStateBag[id] = { ...existing, status: 'done', lastSurfacedAt: now };
				this.refreshStatusBarInsightBadge(_countNewInsights(this._insightStateBag, now));
				break;
		}
		await this.context.globalState.update('insights.state', this._insightStateBag);
		// Push refreshed state back to the webview
		if (this.analysisPanel && this.lastUsageAnalysisStats) {
			const cadenceDays = vscode.workspace.getConfiguration('aiEngineeringFluency').get<number>('insights.cadenceDays', 2);
			const ctx = {
				today: this.lastUsageAnalysisStats.today,
				last30Days: this.lastUsageAnalysisStats.last30Days,
				missedPotential: this.lastUsageAnalysisStats.missedPotential ?? [],
				customizationMatrix: this.lastUsageAnalysisStats.customizationMatrix,
			};
			const evaluated = _evaluateInsights(ctx, this._insightStateBag, cadenceDays, this._lastInsightNudgeAt);
			void this.analysisPanel.webview.postMessage({ command: 'updateInsights', insights: evaluated });
		}
	}

	private async loadAnalysisStatsInBackground(panel: vscode.WebviewPanel): Promise<void> {
		try {
			const analysisStats = await this.calculateUsageAnalysisStats(true);
			if (!this.analysisPanel || this.analysisPanel !== panel) { return; }
			void this.analysisPanel.webview.postMessage({
				command: 'updateStats',
				data: {
					today: analysisStats.today, last30Days: analysisStats.last30Days, month: analysisStats.month, lastMonth: analysisStats.lastMonth,
					locale: analysisStats.locale, customizationMatrix: analysisStats.customizationMatrix || null,
					missedPotential: analysisStats.missedPotential || [], lastUpdated: analysisStats.lastUpdated.toISOString(),
					backendConfigured: this.isBackendConfigured(),
					currentWorkspacePaths: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [],
					insights: this.buildCurrentInsights(analysisStats),
				},
			});
		} catch (err) {
			this.error(`Failed to load usage analysis stats: ${err}`);
			if (this.analysisPanel && this.analysisPanel === panel) {
				void this.analysisPanel.webview.postMessage({ command: 'updateStatsError', error: String(err) });
			}
		}
	}

	private async handleAnalyseRepository(workspacePath?: string): Promise<void> {
		if (!this.analysisPanel) {
			return;
		}

		try {
			this.log(`🏗️ Running repository hygiene analysis${workspacePath ? ` for ${workspacePath}` : ''}`);
			const results = await this.runRepoHygieneAnalysis(workspacePath);
			this.analysisPanel.webview.postMessage({
				command: 'repoAnalysisResults',
				data: results,
				workspacePath
			});
			this.log(`✅ Repository hygiene analysis complete${workspacePath ? ` for ${workspacePath}` : ''}`);
		} catch (error) {
			this.error(`Repository analysis failed: ${error}`);
			this.analysisPanel.webview.postMessage({
				command: 'repoAnalysisError',
				error: error instanceof Error ? error.message : String(error),
				workspacePath
			});
		}
	}

	private async handleAnalyseAllRepositories(): Promise<void> {
		if (!this.analysisPanel) {
			return;
		}

		// Get all workspaces from the customization matrix
		const matrix = this._lastCustomizationMatrix;
		if (!matrix || !matrix.workspaces || matrix.workspaces.length === 0) {
			this.warn('No workspaces available for batch analysis');
			this.analysisPanel.webview.postMessage({
				command: 'repoAnalysisBatchComplete'
			});
			return;
		}

		// Filter out unresolved workspaces (those with paths starting with '<unresolved:')
		const workspaces = matrix.workspaces.filter(ws => !ws.workspacePath.startsWith('<unresolved:'));
		
		this.log(`🏗️ Starting batch repository analysis for ${workspaces.length} workspace(s)`);

		// Run analyses in parallel with a concurrency limit
		const CONCURRENCY_LIMIT = 3; // Analyze up to 3 repos at a time
		const analyzeWorkspace = async (workspace: WorkspaceCustomizationRow) => {
			try {
				await this.handleAnalyseRepository(workspace.workspacePath);
			} catch (error) {
				this.warn(`Failed to analyze workspace ${workspace.workspacePath}: ${error}`);
			}
		};

		// Process workspaces in batches
		for (let i = 0; i < workspaces.length; i += CONCURRENCY_LIMIT) {
			const batch = workspaces.slice(i, i + CONCURRENCY_LIMIT);
			await Promise.all(batch.map(analyzeWorkspace));
		}

		this.log(`✅ Batch repository analysis complete for ${workspaces.length} workspace(s)`);
		
		// Notify the webview that all analyses are complete
		this.analysisPanel.webview.postMessage({
			command: 'repoAnalysisBatchComplete'
		});
	}

	private async runRepoHygieneAnalysis(workspacePath?: string): Promise<any> {
		const workspaceRoot = this.resolveWorkspaceRoot(workspacePath);
		const { branchName, repoName } = this.getGitRepoInfo(workspaceRoot);
		const fileTree = await this.getWorkspaceFileTree(workspaceRoot);
		const prompt = this.buildRepoHygienePrompt(repoName, branchName, workspaceRoot, fileTree);
		try {
			const fullResponse = await this.invokeCopilotModel(prompt);
			return this.parseCopilotHygieneResponse(fullResponse);
		} catch (error) {
			this.error(`Failed to get analysis from Copilot: ${error}`);
			throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : String(error)}. Please try again or check that GitHub Copilot is properly configured.`);
		}
	}

	private buildRepoHygienePrompt(repoName: string, branchName: string, workspaceRoot: string, fileTree: string): string {
		return `You are a repository analyzer. Analyze this repository for hygiene and best practices.

Use these skill instructions:

${REPO_HYGIENE_SKILL}

Repository: ${repoName}
Branch: ${branchName}
Workspace root: ${workspaceRoot}

File tree (showing configuration files):
${fileTree}

Perform the 17 hygiene checks as specified in the skill instructions. Return ONLY a valid JSON object matching this exact schema:

{
  "summary": {
    "totalScore": <number>,
    "maxScore": 76,
    "percentage": <number>,
    "passedChecks": <number>,
    "failedChecks": <number>,
    "warningChecks": <number>,
    "totalChecks": 17,
    "categories": {
      "versionControl": { "score": <number>, "maxScore": 13, "percentage": <number> },
      "codeQuality": { "score": <number>, "maxScore": 17, "percentage": <number> },
      "cicd": { "score": <number>, "maxScore": 10, "percentage": <number> },
      "environment": { "score": <number>, "maxScore": 9, "percentage": <number> },
      "documentation": { "score": <number>, "maxScore": 5, "percentage": <number> }
    }
  },
  "checks": [
    {
      "id": "<string>",
      "category": "<versionControl|codeQuality|cicd|environment|documentation>",
      "label": "<string>",
      "status": "<pass|fail|warning>",
      "weight": <number>,
      "found": <boolean>,
      "detail": "<string>",
      "hint": "<string or null>"
    }
  ],
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "category": "<string>",
      "action": "<string>",
      "weight": <number>,
      "impact": "<string>"
    }
  ],
  "metadata": {
    "scanVersion": "1.0.0",
    "timestamp": "${new Date().toISOString()}",
    "repository": "${repoName}",
    "branch": "${branchName}",
    "skillName": "repo-hygiene"
  }
}

Return ONLY the JSON object, no markdown formatting, no explanations.`;
	}

	private async invokeCopilotModel(prompt: string): Promise<string> {
		let models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'auto' });
		if (models.length === 0) {
			models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
		}
		if (models.length === 0) {
			throw new Error('No Copilot models available. Please ensure GitHub Copilot is installed and activated.');
		}
		const model = models[0];
		this.log(`🤖 Using Copilot model: ${model.id} for repository analysis`);
		const cts = new vscode.CancellationTokenSource();
		try {
			const response = await model.sendRequest([vscode.LanguageModelChatMessage.User(prompt)], {}, cts.token);
			let fullResponse = '';
			for await (const chunk of response.text) { fullResponse += chunk; }
			this.log(`📋 Copilot analysis response length: ${fullResponse.length} characters`);
			return fullResponse;
		} finally {
			cts.dispose();
		}
	}

	private resolveWorkspaceRoot(workspacePath?: string): string {
		if (workspacePath) { return workspacePath; }
		const firstFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!firstFolder) { throw new Error('No workspace folder open'); }
		return firstFolder;
	}

	private getGitRepoInfo(workspaceRoot: string): { branchName: string; repoName: string } {
		let branchName = 'unknown';
		let repoName = path.basename(workspaceRoot);
		try {
			branchName = childProcess.execSync('git rev-parse --abbrev-ref HEAD', {
				cwd: workspaceRoot, encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe']
			}).trim();
			try {
				const remote = childProcess.execSync('git remote get-url origin', {
					cwd: workspaceRoot, encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe']
				}).trim();
				const match = remote.match(/[:/]([^/]+\/[^/]+?)(\.git)?$/);
				if (match) { repoName = match[1]; }
			} catch { /* Ignore remote fetch errors */ }
		} catch { /* Ignore git errors */ }
		return { branchName, repoName };
	}

	private parseCopilotHygieneResponse(fullResponse: string): any {
		let jsonText = fullResponse.trim();
		const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
		if (jsonMatch) { jsonText = jsonMatch[1].trim(); }
		const results = JSON.parse(jsonText);
		if (!results.summary || !results.checks || !results.metadata) {
			throw new Error('Invalid response structure from Copilot');
		}
		return results;
	}

	private async getWorkspaceFileTree(workspaceRoot: string): Promise<string> {
		// Get a filtered file tree showing only configuration files
		const configPatterns = [
			'.git', '.gitignore', '.env.example', '.env.sample', '.editorconfig',
			'.eslintrc', 'eslint.config', '.prettierrc', 'prettier.config',
			'tsconfig.json', 'jsconfig.json', 'package.json', 'Makefile',
			'Dockerfile', 'docker-compose', '.github/workflows', '.devcontainer',
			'LICENSE', '.nvmrc', '.node-version'
		];

		try {
			const files: string[] = [];
			const maxDepth = 3;

			const scanDir = (dir: string, depth: number = 0) => {
				if (depth > maxDepth) {
					return;
				}

				try {
					const entries = fs.readdirSync(dir, { withFileTypes: true });
					for (const entry of entries) {
						const fullPath = path.join(dir, entry.name);
						const relativePath = path.relative(workspaceRoot, fullPath);

						// Skip node_modules and other large directories
						if (entry.name === 'node_modules' || entry.name === '.git' || 
						    entry.name === 'dist' || entry.name === 'build' || entry.name === 'out') {
							continue;
						}

						// Check if this file matches any config pattern
						const isConfig = configPatterns.some(pattern => relativePath.includes(pattern));

						if (isConfig) {
							files.push(relativePath);
						}

						if (entry.isDirectory() && depth < maxDepth) {
							scanDir(fullPath, depth + 1);
						}
					}
				} catch (error) {
					// Ignore permission errors
				}
			};

			scanDir(workspaceRoot);

			return files.length > 0 ? files.join('\n') : '(No configuration files detected)';
		} catch (error) {
			return '(Unable to scan workspace)';
		}
	}

	public async showLogViewer(sessionFilePath: string): Promise<void> {
		if (this.windsurf.isWindsurfSessionFile(sessionFilePath)) {
			const trajectoryId = sessionFilePath.replace('windsurf://trajectory/', '');
			const pbPath = path.join(os.homedir(), '.codeium', 'windsurf', 'cascade', `${trajectoryId}.pb`);
			vscode.window.showInformationMessage(
				`Windsurf sessions are stored as binary protobuf files and cannot be viewed as text. The session file is: ${pbPath}`,
				'Reveal in Explorer'
			).then(choice => {
				if (choice === 'Reveal in Explorer') {
					vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pbPath));
				}
			});
			return;
		}
		if (this.logViewerPanel) { this.logViewerPanel.dispose(); this.logViewerPanel = undefined; }
		const logData = await this.getSessionLogData(sessionFilePath);
		this.logViewerSessionFilePath = sessionFilePath;
		this.logViewerCurrentData = logData;
		this.logViewerPanel = vscode.window.createWebviewPanel(
			'copilotLogViewer', `Session: ${logData.title || path.basename(sessionFilePath)}`,
			{ viewColumn: vscode.ViewColumn.One, preserveFocus: false },
			{ enableScripts: true, retainContextWhenHidden: false, localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')] }
		);
		this.logViewerPanel.webview.html = this.getLogViewerHtml(this.logViewerPanel.webview, logData);
		this.logViewerPanel.webview.onDidReceiveMessage(async (message) => { await this.handleLogViewerMessage(message); });
		this.logViewerPanel.onDidDispose(() => { this.logViewerPanel = undefined; });
	}

	private async handleLogViewerMessage(message: any): Promise<void> {
		if (await this.dispatchSharedCommand(message)) { return; }
		const logData = this.logViewerCurrentData;
		const sessionFilePath = this.logViewerSessionFilePath;
		switch (message.command) {
			case 'openRawFile':
				await this.dispatch('openRawFile:logviewer', () => this.logViewerHandleOpenRawFile(sessionFilePath)); break;
			case 'showToolCallPretty': {
				if (!logData) { break; }
				const { turnNumber, toolCallIdx } = message as { turnNumber: number; toolCallIdx: number };
				try { await this.logViewerShowToolCallPretty(turnNumber, toolCallIdx, logData); }
				catch (err) { this.error('showToolCallPretty: error', err); vscode.window.showErrorMessage('Could not open formatted tool call.'); }
				break;
			}
			case 'revealToolCallSource': {
				if (!logData) { break; }
				const { turnNumber, toolCallIdx } = message as { turnNumber: number; toolCallIdx: number };
				try { await this.logViewerRevealToolCallSource(turnNumber, toolCallIdx, logData, sessionFilePath); }
				catch (err) { this.error('revealToolCallSource: error', err); vscode.window.showErrorMessage('Could not reveal tool call in file.'); }
				break;
			}
			case 'refreshSession': {
				try {
					const newData = await this.getSessionLogData(sessionFilePath);
					this.logViewerCurrentData = newData;
					if (this.logViewerPanel) {
						this.logViewerPanel.webview.html = this.getLogViewerHtml(this.logViewerPanel.webview, newData);
					}
				} catch (err) {
					this.error('refreshSession: error', err);
					vscode.window.showErrorMessage('Could not refresh session data.');
				}
				break;
			}
		}
	}

	private async logViewerHandleOpenRawFile(sessionFilePath: string): Promise<void> {
		try {
			const rawEco = this.findEcosystem(sessionFilePath);
			const rawContent = rawEco?.getRawFileContent?.(sessionFilePath);
			if (rawContent !== undefined) {
				const doc = await vscode.workspace.openTextDocument({ content: rawContent, language: 'json' });
				await vscode.window.showTextDocument(doc);
			} else {
				await vscode.window.showTextDocument(vscode.Uri.file(sessionFilePath));
			}
		} catch { vscode.window.showErrorMessage('Could not open raw file: ' + sessionFilePath); }
	}

	private logViewerSafeParse(text?: string): any {
		if (!text) { return text; }
		try { return JSON.parse(text); } catch { return text; }
	}

	private logViewerMapTurnForContext(t?: ChatTurn): any {
		if (!t) { return undefined; }
		return { turnNumber: t.turnNumber, timestamp: t.timestamp, mode: t.mode, model: t.model, userMessage: t.userMessage, assistantResponse: t.assistantResponse, inputTokensEstimate: t.inputTokensEstimate, outputTokensEstimate: t.outputTokensEstimate, toolCalls: t.toolCalls?.map((tc, idx) => ({ index: idx, toolName: tc.toolName, arguments: tc.arguments, result: tc.result })) };
	}

	private logViewerMapToolCallForContext(tc: { toolName: string; arguments?: string; result?: string }, idx: number, parentTurn?: ChatTurn, fallbackTurnNumber?: number): any {
		return { turn: parentTurn?.turnNumber ?? fallbackTurnNumber, toolCallIdx: idx, toolName: tc.toolName, model: parentTurn?.model, mode: parentTurn?.mode, timestamp: parentTurn?.timestamp, userMessage: parentTurn?.userMessage, assistantResponse: parentTurn?.assistantResponse, inputTokensEstimate: parentTurn?.inputTokensEstimate, outputTokensEstimate: parentTurn?.outputTokensEstimate, argumentsRaw: tc.arguments ?? null, argumentsParsed: this.logViewerSafeParse(tc.arguments), resultRaw: tc.result ?? null, resultParsed: this.logViewerSafeParse(tc.result) };
	}

	private async logViewerShowToolCallPretty(turnNumber: number, toolCallIdx: number, logData: SessionLogData): Promise<void> {
		const turn = logData.turns.find(t => t.turnNumber === turnNumber);
		const turnIndex = logData.turns.findIndex(t => t.turnNumber === turnNumber);
		const toolCall = turn?.toolCalls?.[toolCallIdx];
		if (!toolCall) { this.log('showToolCallPretty: tool call not found in session data'); vscode.window.showInformationMessage('Tool call not found in session data.'); return; }
		const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 60) || 'toolcall';
		const prettyName = sanitize(`${toolCall.toolName || 'tool'}-turn-${turnNumber}-call-${toolCallIdx}`);
		const prettyPayload = {
			turnBefore: turnIndex > 0 ? this.logViewerMapTurnForContext(logData.turns[turnIndex - 1]) : undefined,
			toolCall: this.logViewerMapToolCallForContext(toolCall, toolCallIdx, turn, turnNumber),
			turnAfter: turnIndex >= 0 && turnIndex < logData.turns.length - 1 ? this.logViewerMapTurnForContext(logData.turns[turnIndex + 1]) : undefined
		};
		const prettyUri = vscode.Uri.parse(`untitled:${prettyName}.json`);
		const openDoc = vscode.workspace.textDocuments.find(d => d.uri.toString() === prettyUri.toString());
		if (openDoc) { await vscode.window.showTextDocument(openDoc, { preview: true }); return; }
		const doc = await vscode.workspace.openTextDocument(prettyUri);
		const editor = await vscode.window.showTextDocument(doc, { preview: true });
		await editor.edit((eb) => { eb.insert(new vscode.Position(0, 0), JSON.stringify(prettyPayload, null, 2)); });
		await vscode.languages.setTextDocumentLanguage(doc, 'json');
	}

	private async logViewerRevealToolCallSource(turnNumber: number, toolCallIdx: number, logData: SessionLogData, sessionFilePath: string): Promise<void> {
		this.log(`revealToolCallSource: turn=${turnNumber}, toolCallIdx=${toolCallIdx}, file=${sessionFilePath}`);
		const turn = logData.turns.find(t => t.turnNumber === turnNumber);
		const toolCall = turn?.toolCalls?.[toolCallIdx];
		if (!toolCall) { this.log('revealToolCallSource: tool call not found in session data'); vscode.window.showInformationMessage('Tool call not found in session data.'); return; }
		const fileContent = await fs.promises.readFile(sessionFilePath, 'utf8');
		const searchTerm = toolCall.toolName || '';
		const matchIdx = searchTerm ? fileContent.indexOf(searchTerm) : -1;
		this.log(`revealToolCallSource: searchTerm='${searchTerm}', matchIdx=${matchIdx}`);
		const doc = await vscode.workspace.openTextDocument(sessionFilePath);
		const editor = await vscode.window.showTextDocument(doc);
		if (matchIdx >= 0) {
			const pos = doc.positionAt(matchIdx);
			editor.selection = new vscode.Selection(pos, pos);
			editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
		} else {
			vscode.window.showInformationMessage('Opened session file, but could not locate this tool call text.');
		}
	}

	/**
	 * Opens a JSONL file in a formatted view with array brackets and commas.
	 * Does not modify the original file.
	 */
	public async showFormattedJsonlFile(sessionFilePath: string): Promise<void> {
		// Windsurf sessions are binary protobuf files — open the real .pb file in the OS
		if (this.windsurf.isWindsurfSessionFile(sessionFilePath)) {
			const trajectoryId = sessionFilePath.replace('windsurf://trajectory/', '');
			const pbPath = path.join(os.homedir(), '.codeium', 'windsurf', 'cascade', `${trajectoryId}.pb`);
			vscode.window.showInformationMessage(
				`Windsurf sessions are stored as binary protobuf files and cannot be viewed as text. The session file is: ${pbPath}`,
				'Reveal in Explorer'
			).then(choice => {
				if (choice === 'Reveal in Explorer') {
					vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pbPath));
				}
			});
			return;
		}

		try {
			// Read the file content
			const fileContent = await fs.promises.readFile(sessionFilePath, 'utf-8');

			// Check if this is a UUID-only file (new Copilot CLI format)
			if (this.isUuidPointerFile(fileContent)) {
				vscode.window.showInformationMessage(
					`This file contains only a session ID (${fileContent.trim()}). The actual session data is stored elsewhere in the Copilot CLI format.`
				);
				return;
			}

			// Parse JSONL into array of objects
			const lines = fileContent.trim().split('\n').filter(line => line.trim().length > 0);
			const jsonObjects: unknown[] = [];

			for (let i = 0; i < lines.length; i++) {
				try {
					const obj = JSON.parse(lines[i]);
					jsonObjects.push(obj);
				} catch (e) {
					// Skip malformed lines with detailed warning
					this.warn(`Skipping malformed line ${i + 1} in ${sessionFilePath}: ${e}`);
				}
			}

			// Format as JSON array
			const formattedJson = JSON.stringify(jsonObjects, null, 2);

			// Create an untitled document with the formatted content
			const fileName = path.basename(sessionFilePath, path.extname(sessionFilePath));
			const prettyUri = vscode.Uri.parse(`untitled:${fileName}-formatted.json`);

			// Check if this document is already open and close it to refresh
			const openDoc = vscode.workspace.textDocuments.find(d => d.uri.toString() === prettyUri.toString());
			if (openDoc) {
				// Close the existing document so we can create a fresh one with updated content
				const editor = vscode.window.visibleTextEditors.find(e => e.document === openDoc);
				if (editor) {
					await vscode.window.showTextDocument(openDoc, editor.viewColumn);
					await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
				}
			}

			// Create and open the document
			const doc = await vscode.workspace.openTextDocument(prettyUri);
			const editor = await vscode.window.showTextDocument(doc, { preview: true });

			// Insert the formatted JSON
			await editor.edit((editBuilder) => {
				editBuilder.insert(new vscode.Position(0, 0), formattedJson);
			});

			// Set language mode to JSON for syntax highlighting
			await vscode.languages.setTextDocumentLanguage(doc, 'json');

		} catch (error) {
			this.error(`Error formatting JSONL file ${sessionFilePath}:`, error);
			throw error;
		}
	}

	private getLogViewerHtml(webview: vscode.Webview, logData: SessionLogData): string {
		const nonce = getNonce();
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview', 'logviewer.js'));

		const initialData = JSON.stringify({ ...logData, compactNumbers: this.getCompactNumbersSetting() }).replace(/</g, '\\u003c');

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>Session Log Viewer</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_LOGDATA__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	private async refreshDetailsPanel(): Promise<void> {
		if (!this.detailsPanel) {
			return;
		}

		this.log('🔄 Refreshing Details panel');
		// Update token stats and refresh the webview content
		const stats = await this.updateTokenStats();
		if (stats) {
			this.detailsPanel.webview.html = this.getDetailsHtml(this.detailsPanel.webview, stats);
			this.log('✅ Details panel refreshed');
		}
	}

	private async refreshChartPanel(): Promise<void> {
		if (!this.chartPanel) {
			return;
		}

		this.log('🔄 Refreshing Chart view');
		// Refresh the full-year daily stats so week/month period views are up to date
		await this.calculateDailyStats();
		// Refresh all stats so the status bar and tooltip stay in sync
		await this.updateTokenStats();
		this.log('✅ Chart view refreshed');
	}

	private async refreshAnalysisPanel(): Promise<void> {
		if (!this.analysisPanel) {
			return;
		}

		this.log('🔄 Refreshing Usage Analysis dashboard');
		// Force fresh usage analysis stats and re-render the webview
		const analysisStats = await this.calculateUsageAnalysisStats(false);
		this.analysisPanel.webview.html = this.getUsageAnalysisHtml(this.analysisPanel.webview, analysisStats);
		// Refresh token stats so the status bar and tooltip stay in sync
		await this.updateTokenStats();
		this.log('✅ Usage Analysis dashboard refreshed');
	}

	// ── Maturity / Fluency Score ───────────────────────────────────────

	/**
	 * Calculate maturity scores across 6 categories using last 30 days of usage data.
	 * Each category is scored 1-4 based on threshold rules.
	 * Overall stage = median of the 6 category scores.
	 * @param useCache If true, use cached usage stats. If false, force recalculation.
	 */
	private async calculateMaturityScores(useCache = true, preloaded?: SessionFilePreload[]): Promise<{
		overallStage: number;
		overallLabel: string;
		categories: { category: string; icon: string; stage: number; evidence: string[]; tips: string[] }[];
		period: UsageAnalysisPeriod;
		lastUpdated: string;
	}> {
		return _calculateMaturityScores(this._lastCustomizationMatrix, (useCache) => this.calculateUsageAnalysisStats(useCache, preloaded), useCache);
	}

	public async showMaturity(): Promise<void> {
		this.log('🎯 Opening Copilot Fluency Score dashboard');
		await this.context.globalState.update('fluencyScore.everOpened', true);
		if (this.maturityPanel) { this.maturityPanel.dispose(); this.maturityPanel = undefined; }
		const maturityData = await this.calculateMaturityScores(true);
		const isDebugMode = this.context.extensionMode === vscode.ExtensionMode.Development;
		this.maturityPanel = vscode.window.createWebviewPanel(
			'copilotMaturity', 'AI Engineering Fluency Score',
			{ viewColumn: vscode.ViewColumn.One, preserveFocus: true },
			{ enableScripts: true, retainContextWhenHidden: false, localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview')] }
		);
		const dismissedTips = await this.getDismissedFluencyTips();
		const fluencyLevels = isDebugMode ? this.getFluencyLevelData(isDebugMode).categories : undefined;
		this.maturityPanel.webview.onDidReceiveMessage(async (message) => { await this.handleMaturityMessage(message); });
		this.maturityPanel.webview.html = this.getMaturityHtml(this.maturityPanel.webview, { ...maturityData, dismissedTips, isDebugMode, fluencyLevels });
		this.maturityPanel.onDidDispose(() => { this.log('🎯 Copilot Fluency Score dashboard closed'); this.maturityPanel = undefined; });
	}

	private async handleMaturityMessage(message: any): Promise<void> {
		if (this.handleLocalViewRegressionMessage(message)) { return; }
		if (await this.dispatchSharedCommand(message)) { return; }
		const simpleCommands: Record<string, () => Promise<void>> = {
			refresh: () => this.dispatch('refresh:maturity', () => this.refreshMaturityPanel()),
			searchMcpExtensions: () => this.dispatch('searchMcpExtensions', () => vscode.commands.executeCommand('workbench.extensions.search', '@tag:mcp')),
			shareToIssue: () => this.dispatch('shareToIssue', () => this.maturityHandleShareToIssue()),
			resetDismissedTips: () => this.dispatch('resetDismissedTips', async () => { await this.resetDismissedFluencyTips(); await this.refreshMaturityPanel(); }),
			shareToLinkedIn: () => this.dispatch('shareToLinkedIn', () => this.shareToSocialMedia('linkedin')),
			shareToBluesky: () => this.dispatch('shareToBluesky', () => this.shareToSocialMedia('bluesky')),
			shareToMastodon: () => this.dispatch('shareToMastodon', () => this.shareToSocialMedia('mastodon')),
			downloadChartImage: () => this.dispatch('downloadChartImage', () => this.downloadChartImage()),
		};
		if (simpleCommands[message.command]) { await simpleCommands[message.command](); return; }
		await this.handleMaturityConditionalMessage(message);
	}

	private async handleMaturityConditionalMessage(message: any): Promise<void> {
		switch (message.command) {
			case 'dismissTips': if (message.category) { await this.dispatch('dismissTips', async () => { await this.dismissFluencyTips(message.category); await this.refreshMaturityPanel(); }); } break;
			case 'saveChartImage': if (message.data) { await this.dispatch('saveChartImage', () => this.saveChartImageData(message.data)); } break;
			case 'exportPdf': if (message.data) { await this.dispatch('exportPdf', () => this.exportFluencyScorePdf(message.data)); } break;
			case 'exportPptx': if (message.data) { await this.dispatch('exportPptx', () => this.exportFluencyScorePptx(message.data)); } break;
		}
	}

	private async maturityHandleShareToIssue(): Promise<void> {
		const scores = await this.calculateMaturityScores();
		const categorySections = scores.categories.map(c => {
			const evidenceList = c.evidence.length > 0 ? c.evidence.map(e => `- ✅ ${e}`).join('\n') : '- No significant activity detected';
			return `<h2>${c.icon} ${c.category} — Stage ${c.stage}</h2>\n\n${evidenceList}`;
		}).join('\n\n');
		const body = `<h2>AI Engineering Fluency Score Feedback</h2>\n\n**Overall Stage:** ${scores.overallLabel}\n\n${categorySections}\n\n<h2>Feedback</h2>\n<!-- Describe your feedback or suggestion here -->\n`;
		const issueUrl = `https://github.com/rajbos/ai-engineering-fluency/issues/new?title=${encodeURIComponent('Fluency Score Feedback')}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('fluency-score')}`;
		await vscode.env.openExternal(vscode.Uri.parse(issueUrl));
	}

private async refreshMaturityPanel(): Promise<void> {
	if (!this.maturityPanel) {
		return;
	}

	this.log('🔄 Refreshing Copilot Fluency Score dashboard');
	const maturityData = await this.calculateMaturityScores(false); // Force recalculation on refresh
	const dismissedTips = await this.getDismissedFluencyTips();
	const isDebugMode = this.context.extensionMode === vscode.ExtensionMode.Development;
	const fluencyLevels = isDebugMode ? this.getFluencyLevelData(isDebugMode).categories : undefined;
	this.maturityPanel.webview.html = this.getMaturityHtml(this.maturityPanel.webview, { ...maturityData, dismissedTips, isDebugMode, fluencyLevels });
	this.log('✅ Copilot Fluency Score dashboard refreshed');
}

private async getDismissedFluencyTips(): Promise<string[]> {
	return this.context.globalState.get<string[]>('dismissedFluencyTips', []);
}

private async dismissFluencyTips(category: string): Promise<void> {
	const dismissed = await this.getDismissedFluencyTips();
	if (!dismissed.includes(category)) {
		dismissed.push(category);
		await this.context.globalState.update('dismissedFluencyTips', dismissed);
		this.log(`Dismissed fluency tips for category: ${category}`);
	}
}

private async resetDismissedFluencyTips(): Promise<void> {
	await this.context.globalState.update('dismissedFluencyTips', []);
	this.log('Reset all dismissed fluency tips');
}

/**
 * Share Copilot Fluency Score to social media platforms
 */
private async shareToSocialMedia(platform: 'linkedin' | 'bluesky' | 'mastodon'): Promise<void> {
	const scores = await this.calculateMaturityScores();
	const marketplaceUrl = 'https://marketplace.visualstudio.com/items?itemName=RobBos.ai-engineering-fluency';
	const hashtag = '#CopilotFluencyScore';
	
	// Build share text with stats
	const categoryScores = scores.categories.map(c => `${c.icon} ${c.category}: Stage ${c.stage}`).join('\n');
	
	const shareText = `🎯 My AI Engineering Fluency Score

Overall: ${scores.overallLabel}

${categoryScores}

Track your Copilot usage and level up your AI-assisted development skills!

Get the extension: ${marketplaceUrl}

${hashtag}`;

    switch (platform) {
      case "linkedin": {
        // LinkedIn share URL - opens in browser for user to add their own commentary
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(marketplaceUrl)}`;

        // Copy share text to clipboard for easy pasting
        await vscode.env.clipboard.writeText(shareText);
        const selection = await vscode.window.showInformationMessage(
          "Share text copied to clipboard! Paste it into your LinkedIn post.",
          "Open LinkedIn",
        );
        if (selection === "Open LinkedIn") {
          await vscode.env.openExternal(vscode.Uri.parse(shareUrl));
        }
        break;
      }

      case "bluesky": {
        // Copy share text to clipboard, then open Bluesky compose
        await vscode.env.clipboard.writeText(shareText);
        const selection = await vscode.window.showInformationMessage(
          "Share text copied to clipboard! Paste it into your Bluesky post.",
          "Open Bluesky",
        );
        if (selection === "Open Bluesky") {
          await vscode.env.openExternal(
            vscode.Uri.parse("https://bsky.app/intent/compose"),
          );
        }
        break;
      }

      case "mastodon": {
        // Mastodon share - ask user for their instance
        const instance = await vscode.window.showInputBox({
          prompt: "Enter your Mastodon instance (e.g., mastodon.social)",
          placeHolder: "mastodon.social",
          value: "mastodon.social",
        });

        if (instance) {
          // Copy share text to clipboard, then open Mastodon compose
          await vscode.env.clipboard.writeText(shareText);
          const selection = await vscode.window.showInformationMessage(
            "Share text copied to clipboard! Paste it into your Mastodon post.",
            "Open Mastodon",
          );
          if (selection === "Open Mastodon") {
            await vscode.env.openExternal(
              vscode.Uri.parse(`https://${instance}/share`),
            );
          }
        }
        break;
      }
    }

    this.log(`Shared fluency score to ${platform}`);
  }

  /**
   * Download the fluency chart as an image
   */
  private async downloadChartImage(): Promise<void> {
    await vscode.window.showInformationMessage(
      '💡 Click the "Download Chart Image" button to save the radar chart as a PNG file.',
      "Got it",
    );
    this.log("Showed chart download instructions");
  }

  private async saveChartImageData(dataUrl: string): Promise<void> {
    const base64Match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
    if (!base64Match) {
      void vscode.window.showErrorMessage(
        "Failed to process chart image data.",
      );
      return;
    }

    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file("copilot-fluency-score.png"),
      filters: { "PNG Image": ["png"] },
      title: "Save Fluency Score Chart",
    });

    if (!uri) {
      return;
    }

    const buffer = Buffer.from(base64Match[1], "base64");
    await vscode.workspace.fs.writeFile(uri, buffer);
    void (async () => {
      const selection = await vscode.window.showInformationMessage(
        `Chart image saved to ${uri.fsPath}`,
        "Open Image",
      );
      if (selection === "Open Image") {
        void vscode.env.openExternal(uri);
      }
    })();
    this.log(`Chart image saved to ${uri.fsPath}`);
  }

  /**
   * Export Copilot Fluency Score as a landscape PDF with screenshot images
   */
  private async exportFluencyScorePdf(images: { label: string; dataUrl: string }[]): Promise<void> {
    try {
      const jsPDF = (await import("jspdf")).default;
      const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file("copilot-fluency-score.pdf"), filters: { "PDF Document": ["pdf"] }, title: "Export Fluency Score Report" });
      if (!uri) { return; }
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      for (let i = 0; i < images.length; i++) {
        if (i > 0) { pdf.addPage(); }
        this.pdfAddPage(pdf, images[i].dataUrl, i, images.length, pageWidth, pageHeight, margin);
      }
      const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
      await vscode.workspace.fs.writeFile(uri, pdfBuffer);
      void (async () => { const sel = await vscode.window.showInformationMessage(`Fluency Score PDF saved to ${uri.fsPath}`, "Open PDF"); if (sel === "Open PDF") { void vscode.env.openExternal(uri); } })();
      this.log(`Fluency Score PDF exported to ${uri.fsPath}`);
    } catch (error) {
      this.error("Failed to export PDF", error instanceof Error ? error : new Error(String(error)));
      void vscode.window.showErrorMessage(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private pdfAddPage(pdf: any, imgData: string, pageIndex: number, totalPages: number, pageWidth: number, pageHeight: number, margin: number): void {
    pdf.setFontSize(8); pdf.setTextColor(128, 128, 128);
    pdf.text(`AI Engineering Fluency Score Report - Page ${pageIndex + 1} of ${totalPages}`, margin, 7);
    pdf.text(new Date().toLocaleDateString(), pageWidth - margin, 7, { align: "right" });
    const availW = pageWidth - 2 * margin;
    const availH = pageHeight - 2 * margin - 5;
    const imgProps = pdf.getImageProperties(imgData);
    const scale = Math.min(availW / imgProps.width, availH / imgProps.height);
    const drawW = imgProps.width * scale; const drawH = imgProps.height * scale;
    const x = margin + (availW - drawW) / 2; const y = margin + 5 + (availH - drawH) / 2;
    pdf.addImage(imgData, "PNG", x, y, drawW, drawH);
    pdf.setFontSize(8); pdf.setTextColor(128, 128, 128);
    pdf.text("Generated by AI Engineering Fluency Extension", pageWidth / 2, pageHeight - 5, { align: "center" });
  }

  private async exportFluencyScorePptx(images: { label: string; dataUrl: string }[]): Promise<void> {
    try {
      const PptxGenJSModule = await import("pptxgenjs");
      const PptxGenJS = PptxGenJSModule.default as any;
      const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file("copilot-fluency-score.pptx"), filters: { "PowerPoint Presentation": ["pptx"] }, title: "Export Fluency Score as PowerPoint" });
      if (!uri) { return; }
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; pptx.author = "AI Engineering Fluency";
      pptx.subject = "AI Engineering Fluency Score Report"; pptx.title = "AI Engineering Fluency Score";
      const slideW = 13.33; const slideH = 7.5;
      const maxW = slideW - 0.8; const maxH = slideH - 1.0;
      for (const img of images) { this.pptxAddImageSlide(pptx, img.dataUrl, slideW, slideH, maxW, maxH); }
      const pptxBuffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
      await vscode.workspace.fs.writeFile(uri, pptxBuffer);
      void (async () => { const sel = await vscode.window.showInformationMessage(`Fluency Score PPTX saved to ${uri.fsPath}`, "Open File"); if (sel === "Open File") { void vscode.env.openExternal(uri); } })();
      this.log(`Fluency Score PPTX exported to ${uri.fsPath}`);
    } catch (error) {
      this.error("Failed to export PPTX", error instanceof Error ? error : new Error(String(error)));
      void vscode.window.showErrorMessage(`Failed to export PPTX: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private pptxGetImageSize(dataUrl: string, maxW: number, maxH: number): { w: number; h: number } {
    try {
      const base64 = dataUrl.split(",")[1];
      const buf = Buffer.from(base64, "base64");
      if (buf.length > 24 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
        const pxW = buf.readUInt32BE(16); const pxH = buf.readUInt32BE(20);
        if (pxW > 0 && pxH > 0) {
          const aspect = pxW / pxH;
          if (aspect > maxW / maxH) { return { w: maxW, h: maxW / aspect }; }
          return { w: maxH * aspect, h: maxH };
        }
      }
    } catch { /* fall back to max dimensions */ }
    return { w: maxW, h: maxH };
  }

  private pptxAddImageSlide(pptx: any, dataUrl: string, slideW: number, slideH: number, maxW: number, maxH: number): void {
    const slide = pptx.addSlide();
    slide.background = { color: "1b1b1e" };
    const { w: imgW, h: imgH } = this.pptxGetImageSize(dataUrl, maxW, maxH);
    const x = (slideW - imgW) / 2; const y = (slideH - 1.0 - imgH) / 2 + 0.1;
    slide.addImage({ data: dataUrl, x, y, w: imgW, h: imgH });
    slide.addText("Generated by AI Engineering Fluency Extension", { x: 0, y: 7.0, w: 13.33, h: 0.4, fontSize: 8, color: "808080", align: "center" });
  }

  public async showFluencyLevelViewer(): Promise<void> {
    const isDebugMode = false;

    this.log("🔍 Opening Scoring Guide");

    // If panel already exists, dispose and recreate with fresh data
    if (this.fluencyLevelViewerPanel) {
      this.fluencyLevelViewerPanel.dispose();
      this.fluencyLevelViewerPanel = undefined;
    }

    const fluencyLevelData = this.getFluencyLevelData(isDebugMode);

    this.fluencyLevelViewerPanel = vscode.window.createWebviewPanel(
      "copilotFluencyLevelViewer",
      "Scoring Guide",
      { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, "dist", "webview"),
        ],
      },
    );

    this.fluencyLevelViewerPanel.webview.onDidReceiveMessage(
      async (message) => {
        if (this.handleLocalViewRegressionMessage(message)) { return; }
        if (await this.dispatchSharedCommand(message)) { return; }
        if (message.command === "refresh") {
          await this.dispatch('refresh:fluencyLevelViewer', () => this.refreshFluencyLevelViewerPanel());
        }
      },
    );

    this.fluencyLevelViewerPanel.webview.html = this.getFluencyLevelViewerHtml(
      this.fluencyLevelViewerPanel.webview,
      fluencyLevelData,
    );

    this.fluencyLevelViewerPanel.onDidDispose(() => {
      this.log("🔍 Fluency Level Viewer closed");
      this.fluencyLevelViewerPanel = undefined;
    });
  }

  private async refreshFluencyLevelViewerPanel(): Promise<void> {
    if (!this.fluencyLevelViewerPanel) {
      return;
    }

    const isDebugMode = false;
    this.log("🔄 Refreshing Scoring Guide");
    const fluencyLevelData = this.getFluencyLevelData(isDebugMode);
    this.fluencyLevelViewerPanel.webview.html = this.getFluencyLevelViewerHtml(
      this.fluencyLevelViewerPanel.webview,
      fluencyLevelData,
    );
    this.log("✅ Scoring Guide refreshed");
  }



  private getFluencyLevelData(isDebugMode: boolean): ReturnType<typeof _getFluencyLevelData> {
		return _getFluencyLevelData(isDebugMode);
  }

  private getFluencyLevelViewerHtml(
    webview: vscode.Webview,
    data: {
      categories: Array<{
        category: string;
        icon: string;
        levels: Array<{
          stage: number;
          label: string;
          description: string;
          thresholds: string[];
          tips: string[];
        }>;
      }>;
      isDebugMode: boolean;
    },
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "dist",
        "webview",
        "fluency-level-viewer.js",
      ),
    );

    const dataWithBackend = {
      ...data,
      backendConfigured: this.isBackendConfigured(),
    };
    const initialData = JSON.stringify(dataWithBackend).replace(
      /</g,
      "\\u003c",
    );

    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		${buildCspMeta(webview, nonce)}
		<title>Scoring Guide</title>
	</head>
	<body>
		<div id="root"></div>
		<script nonce="${nonce}">window.__INITIAL_FLUENCY_LEVEL_DATA__ = ${initialData};</script>
		${this.extensionPointButtonsScript(nonce)}
		${this.getLocalViewRegressionProbeScript('fluency-level-viewer', nonce)}
		<script nonce="${nonce}" src="${scriptUri}"></script>
	</body>
	</html>`;
  }

  private getMaturityHtml(
    webview: vscode.Webview,
    data: {
      overallStage: number;
      overallLabel: string;
      categories: {
        category: string;
        icon: string;
        stage: number;
        evidence: string[];
        tips: string[];
      }[];
      period: UsageAnalysisPeriod;
      lastUpdated: string;
      dismissedTips?: string[];
      isDebugMode?: boolean;
      fluencyLevels?: Array<{
        category: string;
        icon: string;
        levels: Array<{
          stage: number;
          label: string;
          description: string;
          thresholds: string[];
          tips: string[];
        }>;
      }>;
    },
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "maturity.js"),
    );

    const dataWithBackend = {
      ...data,
      backendConfigured: this.isBackendConfigured(),
    };
    const initialData = JSON.stringify(dataWithBackend).replace(
      /</g,
      "\\u003c",
    );

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>AI Engineering Fluency Score</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_MATURITY__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			${this.getLocalViewRegressionProbeScript('maturity', nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  /**
   * Opens the Team Dashboard panel showing personal and team usage comparison.
   */
  public async showDashboard(): Promise<void> {
    this.log("📊 Opening Team Dashboard");
    if (!this.isBackendConfigured()) {
      vscode.window.showWarningMessage("Team Dashboard requires backend sync to be configured. Please configure backend settings first.");
      return;
    }
    if (this.dashboardPanel) { this.dashboardPanel.reveal(); this.log("📊 Team Dashboard revealed (already exists)"); return; }
    const backendConfig = this.getDashboardBackendConfig();
    this.dashboardPanel = vscode.window.createWebviewPanel(
      "copilotDashboard", "Team Dashboard",
      { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist", "webview")] },
    );
    this.dashboardPanel.webview.html = this.getDashboardHtml(this.dashboardPanel.webview, undefined);
    this.dashboardPanel.webview.onDidReceiveMessage(async (message) => {
      if (await this.dispatchSharedCommand(message)) { return; }
      switch (message.command) {
        case "refresh": await this.dispatch('refresh:dashboard', () => this.refreshDashboardPanel()); break;
        case "deleteUserDataset": await this.dispatch('deleteUserDataset', () => this.handleDeleteUserDataset(message.userId, message.datasetId)); break;
        case "backfillHistoricalData": await this.dispatch('backfillHistoricalData', () => this.handleBackfillHistoricalData()); break;
        case "openExternal": if (typeof message.url === 'string') { await vscode.env.openExternal(vscode.Uri.parse(message.url)); } break;
      }
    });
    this.dashboardPanel.onDidDispose(() => { this.log("📊 Team Dashboard closed"); this.dashboardPanel = undefined; });
    if (backendConfig.azureConfigured) { await this.loadDashboardAzureData(); }
  }

  private async loadDashboardAzureData(): Promise<void> {
    if (!this.dashboardPanel) { return; }
    if (this.lastDashboardData) {
      this.log("📊 Sending cached dashboard data immediately");
      this.dashboardPanel.webview.postMessage({ command: "dashboardData", data: this.lastDashboardData });
    }
    try {
      const dashboardData = await this.getDashboardData();
      this.lastDashboardData = dashboardData;
      this.dashboardPanel?.webview.postMessage({ command: "dashboardData", data: dashboardData });
    } catch (error) {
      this.error("Failed to load dashboard data:", error);
      if (!this.lastDashboardData) {
        this.dashboardPanel?.webview.postMessage({ command: "dashboardError", message: "Failed to load dashboard data. Please check backend configuration and try again." });
      }
    }
  }

  private async refreshDashboardPanel(): Promise<void> {
    if (!this.dashboardPanel) {
      return;
    }

    const { azureConfigured } = this.getDashboardBackendConfig();
    if (!azureConfigured) {
      // Team server only -- nothing to refresh (the panel is a launch card)
      return;
    }

    this.log("🔄 Refreshing Team Dashboard");
    this.dashboardPanel.webview.postMessage({ command: "dashboardLoading" });
    try {
      const dashboardData = await this.getDashboardData();
      this.lastDashboardData = dashboardData;
      this.dashboardPanel?.webview.postMessage({
        command: "dashboardData",
        data: dashboardData,
      });
      this.log("✅ Team Dashboard refreshed");
    } catch (error) {
      this.error("Failed to refresh dashboard:", error);
      this.dashboardPanel?.webview.postMessage({
        command: "dashboardError",
        message: "Failed to refresh dashboard data.",
      });
    }
  }

  /**
   * Handle per-row delete from the Team Dashboard.
   * Shows a confirmation dialog, deletes table entities, then refreshes.
   */
  private async handleDeleteUserDataset(
    userId: string,
    datasetId: string,
  ): Promise<void> {
    if (!this.backend || !userId || !datasetId) {
      return;
    }

    const conf = ConfirmationMessages.deleteUserDataset(userId, datasetId);
    const choice = await vscode.window.showWarningMessage(
      conf.message,
      { modal: true, detail: conf.detail },
      conf.button,
    );

    if (choice !== conf.button) {
      return;
    }

    this.log(`🗑️ Deleting data for user "${userId}" in dataset "${datasetId}"`);
    this.dashboardPanel?.webview.postMessage({ command: "dashboardLoading" });

    try {
      const result = await this.backend.deleteUserDataset(userId, datasetId);
      if (result.errors.length > 0) {
        this.warn(
          `Partial deletion: ${result.deletedCount} deleted, ${result.errors.length} errors`,
        );
        vscode.window.showWarningMessage(
          `Deleted ${result.deletedCount} entries with ${result.errors.length} errors. Dashboard will refresh.`,
        );
      } else {
        this.log(
          `✅ Deleted ${result.deletedCount} entries for user "${userId}" in dataset "${datasetId}"`,
        );
        vscode.window.showInformationMessage(
          `Deleted ${result.deletedCount} data entries for "${userId}".`,
        );
      }

      // Refresh the dashboard with fresh data
      await this.refreshDashboardPanel();
    } catch (error) {
      this.error("Failed to delete user dataset:", error);
      this.dashboardPanel?.webview.postMessage({
        command: "dashboardError",
        message:
          "Failed to delete data. Please check backend configuration and try again.",
      });
    }
  }

  /**
   * Calculates a fluency stage (1-4) for a team member based on aggregated Azure Table Storage metrics.
   * Applies the same 6-category scoring thresholds as calculateMaturityScores().
   */

  /**
   * Backfill historical token data to Azure Table Storage by scanning all local session files
   * without the normal mtime-based age filter.
   */
  private async handleBackfillHistoricalData(): Promise<void> {
    if (!this.backend) {
      return;
    }

    this.log('🔄 Starting historical data backfill...');
    this.dashboardPanel?.webview.postMessage({
      command: 'backfillProgress',
      text: 'Backfill starting — scanning local session files...',
      processed: 0,
      total: 0,
      daysFound: 0,
    });

    try {
      await this.backend.backfillHistoricalData(365, (processed, total, daysFound) => {
        // processed === -1 is a sentinel signalling the upload phase (total = entity count, daysFound = days)
        const text = processed === -1
          ? `Backfill: uploading ${total} entries for ${daysFound} days to Azure...`
          : `Backfill in progress: ${processed}${total > 0 ? `/${total}` : ''} files scanned, ${daysFound} days found...`;
        this.dashboardPanel?.webview.postMessage({
          command: 'backfillProgress',
          text,
          processed,
          total,
          daysFound,
        });
      });
      this.log('✅ Historical data backfill complete');
      vscode.window.setStatusBarMessage('$(check) Backfill complete. Refreshing dashboard...', 5000);
      // Invalidate the cached dashboard data so the refresh reflects the new backfill
      this.lastDashboardData = undefined;
      await this.refreshDashboardPanel();
    } catch (error) {
      this.error('Backfill failed:', error);
      this.dashboardPanel?.webview.postMessage({
        command: 'dashboardError',
        message: 'Backfill failed. Please check backend configuration and try again.',
      });
    }
  }

  /**
   * Fetches and aggregates data for the Team Dashboard.
   */
  private async getDashboardData(): Promise<any> {
    if (!this.backend) { throw new Error("Backend not configured"); }
    const { BackendUtility } = await import("./backend/services/utilityService.js");
    const { computeBackendSharingPolicy, hashMachineIdForTeam } = await import("./backend/sharingProfile.js");
    const settings = this.backend.getSettings();
    this.log(`[Dashboard] Backend settings - userIdentityMode: ${settings.userIdentityMode}, configured userId: "${settings.userId}", datasetId: "${settings.datasetId}"`);
    const sharingPolicy = computeBackendSharingPolicy({ enabled: settings.enabled ?? true, profile: settings.sharingProfile ?? 'off', shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames ?? false });
    const currentUserId = await this.backend.resolveEffectiveUserId(settings);
    const currentMachineId = this.resolveCurrentMachineId(settings, sharingPolicy, hashMachineIdForTeam);
    if (!currentUserId && !currentMachineId) {
      this.warn("[Dashboard] No user identity available. Ensure sharing profile includes user dimension.");
      this.warn(`[Dashboard] Settings: mode=${settings.userIdentityMode}, userId="${settings.userId}"`);
    }
    const now = new Date();
    const todayKey = BackendUtility.toUtcDayKey(now);
    const startKey = BackendUtility.addDaysUtc(todayKey, -(settings.lookbackDays - 1));
    const allEntities = await this.backend.getAllAggEntitiesForRange(settings, startKey, todayKey);
    this.logDashboardDebugInfo(allEntities, currentUserId, todayKey, startKey);
    const { personalData, userMap, userFluencyMap, firstDate, lastDate } = this.aggregateDashboardEntities(allEntities, currentUserId, currentMachineId, sharingPolicy);
    const personalCost = this.calculateEstimatedCost(personalData.modelUsage);
    for (const userData of userMap.values()) { userData.cost = (userData.tokens / 1000000) * 0.05; }
    const teamMembers = this.buildTeamLeaderboard(userMap, userFluencyMap);
    this.log(`[Dashboard] Date range: ${firstDate} to ${lastDate} (${teamMembers.length} team members)`);
    this.log(`[Dashboard] Personal stats: ${personalData.totalTokens} tokens, ${personalData.totalInteractions} interactions, ${personalData.devices.size} devices, ${personalData.workspaces.size} workspaces`);
    for (const [userKey, data] of userMap.entries()) {
      const [uId, dsId] = userKey.split("|");
      this.log(`[Dashboard] User "${uId}" (dataset: ${dsId}): ${data.tokens} tokens, ${data.interactions} interactions`);
    }
    const currentTeamMemberKey = currentUserId ? currentUserId : currentMachineId ? `machine:${currentMachineId}` : "";
    if (currentTeamMemberKey) { await this.overrideCurrentUserFluency(teamMembers, currentTeamMemberKey); }
    const { localTokens, localInteractions } = await this.getLocalStatsForWindow(settings.lookbackDays ?? 30);
    const teamTotalTokens = Array.from(userMap.values()).reduce((sum, u) => sum + u.tokens, 0);
    const teamTotalInteractions = Array.from(userMap.values()).reduce((sum, u) => sum + u.interactions, 0);
    return {
      personal: { userId: currentUserId || "", totalTokens: personalData.totalTokens, totalInteractions: personalData.totalInteractions, totalCost: personalCost, devices: Array.from(personalData.devices), workspaces: Array.from(personalData.workspaces), modelUsage: personalData.modelUsage, localTokens, localInteractions },
      team: { members: teamMembers, totalTokens: teamTotalTokens, totalInteractions: teamTotalInteractions, averageTokensPerUser: userMap.size > 0 ? teamTotalTokens / userMap.size : 0, firstDate, lastDate },
      lookbackDays: settings.lookbackDays, lastUpdated: new Date().toISOString(),
    };
  }

  private resolveCurrentMachineId(settings: any, sharingPolicy: any, hashFn: (opts: any) => string): string {
    if (sharingPolicy.includeUserDimension) { return ""; }
    const rawMachineId = vscode.env.machineId;
    return sharingPolicy.machineIdStrategy === "hashed" ? hashFn({ datasetId: settings.datasetId ?? "", machineId: rawMachineId }) : rawMachineId;
  }

  private logDashboardDebugInfo(allEntities: any[], currentUserId: string | undefined, todayKey: string, startKey: string): void {
    const uniqueUserIds = new Set(allEntities.map((e) => (e.userId ?? "").toString()).filter((id) => id.trim()));
    const uniqueDatasets = new Set(allEntities.map((e) => (e.datasetId ?? "").toString()).filter((id) => id.trim()));
    this.log(`[Dashboard] Fetched ${allEntities.length} entities for date range ${startKey} to ${todayKey}`);
    this.log(`[Dashboard] Current user ID resolved as: ${currentUserId || "(none)"}`);
    this.log(`[Dashboard] Datasets found: [${Array.from(uniqueDatasets).map((id) => `"${id}"`).join(", ")}]`);
    this.log(`[Dashboard] UserIds in data: [${Array.from(uniqueUserIds).map((id) => `"${id}"`).join(", ")}]`);
  }

  private aggregateDashboardEntities(allEntities: any[], currentUserId: string | undefined, currentMachineId: string, sharingPolicy: any): { personalData: any; userMap: Map<string, any>; userFluencyMap: Map<string, any>; firstDate: string | null; lastDate: string | null } {
    const personalData = { totalTokens: 0, totalInteractions: 0, devices: new Set<string>(), workspaces: new Set<string>(), modelUsage: {} as any };
    const userMap = new Map<string, any>();
    const userFluencyMap = new Map<string, any>();
    let firstDate: string | null = null;
    let lastDate: string | null = null;
    for (const entity of allEntities) {
      const ids = this.extractEntityIds(entity);
      if (ids.dayKey) {
        if (!firstDate || ids.dayKey < firstDate) { firstDate = ids.dayKey; }
        if (!lastDate || ids.dayKey > lastDate) { lastDate = ids.dayKey; }
      }
      if (this.isCurrentUserEntity(ids, currentUserId, currentMachineId, sharingPolicy)) { this.updatePersonalData(entity, ids, personalData); }
      const teamMemberKey = this.resolveTeamMemberKey(ids);
      if (teamMemberKey) { this.updateTeamData(entity, ids, teamMemberKey, userMap, userFluencyMap); }
    }
    return { personalData, userMap, userFluencyMap, firstDate, lastDate };
  }

  private isCurrentUserEntity(ids: any, currentUserId: string | undefined, currentMachineId: string, sharingPolicy: any): boolean {
    if (sharingPolicy.includeUserDimension) { return currentUserId !== "" && ids.userId === currentUserId; }
    return currentMachineId !== "" && ids.machineId === currentMachineId;
  }

  private resolveTeamMemberKey(ids: any): string {
    if (ids.userId && ids.userId.trim()) { return ids.userId; }
    return ids.machineId ? `machine:${ids.machineId}` : "";
  }

  private extractEntityIds(entity: any): { userId: string; datasetId: string; machineId: string; workspaceId: string; model: string; inputTokens: number; outputTokens: number; interactions: number; tokens: number; dayKey: string } {
    const userId = (entity.userId ?? "").toString().replace(/^u:/, "");
    const datasetId = (entity.datasetId ?? "").toString().replace(/^ds:/, "");
    const machineId = (entity.machineId ?? "").toString().replace(/^mc:/, "");
    const workspaceId = (entity.workspaceId ?? "").toString().replace(/^w:/, "");
    const model = (entity.model ?? "").toString().replace(/^m:/, "");
    const inputTokens = Number.isFinite(Number(entity.inputTokens)) ? Number(entity.inputTokens) : 0;
    const outputTokens = Number.isFinite(Number(entity.outputTokens)) ? Number(entity.outputTokens) : 0;
    const interactions = Number.isFinite(Number(entity.interactions)) ? Number(entity.interactions) : 0;
    const dayKey = (entity.day ?? "").toString().replace(/^d:/, "");
    return { userId, datasetId, machineId, workspaceId, model, inputTokens, outputTokens, interactions, tokens: inputTokens + outputTokens, dayKey };
  }

  private updatePersonalData(entity: any, ids: any, personalData: any): void {
    personalData.totalTokens += ids.tokens;
    personalData.totalInteractions += ids.interactions;
    personalData.devices.add(ids.machineId);
    personalData.workspaces.add(ids.workspaceId);
    addModelUsage(personalData.modelUsage, { [ids.model]: { inputTokens: ids.inputTokens, outputTokens: ids.outputTokens } });
  }

  private updateTeamData(entity: any, ids: any, teamMemberKey: string, userMap: Map<string, any>, userFluencyMap: Map<string, any>): void {
    const userKey = `${teamMemberKey}|${ids.datasetId}`;
    if (!userMap.has(userKey)) {
      userMap.set(userKey, { tokens: 0, interactions: 0, cost: 0, datasetId: ids.datasetId, sessions: new Set<string>(), models: new Set<string>(), workspaces: new Set<string>(), days: new Set<string>() });
    }
    const userData = userMap.get(userKey)!;
    userData.tokens += ids.tokens; userData.interactions += ids.interactions;
    userData.sessions.add(`${ids.dayKey}|${ids.workspaceId}|${ids.machineId}`);
    if (ids.model) { userData.models.add(ids.model); }
    if (ids.workspaceId) { userData.workspaces.add(ids.workspaceId); }
    if (ids.dayKey) { userData.days.add(ids.dayKey); }
    if ((entity.schemaVersion ?? 0) >= 4) { this.accumulateEntityFluency(entity, userKey, userFluencyMap); }
  }

  private accumulateEntityFluency(entity: any, userKey: string, userFluencyMap: Map<string, any>): void {
    if (!userFluencyMap.has(userKey)) { userFluencyMap.set(userKey, this.createUserFluencyAccumulator()); }
    const fd = userFluencyMap.get(userKey)!;
    fd.askModeCount += typeof entity.askModeCount === "number" ? entity.askModeCount : 0;
    fd.editModeCount += typeof entity.editModeCount === "number" ? entity.editModeCount : 0;
    fd.agentModeCount += typeof entity.agentModeCount === "number" ? entity.agentModeCount : 0;
    fd.planModeCount += typeof entity.planModeCount === "number" ? entity.planModeCount : 0;
    fd.customAgentModeCount += typeof entity.customAgentModeCount === "number" ? entity.customAgentModeCount : 0;
    fd.cliModeCount += typeof entity.cliModeCount === "number" ? entity.cliModeCount : 0;
    if (typeof entity.multiTurnSessions === "number") { fd.multiTurnSessions += entity.multiTurnSessions; }
    if (typeof entity.sessionCount === "number") { fd.sessionCount += entity.sessionCount; }
    if (typeof entity.avgTurnsPerSession === "number" && entity.avgTurnsPerSession > 0) { fd.turnsPerSessionSum += entity.avgTurnsPerSession; fd.turnsPerSessionCount++; }
    this.accumulateEntityJsonFields(entity, fd);
  }

  private createUserFluencyAccumulator(): any {
    return { askModeCount: 0, editModeCount: 0, agentModeCount: 0, planModeCount: 0, customAgentModeCount: 0, cliModeCount: 0, toolCallsTotal: 0, toolCallsByTool: {}, ctxFile: 0, ctxSelection: 0, ctxSymbol: 0, ctxCodebase: 0, ctxWorkspace: 0, ctxTerminal: 0, ctxVscode: 0, ctxClipboard: 0, ctxChanges: 0, ctxProblemsPanel: 0, ctxOutputPanel: 0, ctxTerminalLastCommand: 0, ctxTerminalSelection: 0, ctxByKind: {}, mcpTotal: 0, mcpByServer: {}, mixedTierSessions: 0, mixedCostSessions: 0, switchingFreqSum: 0, switchingFreqCount: 0, standardModels: new Set(), premiumModels: new Set(), lowCostModels: new Set(), mediumCostModels: new Set(), highCostModels: new Set(), multiFileEdits: 0, filesPerEditSum: 0, filesPerEditCount: 0, editsAgentCount: 0, workspaceAgentCount: 0, repositories: new Set(), repositoriesWithCustomization: new Set(), applyRateSum: 0, applyRateCount: 0, multiTurnSessions: 0, turnsPerSessionSum: 0, turnsPerSessionCount: 0, sessionCount: 0, durationMsSum: 0, durationMsCount: 0 };
  }

  private accumulateEntityJsonFields(entity: any, fd: any): void {
    this.accumulateToolCallsJson(entity, fd);
    this.accumulateContextRefsJson(entity, fd);
    this.accumulateMcpToolsJson(entity, fd);
    this.accumulateModelSwitchingJson(entity, fd);
    this.accumulateEditScopeJson(entity, fd);
    this.accumulateAgentTypesJson(entity, fd);
    this.accumulateRepositoriesJson(entity, fd);
    this.accumulateApplyUsageJson(entity, fd);
    this.accumulateSessionDurationJson(entity, fd);
  }

  private accumulateToolCallsJson(entity: any, fd: any): void {
    if (!entity.toolCallsJson) { return; }
    try {
      const tc = JSON.parse(entity.toolCallsJson);
      fd.toolCallsTotal += tc.total ?? 0;
      for (const [tool, count] of Object.entries(tc.byTool ?? {})) { fd.toolCallsByTool[tool] = (fd.toolCallsByTool[tool] ?? 0) + Number(count); }
    } catch { /* ignore */ }
  }

  private accumulateContextRefsJson(entity: any, fd: any): void {
    if (!entity.contextRefsJson) { return; }
    try { this.applyContextRefs(JSON.parse(entity.contextRefsJson), fd); } catch { /* ignore */ }
  }

  private applyContextRefs(cr: any, fd: any): void {
    const fields: [string, string][] = [
      ['ctxFile', 'file'], ['ctxSelection', 'selection'], ['ctxSymbol', 'symbol'],
      ['ctxCodebase', 'codebase'], ['ctxWorkspace', 'workspace'], ['ctxTerminal', 'terminal'],
      ['ctxVscode', 'vscode'], ['ctxClipboard', 'clipboard'], ['ctxChanges', 'changes'],
      ['ctxProblemsPanel', 'problemsPanel'], ['ctxOutputPanel', 'outputPanel'],
      ['ctxTerminalLastCommand', 'terminalLastCommand'], ['ctxTerminalSelection', 'terminalSelection'],
    ];
    for (const [fdKey, crKey] of fields) { fd[fdKey] += cr[crKey] ?? 0; }
    for (const [kind, count] of Object.entries(cr.byKind ?? {})) { fd.ctxByKind[kind] = (fd.ctxByKind[kind] ?? 0) + Number(count); }
  }

  private accumulateMcpToolsJson(entity: any, fd: any): void {
    if (!entity.mcpToolsJson) { return; }
    try {
      const mcp = JSON.parse(entity.mcpToolsJson);
      fd.mcpTotal += mcp.total ?? 0;
      for (const [server, data] of Object.entries(mcp.byServer ?? {})) { fd.mcpByServer[server] = (fd.mcpByServer[server] ?? 0) + Number((data as any)?.total ?? data ?? 0); }
    } catch { /* ignore */ }
  }

  // eslint-disable-next-line complexity
  private accumulateModelSwitchingJson(entity: any, fd: any): void {
    if (!entity.modelSwitchingJson) { return; }
    try {
      const ms = JSON.parse(entity.modelSwitchingJson);
      fd.mixedTierSessions += ms.mixedTierSessions ?? 0;
      fd.mixedCostSessions += ms.mixedCostSessions ?? 0;
      if (typeof ms.switchingFrequency === "number") { fd.switchingFreqSum += ms.switchingFrequency; fd.switchingFreqCount++; }
      for (const m of ms.standardModels ?? []) { fd.standardModels.add(m as string); }
      for (const m of ms.premiumModels ?? []) { fd.premiumModels.add(m as string); }
      for (const m of ms.lowCostModels ?? []) { fd.lowCostModels.add(m as string); }
      for (const m of ms.mediumCostModels ?? []) { fd.mediumCostModels.add(m as string); }
      for (const m of ms.highCostModels ?? []) { fd.highCostModels.add(m as string); }
    } catch { /* ignore */ }
  }

  private accumulateEditScopeJson(entity: any, fd: any): void {
    if (!entity.editScopeJson) { return; }
    try {
      const es = JSON.parse(entity.editScopeJson);
      fd.multiFileEdits += es.multiFileEdits ?? 0;
      if (typeof es.avgFilesPerSession === "number" && es.avgFilesPerSession > 0) { fd.filesPerEditSum += es.avgFilesPerSession; fd.filesPerEditCount++; }
    } catch { /* ignore */ }
  }

  private accumulateAgentTypesJson(entity: any, fd: any): void {
    if (!entity.agentTypesJson) { return; }
    try {
      const at = JSON.parse(entity.agentTypesJson);
      fd.editsAgentCount += at.editsAgent ?? 0; fd.workspaceAgentCount += at.workspaceAgent ?? 0;
    } catch { /* ignore */ }
  }

  private accumulateRepositoriesJson(entity: any, fd: any): void {
    if (!entity.repositoriesJson) { return; }
    try {
      const rj = JSON.parse(entity.repositoriesJson);
      for (const r of rj.repositories ?? []) { fd.repositories.add(r as string); }
      for (const r of rj.repositoriesWithCustomization ?? []) { fd.repositoriesWithCustomization.add(r as string); }
    } catch { /* ignore */ }
  }

  private accumulateApplyUsageJson(entity: any, fd: any): void {
    if (!entity.applyUsageJson) { return; }
    try {
      const au = JSON.parse(entity.applyUsageJson);
      if (typeof au.applyRate === "number") { fd.applyRateSum += au.applyRate; fd.applyRateCount++; }
    } catch { /* ignore */ }
  }

  private accumulateSessionDurationJson(entity: any, fd: any): void {
    if (!entity.sessionDurationJson) { return; }
    try {
      const sd = JSON.parse(entity.sessionDurationJson);
      if (typeof sd.avgDurationMs === "number" && sd.avgDurationMs > 0) { fd.durationMsSum += sd.avgDurationMs; fd.durationMsCount++; }
    } catch { /* ignore */ }
  }

  private buildTeamLeaderboard(userMap: Map<string, any>, userFluencyMap: Map<string, any>): any[] {
    return Array.from(userMap.entries()).map(([userKey, data]) => {
      const [userId, datasetId] = userKey.split("|");
      const sessionCount = data.sessions.size;
      const fluencyData = userFluencyMap.get(userKey);
      const fluencyScore = fluencyData ? _calculateFluencyScoreForTeamMember(fluencyData, sessionCount) : undefined;
      return {
        userId, datasetId, totalTokens: data.tokens, totalInteractions: data.interactions, totalCost: data.cost, sessions: sessionCount,
        avgTurnsPerSession: sessionCount > 0 ? Math.round(data.interactions / sessionCount) : 0,
        uniqueModels: data.models.size, uniqueWorkspaces: data.workspaces.size, daysActive: data.days.size,
        avgTokensPerTurn: data.interactions > 0 ? Math.round(data.tokens / data.interactions) : 0,
        rank: 0, ...(fluencyScore ? { fluencyStage: fluencyScore.stage, fluencyLabel: fluencyScore.label, fluencyCategories: fluencyScore.categories } : {}),
      };
    }).sort((a, b) => b.totalTokens - a.totalTokens).map((member, index) => ({ ...member, rank: index + 1 }));
  }

  private async overrideCurrentUserFluency(teamMembers: any[], currentTeamMemberKey: string): Promise<void> {
    try {
      const localMaturity = await this.calculateMaturityScores(true);
      for (const member of teamMembers) {
        if (member.userId === currentTeamMemberKey) {
          member.fluencyStage = localMaturity.overallStage; member.fluencyLabel = localMaturity.overallLabel;
          member.fluencyCategories = localMaturity.categories.map((c: any) => ({ category: c.category, icon: c.icon, stage: c.stage, tips: c.tips }));
          break;
        }
      }
    } catch { /* non-critical */ }
  }

  private async getLocalStatsForWindow(lookbackDays: number): Promise<{ localTokens: number | undefined; localInteractions: number | undefined }> {
    try {
      const { dailyStats: freshDailyStats } = await this.calculateDetailedStats(undefined);
      this.lastDailyStats = freshDailyStats;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
      const cutoffStr = toLocalDayKey(cutoffDate);
      const inWindow = (this.lastDailyStats ?? []).filter(d => d.date >= cutoffStr);
      return { localTokens: inWindow.reduce((sum, d) => sum + d.tokens, 0), localInteractions: inWindow.reduce((sum, d) => sum + d.interactions, 0) };
    } catch { return { localTokens: undefined, localInteractions: undefined }; }
  }

  private getDashboardHtml(
    webview: vscode.Webview,
    data: any | undefined,
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "dashboard.js"),
    );

    const backendConfig = this.getDashboardBackendConfig();

    const dataWithBackend = data
      ? { ...data, backendConfigured: this.isBackendConfigured(), compactNumbers: this.getCompactNumbersSetting() }
      : undefined;
    const initialDataScript = dataWithBackend
      ? `<script nonce="${nonce}">window.__INITIAL_DASHBOARD__ = ${JSON.stringify(dataWithBackend).replace(/</g, "\\u003c")};</script>`
      : "";
    const configScript = `<script nonce="${nonce}">window.__DASHBOARD_CONFIG__ = ${JSON.stringify(backendConfig).replace(/</g, "\\u003c")};</script>`;

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>Team Dashboard</title>
		</head>
		<body>
			<div id="root"></div>
			${configScript}
			${initialDataScript}
			${this.extensionPointButtonsScript(nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  /**
   * Check if either Azure Storage or Team Server backend is configured for Team Dashboard access.
   */
  private isBackendConfigured(): boolean {
    const { azureConfigured, teamServerConfigured } = this.getDashboardBackendConfig();
    return azureConfigured || teamServerConfigured;
  }

  /**
   * Returns which backends are configured and the validated team server URL.
   * Azure is considered configured when all required Azure Storage fields are filled.
   * Team Server is configured when enabled with a valid http/https URL.
   */
  private getDashboardBackendConfig(): { azureConfigured: boolean; teamServerConfigured: boolean; teamServerUrl: string } {
    const settings = this.backend?.getSettings();
    const azureConfigured = !!(
      settings?.subscriptionId &&
      settings?.resourceGroup &&
      settings?.storageAccount &&
      settings?.aggTable
    );
    const teamServerUrl = this.buildTeamServerUrl(settings);
    return { azureConfigured, teamServerConfigured: !!teamServerUrl, teamServerUrl };
  }

  private buildTeamServerUrl(settings: any): string {
    const rawUrl = (settings?.sharingServerEnabled && settings?.sharingServerEndpointUrl) ? settings.sharingServerEndpointUrl : '';
    if (!rawUrl) { return ''; }
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') { return rawUrl; }
    } catch { /* invalid URL — leave empty */ }
    return '';
  }

  private getLoadingHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'robot-icon.png'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
${buildCspMeta(webview, nonce)}
<title>AI Engineering Fluency — Loading</title>
<style>
${this.getLoadingHtmlCssBase()}
${this.getLoadingHtmlCssSteps()}
</style>
</head>
${this.getLoadingHtmlBody(nonce, iconUri.toString())}
</html>`;
  }

  private getLoadingHtmlCssBase(): string {
    return `:root {
    --bg-primary: var(--vscode-editor-background, #1e1e2e);
    --bg-secondary: var(--vscode-sideBar-background, #181825);
    --bg-card: var(--vscode-editorWidget-background, #24273a);
    --text-primary: var(--vscode-editor-foreground, #cdd6f4);
    --text-muted: var(--vscode-descriptionForeground, #9399b2);
    --accent: var(--vscode-textLink-foreground, #89b4fa);
    --success: var(--vscode-terminal-ansiGreen, #a6e3a1);
    --border: var(--vscode-panel-border, #313244);
    --badge-bg: var(--vscode-badge-background, #313244);
    --badge-fg: var(--vscode-badge-foreground, #cdd6f4);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    background: var(--bg-primary); color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.card { width: 100%; max-width: 680px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 24px 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 16px; }
.badge-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
.title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.subtitle { font-size: 12px; color: var(--text-muted); margin-bottom: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 380px; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.pct-display { font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1; min-width: 70px; text-align: right; font-variant-numeric: tabular-nums; }
.meta-badges { display: flex; gap: 6px; }
.meta-badge { font-size: 11px; padding: 3px 10px; border: 1px solid var(--border); border-radius: 20px; color: var(--text-muted); background: var(--bg-card); white-space: nowrap; }
.progress-wrap { margin: 16px 0; }
.progress-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--accent), var(--success)); transition: width 0.5s ease; width: 2%; position: relative; }
.progress-fill.indeterminate { width: 25%; animation: slide-shimmer 1.8s ease-in-out infinite; background: linear-gradient(90deg, transparent, var(--accent), var(--success), transparent); }
@keyframes slide-shimmer { 0% { margin-left: -30%; } 100% { margin-left: 110%; } }
.stats-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-primary); }
.chip .chip-value { font-weight: 700; }`;
  }

  private getLoadingHtmlCssSteps(): string {
    return `.steps-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; }
.step { display: flex; align-items: center; gap: 10px; padding: 5px 0; color: var(--text-muted); font-size: 13px; transition: color 0.25s; }
.step.step-done   { color: var(--success); }
.step.step-active { color: var(--accent); font-weight: 600; }
.step-ico { width: 18px; text-align: center; flex-shrink: 0; font-style: normal; }
.spin-ico { display: inline-block; animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.step-lbl { flex: 1; }
.step-cnt { font-size: 11px; opacity: 0.75; font-variant-numeric: tabular-nums; }
@keyframes pop-in { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
.pop { animation: pop-in 0.35s ease both; }`;
  }

  private getLoadingHtmlBody(nonce: string, iconUri?: string): string {
    const badgeIcon = iconUri
      ? `<img src="${iconUri}" alt="" width="20" height="20" style="vertical-align:middle;margin-right:6px;border-radius:3px;" />`
      : '🤖 ';
    return `<body>
<div class="card">
    <div class="header-row">
        <div>
            <div class="badge-label">${badgeIcon}Analyzing Your AI Activity</div>
            <div class="title">Building Activity Index</div>
            <div class="subtitle" id="subtitle">Discovering session files...</div>
        </div>
        <div class="header-right">
            <div class="pct-display" id="pct">–</div>
            <div class="meta-badges">
                <div class="meta-badge" id="badge-files">– files</div>
                <div class="meta-badge" id="badge-elapsed">0s</div>
            </div>
        </div>
    </div>
    <div class="progress-wrap"><div class="progress-track"><div class="progress-fill indeterminate" id="prog-fill"></div></div></div>
    <div class="stats-chips" id="chips" style="display:none">
        <div class="chip">📂 <span class="chip-value" id="chip-total">–</span> session files</div>
        <div class="chip">✅ <span class="chip-value" id="chip-done">–</span> processed</div>
    </div>
    <div id="editors-row" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;"></div>
    <div class="steps-box">
        <div class="step step-active" id="s-discover"><i class="step-ico"><span class="spin-ico">↻</span></i><span class="step-lbl">Discovering session files</span><span class="step-cnt" id="sc-discover"></span></div>

        <div class="step" id="s-parse"><i class="step-ico">○</i><span class="step-lbl">Parsing session logs</span><span class="step-cnt" id="sc-parse"></span></div>
        <div class="step" id="s-compute"><i class="step-ico">○</i><span class="step-lbl">Computing statistics</span><span class="step-cnt"></span></div>
        <div class="step" id="s-ready"><i class="step-ico">○</i><span class="step-lbl">Ready!</span><span class="step-cnt"></span></div>
    </div>
</div>
<script nonce="${nonce}">
${this.getLoadingHtmlScript()}
</script>
</body>`;
  }

  private getLoadingHtmlScript(): string {
    return `(function () {
    var t0 = Date.now();
    var EDITORS = [];
    var editorsSeen = 0;
    setInterval(function () {
        var s = Math.floor((Date.now() - t0) / 1000);
        var el = document.getElementById('badge-elapsed');
        if (!el) return;
        if (s < 60) { el.textContent = s + 's'; } else { el.textContent = Math.floor(s / 60) + 'm ' + (s % 60) + 's'; }
    }, 1000);
    function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function setDone(id) {
        var el = document.getElementById(id); if (!el) return;
        el.classList.remove('step-active'); el.classList.add('step-done');
        var ico = el.querySelector('.step-ico'); if (ico) { ico.className = 'step-ico'; ico.innerHTML = '<span class="pop">✓</span>'; }
    }
    function setActive(id) {
        var el = document.getElementById(id); if (!el) return;
        el.classList.remove('step-done'); el.classList.add('step-active');
        var ico = el.querySelector('.step-ico'); if (ico) { ico.className = 'step-ico'; ico.innerHTML = '<span class="spin-ico">↻</span>'; }
    }
    // Advance the checklist into the parsing phase. Idempotent: the step transition runs
    // once even if it is triggered by a loadingProgress message because the one-time
    // loadingStep 'parsing' was posted before this webview's listener was attached.
    var parsingShown = false;
    function enterParsing(total) {
        if (!parsingShown) {
            parsingShown = true;
            setDone('s-discover'); setActive('s-parse');
            var chips = document.getElementById('chips'); if (chips) chips.style.display = 'flex';
        }
        if (total) { var sc = document.getElementById('sc-discover'); if (sc) sc.textContent = '(' + total + ' found)'; }
    }
    window.addEventListener('message', function (ev) {
        var m = ev.data; if (!m) return;
        if (m.command === 'loadingStep') {
            if (m.step === 'discovering') { setActive('s-discover');
            } else if (m.step === 'parsing') {
                var total = m.total || 0;
                if (m.editors !== undefined) { EDITORS = m.editors; editorsSeen = 0; }
                enterParsing(total);
                var sub = document.getElementById('subtitle'); if (sub) sub.textContent = 'Parsing ' + total + ' session files...';
                var bf = document.getElementById('badge-files'); if (bf) bf.textContent = total + ' files';
                var ct = document.getElementById('chip-total'); if (ct) ct.textContent = total.toLocaleString();
            } else if (m.step === 'computing') {
                enterParsing(0);
                setDone('s-parse'); setActive('s-compute');
                var fill = document.getElementById('prog-fill'); if (fill) { fill.classList.remove('indeterminate'); fill.style.width = '96%'; }
                var pct = document.getElementById('pct'); if (pct) pct.textContent = '96%';
                var sub2 = document.getElementById('subtitle'); if (sub2) sub2.textContent = 'Computing statistics...';
            }
        } else if (m.command === 'loadingProgress') {
            // Receiving progress means parsing is underway — reconcile the checklist in case
            // the loadingStep 'parsing' transition was missed during webview startup.
            enterParsing(m.total);
            // Editors are included in every progress tick so pills appear even when the
            // one-time loadingStep 'parsing' message was dropped before the listener attached.
            if (m.editors && m.editors.length > EDITORS.length) { EDITORS = m.editors; }
            var pct2 = document.getElementById('pct'); if (pct2) pct2.textContent = m.percentage + '%';
            var fill2 = document.getElementById('prog-fill'); if (fill2) { fill2.classList.remove('indeterminate'); fill2.style.width = (m.percentage < 3 ? 3 : m.percentage) + '%'; }
            var cd = document.getElementById('chip-done'); if (cd) cd.textContent = m.completed.toLocaleString();
            var bf2 = document.getElementById('badge-files'); if (bf2) bf2.textContent = m.completed + '\\u202f/\\u202f' + m.total + ' files';
            var sc2 = document.getElementById('sc-parse'); if (sc2) sc2.textContent = '(' + m.completed + '/' + m.total + ')';
            var sub3 = document.getElementById('subtitle'); if (sub3) sub3.textContent = 'Parsing session ' + m.completed + '\\u202f/\\u202f' + m.total + '\\u2026';
            var expectedPills = Math.min(EDITORS.length, Math.floor((m.completed / Math.max(1, m.total)) * EDITORS.length));
            while (editorsSeen < expectedPills) {
                var editor = EDITORS[editorsSeen]; editorsSeen++;
                var row = document.getElementById('editors-row');
                if (row) { var pill = document.createElement('div'); pill.className = 'chip'; pill.style.animation = 'pop-in 0.35s ease both'; pill.innerHTML = '<span>' + editor.icon + '</span>\\u00a0<span class="chip-value">' + esc(editor.name) + '</span>'; row.appendChild(pill); }
            }
        }
    });
}());`;
  }

  private getDetailsHtml(
    webview: vscode.Webview,
    stats: DetailedStats,
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "details.js"),
    );

    const sortSettings = this.context.globalState.get('details.sortSettings', {
      editor: { key: 'name', dir: 'asc' },
      model: { key: 'name', dir: 'asc' },
    });
    const dataWithBackend = {
      ...stats,
      backendConfigured: this.isBackendConfigured(),
      sortSettings,
      compactNumbers: this.getCompactNumbersSetting(),
      copilotPlan: this._copilotPlanResolved,
    };
    const initialData = JSON.stringify(dataWithBackend).replace(
      /</g,
      "\\u003c",
    );

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>AI Engineering Fluency</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_DETAILS__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			${this.getLocalViewRegressionProbeScript('details', nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  public async generateDiagnosticReport(): Promise<string> {
    this.log("Generating diagnostic report...");
    const report: string[] = [];
    this.buildDiagReportHeader(report);
    this.buildDiagReportExtensionInfo(report);
    this.buildDiagReportSystemInfo(report);
    this.buildDiagReportCopilotStatus(report);
    this.buildDiagReportBackendConfig(report);
    await this.buildDiagReportSessionFiles(report);
    this.buildDiagReportCacheStats(report);
    await this.buildDiagReportTokenStats(report);
    this.buildDiagReportFooter(report);
    this.log("Diagnostic report generated successfully");
    return report.join("\n");
  }

  private buildDiagReportHeader(report: string[]): void {
    report.push("=".repeat(70)); report.push("AI Engineering Fluency - Diagnostic Report"); report.push("=".repeat(70)); report.push("");
  }

  private buildDiagReportExtensionInfo(report: string[]): void {
    report.push("## Extension Information");
    report.push(`Extension Version: ${(vscode.extensions.getExtension("RobBos.ai-engineering-fluency") ?? vscode.extensions.getExtension("RobBos.copilot-token-tracker"))?.packageJSON.version || "Unknown"}`);
    report.push(`VS Code Version: ${vscode.version}`); report.push("");
  }

  private buildDiagReportSystemInfo(report: string[]): void {
    report.push("## System Information");
    report.push(`OS: ${os.platform()} ${os.release()} (${os.arch()})`);
    report.push(`Node Version: ${process.version}`);
    report.push(`Home Directory: ${os.homedir()}`);
    report.push(`Environment: ${process.env.CODESPACES === "true" ? "GitHub Codespaces" : vscode.env.remoteName || "Local"}`);
    report.push(`VS Code Machine ID: ${vscode.env.machineId}`);
    report.push(`VS Code Session ID: ${vscode.env.sessionId}`);
    report.push(`VS Code UI Kind: ${vscode.env.uiKind === vscode.UIKind.Desktop ? "Desktop" : "Web"}`);
    report.push(`Remote Name: ${vscode.env.remoteName || "N/A"}`); report.push("");
  }

  private buildDiagReportCopilotStatus(report: string[]): void {
    report.push("## GitHub Copilot Extension Status");
    this.addCopilotExtensionInfo(report, vscode.extensions.getExtension("GitHub.copilot"));
    this.addCopilotChatExtensionInfo(report, vscode.extensions.getExtension("GitHub.copilot-chat"));
    report.push("");
  }

  private addCopilotExtensionInfo(report: string[], copilotExtension: vscode.Extension<any> | undefined): void {
    if (!copilotExtension) { report.push(`GitHub Copilot Extension: Not Installed`); return; }
    report.push(`GitHub Copilot Extension:`);
    report.push(`  - Installed: Yes`);
    report.push(`  - Version: ${copilotExtension.packageJSON.version}`);
    report.push(`  - Active: ${copilotExtension.isActive ? "Yes" : "No"}`);
    try {
      const copilotApi = copilotExtension.exports;
      if (copilotApi?.status) {
        const status = copilotApi.status;
        if (typeof status === "object") { Object.keys(status).forEach((key) => { const value = status[key]; if (value !== undefined && value !== null) { report.push(`  - ${key}: ${value}`); } }); }
        else { report.push(`  - Status: ${status}`); }
      }
    } catch (error) { this.log(`Could not retrieve Copilot tier information: ${error}`); }
  }

  private addCopilotChatExtensionInfo(report: string[], copilotChatExtension: vscode.Extension<any> | undefined): void {
    if (!copilotChatExtension) { report.push(`GitHub Copilot Chat Extension: Not Installed`); return; }
    report.push(`GitHub Copilot Chat Extension:`); report.push(`  - Installed: Yes`);
    report.push(`  - Version: ${copilotChatExtension.packageJSON.version}`);
    report.push(`  - Active: ${copilotChatExtension.isActive ? "Yes" : "No"}`);
  }

  private buildDiagReportBackendConfig(report: string[]): void {
    report.push("## Backend Configuration");
    const settings = this.backend?.getSettings();
    const githubAuthStatus = this.getGitHubAuthStatus();
    report.push(`GitHub Authentication: ${githubAuthStatus.authenticated ? `Authenticated (${githubAuthStatus.username || "unknown"})` : "Not Authenticated"}`);
    if (settings?.sharingServerEnabled) {
      report.push(`Team Server: Enabled`); report.push(`  - Server URL: ${settings.sharingServerEndpointUrl || "(not set)"}`);
      if (!githubAuthStatus.authenticated) { report.push(`  - ⚠️ WARNING: GitHub authentication is required for team server sync`); }
    } else { report.push(`Team Server: Disabled`); }
    if (settings?.enabled) { report.push(`Azure Storage: Enabled`); report.push(`  - Storage Account: ${settings.storageAccount || "(not set)"}`); }
    else { report.push(`Azure Storage: Disabled`); }
    report.push("");
  }

  private async buildDiagReportSessionFiles(report: string[]): Promise<void> {
    report.push("## Session Files Discovery");
    try {
      const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
      report.push(`Total Session Files Found: ${sessionFiles.length}`); report.push("");
      if (sessionFiles.length > 0) { await this.appendSessionFileListing(report, sessionFiles); }
      else { this.appendNoSessionFilesMessage(report); }
      report.push("");
    } catch (error) { report.push(`Error discovering session files: ${error}`); report.push(""); }
  }

  private async appendSessionFileListing(report: string[], sessionFiles: string[]): Promise<void> {
    report.push("Session File Locations (first 20):");
    const filesToShow = sessionFiles.slice(0, 20);
    const fileStats = await Promise.all(filesToShow.map(async (file) => { try { const stat = await fs.promises.stat(file); return { file, stat, error: null }; } catch (error) { return { file, stat: null, error }; } }));
    fileStats.forEach((result, index) => {
      if (result.stat) { report.push(`  ${index + 1}. ${result.file}`); report.push(`     - Size: ${result.stat.size} bytes`); report.push(`     - Modified: ${result.stat.mtime.toISOString()}`); }
      else { report.push(`  ${index + 1}. ${result.file}`); report.push(`     - Error: ${result.error}`); }
    });
    if (sessionFiles.length > 20) { report.push(`  ... and ${sessionFiles.length - 20} more files`); }
  }

  private appendNoSessionFilesMessage(report: string[]): void {
    report.push("No session files found. Possible reasons:");
    report.push("  - Copilot extensions are not active");
    report.push("  - No Copilot Chat conversations have been initiated");
    report.push("  - Sessions stored in unsupported location");
    report.push("  - Authentication required with GitHub Copilot");
    if (vscode.env.remoteName === "wsl") {
      report.push(""); report.push("WSL note: the extension host runs inside WSL and scans both the");
      report.push("  Linux-side ~/.vscode-server paths and the Windows-side");
      report.push("  /mnt/c/Users/<you>/AppData/Roaming/Code paths.");
      report.push("  If /mnt/c is not mounted, Windows-side sessions cannot be read.");
    }
  }

  private buildDiagReportCacheStats(report: string[]): void {
    report.push("## Cache Statistics");
    report.push(`Cached Session Files: ${this.cacheManager.cache.size}`);
    report.push(`Cache Storage: Extension Global State`); report.push("");
    report.push("Cache provides faster loading by storing parsed session data with file modification timestamps.");
    report.push("Files are only re-parsed when their modification time changes."); report.push("");
  }

  private async buildDiagReportTokenStats(report: string[]): Promise<void> {
    report.push("## Token Usage Statistics");
    try {
      const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
      report.push(`Total Session Files Found: ${sessionFiles.length}`); report.push("");
      const dirCounts = new Map<string, number>();
      for (const file of sessionFiles) { const parent = require("path").dirname(file); dirCounts.set(parent, (dirCounts.get(parent) || 0) + 1); }
      if (dirCounts.size > 0) { report.push("Session Files by Directory:"); for (const [dir, count] of dirCounts.entries()) { report.push(`  ${dir}: ${count}`); } report.push(""); }
      if (sessionFiles.length > 0) { await this.appendSessionFileListing(report, sessionFiles); }
      else { this.appendNoSessionFilesMessage(report); }
      report.push("");
    } catch (error) { report.push(`Error calculating token usage statistics: ${error}`); report.push(""); }
  }

  private buildDiagReportFooter(report: string[]): void {
    report.push("=".repeat(70)); report.push(`Report Generated: ${new Date().toISOString()}`); report.push("=".repeat(70)); report.push("");
    report.push("This report can be shared with the extension maintainers to help");
    report.push("troubleshoot issues. No sensitive data from your code is included."); report.push("");
    report.push("Submit issues at:"); report.push(`${this.getRepositoryUrl()}/issues`);
  }


  public async showDiagnosticReport(): Promise<void> {
    this.log("🔍 Opening Diagnostic Report");
    if (this.diagnosticsPanel) {
      this.diagnosticsPanel.reveal();
      this.log("🔍 Diagnostic Report revealed (already exists)");
      this.loadDiagnosticDataInBackground(this.diagnosticsPanel);
      return;
    }
    this.diagnosticsPanel = vscode.window.createWebviewPanel(
      "copilotTokenDiagnostics", "Diagnostic Report",
      { viewColumn: vscode.ViewColumn.One, preserveFocus: false },
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist", "webview")] },
    );
    this.log("✅ Diagnostic Report panel created");
    this.diagnosticsPanel.webview.onDidReceiveMessage(async (message) => { await this.handleDiagnosticMessage(message); });
    this.diagnosticsPanel.webview.html = this.getDiagnosticReportHtml(this.diagnosticsPanel.webview, "Loading...", [], [], [], null);
    this.diagnosticsPanel.onDidDispose(() => { this.log("🔍 Diagnostic Report closed"); this.diagnosticsPanel = undefined; });
    this.loadDiagnosticDataInBackground(this.diagnosticsPanel);
  }

  private async handleDiagnosticMessage(message: any): Promise<void> {
    if (this.handleLocalViewRegressionMessage(message)) { return; }
    if (await this.dispatchSharedCommand(message)) { return; }
    const simpleCommands: Record<string, () => Promise<void>> = {
      copyReport: () => this.dispatch('copyReport:diagnostics', () => this.diagHandleCopyReport()),
      openIssue: () => this.dispatch('openIssue:diagnostics', () => this.diagHandleOpenIssue()),
      clearCache: () => this.dispatch('clearCache:diagnostics', () => this.diagHandleClearCache()),
      configureBackend: () => this.dispatch('configureBackend:diagnostics', () => this.diagHandleConfigureBackend()),
      configureTeamServer: () => this.dispatch('configureTeamServer:diagnostics', () => this.diagHandleConfigureTeamServer()),
      openSettings: () => this.dispatch('openSettings:diagnostics', () => vscode.commands.executeCommand("workbench.action.openSettings", "aiEngineeringFluency.backend")),
      openDisplaySettings: () => this.dispatch('openDisplaySettings:diagnostics', () => vscode.commands.executeCommand("workbench.action.openSettings", "aiEngineeringFluency.display")),
      openToolFamiliesSettings: () => this.dispatch('openToolFamiliesSettings:diagnostics', () => vscode.commands.executeCommand("workbench.action.openSettings", "aiEngineeringFluency.toolFamilies")),
      resetDebugCounters: () => this.dispatch('resetDebugCounters:diagnostics', () => this.diagHandleResetDebugCounters()),
      authenticateGitHub: () => this.dispatch('authenticateGitHub:diagnostics', () => this.diagHandleGitHubAuth(true)),
      signOutGitHub: () => this.dispatch('signOutGitHub:diagnostics', () => this.diagHandleGitHubAuth(false)),
      pickFolder: () => this.dispatch('pickFolder:diagnostics', () => this.diagHandlePickFolder()),
      analyzeFolder: () => this.dispatch('analyzeFolder:diagnostics', () => this.diagHandleAnalyzeFolder(message)),
    };
    if (simpleCommands[message.command]) { await simpleCommands[message.command](); return; }
    await this.handleDiagnosticConditionalCommand(message);
  }

  private async handleDiagnosticConditionalCommand(message: any): Promise<void> {
    switch (message.command) {
      case "reportNewEditorPath":
        if (message.path) { await this.dispatch('reportNewEditorPath:diagnostics', () => this.diagHandleReportNewEditorPath(message.path)); } break;
      case "openSessionFile":
        if (message.file) { await this.dispatch('openSessionFile:diagnostics', async () => { try { await this.showLogViewer(message.file); } catch { vscode.window.showErrorMessage("Could not open log viewer: " + message.file); } }); } break;
      case "openFormattedJsonlFile":
        if (message.file) { await this.dispatch('openFormattedJsonlFile:diagnostics', () => this.diagHandleOpenFormattedJsonlFile(message.file)); } break;
      case "revealPath":
        if (message.path) { await this.dispatch('revealPath:diagnostics', () => this.diagHandleRevealPath(message.path)); } break;
      default:
        await this.handleDiagnosticTypedCommand(message); break;
    }
  }

  private async handleDiagnosticTypedCommand(message: any): Promise<void> {
    switch (message.command) {
      case "updateDisplaySetting":
        if (typeof message.key === 'string' && message.value !== undefined) { await this.dispatch('updateDisplaySetting:diagnostics', () => this.diagHandleUpdateDisplaySetting(message.key, message.value)); } break;
      case "setDebugCounter":
        if (typeof message.key === 'string' && typeof message.value === 'number') { await this.dispatch('setDebugCounter:diagnostics', () => this.diagHandleSetDebugCounter(message.key, message.value)); } break;
      case "setDebugFlag":
        if (typeof message.key === 'string' && typeof message.value === 'boolean') { await this.dispatch('setDebugFlag:diagnostics', () => this.diagHandleSetDebugFlag(message.key, message.value)); } break;
    }
  }

  private async diagHandleCopyReport(): Promise<void> {
    await vscode.env.clipboard.writeText(this.lastDiagnosticReport);
    vscode.window.showInformationMessage("Diagnostic report copied to clipboard");
  }

  private async diagHandleOpenIssue(): Promise<void> {
    await vscode.env.clipboard.writeText(this.lastDiagnosticReport);
    vscode.window.showInformationMessage("Diagnostic report copied to clipboard. Please paste it into the GitHub issue.");
    const shortBody = encodeURIComponent("The diagnostic report has been copied to the clipboard. Please paste it below.");
    await vscode.env.openExternal(vscode.Uri.parse(`${this.getRepositoryUrl()}/issues/new?body=${shortBody}`));
  }

  private async diagHandleReportNewEditorPath(rawPath: string): Promise<void> {
    const home = os.homedir();
    const anonymizedPath = rawPath.startsWith(home) ? rawPath.replace(home, '~') : rawPath;
    const title = encodeURIComponent('New editor support: unknown session path found');
    const body = encodeURIComponent(['## Unknown editor session path found', '', 'The extension found a session file at a path it does not recognise:', '', '```', anonymizedPath, '```', '', '**Which editor or tool does this path belong to?**', '', 'Please describe the editor/tool and how you installed it so we can add support for it.'].join('\n'));
    await vscode.env.openExternal(vscode.Uri.parse(`${this.getRepositoryUrl()}/issues/new?title=${title}&body=${body}&labels=${encodeURIComponent('new-editor-support')}`));
  }

  private async diagHandleOpenFormattedJsonlFile(file: string): Promise<void> {
    try {
      await this.showFormattedJsonlFile(file);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage("Could not open formatted file: " + file + " (" + errorMsg + ")");
    }
  }

  private async diagHandleRevealPath(pathToReveal: string): Promise<void> {
    try {
      const fsModule = require("fs");
      const pathModule = require("path");
      const normalized = pathModule.normalize(pathToReveal);
      try {
        const stat = await fsModule.promises.stat(normalized);
        if (stat.isDirectory()) {
          await vscode.env.openExternal(vscode.Uri.file(normalized));
        } else {
          await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(normalized));
        }
      } catch {
        await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(normalized));
      }
    } catch {
      vscode.window.showErrorMessage("Could not reveal: " + pathToReveal);
    }
  }

  private async diagHandleClearCache(): Promise<void> {
    this.log("clearCache message received from diagnostics webview");
    await this.clearCache();
    if (this.diagnosticsPanel) {
      this.diagnosticsPanel.webview.postMessage({ command: "cacheCleared" });
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.showDiagnosticReport();
    }
  }

  private async diagHandleConfigureBackend(): Promise<void> {
    try {
      await vscode.commands.executeCommand("aiEngineeringFluency.configureBackend");
    } catch {
      void (async () => {
        const choice = await vscode.window.showInformationMessage('Backend configuration is available in settings. Search for "AI Engineering Fluency: Backend" in settings.', "Open Settings");
        if (choice === "Open Settings") { void vscode.commands.executeCommand("workbench.action.openSettings", "aiEngineeringFluency.backend"); }
      })();
    }
  }

  private async diagHandleConfigureTeamServer(): Promise<void> {
    try {
      await vscode.commands.executeCommand("aiEngineeringFluency.configureTeamServer");
    } catch {
      void (async () => {
        const choice = await vscode.window.showInformationMessage('Team Server configuration is available in settings. Search for "AI Engineering Fluency: Backend" in settings.', "Open Settings");
        if (choice === "Open Settings") { void vscode.commands.executeCommand("workbench.action.openSettings", "aiEngineeringFluency.backend.sharingServer"); }
      })();
    }
  }

  private async diagHandleUpdateDisplaySetting(key: string, value: any): Promise<void> {
    const fullKeyMap: Record<string, string> = {
      'display.statusBar.showTokens': 'aiEngineeringFluency.display.statusBar.showTokens',
      'display.statusBar.showCost': 'aiEngineeringFluency.display.statusBar.showCost',
      'display.statusBar.monthlyBudget': 'aiEngineeringFluency.display.statusBar.monthlyBudget',
    };
    const fullKey = fullKeyMap[key];
    if (!fullKey) { return; }
    let sanitised: any = value;
    if (key === 'display.statusBar.monthlyBudget') {
      const n = typeof value === 'number' ? value : parseFloat(value);
      sanitised = isNaN(n) ? 0 : Math.min(99999, Math.max(0, Math.round(n * 100) / 100));
    }
    await vscode.workspace.getConfiguration().update(fullKey, sanitised, vscode.ConfigurationTarget.Global);
  }

  private async diagHandleResetDebugCounters(): Promise<void> {
    await this.context.globalState.update('extension.openCount', 0);
    await this.context.globalState.update('extension.unknownMcpOpenCount', 0);
    await this.context.globalState.update('news.fluencyScoreBanner.v1.dismissed', false);
    await this.context.globalState.update('news.unknownMcpTools.dismissedVersion', undefined);
    vscode.window.showInformationMessage('Debug counters and dismissed flags have been reset.');
    await this.showDiagnosticReport();
  }

  private async diagHandleSetDebugCounter(key: string, value: number): Promise<void> {
    await this.context.globalState.update(key, value);
    vscode.window.showInformationMessage(`Set ${key} = ${value}`);
    await this.showDiagnosticReport();
  }

  private async diagHandleSetDebugFlag(key: string, value: boolean): Promise<void> {
    await this.context.globalState.update(key, value);
    vscode.window.showInformationMessage(`Set ${key} = ${value}`);
    await this.showDiagnosticReport();
  }

  private async diagHandleGitHubAuth(signIn: boolean): Promise<void> {
    if (signIn) { await this.authenticateWithGitHub(); } else { await this.signOutFromGitHub(); }
    if (this.diagnosticsPanel) {
      this.diagnosticsPanel.webview.postMessage({ command: 'githubAuthUpdated', githubAuth: this.getGitHubAuthStatus() });
    }
  }

  private async diagHandlePickFolder(): Promise<void> {
    const uris = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: "Select Folder to Analyze" });
    if (uris && uris.length > 0 && this.diagnosticsPanel && this.isPanelOpen(this.diagnosticsPanel)) {
      this.diagnosticsPanel.webview.postMessage({ command: "folderPicked", folderPath: uris[0].fsPath });
    }
  }

  private async diagHandleAnalyzeFolder(message: any): Promise<void> {
    const { folderPath, toolType } = message as { folderPath: string; toolType: string };
    const effectiveToolType = toolType ?? "auto";
    if (!folderPath) {
      if (this.diagnosticsPanel && this.isPanelOpen(this.diagnosticsPanel)) {
        this.diagnosticsPanel.webview.postMessage({ command: "folderAnalysisResult", error: "No folder path provided.", files: [], totalScanned: 0, parseErrors: 0, truncated: false, folderPath: "", toolType: effectiveToolType });
      }
      return;
    }
    try {
      await fs.promises.access(folderPath);
    } catch {
      if (this.diagnosticsPanel && this.isPanelOpen(this.diagnosticsPanel)) {
        this.diagnosticsPanel.webview.postMessage({ command: "folderAnalysisResult", error: `Folder not found or not accessible: ${folderPath}`, files: [], totalScanned: 0, parseErrors: 0, truncated: false, folderPath, toolType: effectiveToolType });
      }
      return;
    }
    if (this.diagnosticsPanel) { await this.analyzeFolderPath(this.diagnosticsPanel, folderPath, effectiveToolType); }
  }

  /**
   * Load all diagnostic data in the background and update the webview progressively.
   */
  private async loadDiagnosticDataInBackground(
    panel: vscode.WebviewPanel,
  ): Promise<void> {
    try {
      this.log("🔄 Loading diagnostic data in background...");

      if (this._sessionRestorePromise) {
        await this._sessionRestorePromise;
      }

      if (!this.lastDetailedStats) {
        this.log(
          "⚡ No cached stats found - forcing initial stats calculation to populate cache...",
        );
        await this.updateTokenStats(true);
        this.log("✅ Cache populated, proceeding with diagnostics load");
      }

      if (!this.lastUsageAnalysisStats) {
        this.log("⚡ No usage analysis stats cached - computing for tool analysis tab...");
        await this.calculateUsageAnalysisStats(false);
        this.log("✅ Usage analysis stats computed");
      }

      const report = await this.generateDiagnosticReport();
      this.lastDiagnosticReport = report;

      const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
      const sessionFileData = await this.getSessionFilePreviewData(sessionFiles);
      const sessionFolders = this.buildSessionFolderData(sessionFiles);
      const candidatePaths = this.sessionDiscovery.getDiagnosticCandidatePaths();
      const backendStorageInfo = await this.getBackendStorageInfo();
      this.log(
        `Backend storage info retrieved: azure.enabled=${backendStorageInfo.azure?.enabled}, azure.configured=${backendStorageInfo.azure?.isConfigured}, teamServer.enabled=${backendStorageInfo.teamServer?.enabled}, teamServer.configured=${backendStorageInfo.teamServer?.isConfigured}`,
      );

      const githubAuthStatus = this.getGitHubAuthStatus();

      if (!this.isPanelOpen(panel)) {
        this.log("Diagnostic panel closed during data load, aborting update");
        return;
      }

      this.log(
        `Sending backend info to webview: ${backendStorageInfo ? "present" : "missing"}`,
      );
      panel.webview.postMessage({
        command: "diagnosticDataLoaded",
        report,
        sessionFiles: sessionFileData,
        sessionFolders,
        candidatePaths,
        backendStorageInfo,
        githubAuth: githubAuthStatus,
        toolCallStats: this.lastUsageAnalysisStats?.last30Days?.toolCalls ?? null,
        toolFamilies: getToolFamilies(),
      });

      this.log("✅ Diagnostic data loaded and sent to webview");

      this.loadSessionFilesInBackground(panel, sessionFiles);
    } catch (error) {
      this.error(`Failed to load diagnostic data: ${error}`);
      if (this.isPanelOpen(panel)) {
        panel.webview.postMessage({
          command: "diagnosticDataError",
          error: String(error),
        });
      }
    }
  }

  private async getSessionFilePreviewData(sessionFiles: string[]): Promise<{ file: string; size: number; modified: string }[]> {
    const sessionFileData: { file: string; size: number; modified: string }[] = [];
    for (const file of sessionFiles.slice(0, 20)) {
      try {
        const stat = await this.statSessionFile(file);
        sessionFileData.push({ file, size: stat.size, modified: stat.mtime.toISOString() });
      } catch {
        // Skip inaccessible files
      }
    }
    return sessionFileData;
  }

  private buildSessionFolderData(sessionFiles: string[]): { dir: string; count: number; editorName: string }[] {
    const dirCounts = new Map<string, number>();
    const dirEditorNames = new Map<string, string>();
    const pathModule = require("path");
    const copilotSessionStateDir = pathModule.join(os.homedir(), ".copilot", "session-state");
    for (const file of sessionFiles) {
      const eco = this.findEcosystem(file);
      if (eco) {
        const editorRoot = eco.getEditorRoot(file);
        dirCounts.set(editorRoot, (dirCounts.get(editorRoot) || 0) + 1);
        dirEditorNames.set(editorRoot, getEcosystemDisplayName(eco, file));
        continue;
      }
      const parts = file.split(/[\\\/]/);
      const userIdx = parts.findIndex((p: string) => p.toLowerCase() === "user");
      let editorRoot = "";
      if (userIdx > 0) {
        editorRoot = pathModule.join(...parts.slice(0, Math.min(parts.length, userIdx + 2)));
      } else {
        editorRoot = pathModule.dirname(file);
      }
      if (editorRoot.startsWith(copilotSessionStateDir) && editorRoot !== copilotSessionStateDir) {
        editorRoot = copilotSessionStateDir;
      }
      dirCounts.set(editorRoot, (dirCounts.get(editorRoot) || 0) + 1);
    }
    return Array.from(dirCounts.entries()).map(([dir, count]) => ({
      dir, count, editorName: dirEditorNames.get(dir) || this.getEditorNameFromRoot(dir),
    }));
  }

  /**
   * Check if a webview panel is still open and accessible.
   * A panel is considered open if its viewColumn is defined.
   */
  private isPanelOpen(panel: vscode.WebviewPanel): boolean {
    return panel.viewColumn !== undefined;
  }

  /**
   * Load session file details in the background and send to webview.
   */
  private async loadSessionFilesInBackground(panel: vscode.WebviewPanel, sessionFiles: string[]): Promise<void> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const detailedSessionFiles: SessionFileDetails[] = [];
    const initialCacheHits = this._cacheHits;
    const initialCacheMisses = this._cacheMisses;
    const sortedFiles = await this.sortSessionFilesByMtime(sessionFiles);
    for (const file of sortedFiles.slice(0, 500)) {
      if (!this.isPanelOpen(panel)) { this.log("Diagnostic panel closed, stopping background load"); return; }
      try {
        const details = await this.getSessionFileDetails(file);
        const lastActivity = details.lastInteraction ? new Date(details.lastInteraction) : new Date(details.modified);
        if (lastActivity >= fourteenDaysAgo) { detailedSessionFiles.push(details); }
      } catch { /* Skip inaccessible files */ }
    }
    await this.enrichSessionHierarchy(detailedSessionFiles);
    await this.sendBgLoadResults(panel, detailedSessionFiles, initialCacheHits, initialCacheMisses);
  }

  /**
   * Extract the Copilot CLI events.jsonl UUID from a session file path.
   * Handles both:
   *   - ~/.copilot/session-state/{uuid}/events.jsonl  → returns the uuid directory name
   *   - ~/.copilot/session-store.db#{uuid}           → returns the uuid after '#'
   * Returns null for all other session types.
   */
  private extractCopilotCliUuid(sessionFile: string): string | null {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Virtual DB path: .../session-store.db#uuid
    if (sessionFile.includes('session-store.db#')) {
      const uuid = sessionFile.split('session-store.db#')[1] ?? '';
      return UUID_RE.test(uuid) ? uuid : null;
    }
    // events.jsonl path: .../session-state/{uuid}/events.jsonl
    if (sessionFile.includes('session-state')) {
      const uuid = path.basename(path.dirname(sessionFile));
      return UUID_RE.test(uuid) ? uuid : null;
    }
    return null;
  }

  /**
   * Enrich Copilot CLI sessions in `files` with parent/child hierarchy data
   * read from ~/.copilot/data.db.  All other session types are left untouched.
   * Errors are suppressed — hierarchy is an optional enrichment.
   */
  private async enrichSessionHierarchy(files: SessionFileDetails[]): Promise<void> {
    // Build uuid → SessionFileDetails map for Copilot CLI sessions only.
    const uuidToDetails = new Map<string, SessionFileDetails>();
    for (const details of files) {
      const uuid = this.extractCopilotCliUuid(details.file);
      if (uuid) { uuidToDetails.set(uuid, details); }
    }
    if (uuidToDetails.size === 0) { return; }

    try {
      const hierarchy = await this.copilotAppData.getSessionHierarchy([...uuidToDetails.keys()]);
      for (const [uuid, node] of hierarchy) {
        const details = uuidToDetails.get(uuid);
        if (!details) { continue; }
        if (node.parentUuid) {
          const ref: SessionRelationRef = {
            uuid: node.parentUuid,
            name: node.parentName ?? node.parentUuid,
            sessionFile: uuidToDetails.get(node.parentUuid)?.file,
          };
          details.parentInfo = ref;
        }
        if (node.childUuids.length > 0) {
          details.childInfo = node.childUuids.map(cUuid => ({
            uuid: cUuid,
            name: node.childNames.get(cUuid) ?? cUuid,
            sessionFile: uuidToDetails.get(cUuid)?.file,
          } satisfies SessionRelationRef));
          details.totalChildCount = node.totalChildCount;
        }
      }
    } catch { /* hierarchy is optional — never surface errors */ }
  }

  private async sortSessionFilesByMtime(sessionFiles: string[]): Promise<string[]> {
    const fileStats = await Promise.all(
      sessionFiles.map(async (file) => {
        try { const stat = await this.statSessionFile(file); return { file, mtime: stat.mtime.getTime() }; }
        catch { return { file, mtime: 0 }; }
      })
    );
    return fileStats.sort((a, b) => b.mtime - a.mtime).map((item) => item.file);
  }

  private async sendBgLoadResults(panel: vscode.WebviewPanel, detailedSessionFiles: SessionFileDetails[], initialCacheHits: number, initialCacheMisses: number): Promise<void> {
    try {
      if (panel === this.diagnosticsPanel) { this.diagnosticsCachedFiles = detailedSessionFiles; }
      const withRepo = detailedSessionFiles.filter((s) => s.repository).length;
      this.log(`📊 Sending ${detailedSessionFiles.length} sessions to diagnostics (${withRepo} with repository info)`);
      await panel.webview.postMessage({ command: "sessionFilesLoaded", detailedSessionFiles });
      const cacheHits = this._cacheHits - initialCacheHits;
      const cacheMisses = this._cacheMisses - initialCacheMisses;
      const totalAccesses = cacheHits + cacheMisses;
      const hitRate = totalAccesses > 0 ? ((cacheHits / totalAccesses) * 100).toFixed(1) : "0.0";
      this.log(`Loaded ${detailedSessionFiles.length} session files in background (Cache: ${cacheHits} hits, ${cacheMisses} misses, ${hitRate}% hit rate)`);
      if (panel === this.diagnosticsPanel) { this.diagnosticsHasLoadedFiles = true; }
    } catch { this.log("Could not send session files to panel (may be closed)"); }
  }

  /**
   * Analyze a custom folder for session files belonging to any of the supported AI tools.
   * Scans recursively up to depth 5, max 500 files.
   * Does NOT touch the cache — reads each file once and calls countInteractionsInSession
   * and estimateTokensFromSession directly with preloaded content.
   */
  private async analyzeFolderPath(panel: vscode.WebviewPanel, folderPath: string, toolType: string): Promise<void> {
    const { allowJson, allowJsonl } = this.resolveFolderScanOptions(toolType);
    const ctx = { results: [] as Array<{ file: string; size: number; modified: string; interactions: number; tokens: number; actualTokens: number }>, totalScanned: 0, parseErrors: 0, truncated: false };
    await this.scanFolderRecursive(folderPath, 0, allowJson, allowJsonl, ctx);
    if (this.isPanelOpen(panel)) {
      panel.webview.postMessage({ command: "folderAnalysisResult", files: ctx.results, totalScanned: ctx.totalScanned, parseErrors: ctx.parseErrors, truncated: ctx.truncated, folderPath, toolType });
    }
  }

  private resolveFolderScanOptions(toolType: string): { allowJson: boolean; allowJsonl: boolean } {
    const jsonOnly = ["claude-code", "gemini-cli"];
    const jsonlOnly = ["continue", "opencode", "mistral-vibe", "claude-desktop"];
    if (jsonOnly.includes(toolType)) { return { allowJson: false, allowJsonl: true }; }
    if (jsonlOnly.includes(toolType)) { return { allowJson: true, allowJsonl: false }; }
    return { allowJson: true, allowJsonl: true };
  }

  private async scanFolderRecursive(dir: string, depth: number, allowJson: boolean, allowJsonl: boolean, ctx: { results: Array<{ file: string; size: number; modified: string; interactions: number; tokens: number; actualTokens: number }>; totalScanned: number; parseErrors: number; truncated: boolean }): Promise<void> {
    const MAX_FILES = 500; const MAX_DEPTH = 5;
    if (ctx.totalScanned >= MAX_FILES) { ctx.truncated = true; return; }
    if (depth > MAX_DEPTH) { return; }
    let entries: fs.Dirent[];
    try { entries = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (ctx.totalScanned >= MAX_FILES) { ctx.truncated = true; break; }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { await this.scanFolderRecursive(full, depth + 1, allowJson, allowJsonl, ctx); }
      else if (entry.isFile()) {
        const isJson = entry.name.endsWith(".json"); const isJsonl = entry.name.endsWith(".jsonl");
        if ((isJson && allowJson) || (isJsonl && allowJsonl)) { await this.scanFolderFile(full, ctx); }
      }
    }
  }

  private async scanFolderFile(full: string, ctx: { results: Array<{ file: string; size: number; modified: string; interactions: number; tokens: number; actualTokens: number }>; totalScanned: number; parseErrors: number }): Promise<void> {
    ctx.totalScanned++;
    let stat: fs.Stats;
    try { stat = await fs.promises.stat(full); } catch { ctx.parseErrors++; return; }
    let content: string;
    try { content = await fs.promises.readFile(full, "utf8"); } catch {
      ctx.parseErrors++;
      ctx.results.push({ file: full, size: stat.size, modified: stat.mtime.toISOString(), interactions: 0, tokens: 0, actualTokens: 0 });
      return;
    }
    const interactions = await this.countInteractionsInSession(full, content);
    const tokenResult = await this.estimateTokensFromSession(full, content);
    ctx.results.push({ file: full, size: stat.size, modified: stat.mtime.toISOString(), interactions, tokens: tokenResult.tokens, actualTokens: tokenResult.actualTokens });
  }

  /**
   * Get backend storage information for diagnostics
   */
  private async getBackendStorageInfo(): Promise<any> {
    const config = vscode.workspace.getConfiguration("aiEngineeringFluency");
    const settings = this.backend?.getSettings();
    const azureSettings = this.extractAzureStorageSettings(settings, config);
    const teamSettings = this.extractTeamServerSettings(settings, azureSettings.sharingProfile);
    const lastSyncAt = this.context.globalState.get<number>("backend.lastSyncAt");
    const lastSyncTime = lastSyncAt ? new Date(lastSyncAt).toISOString() : null;
    const sessionFiles = await this.sessionDiscovery.getCopilotSessionFiles();
    const workspaceIds = this.extractWorkspaceIdsFromFiles(sessionFiles);
    return {
      azure: { ...azureSettings, isConfigured: settings ? this.backend!.isConfigured(settings) : false, lastSyncTime: azureSettings.enabled ? lastSyncTime : null, deviceCount: workspaceIds.size, sessionCount: sessionFiles.length, recordCount: null },
      teamServer: { ...teamSettings, isConfigured: teamSettings.enabled && !!teamSettings.endpointUrl, lastSyncTime: teamSettings.enabled ? lastSyncTime : null, sessionCount: sessionFiles.length },
    };
  }

  private extractAzureStorageSettings(settings: any, config: any): any {
    const s = settings ?? {};
    const subscriptionId = s.subscriptionId ?? "";
    return {
      enabled: s.enabled ?? false, storageAccount: s.storageAccount ?? "",
      subscriptionId: subscriptionId ? subscriptionId.substring(0, 8) + "..." : "",
      resourceGroup: s.resourceGroup ?? "", aggTable: s.aggTable ?? "usageAggDaily",
      eventsTable: s.eventsTable ?? "usageEvents", authMode: s.authMode ?? "entraId",
      sharingProfile: config.get("backend.sharingProfile", "off") as string,
    };
  }

  private extractTeamServerSettings(settings: any, sharingProfile: string): any {
    return { enabled: settings?.sharingServerEnabled ?? false, endpointUrl: settings?.sharingServerEndpointUrl ?? "", sharingProfile };
  }

  private extractWorkspaceIdsFromFiles(sessionFiles: string[]): Set<string> {
    const workspaceIds = new Set<string>();
    for (const file of sessionFiles) {
      const parts = file.split(/[\\\/]/);
      const idx = parts.findIndex((p) => p.toLowerCase() === "workspacestorage");
      if (idx >= 0 && idx < parts.length - 1) {
        const workspaceId = parts[idx + 1];
        if (workspaceId && workspaceId.length > 10) { workspaceIds.add(workspaceId); }
      }
    }
    return workspaceIds;
  }


  private getDiagnosticReportHtml(
    webview: vscode.Webview,
    report: string,
    sessionFiles: { file: string; size: number; modified: string }[],
    detailedSessionFiles: SessionFileDetails[],
    sessionFolders: { dir: string; count: number }[] = [],
    backendStorageInfo: any = null,
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "diagnostics.js"),
    );
    const cacheSizeInMB = this.resolveCacheSizeInMB();
    const persistedCacheSummary = this.resolvePersistedCacheSummary();
    const storageFilePath = this.findGlobalStateStoragePath();

    const cacheInfo = {
      size: this.cacheManager.cache.size,
      sizeInMB: cacheSizeInMB,
      lastUpdated: this.cacheManager.cache.size > 0 ? new Date().toISOString() : null,
      location: persistedCacheSummary,
      storagePath: storageFilePath,
    };

    const inspector = require('inspector') as { url(): string | undefined };
    const isDebugMode = inspector.url() !== undefined;
    const globalStateCounters = {
      openCount: this.context.globalState.get<number>('extension.openCount') ?? 0,
      unknownMcpOpenCount: this.context.globalState.get<number>('extension.unknownMcpOpenCount') ?? 0,
      fluencyBannerDismissed: this.context.globalState.get<boolean>('news.fluencyScoreBanner.v1.dismissed') ?? false,
      unknownMcpDismissedVersion: this.context.globalState.get<string>('news.unknownMcpTools.dismissedVersion') ?? '',
    };

    const initialData = JSON.stringify({
      report, sessionFiles, detailedSessionFiles, sessionFolders,
      cacheInfo, backendStorageInfo,
      backendConfigured: this.isBackendConfigured(), isDebugMode, globalStateCounters,
      displaySettings: { showTokens: this.getStatusBarShowTokensSetting(), showCost: this.getStatusBarShowCostSetting(), monthlyBudget: this.getMonthlyBudgetSetting() },
      quotaEntitlements: this._copilotQuotaEntitlements,
      toolCallStats: this.lastUsageAnalysisStats?.last30Days?.toolCalls ?? null,
      toolFamilies: getToolFamilies(),
    }).replace(/</g, "\\u003c");

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>Diagnostic Report</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_DIAGNOSTICS__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			${this.getLocalViewRegressionProbeScript('diagnostics', nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  private resolveCacheSizeInMB(): number {
    try {
      const cacheData = Object.fromEntries(this.cacheManager.cache);
      const jsonString = JSON.stringify(cacheData);
      return (jsonString.length * 2) / (1024 * 1024);
    } catch {
      return 0;
    }
  }

  private resolvePersistedCacheSummary(): string {
    try {
      const snapshotPath = this.cacheManager.getSharedSnapshotPath();
      const entries = this.cacheManager.cache.size;
      return `Disk snapshot: ${snapshotPath} (${entries} entr${entries === 1 ? 'y' : 'ies'} in-memory)`;
    } catch {
      return "Error reading cache snapshot path";
    }
  }

  private findGlobalStateStoragePath(): string | null {
    try {
      const extensionIds = ["RobBos.ai-engineering-fluency", "RobBos.copilot-token-tracker"];
      const userPaths = getVSCodeUserPaths();
      for (const userPath of userPaths) {
        for (const extId of extensionIds) {
          const result = this.tryFindGlobalStateFile(userPath, extId);
          if (result) { return result; }
        }
      }
    } catch { /* ignore */ }
    return null;
  }

  private tryFindGlobalStateFile(userPath: string, extId: string): string | null {
    try {
      const candidate = path.join(userPath, "globalStorage", extId);
      if (fs.existsSync(candidate)) {
        const match = fs.readdirSync(candidate).find((f) => f.includes("state") || f.endsWith(".vscdb") || f.endsWith(".json"));
        if (match) { return path.join(candidate, match); }
      }
    } catch { /* ignore path access errors */ }
    return null;
  }

  private buildChartData(fullDailyStats: DailyTokenStats[]): ChartDataPayload {
    return _buildChartData(fullDailyStats, {
      getRepoDisplayName: _getRepoDisplayName,
      calculateEstimatedCost: (modelUsage, pricingSource) => _calculateEstimatedCost(modelUsage, this.modelPricing, pricingSource),
      backendConfigured: this.isBackendConfigured(),
      compactNumbers: this.getCompactNumbersSetting(),
    });
  }

  private getChartHtml(
    webview: vscode.Webview,
    dailyStats: DailyTokenStats[],
    periodsReady = true,
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "chart.js"),
    );

    const chartData = { ...this.buildChartData(dailyStats), periodsReady, initialPeriod: this.lastChartPeriod, initialView: this.lastChartView, initialMetric: this.lastChartMetric, initialSplit: this.lastChartSplit, monthlyBudget: this.getEffectiveMonthlyBudget() };

    const initialData = JSON.stringify(chartData).replace(/</g, "\\u003c");

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>AI Engineering Fluency — Chart</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_CHART__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			${this.getLocalViewRegressionProbeScript('chart', nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  private getUsageAnalysisHtml(
    webview: vscode.Webview,
    stats: UsageAnalysisStats | null,
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "usage.js"),
    );

    // Detect user's locale for number formatting
    const localeFromEnv =
      process.env.LC_ALL || process.env.LC_NUMERIC || process.env.LANG;
    const vscodeLanguage = vscode.env.language; // e.g., 'en', 'nl', 'de'
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;

    this.log(`[Locale Detection] VS Code language: ${vscodeLanguage}`);
    this.log(
      `[Locale Detection] Environment locale: ${localeFromEnv || "not set"}`,
    );
    this.log(`[Locale Detection] Intl default: ${intlLocale}`);

    const detectedLocale = (stats?.locale) || localeFromEnv || intlLocale;
    this.log(`[Usage Analysis] Extension detected locale: ${detectedLocale}`);
    this.log(
      `[Usage Analysis] Test format 1234567.89: ${new Intl.NumberFormat(detectedLocale).format(1234567.89)}`,
    );

    const suppressedUnknownTools = vscode.workspace
      .getConfiguration('aiEngineeringFluency')
      .get<string[]>('suppressedUnknownTools', []);

    const initialData = stats ? JSON.stringify({
      today: stats.today,
      last30Days: stats.last30Days,
      month: stats.month,
      lastMonth: stats.lastMonth,
      locale: detectedLocale,
      customizationMatrix: stats.customizationMatrix || null,
      missedPotential: stats.missedPotential || [],
      lastUpdated: stats.lastUpdated.toISOString(),
      backendConfigured: this.isBackendConfigured(),
      currentWorkspacePaths: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [],
      suppressedUnknownTools,
      todaySessions: stats.todaySessions || [],
      use24HourTime: this.getUse24HourTimeSetting(),
      insights: this.buildCurrentInsights(stats),
    }).replace(/</g, "\\u003c") : 'null';

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			${buildCspMeta(webview, nonce)}
			<title>Usage Analysis</title>
		</head>
		<body>
			<div id="root"></div>
			<script nonce="${nonce}">window.__INITIAL_USAGE__ = ${initialData};</script>
			${this.extensionPointButtonsScript(nonce)}
			${this.getLocalViewRegressionProbeScript('usage', nonce)}
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  public dispose(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.stopRefreshHeartbeat();
    if (this._followerResyncTimer) {
      clearTimeout(this._followerResyncTimer);
      this._followerResyncTimer = undefined;
    }
    // Release the refresh leader lock if this window held it, so another window can
    // take over promptly instead of waiting for the stale-lock timeout.
    void this.cacheManager.releaseRefreshLock().catch(() => { /* best-effort */ });
    if (this.detailsPanel) {
      this.detailsPanel.dispose();
    }
    if (this.chartPanel) {
      this.chartPanel.dispose();
    }
    if (this.analysisPanel) {
      this.analysisPanel.dispose();
    }
    if (this.maturityPanel) {
      this.maturityPanel.dispose();
    }
    // Save cache to storage before disposing (fire-and-forget async operation)
    // Note: Cache loss during abnormal shutdown is acceptable as it will rebuild on next startup
    // We can't await here since dispose() is synchronous
    void (async () => {
      try {
        await this.saveCacheToStorage();
      } catch (err) {
        // Output channel will be disposed, so log to console as fallback
        console.error("Error saving cache during disposal:", err);
      }
    })();
    if (this.logViewerPanel) {
      this.logViewerPanel.dispose();
    }
    if (this.diagnosticsPanel) {
      this.diagnosticsPanel.dispose();
    }
    this.openCode.dispose();
    this.statusBarItem.dispose();
    this.insightsStatusBarItem.dispose();
    this._disposed = true;
    this.outputChannel.dispose();
  }
}

const SETTINGS_MIGRATION_DONE_KEY = 'settingsMigrationFromCopilotTokenTrackerDone';

/**
 * One-time migration: copies any user-set values from the old `copilotTokenTracker.*` namespace
 * to the new `aiEngineeringFluency.*` namespace.  The old settings remain in package.json
 * with `deprecationMessage` so VS Code continues to show them as deprecated; this function
 * handles users who already had values configured before the rename.
 *
 * Uses globalState to record completion so the migration only runs once.
 */
async function migrateSettingsIfNeeded(context: vscode.ExtensionContext, log: (m: string) => void): Promise<void> {
  if (context.globalState.get<boolean>(SETTINGS_MIGRATION_DONE_KEY)) {
    return;
  }
  const keys = [
    'display.compactNumbers',
    'backend.enabled',
    'backend.backend',
    'backend.authMode',
    'backend.datasetId',
    'backend.sharingProfile',
    'backend.userId',
    'backend.shareWithTeam',
    'backend.shareWorkspaceMachineNames',
    'backend.shareConsentAt',
    'backend.userIdentityMode',
    'backend.userIdMode',
    'backend.subscriptionId',
    'backend.resourceGroup',
    'backend.storageAccount',
    'backend.aggTable',
    'backend.eventsTable',
    'backend.lookbackDays',
    'backend.includeMachineBreakdown',
    'backend.blobUploadEnabled',
    'backend.blobContainerName',
    'backend.blobUploadFrequencyHours',
    'backend.blobCompressFiles',
    'sampleDataDirectory',
    'suppressedUnknownTools',
  ];

  const oldCfg = vscode.workspace.getConfiguration('copilotTokenTracker');
  const newCfg = vscode.workspace.getConfiguration('aiEngineeringFluency');

  let migrated = 0;
  for (const key of keys) {
    const insp = oldCfg.inspect(key);
    if (insp?.globalValue !== undefined) {
      await newCfg.update(key, insp.globalValue, vscode.ConfigurationTarget.Global);
      migrated++;
    }
    if (insp?.workspaceValue !== undefined) {
      await newCfg.update(key, insp.workspaceValue, vscode.ConfigurationTarget.Workspace);
      migrated++;
    }
  }

  if (migrated > 0) {
    log(`Migrated ${migrated} setting(s) from 'copilotTokenTracker' to 'aiEngineeringFluency' namespace.`);
  }

  await context.globalState.update(SETTINGS_MIGRATION_DONE_KEY, true);
}

const SECRETS_MIGRATION_DONE_KEY = 'secretsMigrationFromCopilotTokenTrackerDone';

/**
 * One-time migration: copies any stored shared key secret from the old
 * `copilotTokenTracker.backend.storageSharedKey:*` SecretStorage key to the new
 * `aiEngineeringFluency.backend.storageSharedKey:*` key.
 *
 * Uses globalState to record completion so the migration only runs once.
 */
async function migrateSecretsIfNeeded(context: vscode.ExtensionContext, log: (m: string) => void): Promise<void> {
  if (context.globalState.get<boolean>(SECRETS_MIGRATION_DONE_KEY)) {
    return;
  }

  try {
    const storageAccount = vscode.workspace.getConfiguration('aiEngineeringFluency').get<string>('backend.storageAccount', '');
    if (storageAccount) {
      const oldKey = `copilotTokenTracker.backend.storageSharedKey:${storageAccount}`;
      const newKey = `aiEngineeringFluency.backend.storageSharedKey:${storageAccount}`;
      const existingSecret = await context.secrets.get(oldKey);
      if (existingSecret) {
        await context.secrets.store(newKey, existingSecret);
        await context.secrets.delete(oldKey);
        log(`Migrated shared key secret for storage account '${storageAccount}' to new key name.`);
      }
    }
  } catch (error) {
    log(`Error migrating secrets: ${error}`);
  }

  await context.globalState.update(SECRETS_MIGRATION_DONE_KEY, true);
}

const NEW_EXTENSION_ID = 'RobBos.ai-engineering-fluency';
const LEGACY_EXTENSION_ID = 'RobBos.copilot-token-tracker';

/**
 * When running as the new ai-engineering-fluency extension, checks whether the legacy
 * copilot-token-tracker extension is also installed and shows a one-time prompt to
 * uninstall it. The old extension already skips its own activation when the new one
 * is present, but this gives users a clear nudge to clean up.
 */
async function checkForLegacyExtensionConflict(context: vscode.ExtensionContext): Promise<void> {
  if (context.extension.id !== NEW_EXTENSION_ID) {
    return;
  }
  const legacyExt = vscode.extensions.getExtension(LEGACY_EXTENSION_ID);
  if (!legacyExt) {
    return;
  }
  // v2: reworded to clarify which extension to keep vs. remove (v1 was ambiguous due to similar names)
  const key = 'conflict.legacyExtensionPresent.v2.dismissed';
  if (context.globalState.get<boolean>(key, false)) {
    return;
  }
  const choice = await vscode.window.showWarningMessage(
    'Cleanup needed: the old "copilot-token-tracker" extension is still installed alongside this one. ' +
    'Keep "AI Engineering Fluency" (this extension) and remove the old one — it has been disabled automatically.',
    'Remove Old Extension',
    'Dismiss'
  );
  if (choice === 'Remove Old Extension') {
    try {
      await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', LEGACY_EXTENSION_ID);
    } catch {
      vscode.window.showInformationMessage(
        'To finish cleanup: open Extensions (Ctrl+Shift+X), search for "copilot-token-tracker", and uninstall it. Keep "AI Engineering Fluency".'
      );
    }
  } else if (choice === 'Dismiss') {
    // Only suppress on explicit Dismiss — closing with ✕ shows again next startup.
    await context.globalState.update(key, true);
  }
}

function createBackendFacade(context: vscode.ExtensionContext, tokenTracker: CopilotTokenTracker): BackendFacade {
  return new BackendFacade({
    context,
    log: (m: string) => tokenTracker.log(m),
    warn: (m: string) => tokenTracker.warn(m),
    updateTokenStats: async () => { await tokenTracker.updateTokenStats(); },
    calculateEstimatedCost: (modelUsage: ModelUsage) => tokenTracker.calculateEstimatedCost(modelUsage),
    co2Per1kTokens: 0.2,
    waterUsagePer1kTokens: 0.3,
    co2AbsorptionPerTreePerYear: 21000,
    getCopilotSessionFiles: () =>
      tokenTracker.sessionDiscovery.getCopilotSessionFiles(),
    estimateTokensFromText: (text: string, model?: string) =>
      tokenTracker.estimateTokensFromText(text, model),
    getModelFromRequest: (req: any) =>
      tokenTracker.getModelFromRequest(req),
    getSessionFileDataCached: (p: string, m: number, s: number) =>
      tokenTracker.getSessionFileDataCached(p, m, s),
    statSessionFile: (sessionFile: string) =>
      tokenTracker.statSessionFile(sessionFile),
    isOpenCodeSession: (sessionFile: string) =>
      tokenTracker.openCode.isOpenCodeSessionFile(sessionFile),
    getOpenCodeSessionData: (sessionFile: string) =>
      tokenTracker.openCode.getOpenCodeSessionData(sessionFile),
    isCrushSession: (sessionFile: string) =>
      tokenTracker.crush.isCrushSessionFile(sessionFile),
    getCrushSessionData: (sessionFile: string) =>
      tokenTracker.crush.getCrushSessionData(sessionFile),
    isVSSessionFile: (sessionFile: string) =>
      tokenTracker.visualStudio.isVSSessionFile(sessionFile),
    getGithubToken: () => tokenTracker.githubSession?.accessToken,
  });
}

function setupBackend(context: vscode.ExtensionContext, tokenTracker: CopilotTokenTracker): void {
  try {
    const backendFacade = createBackendFacade(context, tokenTracker);

    const backendHandler = new BackendCommandHandler({
      facade: backendFacade as any,
      integration: undefined,
      calculateEstimatedCost: (mu: any) => 0,
      warn: (m: string) => tokenTracker.warn(m),
      log: (m: string) => tokenTracker.log(m),
    });

    // Store backend facade in the tracker instance for dashboard access
    tokenTracker.backend = backendFacade;

    const configureBackendCommand = vscode.commands.registerCommand(
      "aiEngineeringFluency.configureBackend",
      async () => {
        await backendHandler.handleConfigureBackend();
      },
    );

    context.subscriptions.push(configureBackendCommand);

    const configureTeamServerCommand = vscode.commands.registerCommand(
      "aiEngineeringFluency.configureTeamServer",
      async () => {
        TeamServerConfigPanel.show(context);
      },
    );

    context.subscriptions.push(configureTeamServerCommand);
  } catch (err) {
    // If backend wiring fails for any reason, don't block activation - fall back to settings behavior.
    tokenTracker.warn(
      "Failed to wire backend commands: " + String(err),
    );
  }
}

function registerViewCommands(context: vscode.ExtensionContext, tokenTracker: CopilotTokenTracker): void {
  const refreshCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.refresh",
    async () => {
      tokenTracker.log("Refresh command called");
      await tokenTracker.updateTokenStats();
      vscode.window.showInformationMessage("AI Engineering Fluency data refreshed");
    },
  );

  const showDetailsCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showDetails",
    async () => {
      tokenTracker.log("Show details command called");
      await tokenTracker.showDetails();
    },
  );

  const showChartCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showChart",
    async () => {
      tokenTracker.log("Show chart command called");
      await tokenTracker.showChart();
    },
  );

  const showUsageAnalysisCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showUsageAnalysis",
    async () => {
      tokenTracker.log("Show usage analysis command called");
      await tokenTracker.showUsageAnalysis();
    },
  );

  const openInsightsTabCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.openInsightsTab",
    async () => {
      tokenTracker.log("Open Insights tab command called");
      await tokenTracker.showUsageAnalysisOnInsightsTab();
    },
  );

  const showMaturityCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showMaturity",
    async () => {
      tokenTracker.log("Show maturity command called");
      await tokenTracker.showMaturity();
    },
  );

  const showDashboardCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showDashboard",
    async () => {
      tokenTracker.log("Show dashboard command called");
      await tokenTracker.showDashboard();
    },
  );

  const showEnvironmentalCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showEnvironmental",
    async () => {
      tokenTracker.log("Show environmental impact command called");
      await tokenTracker.showEnvironmental();
    },
  );

  context.subscriptions.push(
    refreshCommand,
    showDetailsCommand,
    showChartCommand,
    showUsageAnalysisCommand,
    openInsightsTabCommand,
    showMaturityCommand,
    showDashboardCommand,
    showEnvironmentalCommand,
  );
}

function formatWindsurfDiagnosticsContent(diagnostics: any): string {
  return `# Windsurf Diagnostics Report

Generated: ${new Date().toISOString()}

## Environment
- Running in Windsurf: ${diagnostics.environment.isRunningInWindsurf}
- App Name: ${diagnostics.environment.appName}

## Extension Status
- Extension Found: ${diagnostics.extension.found}
- Extension Active: ${diagnostics.extension.active}
- Extension Version: ${diagnostics.extension.packageJSON}

## Credentials
- Available: ${diagnostics.credentials.available}
- Port: ${diagnostics.credentials.port}
- CSRF Token Length: ${diagnostics.credentials.csrfLength}

## API Connectivity Test
- Success: ${diagnostics.apiTest.success}
- Status Code: ${diagnostics.apiTest.statusCode}
- Error: ${diagnostics.apiTest.error || 'None'}

## Configuration
- Windsurf Integration Enabled: ${diagnostics.configuration.enabled}

## Sessions
- Available: ${diagnostics.sessions.available}
- Count: ${diagnostics.sessions.count}
- Error: ${diagnostics.sessions.error || 'None'}

## Recommendations

${!diagnostics.extension.found ? '- Install the Windsurf extension\n' : ''}${!diagnostics.extension.active ? '- Activate the Windsurf extension or restart Windsurf\n' : ''}${!diagnostics.credentials.available ? '- Check if Windsurf language server is running\n' : ''}${!diagnostics.apiTest.success ? `- API connectivity issue: ${diagnostics.apiTest.error}\n` : ''}${diagnostics.sessions.count === 0 && diagnostics.apiTest.success ? '- Windsurf is working correctly, but no chat sessions have been created yet. Try starting a chat session in Windsurf and then refresh the token tracker.\n' : ''}
`;
}

async function handleWindsurfDiagnosticsCommand(tokenTracker: CopilotTokenTracker): Promise<void> {
  try {
    const diagnostics = await tokenTracker.windsurf.runDiagnostics();
    const doc = await vscode.workspace.openTextDocument({
      content: formatWindsurfDiagnosticsContent(diagnostics),
      language: 'markdown'
    });
    await vscode.window.showTextDocument(doc);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to run Windsurf diagnostics: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function registerDiagnosticAndAuthCommands(context: vscode.ExtensionContext, tokenTracker: CopilotTokenTracker): void {
  const showFluencyLevelViewerCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.showFluencyLevelViewer",
    async () => {
      tokenTracker.log("Show fluency level viewer command called");
      await tokenTracker.showFluencyLevelViewer();
    },
  );

  const runLocalViewRegressionCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.runLocalViewRegression",
    async () => {
      tokenTracker.log("Run local view regression command called");
      await tokenTracker.runLocalViewRegression();
    },
  );

  // Register the generate diagnostic report command
  const generateDiagnosticReportCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.generateDiagnosticReport",
    async () => {
      tokenTracker.log("Generate diagnostic report command called");
      await tokenTracker.showDiagnosticReport();
    },
  );

  // Register the clear cache command
  const clearCacheCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.clearCache",
    async () => {
      tokenTracker.log("Clear cache command called");
      await tokenTracker.clearCache();
    },
  );

  // Register the GitHub authentication command
  const authenticateGitHubCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.authenticateGitHub",
    async () => {
      tokenTracker.log("GitHub authentication command called");
      await tokenTracker.authenticateWithGitHub();
    },
  );

  const signOutGitHubCommand = vscode.commands.registerCommand(
    "aiEngineeringFluency.signOutGitHub",
    async () => {
      tokenTracker.log("GitHub sign out command called");
      await tokenTracker.signOutFromGitHub();
    },
  );

  const windsurfDiagnosticsCommand = vscode.commands.registerCommand(
    "copilot-token-tracker.checkWindsurfStatus",
    async () => {
      tokenTracker.log("Windsurf diagnostics command called");
      await handleWindsurfDiagnosticsCommand(tokenTracker);
    },
  );

  context.subscriptions.push(
    showFluencyLevelViewerCommand,
    runLocalViewRegressionCommand,
    generateDiagnosticReportCommand,
    clearCacheCommand,
    authenticateGitHubCommand,
    signOutGitHubCommand,
    windsurfDiagnosticsCommand,
  );
}

export async function activate(context: vscode.ExtensionContext): Promise<AiFluencyExtensionApi> {
  // Create the token tracker
  const tokenTracker = new CopilotTokenTracker(context.extensionUri, context);

  // Migrate settings from the old copilotTokenTracker namespace to aiEngineeringFluency.
  // Run before any other settings are read so the new keys are populated first.
  await migrateSettingsIfNeeded(context, (m) => tokenTracker.log(m));

  // Pre-fill toolFamilies setting with defaults so users have a starting point for customisation.
  const cfg = vscode.workspace.getConfiguration('aiEngineeringFluency');
  const existingFamilies = cfg.get<unknown[]>('toolFamilies');
  if (!existingFamilies || existingFamilies.length === 0) {
    await cfg.update('toolFamilies', DEFAULT_TOOL_FAMILIES, vscode.ConfigurationTarget.Global);
  }

  // Migrate any stored shared key secrets from the old key name to the new key name.
  await migrateSecretsIfNeeded(context, (m) => tokenTracker.log(m));

  // If the legacy extension is also installed, nudge the user to uninstall it.
  // Fire-and-forget: don't block activation on the user's response.
  void (async () => {
    try {
      await checkForLegacyExtensionConflict(context);
    } catch {
      /* ignore */
    }
  })();

  setupBackend(context, tokenTracker);
  registerViewCommands(context, tokenTracker);
  registerDiagnosticAndAuthCommands(context, tokenTracker);

  context.subscriptions.push(tokenTracker);

  tokenTracker.log("Extension activation complete");

  return {
    registerButton: (button: ExtensionPointButton, handler: () => void | Promise<void>) =>
      tokenTracker.registerExtensionPointButton(button, handler),
  };
}

export function deactivate() {
  // Extension cleanup is handled in the CopilotTokenTracker class
}
