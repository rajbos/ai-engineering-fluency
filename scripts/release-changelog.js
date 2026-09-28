#!/usr/bin/env node
'use strict';

/**
 * Keep a component's CHANGELOG.md the single source of release notes.
 *
 * The changelog is written *before* a release, in the release-prep PR, so it
 * reaches main together with the version bump. The release workflow then only
 * reads it back; it never commits to git.
 *
 * Usage:
 *   node scripts/release-changelog.js promote <changelog> <version> [date]
 *     Turn the entries under "## [Unreleased]" into a "## [<version>] - <date>"
 *     section and leave an empty "## [Unreleased]" above it. <date> defaults to
 *     today (UTC, YYYY-MM-DD). Fails if [Unreleased] is empty or <version>
 *     already has a section.
 *
 *   node scripts/release-changelog.js extract <changelog> <version> [--out <file>]
 *     Print the body of the "## [<version>]" section (to stdout, or to <file>).
 *     Fails if the section is missing or empty — used by release.yml to refuse
 *     to publish a version whose changelog was never written.
 *
 * Run the tests with:  node --test scripts/release-changelog.test.js
 */

const fs = require('fs');

const UNRELEASED = 'Unreleased';

/** Matches a level-2 version heading: "## [0.18.2]" or "## [0.18.2] - 2026-09-28". */
const HEADING = /^## \[([^\]]+)\](?:\s+-\s+.*)?\s*$/;

/**
 * Split a changelog into its level-2 sections.
 * @param {string} text
 * @returns {{ preamble: string[], sections: { name: string, heading: string, body: string[] }[] }}
 */
function parseSections(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const preamble = [];
  const sections = [];
  for (const line of lines) {
    const match = HEADING.exec(line);
    if (match) {
      sections.push({ name: match[1].trim(), heading: line, body: [] });
    } else if (sections.length > 0) {
      sections[sections.length - 1].body.push(line);
    } else {
      preamble.push(line);
    }
  }
  return { preamble, sections };
}

/** The line ending a changelog uses: CRLF if it has any, otherwise LF. */
function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

/**
 * Join a parsed changelog back into text with `eol` — the inverse of
 * parseSections. Re-serializing a file with its own line ending gives back the
 * same bytes, so only the sections a caller changed show up in the diff.
 */
function serializeSections(preamble, sections, eol) {
  const out = [...preamble];
  for (const section of sections) {
    out.push(section.heading, ...section.body);
  }
  return out.join(eol);
}

/** Trim leading and trailing blank lines. */
function trimBlank(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === '') { start++; }
  while (end > start && lines[end - 1].trim() === '') { end--; }
  return lines.slice(start, end);
}

/**
 * Return the body of the section for `version`, without surrounding blank lines.
 * @throws if the section is missing or has no content.
 */
function extractSection(text, version) {
  const { sections } = parseSections(text);
  const section = sections.find(s => s.name === version);
  if (!section) {
    throw new Error(`No "## [${version}]" section found. Add it in the release-prep PR (scripts/release-changelog.js promote).`);
  }
  const body = trimBlank(section.body);
  if (body.length === 0) {
    throw new Error(`The "## [${version}]" section is empty.`);
  }
  return body.join('\n');
}

/**
 * Move the [Unreleased] entries into a new `version` section dated `date`.
 * @returns {string} the updated changelog text, in the input's line ending
 * @throws if [Unreleased] is missing or empty, or `version` already exists.
 */
function promoteUnreleased(text, version, date) {
  const { preamble, sections } = parseSections(text);
  const index = sections.findIndex(s => s.name === UNRELEASED);
  if (index < 0) {
    throw new Error('No "## [Unreleased]" section found.');
  }
  if (sections.some(s => s.name === version)) {
    throw new Error(`A "## [${version}]" section already exists.`);
  }
  const entries = trimBlank(sections[index].body);
  if (entries.length === 0) {
    throw new Error('The "## [Unreleased]" section is empty: add the entries for this release first.');
  }
  const released = { name: version, heading: `## [${version}] - ${date}`, body: ['', ...entries, ''] };
  const unreleased = { name: UNRELEASED, heading: sections[index].heading, body: [''] };
  const next = [...sections.slice(0, index), unreleased, released, ...sections.slice(index + 1)];
  return serializeSections(preamble, next, detectEol(text));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function main(argv) {
  const [command, file, version, ...rest] = argv;
  if (!command || !file || !version) {
    throw new Error('Usage: release-changelog.js <promote|extract> <changelog> <version> [date | --out <file>]');
  }
  const text = fs.readFileSync(file, 'utf8');
  if (command === 'promote') {
    const date = rest[0] || today();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Invalid date "${date}", expected YYYY-MM-DD.`);
    }
    fs.writeFileSync(file, promoteUnreleased(text, version, date));
    console.log(`Promoted [Unreleased] to [${version}] - ${date} in ${file}`);
  } else if (command === 'extract') {
    const notes = extractSection(text, version) + '\n';
    const outIndex = rest.indexOf('--out');
    if (outIndex >= 0 && rest[outIndex + 1]) {
      fs.writeFileSync(rest[outIndex + 1], notes);
    } else {
      process.stdout.write(notes);
    }
  } else {
    throw new Error(`Unknown command "${command}".`);
  }
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}

module.exports = { parseSections, serializeSections, detectEol, extractSection, promoteUnreleased };
