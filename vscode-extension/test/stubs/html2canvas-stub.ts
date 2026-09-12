// Test stub for html2canvas. Bundled into the maturity webview under test via
// esbuild alias so handlePngExport can be exercised in jsdom without a real
// canvas renderer. Reading window.__HTML2CANVAS_THROW__ lets a test force the
// render to reject, exercising the export failure fallback.
function html2canvas(element: HTMLElement, options?: Record<string, unknown>): Promise<HTMLCanvasElement> {
  const w = (globalThis as { window?: { __HTML2CANVAS_THROW__?: boolean } }).window;
  if (w?.__HTML2CANVAS_THROW__) {
    return Promise.reject(new Error('stubbed html2canvas failure'));
  }
  void element;
  void options;
  const fakeCanvas = {
    toDataURL: () => 'data:image/png;base64,STUBBED-PNG',
  } as unknown as HTMLCanvasElement;
  return Promise.resolve(fakeCanvas);
}

export default html2canvas;
