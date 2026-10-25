# AI Engineering Fluency on the GitHub Universe 2026 badge.
#
# Shows the fluency score, a 30-day token history and two QR codes, from
# /state/fluency.json written by the AI Engineering Fluency extension.
# LEFT / RIGHT flip screens, MENU opens sync status, BACK exits.

import math
import os
import sys

# The preview tool in badge-app/tools sets FLUENCY_APP_DIR / FLUENCY_STATE_DIR to run this on a laptop.
# /remote/fluency is where `mpremote mount badge-app` puts it; /system/apps/fluency is the installed copy.
APP_DIRS = ("/remote/fluency", "/remote/apps/fluency", "/system/apps/fluency", "/apps/fluency")
APP_DIR = globals().get("FLUENCY_APP_DIR") or next(path for path in APP_DIRS if is_dir(path))
STATE_DIR = globals().get("FLUENCY_STATE_DIR") or "/state"
os.chdir(APP_DIR)
sys.path.insert(0, APP_DIR)

import fluency_data as fd  # noqa: E402  (needs APP_DIR on sys.path first)

try:
    import secrets
except ImportError:
    secrets = None

DATA_FILE = STATE_DIR + "/fluency.json"
PAIRING_FILE = STATE_DIR + "/fluency_pairing.json"
SAMPLE_FILE = APP_DIR + "/assets/sample.json"
RELOAD_CHECK_MS = 3000

badge.mode(HIRES | VSYNC)
screen.antialias = image.X2
WIDTH = screen.width
HEIGHT = screen.height
MARGIN = 13

try:
    FONT = font.load("/system/assets/fonts/MonaSans-Medium.af")
    VECTOR = True
except (OSError, AttributeError):
    FONT = font.nope
    VECTOR = False
screen.font = FONT


def rgb(values, alpha=255):
    return color.rgb(values[0], values[1], values[2], alpha)


BACKGROUND = color.rgb(13, 17, 23)
WHITE = color.rgb(238, 242, 246)
LIGHT = color.rgb(201, 209, 217)
DIM = color.rgb(139, 148, 158)
TRACK = color.rgb(33, 38, 45)
PLATE = color.rgb(255, 255, 255)


def setting(key, fallback=""):
    return str(getattr(secrets, key, "") or "").strip() or fallback


HANDLE = setting("GITHUB_USERNAME")
CONTACT_NAME = setting("CONTACT_NAME", "Rob Bos")


# ── drawing helpers ───────────────────────────────────────────────────────

def text(value, x, y, size, pen):
    screen.pen = pen
    if VECTOR:
        screen.text(value, x, y, size)
    else:
        screen.text(value, x, y)


def text_width(value, size):
    if VECTOR:
        return screen.measure_text(value, font_size=size)[0]
    return screen.measure_text(value)[0]


def text_right(value, right, y, size, pen):
    text(value, right - text_width(value, size), y, size, pen)


def wrap(value, width, size):
    """Break text into lines that fit, at spaces, '/' or '-' so URLs wrap too."""
    lines = []
    line = ""
    for part in _split_keep(value):
        candidate = line + part
        if line and text_width(candidate.rstrip(), size) > width:
            lines.append(line.rstrip())
            line = part.lstrip()
        else:
            line = candidate
    if line:
        lines.append(line.rstrip())
    return lines


def _split_keep(value):
    parts = []
    current = ""
    for char in value:
        current += char
        if char in " /-":
            parts.append(current)
            current = ""
    if current:
        parts.append(current)
    return parts


def text_block(lines, x, y, size, pen, gap=3):
    for line in lines:
        text(line, x, y, size, pen)
        y += size + gap
    return y


def box(x, y, w, h, pen, radius=3):
    screen.pen = pen
    screen.shape(shape.rounded_rectangle(x, y, w, h, radius))


def segments(x, y, width, filled, total, accent, height=5, gap=3):
    step = (width + gap) / total
    for i in range(total):
        box(int(x + i * step), y, int(step - gap), height, accent if i < filled else TRACK, 2)


def footer(left, right=""):
    text(left, MARGIN, HEIGHT - 16, 8, DIM)
    if right:
        text_right(right, WIDTH - MARGIN, HEIGHT - 16, 8, DIM)


# ── data ──────────────────────────────────────────────────────────────────

class Store:
    def __init__(self):
        self.data = None
        self.error = None
        self.demo = False
        self.paired = False
        self.signature = None
        self.next_check = 0
        self.reload(force=True)

    def _stat(self, path):
        try:
            info = os.stat(path)
            return (info[6], info[8])
        except OSError:
            return None

    def reload(self, force=False):
        signature = self._stat(DATA_FILE)
        self.paired = self._stat(PAIRING_FILE) is not None
        if not force and signature == self.signature:
            return False
        self.signature = signature
        if signature is None:
            self.data = None
            self.error = None
        else:
            try:
                self.data = fd.load(DATA_FILE)
                self.error = None
                self.demo = False
            except (OSError, ValueError, KeyError, TypeError) as error:
                print("fluency: could not read fluency.json -", error)
                self.data = None
                self.error = "fluency.json could not be read"
        return True

    def poll(self, now):
        if now >= self.next_check:
            self.next_check = now + RELOAD_CHECK_MS
            return self.reload()
        return False

    def toggle_demo(self):
        if self.demo:
            self.demo = False
            self.reload(force=True)
            return
        try:
            self.data = fd.load(SAMPLE_FILE)
            self.demo = True
        except (OSError, ValueError) as error:
            print("fluency: sample data missing -", error)


# ── tilt (adapted from the stock badge app in badger/home, MIT) ──────────────

class Tilt:
    GRAVITY = 16384.0
    SMOOTH_MS = 120
    RECENTRE_MS = 2800

    def __init__(self):
        self.x = 0.0
        self.rest_x = None
        self.last_ticks = None
        self.available = True

    def update(self):
        if not self.available:
            return
        try:
            ax = badge.imu()[0]
        except (AttributeError, OSError, TypeError, IndexError):
            self.available = False  # simulators have no IMU
            self.x = 0.0
            return
        now = badge.ticks
        dt = min(now - self.last_ticks, 200) if self.last_ticks is not None else 0
        self.last_ticks = now
        if self.rest_x is None:
            self.rest_x = ax
        # Slowly follow the resting angle so the way the badge hangs reads as "level".
        self.rest_x += (ax - self.rest_x) * (1 - math.exp(-dt / self.RECENTRE_MS))
        target = max(-1.0, min(1.0, -(ax - self.rest_x) / self.GRAVITY * 2))
        self.x += (target - self.x) * (1 - math.exp(-dt / self.SMOOTH_MS))


TILT_DEAD_ZONE = 0.3  # in tilt units (1.0 = half a g), so about 0.15 g
TILT_DAYS_PER_SECOND = 14
TILT_DIRECTION = 1  # flip to -1 if tilting right moves the cursor left on the real badge


# ── screens ───────────────────────────────────────────────────────────────

def draw_score(data, accent, demo):
    text("@" + HANDLE if HANDLE else "AI Fluency", MARGIN, 9, 12, accent)
    text_right("DEMO DATA" if demo else "AI Engineering Fluency", WIDTH - MARGIN, 11, 9, accent if demo else DIM)

    stage = str(data["stage"])
    text(stage, MARGIN, 26, 48, WHITE)
    left = MARGIN + text_width(stage, 48) + 10
    text("Stage %d of %d" % (data["stage"], fd.MAX_STAGE), left, 32, 10, DIM)
    text(data["label"], left, 46, 16, accent)

    column_width = (WIDTH - MARGIN * 2 - 14) // 2
    for index, (name, value) in enumerate(data["categories"][:6]):
        x = MARGIN + (index % 2) * (column_width + 14)
        y = 82 + (index // 2) * 25
        text(name, x, y, 9, LIGHT)
        text_right("%d/%d" % (value, fd.MAX_STAGE), x + column_width, y, 9, DIM)
        segments(x, y + 13, column_width, value, fd.MAX_STAGE, accent)

    footer("last 30 days  %s tokens  %d sessions" % (fd.compact(data["tokens30"]), data["sessions30"]),
           fd.updated_label(data["updated"])[:12])


def draw_history(data, accent, good, cursor, metric):
    days = data["days"]
    text("Last 30 days", MARGIN, 9, 12, accent)
    text_right("UP/DOWN: " + ("sessions" if metric == 1 else "tokens"), WIDTH - MARGIN, 11, 8, DIM)
    if not days:
        text("No daily data yet", MARGIN, 60, 12, LIGHT)
        footer("BACK exits", "< > screens")
        return

    index = max(0, min(len(days) - 1, int(cursor)))
    date, tokens, sessions = days[index]
    big = fd.compact(tokens) if metric == 0 else str(sessions)
    text(big, MARGIN, 26, 26, WHITE)
    detail = ("tokens  %d sessions" % sessions) if metric == 0 else ("sessions  %s tokens" % fd.compact(tokens))
    text(detail, MARGIN + text_width(big, 26) + 7, 38, 10, LIGHT)
    text_right(fd.day_label(date), WIDTH - MARGIN, 36, 11, accent)

    top, bottom = 70, 196
    values = [d[1 + metric] for d in days]
    peak = max(values) or 1
    count = len(days)
    step = (WIDTH - MARGIN * 2 + 2) / count
    bar = max(2, int(step - 2))
    recent = count - 7
    for i, value in enumerate(values):
        height = max(2, int((bottom - top) * value / peak)) if value else 2
        if i == index:
            pen = WHITE
        elif value == 0:
            pen = TRACK
        elif i >= recent:
            pen = accent
        else:
            pen = good
        box(int(MARGIN + i * step), bottom - height, bar, height, pen, 1)
    screen.pen = TRACK
    screen.shape(shape.rectangle(MARGIN, bottom + 1, WIDTH - MARGIN * 2, 1))

    text(fd.day_label(days[0][0]), MARGIN, bottom + 5, 8, DIM)
    text_right(fd.day_label(days[-1][0]), WIDTH - MARGIN, bottom + 5, 8, DIM)
    average = sum(values) // count
    footer("avg %s/day" % (fd.compact(average) if metric == 0 else str(average)), "tilt to scrub")


QR_IMAGES = {}


def qr(name):
    if name not in QR_IMAGES:
        QR_IMAGES[name] = image.load("assets/" + name + ".png")
    return QR_IMAGES[name]


def draw_qr(name, plate_x, text_x, text_width_px, title, lines, accent):
    code = qr(name)
    plate = code.width + 8
    plate_y = (HEIGHT - plate) // 2
    box(plate_x, plate_y, plate, plate, PLATE, 6)
    screen.blit(code, vec2(plate_x + 4, plate_y + 4))

    y = text_block(wrap(title, text_width_px, 11), text_x, 30, 11, accent)
    y += 6
    for size, pen, value in lines:
        y = text_block(wrap(value, text_width_px, size), text_x, y, size, pen) + 5
    text("< > screens", text_x, HEIGHT - 26, 8, DIM)


def draw_qr_repo(accent):
    draw_qr("qr_repo", 10, 226, WIDTH - 226 - 8, "Get the extension", (
        (10, WHITE, "AI Engineering Fluency"),
        (8, DIM, "github.com/rajbos/ai-engineering-fluency"),
        (8, DIM, "VS Code, Visual Studio, JetBrains, CLI"),
    ), accent)


def draw_qr_linkedin(accent):
    code = qr("qr_linkedin")
    plate_x = WIDTH - 10 - (code.width + 8)
    draw_qr("qr_linkedin", plate_x, MARGIN, plate_x - MARGIN - 8, "Connect", (
        (12, WHITE, CONTACT_NAME),
        (8, DIM, "linkedin.com/in/bosrob"),
    ), accent)


def draw_sync(store, accent):
    text("Sync", MARGIN, 9, 12, accent)
    text_right("BACK: return" if store.data else "BACK: exit", WIDTH - MARGIN, 11, 8, DIM)

    half = (WIDTH - MARGIN * 2 - 8) // 2
    box(MARGIN, 32, half, 52, TRACK, 6)
    text("Data", MARGIN + 8, 38, 8, DIM)
    if store.demo:
        status, detail = "demo data", "sample, not yours"
    elif store.data:
        status, detail = "loaded", fd.updated_label(store.data["updated"])
    elif store.error:
        status, detail = "unreadable", "copy it again"
    else:
        status, detail = "none yet", "/state/fluency.json"
    text(status, MARGIN + 8, 51, 12, WHITE)
    text(detail, MARGIN + 8, 68, 8, DIM)

    x = MARGIN + half + 8
    box(x, 32, half, 52, TRACK, 6)
    text("Paired", x + 8, 38, 8, DIM)
    text("yes" if store.paired else "not yet", x + 8, 51, 12, WHITE)
    text("token from USB" if store.paired else "no token on badge", x + 8, 68, 8, DIM)

    y = 98
    if store.data and not store.demo:
        lines = ("Wi-Fi push arrives in a later version.",
                 "Copy a new fluency.json over USB to refresh.")
    else:
        lines = ("Copy fluency.json to /state over USB:",
                 "mpremote fs cp fluency.json :/state/fluency.json",
                 "SELECT: " + ("back to your data" if store.demo else "show demo data"))
    for line in lines:
        y = text_block(wrap(line, WIDTH - MARGIN * 2, 9), MARGIN, y, 9, LIGHT) + 4
    footer("MENU opens this screen", "BACK " + ("returns" if store.data else "exits"))


# ── app ───────────────────────────────────────────────────────────────────

SCREENS = ("score", "history", "qr_repo", "qr_linkedin")


class App:
    def __init__(self):
        self.store = Store()
        self.tilt = Tilt()
        self.screen = 0
        self.show_sync = False
        self.metric = 0
        self.cursor = None

    def handle_input(self):
        data = self.store.data
        if self.show_sync or data is None:
            if badge.pressed(BUTTON_SELECT) and (data is None or self.store.demo):
                self.store.toggle_demo()
                self.cursor = None
            elif badge.pressed(BUTTON_BACK):
                if data is None:
                    return False
                self.show_sync = False
            return True

        if badge.pressed(BUTTON_BACK):
            return False
        if badge.pressed(BUTTON_MENU):
            self.show_sync = True
            return True

        on_history = SCREENS[self.screen] == "history"
        selecting = badge.held(BUTTON_SELECT)
        if on_history and selecting:
            # SELECT + LEFT/RIGHT steps the cursor: the scrub control for simulators without an IMU.
            if badge.pressed(BUTTON_LEFT):
                self.cursor = (self.cursor or 0) - 1
            if badge.pressed(BUTTON_RIGHT):
                self.cursor = (self.cursor or 0) + 1
        else:
            if badge.pressed(BUTTON_LEFT):
                self.screen = (self.screen - 1) % len(SCREENS)
            if badge.pressed(BUTTON_RIGHT):
                self.screen = (self.screen + 1) % len(SCREENS)
        if on_history and (badge.pressed(BUTTON_UP) or badge.pressed(BUTTON_DOWN)):
            self.metric = 1 - self.metric
        return True

    def scrub(self, days):
        if self.cursor is None:
            self.cursor = float(days - 1)
        if SCREENS[self.screen] == "history" and not self.show_sync:
            self.tilt.update()
            amount = abs(self.tilt.x)
            if amount > TILT_DEAD_ZONE:
                speed = (amount - TILT_DEAD_ZONE) / (1 - TILT_DEAD_ZONE) * TILT_DAYS_PER_SECOND
                direction = TILT_DIRECTION if self.tilt.x > 0 else -TILT_DIRECTION
                self.cursor += direction * speed * badge.ticks_delta / 1000
        self.cursor = max(0.0, min(float(days - 1), self.cursor))

    def update(self):
        if self.store.poll(badge.ticks) and not self.store.demo:
            self.cursor = None
        if not self.handle_input():
            return False

        data = self.store.data
        screen.pen = BACKGROUND
        screen.clear()
        accent = rgb(data["accent"]) if data else rgb(fd.DEFAULT_ACCENT)

        if self.show_sync or data is None:
            draw_sync(self.store, accent)
            return None

        name = SCREENS[self.screen]
        if name == "score":
            draw_score(data, accent, self.store.demo)
        elif name == "history":
            self.scrub(max(1, len(data["days"])))
            draw_history(data, accent, rgb(data["good"]), self.cursor, self.metric)
        elif name == "qr_repo":
            draw_qr_repo(accent)
        else:
            draw_qr_linkedin(accent)
        return None


app = App()
run(app.update)
