#!/usr/bin/env python3
"""Aggregate the per-agent review artifacts and decide the workflow outcome.

Reads every `*.md` findings file produced by the agent jobs, parses each one's
verdict and severity counts, writes a combined report to the job summary and to
a file for a potential pull-request body, and exposes outputs the workflow uses
to decide whether to attempt auto-fixes.

This step is deterministic — it does not call any model. It always exits 0 so
the workflow can be used as a non-blocking PR check.

Environment variables:
  FINDINGS_DIR   Directory containing the downloaded findings artifacts (required).
  COMBINED_FILE  Path to write the combined markdown report (required).
  GITHUB_OUTPUT  Set by Actions; receives has_actionable / counts.
  GITHUB_STEP_SUMMARY  Set by Actions; receives the rendered report.
"""

import glob
import os
import re
import sys

VERDICT_RE = re.compile(r"\*\*Verdict:\*\*\s*(PASS|CHANGES_SUGGESTED)", re.IGNORECASE)
HIGH = "\U0001f534"    # 🔴
MEDIUM = "\U0001f7e1"  # 🟡
LOW = "\U0001f7e2"     # 🟢


def parse_report(text: str) -> dict:
    verdict_match = VERDICT_RE.search(text)
    verdict = verdict_match.group(1).upper() if verdict_match else "UNKNOWN"

    # Walk the report and count bullet findings under each severity heading. The
    # agents put the severity emoji on the `### 🔴 High` heading and list findings
    # as `- ...` bullets beneath it, so we attribute each bullet to the section
    # it falls under. A heading-carried emoji on the bullet itself is also counted.
    counts = {HIGH: 0, MEDIUM: 0, LOW: 0}
    current = None
    for raw in text.splitlines():
        line = raw.strip()
        if line.startswith("#"):
            current = None
            for emoji in (HIGH, MEDIUM, LOW):
                if emoji in line:
                    current = emoji
                    break
            continue
        if line.startswith("-") and line not in ("-", "--", "---"):
            section = next((e for e in (HIGH, MEDIUM, LOW) if e in line), current)
            if section is not None:
                counts[section] += 1

    return {
        "verdict": verdict,
        "high": counts[HIGH],
        "medium": counts[MEDIUM],
        "low": counts[LOW],
    }


def title_from(path: str, text: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return os.path.splitext(os.path.basename(path))[0]


def write_output(key: str, value: str) -> None:
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"{key}={value}\n")


def main() -> int:
    findings_dir = os.environ["FINDINGS_DIR"]
    combined_file = os.environ["COMBINED_FILE"]

    paths = sorted(glob.glob(os.path.join(findings_dir, "**", "*.md"), recursive=True))
    if not paths:
        print("::warning::No findings artifacts were found.", file=sys.stderr)

    reports = []
    totals = {"high": 0, "medium": 0, "low": 0}
    for path in paths:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            text = fh.read()
        parsed = parse_report(text)
        parsed["title"] = title_from(path, text)
        parsed["body"] = text.strip()
        reports.append(parsed)
        for key in totals:
            totals[key] += parsed[key]

    actionable = totals["high"] > 0 or totals["medium"] > 0

    # Build the combined report.
    lines = ["# 🤖 Multi-Agent Review", ""]
    lines.append(
        f"**Totals:** {HIGH} {totals['high']} high · "
        f"{MEDIUM} {totals['medium']} medium · {LOW} {totals['low']} low"
    )
    lines.append("")
    lines.append("| Agent | Verdict | 🔴 | 🟡 | 🟢 |")
    lines.append("| --- | --- | --- | --- | --- |")
    for r in reports:
        lines.append(
            f"| {r['title']} | {r['verdict']} | {r['high']} | {r['medium']} | {r['low']} |"
        )
    lines.append("")
    for r in reports:
        lines.append("---")
        lines.append("")
        lines.append(r["body"])
        lines.append("")

    combined = "\n".join(lines).rstrip() + "\n"

    os.makedirs(os.path.dirname(combined_file) or ".", exist_ok=True)
    with open(combined_file, "w", encoding="utf-8") as fh:
        fh.write(combined)

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as fh:
            fh.write(combined)

    write_output("has_actionable", "true" if actionable else "false")
    write_output("high_count", str(totals["high"]))
    write_output("medium_count", str(totals["medium"]))
    write_output("low_count", str(totals["low"]))

    print(
        f"Parsed {len(reports)} report(s): "
        f"{totals['high']} high, {totals['medium']} medium, {totals['low']} low. "
        f"Actionable={actionable}.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
