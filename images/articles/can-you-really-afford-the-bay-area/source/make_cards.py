#!/usr/bin/env python3
"""Build the share card and homepage poster from the deck's cover slide.

    python images/articles/can-you-really-afford-the-bay-area/source/make_cards.py

Outputs, relative to this file's parent directory:
  share-card.jpg   1200x630   Open Graph / Twitter / deck-card image (padded, so the
                              full title stays visible in a link preview)
  poster.webp       800x1000  homepage featured-sidebar thumbnail (4:5; the whole
                              slide over a blurred enlargement of itself, so the
                              title reads instead of being cropped away)

Both are derived from slides/slide-01.jpg, so replacing that slide with a
higher-resolution export and re-running this is all that is needed to sharpen
the cards. Do not hand-edit the outputs.

An earlier version of this script drew the cards from scratch in SVG using the
modelled price series. That series has been superseded by the deck's FHFA
back-cast, so drawing them here would only create a third set of numbers to keep
in sync. The cover slide is the single source of truth now.
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

OUT = Path(__file__).resolve().parent.parent
SRC = OUT / "slides" / "slide-01.jpg"
BACKDROP = (26, 45, 82)          # the slide's own deep blue, for letterbox bars


def build(size, name, mode="pad", **save):
    """Compose one card from the cover slide.

    `pad` letterboxes onto the slide's own blue - nothing is cropped, so the
    title survives a link preview.

    `poster` is for the 4:5 homepage thumbnail, where letterbox bars would waste
    more than half the frame and a straight crop would slice the title in two.
    The full slide sits over a blurred, darkened enlargement of itself: the
    frame fills, and every word still reads.
    """
    src = Image.open(SRC).convert("RGB")
    if mode == "pad":
        card = ImageOps.pad(src, size, method=Image.LANCZOS, color=BACKDROP,
                            centering=(0.5, 0.5))
    else:
        card = ImageOps.fit(src, size, method=Image.LANCZOS, centering=(0.5, 0.35))
        card = card.filter(ImageFilter.GaussianBlur(28))
        card = ImageEnhance.Brightness(card).enhance(0.62)
        w = size[0]
        slide = src.resize((w, round(w * src.height / src.width)), Image.LANCZOS)
        card.paste(slide, (0, (size[1] - slide.height) // 2))
    card.save(OUT / name, **save)
    print(f"wrote {OUT / name}  {size[0]}x{size[1]}  {(OUT / name).stat().st_size:,} bytes")


if __name__ == "__main__":
    if not SRC.exists():
        raise SystemExit(f"missing {SRC}")
    # The cover is photographic, so JPEG rather than PNG - a PNG of it runs ~750KB.
    build((1200, 630), "share-card.jpg", "pad", format="JPEG", quality=88, optimize=True,
          progressive=True)
    build((800, 1000), "poster.webp", "poster", format="WEBP", quality=88, method=6)
