# Loading, validating and formatting the data the extension writes to the badge.
# Pure Python with no badge APIs, so it runs (and is tested) on a laptop too.

import json

SCHEMA_VERSION = 1
MAX_BYTES = 8192  # the extension keeps the file under about 4 KB
DAYS = 30  # the default history length
MAX_DAYS = 90  # the extension can push 30 or 90 days; the badge shows whatever it gets
MAX_STAGE = 4

# The GitHub Universe palette (src/badgePayload.ts UNIVERSE_BADGE_THEME), used until a sync sends colours.
DEFAULT_ACCENT = (95, 237, 131)  # Universe bright green
DEFAULT_GOOD = (8, 135, 43)  # the GitHub green of Universe buttons
MONTHS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

STAGE_LABELS = {1: "AI Skeptic", 2: "AI Explorer", 3: "AI Collaborator", 4: "AI Strategist"}


def _int(value, name, low=0, high=None):
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(name + " must be a whole number")
    if value < low or (high is not None and value > high):
        raise ValueError(name + " is out of range")
    return value


def _text(value, name, limit):
    if not isinstance(value, str):
        raise ValueError(name + " must be text")
    return value[:limit]


def parse(raw):
    """Validate a decoded fluency.json and return a normalised copy.

    Raises ValueError when a required field is missing or has the wrong type,
    so a half-written or foreign file never reaches the drawing code.
    """
    if not isinstance(raw, dict):
        raise ValueError("fluency.json must hold an object")
    if raw.get("v") != SCHEMA_VERSION:
        raise ValueError("unsupported fluency.json version")

    stage = _int(raw.get("stage"), "stage", 1, MAX_STAGE)
    label = raw.get("label")
    label = _text(label, "label", 24) if label is not None else STAGE_LABELS[stage]

    categories = []
    for entry in raw.get("categories") or []:
        if not isinstance(entry, list) or len(entry) != 2:
            raise ValueError("each category must be [name, stage]")
        categories.append((_text(entry[0], "category name", 16), _int(entry[1], "category stage", 0, MAX_STAGE)))
    if not categories:
        raise ValueError("categories are missing")

    days = []
    for entry in raw.get("days") or []:
        if not isinstance(entry, list) or len(entry) != 3:
            raise ValueError("each day must be [date, tokens, sessions]")
        days.append((_text(entry[0], "day", 10), _int(entry[1], "tokens"), _int(entry[2], "sessions")))
    days = days[-MAX_DAYS:]

    today = raw.get("today")
    if isinstance(today, list) and len(today) == 2:
        today = (_int(today[0], "today tokens"), _int(today[1], "today sessions"))
    else:
        today = None

    theme = raw.get("theme") if isinstance(raw.get("theme"), dict) else {}
    return {
        "updated": raw.get("updated") if isinstance(raw.get("updated"), str) else "",
        "stage": stage,
        "label": label,
        "categories": categories,
        "days": days,
        "range": len(days) or DAYS,
        # tokens30 / sessions30 are the totals over `days`, so they cover 90 days when 90 are sent.
        "tokens30": _int(raw.get("tokens30", sum(d[1] for d in days)), "tokens30"),
        "sessions30": _int(raw.get("sessions30", sum(d[2] for d in days)), "sessions30"),
        "today": today,
        "accent": accent_colour(theme.get("accent"), DEFAULT_ACCENT),
        "good": accent_colour(theme.get("good"), DEFAULT_GOOD),
    }


def load(path):
    """Read and validate fluency.json. OSError when the file is missing, ValueError when it is bad."""
    with open(path) as source:
        text = source.read(MAX_BYTES + 1)
    if len(text) > MAX_BYTES:
        raise ValueError("fluency.json is too large")
    return parse(json.loads(text))


def parse_hex(value):
    """'#rrggbb' -> (r, g, b), or None for anything else."""
    if not isinstance(value, str) or len(value) != 7 or value[0] != "#":
        return None
    try:
        return (int(value[1:3], 16), int(value[3:5], 16), int(value[5:7], 16))
    except ValueError:
        return None


def _luminance(rgb):
    return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255


def accent_colour(value, fallback, min_luminance=0.35, min_spread=40):
    """Turn a theme colour into one that reads well on the badge's dark ground.

    Grey colours (channel spread below min_spread) fall back to the default so
    the screens never look washed out; dark colours are blended towards white
    until they are bright enough against the background.
    """
    rgb = parse_hex(value)
    if rgb is None or max(rgb) - min(rgb) < min_spread:
        return fallback
    steps = 0
    while _luminance(rgb) < min_luminance and steps < 10:
        rgb = tuple(int(c + (255 - c) * 0.2) for c in rgb)
        steps += 1
    return rgb


def compact(number):
    """52000 -> '52k', 1840000 -> '1.84M', 8400 -> '8.4k'."""
    if number < 1000:
        return str(number)
    if number < 10000:
        return _trim("%.1f" % (number / 1000)) + "k"
    if number < 1000000:
        return str(int(round(number / 1000))) + "k"
    if number < 10000000:
        return _trim("%.2f" % (number / 1000000)) + "M"
    return str(int(round(number / 1000000))) + "M"


def _trim(text):
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


def thousands(number):
    """8412 -> '8,412'."""
    text = str(number)
    groups = []
    while len(text) > 3:
        groups.insert(0, text[-3:])
        text = text[:-3]
    groups.insert(0, text)
    return ",".join(groups)


def day_label(date):
    """'2026-09-24' -> 'Sep 24'."""
    try:
        month = int(date[5:7])
        day = int(date[8:10])
    except (ValueError, IndexError):
        return date
    if not 1 <= month <= 12:
        return date
    return "%s %d" % (MONTHS[month - 1], day)


def updated_label(iso):
    """'2026-10-23T19:14:00Z' -> 'Oct 23 19:14 UTC' (the extension writes UTC)."""
    if len(iso) < 16:
        return iso
    suffix = " UTC" if iso.endswith("Z") else ""
    return day_label(iso[:10]) + " " + iso[11:16] + suffix


def weakest(categories):
    """The lowest-stage category; the first one wins a tie."""
    best = None
    for name, stage in categories:
        if best is None or stage < best[1]:
            best = (name, stage)
    return best


def linkedin_path(value):
    """The LinkedIn profile path from CONTACT_LINKEDIN, which holds either a bare
    username or a full link such as https://www.linkedin.com/in/username/;
    "" when it is empty or names another site."""
    value = value.strip().lstrip("@").split("?")[0].split("#")[0].strip("/")
    rest = value.split("://", 1)[-1]
    host, _, path = rest.partition("/")
    host = host.lower()
    if host == "linkedin.com" or host.endswith(".linkedin.com"):
        return path.strip("/")
    if value.startswith("in/") and "." not in value:
        return value
    if "." in value or "/" in value:
        return ""
    return "in/" + value if value else ""
