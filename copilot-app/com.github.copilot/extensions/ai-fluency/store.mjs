import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";

export const SCHEMA_VERSION = 1;
export const PERIODS = ["today", "last30Days", "month", "lastMonth"];

export function artifactsDir() {
    const home = process.env.COPILOT_HOME || join(homedir(), ".copilot");
    return join(home, "extensions", "ai-fluency", "artifacts");
}

const num = (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

function sortedEntries(map, toRow) {
    return Object.entries(map ?? {})
        .map(([name, value]) => toRow(name, value ?? {}))
        .sort((a, b) => b.tokens - a.tokens);
}

function trimPeriod(period = {}) {
    return {
        tokens: num(period.tokens),
        thinkingTokens: num(period.thinkingTokens),
        sessions: num(period.sessions),
        avgInteractionsPerSession: num(period.avgInteractionsPerSession),
        avgTokensPerSession: num(period.avgTokensPerSession),
        estimatedCost: num(period.estimatedCost),
        estimatedCostCopilot: num(period.estimatedCostCopilot),
        co2: num(period.co2),
        waterUsage: num(period.waterUsage),
        treesEquivalent: num(period.treesEquivalent),
        models: sortedEntries(period.modelUsage, (name, m) => ({
            name,
            tokens: num(m.inputTokens) + num(m.outputTokens),
            inputTokens: num(m.inputTokens),
            outputTokens: num(m.outputTokens),
            cachedTokens: num(m.cachedReadTokens),
        })),
        editors: sortedEntries(period.editorUsage, (name, e) => ({ name, tokens: num(e.tokens), sessions: num(e.sessions) })),
    };
}

export const CHART_PERIODS = ["day", "week", "month"];
export const TOP_SERIES = 8;
// Chart view "split" datasets per metric, keyed by the CLI's `chart.periods.<period>` field names.
const SPLIT_SOURCES = {
    tokens: { model: "modelDatasets", editor: "editorDatasets", provider: "providerTokensDatasets", repository: "repositoryDatasets" },
    cost: { model: "modelCostDatasets", editor: "editorCostDatasets", provider: "billingGroupCostDatasets" },
    sessions: { model: "modelSessionsDatasets", editor: "editorSessionsDatasets", provider: "providerSessionsDatasets" },
};

/**
 * Keeps the largest series (bottom of the stack first) and folds the rest into one "Other" series, so the legend
 * stays readable in a side panel — the CLI emits up to ~90 model series for the monthly view.
 */
export function topSeries(datasets, length, { limit = TOP_SERIES, digits = 0 } = {}) {
    if (!Array.isArray(datasets)) return [];
    const isOther = (s) => /^other$/i.test(s.label);
    const series = datasets
        .map((d) => {
            const data = Array.from({ length }, (_, i) => round(num(d?.data?.[i]), digits));
            return { label: String(d?.label ?? ""), data, total: data.reduce((a, b) => a + b, 0) };
        })
        .filter((s) => s.label && s.total > 0);
    const ranked = series.filter((s) => !isOther(s)).sort((a, b) => b.total - a.total);
    const rest = [...ranked.slice(limit), ...series.filter(isOther)];
    const kept = ranked.slice(0, limit).map(({ label, data }) => ({ label, data }));
    if (rest.length === 1) kept.push({ label: rest[0].label, data: rest[0].data, ...(isOther(rest[0]) && { other: true }) });
    else if (rest.length > 1) {
        const data = Array.from({ length }, (_, i) => round(rest.reduce((a, s) => a + s.data[i], 0), digits));
        kept.push({ label: `Other (${rest.length})`, data, other: true });
    }
    return kept;
}

function trimChartPeriod(period) {
    const labels = Array.isArray(period?.labels) ? period.labels.map(String) : [];
    if (!labels.length) return null;
    const series = (values, digits = 0) => (Array.isArray(values) ? labels.map((_, i) => round(num(values[i]), digits)) : null);
    const splits = {};
    for (const [metric, sources] of Object.entries(SPLIT_SOURCES)) {
        splits[metric] = {};
        for (const [split, key] of Object.entries(sources)) {
            const kept = topSeries(period[key], labels.length, { digits: metric === "cost" ? 4 : 0 });
            if (kept.length) splits[metric][split] = kept;
        }
    }
    return {
        labels,
        tokens: series(period.tokensData) ?? labels.map(() => 0),
        sessions: series(period.sessionsData) ?? labels.map(() => 0),
        cost: series(period.costData, 4),
        splits,
    };
}

/** Day / week / month aggregations for the Chart view. Older CLIs only send the flat daily fields. */
function trimCharts(chart = {}) {
    const periods = chart.periods ?? {};
    return {
        day: trimChartPeriod({ ...chart, ...periods.day }),
        week: trimChartPeriod(periods.week),
        month: trimChartPeriod(periods.month),
    };
}

function trimFluency(fluency = {}) {
    if (!Array.isArray(fluency.categories)) return null;
    return {
        overallStage: num(fluency.overallStage),
        overallLabel: String(fluency.overallLabel ?? ""),
        categories: fluency.categories.map((c) => ({
            category: String(c.category ?? ""),
            icon: String(c.icon ?? ""),
            stage: num(c.stage),
            evidence: Array.isArray(c.evidence) ? c.evidence.map(String) : [],
            tips: Array.isArray(c.tips) ? c.tips.map(String) : [],
        })),
    };
}

function yamlValue(text, key) {
    const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    if (!match) return null;
    return match[1].trim().replace(/^(['"])(.*)\1$/, "$2") || null;
}

/** Session names are often the first prompt: strip markdown/escapes and cap the length. */
export function cleanLabel(value) {
    if (!value) return null;
    const text = String(value)
        .replace(/\\[nrt]/g, " ")
        .replace(/\*\*|__|`/g, "")
        .replace(/^#+\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
    if (!text) return null;
    return text.length > 200 ? `${text.slice(0, 199)}…` : text;
}

function projectFromCwd(cwd) {
    if (!cwd) return null;
    const worktree = cwd.match(/copilot-worktrees[\\/]([^\\/]+)/i);
    return worktree ? worktree[1] : basename(cwd.replace(/[\\/]+$/, "")) || null;
}

function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * The CLI does not return session titles, so derive a readable label and
 * project from the session's on-disk location. Only small metadata files next
 * to the session are read — never the session transcript itself.
 */
export function describeSession(filePath = "") {
    try {
        const copilotCli = filePath.match(/^(.*[\\/]session-state[\\/][0-9a-f-]{36})[\\/]events\.jsonl$/i);
        if (copilotCli) {
            const yamlPath = join(copilotCli[1], "workspace.yaml");
            if (existsSync(yamlPath)) {
                const yaml = readFileSync(yamlPath, "utf8");
                return { label: cleanLabel(yamlValue(yaml, "name") ?? yamlValue(yaml, "summary")), project: projectFromCwd(yamlValue(yaml, "cwd")) };
            }
        }
        const vscode = filePath.match(/^(.*[\\/]workspaceStorage[\\/][^\\/]+)[\\/]chatSessions[\\/]/i);
        if (vscode) {
            const workspaceJson = join(vscode[1], "workspace.json");
            if (existsSync(workspaceJson)) {
                const { folder, workspace } = readJson(workspaceJson);
                const uri = decodeURIComponent(String(folder ?? workspace ?? ""));
                return { label: null, project: basename(uri.replace(/[\\/]+$/, "")).replace(/\.code-workspace$/, "") || null };
            }
        }
        const folder = basename(dirname(filePath));
        const claudeWorktree = folder.match(/^(?:[A-Za-z]--Users-[^-]+-)?(.*?)-+claude-worktrees-(.+)$/);
        if (claudeWorktree) {
            return { label: claudeWorktree[2].replace(/-[0-9a-f]{6}$/, ""), project: claudeWorktree[1].replace(/^code-repos-/, "") || null };
        }
        if (/[\\/]\.claude[\\/]projects[\\/]/i.test(filePath)) {
            return { label: null, project: folder.replace(/^[A-Za-z]--Users-[^-]+-/, "").replace(/^code-repos-/, "") || null };
        }
    } catch {
        // metadata is best-effort
    }
    return { label: null, project: null };
}

function shortId(filePath = "") {
    const afterHash = filePath.includes("#") ? filePath.slice(filePath.lastIndexOf("#") + 1) : null;
    if (afterHash) return afterHash.replace(/^ses_/, "").slice(0, 8);
    const file = basename(filePath).replace(/\.[^.]+$/, "");
    const id = ["events", "meta"].includes(file) ? basename(dirname(filePath)) : file;
    return id.replace(/^session_\d+_\d+_/, "").slice(0, 8);
}

function trimSessions(usage = {}, describe) {
    const recent = usage.recentSessions ?? {};
    const all = [...(recent.last30 ?? []), ...(recent.last7 ?? []), ...(recent.currentMonth ?? []), ...(usage.todaySessions ?? [])];
    const byPath = new Map();
    for (const session of all) {
        if (!session?.filePath || byPath.has(session.filePath)) continue;
        byPath.set(session.filePath, session);
    }
    return [...byPath.values()]
        .map((s) => {
            const { label, project } = describe(s.filePath);
            return {
                id: createHash("sha1").update(s.filePath).digest("hex").slice(0, 12),
                shortId: shortId(s.filePath),
                label: cleanLabel(typeof s.title === "string" && s.title ? s.title : label),
                project,
                editor: String(s.editor ?? "Unknown"),
                models: Array.isArray(s.models) ? s.models.map(String) : [],
                interactions: num(s.interactions),
                toolCalls: num(s.toolCalls),
                totalTokens: num(s.totalTokens),
                inputTokens: num(s.inputTokens),
                outputTokens: num(s.outputTokens),
                cachedTokens: num(s.cachedTokens),
                thinkingTokens: num(s.thinkingTokens),
                estimatedCost: num(s.estimatedCost),
                activeDurationMs: num(s.activeDurationMs),
                lastActivity: s.lastActivity ?? null,
            };
        })
        .sort((a, b) => String(b.lastActivity).localeCompare(String(a.lastActivity)));
}

/** Reduce the ~700 KB `all --json` payload to what the canvas renders. */
export function buildSnapshot(payload, { fetchedAt = new Date().toISOString(), durationMs = 0, cli = null, describe = describeSession } = {}) {
    const details = payload.details ?? {};
    return {
        schemaVersion: SCHEMA_VERSION,
        fetchedAt,
        durationMs,
        cliVersion: cli?.version ?? null,
        cliSource: cli?.source ?? null,
        periods: Object.fromEntries(PERIODS.map((p) => [p, trimPeriod(details[p])])),
        charts: trimCharts(payload.chart),
        sessions: trimSessions(payload.usage, describe),
        fluency: trimFluency(payload.fluency),
    };
}

export function snapshotPath(dir = artifactsDir()) {
    return join(dir, "snapshot.json");
}

export async function readSnapshot(dir = artifactsDir()) {
    try {
        const snapshot = JSON.parse(await readFile(snapshotPath(dir), "utf8"));
        return snapshot?.schemaVersion === SCHEMA_VERSION ? snapshot : null;
    } catch {
        return null;
    }
}

export async function writeSnapshot(snapshot, dir = artifactsDir()) {
    await mkdir(dir, { recursive: true });
    const target = snapshotPath(dir);
    const temp = `${target}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(snapshot), "utf8");
    await rename(temp, target);
}

const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;

/** Compact, agent-friendly view of a snapshot. */
export function summarize(snapshot, { topSessions = 5 } = {}) {
    if (!snapshot) return { available: false, message: "No snapshot yet — a refresh is needed (it takes several minutes)." };
    const period = (p) => ({
        tokens: p.tokens,
        sessions: p.sessions,
        estimatedApiCostUsd: round(p.estimatedCost),
        copilotCreditsUsd: round(p.estimatedCostCopilot),
        avgTokensPerSession: Math.round(p.avgTokensPerSession),
        co2Grams: round(p.co2),
        waterLiters: round(p.waterUsage, 3),
        topModels: p.models.slice(0, 5).map((m) => ({ name: m.name, tokens: m.tokens })),
        editors: p.editors.map((e) => ({ name: e.name, tokens: e.tokens, sessions: e.sessions })),
    });
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const lastWeek = snapshot.sessions.filter((s) => Date.parse(s.lastActivity) >= since);
    return {
        available: true,
        fetchedAt: snapshot.fetchedAt,
        cliVersion: snapshot.cliVersion,
        periods: Object.fromEntries(PERIODS.map((p) => [p, period(snapshot.periods[p])])),
        fluency: snapshot.fluency && {
            overall: snapshot.fluency.overallLabel,
            categories: snapshot.fluency.categories.map((c) => ({ category: c.category, stage: c.stage, tips: c.tips })),
        },
        topSessionsLast7Days: [...lastWeek]
            .sort((a, b) => b.totalTokens - a.totalTokens)
            .slice(0, topSessions)
            .map((s) => ({
                label: s.label ?? `${s.editor} ${s.shortId}`,
                project: s.project,
                editor: s.editor,
                models: s.models,
                tokens: s.totalTokens,
                estimatedApiCostUsd: round(s.estimatedCost),
                interactions: s.interactions,
                lastActivity: s.lastActivity,
            })),
    };
}
