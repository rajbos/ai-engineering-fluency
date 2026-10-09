/**
 * Workspace grouping — folds worktrees, scratch clones, case variants and remote (WSL/SSH)
 * spellings of one repository into a single workspace group.
 *
 * Shared by the VS Code extension (Workspace Health / customization matrix) and the CLI
 * (`buildCustomizationMatrix`), so both surfaces count the same set of workspaces.
 *
 * The module is pure: it never touches the filesystem itself. Everything it needs to know
 * about the disk (does a folder exist, where does a worktree's `.git` pointer lead, what is a
 * folder's git remote) comes in through {@link WorkspaceGroupingProbes}, so every rule is
 * unit-testable offline. `workspaceGroupingProbes.ts` holds the real Node implementation.
 *
 * Grouping rules, strongest evidence first (see docs/features/workspace-grouping.md):
 *   1. same git remote identity (`owner/name`) → one group, displayed as the repository name;
 *   2. a worktree whose `.git` pointer resolves to a main checkout → grouped with that checkout;
 *   3. known worktree path conventions (`.claude/worktrees/<repo>/<name>`,
 *      `<repo>/.claude/worktrees/<name>`, `copilot-worktrees/<repo>/<name>`), case-only
 *      differences, and remote paths that share a basename with a local checkout;
 *   4. sibling artefact folders (`<repo>-wt`, `<repo>-refactor-wt`, `<repo>-85ed99`) whose
 *      stem is the basename of another workspace in the list;
 *   5. same basename — the weakest signal, applied last.
 * No rule ever merges two groups whose remotes say they are different repositories. A name
 * pattern on its own never invents a group: an artefact name with nothing to merge into is
 * left alone and reported by {@link detectArtefactWorkspaceNames} instead.
 */

/** One workspace folder as observed in session data. */
export interface WorkspaceUsageEntry {
	/** Absolute folder path, or an `<unresolved:…>` placeholder (passed through untouched). */
	path: string;
	sessionCount: number;
	interactionCount: number;
	/** Git remote URL recorded by the session (e.g. the `repository` field), if any. */
	repository?: string;
}

/** What the probes know about a folder's git setup. */
export interface WorkspaceGitInfo {
	/** Remote URL of `origin` (read from `.git/config`, or the main checkout's config for a worktree). */
	remote?: string;
	/** For a linked worktree: the main checkout's folder (parent of `<main>/.git/worktrees/<name>`). */
	mainWorktreePath?: string;
}

/** Filesystem access, injected so the grouping itself stays pure. */
export interface WorkspaceGroupingProbes {
	/** `process.platform` of the machine the paths came from. Drives case-folding and remote-path rules. */
	platform: string;
	/** True when the folder still exists. Defaults to "unknown → false". */
	pathExists?: (folderPath: string) => boolean;
	/** Git facts for a folder that still exists. Return undefined when unknown. */
	readGitInfo?: (folderPath: string) => WorkspaceGitInfo | undefined;
}

/** One group of workspace folders that belong to the same repository. */
export interface WorkspaceGroup {
	/** Path that represents the group (map key; customization files are scanned here). */
	canonicalPath: string;
	/** Name shown in the UI: the repository name when known, otherwise the canonical folder name. */
	displayName: string;
	/** Every input path merged into this group, sorted, including the canonical path when it was an input. */
	memberPaths: string[];
	sessionCount: number;
	interactionCount: number;
	/** Normalised `owner/name` repository identity, when one was known for any member. */
	repositoryId?: string;
}

/** A display name that still looks like a worktree / clone artefact after grouping. */
export interface ArtefactWorkspaceName {
	displayName: string;
	canonicalPath: string;
	reason: ArtefactNameReason;
}

export type ArtefactNameReason = 'hash-suffix' | 'generated-name' | 'worktree-suffix' | 'worktree-folder';

const UNRESOLVED_PREFIX = '<unresolved:';

// ── Path helpers (separator-agnostic: a Windows path must parse on any host) ──────────

function splitSegments(p: string): string[] {
	return p.split(/[\\/]+/);
}

function separatorOf(p: string): string {
	return p.includes('\\') && !p.startsWith('/') ? '\\' : '/';
}

function joinSegments(segments: string[], sep: string): string {
	const joined = segments.join(sep);
	// A POSIX absolute path splits into ['', 'home', …]; joining restores the leading '/'.
	return joined === '' ? sep : joined;
}

/** Last non-empty path segment. */
export function workspaceBasename(p: string): string {
	const segments = splitSegments(p).filter(s => s.length > 0);
	return segments.length > 0 ? segments[segments.length - 1] : p;
}

function isUnresolved(p: string): boolean {
	return p.startsWith(UNRESOLVED_PREFIX);
}

/** A POSIX-style path seen on Windows: a WSL / SSH / dev-container workspace. */
function isRemotePath(p: string, platform: string): boolean {
	return platform === 'win32' && p.replace(/\\/g, '/').startsWith('/');
}

function caseFolds(platform: string): boolean {
	return platform === 'win32' || platform === 'darwin';
}

/** Comparison key for "is this the same folder?" on the given platform. */
function samePathKey(p: string, platform: string): string {
	const slashed = p.replace(/\\/g, '/').replace(/\/+$/, '');
	return caseFolds(platform) ? slashed.toLowerCase() : slashed;
}

// ── Repository identity ──────────────────────────────────────────────────────

/**
 * Normalise a git remote URL to a lower-case `owner/name` identity.
 * Accepts https, ssh (`git@host:owner/name.git`), `ssh://` and bare `owner/name` forms.
 * Azure DevOps `org/project/_git/repo` becomes `project/repo`. Returns undefined for
 * anything it cannot read as a repository.
 */
export function repositoryIdentity(remote: string | undefined): string | undefined {
	if (!remote) { return undefined; }
	let s = remote.trim();
	if (!s) { return undefined; }
	s = s.replace(/^[a-z+]+:\/\/[^/]*\//i, '');      // scheme://host/
	s = s.replace(/^[^@/\s]+@[^:/\s]+:/, '');         // git@host:
	s = s.replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/\.git$/i, '');
	const parts = s.split('/').filter(Boolean);
	const gitIdx = parts.indexOf('_git');
	if (gitIdx > 0 && gitIdx + 1 < parts.length) {
		return `${parts[gitIdx - 1]}/${parts[gitIdx + 1]}`.toLowerCase();
	}
	if (parts.length < 2) { return undefined; }
	return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`.toLowerCase();
}

function repositoryName(repositoryId: string): string {
	return repositoryId.slice(repositoryId.lastIndexOf('/') + 1);
}

// ── Artefact name patterns ────────────────────────────────────────────────────

/** `-85ed99`: a trailing run of 6+ hex chars containing at least one digit (so `-facade` is not a hash). */
const HASH_SUFFIX = /-(?=[0-9a-f]*\d)[0-9a-f]{6,}$/i;
/** `goofy-wozniak-42f712`: Claude Code / Docker-style generated worktree names. */
const GENERATED_NAME = /^[a-z]+-[a-z]+-(?=[0-9a-f]*\d)[0-9a-f]{6}$/i;
/** `repo-wt`, `repo-refactor-wt`. */
const WORKTREE_SUFFIX = /(^|-)wt$/i;
/** Parent folder names whose children are worktrees, never repositories. */
const WORKTREE_PARENTS = new Set(['worktrees', 'copilot-worktrees']);

/** Classify a folder / display name that looks like a worktree or clone artefact. */
export function classifyArtefactName(name: string): ArtefactNameReason | undefined {
	if (GENERATED_NAME.test(name)) { return 'generated-name'; }
	if (HASH_SUFFIX.test(name)) { return 'hash-suffix'; }
	if (WORKTREE_SUFFIX.test(name)) { return 'worktree-suffix'; }
	return undefined;
}

/**
 * Candidate repository names hidden inside an artefact folder name, most specific first:
 * `repo-refactor-wt` → [`repo-refactor`, `repo`], `repo-85ed99` → [`repo`].
 */
function artefactStems(name: string): string[] {
	const stems: string[] = [];
	// `acme-app-85ed99` and `goofy-wozniak-42f712` have the same shape; only the list can tell
	// them apart (a generated name's stem simply matches no other workspace).
	if (HASH_SUFFIX.test(name)) {
		stems.push(name.replace(HASH_SUFFIX, ''));
	}
	if (/-wt$/i.test(name)) {
		const withoutWt = name.replace(/-wt$/i, '');
		stems.push(withoutWt);
		const lastDash = withoutWt.lastIndexOf('-');
		if (lastDash > 0) { stems.push(withoutWt.slice(0, lastDash)); }
	}
	return stems.filter(s => s.length > 0);
}

// ── Worktree path conventions ─────────────────────────────────────────────────

interface ConventionMatch {
	/** Repository name the convention names. */
	repoName: string;
	/** Path that stands for the repository when nothing better is in the list. */
	anchorPath: string;
	/** True when the anchor is a real checkout (worth scanning), not just a folder of worktrees. */
	anchorIsCheckout: boolean;
}

/**
 * Recognise a folder inside a known worktree layout:
 *  - `<root>/copilot-worktrees/<repo>/<name>[/…]` (Copilot app); the anchor is
 *    `<root>/repos/<repo>` when that checkout exists, else `<root>/copilot-worktrees/<repo>`.
 *  - `<home>/.claude/worktrees/<repo>/<name>[/…]` (Claude desktop app).
 *  - `<repo>/.claude/worktrees/<name>[/…]` (Claude Code CLI, worktree inside the repo).
 */
export function matchWorktreeConvention(folderPath: string, pathExists?: (p: string) => boolean): ConventionMatch | undefined {
	const segments = splitSegments(folderPath);
	const lower = segments.map(s => s.toLowerCase());
	const sep = separatorOf(folderPath);

	const copilotIdx = lower.lastIndexOf('copilot-worktrees');
	if (copilotIdx !== -1 && copilotIdx + 2 < segments.length && segments[copilotIdx + 2] !== '') {
		const repoName = segments[copilotIdx + 1];
		const reposPath = joinSegments([...segments.slice(0, copilotIdx), 'repos', repoName], sep);
		const reposExists = pathExists?.(reposPath) ?? false;
		const anchorPath = reposExists ? reposPath : joinSegments(segments.slice(0, copilotIdx + 2), sep);
		return { repoName, anchorPath, anchorIsCheckout: reposExists };
	}

	for (let i = lower.length - 2; i >= 1; i--) {
		if (lower[i] !== '.claude' || lower[i + 1] !== 'worktrees') { continue; }
		const after = segments.slice(i + 2).filter(s => s.length > 0);
		if (after.length === 0) { return undefined; }
		const repoRoot = joinSegments(segments.slice(0, i), sep);
		const repoRootIsCheckout = pathExists?.(`${repoRoot}${sep}.git`) ?? false;
		if (after.length === 1 || repoRootIsCheckout) {
			// In-repo layout: `<repo>/.claude/worktrees/<name>`.
			return { repoName: workspaceBasename(repoRoot), anchorPath: repoRoot, anchorIsCheckout: true };
		}
		// Desktop layout: `<home>/.claude/worktrees/<repo>/<name>`.
		return { repoName: after[0], anchorPath: joinSegments(segments.slice(0, i + 3), sep), anchorIsCheckout: false };
	}
	return undefined;
}

// ── Union-find with a "different repositories" veto ───────────────────────────

class Groups {
	private readonly parent: number[];
	private readonly repoIds: Array<Set<string>>;

	constructor(repoIds: Array<string | undefined>) {
		this.parent = repoIds.map((_, i) => i);
		this.repoIds = repoIds.map(id => new Set(id ? [id] : []));
	}

	find(i: number): number {
		while (this.parent[i] !== i) {
			this.parent[i] = this.parent[this.parent[i]];
			i = this.parent[i];
		}
		return i;
	}

	/** True when both sides know their repository and the repositories differ. */
	conflicts(a: number, b: number): boolean {
		const ra = this.repoIds[this.find(a)];
		const rb = this.repoIds[this.find(b)];
		if (ra.size === 0 || rb.size === 0) { return false; }
		for (const id of ra) { if (rb.has(id)) { return false; } }
		return true;
	}

	/** Merge unless the remotes say these are different repositories. Returns whether merged. */
	union(a: number, b: number): boolean {
		const ra = this.find(a);
		const rb = this.find(b);
		if (ra === rb) { return true; }
		if (this.conflicts(ra, rb)) { return false; }
		const [root, child] = ra < rb ? [ra, rb] : [rb, ra];
		this.parent[child] = root;
		for (const id of this.repoIds[child]) { this.repoIds[root].add(id); }
		return true;
	}

	repositoryIds(i: number): Set<string> {
		return this.repoIds[this.find(i)];
	}
}

// ── Grouping ─────────────────────────────────────────────────────────────────

interface Node {
	path: string;
	sessionCount: number;
	interactionCount: number;
	/** False for synthetic anchors (convention / main-worktree paths), which carry no counts of their own. */
	isInput: boolean;
	/** Anchor that is a real checkout, preferred as the group's canonical path when it exists. */
	isCheckoutAnchor?: boolean;
	remote: boolean;
	mainWorktreePath?: string;
	convention?: ConventionMatch;
}

function unionByKey(nodes: Node[], groups: Groups, keyOf: (n: Node, i: number) => string | undefined): void {
	const first = new Map<string, number>();
	nodes.forEach((n, i) => {
		const key = keyOf(n, i);
		if (key === undefined) { return; }
		const seen = first.get(key);
		if (seen === undefined) { first.set(key, i); } else { groups.union(seen, i); }
	});
}

/** The node list plus each node's repository identity, with duplicate paths folded together. */
class NodeList {
	readonly nodes: Node[] = [];
	readonly repoIds: Array<string | undefined> = [];
	private readonly indexByPath = new Map<string, number>();

	add(node: Node, repoId: string | undefined): number {
		const existing = this.indexByPath.get(node.path);
		if (existing === undefined) {
			this.nodes.push(node);
			this.repoIds.push(repoId);
			this.indexByPath.set(node.path, this.nodes.length - 1);
			return this.nodes.length - 1;
		}
		const n = this.nodes[existing];
		n.sessionCount += node.sessionCount;
		n.interactionCount += node.interactionCount;
		n.isInput = n.isInput || node.isInput;
		n.isCheckoutAnchor = n.isCheckoutAnchor || node.isCheckoutAnchor;
		this.repoIds[existing] = this.repoIds[existing] ?? repoId;
		return existing;
	}
}

function inputNode(entry: WorkspaceUsageEntry, probes: WorkspaceGroupingProbes, pathExists: (p: string) => boolean): { node: Node; repoId?: string } {
	const remote = isRemotePath(entry.path, probes.platform);
	const git = !remote && pathExists(entry.path) ? probes.readGitInfo?.(entry.path) : undefined;
	return {
		node: {
			path: entry.path,
			sessionCount: entry.sessionCount,
			interactionCount: entry.interactionCount,
			isInput: true,
			remote,
			mainWorktreePath: git?.mainWorktreePath,
			// Layout rules need no disk access, so they also apply to WSL / remote paths; only the
			// existence checks are skipped there, since the local probes cannot see that filesystem.
			convention: matchWorktreeConvention(entry.path, remote ? undefined : pathExists),
		},
		repoId: repositoryIdentity(entry.repository) ?? repositoryIdentity(git?.remote),
	};
}

/**
 * Anchors: a worktree's main checkout, and a convention's repository folder. They join the
 * node list (with zero counts) so a group can be represented by the real checkout.
 * Returns input index → anchor index.
 */
function addAnchors(list: NodeList, platform: string): Map<number, number> {
	const anchorOf = new Map<number, number>();
	const inputCount = list.nodes.length;
	for (let i = 0; i < inputCount; i++) {
		const n = list.nodes[i];
		const anchorPath = n.mainWorktreePath ?? n.convention?.anchorPath;
		if (!anchorPath || samePathKey(anchorPath, platform) === samePathKey(n.path, platform)) { continue; }
		const isCheckoutAnchor = n.mainWorktreePath !== undefined || n.convention?.anchorIsCheckout === true;
		const anchor: Node = { path: anchorPath, sessionCount: 0, interactionCount: 0, isInput: false, isCheckoutAnchor, remote: isRemotePath(anchorPath, platform) };
		anchorOf.set(i, list.add(anchor, list.repoIds[i]));
	}
	return anchorOf;
}

/** Name a node goes by for name-based rules: the convention's repository, else its folder name. */
function nodeName(n: Node): string {
	return (n.convention?.repoName ?? workspaceBasename(n.path)).toLowerCase();
}

/**
 * Join `i` to every candidate's group, unless that would put two different repositories in
 * play: then a folder without a remote cannot be attributed to either, and stays apart.
 * Returns whether `i` joined.
 */
function joinUnlessAmbiguous(groups: Groups, i: number, candidates: number[]): boolean {
	const others = candidates.filter(c => groups.find(c) !== groups.find(i));
	if (others.length === 0) { return false; }
	const ids = new Set<string>();
	for (const idx of [i, ...others]) { for (const id of groups.repositoryIds(idx)) { ids.add(id); } }
	if (ids.size > 1) { return false; }
	for (const c of others) { groups.union(c, i); }
	return true;
}

/** Rules 3 (remote paths), 4 (sibling artefact folders) and 5 (same basename), in that order. */
function unionByName(nodes: Node[], groups: Groups): void {
	const localByName = new Map<string, number[]>();
	nodes.forEach((n, i) => {
		if (n.remote) { return; }
		const name = nodeName(n);
		localByName.set(name, [...(localByName.get(name) ?? []), i]);
	});

	nodes.forEach((n, i) => {
		if (n.remote) { joinUnlessAmbiguous(groups, i, localByName.get(nodeName(n)) ?? []); }
	});
	nodes.forEach((n, i) => {
		if (n.remote || n.convention) { return; }
		// The most specific stem that names another workspace decides; an ambiguous one is not retried with a shorter stem.
		const candidates = artefactStems(workspaceBasename(n.path))
			.map(stem => (localByName.get(stem.toLowerCase()) ?? []).filter(c => c !== i))
			.find(list => list.length > 0);
		if (candidates) { joinUnlessAmbiguous(groups, i, candidates); }
	});
	for (const same of localByName.values()) {
		if (joinUnlessAmbiguous(groups, same[0], same.slice(1))) { continue; }
		// Different repositories share this name: still fold the folders that have no remote together.
		const unidentified = same.filter(idx => groups.repositoryIds(idx).size === 0);
		unidentified.slice(1).forEach(idx => groups.union(unidentified[0], idx));
	}
}

/**
 * Group workspace folders that belong to the same repository.
 * Duplicate input paths are summed. `<unresolved:…>` entries come back as single-member
 * groups, untouched. Output is sorted by interactions, then sessions, then display name.
 */
export function groupWorkspaces(entries: WorkspaceUsageEntry[], probes: WorkspaceGroupingProbes): WorkspaceGroup[] {
	const { platform } = probes;
	const pathExists = probes.pathExists ?? (() => false);
	const list = new NodeList();
	const passthrough: WorkspaceGroup[] = [];
	// Every pass walks nodes in index order, so index them by path: the result then depends
	// only on the set of entries, never on the order they arrived in.
	const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
	for (const entry of sorted) {
		if (isUnresolved(entry.path)) {
			passthrough.push({
				canonicalPath: entry.path, displayName: entry.path, memberPaths: [entry.path],
				sessionCount: entry.sessionCount, interactionCount: entry.interactionCount,
			});
			continue;
		}
		const { node, repoId } = inputNode(entry, probes, pathExists);
		list.add(node, repoId);
	}
	const anchorOf = addAnchors(list, platform);
	const { nodes } = list;
	const groups = new Groups(list.repoIds);

	// 1. Same repository identity.
	unionByKey(nodes, groups, (_n, i) => list.repoIds[i]);
	// 2 + 3. Worktree pointer and path conventions → their anchor.
	for (const [i, anchorIdx] of anchorOf) { groups.union(anchorIdx, i); }
	// 3. Case-only differences (same folder on a case-insensitive filesystem).
	if (caseFolds(platform)) {
		unionByKey(nodes, groups, n => samePathKey(n.path, platform));
	}
	// 3–5. Name-based rules, weakest last.
	unionByName(nodes, groups);

	return [...buildGroups(nodes, groups, pathExists), ...passthrough].sort(compareGroups);
}

function compareGroups(a: WorkspaceGroup, b: WorkspaceGroup): number {
	return b.interactionCount - a.interactionCount
		|| b.sessionCount - a.sessionCount
		|| a.displayName.localeCompare(b.displayName)
		|| a.canonicalPath.localeCompare(b.canonicalPath);
}

function buildGroups(nodes: Node[], groups: Groups, pathExists: (p: string) => boolean): WorkspaceGroup[] {
	const members = new Map<number, number[]>();
	nodes.forEach((_n, i) => {
		const root = groups.find(i);
		const list = members.get(root) ?? [];
		list.push(i);
		members.set(root, list);
	});

	const result: WorkspaceGroup[] = [];
	for (const [root, indexes] of members) {
		const inputs = indexes.filter(i => nodes[i].isInput);
		if (inputs.length === 0) { continue; }
		const canonical = nodes[pickCanonical(indexes, nodes, pathExists)];
		const repoIds = [...groups.repositoryIds(root)].sort();
		const repositoryId = repoIds[0];
		const displayName = repositoryId
			? repositoryName(repositoryId)
			: canonical.convention?.repoName ?? workspaceBasename(canonical.path);
		result.push({
			canonicalPath: canonical.path,
			displayName,
			memberPaths: inputs.map(i => nodes[i].path).sort(),
			sessionCount: inputs.reduce((sum, i) => sum + nodes[i].sessionCount, 0),
			interactionCount: inputs.reduce((sum, i) => sum + nodes[i].interactionCount, 0),
			...(repositoryId ? { repositoryId } : {}),
		});
	}
	return result;
}

/**
 * Choose the folder that represents a group, deterministically:
 *  1. a main checkout another member is a worktree of (or a checkout a convention names) that exists on disk;
 *  2. a local folder whose name is not an artefact and that is not inside a worktree layout;
 *  3. any local folder; then remote ones.
 * Within a tier: most interactions, then most sessions, then the lexicographically smallest path.
 */
function pickCanonical(indexes: number[], nodes: Node[], pathExists: (p: string) => boolean): number {
	const tier = (i: number): number => {
		const n = nodes[i];
		if (n.isCheckoutAnchor && pathExists(n.path)) { return 0; }
		if (!n.isInput) { return 5; }
		if (n.remote) { return 4; }
		if (!n.convention && !n.mainWorktreePath && !classifyArtefactName(workspaceBasename(n.path))) { return 1; }
		return 2;
	};
	return [...indexes].sort((a, b) =>
		tier(a) - tier(b)
		|| nodes[b].interactionCount - nodes[a].interactionCount
		|| nodes[b].sessionCount - nodes[a].sessionCount
		|| (nodes[a].path < nodes[b].path ? -1 : nodes[a].path > nodes[b].path ? 1 : 0)
	)[0];
}

// ── Customization files of a group ───────────────────────────────────────────

/** The fields of a customization file entry the merge looks at. */
export interface GroupCustomizationFile {
	type: string;
	relativePath: string;
	lastModified: string | null;
	isStale: boolean;
}

/**
 * Merge the customization scans of every folder in a group into the group's file list, so a
 * file present in any member counts for the repository (instructions in the main checkout and
 * a skill only in a worktree are both found). The same repo-relative file seen in several
 * folders is kept once: the fresh copy over a stale one, then the most recently modified.
 */
export function mergeGroupCustomizationFiles<T extends GroupCustomizationFile>(scans: Array<T[] | undefined>): T[] {
	const byKey = new Map<string, T>();
	const better = (a: T, b: T): boolean => {
		if (a.isStale !== b.isStale) { return !a.isStale; }
		return (a.lastModified ?? '') > (b.lastModified ?? '');
	};
	for (const files of scans) {
		for (const file of files ?? []) {
			const key = `${file.type}\u0000${file.relativePath.replace(/\\/g, '/').toLowerCase()}`;
			const current = byKey.get(key);
			if (!current || better(file, current)) { byKey.set(key, file); }
		}
	}
	return [...byKey.values()];
}

// ── Detection ────────────────────────────────────────────────────────────────

/**
 * Report groups whose display name still looks like a worktree or clone artefact, i.e. the
 * grouping found nothing to fold it into. Used by the unit-test corpus (which asserts this is
 * empty) and at runtime, so a new naming pattern on a real machine shows up as a count in
 * Workspace Health instead of as one more row someone has to notice.
 */
export function detectArtefactWorkspaceNames(groups: WorkspaceGroup[]): ArtefactWorkspaceName[] {
	const found: ArtefactWorkspaceName[] = [];
	for (const g of groups) {
		if (isUnresolved(g.canonicalPath)) { continue; }
		let reason = classifyArtefactName(g.displayName);
		if (!reason) {
			const segments = splitSegments(g.canonicalPath).filter(Boolean).map(s => s.toLowerCase());
			const parent = segments[segments.length - 2];
			if (parent && WORKTREE_PARENTS.has(parent) && g.displayName.toLowerCase() === segments[segments.length - 1]) {
				reason = 'worktree-folder';
			}
		}
		if (reason) { found.push({ displayName: g.displayName, canonicalPath: g.canonicalPath, reason }); }
	}
	return found;
}
