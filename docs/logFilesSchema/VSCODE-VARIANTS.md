# VS Code Variants Support

The AI Engineering Fluency extension and analysis script check session files for **all VS Code variants**:

## Supported Editors

| Editor | Status | Notes |
|--------|--------|-------|
| **VS Code Stable** | ✅ Supported | Main VS Code release |
| **VS Code Insiders** | ✅ Supported | Pre-release builds, uses incremental JSONL format |
| **VS Code Exploration** | ✅ Supported | Experimental builds |
| **VSCodium** | ✅ Supported | Open-source build |
| **Cursor** | ✅ Supported | AI-first editor |

## Session File Formats by Variant

| Variant | JSON Files | JSONL Incremental |
|---------|------------|-------------------|
| VS Code Stable | ✅ Primary | ❓ May adopt later |
| VS Code Insiders | ⚠️ Legacy | ✅ Primary (as of Jan 2026) |
| Other variants | ✅ Primary | ❓ Varies |

> **Note:** VS Code Insiders introduced the incremental JSONL format (`kind: 0, 1, 2`) for workspace sessions. The extension automatically detects and handles both formats.

## File Locations (Windows)

For each variant, session files are stored in:

### Local Installations
```
%APPDATA%\{Variant}\User\
├── workspaceStorage\
│   └── {workspaceId}\
│       └── chatSessions\
│           ├── *.json       ← Complete session snapshots
│           └── *.jsonl      ← Incremental updates (VS Code Insiders)
├── globalStorage\
│   ├── emptyWindowChatSessions\*.json ← No-workspace chats
│   └── github.copilot-chat\**\*.json  ← Additional Copilot chats
```

### Remote/Server Installations (Linux)
```
~/.vscode-server/data/User/           ← Remote SSH/WSL
~/.vscode-server-insiders/data/User/  ← Remote Insiders
~/.vscode-remote/data/User/           ← Remote extensions
/tmp/.vscode-server/data/User/        ← Temp server
/workspace/.vscode-server/data/User/  ← Codespaces
```

### Copilot CLI (Not editor-specific)
```
%USERPROFILE%\.copilot\session-state\*.jsonl  ← CLI agent sessions
```

## Automatic Detection

Both the extension and analysis script:
1. ✅ Scan all variant paths automatically
2. ✅ Skip variants that aren't installed
3. ✅ Aggregate data from all found variants
4. ✅ Report which variants have session files

## Usage Example

The analysis script will show:
```
Scanning for session files...
  Workspace chat sessions (Code): Found 156 files
  Workspace chat sessions (Code - Insiders): Found 28 files
  Global chat sessions (Code): Found 64 files
  Global chat sessions (Code - Insiders): Found 3 files
  Copilot CLI sessions: Found 9 files
  Copilot Chat global storage (Code): Found 0 files
```

## Platform-Specific Paths

### Windows
- AppData: `%APPDATA%\{Variant}\User`
- Example: `C:\Users\username\AppData\Roaming\Code - Insiders\User`

### macOS
- Library: `~/Library/Application Support/{Variant}/User`
- Example: `/Users/username/Library/Application Support/Code - Insiders/User`

### Linux
- Config: `$XDG_CONFIG_HOME/{Variant}/User` or `~/.config/{Variant}/User`
- Example: `/home/username/.config/Code - Insiders/User`

## Benefits

- 📊 **Complete tracking** - All your Copilot usage across editors
- 🔍 **Insiders preview** - Track usage of new features before stable release
- 🎯 **Multi-editor** - Use different editors for different projects
- 📈 **Accurate stats** - No missed session data

## Notes

- The extension activates in whichever editor variant you're using
- The analysis script can be run from any variant and will find all variants
- Remote server paths are checked by the extension (for Codespaces/WSL scenarios)
- The analysis script currently focuses on local Windows installations
