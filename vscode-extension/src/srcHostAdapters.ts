/**
 * VS Code implementations of the editor-host services the shared `src/` modules
 * take as injected dependencies. `src/` itself never imports `vscode`; the
 * extension host builds these once and passes them in (see extension.ts).
 */
import * as vscode from 'vscode';
import type { SessionDiscoveryDeps } from '../../src/sessionDiscovery';
import type { WindsurfHost } from '../../src/windsurf';
import { discoverWslSessionFiles, isWslScanAllowedByEnvironment } from '../../src/wslDiscovery';

export function createWindsurfHost(): WindsurfHost {
	return {
		getAppName: () => vscode.env.appName,
		getExtension: (id) => vscode.extensions.getExtension(id),
		isEnabled: () => vscode.workspace.getConfiguration('aiEngineeringFluency').get<boolean>('windsurf.enabled', true),
	};
}

export function createSessionDiscoveryHost(): Pick<SessionDiscoveryDeps, 'getConfiguredSampleDataDirectory' | 'getExtensionStatus' | 'getExtraSessionFiles'> {
	return {
		getConfiguredSampleDataDirectory: () =>
			vscode.workspace.getConfiguration('aiEngineeringFluency').get<string>('sampleDataDirectory'),
		getExtensionStatus: (id) => vscode.extensions.getExtension(id),
		// Windows only; running WSL distros only (never starts one). Re-read on every scan so the setting applies without a reload.
		getExtraSessionFiles: async () =>
			isWslScanAllowedByEnvironment() && vscode.workspace.getConfiguration('aiEngineeringFluency').get<boolean>('wsl.scanRunningDistros', true)
				? discoverWslSessionFiles()
				: [],
	};
}
