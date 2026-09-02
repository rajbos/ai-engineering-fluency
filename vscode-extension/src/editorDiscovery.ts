/**
 * Tracks which editor labels have been seen before so we can surface only newly
 * discovered editors to the user.
 */
export type SeenEditorsUpdate = {
	seenEditors: string[];
	newEditors: string[];
};

export type NotifiedEditorsUpdate = {
	notifiedEditors: string[];
	editorsToNotify: string[];
};

function normalizeEditorNames(editors: Iterable<string>): string[] {
	const result = new Set<string>();
	for (const editor of editors) {
		const name = editor.trim();
		if (!name || name === 'Unknown') { continue; }
		result.add(name);
	}
	return [...result].sort((a, b) => a.localeCompare(b));
}

/**
 * Merges newly discovered editor labels into the persisted seen set.
 * When no prior state exists (first run after feature rollout), it seeds the
 * baseline without reporting all current editors as "new".
 */
export function mergeSeenEditors(
	previousSeenEditors: readonly string[] | undefined,
	discoveredEditors: Iterable<string>,
): SeenEditorsUpdate {
	const normalizedDiscovered = normalizeEditorNames(discoveredEditors);
	if (previousSeenEditors === undefined) {
		return { seenEditors: normalizedDiscovered, newEditors: [] };
	}

	const normalizedPrevious = normalizeEditorNames(previousSeenEditors);
	const previousSet = new Set(normalizedPrevious);
	const newEditors = normalizedDiscovered.filter(editor => !previousSet.has(editor));
	return {
		seenEditors: normalizeEditorNames([...normalizedPrevious, ...normalizedDiscovered]),
		newEditors,
	};
}

/**
 * Computes which editors still need a one-time notification, and returns the
 * updated persisted notification set.
 */
export function mergeNotifiedEditors(
	previousNotifiedEditors: readonly string[] | undefined,
	candidateEditors: Iterable<string>,
): NotifiedEditorsUpdate {
	const normalizedCandidates = normalizeEditorNames(candidateEditors);
	const normalizedPrevious = normalizeEditorNames(previousNotifiedEditors ?? []);
	const notifiedSet = new Set(normalizedPrevious);
	const editorsToNotify = normalizedCandidates.filter(editor => !notifiedSet.has(editor));
	return {
		notifiedEditors: normalizeEditorNames([...normalizedPrevious, ...normalizedCandidates]),
		editorsToNotify,
	};
}
