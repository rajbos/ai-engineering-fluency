/**
 * Keeps the user-facing CLI reference (docs/cli/README.md) in step with the
 * commands and options the CLI actually registers. Adding a command or option
 * without documenting it fails this test.
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';

import { statsCommand } from '../commands/stats';
import { usageCommand } from '../commands/usage';
import { environmentalCommand } from '../commands/environmental';
import { fluencyCommand } from '../commands/fluency';
import { diagnosticsCommand } from '../commands/diagnostics';
import { chartCommand } from '../commands/chart';
import { usageAnalysisCommand } from '../commands/usage-analysis';
import { allCommand } from '../commands/all';
import { segmentCommand } from '../commands/segment';
import { curationCommand } from '../commands/curation';
import { memoryFilesCommand } from '../commands/memory-files';

// Mirrors the program.addCommand() list in cli.ts, which can't be imported here
// because it parses process.argv on load.
const COMMANDS: Command[] = [
	statsCommand, usageCommand, environmentalCommand, fluencyCommand, diagnosticsCommand,
	chartCommand, usageAnalysisCommand, allCommand, segmentCommand, curationCommand, memoryFilesCommand,
];

// Global options registered on the root program in cli.ts.
const GLOBAL_OPTIONS = ['--no-cache'];

// Bundled to cli/out/test/, so the repository root is three levels up.
const DOCS_PATH = path.resolve(__dirname, '..', '..', '..', 'docs', 'cli', 'README.md');

function readDocs(): string {
	return fs.readFileSync(DOCS_PATH, 'utf8');
}

test('docs/cli/README.md documents every CLI command', () => {
	const docs = readDocs();
	for (const cmd of COMMANDS) {
		assert.ok(docs.includes(`\`${cmd.name()}\``), `command "${cmd.name()}" is not documented in ${DOCS_PATH}`);
		for (const alias of cmd.aliases()) {
			assert.ok(docs.includes(`\`${alias}\``), `alias "${alias}" of "${cmd.name()}" is not documented`);
		}
	}
});

test('docs/cli/README.md documents every CLI option', () => {
	const docs = readDocs();
	for (const cmd of COMMANDS) {
		for (const option of cmd.options) {
			const flag = option.long ?? option.short;
			assert.ok(flag, `option on "${cmd.name()}" has no flag`);
			assert.ok(docs.includes(flag), `option "${flag}" of "${cmd.name()}" is not documented`);
		}
	}
	for (const flag of GLOBAL_OPTIONS) {
		assert.ok(docs.includes(flag), `global option "${flag}" is not documented`);
	}
});
