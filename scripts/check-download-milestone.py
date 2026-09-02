#!/usr/bin/env python3
"""
Check whether total downloads/installs across all distribution channels have
crossed a new milestone (a multiple of MILESTONE_STEP), and if so, prepare an
issue body announcing it.

Sources checked (the same ones the README badges report on):
  - VS Code Marketplace installs   (RobBos.ai-engineering-fluency)
  - Open VSX downloads             (RobBos.ai-engineering-fluency)
  - JetBrains Marketplace downloads (plugin id 31580)
  - Visual Studio Marketplace installs (RobBos.AIEngineeringFluency)
  - npm downloads (all-time)       (@rajbos/ai-engineering-fluency)

The last milestone we already announced is read from a small JSON state file
(restored by the workflow from a GitHub Actions cache) so we only fire once
per milestone rather than every week.

Usage:
    python scripts/check-download-milestone.py

Env:
    MILESTONE_STEP     Milestone step size (default: 5000)
    STATE_PATH         Path to the cached state file
                        (default: .cache/download-milestone-state.json)
    ISSUE_BODY_PATH    Where to write the generated issue body markdown
                        (default: /tmp/download-milestone-issue-body.md)
    GITHUB_OUTPUT       If set, outputs are appended here (GitHub Actions).
    GITHUB_STEP_SUMMARY If set, a summary table is appended here.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

MILESTONE_STEP = int(os.environ.get("MILESTONE_STEP", "5000"))
STATE_PATH = Path(os.environ.get("STATE_PATH", ".cache/download-milestone-state.json"))
ISSUE_BODY_PATH = Path(
    os.environ.get("ISSUE_BODY_PATH", "/tmp/download-milestone-issue-body.md")
)

USER_AGENT = "ai-engineering-fluency-download-milestone-tracker"

VSCODE_EXTENSION_ID = "RobBos.ai-engineering-fluency"
VSCODE_MARKETPLACE_URL = (
    "https://marketplace.visualstudio.com/items?itemName=RobBos.ai-engineering-fluency"
)
OPEN_VSX_NAMESPACE = "RobBos"
OPEN_VSX_NAME = "ai-engineering-fluency"
OPEN_VSX_URL = "https://open-vsx.org/extension/RobBos/ai-engineering-fluency"
JETBRAINS_PLUGIN_ID = 31580
JETBRAINS_URL = "https://plugins.jetbrains.com/plugin/31580-ai-engineering-fluency"
VS_EXTENSION_ID = "RobBos.AIEngineeringFluency"
VS_MARKETPLACE_URL = (
    "https://marketplace.visualstudio.com/items?itemName=RobBos.AIEngineeringFluency"
)
NPM_PACKAGE = "@rajbos/ai-engineering-fluency"
NPM_URL = "https://www.npmjs.com/package/@rajbos/ai-engineering-fluency"
# npm's download-stats API has no data before this date.
NPM_STATS_START = "2015-01-10"


@dataclass
class Source:
    name: str
    url: str
    count: int


def http_get_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={"Accept": "application/json", "User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_marketplace_installs(extension_id: str) -> int:
    """Install count from the VS Code / Visual Studio Marketplace gallery API."""
    url = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
    payload = {
        "filters": [{"criteria": [{"filterType": 7, "value": extension_id}]}],
        # IncludeStatistics (256) | IncludeLatestVersionOnly (512)
        "flags": 768,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json;api-version=3.0-preview.1",
            "User-Agent": USER_AGENT,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    extensions = data["results"][0]["extensions"]
    if not extensions:
        raise ValueError(f"Marketplace extension not found: {extension_id}")
    for stat in extensions[0].get("statistics", []):
        if stat["statisticName"] == "install":
            return int(float(stat["value"]))
    return 0


def fetch_open_vsx_downloads(namespace: str, name: str) -> int:
    url = f"https://open-vsx.org/api/{namespace}/{name}"
    data = http_get_json(url)
    return int(data.get("downloadCount", 0))


def fetch_jetbrains_downloads(plugin_id: int) -> int:
    url = f"https://plugins.jetbrains.com/api/plugins/{plugin_id}"
    data = http_get_json(url)
    return int(data.get("downloads", 0))


def fetch_npm_total_downloads(package: str) -> int:
    encoded = urllib.parse.quote(package, safe="")
    end = datetime.now(timezone.utc).date().isoformat()
    url = f"https://api.npmjs.org/downloads/point/{NPM_STATS_START}:{end}/{encoded}"
    data = http_get_json(url)
    return int(data.get("downloads", 0))


def fetch_all_sources() -> list[Source]:
    fetchers = [
        ("VS Code Marketplace", VSCODE_MARKETPLACE_URL, lambda: fetch_marketplace_installs(VSCODE_EXTENSION_ID)),
        ("Open VSX", OPEN_VSX_URL, lambda: fetch_open_vsx_downloads(OPEN_VSX_NAMESPACE, OPEN_VSX_NAME)),
        ("JetBrains Marketplace", JETBRAINS_URL, lambda: fetch_jetbrains_downloads(JETBRAINS_PLUGIN_ID)),
        ("Visual Studio Marketplace", VS_MARKETPLACE_URL, lambda: fetch_marketplace_installs(VS_EXTENSION_ID)),
        ("npm (CLI)", NPM_URL, lambda: fetch_npm_total_downloads(NPM_PACKAGE)),
    ]

    sources: list[Source] = []
    errors: list[str] = []
    for name, url, fetch in fetchers:
        try:
            count = fetch()
        except (urllib.error.URLError, urllib.error.HTTPError, ValueError, KeyError, TypeError) as exc:
            errors.append(f"{name}: {exc}")
            continue
        sources.append(Source(name=name, url=url, count=count))

    if errors:
        raise RuntimeError(
            "Failed to fetch download counts for one or more sources, aborting "
            "rather than computing a total from partial data:\n  "
            + "\n  ".join(errors)
        )
    return sources


def load_state() -> dict:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {"last_milestone": 0}


def save_state(last_milestone: int, total: int) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(
        json.dumps(
            {
                "last_milestone": last_milestone,
                "last_total": total,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def build_issue_body(sources: list[Source], total: int, milestone: int) -> str:
    lines = [
        f"🎉 **AI Engineering Fluency has crossed {milestone:,} total downloads!**",
        "",
        f"As of {date.today().isoformat()}, downloads/installs across all "
        "distribution channels add up to **"
        f"{total:,}**.",
        "",
        "| Environment | Downloads |",
        "| --- | ---: |",
    ]
    for source in sources:
        lines.append(f"| [{source.name}]({source.url}) | {source.count:,} |")
    lines.append(f"| **Total** | **{total:,}** |")
    lines.append("")
    lines.append(
        f"_This issue was created automatically because total downloads passed "
        f"the {milestone:,} mark (tracked in steps of {MILESTONE_STEP:,})._"
    )
    return "\n".join(lines) + "\n"


def write_output(name: str, value: str) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if not output_path:
        return
    with open(output_path, "a", encoding="utf-8") as f:
        f.write(f"{name}={value}\n")


def write_summary(sources: list[Source], total: int, milestone_reached: bool, milestone: int) -> None:
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path:
        return
    lines = ["## Download milestone check", "", "| Environment | Downloads |", "| --- | ---: |"]
    for source in sources:
        lines.append(f"| {source.name} | {source.count:,} |")
    lines.append(f"| **Total** | **{total:,}** |")
    lines.append("")
    if milestone_reached:
        lines.append(f"✅ New milestone reached: **{milestone:,}** — issue will be created.")
    else:
        lines.append(f"ℹ️ No new milestone (next one is {milestone + MILESTONE_STEP:,}).")
    with open(summary_path, "a", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main() -> int:
    sources = fetch_all_sources()
    total = sum(source.count for source in sources)

    state = load_state()
    last_milestone = int(state.get("last_milestone", 0))

    current_milestone = (total // MILESTONE_STEP) * MILESTONE_STEP
    milestone_reached = current_milestone > last_milestone and current_milestone > 0

    write_summary(sources, total, milestone_reached, current_milestone if milestone_reached else last_milestone)
    write_output("total", str(total))
    write_output("milestone_reached", "true" if milestone_reached else "false")

    if milestone_reached:
        write_output("milestone", str(current_milestone))
        write_output("milestone_formatted", f"{current_milestone:,}")
        ISSUE_BODY_PATH.write_text(build_issue_body(sources, total, current_milestone), encoding="utf-8")
        save_state(current_milestone, total)
        print(f"New milestone reached: {current_milestone:,} (total: {total:,})")
    else:
        print(f"No new milestone. Total: {total:,}, last announced: {last_milestone:,}")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)
