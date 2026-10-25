"""Tests for badge-app/fluency/fluency_data.py. Run: python -m unittest discover -s badge-app/tests"""

import json
import os
import sys
import tempfile
import unittest

APP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fluency")
sys.path.insert(0, APP_DIR)

import fluency_data as fd  # noqa: E402


def payload(**overrides):
    data = {
        "v": 1,
        "updated": "2026-10-23T19:14:00Z",
        "stage": 3,
        "label": "AI Collaborator",
        "categories": [["Prompt", 3], ["Context", 3], ["Agentic", 4], ["Tools", 3], ["Custom", 2], ["Workflow", 3]],
        "days": [["2026-10-%02d" % d, d * 1000, d] for d in range(1, 31)],
        "tokens30": 465000,
        "sessions30": 465,
        "theme": {"accent": "#0078d4"},
    }
    data.update(overrides)
    return data


class ParseTests(unittest.TestCase):
    def test_valid_payload(self):
        data = fd.parse(payload())
        self.assertEqual(data["stage"], 3)
        self.assertEqual(data["label"], "AI Collaborator")
        self.assertEqual(len(data["categories"]), 6)
        self.assertEqual(data["days"][-1], ("2026-10-30", 30000, 30))
        self.assertEqual(data["tokens30"], 465000)

    def test_sample_file_is_valid(self):
        data = fd.load(os.path.join(APP_DIR, "assets", "sample.json"))
        self.assertEqual(len(data["days"]), fd.DAYS)
        self.assertEqual(data["tokens30"], sum(d[1] for d in data["days"]))

    def test_rejects_wrong_version(self):
        with self.assertRaises(ValueError):
            fd.parse(payload(v=2))

    def test_rejects_stage_out_of_range_or_bool(self):
        for stage in (0, 5, True, "3", None):
            with self.assertRaises(ValueError, msg=repr(stage)):
                fd.parse(payload(stage=stage))

    def test_rejects_malformed_categories_and_days(self):
        for overrides in ({"categories": []}, {"categories": [["Prompt"]]}, {"categories": [["Prompt", 9]]},
                          {"days": [["2026-10-01", -1, 0]]}, {"days": [["2026-10-01", 5]]}):
            with self.assertRaises(ValueError, msg=repr(overrides)):
                fd.parse(payload(**overrides))

    def test_keeps_only_last_30_days(self):
        days = [["2026-09-%02d" % (d % 30 + 1), d, 1] for d in range(45)]
        self.assertEqual(len(fd.parse(payload(days=days))["days"]), fd.DAYS)
        self.assertEqual(fd.parse(payload(days=days))["days"][0][1], 15)

    def test_missing_optional_fields_use_defaults(self):
        raw = payload()
        for key in ("label", "tokens30", "sessions30", "theme", "updated"):
            del raw[key]
        data = fd.parse(raw)
        self.assertEqual(data["label"], "AI Collaborator")
        self.assertEqual(data["tokens30"], sum(d * 1000 for d in range(1, 31)))
        self.assertEqual(data["accent"], fd.DEFAULT_ACCENT)
        self.assertEqual(data["updated"], "")
        self.assertIsNone(data["today"])

    def test_long_text_is_cut(self):
        data = fd.parse(payload(label="x" * 100, categories=[["y" * 40, 2]]))
        self.assertEqual(len(data["label"]), 24)
        self.assertEqual(len(data["categories"][0][0]), 16)


class LoadTests(unittest.TestCase):
    def write(self, text):
        handle = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
        handle.write(text)
        handle.close()
        self.addCleanup(os.remove, handle.name)
        return handle.name

    def test_missing_file_raises_oserror(self):
        with self.assertRaises(OSError):
            fd.load("/nonexistent/fluency.json")

    def test_oversized_file_rejected(self):
        with self.assertRaises(ValueError):
            fd.load(self.write(" " * (fd.MAX_BYTES + 10) + "{}"))

    def test_invalid_json_rejected(self):
        with self.assertRaises(ValueError):
            fd.load(self.write("{not json"))

    def test_round_trip(self):
        self.assertEqual(fd.load(self.write(json.dumps(payload())))["stage"], 3)


class ColourTests(unittest.TestCase):
    def test_parse_hex(self):
        self.assertEqual(fd.parse_hex("#0078d4"), (0, 120, 212))
        for bad in ("0078d4", "#0078d", "#zzzzzz", None, 7):
            self.assertIsNone(fd.parse_hex(bad))

    def test_grey_falls_back(self):
        self.assertEqual(fd.accent_colour("#808080", fd.DEFAULT_ACCENT), fd.DEFAULT_ACCENT)

    def test_dark_colour_is_lifted(self):
        lifted = fd.accent_colour("#0000aa", fd.DEFAULT_ACCENT)
        self.assertGreaterEqual(fd._luminance(lifted), 0.35)
        self.assertGreater(lifted[2], lifted[0])  # still blue

    def test_bright_colour_kept(self):
        self.assertEqual(fd.accent_colour("#d3fa37", fd.DEFAULT_ACCENT), (211, 250, 55))


class FormatTests(unittest.TestCase):
    def test_compact(self):
        cases = {0: "0", 999: "999", 1000: "1k", 8400: "8.4k", 52000: "52k", 138456: "138k",
                 1000000: "1M", 1840000: "1.84M", 12500000: "12M"}
        for number, expected in cases.items():
            self.assertEqual(fd.compact(number), expected, number)

    def test_thousands(self):
        self.assertEqual(fd.thousands(8412), "8,412")
        self.assertEqual(fd.thousands(999), "999")
        self.assertEqual(fd.thousands(1234567), "1,234,567")

    def test_labels(self):
        self.assertEqual(fd.day_label("2026-09-24"), "Sep 24")
        self.assertEqual(fd.day_label("garbage"), "garbage")
        self.assertEqual(fd.updated_label("2026-10-23T19:14:00Z"), "Oct 23 19:14 UTC")
        self.assertEqual(fd.updated_label(""), "")

    def test_weakest_picks_first_lowest(self):
        self.assertEqual(fd.weakest([("A", 3), ("B", 2), ("C", 2)]), ("B", 2))


if __name__ == "__main__":
    unittest.main()
