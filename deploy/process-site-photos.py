#!/usr/bin/env python3
"""Generate responsive JPEG/WebP variants for hero and service photos."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WIDTHS = [480, 768, 960, 1280, 1920]

# source filename (in uploads/) -> output stem under img/
SOURCES: dict[str, str] = {
    "img/hero/hero-main": "023A2834.jpg",
    "img/hero/hero-alt": "023A2534.jpg",
    "img/services/service-concept": "023A2841.jpg",
    "img/services/service-design": "023A2674.jpg",
    "img/services/service-viz3d": "023A3565.jpg",
    "img/services/service-video": "023A2476.jpg",
    "img/services/service-production": "023A4895.jpg",
    "img/services/service-staff": "023A1016.jpg",
    "img/services/service-staff-alt": "023A7386.jpg",
}


def resize_to_width(img: Image.Image, width: int) -> Image.Image:
    if img.width <= width:
        return img.copy()
    height = max(1, round(img.height * (width / img.width)))
    return img.resize((width, height), Image.Resampling.LANCZOS)


def main() -> None:
    upload = ROOT / "uploads"
    if not upload.is_dir():
        upload = Path.cwd() / "uploads"
    for out_base, src_name in SOURCES.items():
        candidates = list(upload.glob(f"{Path(src_name).stem}*"))
        if not candidates:
            raise SystemExit(f"Missing source for {out_base}: {src_name}")
        src = candidates[0]
        out_dir = ROOT / Path(out_base).parent
        out_dir.mkdir(parents=True, exist_ok=True)
        stem = Path(out_base).name
        img = Image.open(src).convert("RGB")
        seen: set[int] = set()
        for w in WIDTHS:
            tw = min(w, img.width)
            if tw in seen:
                continue
            seen.add(tw)
            scaled = resize_to_width(img, tw)
            scaled.save(out_dir / f"{stem}-{tw}w.jpg", "JPEG", quality=82, optimize=True, progressive=True)
            scaled.save(out_dir / f"{stem}-{tw}w.webp", "WEBP", quality=82, method=6)
        print(out_base, "<-", src.name)


if __name__ == "__main__":
    main()
