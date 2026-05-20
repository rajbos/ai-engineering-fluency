/**
 * Shared factory for building the ordered adapter registry.
 *
 * Both the VS Code extension and the CLI use an identical list of ecosystem
 * adapters in the same order (first match wins). This factory centralises that
 * list so adding a new adapter only requires a single change here instead of
 * one change per consumer.
 */
import type { IEcosystemAdapter } from '../ecosystemAdapter';
import type { OpenCodeDataAccess } from '../opencode';
import type { CrushDataAccess } from '../crush';
import type { ContinueDataAccess } from '../continue';
import type { VisualStudioDataAccess } from '../visualstudio';
import type { ClaudeCodeDataAccess } from '../claudecode';
import type { ClaudeDesktopCoworkDataAccess } from '../claudedesktop';
import type { MistralVibeDataAccess } from '../mistralvibe';
import type { GeminiCliDataAccess } from '../geminicli';

import { OpenCodeAdapter } from './openCodeAdapter';
import { CrushAdapter } from './crushAdapter';
import { VisualStudioAdapter } from './visualStudioAdapter';
import { ContinueAdapter } from './continueAdapter';
import { ClaudeDesktopAdapter } from './claudeDesktopAdapter';
import { ClaudeCodeAdapter } from './claudeCodeAdapter';
import { MistralVibeAdapter } from './mistralVibeAdapter';
import { GeminiCliAdapter } from './geminiCliAdapter';
import { CopilotChatAdapter } from './copilotChatAdapter';
import { CopilotCliAdapter } from './copilotCliAdapter';
import { JetBrainsAdapter } from './jetbrainsAdapter';

/** Data-access instances and callbacks required to build the adapter registry. */
export interface AdapterRegistryDeps {
	openCode: OpenCodeDataAccess;
	crush: CrushDataAccess;
	continue_: ContinueDataAccess;
	visualStudio: VisualStudioDataAccess;
	claudeCode: ClaudeCodeDataAccess;
	claudeDesktopCowork: ClaudeDesktopCoworkDataAccess;
	mistralVibe: MistralVibeDataAccess;
	geminiCli: GeminiCliDataAccess;
	/** Estimates token count from raw text for a given model. */
	estimateTokens: (text: string, model?: string) => number;
	/** Returns true when the tool name identifies an MCP server tool. */
	isMcpTool: (toolName: string) => boolean;
	/** Extracts the MCP server name from a namespaced tool name. */
	extractMcpServerName: (toolName: string) => string;
}

/**
 * Builds the ordered registry of ecosystem adapters — first match wins.
 *
 * Centralises adapter instantiation so both the CLI and the VS Code extension
 * use identical registration order and constructor wiring.
 */
export function buildAdapterRegistry(deps: AdapterRegistryDeps): IEcosystemAdapter[] {
	return [
		new OpenCodeAdapter(deps.openCode),
		new CrushAdapter(deps.crush),
		new VisualStudioAdapter(deps.visualStudio, deps.estimateTokens),
		new ContinueAdapter(deps.continue_),
		new ClaudeDesktopAdapter(
			deps.claudeDesktopCowork,
			deps.isMcpTool,
			deps.extractMcpServerName,
			deps.estimateTokens
		),
		new ClaudeCodeAdapter(deps.claudeCode),
		new MistralVibeAdapter(deps.mistralVibe),
		new GeminiCliAdapter(deps.geminiCli),
		// Copilot Chat / CLI adapters: discovery-only. Their handles() returns
		// false so processSessionFile() falls through to the shared parser path
		// for VS Code Copilot Chat and CLI files. See issue #654.
		new CopilotChatAdapter(),
		new CopilotCliAdapter(),
		new JetBrainsAdapter(),
	];
}
