import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
    buildCostSpeedSectionHtml,
    buildMcpHealthSectionHtml,
    buildToolExecutionSectionsHtml,
    buildToolLatencySectionHtml,
    buildToolReliabilitySectionHtml,
    formatLatencyMs,
    type ToolExecutionSectionsInput,
} from '../../src/webview/usage/toolExecutionHtml';
import type { LatencyHistogram } from '../../src/webview/shared/types';

/** Histogram with `n` samples all in bucket `i` (durations in [2^i, 2^(i+1)) ms). */
function hist(i: number, n: number, sumMs = n * 2 ** i): LatencyHistogram {
    const buckets = new Array<number>(23).fill(0);
    buckets[i] = n;
    return { count: n, sumMs, buckets };
}

function sampleInput(overrides: Partial<ToolExecutionSectionsInput> = {}): ToolExecutionSectionsInput {
    return {
        toolCalls: {
            total: 160,
            byTool: { view: 100, powershell: 40, 'mcp__github__get_file_contents': 12, task: 5, report_intent: 3, __slash__commit: 2 },
            failuresByTool: { powershell: 10, 'mcp__github__get_file_contents': 3 },
            latencyByTool: { view: hist(5, 100), powershell: hist(11, 40), 'mcp__github__get_file_contents': hist(10, 12), task: hist(14, 5) },
            outputTokensByTool: { view: 100_000, powershell: 8_000, task: 5_000 },
        },
        mcpTools: {
            total: 12,
            byServer: { github: 12 },
            byTool: { get_file_contents: 12 },
            failuresByServer: { github: 3 },
            latencyByServer: { github: hist(10, 12) },
        },
        resolveToolName: id => id === 'view' ? 'View File' : id,
        ...overrides,
    };
}

test('formatLatencyMs: ms / s / m ranges', () => {
    assert.equal(formatLatencyMs(0), '0ms');
    assert.equal(formatLatencyMs(41.4), '41ms');
    assert.equal(formatLatencyMs(1500), '1.5s');
    assert.equal(formatLatencyMs(12_400), '12s');
    assert.equal(formatLatencyMs(90_000), '1.5m');
});

test('reliability section: stacked success/failure bars, friendly names, failure share label', () => {
    const html = buildToolReliabilitySectionHtml(sampleInput());
    assert.match(html, /id="section-tool-reliability"/);
    assert.match(html, /Tool execution reliability/);
    assert.match(html, /View File/);
    assert.match(html, /tool-exec-bar-failure/);
    assert.match(html, />40 · 25%</, 'powershell: 40 calls, 10 failures');
    assert.match(html, />100</, 'view has no failures so no share suffix');
    assert.doesNotMatch(html, /__slash__/, 'slash markers are not tool calls');
});

test('reliability section: empty state when no editor recorded a failure flag', () => {
    const input = sampleInput();
    delete input.toolCalls.failuresByTool;
    const html = buildToolReliabilitySectionHtml(input);
    assert.match(html, /tool-exec-empty/);
    assert.match(html, /No tool outcome data yet/);
    assert.doesNotMatch(html, /<svg/);
});

test('latency section: p50 bar, p95 marker, log axis ticks and per-row readout', () => {
    const html = buildToolLatencySectionHtml(sampleInput());
    assert.match(html, /id="section-tool-latency"/);
    assert.match(html, /tool-exec-marker-p95/);
    assert.match(html, />1ms</);
    assert.match(html, />1\.0s</);
    // powershell: all samples in [2048, 4096) → p50 and p95 land in that bucket
    assert.match(html, /powershell: p50 [23]\.\ds, p95 [34]\.\ds, 40 calls/);
    assert.match(html, /View File: p50 \d+ms/);
});

test('latency section: empty state and hidden automatic tools', () => {
    assert.match(buildToolLatencySectionHtml(sampleInput({ toolCalls: { total: 0, byTool: {} } })), /No tool latency data yet/);
    const html = buildToolLatencySectionHtml(sampleInput({ hiddenTools: new Set(['view']) }));
    assert.doesNotMatch(html, /View File/);
    assert.match(html, /powershell/);
});

test('MCP health section: calls and failure share per server, falling back to histogram counts', () => {
    const html = buildMcpHealthSectionHtml(sampleInput());
    assert.match(html, /id="section-mcp-health"/);
    assert.match(html, /12 · 25% fail/);
    // A server only present in the outcome maps (Copilot CLI naming gap) is still listed.
    const input = sampleInput();
    input.mcpTools.byServer = {};
    assert.match(buildMcpHealthSectionHtml(input), /github/);
    input.mcpTools.latencyByServer = {};
    input.mcpTools.failuresByServer = {};
    assert.match(buildMcpHealthSectionHtml(input), /No MCP server calls/);
});

test('cost vs speed section: only tools with latency and output tokens, coloured by kind', () => {
    const html = buildCostSpeedSectionHtml(sampleInput());
    assert.match(html, /id="section-tool-cost-speed"/);
    assert.match(html, /tool-exec-kind-builtin/);
    assert.match(html, /tool-exec-kind-subagent/, 'task is a delegation tool');
    assert.doesNotMatch(html, /tool-exec-kind-mcp"/, 'MCP tool has no output tokens so it is not plotted');
    assert.match(html, /View File \(builtin\): p50 \d+ms, 1,000 tokens\/call, 100 calls/);
    assert.match(html, /top-right = heavy &amp; slow/);
    assert.match(buildCostSpeedSectionHtml(sampleInput({ toolCalls: { total: 1, byTool: { view: 1 } } })), /No tools have both latency/);
});

test('all sections: tool ids are HTML-escaped and the four sections render in order', () => {
    const input = sampleInput({
        toolCalls: {
            total: 1,
            byTool: { '<script>x</script>': 1 },
            failuresByTool: { '<script>x</script>': 1 },
            latencyByTool: { '<script>x</script>': hist(3, 1) },
            outputTokensByTool: { '<script>x</script>': 50 },
        },
    });
    const html = buildToolExecutionSectionsHtml(input);
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;/);
    const order = ['section-tool-reliability', 'section-tool-latency', 'section-mcp-health', 'section-tool-cost-speed'].map(id => html.indexOf(`id="${id}"`));
    assert.ok(order.every((pos, i) => pos >= 0 && (i === 0 || pos > order[i - 1])), `sections out of order: ${order.join(',')}`);
});
