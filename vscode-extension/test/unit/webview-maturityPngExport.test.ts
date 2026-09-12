/// <reference path="../../src/types/jsdom.d.ts" />
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

// End-to-end coverage for the maturity webview PNG export path. The real
// `src/webview/maturity/main.ts` is bundled and executed in jsdom with the
// `html2canvas` dependency aliased to a deterministic stub, so the test can
// assert the emitted `saveChartImage` message, the off-screen card teardown,
// and the `exportImageFailed` fallback — none of which the pure-helper unit
// tests cover.

const EXT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ENTRY = path.join(EXT_ROOT, 'src', 'webview', 'maturity', 'main.ts');
const HTML2CANVAS_STUB = path.join(EXT_ROOT, 'test', 'stubs', 'html2canvas-stub.ts');

interface Harness {
  window: any;
  posted: any[];
  text: (selector: string) => string | null;
  clickExportPng: () => void;
  setHtml2CanvasThrow: (shouldThrow: boolean) => void;
}

let bundlePromise: Promise<string> | undefined;

function bundleMaturityWebview(): Promise<string> {
  bundlePromise ??= esbuild.build({
    entryPoints: [ENTRY],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    nodePaths: [path.join(EXT_ROOT, 'node_modules')],
    loader: { '.css': 'text' },
    alias: { html2canvas: HTML2CANVAS_STUB },
    logLevel: 'silent',
  }).then((result) => result.outputFiles[0].text);
  return bundlePromise;
}

function buildInitialData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    overallStage: 3,
    overallLabel: 'AI Collaborator',
    period: {
      sessions: 1,
      toolCalls: {},
      modeUsage: {},
      contextReferences: {},
      mcpTools: {},
      modelSwitching: {},
      repositories: [],
      repositoriesWithCustomization: [],
    },
    categories: [
      { category: 'Tool Usage', icon: '🛠️', stage: 3, evidence: [], tips: [] },
      { category: 'Context Engineering', icon: '🧠', stage: 2, evidence: [], tips: [] },
      { category: 'Customization', icon: '⚙️', stage: 2, evidence: [], tips: [] },
      { category: 'Agentic', icon: '🤖', stage: 2, evidence: [], tips: [] },
      { category: 'Conversation', icon: '💬', stage: 3, evidence: [], tips: [] },
      { category: 'Efficiency', icon: '⚡', stage: 3, evidence: [], tips: [] },
    ],
    lastUpdated: '2026-09-01T12:00:00.000Z',
    isDebugMode: false,
    ...overrides,
  };
}

function bootWebview(initialData: Record<string, unknown> | null): Harness {
  const bundle = getSyncBundle();
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://example.org/',
  });
  const window = dom.window as any;
  const posted: any[] = [];
  window.acquireVsCodeApi = () => ({
    postMessage: (message: unknown) => { posted.push(message); },
    getState: () => undefined,
    setState: () => undefined,
  });
  window.HTMLElement.prototype.attachInternals = () => ({
    setFormValue() { /* no-op */ }, setValidity() { /* no-op */ }, form: null, states: new Set(), role: null,
  });
  if (initialData) { window.__INITIAL_MATURITY__ = initialData; }
  window.eval(bundle);

  return {
    window,
    posted,
    text: (selector) => {
      const el = window.document.querySelector(selector);
      return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
    },
    clickExportPng: () => {
      const item = window.document.querySelector('.export-menu-item[data-export-type="png"]') as HTMLElement | null;
      assert.ok(item, 'PNG export menu item must be rendered');
      item.click();
    },
    setHtml2CanvasThrow: (shouldThrow) => {
      window.__HTML2CANVAS_THROW__ = shouldThrow;
    },
  };
}

let syncBundle: string | undefined;
function getSyncBundle(): string {
  if (syncBundle === undefined) { throw new Error('Bundle not preloaded — call preloadBundle() first'); }
  return syncBundle;
}
async function preloadBundle(): Promise<void> {
  syncBundle ??= await bundleMaturityWebview();
}

test('PNG export posts saveChartImage with the rendered image data and tears down the off-screen card', async () => {
  await preloadBundle();
  const harness = bootWebview(buildInitialData());
  // Allow bootstrap()'s dynamic import + renderLayout to settle.
  for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }

  // The Fluency Score screen must have rendered the elements the export composes from.
  assert.ok(harness.window.document.querySelector('.stage-banner'), 'stage banner must render');
  assert.ok(harness.window.document.querySelector('.radar-wrapper'), 'radar wrapper must render');

  harness.clickExportPng();
  // handlePngExport awaits the html2canvas stub; let it resolve.
  for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }

  const saveMsg = harness.posted.find((m) => m.command === 'saveChartImage');
  assert.ok(saveMsg, 'must post saveChartImage on a successful export');
  assert.match(saveMsg.data, /^data:image\/png;base64,/);

  // The off-screen export card must be removed from the document body after export.
  const leftover = harness.window.document.querySelectorAll('div[style*="left:-9999px"]');
  assert.equal(leftover.length, 0, 'export card must be torn down after export');
});

test('PNG export falls back to exportImageFailed (not the unusable downloadChartImage instructions) when html2canvas throws', async () => {
  await preloadBundle();
  const harness = bootWebview(buildInitialData());
  for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }

  harness.setHtml2CanvasThrow(true);
  harness.clickExportPng();
  for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }

  assert.ok(
    harness.posted.some((m) => m.command === 'exportImageFailed'),
    'a failed export must surface exportImageFailed',
  );
  assert.ok(
    !harness.posted.some((m) => m.command === 'downloadChartImage'),
    'a failed export must not surface the unusable downloadChartImage instructions',
  );
  const leftover = harness.window.document.querySelectorAll('div[style*="left:-9999px"]');
  assert.equal(leftover.length, 0, 'export card must still be torn down on failure');
});
