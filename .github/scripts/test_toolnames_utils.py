#!/usr/bin/env python3
"""Unit tests for toolnames_utils.py's JSON-fragment detection.

Run directly with: python3 .github/scripts/test_toolnames_utils.py
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from toolnames_utils import find_invalid_friendly_names, looks_like_json_fragment


class LooksLikeJsonFragmentTests(unittest.TestCase):
    def test_flags_the_pr_1930_regression(self) -> None:
        # The exact bad value PR #1930 added: str()-ing a nested dict
        # response from the SLM instead of rejecting it.
        self.assertTrue(
            looks_like_json_fragment("{'run_workflow': 'Playwright MCP: Run Workflow'}")
        )

    def test_flags_curly_braces(self) -> None:
        self.assertTrue(looks_like_json_fragment('{"a": "b"}'))

    def test_flags_square_brackets(self) -> None:
        self.assertTrue(looks_like_json_fragment("[Run Workflow]"))

    def test_allows_plain_friendly_names(self) -> None:
        for name in [
            "GitHub MCP (Remote): Issue Read",
            "Playwright MCP: Run Workflow",
            "Search Files",
            "Ask User Question",
            "Get Doc Info",
        ]:
            with self.subTest(name=name):
                self.assertFalse(looks_like_json_fragment(name))

    def test_allows_names_with_parentheses_and_colons(self) -> None:
        self.assertFalse(looks_like_json_fragment("GitHub MCP (Local): Get Commit"))

    def test_flags_non_string_values_instead_of_raising(self) -> None:
        # A backstop check must not crash on unexpected input (e.g. a nested
        # dict that slipped past an earlier validation step) — it should
        # treat it as invalid, not raise TypeError.
        for value in [{"run_workflow": "Playwright MCP: Run Workflow"}, ["a", "b"], None, 42]:
            with self.subTest(value=value):
                self.assertTrue(looks_like_json_fragment(value))


class FindInvalidFriendlyNamesTests(unittest.TestCase):
    def test_returns_only_invalid_entries(self) -> None:
        tool_names = {
            "read_file": "Read File",
            "MCP": "{'run_workflow': 'Playwright MCP: Run Workflow'}",
            "run_workflow": "Run Workflow",
        }
        self.assertEqual(
            find_invalid_friendly_names(tool_names),
            [("MCP", "{'run_workflow': 'Playwright MCP: Run Workflow'}")],
        )

    def test_empty_when_all_valid(self) -> None:
        tool_names = {"read_file": "Read File", "grep": "Grep"}
        self.assertEqual(find_invalid_friendly_names(tool_names), [])


if __name__ == "__main__":
    unittest.main()
