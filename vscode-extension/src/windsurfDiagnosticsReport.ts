/** Renders the Windsurf diagnostics result as the markdown report the "Check Windsurf status" command opens. */
export function formatWindsurfDiagnosticsContent(diagnostics: Record<string, Record<string, unknown>>): string {
  return `# Windsurf Diagnostics Report

Generated: ${new Date().toISOString()}

## Environment
- Running in Windsurf: ${diagnostics.environment.isRunningInWindsurf}
- Running in Devin: ${diagnostics.environment.isRunningInDevin}
- App Name: ${diagnostics.environment.appName}

## Extension Status
- Extension Found: ${diagnostics.extension.found}
- Extension Active: ${diagnostics.extension.active}
- Extension Version: ${diagnostics.extension.packageJSON}

## Credentials
- Available: ${diagnostics.credentials.available}
- Port: ${diagnostics.credentials.port}
- CSRF Token Length: ${diagnostics.credentials.csrfLength}

## API Connectivity Test
- Success: ${diagnostics.apiTest.success}
- Status Code: ${diagnostics.apiTest.statusCode}
- Error: ${diagnostics.apiTest.error || 'None'}

## Configuration
- Windsurf Integration Enabled: ${diagnostics.configuration.enabled}

## Sessions
- Available: ${diagnostics.sessions.available}
- Count: ${diagnostics.sessions.count}
- Error: ${diagnostics.sessions.error || 'None'}

## Recommendations

${!diagnostics.extension.found ? '- Install the Windsurf extension\n' : ''}${!diagnostics.extension.active ? '- Activate the Windsurf extension or restart Windsurf\n' : ''}${!diagnostics.credentials.available ? '- Check if Windsurf language server is running\n' : ''}${!diagnostics.apiTest.success ? `- API connectivity issue: ${diagnostics.apiTest.error}\n` : ''}${diagnostics.sessions.count === 0 && diagnostics.apiTest.success ? '- Windsurf is working correctly, but no chat sessions have been created yet. Try starting a chat session in Windsurf and then refresh the token tracker.\n' : ''}
`;
}
