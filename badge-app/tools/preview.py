"""Run the badge app on a laptop and save each screen as a PNG.

This stubs the subset of the Universe 2026 badge runtime that the fluency app
uses (screen, shape, color, image, font, badge input) with Pillow, executes the
real app code, steps through the screens with scripted button presses, and
writes one PNG per screen. It is a layout and smoke test, not an emulator:
fonts, antialiasing and colours differ from the real LCD, and the IMU is
simulated.

Usage (from the repo root):

    pip install pillow
    python badge-app/tools/preview.py                      # uses the app's sample data
    python badge-app/tools/preview.py --data my.json       # your own fluency.json
    python badge-app/tools/preview.py --out preview --scale 2
"""

import argparse
import os
import shutil
import tempfile
import types

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APP_DIR = os.path.join(ROOT, "badge-app", "fluency")
FONT_CANDIDATES = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
)

BUTTONS = ("UP", "DOWN", "LEFT", "RIGHT", "SELECT", "BACK", "MENU", "HOME")


class StopApp(Exception):
    pass


class Colour:
    def __init__(self, r, g, b, a=255):
        self.rgba = (int(r), int(g), int(b), int(a))


class Shape:
    def __init__(self, kind, *args):
        self.kind = kind
        self.args = args


class Picture:
    def __init__(self, img):
        self.img = img.convert("RGBA")
        self.width, self.height = self.img.size


class Screen:
    def __init__(self):
        self.width, self.height = 160, 120
        self.pen = Colour(0, 0, 0)
        self.font = None
        self.antialias = None
        self.reset()
        self._fonts = {}
        self._font_path = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)

    def reset(self):
        self.img = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 255))

    def _ttf(self, size):
        size = max(6, int(round(size)))
        if size not in self._fonts:
            self._fonts[size] = ImageFont.truetype(self._font_path, size) if self._font_path else ImageFont.load_default()
        return self._fonts[size]

    def _layer(self):
        layer = Image.new("RGBA", self.img.size, (0, 0, 0, 0))
        return layer, ImageDraw.Draw(layer)

    def _flatten(self, layer):
        self.img.alpha_composite(layer)

    def clear(self):
        self.img = Image.new("RGBA", (self.width, self.height), self.pen.rgba)

    def rectangle(self, x, y=None, w=None, h=None):
        if y is None:
            x, y, w, h = x
        layer, draw = self._layer()
        draw.rectangle((x, y, x + w - 1, y + h - 1), fill=self.pen.rgba)
        self._flatten(layer)

    def shape(self, item):
        layer, draw = self._layer()
        if item.kind == "rectangle":
            x, y, w, h = item.args
            draw.rectangle((x, y, x + w - 1, y + h - 1), fill=self.pen.rgba)
        elif item.kind == "rounded_rectangle":
            x, y, w, h, r = item.args
            draw.rounded_rectangle((x, y, x + max(w, 1) - 1, y + max(h, 1) - 1), radius=min(r, w // 2, h // 2), fill=self.pen.rgba)
        else:
            raise NotImplementedError("preview does not draw shape." + item.kind)
        self._flatten(layer)

    def text(self, value, x, y, size=10):
        layer, draw = self._layer()
        # The badge positions text by its top edge; Pillow's "lt" anchor is the closest match.
        draw.text((x, y), value, font=self._ttf(size), fill=self.pen.rgba, anchor="lt")
        self._flatten(layer)

    def measure_text(self, value, font_size=10):
        box = self._ttf(font_size).getbbox(value, anchor="lt")
        return (box[2] - box[0], box[3] - box[1])

    def blit(self, picture, position):
        self.img.alpha_composite(picture.img, (int(position.x), int(position.y)))


class Badge:
    def __init__(self, screen, script):
        self._screen = screen
        self._script = script
        self.frame = 0
        self.ticks = 0
        self.ticks_delta = 33
        self.tilt_g = 0.0

    def mode(self, flags):
        if flags & 1:
            self._screen.width, self._screen.height = 320, 240
            self._screen.reset()

    def _step(self):
        return self._script[self.frame] if self.frame < len(self._script) else {}

    def pressed(self, button):
        return button in self._step().get("press", ())

    def held(self, button):
        return button in self._step().get("hold", ()) or self.pressed(button)

    def released(self, button):
        return False

    def imu(self):
        ax = -self._step().get("tilt", 0.0) * 16384
        return (ax, 0, 16384, 0, 0, 0)


def runtime(screen, badge_stub, app_dir, state_dir):
    def load_image(path):
        full = path if os.path.isabs(path) else os.path.join(app_dir, path)
        return Picture(Image.open(full))

    def vec2(x, y):
        return types.SimpleNamespace(x=x, y=y)

    env = {
        "__name__": "fluency_preview",
        "FLUENCY_APP_DIR": app_dir,
        "FLUENCY_STATE_DIR": state_dir,
        "badge": badge_stub,
        "screen": screen,
        "image": types.SimpleNamespace(load=load_image, X2=2, X4=4, OFF=0),
        "font": types.SimpleNamespace(load=lambda path: "vector", nope="bitmap"),
        "color": types.SimpleNamespace(rgb=Colour),
        "shape": types.SimpleNamespace(
            rectangle=lambda *a: Shape("rectangle", *a),
            rounded_rectangle=lambda *a: Shape("rounded_rectangle", *a),
        ),
        "vec2": vec2,
        "is_dir": os.path.isdir,
        "file_exists": os.path.exists,
        "HIRES": 1,
        "VSYNC": 2,
    }
    for name in BUTTONS:
        env["BUTTON_" + name] = name
    return env


# Each step is one frame: the buttons pressed or held in it, and an optional tilt in g.
# A step with "shot" saves the screen after that frame.
def script(with_data):
    if not with_data:
        return [{"shot": "0-sync-no-data"}]
    steps = [{"shot": "1-score"}, {"press": ("RIGHT",)}]
    steps += [{"tilt": -0.5} for _ in range(10)]  # tilt left: scrub back a few days
    steps += [{"shot": "2-history"}, {"press": ("UP",)}, {"shot": "2b-history-sessions"}]
    steps += [{"press": ("RIGHT",)}, {"shot": "3-qr-repo"}, {"press": ("RIGHT",)}, {"shot": "4-qr-linkedin"}]
    steps += [{"press": ("MENU",)}, {"shot": "5-sync"}, {"press": ("BACK",)}, {"press": ("BACK",)}]
    return steps


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--data", help="fluency.json to show (default: the app's assets/sample.json)")
    parser.add_argument("--no-data", action="store_true", help="start with no fluency.json, as on a fresh badge")
    parser.add_argument("--out", default=os.path.join(ROOT, "badge-app", "preview"), help="output folder")
    parser.add_argument("--scale", type=int, default=2, help="upscale the 320x240 frames for viewing")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)
    state_dir = tempfile.mkdtemp(prefix="fluency-state-")
    try:
        if not args.no_data:
            shutil.copy(args.data or os.path.join(APP_DIR, "assets", "sample.json"), os.path.join(state_dir, "fluency.json"))

        screen = Screen()
        steps = script(not args.no_data)
        badge_stub = Badge(screen, steps)
        env = runtime(screen, badge_stub, APP_DIR, state_dir)
        saved = []

        def run(update):
            while badge_stub.frame < len(steps):
                if update() is False:
                    break
                shot = steps[badge_stub.frame].get("shot")
                if shot:
                    frame = screen.img.convert("RGB")
                    if args.scale > 1:
                        frame = frame.resize((frame.width * args.scale, frame.height * args.scale), Image.NEAREST)
                    path = os.path.join(args.out, shot + ".png")
                    frame.save(path)
                    saved.append(path)
                badge_stub.frame += 1
                badge_stub.ticks += badge_stub.ticks_delta

        env["run"] = run
        cwd = os.getcwd()
        try:
            with open(os.path.join(APP_DIR, "__init__.py")) as source:
                code = compile(source.read(), os.path.join(APP_DIR, "__init__.py"), "exec")
            exec(code, env)  # noqa: S102 - runs this repo's own app code
        finally:
            os.chdir(cwd)
        for path in saved:
            print("saved", os.path.relpath(path, ROOT))
    finally:
        shutil.rmtree(state_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
