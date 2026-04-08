from collections import deque

from PIL import Image, ImageDraw

BASE_PATH = "assets/_raw/pixellab/cards/frame-attack-pass-3-minimal.png"
OUT_DIR = "assets/_raw/pixellab/cards"
BLUE_GEM_PATH = "assets/_raw/pixellab/cards/gems/gem-blue-pixellab.png"
RED_GEM_PATH = "assets/_raw/pixellab/cards/gems/gem-red-pixellab.png"
UNDERLAY_MARGIN = 3


def draw_ring(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], width: int, color: tuple[int, int, int, int], radius: int) -> None:
    draw.rounded_rectangle(box, radius=radius, outline=color, width=width)


def load_gem_sprite(path: str, target_size: int) -> Image.Image:
    gem = Image.open(path).convert("RGBA")
    alpha = gem.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        gem = gem.crop(bbox)
    return gem.resize((target_size, target_size), resample=Image.Resampling.NEAREST)


def get_border_anchor_points(size: tuple[int, int]) -> dict[str, tuple[int, int]]:
    w, h = size
    # Anchor points are kept inside the border band to avoid clipping.
    inset = 7
    far = w - inset - 1
    low = h - inset - 1
    mid_x = w // 2
    mid_y = h // 2
    return {
        "up": (mid_x, inset),
        "down": (mid_x, low),
        "left": (inset, mid_y),
        "right": (far, mid_y),
        "up_right": (far, max(inset + 12, mid_y - 60)),
        "down_left": (inset, min(low - 12, mid_y + 60)),
    }


def get_border_anchor_points_for_body(
    size: tuple[int, int],
    body_bounds: tuple[int, int],
) -> dict[str, tuple[int, int]]:
    w, _ = size
    body_top, body_bottom = body_bounds
    inset_x = 7
    left = inset_x
    right = w - inset_x - 1
    top = body_top + 6
    bottom = body_bottom - 6
    mid_x = w // 2
    mid_y = (top + bottom) // 2
    return {
        "up": (mid_x, top),
        "down": (mid_x, bottom),
        "left": (left, mid_y),
        "right": (right, mid_y),
        "up_right": (right, max(top + 12, mid_y - 60)),
        "down_left": (left, min(bottom - 12, mid_y + 60)),
    }


def place_gem_sprites(
    canvas: Image.Image,
    gem_sprite: Image.Image,
    points: list[tuple[int, int]],
) -> None:
    for x, y in points:
        ox = x - gem_sprite.width // 2
        oy = y - gem_sprite.height // 2
        canvas.alpha_composite(gem_sprite, dest=(ox, oy))


def make_outer_background_transparent(frame: Image.Image, tolerance: int = 10) -> Image.Image:
    """Remove edge-connected solid background so underlays can be seen behind the frame silhouette."""
    img = frame.copy().convert("RGBA")
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

    img.putalpha(alpha)
    return img


def detect_body_vertical_bounds(frame: Image.Image) -> tuple[int, int]:
    """Detect vertical bounds of the main frame body (excluding narrow crown protrusions)."""
    alpha = frame.getchannel("A")
    w, h = frame.size
    data = list(alpha.getdata())
    row_counts = [sum(1 for x in range(w) if data[y * w + x] > 0) for y in range(h)]
    threshold = int(w * 0.8)

    top = next((y for y, c in enumerate(row_counts) if c >= threshold), 0)
    bottom = h - 1 - next((i for i, c in enumerate(reversed(row_counts)) if c >= threshold), 0)
    return top, bottom


def make_common(size: tuple[int, int], body_bounds: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    body_top, body_bottom = body_bounds

    # Larger underlay footprint so it peeks around the frame silhouette.
    draw_ring(d, (0, body_top, w - 1, body_bottom), 3, (120, 88, 52, 170), 22)
    draw_ring(d, (3, body_top + 3, w - 4, body_bottom - 3), 2, (172, 132, 88, 145), 20)

    return img


def make_uncommon(size: tuple[int, int], body_bounds: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    body_top, body_bottom = body_bounds

    # Stronger outer underlay footprint.
    outer_top = max(0, body_top - 3)
    outer_bottom = min(h - 1, body_bottom + 3)
    draw_ring(d, (0, outer_top, w - 1, outer_bottom), 4, (146, 152, 172, 190), 22)
    draw_ring(d, (4, outer_top + 4, w - 5, outer_bottom - 4), 2, (219, 202, 168, 170), 20)

    return img


def make_uncommon_gems(size: tuple[int, int], body_bounds: tuple[int, int]) -> Image.Image:
    img = Image.new("RGBA", size, (0, 0, 0, 0))

    # Uncommon: fixed positions per request (right a little up, left a little down).
    anchors = get_border_anchor_points_for_body(size, body_bounds)
    blue_gem = load_gem_sprite(BLUE_GEM_PATH, target_size=10)
    uncommon_points = [
        (anchors["up_right"][0] + 4, anchors["up_right"][1]),
        (anchors["down_left"][0] - 4, anchors["down_left"][1]),
    ]
    place_gem_sprites(img, blue_gem, uncommon_points)

    return img


def make_rare(size: tuple[int, int], body_bounds: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    body_top, body_bottom = body_bounds

    # Noble outer underlay with strongest presence.
    outer_top = max(0, body_top - 3)
    outer_bottom = min(h - 1, body_bottom + 3)
    draw_ring(d, (0, outer_top, w - 1, outer_bottom), 5, (216, 159, 62, 225), 22)
    draw_ring(d, (4, outer_top + 4, w - 5, outer_bottom - 4), 3, (255, 227, 160, 205), 20)

    return img


def make_rare_gems(size: tuple[int, int], body_bounds: tuple[int, int]) -> Image.Image:
    img = Image.new("RGBA", size, (0, 0, 0, 0))

    # Rare: one gem for each direction with slight asymmetry.
    anchors = get_border_anchor_points_for_body(size, body_bounds)
    red_gem = load_gem_sprite(RED_GEM_PATH, target_size=11)
    rare_points = [
        (anchors["up"][0] - 32, anchors["up"][1] - 4),
        (anchors["down"][0] + 30, anchors["down"][1] + 4),
        (anchors["left"][0] - 4, anchors["left"][1] + 30),
        (anchors["right"][0] + 4, anchors["right"][1] - 28),
    ]
    place_gem_sprites(img, red_gem, rare_points)

    return img


def main() -> None:
    base = Image.open(BASE_PATH).convert("RGBA")
    base_for_preview = make_outer_background_transparent(base)

    # Use tight visible frame bounds so overlay hugs the real frame silhouette.
    bbox = base_for_preview.getchannel("A").getbbox()
    if bbox is None:
        raise RuntimeError("Frame image has no visible pixels after transparency cleanup.")
    visible_frame = base_for_preview.crop(bbox)
    frame_body_top, frame_body_bottom = detect_body_vertical_bounds(visible_frame)

    fw, fh = visible_frame.size
    size = (fw + UNDERLAY_MARGIN * 2, fh + UNDERLAY_MARGIN * 2)
    body_bounds = (
        UNDERLAY_MARGIN + frame_body_top,
        UNDERLAY_MARGIN + frame_body_bottom,
    )

    common = make_common(size, body_bounds)
    uncommon = make_uncommon(size, body_bounds)
    rare = make_rare(size, body_bounds)
    uncommon_gems = make_uncommon_gems(size, body_bounds)
    rare_gems = make_rare_gems(size, body_bounds)

    common.save(f"{OUT_DIR}/rarity-overlay-common.png")
    uncommon.save(f"{OUT_DIR}/rarity-overlay-uncommon.png")
    rare.save(f"{OUT_DIR}/rarity-overlay-rare.png")
    uncommon_gems.save(f"{OUT_DIR}/rarity-gems-uncommon.png")
    rare_gems.save(f"{OUT_DIR}/rarity-gems-rare.png")

    # Optional composited previews for quick visual QA.
    # Order is intentional: rarity overlay first, frame second, so frame appears above overlay.
    # The frame image is fully opaque, so the overlay must be larger than frame bounds to remain visible.
    frame_pos = (UNDERLAY_MARGIN, UNDERLAY_MARGIN)

    common_preview = common.copy()
    common_preview.alpha_composite(visible_frame, dest=frame_pos)
    common_preview.save(f"{OUT_DIR}/rarity-preview-common.png")

    uncommon_preview = uncommon.copy()
    uncommon_preview.alpha_composite(visible_frame, dest=frame_pos)
    uncommon_preview.alpha_composite(uncommon_gems)
    uncommon_preview.save(f"{OUT_DIR}/rarity-preview-uncommon.png")

    rare_preview = rare.copy()
    rare_preview.alpha_composite(visible_frame, dest=frame_pos)
    rare_preview.alpha_composite(rare_gems)
    rare_preview.save(f"{OUT_DIR}/rarity-preview-rare.png")


if __name__ == "__main__":
    main()
