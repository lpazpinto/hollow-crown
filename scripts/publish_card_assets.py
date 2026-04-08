from pathlib import Path
import shutil
from collections import deque

from PIL import Image

from create_rarity_overlays import make_outer_background_transparent

RAW_DIR = Path("assets/_raw/pixellab/cards")
OUT_DIR = Path("public/assets/cards")

RAW_COPIES = {
    "rarity-overlay-common.png": "rarity-overlay-common.png",
    "rarity-overlay-uncommon.png": "rarity-overlay-uncommon.png",
    "rarity-overlay-rare.png": "rarity-overlay-rare.png",
    "rarity-gems-uncommon.png": "rarity-gems-uncommon.png",
    "rarity-gems-rare.png": "rarity-gems-rare.png",
    "unicorn-strike-refine-targeted.png": "art-unicorn-strike.png",
    "golden-shield-refine-targeted.png": "art-golden-shield.png",
    "charge-refine-targeted.png": "art-charge.png",
    "crown-diamonds-refine-targeted.png": "art-crown-diamonds.png",
}

FRAME_SOURCES = {
    "frame-attack-pass-3-minimal.png": "frame-attack.png",
    "frame-defense-pass-3-minimal.png": "frame-defense.png",
    "frame-utility-pass-3-minimal.png": "frame-utility.png",
}


def publish_raw_assets() -> None:
    for src_name, out_name in RAW_COPIES.items():
        src = RAW_DIR / src_name
        dst = OUT_DIR / out_name
        shutil.copy2(src, dst)


def cleanup_art_background(image: Image.Image, tolerance: int = 14) -> Image.Image:
    img = image.convert("RGBA")
    px = img.load()
    w, h = img.size

    bg_candidates = [
        px[0, 0][:3],
        px[w - 1, 0][:3],
        px[0, h - 1][:3],
        px[w - 1, h - 1][:3],
    ]
    bg = tuple(sum(c[i] for c in bg_candidates) // len(bg_candidates) for i in range(3))

    alpha = img.getchannel("A")
    q: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()

    # 1) Remove edge-connected matte pixels.
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        if (x, y) in visited:
            continue
        visited.add((x, y))

        r, g, b, a = px[x, y]
        if a == 0:
            continue

        if max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2])) > tolerance:
            continue

        alpha.putpixel((x, y), 0)

        if x > 0:
            q.append((x - 1, y))
        if x < w - 1:
            q.append((x + 1, y))
        if y > 0:
            q.append((x, y - 1))
        if y < h - 1:
            q.append((x, y + 1))

    # 2) Remove remaining matte pixels globally to clear anti-aliased matte remnants.
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2])) <= tolerance + 4:
                alpha.putpixel((x, y), 0)

    img.putalpha(alpha)
    bbox = img.getchannel("A").getbbox()
    if bbox is not None:
        img = img.crop(bbox)

    return img


def publish_frames() -> None:
    for src_name, out_name in FRAME_SOURCES.items():
        src = RAW_DIR / src_name
        dst = OUT_DIR / out_name
        image = Image.open(src).convert("RGBA")
        cleaned = make_outer_background_transparent(image)
        bbox = cleaned.getchannel("A").getbbox()
        if bbox is not None:
            cleaned = cleaned.crop(bbox)
        cleaned.save(dst)


def publish_cleaned_art() -> None:
    art_files = [
        "art-unicorn-strike.png",
        "art-golden-shield.png",
        "art-charge.png",
        "art-crown-diamonds.png",
    ]

    for name in art_files:
        dst = OUT_DIR / name
        image = Image.open(dst)
        cleaned = cleanup_art_background(image)
        cleaned.save(dst)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    publish_raw_assets()
    publish_frames()
    publish_cleaned_art()


if __name__ == "__main__":
    main()
