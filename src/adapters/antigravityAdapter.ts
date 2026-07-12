import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as inspector from 'inspector';
import type { ModelUsage, ChatTurn } from '../types';
import type {
IEcosystemAdapter,
IDiscoverableEcosystem,
IAnalyzableEcosystem,
DiscoveryResult,
CandidatePath,
UsageAnalysisAdapterContext,
} from '../ecosystemAdapter';
import { AntigravityDataAccess } from '../antigravity';
import { createEmptySessionUsageAnalysis } from '../usageAnalysis';

export class AntigravityAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
readonly id = 'antigravity';
readonly displayName = 'Antigravity';

constructor(
private readonly antigravity: AntigravityDataAccess,
private readonly estimateTokens: (text: string, model?: string) => number = () => 0
) {}

handles(sessionFile: string): boolean {
return this.antigravity.isAntigravitySessionFile(sessionFile);
}

getBackingPath(sessionFile: string): string {
return sessionFile;
}

async stat(sessionFile: string): Promise<fs.Stats> {
return fs.promises.stat(sessionFile);
}

async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
const result = await this.antigravity.estimateTokensFromAntigravitySession(sessionFile, this.estimateTokens);
return { ...result, actualTokens: 0 }; // actualTokens stays 0 — these are estimates, not API counts
}

async countInteractions(sessionFile: string): Promise<number> {
return this.antigravity.countAntigravityInteractions(sessionFile);
}

async getModelUsage(_sessionFile: string): Promise<ModelUsage> {
return {};
}

async getMeta(sessionFile: string): Promise<{
title: string | undefined;
firstInteraction: string | null;
lastInteraction: string | null;
workspacePath?: string;
}> {
return this.antigravity.getAntigravitySessionMeta(sessionFile);
}

getEditorRoot(_sessionFile: string): string {
return this.antigravity.getAntigravityBrainDir();
}

async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
return this.antigravity.buildAntigravityTurns(sessionFile);
}

async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
const candidatePaths = this.getCandidatePaths();
const sessionFiles: string[] = [];
const brainDir = this.antigravity.getAntigravityBrainDir();

if (inspector.url()) {
log(`🔍 [Antigravity] Checking brain dir: ${brainDir}`);
}
try {
const files = await this.antigravity.getAntigravitySessionFiles();
if (inspector.url()) {
log(`🔍 [Antigravity] Found ${files.length} transcript(s)`);
}
if (files.length > 0) {
log(`📄 Found ${files.length} session file(s) in Antigravity (~/.gemini/antigravity/brain/*/)`);
sessionFiles.push(...files);
}
} catch (error) {
log(`Could not read Antigravity session files: ${error}`);
}

return { sessionFiles, candidatePaths };
}

getCandidatePaths(): CandidatePath[] {
return [
{
path: this.antigravity.getAntigravityBrainDir(),
source: 'Antigravity (brain/)',
},
];
}

async analyzeUsage(sessionFile: string, _ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
const analysis = createEmptySessionUsageAnalysis();
const session = await this.antigravity.readAntigravitySession(sessionFile);

// Count each USER_INPUT as one CLI interaction.
analysis.modeUsage.cli += session.userEntries.length;

// Count tool calls from PLANNER_RESPONSE entries.
for (const entry of session.modelEntries) {
if (!Array.isArray(entry.tool_calls)) { continue; }
for (const tc of entry.tool_calls) {
if (!tc.name) { continue; }
analysis.toolCalls.total++;
analysis.toolCalls.byTool[tc.name] = (analysis.toolCalls.byTool[tc.name] || 0) + 1;
}
}

// No model info available — model switching stats stay empty.
analysis.modelSwitching.uniqueModels = [];
analysis.modelSwitching.modelCount = 0;
analysis.modelSwitching.totalRequests = 0;
analysis.modelSwitching.switchCount = 0;

return analysis;
}
}
