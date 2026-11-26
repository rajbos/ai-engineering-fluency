/**
 * HTML for the Team Server settings window. Static markup plus an inline script that talks to
 * the main process only through the `window.teamServer` bridge (teamServerPreload.ts).
 */

const PROFILE_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'teamAnonymized', label: 'Team, anonymized: hashed workspace/machine IDs, no names' },
    { value: 'teamPseudonymous', label: 'Team, pseudonymous: hashed IDs, names only if allowed below' },
    { value: 'teamIdentified', label: 'Team, identified: hashed IDs, names only if allowed below' },
    { value: 'soloFull', label: 'Personal server: raw IDs and names' },
];

export function buildTeamServerPageHtml(dark: boolean): string {
    const options = PROFILE_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>Team Server</title>
<style>
  :root { color-scheme: ${dark ? 'dark' : 'light'}; --bg: ${dark ? '#1f1f1f' : '#ffffff'}; --fg: ${dark ? '#cccccc' : '#1f1f1f'};
          --muted: ${dark ? '#9d9d9d' : '#616161'}; --border: ${dark ? '#3c3c3c' : '#d0d0d0'}; --accent: #0078d4;
          --ok: ${dark ? '#89d185' : '#2e7d32'}; --err: ${dark ? '#f48771' : '#c62828'}; }
  body { font: 13px/1.45 system-ui, "Segoe UI", sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 20px 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; } p.lead { color: var(--muted); margin: 0 0 16px; }
  fieldset { border: 1px solid var(--border); border-radius: 6px; padding: 12px 14px; margin: 0 0 14px; }
  legend { padding: 0 6px; font-weight: 600; }
  label { display: block; margin: 8px 0 3px; } label.inline { display: flex; gap: 8px; align-items: center; }
  input[type=text], input[type=url], input[type=number], select { width: 100%; box-sizing: border-box; padding: 5px 7px;
          background: var(--bg); color: var(--fg); border: 1px solid var(--border); border-radius: 4px; font: inherit; }
  .hint { color: var(--muted); font-size: 12px; margin-top: 3px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 10px; }
  button { font: inherit; padding: 5px 12px; border-radius: 4px; border: 1px solid var(--border); background: transparent; color: var(--fg); cursor: pointer; }
  button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  button:disabled { opacity: .5; cursor: default; }
  .code { font: 600 20px/1 ui-monospace, Consolas, monospace; letter-spacing: 2px; }
  #status.ok { color: var(--ok); } #status.error { color: var(--err); } #saveMsg.error { color: var(--err); }
</style></head>
<body>
<h1>Team Server</h1>
<p class="lead">Upload this machine's daily usage rollups to a self-hosted AI Engineering Fluency sharing server,
the same data the VS Code extension's Team Server sync sends. Session content is never uploaded.</p>

<fieldset><legend>Server</legend>
  <label class="inline"><input type="checkbox" id="enabled"> Upload to a team server</label>
  <label for="endpointUrl">Server URL</label>
  <input type="url" id="endpointUrl" placeholder="https://fluency.example.com" spellcheck="false">
  <label for="sharingProfile">Sharing profile</label>
  <select id="sharingProfile">${options}</select>
  <label class="inline"><input type="checkbox" id="shareWorkspaceMachineNames"> Include workspace and machine names (pseudonymous/identified profiles only)</label>
  <label for="datasetId">Dataset ID</label>
  <input type="text" id="datasetId" spellcheck="false">
  <div class="hint">Keep this the same as the extension's <code>backend.datasetId</code> if both upload to one server.</div>
  <label for="lookbackDays">Lookback (days)</label>
  <input type="number" id="lookbackDays" min="1" max="90">
  <div class="row"><button class="primary" id="save">Save</button><span id="saveMsg"></span></div>
</fieldset>

<fieldset><legend>GitHub account</legend>
  <div id="account">Not signed in.</div>
  <div id="device" hidden><p>Enter this code on the GitHub page that just opened:</p><div class="code" id="userCode"></div></div>
  <div class="row"><button id="signIn">Sign in with GitHub</button><button id="signOut" hidden>Sign out</button></div>
  <div class="hint" id="signInHint"></div>
</fieldset>

<fieldset><legend>Sync</legend>
  <div id="status">—</div>
  <div class="row"><button id="syncNow">Upload now</button></div>
</fieldset>

<script>
const api = window.teamServer;
const $ = (id) => document.getElementById(id);
function fmtTime(ms) { return ms ? new Date(ms).toLocaleString() : ''; }
function renderStatus(s) {
  const el = $('status');
  const labels = { disabled: 'Upload is off.', 'signed-out': 'Sign in with GitHub to upload.', idle: 'Waiting for the first upload.', syncing: 'Uploading…', ok: 'Last upload succeeded.', error: 'Last upload failed.' };
  el.className = s.state === 'ok' ? 'ok' : s.state === 'error' ? 'error' : '';
  el.textContent = [labels[s.state] || s.state, s.message || '', s.lastSyncAt ? '(' + fmtTime(s.lastSyncAt) + ')' : ''].filter(Boolean).join(' ');
  $('syncNow').disabled = s.state === 'disabled' || s.state === 'signed-out' || s.state === 'syncing';
  const signedIn = s.state !== 'signed-out' && (s.githubLogin || s.signedIn);
  $('account').textContent = s.githubLogin ? 'Signed in as ' + s.githubLogin + '.' : (signedIn ? 'Signed in.' : 'Not signed in.');
  if (signedIn) { $('device').hidden = true; }
}
function render(data) {
  const st = data.settings;
  $('enabled').checked = st.enabled; $('endpointUrl').value = st.endpointUrl; $('sharingProfile').value = st.sharingProfile;
  $('shareWorkspaceMachineNames').checked = st.shareWorkspaceMachineNames; $('datasetId').value = st.datasetId; $('lookbackDays').value = st.lookbackDays;
  $('signIn').hidden = data.signedIn; $('signOut').hidden = !data.signedIn;
  $('signIn').disabled = !data.signInConfigured;
  $('signInHint').textContent = data.signInConfigured ? '' : 'GitHub sign-in is not configured in this build (no OAuth client ID).';
  renderStatus({ ...data.status, signedIn: data.signedIn });
}
async function reload() { render(await api.load()); }
$('save').onclick = async () => {
  const result = await api.save({
    enabled: $('enabled').checked, endpointUrl: $('endpointUrl').value, sharingProfile: $('sharingProfile').value,
    shareWorkspaceMachineNames: $('shareWorkspaceMachineNames').checked, datasetId: $('datasetId').value, lookbackDays: Number($('lookbackDays').value),
  });
  $('saveMsg').className = result.error ? 'error' : '';
  $('saveMsg').textContent = result.error || 'Saved.';
  await reload();
};
$('signIn').onclick = async () => {
  $('signIn').disabled = true;
  try {
    const prompt = await api.signIn();
    $('userCode').textContent = prompt.userCode; $('device').hidden = false;
  } catch (e) { $('signInHint').textContent = String(e && e.message || e); }
  finally { $('signIn').disabled = false; }
};
$('signOut').onclick = async () => { await api.signOut(); await reload(); };
$('syncNow').onclick = async () => { await api.syncNow(); };
api.onStatus(() => { void reload(); });
void reload();
</script>
</body></html>`;
}
