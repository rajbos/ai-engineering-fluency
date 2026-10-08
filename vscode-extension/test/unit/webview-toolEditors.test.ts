import test from 'node:test';
import * as assert from 'node:assert/strict';
import { formatToolEditors, sanitizeToolCallsByEditor } from '../../src/webview/usage/toolEditors';

test('sanitizeToolCallsByEditor: keeps positive finite counts and drops malformed entries', () => {
    const out = sanitizeToolCallsByEditor({
        a: { 'VS Code': 3, Bad: -1, Nan: Number.NaN, Str: 'x' },
        b: 'nope',
        c: { Zero: 0 },
    });
    assert.deepEqual(out, { a: { 'VS Code': 3 } });
});

test('sanitizeToolCallsByEditor: non-object input yields undefined', () => {
    assert.equal(sanitizeToolCallsByEditor(null), undefined);
    assert.equal(sanitizeToolCallsByEditor('x'), undefined);
});

test('formatToolEditors: lists editors most-used first', () => {
    const data = { t: { 'VS Code': 2, 'Claude Code (CLI)': 9 } };
    assert.equal(formatToolEditors('t', data), 'Claude Code (CLI), VS Code');
});

test('formatToolEditors: empty for unknown tool or missing data', () => {
    assert.equal(formatToolEditors('t', {}), '');
    assert.equal(formatToolEditors('t', undefined), '');
});
