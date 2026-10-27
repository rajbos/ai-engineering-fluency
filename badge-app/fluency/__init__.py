# AI Engineering Fluency on the GitHub Universe 2026 badge.
#
# Shows the fluency score, a 30-day token history and two QR codes, from
# /state/fluency.json written by the AI Engineering Fluency extension.
# LEFT / RIGHT flip screens, a tap on SELECT switches the look (Motion,
# 3D radar, 3D skyline), UP / DOWN on the score screen flips to a spider
# chart and back, MENU opens sync status, BACK exits.

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
import fluency_motion as fm  # noqa: E402

try:
    import secrets
except ImportError:
    secrets = None

DATA_FILE = STATE_DIR + "/fluency.json"
PAIRING_FILE = STATE_DIR + "/fluency_pairing.json"
SAMPLE_FILE = APP_DIR + "/assets/sample.json"
LOOK_FILE = STATE_DIR + "/fluency_look.json"
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

# Horizontal offset every helper adds, so a whole screen can slide in and out.
DX = 0


def text(value, x, y, size, pen):
    screen.pen = pen
    if VECTOR:
        screen.text(value, x + DX, y, size)
    else:
        screen.text(value, x + DX, y)


def text_centre(value, x, y, size, pen):
    text(value, x - text_width(value, size) / 2, y, size, pen)


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
    screen.shape(shape.rounded_rectangle(x + DX, y, w, h, radius))


def polygon(points, pen, outline=0):
    """Fill (or with outline > 0, stroke) a polygon given as (x, y, ...) tuples."""
    screen.pen = pen
    item = shape.custom([vec2(p[0] + DX, p[1]) for p in points])
    screen.shape(item.stroke(outline) if outline else item)


def line(a, b, width, pen):
    screen.pen = pen
    screen.shape(shape.line(a[0] + DX, a[1], b[0] + DX, b[1], width))


def segments(x, y, width, filled, total, accent, height=5, gap=3):
    """A row of `total` pips with `filled` of them lit; a fractional `filled`
    lights part of the last pip, which is how the bars grow in."""
    step = (width + gap) / total
    for i in range(total):
        left = int(x + i * step)
        box(left, y, int(step - gap), height, TRACK, 2)
        part = min(1.0, filled - i)
        if part > 0:
            box(left, y, max(2, int((step - gap) * part)), height, accent, 2)


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
    """x is left/right tilt and y forward/back, each about -1..1 (1.0 = half a g).
    Both slowly re-centre, so the way the badge hangs reads as level."""

    GRAVITY = 16384.0
    SMOOTH_MS = 120
    RECENTRE_MS = 2800

    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.rest_x = None
        self.rest_z = None
        self.last_ticks = None
        self.available = True

    def update(self):
        if not self.available:
            return
        try:
            reading = badge.imu()
            ax, az = reading[0], reading[2]
        except (AttributeError, OSError, TypeError, IndexError):
            self.available = False  # simulators have no IMU
            self.x = self.y = 0.0
            return
        now = badge.ticks
        dt = min(now - self.last_ticks, 200) if self.last_ticks is not None else 0
        self.last_ticks = now
        if self.rest_x is None:
            self.rest_x, self.rest_z = ax, az
        recentre = 1 - math.exp(-dt / self.RECENTRE_MS)
        smooth = 1 - math.exp(-dt / self.SMOOTH_MS)
        self.rest_x += (ax - self.rest_x) * recentre
        self.rest_z += (az - self.rest_z) * recentre
        target_x = max(-1.0, min(1.0, -(ax - self.rest_x) / self.GRAVITY * 2))
        target_y = max(-1.0, min(1.0, (az - self.rest_z) / self.GRAVITY * 2))
        self.x += (target_x - self.x) * smooth
        self.y += (target_y - self.y) * smooth


TILT_DEAD_ZONE = 0.3  # in tilt units (1.0 = half a g), so about 0.15 g
TILT_DAYS_PER_SECOND = 14
TILT_DIRECTION = 1  # flip to -1 if tilting right moves the cursor left on the real badge
TILT_PITCH = 0.4  # how far (radians) a forward/back tilt swings the 3D cameras

TRANSITION_MS = 260  # Motion look: screen slide
GROW_MS = 450  # Motion look: one bar growing in
GROW_STAGGER_MS = 18  # Motion look: delay between neighbouring bars
SWEEP_MS = 600  # Motion look: the band that crosses the screen when new data lands
TOAST_MS = 1400  # how long the look name shows after switching

RADAR_SPIN = 0.35  # radians per second the radar turns on its own
RADAR_TILT_SPIN = 2.2  # extra radians per second at full left/right tilt
RADAR_HEIGHT = 0.28  # height of the radar prism, in radar radii

SPIDER_RING_MS = 420  # Spider chart: one ring growing out of the centre
SPIDER_RING_STAGGER_MS = 80  # delay between neighbouring rings
SPIDER_SWEEP_START_MS = 300  # when the arm starts its first turn
SPIDER_SWEEP_MS = 1500  # the first turn, lighting each spoke as it passes
SPIDER_POP_MS = 450  # a spoke popping out to its stage
SPIDER_IDLE_MS = 7000  # a later, fainter turn of the arm
SPIDER_TRAIL = 0.55  # radians of fading trail behind the arm
SPIDER_FLOOR = 0.12  # radius of a zero stage, so the shape never collapses


class Motion:
    """What a screen needs to animate in the Motion look."""

    def __init__(self, elapsed, now, glow, accent):
        self.elapsed = elapsed
        self.now = now
        self.glow = glow
        self.accent = accent  # (r, g, b), for the translucent effects

    def grow(self, index):
        return fm.stagger(self.elapsed, index, GROW_STAGGER_MS, GROW_MS)


# ── screens ───────────────────────────────────────────────────────────────

def score_header(data, accent, demo):
    text("@" + HANDLE if HANDLE else "AI Fluency", MARGIN, 9, 12, accent)
    text_right("DEMO DATA" if demo else "AI Engineering Fluency", WIDTH - MARGIN, 11, 9, accent if demo else DIM)


def score_footer(data):
    footer("last 30 days  %s tokens  %d sessions" % (fd.compact(data["tokens30"]), data["sessions30"]),
           fd.updated_label(data["updated"])[:12])


def draw_score(data, accent, demo, motion=None):
    score_header(data, accent, demo)

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
        filled = value * motion.grow(index * 3) if motion else value
        segments(x, y + 13, column_width, filled, fd.MAX_STAGE, accent)

    text_right("UP/DOWN: spider chart", WIDTH - MARGIN, 188, 8, DIM)
    score_footer(data)


def score_column(data, categories, accent, hint):
    """The stage summary down the left of the radar views: the big stage digit,
    the label, the strongest category and the one to grow next."""
    stage = str(data["stage"])
    text(stage, MARGIN, 26, 48, WHITE)
    text("Stage %d of %d" % (data["stage"], fd.MAX_STAGE), MARGIN, 82, 10, DIM)
    y = text_block(wrap(data["label"], 112, 14), MARGIN, 97, 14, accent, 2) + 8
    strongest = max(categories, key=lambda c: c[1])
    weakest = fd.weakest(categories)
    text("Strongest", MARGIN, y, 8, DIM)
    text("%s %d" % strongest, MARGIN, y + 11, 10, LIGHT)
    text("Grow next", MARGIN, y + 29, 8, DIM)
    text("%s %d" % weakest, MARGIN, y + 40, 10, LIGHT)
    text(hint, MARGIN, 200, 8, DIM)


def draw_radar(data, colour, demo, yaw, pitch, hint):
    """The score as a turning 3D radar: one spoke per category, the data shape
    extruded into a prism, with the stage summary in a column on the left.
    `colour` is the accent as (r, g, b), since the prism shades it."""
    categories = data["categories"][:6]
    accent = rgb(colour)
    score_header(data, accent, demo)
    score_column(data, categories, accent, hint)

    camera = fm.Camera(222, 128, 54, yaw, pitch, 5.0)
    count = len(categories)
    floor = SPIDER_FLOOR

    # Floor: one ring per stage and a spoke per category.
    for level in range(1, fd.MAX_STAGE + 1):
        radius = floor + (1 - floor) * level / fd.MAX_STAGE
        ring = [camera.project(x, 0, z) for x, z in (fm.radar_spoke(i, count, radius) for i in range(count))]
        polygon(ring, DIM if level == fd.MAX_STAGE else TRACK, 1)
    centre = camera.project(0, 0, 0)
    for i in range(count):
        x, z = fm.radar_spoke(i, count, 1.0)
        line(centre, camera.project(x, 0, z), 1, TRACK)

    # The data prism: walls back to front with the light fixed to the viewer's
    # upper left, so the shading moves as it turns; then a translucent lid.
    base = fm.radar_polygon([value for _, value in categories], fd.MAX_STAGE, floor)
    walls = []
    for i in range(count):
        (ax, az), (bx, bz) = base[i], base[(i + 1) % count]
        quad = [camera.project(*p) for p in ((ax, 0, az), (ax, RADAR_HEIGHT, az), (bx, RADAR_HEIGHT, bz), (bx, 0, bz))]
        if not fm.faces_viewer(quad):
            continue
        mid = 2 * math.pi * (i + 0.5) / count + yaw
        light = 0.35 + 0.6 * max(0.0, -0.55 * math.sin(mid) + 0.83 * math.cos(mid))
        walls.append((sum(p[2] for p in quad), quad, light))
    walls.sort(key=lambda w: w[0], reverse=True)
    for _, quad, light in walls:
        polygon(quad, rgb(fm.shade(colour, light)))
    lid = [camera.project(x, RADAR_HEIGHT, z) for x, z in base]
    polygon(lid, rgb(colour, 150))
    polygon(lid, accent, 1)
    for point in lid:
        screen.pen = WHITE
        screen.shape(shape.circle(point[0] + DX, point[1], 2.5))

    # Labels just outside the outer ring, dimmed while they face away.
    for i, (name, value) in enumerate(categories):
        x, z = fm.radar_spoke(i, count, 1.36)
        px, py, depth = camera.project(x, 0, z)
        label = "%s %d" % (name, value)
        half = text_width(label, 8) / 2
        px = max(126 + half, min(WIDTH - 6 - half, px))
        text_centre(label, px, py - 4, 8, LIGHT if depth < 0.2 else DIM)

    score_footer(data)


def spider_point(cx, cy, index, count, radius):
    x, z = fm.radar_spoke(index, count, radius)
    return (cx + x, cy + z)


def draw_spider(data, colour, demo, elapsed, now, hint):
    """The score as a flat spider chart that a radar arm sweeps into view: the
    rings grow out of the centre, then the arm turns once and each category
    pops out to its stage with a blip as the arm passes it. Afterwards the arm
    keeps turning faintly and the shape breathes. `colour` is (r, g, b)."""
    categories = data["categories"][:6]
    accent = rgb(colour)
    score_header(data, accent, demo)
    score_column(data, categories, accent, hint)

    cx, cy, radius = 222, 126, 64
    count = len(categories)
    floor = SPIDER_FLOOR

    # The web: one ring per stage and a spoke per category, growing outwards.
    for level in range(1, fd.MAX_STAGE + 1):
        grow = fm.stagger(elapsed, level - 1, SPIDER_RING_STAGGER_MS, SPIDER_RING_MS)
        if grow <= 0:
            continue
        r = radius * (floor + (1 - floor) * level / fd.MAX_STAGE) * grow
        ring = [spider_point(cx, cy, i, count, r) for i in range(count)]
        polygon(ring, DIM if level == fd.MAX_STAGE else TRACK, 1)
    reach = radius * fm.stagger(elapsed, fd.MAX_STAGE - 1, SPIDER_RING_STAGGER_MS, SPIDER_RING_MS)
    for i in range(count):
        line((cx, cy), spider_point(cx, cy, i, count, reach), 1, TRACK)

    sweep = elapsed - SPIDER_SWEEP_START_MS
    if sweep < 0:
        score_footer(data)
        return

    # The arm with a fading trail behind it; faint once the first turn is done.
    turn = fm.sweep_fraction(sweep, SPIDER_SWEEP_MS, SPIDER_IDLE_MS)
    angle = 2 * math.pi * turn
    strength = 1.0 if sweep < SPIDER_SWEEP_MS else 0.4
    steps = 5
    for step in range(steps):
        a0 = angle - SPIDER_TRAIL * (step + 1) / steps
        a1 = angle - SPIDER_TRAIL * step / steps
        alpha = int(80 * strength * (1 - step / steps))
        polygon([(cx, cy)] + fm.arc_points(cx, cy, radius, a0, a1, 2), rgb(colour, alpha))
    line((cx, cy), spider_point(cx, cy, turn * count, count, radius), 2, rgb(colour, int(255 * strength)))

    # The data shape: each vertex pops out as the arm passes its spoke.
    points = []
    reveals = []
    for i, (_, value) in enumerate(categories):
        reveal = fm.spoke_reveal(sweep, i, count, SPIDER_SWEEP_MS, SPIDER_POP_MS)
        reveals.append(reveal)
        points.append(spider_point(cx, cy, i, count, radius * (floor + (1 - floor) * value / fd.MAX_STAGE) * reveal))
    if max(reveals) > 0:
        polygon(points, rgb(colour, int(60 + 40 * fm.pulse(now, 2400))))
        polygon(points, accent, 2)

    # Blips, dots and labels on the spokes that have been swept.
    for i, (name, value) in enumerate(categories):
        reveal = reveals[i]
        if reveal <= 0:
            continue
        pop = fm.clamp01((sweep - SPIDER_SWEEP_MS * i / count) / SPIDER_POP_MS)
        px, py = points[i]
        if pop < 1:
            screen.pen = rgb(colour, int(120 * (1 - pop)))
            screen.shape(shape.circle(px + DX, py, 3 + 10 * fm.ease_out(pop)))
        screen.pen = WHITE
        screen.shape(shape.circle(px + DX, py, 2.5 * min(1.0, reveal)))
        lx, ly = spider_point(cx, cy, i, count, radius * 1.32)
        label = "%s %d" % (name, value)
        half = text_width(label, 8) / 2
        lx = max(126 + half, min(WIDTH - 6 - half, lx))
        text_centre(label, lx, ly - 4, 8, color.rgb(201, 209, 217, int(255 * pop)))

    score_footer(data)


def history_header(data, accent, index, metric, motion):
    days = data["days"]
    text("Last 30 days", MARGIN, 9, 12, accent)
    text_right("UP/DOWN: " + ("sessions" if metric == 1 else "tokens"), WIDTH - MARGIN, 11, 8, DIM)
    date, tokens, sessions = days[index]
    count_up = motion.grow(0) if motion else 1.0
    big = fd.compact(int(tokens * count_up)) if metric == 0 else str(int(sessions * count_up))
    text(big, MARGIN, 26, 26, WHITE)
    detail = ("tokens  %d sessions" % sessions) if metric == 0 else ("sessions  %s tokens" % fd.compact(tokens))
    text(detail, MARGIN + text_width(big, 26) + 7, 38, 10, LIGHT)
    text_right(fd.day_label(date), WIDTH - MARGIN, 36, 11, accent)


def history_footer(values, metric):
    average = sum(values) // len(values)
    footer("avg %s/day" % (fd.compact(average) if metric == 0 else str(average)), "tilt to scrub")


def no_history():
    text("No daily data yet", MARGIN, 60, 12, LIGHT)
    footer("BACK exits", "< > screens")


def draw_history(data, accent, good, cursor, metric, motion=None):
    days = data["days"]
    if not days:
        text("Last 30 days", MARGIN, 9, 12, accent)
        no_history()
        return

    index = max(0, min(len(days) - 1, int(cursor)))
    history_header(data, accent, index, metric, motion)

    top, bottom = 70, 196
    values = [d[1 + metric] for d in days]
    peak = max(values) or 1
    count = len(days)
    step = (WIDTH - MARGIN * 2 + 2) / count
    bar = max(2, int(step - 2))
    recent = count - 7
    if motion:
        # A soft halo that glides to the selected day instead of jumping.
        glow = rgb(motion.accent, int(40 + 70 * fm.pulse(motion.now)))
        box(int(MARGIN + motion.glow * step) - 2, top - 4, bar + 4, bottom - top + 6, glow, 3)
    for i, value in enumerate(values):
        grow = motion.grow(i) if motion else 1.0
        height = max(2, int((bottom - top) * value * grow / peak)) if value else 2
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
    screen.shape(shape.rectangle(MARGIN + DX, bottom + 1, WIDTH - MARGIN * 2, 1))

    text(fd.day_label(days[0][0]), MARGIN, bottom + 5, 8, DIM)
    text_right(fd.day_label(days[-1][0]), WIDTH - MARGIN, bottom + 5, 8, DIM)
    history_footer(values, metric)


WEEKDAY_LETTERS = "MTWTFSS"


def draw_skyline(data, colour, good, cursor, metric, yaw, pitch, now):
    """The 30 days as a 3D contribution graph: a tower per day, a column per
    weekday and a row per week, newest week nearest the viewer. `colour` and
    `good` are (r, g, b), since the towers shade them."""
    days = data["days"]
    accent = rgb(colour)
    if not days:
        text("Last 30 days", MARGIN, 9, 12, accent)
        no_history()
        return

    index = max(0, min(len(days) - 1, int(cursor)))
    history_header(data, accent, index, metric, None)

    cells = fm.skyline_cells(days)
    rows = cells[-1][1] + 1
    values = [d[1 + metric] for d in days]
    peak = max(values) or 1
    camera = fm.Camera(160, 132, 26, yaw, pitch, 16.0)
    size = 0.74
    tallest = 1.7
    recent = len(days) - 7

    def place(column, row):
        return column - 3.5, (rows - 1) / 2.0 - row

    # A floor plate under the city.
    reach = (rows + 0.2) / 2.0
    plate = [camera.project(x, 0, z) for x, z in ((-3.7, -reach), (-3.7, reach), (3.7, reach), (3.7, -reach))]
    polygon(plate, rgb((33, 38, 45), 200))

    towers = []
    for i, (column, row) in enumerate(cells):
        x, z = place(column, row)
        depth = camera.project(x, 0, z)[2]
        towers.append((depth, i, x, z))
    towers.sort(key=lambda t: t[0], reverse=True)

    for _, i, x, z in towers:
        value = values[i]
        height = max(0.04, tallest * value / peak) if value else 0.04
        if i == index:
            tint = (238, 242, 246)
        elif value == 0:
            tint = (48, 54, 61)
        else:
            tint = colour if i >= recent else good
        lid = None
        for side, (corners, light) in enumerate(fm.box_faces(x - size / 2, z - size / 2, size, size, height)):
            face = [camera.project(*p) for p in corners]
            if fm.faces_viewer(face):
                polygon(face, rgb(fm.shade(tint, light)))
                if side == 0:
                    lid = face
        if i == index and lid:
            polygon(lid, rgb(colour, int(120 + 135 * fm.pulse(now))), 1)

    # Weekday letters along the front edge.
    for column in range(7):
        x, z = place(column, rows - 1)
        px, py, _ = camera.project(x, 0, z - 0.85)
        text_centre(WEEKDAY_LETTERS[column], px, py - 4, 8, DIM)

    history_footer(values, metric)


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
    screen.blit(code, vec2(plate_x + 4 + DX, plate_y + 4))

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


def draw_sync(store, accent, look):
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

    box(MARGIN, 92, WIDTH - MARGIN * 2, 34, TRACK, 6)
    text("Look", MARGIN + 8, 97, 8, DIM)
    text("< %s >" % fm.look_label(look), MARGIN + 8, 108, 12, WHITE)
    text_right("UP/DOWN changes", WIDTH - MARGIN - 8, 110, 8, DIM)

    y = 136
    if store.data and not store.demo:
        lines = ("Tap SELECT on any screen to change the look.",
                 "Copy a new fluency.json over USB to refresh.")
    else:
        lines = ("Copy fluency.json to /state over USB:",
                 "mpremote fs cp fluency.json :/state/fluency.json",
                 "SELECT: " + ("back to your data" if store.demo else "show demo data"))
    for value in lines:
        y = text_block(wrap(value, WIDTH - MARGIN * 2, 9), MARGIN, y, 9, LIGHT) + 4
    footer("MENU opens this screen", "BACK " + ("returns" if store.data else "exits"))


def draw_toast(message, age):
    fade = 1.0 - fm.clamp01((age - (TOAST_MS - 300)) / 300)
    width = text_width(message, 10) + 24
    x = (WIDTH - width) // 2
    box(x, HEIGHT - 50, width, 22, color.rgb(48, 54, 61, int(235 * fade)), 11)
    text_centre(message, WIDTH / 2, HEIGHT - 45, 10, color.rgb(238, 242, 246, int(255 * fade)))


def draw_sweep(accent, age):
    x = -50 + (WIDTH + 100) * fm.ease_in_out(age / SWEEP_MS)
    box(int(x), 0, 50, HEIGHT, rgb(accent, 45), 0)


# ── looks ─────────────────────────────────────────────────────────────────

def load_look():
    try:
        with open(LOOK_FILE) as source:
            return fm.parse_look(source.read(256))
    except OSError:
        return fm.DEFAULT_LOOK


def save_look(index):
    try:
        with open(LOOK_FILE, "w") as target:
            target.write(fm.dump_look(index))
    except OSError as error:
        print("fluency: could not save the look -", error)


# ── app ───────────────────────────────────────────────────────────────────

SCREENS = ("score", "history", "qr_repo", "qr_linkedin")


class App:
    def __init__(self):
        self.store = Store()
        self.tilt = Tilt()
        self.screen = 0
        self.show_sync = False
        self.metric = 0
        self.chart = False  # score screen: the spider chart instead of the bars / 3D radar
        self.cursor = None
        self.look = load_look()
        self.previous = None  # screen sliding out in the Motion look
        self.slide_start = 0
        self.slide_direction = 1
        self.entered = badge.ticks  # when the current screen (or look) appeared, for the grow-in
        self.glow = 0.0
        self.sweep_start = None
        self.toast_start = None
        self.yaw = 0.0
        self.select_armed = False  # SELECT went down on a main screen...
        self.select_moved = False  # ...and was then used to step the history cursor

    def flip(self, step):
        self.previous = self.screen
        self.screen = (self.screen + step) % len(SCREENS)
        self.slide_start = badge.ticks
        self.slide_direction = step
        self.entered = badge.ticks

    def set_look(self, index):
        self.look = index
        save_look(index)
        self.toast_start = badge.ticks
        self.entered = badge.ticks
        self.previous = None

    def handle_input(self):
        data = self.store.data
        if self.show_sync or data is None:
            self.select_armed = False
            if badge.pressed(BUTTON_UP) or badge.pressed(BUTTON_DOWN):
                self.set_look(fm.next_look(self.look, -1 if badge.pressed(BUTTON_UP) else 1))
            if badge.pressed(BUTTON_SELECT) and (data is None or self.store.demo):
                self.store.toggle_demo()
                self.cursor = None
                self.entered = badge.ticks
            elif badge.pressed(BUTTON_BACK):
                if data is None:
                    return False
                self.show_sync = False
                self.entered = badge.ticks
            return True

        if badge.pressed(BUTTON_BACK):
            return False
        if badge.pressed(BUTTON_MENU):
            self.show_sync = True
            return True

        if badge.pressed(BUTTON_SELECT):
            self.select_armed = True
            self.select_moved = False
        on_history = SCREENS[self.screen] == "history"
        selecting = badge.held(BUTTON_SELECT)
        if on_history and selecting:
            # SELECT + LEFT/RIGHT steps the cursor: the scrub control for simulators without an IMU.
            if badge.pressed(BUTTON_LEFT):
                self.cursor = (self.cursor or 0) - 1
                self.select_moved = True
            if badge.pressed(BUTTON_RIGHT):
                self.cursor = (self.cursor or 0) + 1
                self.select_moved = True
        else:
            if badge.pressed(BUTTON_LEFT):
                self.flip(-1)
            if badge.pressed(BUTTON_RIGHT):
                self.flip(1)
        if badge.pressed(BUTTON_UP) or badge.pressed(BUTTON_DOWN):
            if on_history:
                self.metric = 1 - self.metric
            elif SCREENS[self.screen] == "score":
                self.chart = not self.chart
                self.entered = badge.ticks
        if badge.released(BUTTON_SELECT):
            # A tap (not a scrub) switches the look.
            if self.select_armed and not self.select_moved:
                self.set_look(fm.next_look(self.look))
            self.select_armed = False
        return True

    def scrub(self, days):
        if self.cursor is None:
            self.cursor = float(days - 1)
            self.glow = self.cursor
        if SCREENS[self.screen] == "history":
            amount = abs(self.tilt.x)
            if amount > TILT_DEAD_ZONE:
                speed = (amount - TILT_DEAD_ZONE) / (1 - TILT_DEAD_ZONE) * TILT_DAYS_PER_SECOND
                direction = TILT_DIRECTION if self.tilt.x > 0 else -TILT_DIRECTION
                self.cursor += direction * speed * badge.ticks_delta / 1000
        self.cursor = max(0.0, min(float(days - 1), self.cursor))
        self.glow = fm.approach(self.glow, int(self.cursor), badge.ticks_delta, 70)

    def animate(self, data):
        """Advance tilt, scrub and the radar's spin once per frame, whatever is drawn."""
        name = SCREENS[self.screen]
        look = fm.LOOKS[self.look]
        radar = name == "score" and look == "radar" and not self.chart
        if name == "history" or radar:
            self.tilt.update()
        if name == "history":
            self.scrub(max(1, len(data["days"])))
        if radar:
            spin = RADAR_SPIN + self.tilt.x * RADAR_TILT_SPIN
            self.yaw = (self.yaw + spin * badge.ticks_delta / 1000) % (2 * math.pi)

    def pitch(self, base):
        return max(0.2, min(1.3, base + self.tilt.y * TILT_PITCH))

    def draw_screen(self, index, data, colour, motion):
        name = SCREENS[index]
        look = fm.LOOKS[self.look]
        accent = rgb(colour)
        if name == "score":
            radar = look == "radar" and len(data["categories"]) >= 3
            if self.chart and len(data["categories"]) >= 3:
                draw_spider(data, colour, self.store.demo, badge.ticks - self.entered, badge.ticks,
                            "UP/DOWN: " + ("3D radar" if radar else "bars"))
            elif radar:
                draw_radar(data, colour, self.store.demo, self.yaw, self.pitch(0.62), "UP/DOWN: spider chart")
            else:
                draw_score(data, accent, self.store.demo, motion)
        elif name == "history":
            if look == "skyline":
                sway = 0.22 * math.sin(badge.ticks / 2600)
                draw_skyline(data, colour, data["good"], self.cursor or 0, self.metric,
                             sway, self.pitch(0.85), badge.ticks)
            else:
                draw_history(data, accent, rgb(data["good"]), self.cursor or 0, self.metric, motion)
        elif name == "qr_repo":
            draw_qr_repo(accent)
        else:
            draw_qr_linkedin(accent)

    def update(self):
        global DX
        now = badge.ticks
        if self.store.poll(now):
            if not self.store.demo:
                self.cursor = None
            if self.store.data:
                self.sweep_start = now
        if not self.handle_input():
            return False

        data = self.store.data
        screen.pen = BACKGROUND
        screen.clear()
        accent_rgb = data["accent"] if data else fd.DEFAULT_ACCENT
        accent = rgb(accent_rgb)

        if self.show_sync or data is None:
            draw_sync(self.store, accent, self.look)
        else:
            self.animate(data)
            moving = fm.LOOKS[self.look] == "motion"
            motion = Motion(now - self.entered, now, self.glow, accent_rgb) if moving else None
            sliding = moving and self.previous is not None and now - self.slide_start < TRANSITION_MS
            if sliding:
                eased = fm.ease_in_out((now - self.slide_start) / TRANSITION_MS)
                DX = int(-self.slide_direction * WIDTH * eased)
                self.draw_screen(self.previous, data, accent_rgb, None)
                DX = int(self.slide_direction * WIDTH * (1 - eased))
                self.draw_screen(self.screen, data, accent_rgb, motion)
                DX = 0
            else:
                self.previous = None
                self.draw_screen(self.screen, data, accent_rgb, motion)
            if moving and self.sweep_start is not None and now - self.sweep_start < SWEEP_MS:
                draw_sweep(accent_rgb, now - self.sweep_start)

        if self.toast_start is not None and now - self.toast_start < TOAST_MS:
            draw_toast("Look: " + fm.look_label(self.look), now - self.toast_start)
        return None


app = App()
run(app.update)
