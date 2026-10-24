"""Build the QR code and logo PNGs that the badge app ships in assets/.

The badge draws these images 1:1, so every QR module is a whole number of
pixels. Codes use the high error-correction level (about 30% recoverable),
which leaves room for a logo in the centre.

Usage (from the repo root):

    pip install "qrcode[pil]"
    python badge-app/tools/make_qr.py
    python badge-app/tools/make_qr.py --linkedin-logo path/to/linkedin-in.png

Without --linkedin-logo the LinkedIn code is written without a centre logo.
"""

import argparse
import os

import qrcode
from PIL import Image, ImageDraw
from qrcode.constants import ERROR_CORRECT_H

REPO_URL = "https://github.com/rajbos/ai-engineering-fluency"
LINKEDIN_URL = "https://linkedin.com/in/bosrob"

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSETS = os.path.join(ROOT, "badge-app", "fluency", "assets")
LOGO = os.path.join(ROOT, "assets", "AI Engineering Fluency - Transparent.png")

DARK_TILE = (13, 17, 23)  # matches the app background, #0d1117
QUIET_ZONE = 4  # modules of white around the code, as the QR spec asks


def repo_mark(size):
    """The robot head and bars from the repo logo, without the wordmark, on a dark tile."""
    logo = Image.open(LOGO).convert("RGBA")
    width, height = logo.size
    top = logo.crop((0, 0, width, int(height * 0.68)))
    mark = top.crop(top.getbbox())
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(tile).rounded_rectangle((0, 0, size - 1, size - 1), radius=max(2, size // 6), fill=DARK_TILE + (255,))
    inner = int(size * 0.8)
    scale = inner / max(mark.size)
    mark = mark.resize((max(1, int(mark.width * scale)), max(1, int(mark.height * scale))), Image.LANCZOS)
    tile.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return tile


def plain_logo(path, size):
    logo = Image.open(path).convert("RGBA")
    logo.thumbnail((size, size), Image.LANCZOS)
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    tile.alpha_composite(logo, ((size - logo.width) // 2, (size - logo.height) // 2))
    return tile


def qr_image(url, module_px, logo_tile=None):
    code = qrcode.QRCode(error_correction=ERROR_CORRECT_H, border=QUIET_ZONE, box_size=module_px)
    code.add_data(url)
    code.make(fit=True)
    img = code.make_image(fill_color="black", back_color="white").convert("RGBA")
    if logo_tile is not None:
        # White ring one module wide around the logo keeps its edge from merging into the code.
        ring = logo_tile.width + 2 * module_px
        x = (img.width - ring) // 2
        y = (img.height - ring) // 2
        ImageDraw.Draw(img).rectangle((x, y, x + ring - 1, y + ring - 1), fill="white")
        img.alpha_composite(logo_tile, (x + module_px, y + module_px))
    return img.convert("RGB"), code.modules_count


def logo_size(modules, module_px):
    # About 22% of the code's width: well inside what high error correction can recover.
    return (round(modules * 0.22) | 1) * module_px


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--linkedin-logo", help="PNG of the official LinkedIn 'in' logo")
    parser.add_argument("--out", default=ASSETS, help="output folder (default: the app's assets/)")
    args = parser.parse_args()
    os.makedirs(args.out, exist_ok=True)

    # Module sizes are picked so each code, quiet zone included, fits the 240 px screen height.
    repo_px = 4
    probe = qrcode.QRCode(error_correction=ERROR_CORRECT_H)
    probe.add_data(REPO_URL)
    probe.make(fit=True)
    tile = repo_mark(logo_size(probe.modules_count, repo_px))
    img, modules = qr_image(REPO_URL, repo_px, tile)
    img.save(os.path.join(args.out, "qr_repo.png"), optimize=True)
    print("qr_repo.png: %d modules, %dx%d px" % (modules, img.width, img.height))

    linkedin_px = 5
    tile = None
    if args.linkedin_logo:
        probe = qrcode.QRCode(error_correction=ERROR_CORRECT_H)
        probe.add_data(LINKEDIN_URL)
        probe.make(fit=True)
        tile = plain_logo(args.linkedin_logo, logo_size(probe.modules_count, linkedin_px))
    img, modules = qr_image(LINKEDIN_URL, linkedin_px, tile)
    img.save(os.path.join(args.out, "qr_linkedin.png"), optimize=True)
    print("qr_linkedin.png: %d modules, %dx%d px%s" % (modules, img.width, img.height, "" if tile else ", no logo"))

    # The launcher scales icons into its tile, so 48x48 looks sharper than the 24x24 minimum.
    repo_mark(48).save(os.path.join(args.out, "repo_mark.png"), optimize=True)
    repo_mark(48).save(os.path.join(os.path.dirname(args.out), "icon.png"), optimize=True)
    print("repo_mark.png and icon.png written")


if __name__ == "__main__":
    main()
