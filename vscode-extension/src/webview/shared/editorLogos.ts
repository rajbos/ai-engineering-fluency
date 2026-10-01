/**
 * Official product logos for the editors/tools we track, keyed by editor display name.
 *
 * The images live in the repo-root `assets/tool-logos/` folder (the same ones the README uses) and
 * are inlined as data URLs at build time, so webviews need no extra resources and the CSP's
 * `img-src data:` is enough. Editors without an official logo here fall back to the emoji from
 * `editorIcons.ts` — see {@link buildEditorLogo}.
 */
import antigravity from '../../../../assets/tool-logos/antigravity.svg';
import claudeCode from '../../../../assets/tool-logos/claude-code.svg';
import claude from '../../../../assets/tool-logos/claude.svg';
import clineDark from '../../../../assets/tool-logos/cline-dark.svg';
import cline from '../../../../assets/tool-logos/cline.svg';
import continueLogo from '../../../../assets/tool-logos/continue.png';
import crush from '../../../../assets/tool-logos/crush.svg';
import cursor from '../../../../assets/tool-logos/cursor.svg';
import devinDark from '../../../../assets/tool-logos/devin-dark.svg';
import devin from '../../../../assets/tool-logos/devin.svg';
import eclipseDark from '../../../../assets/tool-logos/eclipse-dark.svg';
import eclipse from '../../../../assets/tool-logos/eclipse.svg';
import gemini from '../../../../assets/tool-logos/gemini.svg';
import copilotDark from '../../../../assets/tool-logos/github-copilot-dark.svg';
import copilotLight from '../../../../assets/tool-logos/github-copilot.svg';
import hermesDark from '../../../../assets/tool-logos/hermes-dark.svg';
import hermes from '../../../../assets/tool-logos/hermes.svg';
import jetbrainsDark from '../../../../assets/tool-logos/jetbrains-dark.svg';
import jetbrains from '../../../../assets/tool-logos/jetbrains.svg';
import kiloDark from '../../../../assets/tool-logos/kilo-dark.svg';
import kilo from '../../../../assets/tool-logos/kilo.svg';
import kiro from '../../../../assets/tool-logos/kiro.svg';
import microsoft from '../../../../assets/tool-logos/microsoft.svg';
import mistral from '../../../../assets/tool-logos/mistral.svg';
import openaiDark from '../../../../assets/tool-logos/openai-dark.svg';
import openai from '../../../../assets/tool-logos/openai.svg';
import opencodeDark from '../../../../assets/tool-logos/opencode-dark.svg';
import opencode from '../../../../assets/tool-logos/opencode.svg';
import piDark from '../../../../assets/tool-logos/pi-dark.svg';
import pi from '../../../../assets/tool-logos/pi.svg';
import visualStudio from '../../../../assets/tool-logos/visual-studio.svg';
import vscode from '../../../../assets/tool-logos/vscode.svg';
import vscodium from '../../../../assets/tool-logos/vscodium.svg';
import windsurfDark from '../../../../assets/tool-logos/windsurf-dark.svg';
import windsurf from '../../../../assets/tool-logos/windsurf.svg';
import { getEditorIconByName } from '../../editorIcons';

/** A logo, with an optional variant for dark themes (used where the mark is a single flat colour). */
export interface EditorLogo {
	light: string;
	dark?: string;
}

const COPILOT: EditorLogo = { light: copilotLight, dark: copilotDark };
const CLAUDE_CODE: EditorLogo = { light: claudeCode };
const CLAUDE: EditorLogo = { light: claude };
const MICROSOFT: EditorLogo = { light: microsoft };
const DEVIN: EditorLogo = { light: devin, dark: devinDark };
const VSCODE: EditorLogo = { light: vscode };
const KIRO: EditorLogo = { light: kiro };

export const EDITOR_LOGOS: Readonly<Record<string, EditorLogo>> = {
	'Antigravity': { light: antigravity },
	'Claude Code': CLAUDE_CODE,
	'Claude Code CLI': CLAUDE_CODE,
	'Claude Desktop': CLAUDE,
	'Claude Desktop Cowork': CLAUDE,
	'Codex CLI': { light: openai, dark: openaiDark },
	'Cline': { light: cline, dark: clineDark },
	'Continue': { light: continueLogo },
	'Copilot CLI': COPILOT,
	'Copilot CLI (App)': COPILOT,
	'Crush': { light: crush },
	'Cursor': { light: cursor },
	'Devin': DEVIN,
	'Devin CLI': DEVIN,
	'Eclipse': { light: eclipse, dark: eclipseDark },
	'Gemini CLI': { light: gemini },
	'Hermes': { light: hermes, dark: hermesDark },
	'JetBrains': { light: jetbrains, dark: jetbrainsDark },
	'Kilo Code': { light: kilo, dark: kiloDark },
	'Kiro': KIRO,
	'Kiro CLI': KIRO,
	'MS Scout (Copilot CLI)': MICROSOFT,
	'Mistral Vibe': { light: mistral },
	'OpenCode': { light: opencode, dark: opencodeDark },
	'Pi': { light: pi, dark: piDark },
	'SSMS': MICROSOFT,
	'Visual Studio': { light: visualStudio },
	'VS Code': VSCODE,
	'VS Code Insiders': VSCODE,
	'VS Code Server': VSCODE,
	'VS Code Server (Insiders)': VSCODE,
	'VSCodium': { light: vscodium },
	'Windsurf': { light: windsurf, dark: windsurfDark },
};

function logoImg(src: string, extraClass: string): HTMLImageElement {
	const img = document.createElement('img');
	img.src = src;
	img.alt = '';
	img.className = `editor-logo ${extraClass}`.trim();
	img.setAttribute('aria-hidden', 'true');
	return img;
}

/**
 * Builds the icon element for an editor: its official logo when we have one (two stacked images
 * for light/dark when the logo has a dark variant — CSS shows the right one from the VS Code
 * `vscode-light` / `vscode-dark` body class), otherwise the emoji fallback.
 */
export function buildEditorLogo(editor: string, doc: Document = document): HTMLElement {
	const wrap = doc.createElement('span');
	wrap.className = 'editor-logo-wrap';
	const logo = EDITOR_LOGOS[editor];
	if (!logo) {
		wrap.classList.add('editor-logo-emoji');
		wrap.textContent = getEditorIconByName(editor);
		return wrap;
	}
	if (logo.dark) {
		wrap.append(logoImg(logo.light, 'editor-logo-light'), logoImg(logo.dark, 'editor-logo-dark'));
	} else {
		wrap.append(logoImg(logo.light, ''));
	}
	return wrap;
}
