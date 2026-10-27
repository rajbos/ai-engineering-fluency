# Looks, easing and 3D projection for the badge app's animated views.
# Pure Python with no badge APIs, so it runs (and is tested) on a laptop too.

import json
import math

# The three looks the wearer can switch between on the badge.
LOOKS = ("motion", "radar", "skyline")
LOOK_LABELS = {"motion": "Motion", "radar": "3D radar", "skyline": "3D skyline"}
DEFAULT_LOOK = 0


def next_look(index, step=1):
    return (index + step) % len(LOOKS)


def look_label(index):
    return LOOK_LABELS[LOOKS[index % len(LOOKS)]]


def parse_look(text):
    """The saved look file's text -> look index; anything unreadable gives the default."""
    try:
        raw = json.loads(text)
    except (ValueError, TypeError):
        return DEFAULT_LOOK
    name = raw.get("look") if isinstance(raw, dict) else None
    return LOOKS.index(name) if name in LOOKS else DEFAULT_LOOK


def dump_look(index):
    return json.dumps({"look": LOOKS[index % len(LOOKS)]})


# ── easing ────────────────────────────────────────────────────────────────

def clamp01(value):
    return 0.0 if value < 0 else 1.0 if value > 1 else value


def ease_out(t):
    """Cubic ease-out: fast start, gentle landing."""
    t = 1 - clamp01(t)
    return 1 - t * t * t


def ease_in_out(t):
    t = clamp01(t)
    return 4 * t * t * t if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def stagger(elapsed_ms, index, delay_ms, duration_ms):
    """Eased 0..1 progress of item `index` in a staggered entrance animation."""
    return ease_out((elapsed_ms - index * delay_ms) / duration_ms)


def approach(current, target, dt_ms, time_constant_ms):
    """Move `current` towards `target` with exponential smoothing, frame-rate independent."""
    return current + (target - current) * (1 - math.exp(-max(0, dt_ms) / time_constant_ms))


def pulse(ticks_ms, period_ms=1200):
    """0..1..0 sine pulse."""
    return 0.5 - 0.5 * math.cos(2 * math.pi * (ticks_ms % period_ms) / period_ms)


def ease_out_back(t, overshoot=1.70158):
    """Ease-out that overshoots its target a little before settling: a pop."""
    if t <= 0:
        return 0.0
    t = clamp01(t) - 1
    return 1 + t * t * ((overshoot + 1) * t + overshoot)


def reload_cycle(elapsed_ms, period_ms):
    """(cycle, ms into that cycle) for an animation that replays every `period_ms`."""
    if elapsed_ms <= 0:
        return 0, 0
    return int(elapsed_ms // period_ms), elapsed_ms % period_ms


def cycle_colour(first, palette, cycle):
    """The colour for reload number `cycle`: `first` on the first load, then each
    colour of `palette` in turn, so every reload looks different."""
    return first if cycle <= 0 else palette[(cycle - 1) % len(palette)]


def shade(rgb, factor):
    """Scale a colour's brightness; factor > 1 brightens, clamped to 0..255."""
    return tuple(max(0, min(255, int(c * factor))) for c in rgb)


def mix(a, b, t):
    t = clamp01(t)
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


# ── 3D ────────────────────────────────────────────────────────────────────

class Camera:
    """A turntable camera: spins the world by `yaw` about the vertical axis,
    then looks down at it from `pitch` above the horizon, with perspective.

    World axes: x right, y up, z away from the viewer. Angles are radians.
    """

    def __init__(self, cx, cy, scale, yaw=0.0, pitch=0.5, distance=6.0):
        self.cx = cx
        self.cy = cy
        self.scale = scale
        self.distance = distance
        self.set_angles(yaw, pitch)

    def set_angles(self, yaw, pitch):
        self.yaw = yaw
        self.pitch = pitch
        self._cy, self._sy = math.cos(yaw), math.sin(yaw)
        self._cp, self._sp = math.cos(pitch), math.sin(pitch)

    def project(self, x, y, z):
        """World point -> (screen x, screen y, depth). Larger depth is further away."""
        x1 = x * self._cy - z * self._sy
        z1 = x * self._sy + z * self._cy
        y2 = y * self._cp + z1 * self._sp
        z2 = z1 * self._cp - y * self._sp
        s = self.scale * self.distance / max(0.5, self.distance + z2)
        return (self.cx + x1 * s, self.cy - y2 * s, z2)


def signed_area(points):
    """Twice the signed area of a 2D polygon in screen coordinates (y down).
    Positive means the points run clockwise on screen."""
    total = 0.0
    count = len(points)
    for i in range(count):
        x0, y0 = points[i][0], points[i][1]
        x1, y1 = points[(i + 1) % count][0], points[(i + 1) % count][1]
        total += x0 * y1 - x1 * y0
    return total


def faces_viewer(points):
    """True when a face is turned towards the camera. Faces list their vertices
    clockwise as seen from outside the solid, so a face seen from behind runs
    anticlockwise on screen and is culled."""
    return signed_area(points) > 0


def box_faces(x, z, w, d, h):
    """The five visible-candidate faces of an axis-aligned box standing on y=0.

    Returns (vertices, light) pairs; vertices run clockwise seen from
    outside, so faces_viewer() culls the far sides. `light` is a brightness
    factor for flat shading: the top is brightest, the sides darker.
    """
    x1, z1 = x + w, z + d
    return (
        (((x, h, z), (x, h, z1), (x1, h, z1), (x1, h, z)), 1.0),       # top
        (((x, 0, z), (x, h, z), (x1, h, z), (x1, 0, z)), 0.62),        # front (towards viewer)
        (((x1, 0, z1), (x1, h, z1), (x, h, z1), (x, 0, z1)), 0.62),    # back
        (((x, 0, z1), (x, h, z1), (x, h, z), (x, 0, z)), 0.45),        # left
        (((x1, 0, z), (x1, h, z), (x1, h, z1), (x1, 0, z1)), 0.78),    # right
    )


def radar_spoke(index, count, radius):
    """(x, z) of radar spoke `index` of `count`, with spoke 0 pointing at the viewer."""
    angle = 2 * math.pi * index / count
    return (radius * math.sin(angle), -radius * math.cos(angle))


def radar_polygon(values, max_value, floor=0.12):
    """(x, z) vertices of the data polygon; a zero value still gets a small floor
    so the shape never collapses to a point."""
    count = len(values)
    return [radar_spoke(i, count, floor + (1 - floor) * min(v, max_value) / max_value) for i, v in enumerate(values)]


# ── spider chart ──────────────────────────────────────────────────────────

def sweep_fraction(elapsed_ms, intro_ms, idle_period_ms):
    """Where a radar arm points, as a fraction of a clockwise turn from straight
    up: one even turn during the intro, so the spokes light up in order, then
    slower endless turns. Negative time keeps the arm at the start."""
    if elapsed_ms <= 0:
        return 0.0
    if elapsed_ms < intro_ms:
        return elapsed_ms / intro_ms
    return ((elapsed_ms - intro_ms) / idle_period_ms) % 1.0


def spoke_reveal(elapsed_ms, index, count, intro_ms, pop_ms):
    """0..1 (briefly a little over 1) how far spoke `index` of `count` has popped
    out, starting the moment the intro sweep passes it."""
    return ease_out_back((elapsed_ms - intro_ms * index / count) / pop_ms)


def sonar_ping(elapsed_ms, index, count, period_ms):
    """(radius fraction 0..1, strength 1..0) of sonar ring `index` of `count`: each
    ring leaves the centre in turn, evenly spread over `period_ms`, and fades as it
    reaches the rim. None while the ring has not started (negative time)."""
    if elapsed_ms < 0:
        return None
    phase = ((elapsed_ms - period_ms * index / count) % period_ms) / period_ms
    return ease_out(phase), (1 - phase) ** 2


def arc_points(cx, cy, radius, start, end, steps):
    """Points along a circle from angle `start` to `end` (radians, clockwise
    from straight up on screen), as `steps` straight segments."""
    points = []
    for i in range(steps + 1):
        angle = start + (end - start) * i / steps
        points.append((cx + radius * math.sin(angle), cy - radius * math.cos(angle)))
    return points


# ── skyline ───────────────────────────────────────────────────────────────

def weekday(date):
    """'2026-10-23' -> 0 for Monday .. 6 for Sunday, or None if it is not a date."""
    try:
        year, month, day = int(date[0:4]), int(date[5:7]), int(date[8:10])
    except (ValueError, IndexError, TypeError):
        return None
    if not (1 <= month <= 12 and 1 <= day <= 31):
        return None
    # Sakamoto's method; 0 = Sunday.
    offsets = (0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4)
    if month < 3:
        year -= 1
    sunday_first = (year + year // 4 - year // 100 + year // 400 + offsets[month - 1] + day) % 7
    return (sunday_first + 6) % 7


def skyline_cells(days):
    """Lay the days out like a contribution graph: (column, row) per day, with a
    column per weekday (Monday first) and a row per week, oldest week first.
    Falls back to plain rows of seven when the first date cannot be read."""
    if not days:
        return []
    start = weekday(days[0][0])
    if start is None:
        start = 0
    return [((start + i) % 7, (start + i) // 7) for i in range(len(days))]
