import * as vscode from 'vscode';
import { t } from './l10n';
import type { UsageHistoryStore } from './usageHistoryStore';

/** The slice of the token tracker the usage-history command needs, so this module does not import `extension.ts`. */
export interface UsageHistoryHost {
	log(message: string): void;
	updateTokenStats(): Promise<unknown>;
	readonly cacheManager: { readonly usageHistory: UsageHistoryStore };
}

/**
 * Registers "Clear Usage History": the only way kept usage of sessions whose files are gone is
 * dropped (issue #2728). Asks first, because those sessions can't be re-read once cleared.
 */
export function registerUsageHistoryCommands(context: vscode.ExtensionContext, host: UsageHistoryHost): void {
	context.subscriptions.push(vscode.commands.registerCommand('aiEngineeringFluency.clearUsageHistory', async () => {
		host.log('Clear usage history command called');
		const history = host.cacheManager.usageHistory;
		if (history.size === 0) {
			vscode.window.showInformationMessage(t('usageHistory.clear.empty'));
			return;
		}
		const confirm = t('usageHistory.clear.confirmButton');
		const choice = await vscode.window.showWarningMessage(t('usageHistory.clear.confirm', history.size), { modal: true }, confirm);
		if (choice !== confirm) { return; }
		await history.clear();
		host.log('Usage history cleared');
		await host.updateTokenStats();
		vscode.window.showInformationMessage(t('usageHistory.clear.done'));
	}));
}
