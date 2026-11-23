import * as fs from 'fs';
import * as path from 'path';
import type { ModelUsage, ChatTurn } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { KiloDataAccess } from '../kilo';
import { createEmptySessionUsageAnalysis } from '../usageAnalysis';
import { pathExists } from '../utils/fsAsync';
import { isUnsafeObjectKey } from '../utils/protoGuard';
import { applyModelSwitchingStats } from './modelSwitching';
import { buildOpenCodeFamilyTurns } from './openCodeFamilyTurns';

export class KiloAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'kilo';
	readonly reportsCacheReads = true;
	readonly displayName = 'Kilo Code';

	constructor(private readonly kilo: KiloDataAccess) { }

	handles(sessionFile: string): boolean {
		return this.kilo.isKiloSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		// All Kilo Code sessions are DB-backed; the backing file is kilo.db itself.
		return this.kilo.getKiloDbPath();
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return this.kilo.statSessionFile(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.kilo.getTokensFromKiloSession(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return this.kilo.countKiloInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return this.kilo.getKiloModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		const timestamps: number[] = [];
		let title: string | undefined;
		let workspacePath: string | undefined;

		const session = await this.readKiloSessionData(sessionFile);
		if (session) {
			title = session.title || session.slug;
			workspacePath = session.directory || undefined;
			if (session.time?.created) { timestamps.push(session.time.created); }
			if (session.time?.updated) { timestamps.push(session.time.updated); }
		}

		const messages = await this.kilo.getKiloMessagesForSession(sessionFile);
		for (const msg of messages) {
			if (msg.time?.created) { timestamps.push(msg.time.created); }
			if (msg.time?.completed) { timestamps.push(msg.time.completed); }
		}

		timestamps.sort((a, b) => a - b);
		return {
			title,
			firstInteraction: timestamps.length > 0 ? new Date(timestamps[0]).toISOString() : null,
			lastInteraction: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toISOString() : null,
			workspacePath,
		};
	}

	private async readKiloSessionData(sessionFile: string): Promise<any> {
		const sessionId = this.kilo.getKiloSessionId(sessionFile);
		if (!sessionId) { return null; }
		return this.kilo.readKiloDbSession(sessionId);
	}

	getEditorRoot(_sessionFile: string): string {
		return this.kilo.getKiloDataDir();
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		const dataDir = this.kilo.getKiloDataDir();
		const dbPath = this.kilo.getKiloDbPath();

		// All Kilo Code sessions live in the SQLite database.
		log(`📁 Checking Kilo Code DB path: ${dbPath}`);
		const dbExists = await pathExists(dbPath);
		if (dbExists) {
			try {
				const dbSessionIds = await this.kilo.discoverKiloDbSessions();
				for (const sessionId of dbSessionIds) {
					sessionFiles.push(path.join(dataDir, `kilo.db#${sessionId}`));
				}
				if (dbSessionIds.length > 0) {
					log(`📄 Found ${dbSessionIds.length} session(s) in Kilo Code database`);
				}
			} catch (err) {
				log(`Kilo Code DB exists but could not be read: ${err}`);
			}
		}

		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [
			{ path: this.kilo.getKiloDbPath(), source: 'Kilo Code (DB)' },
		];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const messages = await this.kilo.getKiloMessagesForSession(sessionFile);
		const turns = await buildOpenCodeFamilyTurns(messages, messageId => this.kilo.getKiloPartsForMessage(messageId));
		return { turns };
	}

	async getSyncData(sessionFile: string): Promise<{ tokens: number; interactions: number; modelUsage: ModelUsage; timestamp: number }> {
		return this.kilo.getKiloSessionData(sessionFile);
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const messages = await this.kilo.getKiloMessagesForSession(sessionFile);
		const models: string[] = [];
		for (const msg of messages) {
			if (msg.role === 'user') { analysis.modeUsage.cli++; }
			if (msg.role === 'assistant') {
				await this.processKiloAssistantMessage(msg, analysis, models);
			}
		}
		if (models.length > 0) {
			applyModelSwitchingStats(analysis, models, ctx.modelPricing);
		}
		return analysis;
	}

	private async processKiloAssistantMessage(msg: any, analysis: import('../types').SessionUsageAnalysis, models: string[]): Promise<void> {
		models.push(msg.modelID || 'unknown');
		const parts = await this.kilo.getKiloPartsForMessage(msg.id);
		for (const part of parts) {
			if (part.type !== 'tool' || !part.tool) { continue; }
			if (typeof part.tool !== 'string' || isUnsafeObjectKey(part.tool)) { continue; }
			analysis.toolCalls.total++;
			analysis.toolCalls.byTool[part.tool] = (analysis.toolCalls.byTool[part.tool] || 0) + 1;
		}
	}
}
