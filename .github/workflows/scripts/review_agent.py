#!/usr/bin/env python3
"""Run a single review agent against a changeset using a local Ollama model.

This is the worker behind each per-agent job in `agent-review.yml`. It reads an
agent definition (`.github/agents/*.agent.md`), strips its YAML frontmatter to
use the body as the system prompt, feeds it the PR diff, and writes the model's
markdown review to OUTPUT_FILE. It never edits source files.

No Copilot/Claude tokens are used — the model runs locally on the runner via
Ollama, mirroring `.github/workflows/check-toolnames.yml`.

Environment variables:
  AGENT_FILE   Path to the agent definition markdown (required).
  OUTPUT_FILE  Path to write the findings markdown (required).
  DIFF_FILE    Path to the unified diff to review (required).
  MODEL        Ollama model tag (default: qwen2.5-coder:3b).
  OLLAMA_URL   Base URL of the Ollama server (default: http://localhost:11434).
  AGENT_LABEL  Human label used in the fallback header (default: derived).
"""

import json
import os
import sys
import urllib.error
import urllib.request

MAX_DIFF_CHARS = 48_000      # keep the prompt within the local model's context
NUM_PREDICT = 1_400          # cap generation so CPU inference stays bounded
REQUEST_TIMEOUT = 600        # seconds


def read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        return fh.read()


def strip_frontmatter(md: str) -> str:
    """Remove a leading `--- ... ---` YAML frontmatter block if present."""
    lines = md.splitlines()
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                return "\n".join(lines[i + 1 :]).lstrip("\n")
    return md


def call_ollama(base_url: str, model: str, system: str, user: str) -> str:
    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "options": {"temperature": 0, "seed": 42, "num_predict": NUM_PREDICT},
    }
    req = urllib.request.Request(
        f"{base_url.rstrip('/')}/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        data = json.loads(resp.read())
    return (data.get("message") or {}).get("content", "").strip()


def main() -> int:
    agent_file = os.environ["AGENT_FILE"]
    output_file = os.environ["OUTPUT_FILE"]
    diff_file = os.environ["DIFF_FILE"]
    model = os.environ.get("MODEL", "qwen2.5-coder:3b")
    base_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    label = os.environ.get("AGENT_LABEL") or os.path.basename(agent_file)

    system_prompt = strip_frontmatter(read_text(agent_file))
    diff = read_text(diff_file)

    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)

    # Nothing changed — emit a clean PASS without bothering the model.
    if not diff.strip():
        with open(output_file, "w", encoding="utf-8") as fh:
            fh.write(
                f"# {label}\n\n**Verdict:** PASS\n\n"
                "No reviewable changes were found in this changeset.\n\n"
                "## Findings\n\n_No findings in this changeset._\n"
            )
        print("No diff to review; wrote PASS.", file=sys.stderr)
        return 0

    truncated = len(diff) > MAX_DIFF_CHARS
    if truncated:
        diff = diff[:MAX_DIFF_CHARS]

    user_prompt = (
        "Review the following changeset (unified diff). Apply ONLY your own "
        "area of expertise as described in your instructions, and respond with "
        "the markdown review exactly in the output-contract format. Do not edit "
        "files, do not output anything except the markdown review.\n"
    )
    if truncated:
        user_prompt += (
            "\n(Note: the diff was truncated for length; review what is shown.)\n"
        )
    user_prompt += f"\n```diff\n{diff}\n```\n"

    try:
        review = call_ollama(base_url, model, system_prompt, user_prompt)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"::warning::Model call failed for {label}: {exc}", file=sys.stderr)
        review = ""

    # Guarantee a parseable artifact even if the model misbehaved, so the
    # synthesis job never crashes on a missing verdict.
    if "Verdict:" not in review:
        header = f"# {label}\n\n**Verdict:** CHANGES_SUGGESTED\n\n"
        if not review.strip():
            review = (
                header
                + "The local model returned no usable output for this agent. "
                "Treating as inconclusive — please review manually.\n\n"
                "## Findings\n\n_Model produced no findings._\n"
            )
        else:
            review = header + review

    with open(output_file, "w", encoding="utf-8") as fh:
        fh.write(review.rstrip() + "\n")

    print(f"Wrote review for {label} to {output_file}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
