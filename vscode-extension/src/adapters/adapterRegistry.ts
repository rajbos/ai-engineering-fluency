/**
 * Shared factory for building the ordered adapter registry.
 *
 * Both the VS Code extension and the CLI use an identical list of ecosystem
 * adapters in the same order (first match wins). This factory centralises that
 * list so adding a new adapter only requires a single change here instead of
 * one change per consumer.
 *
 * When adding a new adapter:
 *  1. Import the data-access class below (concrete import).
 *  2. Add it to `AdapterRegistryDeps` (so both callers are reminded to pass it).
 *  3. Instantiate it in `createDataAccessInstances`.
 *  4. Wire the adapter instance into `buildAdapterRegistry`.
 */
import type { IEcosystemAdapter } from '../ecosystemAdapter';
import { OpenCodeDataAccess } from '../opencode';
import type { UriLike } from '../opencode';
import { CrushDataAccess } from '../crush';
import { ContinueDataAccess } from '../continue';
import { VisualStudioDataAccess } from '../visualstudio';
import { ClaudeCodeDataAccess } from '../claudecode';
import { ClaudeDesktopCoworkDataAccess } from '../claudedesktop';
import { MistralVibeDataAccess } from '../mistralvibe';
import { GeminiCliDataAccess } from '../geminicli';
import { AntigravityDataAccess } from '../antigravity';
import { PiDataAccess } from '../pi';
import { CursorDataAccess } from '../cursor';

import { OpenCodeAdapter } from './openCodeAdapter';
import { CrushAdapter } from './crushAdapter';
import { VisualStudioAdapter } from './visualStudioAdapter';
import { ContinueAdapter } from './continueAdapter';
import { ClaudeDesktopAdapter } from './claudeDesktopAdapter';
import { ClaudeCodeAdapter } from './claudeCodeAdapter';
import { MistralVibeAdapter } from './mistralVibeAdapter';
import { GeminiCliAdapter } from './geminiCliAdapter';
import { AntigravityAdapter } from './antigravityAdapter';
import { PiAdapter } from './piAdapter';
import { CursorAdapter } from './cursorAdapter';
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
antigravity: AntigravityDataAccess;
pi: PiDataAccess;
cursor: CursorDataAccess;
/** Estimates token count from raw text for a given model. */
estimateTokens: (text: string, model?: string) => number;
/** Returns true when the tool name identifies an MCP server tool. */
isMcpTool: (toolName: string) => boolean;
/** Extracts the MCP server name from a namespaced tool name. */
extractMcpServerName: (toolName: string) => string;
}

/**
 * The data-access instance subset of AdapterRegistryDeps — excludes the
 * callback functions (estimateTokens, isMcpTool, extractMcpServerName) that
 * differ between the CLI and the VS Code extension.
 */
export type DataAccessInstances = Omit<AdapterRegistryDeps, 'estimateTokens' | 'isMcpTool' | 'extractMcpServerName'>;

/**
 * Creates all data-access instances needed by the adapter registry.
 *
 * Centralises instantiation so adding a new adapter only requires changes
 * here, not in every consumer (CLI and VS Code extension).
 *
 * @param extensionUri - VS Code extension URI (or equivalent fake URI in the CLI)
 *   passed to data-access constructors that require it for WASM loading.
 */
export function createDataAccessInstances(extensionUri: UriLike): DataAccessInstances {
return {
openCode: new OpenCodeDataAccess(extensionUri),
crush: new CrushDataAccess(extensionUri),
continue_: new ContinueDataAccess(),
visualStudio: new VisualStudioDataAccess(),
claudeCode: new ClaudeCodeDataAccess(),
claudeDesktopCowork: new ClaudeDesktopCoworkDataAccess(),
mistralVibe: new MistralVibeDataAccess(),
geminiCli: new GeminiCliDataAccess(),
antigravity: new AntigravityDataAccess(),
pi: new PiDataAccess(),
cursor: new CursorDataAccess(extensionUri),
};
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
// Antigravity must come before GeminiCliAdapter because both live under ~/.gemini/
// and the Gemini CLI path check would not match Antigravity paths, but we place
// it here explicitly to make the ordering intention clear.
new AntigravityAdapter(deps.antigravity, deps.estimateTokens),
new GeminiCliAdapter(deps.geminiCli),
new PiAdapter(deps.pi),
new CursorAdapter(deps.cursor),
// Copilot Chat / CLI adapters: discovery-only. Their handles() returns
// false so processSessionFile() falls through to the shared parser path
// for VS Code Copilot Chat and CLI files. See issue #654.
new CopilotChatAdapter(),
new CopilotCliAdapter(),
new JetBrainsAdapter(),
];
}

