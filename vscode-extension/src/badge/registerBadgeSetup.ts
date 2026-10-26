import * as vscode from 'vscode';
import { t } from '../l10n';
import type { FeatureViewId } from '../whatsNew/catalog';
import { BadgeSetupPanel, type BadgeSnapshot } from './badgeSetupPanel';

export type { BadgeSnapshot };

/** The slice of the token tracker the Badge setup view needs, so this module does not import `extension.ts`. */
export interface BadgeSetupHost {
	log(message: string): void;
	openView(view: FeatureViewId): Promise<void>;
	getBadgeSnapshot(): Promise<BadgeSnapshot>;
	registerExtensionPointButton(button: { id: string; label: string }, handler: () => void | Promise<void>): { dispose(): void };
}

/** Registers the "Show Badge Setup" command and the Badge button in every panel's button row. */
export function registerBadgeSetup(context: vscode.ExtensionContext, host: BadgeSetupHost): void {
	const panel = new BadgeSetupPanel({
		context,
		getSnapshot: () => host.getBadgeSnapshot(),
		openView: (view) => host.openView(view),
		log: (message) => host.log(message),
	});
	const open = () => panel.show();
	context.subscriptions.push(
		vscode.commands.registerCommand('aiEngineeringFluency.showBadgeSetup', open),
		host.registerExtensionPointButton({ id: 'ai-fluency-badge-setup', label: t('badge.button.label') }, open),
		{ dispose: () => panel.dispose() },
	);
}
