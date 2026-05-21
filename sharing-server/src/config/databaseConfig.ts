import { join } from 'path';

/**
 * Database path configuration for the sharing server.
 *
 * SQLite runs on the container's LOCAL ephemeral disk (LOCAL_DATA_DIR / /tmp/db).
 * Azure Files (/data) is used ONLY for backup/restore via plain file copy — never
 * as a live SQLite database. Azure Files SMB does not support the POSIX advisory
 * byte-range locks that SQLite requires, causing persistent "database is locked"
 * errors when using Azure Files as the live database path.
 */

/** Default directory for the SQLite database file in production (ephemeral local disk). */
export const DEFAULT_LOCAL_DATA_DIR = '/tmp/db';

/** Default directory for the SQLite database file in development. */
export const DEFAULT_DEV_DATA_DIR = './data';

/** Default Azure Files mount point used as backup destination in production. */
export const DEFAULT_BACKUP_DIR = '/data';

/**
 * Resolves the path where the live SQLite database file should be stored.
 * Precedence: LOCAL_DATA_DIR → DATA_DIR → /tmp/db (prod) / ./data (dev)
 */
export function getDatabasePath(): string {
	const dir = process.env.LOCAL_DATA_DIR
		?? process.env.DATA_DIR
		?? (process.env.NODE_ENV === 'production' ? DEFAULT_LOCAL_DATA_DIR : DEFAULT_DEV_DATA_DIR);
	return join(dir, 'sharing.db');
}

/**
 * Resolves the path for the Azure Files backup copy of the database.
 * Returns null when LOCAL_DATA_DIR is not set — meaning the database already
 * lives on the persistent volume and no separate backup copy is needed.
 */
export function getBackupPath(): string | null {
	if (!process.env.LOCAL_DATA_DIR) return null;
	const backupDir = process.env.DATA_DIR ?? (process.env.NODE_ENV === 'production' ? DEFAULT_BACKUP_DIR : null);
	return backupDir ? join(backupDir, 'sharing.db') : null;
}
