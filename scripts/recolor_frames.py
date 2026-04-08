from PIL import Image
import colorsys

SRC = r"assets/_raw/pixellab/cards/frame-attack-pass-3-minimal.png"
OUT_DEF = r"assets/_raw/pixellab/cards/frame-defense-pass-3-minimal.png"
OUT_UTL = r"assets/_raw/pixellab/cards/frame-utility-pass-3-minimal.png"


def recolor(src_path: str, out_path: str, target_hue: float) -> None:
    img = Image.open(src_path).convert("RGBA")
    px = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue

            rf, gf, bf = r / 255.0, g / 255.0, b / 255.0
            h0, s0, v0 = colorsys.rgb_to_hsv(rf, gf, bf)

            # Recolor only saturated warm accents (reds/oranges) and keep neutral metals/greys untouched.
            warm_band = (h0 < 0.11) or (h0 > 0.94)
            if warm_band and s0 > 0.24 and v0 > 0.16:
                # Preserve value and most saturation so readability remains intact.
                nr, ng, nb = colorsys.hsv_to_rgb(target_hue, max(0.18, s0 * 0.95), v0)
                px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)

    img.save(out_path)


if __name__ == "__main__":
    # Blue ~= 215 deg, Green ~= 125 deg.
    recolor(SRC, OUT_DEF, 215 / 360)
    recolor(SRC, OUT_UTL, 125 / 360)
