import * as fs from 'fs';

/** Returns true if the path exists and is accessible. */
export async function pathExists(p: string): Promise<boolean> {
	try { await fs.promises.access(p); return true; } catch { return false; }
}
