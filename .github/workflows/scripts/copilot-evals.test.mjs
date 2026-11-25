import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const fixture = "evals/session-log-data/fixtures";
const sessions = `${fixture}/synthetic-session-logs`;
const usage = `${fixture}/synthetic-usage/usage-agg-daily.json`;
const entries = [
  `${sessions}/.editor-types.json`,
  `${sessions}/default/synthetic-machine/2026-11-24/session-001.json`,
  `${sessions}/default/synthetic-machine/2026-11-24/events-001.jsonl`,
  usage,
];

test("pilot fixtures are available to Git and match the expected synthetic totals", () => {
  const ignored = spawnSync("git", ["check-ignore", "--no-index", ...entries], {
    cwd: root,
    encoding: "utf8",
  });
  assert.ifError(ignored.error);
  assert.equal(ignored.status, 1, `Fixtures must not be ignored: ${ignored.stdout}${ignored.stderr}`);

  const manifest = JSON.parse(readFileSync(new URL(`../../../${entries[0]}`, import.meta.url), "utf8"));
  assert.deepEqual(Object.values(manifest).sort(), ["Copilot CLI", "VS Code"]);
  const session = JSON.parse(readFileSync(new URL(`../../../${entries[1]}`, import.meta.url), "utf8"));
  const events = readFileSync(new URL(`../../../${entries[2]}`, import.meta.url), "utf8")
    .trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(session.requests.length, 1);
  assert.equal(events.filter((event) => event.type === "user.message").length, 1);
  const rows = JSON.parse(readFileSync(new URL(`../../../${usage}`, import.meta.url), "utf8"));
  assert.deepEqual(
    rows.reduce(
      (total, row) => ({
        input: total.input + row.inputTokens,
        output: total.output + row.outputTokens,
        interactions: total.interactions + row.interactions,
      }),
      { input: 0, output: 0, interactions: 0 },
    ),
    { input: 70, output: 30, interactions: 3 },
  );
  const spec = readFileSync(new URL("../../../evals/session-log-data/session-log-data.eval.yaml", import.meta.url), "utf8");
  assert.match(spec, /src: fixtures\/synthetic-session-logs/);
  assert.match(spec, /src: fixtures\/synthetic-usage\/usage-agg-daily\.json/);
});
