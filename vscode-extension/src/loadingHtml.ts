/**
 * Shared "Building Activity Index" loading screen — CSS, markup, and the
 * progress-driven animation script.
 *
 * Used by both the VS Code extension host (extension.ts getLoadingHtml) and
 * the Windows desktop app (desktop/src/main.ts buildLoadingHtml) so the two
 * surfaces show the exact same loading experience. Deliberately vscode-free:
 * plain string builders only.
 *
 * The script listens for `message` events on `window` with payloads:
 *   { command: 'loadingStep', step: 'discovering' | 'parsing' | 'computing',
 *     total?, editors? }
 *   { command: 'loadingProgress', completed, total, percentage, editors? }
 * In VS Code these arrive via webview.postMessage; in the desktop app the
 * preload bridges ipcRenderer 'loading-message' events to window.postMessage.
 */

export function getLoadingHtmlCssBase(): string {
	return `:root {
    --bg-primary: var(--vscode-editor-background, #1e1e2e);
    --bg-secondary: var(--vscode-sideBar-background, #181825);
    --bg-card: var(--vscode-editorWidget-background, #24273a);
    --text-primary: var(--vscode-editor-foreground, #cdd6f4);
    --text-muted: var(--vscode-descriptionForeground, #9399b2);
    --accent: var(--vscode-textLink-foreground, #89b4fa);
    --success: var(--vscode-terminal-ansiGreen, #a6e3a1);
    --border: var(--vscode-panel-border, #313244);
    --badge-bg: var(--vscode-badge-background, #313244);
    --badge-fg: var(--vscode-badge-foreground, #cdd6f4);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    background: var(--bg-primary); color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.card { width: 100%; max-width: 680px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 24px 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 16px; }
.badge-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
.title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.subtitle { font-size: 12px; color: var(--text-muted); margin-bottom: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 380px; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.pct-display { font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1; min-width: 70px; text-align: right; font-variant-numeric: tabular-nums; }
.meta-badges { display: flex; gap: 6px; }
.meta-badge { font-size: 11px; padding: 3px 10px; border: 1px solid var(--border); border-radius: 20px; color: var(--text-muted); background: var(--bg-card); white-space: nowrap; }
.progress-wrap { margin: 16px 0; }
.progress-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--accent), var(--success)); transition: width 0.5s ease; width: 2%; position: relative; }
.progress-fill.indeterminate { width: 25%; animation: slide-shimmer 1.8s ease-in-out infinite; background: linear-gradient(90deg, transparent, var(--accent), var(--success), transparent); }
@keyframes slide-shimmer { 0% { margin-left: -30%; } 100% { margin-left: 110%; } }
.stats-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-primary); }
.chip .chip-value { font-weight: 700; }`;
}

export function getLoadingHtmlCssSteps(): string {
	return `.steps-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; }
.step { display: flex; align-items: center; gap: 10px; padding: 5px 0; color: var(--text-muted); font-size: 13px; transition: color 0.25s; }
.step.step-done   { color: var(--success); }
.step.step-active { color: var(--accent); font-weight: 600; }
.step-ico { width: 18px; text-align: center; flex-shrink: 0; font-style: normal; }
.spin-ico { display: inline-block; animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.step-lbl { flex: 1; }
.step-cnt { font-size: 11px; opacity: 0.75; font-variant-numeric: tabular-nums; }
@keyframes pop-in { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
.pop { animation: pop-in 0.35s ease both; }`;
}

export function getLoadingHtmlBody(nonce: string, iconUri?: string): string {
	const badgeIcon = iconUri
		? `<img src="${iconUri}" alt="" width="20" height="20" style="vertical-align:middle;margin-right:6px;border-radius:3px;" />`
		: '🤖 ';
	return `<body>
<div class="card">
    <div class="header-row">
        <div>
            <div class="badge-label">${badgeIcon}Analyzing Your AI Activity</div>
            <div class="title">Building Activity Index</div>
            <div class="subtitle" id="subtitle">Discovering session files...</div>
        </div>
        <div class="header-right">
            <div class="pct-display" id="pct">–</div>
            <div class="meta-badges">
                <div class="meta-badge" id="badge-files">– files</div>
                <div class="meta-badge" id="badge-elapsed">0s</div>
            </div>
        </div>
    </div>
    <div class="progress-wrap"><div class="progress-track"><div class="progress-fill indeterminate" id="prog-fill"></div></div></div>
    <div class="stats-chips" id="chips" style="display:none">
        <div class="chip">📂 <span class="chip-value" id="chip-total">–</span> session files</div>
        <div class="chip">✅ <span class="chip-value" id="chip-done">–</span> processed</div>
    </div>
    <div id="editors-row" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;"></div>
    <div class="steps-box">
        <div class="step step-active" id="s-discover"><i class="step-ico"><span class="spin-ico">↻</span></i><span class="step-lbl">Discovering session files</span><span class="step-cnt" id="sc-discover"></span></div>

        <div class="step" id="s-parse"><i class="step-ico">○</i><span class="step-lbl">Parsing session logs</span><span class="step-cnt" id="sc-parse"></span></div>
        <div class="step" id="s-compute"><i class="step-ico">○</i><span class="step-lbl">Computing statistics</span><span class="step-cnt"></span></div>
        <div class="step" id="s-ready"><i class="step-ico">○</i><span class="step-lbl">Ready!</span><span class="step-cnt"></span></div>
    </div>
</div>
<script nonce="${nonce}">
${getLoadingHtmlScript()}
</script>
</body>`;
}

export function getLoadingHtmlScript(): string {
	return `(function () {
    var t0 = Date.now();
    var EDITORS = [];
    var editorsSeen = 0;
    setInterval(function () {
        var s = Math.floor((Date.now() - t0) / 1000);
        var el = document.getElementById('badge-elapsed');
        if (!el) return;
        if (s < 60) { el.textContent = s + 's'; } else { el.textContent = Math.floor(s / 60) + 'm ' + (s % 60) + 's'; }
    }, 1000);
    function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function setDone(id) {
        var el = document.getElementById(id); if (!el) return;
        el.classList.remove('step-active'); el.classList.add('step-done');
        var ico = el.querySelector('.step-ico'); if (ico) { ico.className = 'step-ico'; ico.innerHTML = '<span class="pop">✓</span>'; }
    }
    function setActive(id) {
        var el = document.getElementById(id); if (!el) return;
        el.classList.remove('step-done'); el.classList.add('step-active');
        var ico = el.querySelector('.step-ico'); if (ico) { ico.className = 'step-ico'; ico.innerHTML = '<span class="spin-ico">↻</span>'; }
    }
    // Advance the checklist into the parsing phase. Idempotent: the step transition runs
    // once even if it is triggered by a loadingProgress message because the one-time
    // loadingStep 'parsing' was posted before this webview's listener was attached.
    var parsingShown = false;
    function enterParsing(total) {
        if (!parsingShown) {
            parsingShown = true;
            setDone('s-discover'); setActive('s-parse');
            var chips = document.getElementById('chips'); if (chips) chips.style.display = 'flex';
        }
        if (total) { var sc = document.getElementById('sc-discover'); if (sc) sc.textContent = '(' + total + ' found)'; }
    }
    window.addEventListener('message', function (ev) {
        var m = ev.data; if (!m) return;
        if (m.command === 'loadingStep') {
            if (m.step === 'discovering') { setActive('s-discover');
            } else if (m.step === 'parsing') {
                var total = m.total || 0;
                if (m.editors !== undefined) { EDITORS = m.editors; editorsSeen = 0; }
                enterParsing(total);
                var sub = document.getElementById('subtitle'); if (sub) sub.textContent = 'Parsing ' + total + ' session files...';
                var bf = document.getElementById('badge-files'); if (bf) bf.textContent = total + ' files';
                var ct = document.getElementById('chip-total'); if (ct) ct.textContent = total.toLocaleString();
            } else if (m.step === 'computing') {
                enterParsing(0);
                setDone('s-parse'); setActive('s-compute');
                var fill = document.getElementById('prog-fill'); if (fill) { fill.classList.remove('indeterminate'); fill.style.width = '96%'; }
                var pct = document.getElementById('pct'); if (pct) pct.textContent = '96%';
                var sub2 = document.getElementById('subtitle'); if (sub2) sub2.textContent = 'Computing statistics...';
            }
        } else if (m.command === 'loadingProgress') {
            // Receiving progress means parsing is underway — reconcile the checklist in case
            // the loadingStep 'parsing' transition was missed during webview startup.
            enterParsing(m.total);
            // Editors are included in every progress tick so pills appear even when the
            // one-time loadingStep 'parsing' message was dropped before the listener attached.
            if (m.editors && m.editors.length > EDITORS.length) { EDITORS = m.editors; }
            var pct2 = document.getElementById('pct'); if (pct2) pct2.textContent = m.percentage + '%';
            var fill2 = document.getElementById('prog-fill'); if (fill2) { fill2.classList.remove('indeterminate'); fill2.style.width = (m.percentage < 3 ? 3 : m.percentage) + '%'; }
            var cd = document.getElementById('chip-done'); if (cd) cd.textContent = m.completed.toLocaleString();
            var bf2 = document.getElementById('badge-files'); if (bf2) bf2.textContent = m.completed + '\\u202f/\\u202f' + m.total + ' files';
            var sc2 = document.getElementById('sc-parse'); if (sc2) sc2.textContent = '(' + m.completed + '/' + m.total + ')';
            var sub3 = document.getElementById('subtitle'); if (sub3) sub3.textContent = 'Parsing session ' + m.completed + '\\u202f/\\u202f' + m.total + '\\u2026';
            var expectedPills = Math.min(EDITORS.length, Math.floor((m.completed / Math.max(1, m.total)) * EDITORS.length));
            while (editorsSeen < expectedPills) {
                var editor = EDITORS[editorsSeen]; editorsSeen++;
                var row = document.getElementById('editors-row');
                if (row) { var pill = document.createElement('div'); pill.className = 'chip'; pill.style.animation = 'pop-in 0.35s ease both'; pill.innerHTML = '<span>' + editor.icon + '</span>\\u00a0<span class="chip-value">' + esc(editor.name) + '</span>'; row.appendChild(pill); }
            }
        }
    });
}());`;
}
