#!/usr/bin/env node
/**
 * Load Cache Data Script
 * 
 * This script loads and displays the AI Engineering Fluency's local cache data.
 * The cache stores pre-computed session file statistics to avoid re-processing unchanged files.
 * 
 * The extension's cache is stored in VS Code's globalState, which is persisted in a SQLite
 * database (state.vscdb). This script looks for a cache export file that the extension or
 * tests may write to disk in a known location for inspection.
 * 
 * Usage:
 *   node .github/skills/load-cache-data/load-cache-data.js [--last N] [--json] [--include-sensitive]
 * 
 * Options:
 *   --last N     Show only the last N cache entries (default: 10, maximum: 100)
 *   --json       Output as JSON
 *   --include-sensitive  Include session titles, prompts, paths, and repository URLs
 *   --help       Show this help message
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_LAST_COUNT = 10;
const MAX_LAST_COUNT = 100;

// Parse command line arguments
const args = process.argv.slice(2);
const includeSensitive = args.includes('--include-sensitive');
const showHelp = args.includes('--help');

function parseLastCount() {
    for (let index = 0; index < args.length; index++) {
        if (args[index] !== '--last') {
            continue;
        }

        const value = args[index + 1];
        if (!value || !/^\d+$/.test(value)) {
            throw new Error('--last must be a positive integer.');
        }

        const count = Number(value);
        if (Number.isNaN(count) || count < 1) {
            throw new Error('--last must be a positive integer.');
        }

        return Math.min(count, MAX_LAST_COUNT);
    }
    return DEFAULT_LAST_COUNT;
}

if (showHelp) {
    console.log(`
Load Cache Data Script

This script loads and displays the GitHub Copilot Token Tracker's local cache data.
The cache contains pre-computed statistics for session files.

CACHE STRUCTURE:
  The cache is stored in VS Code's globalState under the key 'sessionFileCache'.
  Each entry contains:
  - tokens: total token count
  - interactions: number of interactions
  - modelUsage: per-model token breakdown
  - mtime: file modification time (for cache validation)
  - usageAnalysis: detailed usage statistics (optional)

CACHE FILE LOCATIONS:
  This script looks only in VS Code globalStorage for Code, Insiders,
  Exploration, VSCodium, and Cursor. It does not trust files in temp or
  current-working directories.

  Session titles, prompts, correction excerpts, workspace paths, repository URLs,
  and cache file paths are omitted by default. Use --include-sensitive only when
  you intend to expose them.

  To create a cache export for testing or inspection, the extension or tests
  can write session-cache.json to the extension's globalStorage directory.

USAGE:
  node .github/skills/load-cache-data/load-cache-data.js [--last N] [--json] [--include-sensitive]

OPTIONS:
  --last N     Show only the last N cache entries (default: 10, maximum: 100)
  --json       Output as JSON format
  --include-sensitive  Include session titles, prompts, paths, and repository URLs
  --help       Show this help message

EXAMPLES:
  # Show last 10 cache entries
  node .github/skills/load-cache-data/load-cache-data.js

  # Show last 5 cache entries as JSON
  node .github/skills/load-cache-data/load-cache-data.js --last 5 --json

  # Include session-identifying fields only when explicitly needed
  node .github/skills/load-cache-data/load-cache-data.js --include-sensitive --json

FOR DEVELOPERS:
  To access the cache programmatically within the extension:
  
  // Get cache data from global state
  const cacheData = context.globalState.get('sessionFileCache');
  const cacheEntries = Object.entries(cacheData || {});
  
  // Get last 10 entries (sorted by modification time)
  const last10 = cacheEntries
    .sort((a, b) => (b[1].mtime || 0) - (a[1].mtime || 0))
    .slice(0, 10);

  // Display cache entries
  for (const [index, [, cacheEntry]] of last10.entries()) {
    console.log({
      session: \`session-\${index + 1}\`,
      tokens: cacheEntry.tokens,
      interactions: cacheEntry.interactions,
      modelUsage: cacheEntry.modelUsage,
      lastModified: new Date(cacheEntry.mtime).toISOString()
    });
  }
`);
    process.exit(0);
}

let lastCount;
try {
    lastCount = parseLastCount();
} catch (error) {
    console.error(error.message);
    process.exit(2);
}

/**
 * Get possible cache file locations
 * Returns array of paths where cache export files might be located
 */
function getCacheFilePaths() {
    const platform = os.platform();
    const homedir = os.homedir();
    const paths = [];

    // VS Code variants to check
    const vscodeVariants = ['Code', 'Code - Insiders', 'Code - Exploration', 'VSCodium', 'Cursor'];
    // Current extension id (publisher.name, lowercased) and the pre-rename id
    const extensionIds = ['robbos.ai-engineering-fluency', 'robbos.copilot-token-tracker'];
    // Candidate cache file names to look for (include session-cache.json used on the user's machine)
    const candidateFiles = ['session-cache.json'];

    if (platform === 'win32') {
        // Windows: %APPDATA%\Code\User\globalStorage\<extensionId>\<cacheFile>
        const appDataPath = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
        for (const variant of vscodeVariants) {
            for (const extensionId of extensionIds) {
                for (const fileName of candidateFiles) {
                    paths.push(path.join(appDataPath, variant, 'User', 'globalStorage', extensionId, fileName));
                }
            }
        }
    } else if (platform === 'darwin') {
        // macOS: ~/Library/Application Support/<variant>/User/globalStorage/<extensionId>/<cacheFile>
        for (const variant of vscodeVariants) {
            for (const extensionId of extensionIds) {
                for (const fileName of candidateFiles) {
                    paths.push(path.join(homedir, 'Library', 'Application Support', variant, 'User', 'globalStorage', extensionId, fileName));
                }
            }
        }
    } else {
        // Linux: ~/.config/Code/User/globalStorage/extensionId/cache.json
        const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(homedir, '.config');
        for (const variant of vscodeVariants) {
            for (const extensionId of extensionIds) {
                for (const fileName of candidateFiles) {
                    paths.push(path.join(xdgConfigHome, variant, 'User', 'globalStorage', extensionId, fileName));
                }
            }
        }
    }
    
    return paths;
}

const SAFE_CACHE_ENTRY_FIELDS = new Set([
    'tokens', 'interactions', 'modelUsage', 'mtime', 'size', 'detailsOnly',
    'usageAnalysis', 'taskCategory', 'taskCategoryShares', 'firstInteraction',
    'lastInteraction', 'repositoryResolved', 'thinkingTokens', 'actualTokens',
    'cacheReadTokens', 'modelTurns', 'debugLogInputTokens', 'debugLogOutputTokens',
    'debugLogChecked', 'subAgentCalls', 'copilotExactCostDollars', 'truncationCount',
    'messagesRemovedByTruncation', 'maxRequestInputTokens', 'contextTier',
    'dailyRollups', 'linesAdded', 'linesRemoved', 'languageUsage'
]);

function sanitizeCacheEntry(cacheEntry) {
    if (!cacheEntry || typeof cacheEntry !== 'object' || Array.isArray(cacheEntry)) {
        return {};
    }
    const safeEntry = Object.fromEntries(
        Object.entries(cacheEntry).filter(([key]) => SAFE_CACHE_ENTRY_FIELDS.has(key))
    );

    const usageAnalysis = safeEntry.usageAnalysis;
    if (usageAnalysis && typeof usageAnalysis === 'object' && !Array.isArray(usageAnalysis)) {
        const safeUsageAnalysis = { ...usageAnalysis };
        delete safeUsageAnalysis.firstUserPrompt;
        const contextReferences = safeUsageAnalysis.contextReferences;
        if (contextReferences && typeof contextReferences === 'object' && !Array.isArray(contextReferences)) {
            // byPath is keyed by the referenced files' local paths
            const safeContextReferences = { ...contextReferences };
            delete safeContextReferences.byPath;
            safeUsageAnalysis.contextReferences = safeContextReferences;
        }
        if (Array.isArray(safeUsageAnalysis.correctionMoments)) {
            safeUsageAnalysis.correctionMoments = safeUsageAnalysis.correctionMoments.map(moment => {
                if (!moment || typeof moment !== 'object' || Array.isArray(moment)) {
                    return moment;
                }
                const safeMoment = { ...moment };
                delete safeMoment.snippet;
                delete safeMoment.file;
                return safeMoment;
            });
        }
        safeEntry.usageAnalysis = safeUsageAnalysis;
    }

    return safeEntry;
}

/**
 * Drop credentials (user:token@) from a remote URL. Applied even with
 * --include-sensitive: opting in to repository URLs is not opting in to secrets.
 */
function stripUrlUserinfo(remote) {
    if (typeof remote !== 'string') {
        return remote;
    }
    return remote.replace(/^([a-z][a-z0-9+.-]*:\/\/)[^\/@]*@/i, '$1');
}

function includeSensitiveEntry(cacheEntry) {
    if (!cacheEntry || typeof cacheEntry !== 'object' || Array.isArray(cacheEntry) || !('repository' in cacheEntry)) {
        return cacheEntry;
    }
    return { ...cacheEntry, repository: stripUrlUserinfo(cacheEntry.repository) };
}

/**
 * Try to find and read the cache file
 * Returns { success: boolean, data?: any, filePath?: string, error?: string }
 */
function readCacheFile() {
    const possiblePaths = getCacheFilePaths();
    
    for (const filePath of possiblePaths) {
        try {
            if (fs.lstatSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                return { success: true, data, filePath };
            }
        } catch (error) {
            // Continue to next path if this one fails
            continue;
        }
    }

    return {
        success: false,
        error: 'No cache file found'
    };
}

// Main execution
(function main() {
    // Try to read actual cache file
    const cacheResult = readCacheFile();

    if (cacheResult.success) {
        const entries = Object.entries(cacheResult.data || {});
        entries.sort((a, b) => ((b[1] && b[1].mtime) || 0) - ((a[1] && a[1].mtime) || 0));
        const limited = entries.slice(0, lastCount);
        const limitedObj = Object.fromEntries(limited.map(([filePath, cacheEntry], index) => [
            includeSensitive ? filePath : `session-${index + 1}`,
            includeSensitive ? includeSensitiveEntry(cacheEntry) : sanitizeCacheEntry(cacheEntry)
        ]));

        const output = {
            ...(includeSensitive ? { cacheFile: cacheResult.filePath } : {}),
            requestedCount: lastCount,
            totalCacheEntries: Object.keys(cacheResult.data || {}).length,
            entries: limitedObj
        };

        console.log(JSON.stringify(output));
        return;
    }

    // No cache found: output JSON error
    const errorOut = {
        cacheFound: false,
        error: cacheResult.error
    };
    console.log(JSON.stringify(errorOut));
    process.exit(1);
})();
