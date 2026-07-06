/**
 * WorkspacePathResolver — safe file:// URI to filesystem-path conversion.
 *
 * Security note (OWASP Path Traversal – CWE-22):
 *   All percent-decoding is done *before* the '..' segment check so that
 *   encoded traversal sequences like %2e%2e or %252e%252e cannot bypass the
 *   guard.  Any URI whose decoded path contains a '..' segment is rejected.
 */

/**
 * Convert a `file://` URI to a native filesystem path.
 *
 * Handles:
 *  - Windows absolute  → `file:///C:/Users/…`     → `C:\Users\…`
 *  - POSIX absolute    → `file:///home/user/…`     → `/home/user/…`
 *  - UNC (Windows)     → `file:////server/share`   → `\\server\share`
 *  - Percent-encoded   → `file:///path/with%20spaces` → `/path/with spaces`
 *
 * Returns `undefined` when:
 *  - The input is not a `file://` URI
 *  - The URI contains malformed percent-encoding
 *  - The decoded path contains `..` path-traversal segments
 *
 * @param uri  A `file://` URI string.
 * @returns    Native filesystem path, or `undefined` if invalid / unsafe.
 */
export function resolveFileUri(uri: string): string | undefined {
	if (!uri || !uri.startsWith('file://')) {
		return undefined;
	}

	// Everything after the 'file://' scheme prefix.
	// Examples after stripping:
	//   file:///C:/path   → /C:/path
	//   file:///home/user → /home/user
	//   file:////server   → //server        (UNC)
	const rawPath = uri.slice('file://'.length);

	// Safely decode percent-encoded characters.
	// decodeURIComponent throws on malformed sequences (e.g. '%GG') — reject those.
	let decoded: string;
	try {
		decoded = decodeURIComponent(rawPath);
	} catch {
		return undefined;
	}

	// Security: split on both slash styles and reject any '..' segment.
	// This must happen *after* decoding so that encoded sequences cannot bypass the check.
	const segments = decoded.split(/[\\/]/);
	if (segments.some(s => s === '..')) {
		return undefined;
	}

	// UNC path: file:////server/share → decoded = //server/share
	if (decoded.startsWith('//')) {
		// On Windows use backslashes; on POSIX keep forward slashes.
		if (process.platform === 'win32') {
			return decoded.replace(/\//g, '\\');
		}
		return decoded;
	}

	// Windows absolute path: /C:/path → strip the leading slash → C:/path
	if (/^\/[A-Za-z]:/.test(decoded)) {
		return decoded.slice(1);
	}

	// POSIX absolute path: /home/user/path — return as-is.
	return decoded;
}
