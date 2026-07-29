#!/usr/bin/env python3
"""Shared helpers for detecting duplicate-like entries in src/toolNames.json.

Tool IDs can arrive in many equivalent forms (different MCP server registrations,
dash vs underscore vs dot separators, truncated server names). This module
normalizes those forms so callers can flag duplicates before they are injected.
"""

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

# Longest prefix first so the most specific rule wins.
_CANONICAL_PREFIX_RULES: list[tuple[str, str]] = [
    # GitHub MCP server registrations (local stdio, remote, GitHub-official server)
    ("mcp.io.github.git.", "github_"),
    ("mcp_io_github_git_", "github_"),
    ("mcp.github.github.", "github_"),
    ("mcp_github_github_", "github_"),
    ("github-mcp-server-", "github_"),
    ("mcp_github_mcp_s2_", "github_"),
    ("mcp_github_mcp_se_", "github_"),
    # Context7 / UPS docs
    ("mcp__plugin_context7_context7__", "context7_"),
    ("mcp__context7__", "context7_"),
    ("mcp_context7_", "context7_"),
    ("mcp_io_github_ups_", "context7_"),
    ("context7-", "context7_"),
    # Playwright MCP
    ("mcp__microsoft_playwright-mcp__", "playwright_"),
    ("microsoft_playwright-mcp-", "playwright_"),
    ("mcp__playwright__", "playwright_"),
    ("mcp_playwright_", "playwright_"),
    ("mcp_microsoft_pla_", "playwright_"),
    # Tavily MCP
    ("io_github_tavily-ai_tavily-mcp-", "tavily_"),
    ("mcp_tavily-mcp_", "tavily_"),
    ("mcp_tavily_", "tavily_"),
    # Claude Browser MCP
    ("mcp__claude-in-chrome__", "claude_browser_"),
    ("mcp__claude_browser__", "claude_browser_"),
    ("mcp__Claude_Browser__", "claude_browser_"),
]


def _normalize_separators(value: str) -> str:
    """Replace separators that tooling uses interchangeably with underscores."""
    return value.replace(".", "_").replace("-", "_")


def _compile_prefix_pattern(prefix: str) -> re.Pattern[str]:
    """Build a regex that also matches numeric-suffixed collision variants.

    Some hosts append a digit to a server's registered name when there is a
    naming collision (e.g. two "context7" MCP servers become "context7" and
    "context73"). Allow optional trailing digits right before the prefix's
    final separator so those collision variants still canonicalize to the
    same key as the un-suffixed prefix.
    """
    base, sep = prefix[:-1], prefix[-1]
    return re.compile(f"^{re.escape(base)}\\d*{re.escape(sep)}")


_CANONICAL_PREFIX_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (_compile_prefix_pattern(prefix), replacement)
    for prefix, replacement in _CANONICAL_PREFIX_RULES
]


def canonicalize_tool_id(tool_id: str) -> str:
    """Return a canonical form of a tool ID for duplicate comparison.

    The result is not meant to be displayed; it is a stable key used to decide
    whether two tool IDs are likely the same tool under different registrations.
    """
    lowered = tool_id.lower()
    for pattern, replacement in _CANONICAL_PREFIX_PATTERNS:
        match = pattern.match(lowered)
        if match:
            action = tool_id[match.end():]
            return replacement + _normalize_separators(action)
    return _normalize_separators(tool_id)


def _normalize_friendly_name(name: str) -> str:
    """Normalize a friendly name so trivial spacing/casing differences match."""
    return re.sub(r"\s+", " ", name.strip().lower())


# Known MCP tool families: keyed by a display prefix, matched by (a) a keyword
# appearing anywhere in the (normalized) tool id and (b) the id ending in one
# of the family's known action names. This mirrors src/utils/toolUtils.ts's
# resolveMcpFamilyToolName — keep the two in sync when either changes.
#
# Every MCP client/host mints its own server-id segment for the same upstream
# server (VS Code truncates a configured server name, Claude Code uses the
# literal package/plugin id, local vs. remote registrations differ, etc.), so
# the id's *prefix* is effectively unbounded while the upstream server's own
# tool/action names are a small, stable set (see issue #1760). Matching on
# family keyword + action suffix recognizes new prefix spellings without a
# per-prefix rule in _CANONICAL_PREFIX_RULES above.
_MCP_TOOL_FAMILIES: list[tuple[str, list[str], set[str]]] = [
    (
        "GitHub MCP",
        ["github"],
        {
            "actions_list", "add_comment_to_pending_review", "add_issue_comment",
            "add_reply_to_pull_request_comment", "assign_copilot_to_issue",
            "create_or_update_file", "create_pull_request", "create_repository",
            "get_commit", "get_file_contents", "get_job_logs", "get_label", "get_latest_release",
            "get_me", "get_release_by_tag", "get_repository_tree", "get_tag",
            "issue_read", "issue_write", "label_write", "list_branches",
            "list_code_scanning_alerts", "list_commits", "list_issue_fields",
            "list_issue_types", "list_issues", "list_label", "list_pull_requests",
            "list_tags", "projects_list", "pull_request_read",
            "pull_request_review_write", "request_copilot_review", "search_code",
            "search_issues", "search_pull_requests", "search_repositories",
            "search_users", "semantic_issue_similarity_search",
            "semantic_issues_search", "sub_issue_write", "update_pull_request",
        },
    ),
    (
        "Playwright MCP",
        ["playwright"],
        {
            "browser_click", "browser_close", "browser_console_messages",
            "browser_evaluate", "browser_fill_form", "browser_find", "browser_hover",
            "browser_install", "browser_navigate", "browser_network_request",
            "browser_network_requests", "browser_press_key", "browser_resize",
            "browser_run_code", "browser_run_code_unsafe", "browser_snapshot",
            "browser_tabs", "browser_take_screenshot", "browser_type", "browser_wait_for",
        },
    ),
    (
        "Context7 MCP",
        ["context7"],
        {"get_library_docs", "query_docs", "resolve_library_id"},
    ),
    (
        "Tavily MCP",
        ["tavily"],
        {"tavily_crawl", "tavily_extract", "tavily_research", "tavily_search", "crawl", "extract", "research", "search"},
    ),
    (
        "Microsoft Docs MCP",
        ["microsoft_doc", "microsoftdocs", "microsoft_learn"],
        {"docs_fetch", "docs_search", "code_sample_search"},
    ),
    (
        "Claude Browser MCP",
        ["claude_browser", "claude_in_chrome"],
        {
            "computer", "find", "get_page_text", "javascript_tool", "navigate",
            "preview_list", "preview_logs", "preview_start", "preview_stop",
            "read_console_messages", "read_network_requests", "read_page",
            "resize_window", "tabs_close", "tabs_context", "tabs_create", "tabs_select",
        },
    ),
]


def resolve_mcp_family_tool_name(tool_id: str) -> str | None:
    """Resolve a tool id via known MCP family keyword + action suffix, or None."""
    normalized = _normalize_separators(tool_id.lower())
    for display_name, keywords, actions in _MCP_TOOL_FAMILIES:
        if not any(keyword in normalized for keyword in keywords):
            continue
        for action in actions:
            if normalized == action or normalized.endswith(f"_{action}"):
                return f"{display_name}: {action.replace('_', ' ').title()}"
    return None


def find_matches_for_new_tool(
    tool_id: str, existing: dict[str, str]
) -> dict[str, list[tuple[str, str]]]:
    """Check whether a new tool ID is already represented in the mapping.

    Returns a dict with keys:
      - exact: same key exists
      - case_variant: same key with different casing
      - canonical_equivalent: different key that normalizes to the same canonical form
      - family_equivalent: not in the map at all, but resolves via a known MCP
        family + action pair (e.g. a new server-registration spelling of a
        GitHub/Playwright/Context7/Tavily/Claude Browser tool we already recognize)
    """
    result: dict[str, list[tuple[str, str]]] = {
        "exact": [],
        "case_variant": [],
        "canonical_equivalent": [],
        "family_equivalent": [],
    }

    if tool_id in existing:
        result["exact"].append((tool_id, existing[tool_id]))
        return result

    lower_tool_id = tool_id.lower()
    for existing_id, friendly in existing.items():
        if existing_id.lower() == lower_tool_id:
            result["case_variant"].append((existing_id, friendly))

    canonical = canonicalize_tool_id(tool_id)
    for existing_id, friendly in existing.items():
        if existing_id.lower() == lower_tool_id:
            continue
        if canonicalize_tool_id(existing_id) == canonical:
            result["canonical_equivalent"].append((existing_id, friendly))

    if not result["case_variant"] and not result["canonical_equivalent"]:
        family_name = resolve_mcp_family_tool_name(tool_id)
        if family_name:
            result["family_equivalent"].append((tool_id, family_name))

    return result


def find_friendly_duplicates(
    friendly_name: str, existing: dict[str, str]
) -> list[tuple[str, str]]:
    """Return existing entries whose friendly name matches the proposed one."""
    normalized = _normalize_friendly_name(friendly_name)
    return [
        (existing_id, friendly)
        for existing_id, friendly in existing.items()
        if _normalize_friendly_name(friendly) == normalized
    ]


def find_duplicate_groups(
    tool_names: dict[str, str]
) -> tuple[dict[str, list[tuple[str, str]]], dict[str, list[tuple[str, str]]]]:
    """Find groups of entries that look like duplicates.

    Returns two dicts:
    - strict_duplicates: entries with the same normalized friendly name.
      These are unambiguous duplicates.
    - canonical_equivalents: entries that normalize to the same canonical key
      but have different friendly names. These are likely the same tool from
      different MCP server registrations, but may be intentional (e.g. local
      vs remote server labels).
    """
    by_canonical: dict[str, list[tuple[str, str]]] = defaultdict(list)
    by_friendly: dict[str, list[tuple[str, str]]] = defaultdict(list)

    for tool_id, friendly in tool_names.items():
        entry = (tool_id, friendly)
        by_canonical[canonicalize_tool_id(tool_id)].append(entry)
        by_friendly[_normalize_friendly_name(friendly)].append(entry)

    strict_duplicates = {
        f"strict-{i + 1}": sorted(group)
        for i, group in enumerate(by_friendly.values())
        if len(group) > 1
    }

    # Canonical equivalents: same canonical key, different friendly name, and
    # not already covered by a strict duplicate group.
    strict_entries = {
        entry
        for group in strict_duplicates.values()
        for entry in group
    }
    canonical_equivalents: dict[str, list[tuple[str, str]]] = {}
    for i, group in enumerate(by_canonical.values()):
        if len(group) < 2:
            continue
        filtered = sorted(entry for entry in group if entry not in strict_entries)
        if len(filtered) > 1:
            canonical_equivalents[f"canonical-{i + 1}"] = filtered

    return strict_duplicates, canonical_equivalents


def load_tool_names(path: Path | str) -> dict[str, str]:
    with open(path, "r", encoding="utf-8") as f:
        data: dict[str, Any] = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"toolNames.json must be a JSON object, got {type(data).__name__}")
    return {str(k): str(v) for k, v in data.items()}


def _group_key(group: list[tuple[str, str]]) -> frozenset[tuple[str, str]]:
    return frozenset(group)


def find_new_duplicate_groups(
    head_tool_names: dict[str, str],
    base_tool_names: dict[str, str]
) -> tuple[dict[str, list[tuple[str, str]]], dict[str, list[tuple[str, str]]]]:
    """Return duplicate groups present in head but not entirely present in base."""
    head_strict, head_canonical = find_duplicate_groups(head_tool_names)
    base_strict, base_canonical = find_duplicate_groups(base_tool_names)

    base_strict_keys = {_group_key(g) for g in base_strict.values()}
    base_canonical_keys = {_group_key(g) for g in base_canonical.values()}

    new_strict = {
        label: group
        for label, group in head_strict.items()
        if _group_key(group) not in base_strict_keys
    }
    new_canonical = {
        label: group
        for label, group in head_canonical.items()
        if _group_key(group) not in base_canonical_keys
    }
    return new_strict, new_canonical


def _print_report(
    strict_duplicates: dict[str, list[tuple[str, str]]],
    canonical_equivalents: dict[str, list[tuple[str, str]]]
) -> None:
    if strict_duplicates:
        print(f"Found {len(strict_duplicates)} group(s) with the same friendly name:")
        for label, group in sorted(strict_duplicates.items()):
            print(f"\n{label}:")
            for tool_id, friendly in group:
                print(f"  {tool_id!r} -> {friendly!r}")

    if canonical_equivalents:
        print(
            f"\nFound {len(canonical_equivalents)} group(s) of likely equivalent "
            "tool IDs (different friendly names):"
        )
        for label, group in sorted(canonical_equivalents.items()):
            print(f"\n{label}:")
            for tool_id, friendly in group:
                print(f"  {tool_id!r} -> {friendly!r}")


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]
    tool_names_path = repo_root / "src" / "toolNames.json"
    tool_names = load_tool_names(tool_names_path)

    import argparse
    parser = argparse.ArgumentParser(description="Lint src/toolNames.json for duplicates.")
    parser.add_argument(
        "--base",
        type=Path,
        help="Path to a base toolNames.json. When provided, only duplicates "
             "introduced relative to the base are reported."
    )
    args = parser.parse_args()

    if args.base:
        base_tool_names = load_tool_names(args.base)
        strict_duplicates, canonical_equivalents = find_new_duplicate_groups(
            tool_names, base_tool_names
        )
    else:
        strict_duplicates, canonical_equivalents = find_duplicate_groups(tool_names)

    if not strict_duplicates and not canonical_equivalents:
        print("No duplicate-like entries found.")
        return 0

    _print_report(strict_duplicates, canonical_equivalents)

    # Treat strict duplicates as a failing condition for CI; canonical
    # equivalents are surfaced but do not fail the build on their own.
    return 1 if strict_duplicates else 0


if __name__ == "__main__":
    raise SystemExit(main())
