import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildShareCardHeaderHtml, shareCardContainerStyle, SHARE_CARD_BG } from '../../src/webview/maturity/shareCard';

describe('buildShareCardHeaderHtml', () => {
  test('renders the fixed report title and a "Report ·" line carrying the date', () => {
    const html = buildShareCardHeaderHtml('2026-09-01T12:00:00.000Z');
    assert.match(html, /AI Engineering Fluency Score/);
    assert.match(html, /Report &middot; /);
  });

  test('degrades gracefully when lastUpdated is not a parseable date', () => {
    const payload = '2026-09-01"><img src=x onerror=alert(1)>';
    const html = buildShareCardHeaderHtml(payload);
    // An unparseable value becomes the runtime's localized "Invalid Date" string,
    // so the raw markup never reaches the rendered header.
    assert.match(html, /Report &middot; Invalid Date/);
    assert.ok(!html.includes('<img'), 'raw <img must not survive into the header');
  });

  test('uses the centered title-block style and the dark share-card background', () => {
    const html = buildShareCardHeaderHtml('2026-09-01T12:00:00.000Z');
    assert.match(html, /text-align:center;margin-bottom:20px;/);
    assert.equal(SHARE_CARD_BG, '#1b1b1e');
    assert.match(shareCardContainerStyle(), /width:1200px;background:#1b1b1e;/);
    assert.match(shareCardContainerStyle(), /left:-9999px;/);
  });
});
