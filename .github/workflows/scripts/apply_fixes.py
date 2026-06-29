#!/usr/bin/env python3
"""Attempt to auto-address review findings with conservative, verifiable edits.

Given the combined findings report and the changeset diff, ask the local Ollama
model to propose targeted edits in a strict SEARCH/REPLACE format, then apply
only the edits whose SEARCH text matches a tracked file exactly once. Anything
ambiguous is skipped rather than risk corrupting a file.

If zero edits apply cleanly the script exits 0 having changed nothing, which is
the intended "nothing safe to do" outcome — the caller then skips PR creation.

Environment variables:
  COMBINED_FILE   Combined findings markdown (required).
  DIFF_FILE       The changeset diff that was reviewed (required).
  MODEL           Ollama model tag (default: qwen2.5-coder:3b).
  OLLAMA_URL      Ollama base URL (default: http://localhost:11434).
  ALLOWED_ROOTS   Comma-separated path prefixes edits may touch
                  (default: vscode-extension/,cli/).
  GITHUB_OUTPUT   Set by Actions; receives applied_count and changed_files.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request

MAX_EDITS = 15
MAX_DIFF_CHARS = 32_000
NUM_PREDICT = 2_000
REQUEST_TIMEOUT = 900

EDIT_RE = re.compile(
    r"<<<<EDIT>>>>\s*\n"
    r"FILE:\s*(?P<file>.+?)\n"
    r"<<<<SEARCH>>>>\s*\n(?P<search>.*?)\n?"
    r"<<<<REPLACE>>>>\s*\n(?P<replace>.*?)\n?"
    r"<<<<END>>>>",
    re.DOTALL,
)

INSTRUCTIONS = """\
You are a careful software engineer. You are given review findings and the diff \
they refer to. Propose the SMALLEST set of concrete code edits that address the \
clear, high-confidence findings only. Skip anything subjective, risky, or that \
you cannot express as an exact text replacement.

Output ONLY a sequence of edit blocks in this EXACT format, nothing else:

<<<<EDIT>>>>
FILE: <repository-relative path>
<<<<SEARCH>>>>
<exact text that currently exists in the file, copied verbatim>
<<<<REPLACE>>>>
<the replacement text>
<<<<END>>>>

Rules:
- The SEARCH text must be copied verbatim from the current file and be unique.
- Keep each edit minimal — a few lines at most.
- Do not invent files. Only edit files mentioned in the findings/diff.
- If nothing can be safely fixed, output the single line: NO_EDITS
"""


def read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        return fh.read()


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
    return (data.get("message") or {}).get("content", "")


def is_path_allowed(path: str, allowed_roots: list) -> bool:
    norm = os.path.normpath(path).replace("\\", "/")
    if norm.startswith("/") or ".." in norm.split("/"):
        return False
    return any(norm.startswith(root) for root in allowed_roots)


def apply_edit(file_path: str, search: str, replace: str) -> str:
    """Return 'applied', 'not-found', 'ambiguous', or 'missing'."""
    if not os.path.isfile(file_path):
        return "missing"
    content = read_text(file_path)
    count = content.count(search)
    if count == 0:
        return "not-found"
    if count > 1:
        return "ambiguous"
    new_content = content.replace(search, replace, 1)
    if new_content == content:
        return "not-found"
    with open(file_path, "w", encoding="utf-8", newline="") as fh:
        fh.write(new_content)
    return "applied"


def write_output(key: str, value: str) -> None:
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"{key}={value}\n")


def main() -> int:
    combined = read_text(os.environ["COMBINED_FILE"])
    diff = read_text(os.environ["DIFF_FILE"])
    model = os.environ.get("MODEL", "qwen2.5-coder:3b")
    base_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
    allowed_roots = [
        r.strip().replace("\\", "/")
        for r in os.environ.get("ALLOWED_ROOTS", "vscode-extension/,cli/").split(",")
        if r.strip()
    ]

    if len(diff) > MAX_DIFF_CHARS:
        diff = diff[:MAX_DIFF_CHARS]

    user = (
        "## Review findings\n\n" + combined.strip()
        + "\n\n## Changeset under review\n\n```diff\n" + diff + "\n```\n"
    )

    try:
        response = call_ollama(base_url, model, INSTRUCTIONS, user)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"::warning::Fix model call failed: {exc}", file=sys.stderr)
        write_output("applied_count", "0")
        write_output("changed_files", "")
        return 0

    edits = list(EDIT_RE.finditer(response))
    print(f"Model proposed {len(edits)} edit block(s).", file=sys.stderr)

    applied = 0
    changed = []
    for match in edits[:MAX_EDITS]:
        file_path = match.group("file").strip()
        search = match.group("search")
        replace = match.group("replace")

        if not is_path_allowed(file_path, allowed_roots):
            print(f"  skip (path not allowed): {file_path}", file=sys.stderr)
            continue
        if not search.strip():
            print(f"  skip (empty search): {file_path}", file=sys.stderr)
            continue

        result = apply_edit(file_path, search, replace)
        print(f"  {result}: {file_path}", file=sys.stderr)
        if result == "applied":
            applied += 1
            if file_path not in changed:
                changed.append(file_path)

    # Guard: any changed .json must still parse, else revert that file.
    for file_path in list(changed):
        if file_path.endswith(".json"):
            try:
                json.loads(read_text(file_path))
            except json.JSONDecodeError:
                print(f"::warning::Reverting {file_path} — edit broke JSON", file=sys.stderr)
                os.system(f'git checkout -- "{file_path}"')
                changed.remove(file_path)
                applied -= 1

    write_output("applied_count", str(max(applied, 0)))
    write_output("changed_files", " ".join(changed))
    print(f"Applied {applied} edit(s) across {len(changed)} file(s).", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
