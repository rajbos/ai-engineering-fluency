#!/usr/bin/env python3
"""Check that Copilot ↔ Claude agent/skill mirrors documented in
`.github/copilot-instructions.md` stay in sync.

Hard-fail checks (these break the mirroring contract mechanically and are
always fixable or always wrong):
  1. Agent NAME-SET parity: every `.github/agents/<name>.agent.md` must have a
     `.claude/agents/<name>.md` counterpart and vice versa.
  2. Skill DIRECTORY-SET parity and SKILL.md byte parity: every skill present
     under `.github/skills/` or `.claude/skills/` must exist on both sides,
     and the two `SKILL.md` files must be byte-identical.

Soft checks (reported as warnings only, never fail the job): agent body
drift. Intentional platform adaptation (CI-vs-local mechanics, cross-vendor
model names vs. Claude's own, `task` tool vs. `Agent` tool) is allowed per
`.github/copilot-instructions.md`, so a body diff alone is not a violation —
a human has to judge it. We just surface the line counts.

Modes:
  --check (default)  Report only. Exit 0 if no hard violations, 1 otherwise.
  --fix              Additionally apply the mechanical fixes this script can
                      make safely: copy a missing SKILL.md across (whichever
                      side has it), and make `.github`'s SKILL.md content win
                      on a content mismatch (source of truth per the doc).
                      Missing *agent* mirrors are never auto-fixed — frontmatter
                      conversion needs judgement — they are only reported.

Environment variables:
  REPO_ROOT      Repository root (default: current directory).
  GITHUB_OUTPUT  Set by Actions; receives structured outputs (see below).
  GITHUB_STEP_SUMMARY  Set by Actions; receives the human-readable report.

Outputs written to GITHUB_OUTPUT:
  hard_fail            "true"/"false"
  missing_agent_count  int — agent mirrors missing on either side (needs a human)
  skill_fix_count      int — skill mismatches this script can fix mechanically
  fixed_skills         space-separated list of skill names touched by --fix
"""

import argparse
import difflib
import filecmp
import os
import sys

# Windows consoles default to a legacy code page that cannot encode the
# emoji used in the report; CI (UTF-8) is unaffected.
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

FRONTMATTER_DELIM = "---"


def write_output(key: str, value: str) -> None:
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"{key}={value}\n")


def strip_frontmatter(text: str) -> str:
    """Return the body of a `*.agent.md` / `*.md` file with YAML frontmatter removed."""
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != FRONTMATTER_DELIM:
        return text
    for i in range(1, len(lines)):
        if lines[i].strip() == FRONTMATTER_DELIM:
            return "".join(lines[i + 1 :])
    return text


def agent_names(root: str, subdir: str, suffix: str) -> dict:
    """Map agent name -> full path for files under `root/subdir` ending in `suffix`."""
    directory = os.path.join(root, subdir)
    names = {}
    if not os.path.isdir(directory):
        return names
    for entry in sorted(os.listdir(directory)):
        if entry.endswith(suffix):
            name = entry[: -len(suffix)]
            names[name] = os.path.join(directory, entry)
    return names


def skill_dirs(root: str, subdir: str) -> dict:
    """Map skill name -> path to its SKILL.md under `root/subdir/<name>/SKILL.md`."""
    directory = os.path.join(root, subdir)
    skills = {}
    if not os.path.isdir(directory):
        return skills
    for entry in sorted(os.listdir(directory)):
        skill_path = os.path.join(directory, entry)
        skill_md = os.path.join(skill_path, "SKILL.md")
        if os.path.isdir(skill_path) and os.path.isfile(skill_md):
            skills[entry] = skill_md
    return skills


def check_agents(root: str):
    github_agents = agent_names(root, ".github/agents", ".agent.md")
    claude_agents = agent_names(root, ".claude/agents", ".md")

    missing_in_claude = sorted(set(github_agents) - set(claude_agents))
    missing_in_github = sorted(set(claude_agents) - set(github_agents))

    drift = []
    for name in sorted(set(github_agents) & set(claude_agents)):
        with open(github_agents[name], "r", encoding="utf-8") as fh:
            gh_body = strip_frontmatter(fh.read())
        with open(claude_agents[name], "r", encoding="utf-8") as fh:
            cl_body = strip_frontmatter(fh.read())
        if gh_body == cl_body:
            continue
        diff_lines = list(
            difflib.unified_diff(
                gh_body.splitlines(),
                cl_body.splitlines(),
                lineterm="",
            )
        )
        added = sum(1 for l in diff_lines if l.startswith("+") and not l.startswith("+++"))
        removed = sum(1 for l in diff_lines if l.startswith("-") and not l.startswith("---"))
        if added == 0 and removed == 0:
            # The only difference was trailing whitespace/newline that splitlines()
            # already normalizes away — not meaningful body drift.
            continue
        drift.append({"name": name, "added": added, "removed": removed})

    return {
        "missing_in_claude": missing_in_claude,
        "missing_in_github": missing_in_github,
        "drift": drift,
    }


def check_skills(root: str):
    github_skills = skill_dirs(root, ".github/skills")
    claude_skills = skill_dirs(root, ".claude/skills")

    missing_in_claude = sorted(set(github_skills) - set(claude_skills))
    missing_in_github = sorted(set(claude_skills) - set(github_skills))

    mismatched = []
    for name in sorted(set(github_skills) & set(claude_skills)):
        if not filecmp.cmp(github_skills[name], claude_skills[name], shallow=False):
            mismatched.append(name)

    return {
        "missing_in_claude": missing_in_claude,
        "missing_in_github": missing_in_github,
        "mismatched": mismatched,
        "github_paths": github_skills,
        "claude_paths": claude_skills,
    }


def render_summary(agents: dict, skills: dict) -> str:
    lines = ["# Agent / Skill Mirror Check", ""]

    hard_fail = bool(
        agents["missing_in_claude"]
        or agents["missing_in_github"]
        or skills["missing_in_claude"]
        or skills["missing_in_github"]
        or skills["mismatched"]
    )

    lines.append("**Result:** " + ("❌ FAIL" if hard_fail else "✅ PASS"))
    lines.append("")

    lines.append("## Agent name-set parity")
    if not agents["missing_in_claude"] and not agents["missing_in_github"]:
        lines.append("✅ Every `.github/agents/*.agent.md` has a `.claude/agents/*.md` mirror and vice versa.")
    else:
        if agents["missing_in_claude"]:
            lines.append("❌ Missing `.claude/agents/<name>.md` for: " + ", ".join(f"`{n}`" for n in agents["missing_in_claude"]))
            lines.append("   _Needs a human to write Claude-style frontmatter — not auto-fixable._")
        if agents["missing_in_github"]:
            lines.append("❌ Missing `.github/agents/<name>.agent.md` for: " + ", ".join(f"`{n}`" for n in agents["missing_in_github"]))
            lines.append("   _Needs a human to write Copilot-style frontmatter — not auto-fixable._")
    lines.append("")

    lines.append("## SKILL.md parity")
    if not skills["missing_in_claude"] and not skills["missing_in_github"] and not skills["mismatched"]:
        lines.append("✅ Every skill exists on both sides and every `SKILL.md` pair is byte-identical.")
    else:
        if skills["missing_in_claude"]:
            lines.append("❌ Missing `.claude/skills/<name>/SKILL.md` for: " + ", ".join(f"`{n}`" for n in skills["missing_in_claude"]))
        if skills["missing_in_github"]:
            lines.append("❌ Missing `.github/skills/<name>/SKILL.md` for: " + ", ".join(f"`{n}`" for n in skills["missing_in_github"]))
        if skills["mismatched"]:
            lines.append("❌ Content mismatch (`.github` side is source of truth) for: " + ", ".join(f"`{n}`" for n in skills["mismatched"]))
    lines.append("")

    lines.append("## Agent body drift (warnings only — intentional platform adaptation is allowed)")
    if not agents["drift"]:
        lines.append("_No body drift detected between mirrored agents._")
    else:
        lines.append("| Agent | Lines added | Lines removed |")
        lines.append("| --- | --- | --- |")
        for d in agents["drift"]:
            lines.append(f"| `{d['name']}` | {d['added']} | {d['removed']} |")
        lines.append("")
        lines.append(
            "⚠️ Diffs above are not failures. Per `.github/copilot-instructions.md`, agent "
            "bodies should match but may intentionally diverge where platform mechanics "
            "differ (tool invocation, model names, CI-vs-local execution). Review each diff "
            "and only resync it if the drift looks accidental."
        )
    lines.append("")

    return "\n".join(lines)


def apply_skill_fixes(skills: dict, root: str) -> list:
    """Copy `.github`'s SKILL.md over `.claude`'s to fix content mismatches, and copy
    a missing SKILL.md across (whichever side has it) to fix missing mirrors.
    Returns the list of skill names touched.
    """
    fixed = []

    for name in skills["mismatched"]:
        src = skills["github_paths"][name]
        dst = skills["claude_paths"][name]
        with open(src, "r", encoding="utf-8") as fh:
            content = fh.read()
        with open(dst, "w", encoding="utf-8") as fh:
            fh.write(content)
        fixed.append(name)
        print(f"Fixed content mismatch: copied {src} -> {dst}", file=sys.stderr)

    for name in skills["missing_in_claude"]:
        src = skills["github_paths"][name]
        dst_dir = os.path.join(root, ".claude", "skills", name)
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, "SKILL.md")
        with open(src, "r", encoding="utf-8") as fh:
            content = fh.read()
        with open(dst, "w", encoding="utf-8") as fh:
            fh.write(content)
        fixed.append(name)
        print(f"Created missing mirror: copied {src} -> {dst}", file=sys.stderr)

    # A skill missing on the .github side cannot be mechanically fixed here —
    # .github is the source of truth per the doc, so a Claude-only skill has
    # nothing authoritative to copy from. Leave it to a human.

    return fixed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fix", action="store_true", help="Apply mechanical SKILL.md fixes")
    args = parser.parse_args()

    root = os.environ.get("REPO_ROOT", ".")

    agents = check_agents(root)
    skills = check_skills(root)

    fixed_skills = []
    if args.fix:
        fixed_skills = apply_skill_fixes(skills, root)
        if fixed_skills:
            # Re-check skills after the fix so the summary reflects reality.
            skills = check_skills(root)

    summary = render_summary(agents, skills)
    print(summary)

    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "a", encoding="utf-8") as fh:
            fh.write(summary + "\n")

    hard_fail = bool(
        agents["missing_in_claude"]
        or agents["missing_in_github"]
        or skills["missing_in_claude"]
        or skills["missing_in_github"]
        or skills["mismatched"]
    )

    missing_agent_count = len(agents["missing_in_claude"]) + len(agents["missing_in_github"])
    skill_fix_count = len(fixed_skills)

    write_output("hard_fail", "true" if hard_fail else "false")
    write_output("missing_agent_count", str(missing_agent_count))
    write_output("skill_fix_count", str(skill_fix_count))
    write_output("fixed_skills", " ".join(fixed_skills))

    return 1 if hard_fail else 0


if __name__ == "__main__":
    sys.exit(main())
