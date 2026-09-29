/**
 * Keeps the user-facing CLI reference (docs/cli/README.md) in step with the
 * commands and options the CLI actually registers. Adding a command or option
 * without documenting it fails this test.
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import type { Command, Option } from 'commander';

import { createProgram } from '../program';

// The same program the executable builds, so a command or option registered in
// program.ts but missing from the docs fails here without editing this test.
const PROGRAM = createProgram();
const COMMANDS: readonly Command[] = PROGRAM.commands;

function flagOf(option: Option): string | undefined {
	return option.long ?? option.short;
}

// Bundled to cli/out/test/, so the repository root is three levels up.
const DOCS_PATH = path.resolve(__dirname, '..', '..', '..', 'docs', 'cli', 'README.md');

function readDocs(): string {
	return fs.readFileSync(DOCS_PATH, 'utf8');
}

test('docs/cli/README.md documents every CLI command', () => {
	const docs = readDocs();
	assert.ok(COMMANDS.length > 0, 'program registers no commands');
	for (const cmd of COMMANDS) {
		assert.ok(docs.includes(`\`${cmd.name()}\``), `command "${cmd.name()}" is not documented in ${DOCS_PATH}`);
		for (const alias of cmd.aliases()) {
			assert.ok(docs.includes(`\`${alias}\``), `alias "${alias}" of "${cmd.name()}" is not documented`);
		}
	}
});

test('docs/cli/README.md documents every CLI option', () => {
	const docs = readDocs();
	for (const option of PROGRAM.options) {
		const flag = flagOf(option);
		assert.ok(flag && docs.includes(flag), `global option "${flag}" is not documented`);
	}
	for (const cmd of COMMANDS) {
		for (const option of cmd.options) {
			const flag = flagOf(option);
			assert.ok(flag, `option on "${cmd.name()}" has no flag`);
			assert.ok(docs.includes(flag), `option "${flag}" of "${cmd.name()}" is not documented`);
		}
	}
});
