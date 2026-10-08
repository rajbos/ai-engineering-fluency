// View index tab of the What's New panel: a searchable tree of every view, tab and section.
import { el } from '../shared/domUtils';
import { VIEW_INDEX, flattenViewIndex, type ViewIndexNode } from '../../whatsNew/viewIndex';
import { highlightRanges, searchViewIndex } from './viewIndexSearch';

type PostMessage = (message: unknown) => void;

/** Panel-lifetime state, so a refresh re-render keeps the user's place. */
const state = {
	query: '',
	/** Node ids the user expanded or collapsed by hand; absent means the default. */
	toggled: new Map<string, boolean>(),
};

const ENTRIES = flattenViewIndex();
const PATH_BY_ID = new Map(ENTRIES.map((entry) => [entry.id, entry.path]));

/**
 * Views and tab groups start open, so the first screen is the map of every
 * subview; the sections inside a tab start folded. A group is a node whose
 * children are tabs of their own.
 */
function isExpandedByDefault(node: ViewIndexNode, depth: number): boolean {
	return depth === 0 || (depth === 1 && !!node.children?.some((child) => child.nav?.tab));
}

function appendHighlighted(target: HTMLElement, text: string, query: string): void {
	let cursor = 0;
	for (const [start, end] of highlightRanges(text, query)) {
		if (start > cursor) { target.append(document.createTextNode(text.slice(cursor, start))); }
		target.append(el('mark', 'index-mark', text.slice(start, end)));
		cursor = end;
	}
	if (cursor < text.length) { target.append(document.createTextNode(text.slice(cursor))); }
}

function buildOpenButton(node: ViewIndexNode, post: PostMessage): HTMLButtonElement {
	const label = `Open ${PATH_BY_ID.get(node.id)?.join(' › ') ?? node.title}`;
	const button = el('button', 'index-open');
	button.type = 'button';
	button.id = `index-open-${node.id}`;
	button.title = label;
	button.setAttribute('aria-label', label);
	button.append(el('span', 'codicon codicon-go-to-file'));
	button.addEventListener('click', (event) => {
		event.stopPropagation();
		post({ command: 'openViewIndexEntry', entryId: node.id });
	});
	return button;
}

type RenderContext = {
	post: PostMessage;
	query: string;
	/** Ids to show while searching: the matches and their ancestors. Null when not searching. */
	visible: ReadonlySet<string> | null;
	matched: ReadonlySet<string>;
	rerender: () => void;
};

function buildNode(node: ViewIndexNode, depth: number, ctx: RenderContext): HTMLElement | null {
	if (ctx.visible && !ctx.visible.has(node.id)) { return null; }
	const children = (node.children ?? [])
		.map((child) => buildNode(child, depth + 1, ctx))
		.filter((child): child is HTMLElement => child !== null);
	const hasChildren = children.length > 0;
	// While searching everything on the path to a match is open; otherwise honour the user's toggles.
	const expanded = ctx.visible ? true : state.toggled.get(node.id) ?? isExpandedByDefault(node, depth);

	const item = el('li', `index-item depth-${Math.min(depth, 3)}`);
	item.setAttribute('role', 'treeitem');
	item.dataset.entryId = node.id;
	if (hasChildren) { item.setAttribute('aria-expanded', String(expanded)); }
	if (ctx.visible && !ctx.matched.has(node.id)) { item.classList.add('index-context'); }

	const row = el('div', 'index-row');
	const toggle = el('button', 'index-toggle');
	toggle.type = 'button';
	if (hasChildren) {
		toggle.append(el('span', `codicon codicon-chevron-${expanded ? 'down' : 'right'}`));
		toggle.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${node.title}`);
		toggle.addEventListener('click', () => {
			state.toggled.set(node.id, !expanded);
			ctx.rerender();
		});
		toggle.disabled = !!ctx.visible;
	} else {
		toggle.classList.add('index-toggle-leaf');
		toggle.disabled = true;
		toggle.setAttribute('aria-hidden', 'true');
		toggle.tabIndex = -1;
	}

	const text = el('div', 'index-text');
	const titleLine = el('div', 'index-title-line');
	const title = el('span', 'index-title');
	appendHighlighted(title, node.title, ctx.query);
	titleLine.append(title);
	if (node.condition) {
		titleLine.append(el('span', 'index-condition', node.condition));
	}
	const description = el('div', 'index-description');
	appendHighlighted(description, node.description, ctx.query);
	description.title = node.description;
	text.append(titleLine, description);

	row.append(toggle, text, buildOpenButton(node, ctx.post));
	item.append(row);

	if (hasChildren && expanded) {
		const list = el('ul', 'index-children');
		list.setAttribute('role', 'group');
		list.append(...children);
		item.append(list);
	}
	return item;
}

/** Ids of every ancestor of each matched entry, plus the matches themselves. */
function visibleForMatches(matchedIds: readonly string[]): Set<string> {
	const visible = new Set<string>();
	const parentOf = new Map<string, string>();
	const walk = (node: ViewIndexNode, parent?: string): void => {
		if (parent) { parentOf.set(node.id, parent); }
		node.children?.forEach((child) => walk(child, node.id));
	};
	VIEW_INDEX.forEach((view) => walk(view));
	for (const id of matchedIds) {
		for (let current: string | undefined = id; current; current = parentOf.get(current)) {
			visible.add(current);
		}
	}
	return visible;
}

function renderTree(container: HTMLElement, status: HTMLElement, post: PostMessage): void {
	const query = state.query.trim();
	const result = query ? searchViewIndex(ENTRIES, query) : null;
	const ctx: RenderContext = {
		post,
		query,
		visible: result ? visibleForMatches(result.matchedIds) : null,
		matched: new Set(result?.matchedIds ?? []),
		rerender: () => renderTree(container, status, post),
	};

	const tree = el('ul', 'index-tree');
	tree.setAttribute('role', 'tree');
	tree.setAttribute('aria-label', 'View index');
	VIEW_INDEX.forEach((view) => {
		const node = buildNode(view, 0, ctx);
		if (node) { tree.append(node); }
	});

	if (result && result.matchedIds.length === 0) {
		status.textContent = `Nothing matches “${query}”. Try fewer or shorter words.`;
		container.replaceChildren(el('div', 'index-empty', 'No matching views, tabs or sections.'));
		return;
	}
	status.textContent = result
		? `${result.matchedIds.length} match${result.matchedIds.length === 1 ? '' : 'es'}`
		: `${ENTRIES.length} entries across ${VIEW_INDEX.length} views`;
	container.replaceChildren(tree);
}

/** Builds the View index tab's content. */
export function buildViewIndexTab(post: PostMessage): HTMLElement {
	const panel = el('div', 'index-panel');

	panel.append(el('div', 'intro',
		'Every view, tab and section in the extension. Search by name, by what it shows, or by a word you remember — the search is forgiving about typos and word order. ' +
		'Use the open button on a line to go straight there.'));

	const searchRow = el('div', 'index-search-row');
	const icon = el('span', 'codicon codicon-search index-search-icon');
	icon.setAttribute('aria-hidden', 'true');
	const input = el('input', 'index-search');
	input.id = 'view-index-search';
	input.type = 'search';
	input.placeholder = 'Search views, tabs and sections…';
	input.setAttribute('aria-label', 'Search the view index');
	input.autocomplete = 'off';
	input.spellcheck = false;
	input.value = state.query;
	const status = el('div', 'index-status');
	status.setAttribute('aria-live', 'polite');
	searchRow.append(icon, input);

	const treeContainer = el('div', 'index-tree-container');
	input.addEventListener('input', () => {
		state.query = input.value;
		renderTree(treeContainer, status, post);
	});
	input.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && input.value) {
			event.preventDefault();
			input.value = '';
			state.query = '';
			renderTree(treeContainer, status, post);
		}
	});

	panel.append(searchRow, status, treeContainer);
	renderTree(treeContainer, status, post);
	return panel;
}
