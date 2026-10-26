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

export const BADGE_BUTTON_HIDDEN_KEY = 'badge.buttonHidden';

/**
 * Registers the "Show Badge Setup" command and the Badge button in every panel's button row.
 * People without a badge can hide the button (and so the view); the restore command brings it back.
 */
export function registerBadgeSetup(context: vscode.ExtensionContext, host: BadgeSetupHost): void {
	let buttonRegistration: { dispose(): void } | undefined;
	const panel: BadgeSetupPanel = new BadgeSetupPanel({
		context,
		getSnapshot: () => host.getBadgeSnapshot(),
		openView: (view) => host.openView(view),
		log: (message) => host.log(message),
		hideButton: () => hideButton(),
	});
	const open = () => panel.show();

	const showButton = () => {
		buttonRegistration ??= host.registerExtensionPointButton({ id: 'ai-fluency-badge-setup', label: t('badge.button.label') }, open);
	};
	const hideButton = async () => {
		buttonRegistration?.dispose();
		buttonRegistration = undefined;
		panel.dispose();
		await context.globalState.update(BADGE_BUTTON_HIDDEN_KEY, true);
		void vscode.window.showInformationMessage(t('badge.hide.notice'));
	};
	const restoreButton = async () => {
		await context.globalState.update(BADGE_BUTTON_HIDDEN_KEY, false);
		showButton();
	};

	if (!context.globalState.get<boolean>(BADGE_BUTTON_HIDDEN_KEY, false)) { showButton(); }
	context.subscriptions.push(
		vscode.commands.registerCommand('aiEngineeringFluency.showBadgeSetup', open),
		vscode.commands.registerCommand('aiEngineeringFluency.hideBadgeSetup', hideButton),
		vscode.commands.registerCommand('aiEngineeringFluency.restoreBadgeSetup', restoreButton),
		{ dispose: () => { buttonRegistration?.dispose(); panel.dispose(); } },
	);
}
