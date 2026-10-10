#!/usr/bin/env python3
"""Build application-specific PNG icons from pinned project assets.

No remote scripts are executed. Original logos are downloaded from raw GitHub
and checked against their expected Git blob SHAs before image decoding.
"""
from __future__ import annotations

import hashlib
import io
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

import cairosvg
import requests
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
ASSET_MAP = ROOT / "scripts" / "kejilion_icon_sources.json"
DEST = ROOT / "apphub"
SIZE = 256

CUSTOM = {
    "arena-brawl": ("AB", "#AE432B", "#FFE9CA"),
    "bomb-party": ("BP", "#E19A26", "#241F22"),
    "ice-climber-arena": ("ICE", "#317BB8", "#DBF3FF"),
    "neon-arena-fps": ("FPS", "#28224A", "#FF5BE0"),
    "wxchat": ("WX", "#159F62", "#FFFFFF"),
}


def github_raw(app: str, item: dict[str, str]) -> bytes:
    repository, ref, path = item["repository"], item["ref"], item["path"]
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", repository):
        raise ValueError(f"{app}: disallowed repository identifier")
    if not re.fullmatch(r"[\w.-]+", ref):
        raise ValueError(f"{app}: invalid revision name")
    if path.startswith("/") or ".." in pathlib.PurePosixPath(path).parts:
        raise ValueError(f"{app}: invalid image path")
    url = f"https://raw.githubusercontent.com/{repository}/{ref}/{path}"
    print(f"  Download {app}: {repository}/{path}", flush=True)
    response = requests.get(url, timeout=45, headers={"User-Agent": "Baota-Apphub-icon-builder/1.0"})
    response.raise_for_status()
    image_data = response.content
    if len(image_data) > 5_000_000:
        raise ValueError(f"{app}: icon source is unreasonably large")
    expected = item["git_blob_sha"]
    actual = hashlib.sha1(
        b"blob " + str(len(image_data)).encode("ascii") + b"\0" + image_data
    ).hexdigest()
    if actual != expected:
        raise ValueError(f"{app}: Git blob SHA changed! Expected {expected}, got {actual}")
    return image_data


def prepare_svg(app: str, svg_source: bytes) -> bytes:
    content = svg_source.decode("utf-8-sig")
    # SVGs are read as images, never as code or external documents.
    stripped = content.replace("http://www.w3.org/2000/svg", "")
    if re.search(r"<!DOCTYPE|<script|<image|(?:xlink:)?href=|https?://", stripped, re.I):
        raise ValueError(f"{app}: SVG contains external or active content")
    if app == "mlflow":
        # Use only the two official circular MLflow symbol paths, not the long
        # wordmark, so the mark remains recognizable at 40px in the Baota UI.
        root = ET.fromstring(content)
        selected = [
            node for node in root
            if node.tag.endswith("path") and
            node.attrib.get("d", "").startswith(("M71.8067", "M62.6179"))
        ]
        if len(selected) != 2:
            raise ValueError("MLflow glyph changed: unable to locate the two official paths")
        icon_svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="57 13 20 20">'
            + "".join(ET.tostring(node, encoding="unicode") for node in selected)
            + "</svg>"
        )
        return icon_svg.encode("utf-8")
    if app == "gemini-business2api":
        # CairoSVG does not apply all CSS custom properties / animations.
        content = content.replace("var(--soul-color)", "#00BCD4")
        content = content.replace('filter="url(#head-shadow)"', "")
        content = content.replace("rgba(255, 255, 255, 0.9)", "#FFFFFF")
    return content.encode("utf-8")


def decode_asset(app: str, source: dict[str, str]) -> Image.Image:
    data = github_raw(app, source)
    suffix = pathlib.PurePosixPath(source["path"]).suffix.lower()
    if suffix == ".svg":
        data = cairosvg.svg2png(
            bytestring=prepare_svg(app, data),
            output_width=512,
            output_height=512,
        )
    elif suffix not in {".png", ".ico", ".jpg", ".jpeg", ".webp"}:
        raise ValueError(f"{app}: unsupported icon format {suffix}")
    with Image.open(io.BytesIO(data)) as image:
        image.load()
        return image.convert("RGBA").copy()


def fallback_icon(app: str) -> Image.Image:
    abbreviation, primary, accent = CUSTOM[app]
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((8, 8, 248, 248), radius=62, fill=primary)
    d.rounded_rectangle((16, 16, 240, 240), radius=56, outline=accent, width=3)
    if app == "arena-brawl":
        d.line((79, 61, 177, 158), fill=accent, width=15)
        d.line((177, 61, 79, 158), fill=accent, width=15)
        d.line((68, 85, 87, 66), fill="#39252B", width=9)
        d.line((169, 65, 187, 85), fill="#39252B", width=9)
    elif app == "bomb-party":
        d.ellipse((75, 61, 179, 166), fill="#25252B", outline=accent, width=6)
        d.arc((126, 25, 181, 85), 176, 335, fill="#303038", width=9)
        d.ellipse((170, 39, 186, 55), fill="#FFFFFF")
    elif app == "ice-climber-arena":
        d.polygon([(48, 159), (98, 54), (142, 159)], fill="#C8F3FF")
        d.polygon([(109, 159), (166, 43), (210, 159)], fill="#87D1FC")
        d.polygon([(98, 54), (117, 111), (80, 105)], fill="#FFFFFF")
    elif app == "neon-arena-fps":
        d.ellipse((72, 46, 183, 158), outline="#23F1D4", width=10)
        d.ellipse((99, 73, 157, 132), outline=accent, width=10)
        d.line((127, 29, 127, 70), fill=accent, width=7)
        d.line((127, 136, 127, 181), fill=accent, width=7)
        d.line((51, 102, 95, 102), fill=accent, width=7)
        d.line((158, 102, 203, 102), fill=accent, width=7)
    elif app == "wxchat":
        d.ellipse((44, 48, 174, 150), fill="#FFFFFF")
        d.ellipse((111, 103, 207, 180), fill="#CEF8DF")
        d.ellipse((84, 90, 93, 99), fill=primary)
        d.ellipse((121, 90, 130, 99), fill=primary)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 39)
    xy = d.textbbox((0, 0), abbreviation, font=font)
    tw = xy[2] - xy[0]
    d.text(((SIZE - tw) / 2, 185), abbreviation, fill=accent, font=font, stroke_width=1)
    return canvas


def normalized(app: str, image: Image.Image) -> Image.Image:
    if app in CUSTOM:
        return image
    output = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    if app == "fast-note-sync-service":
        d = ImageDraw.Draw(output)
        d.rounded_rectangle((8, 8, 248, 248), radius=55, fill="#1767B3")
    # Give narrow icons sufficient padding, without stretching the original.
    image.thumbnail((232, 232), Image.Resampling.LANCZOS)
    output.alpha_composite(image, ((SIZE - image.width) // 2, (SIZE - image.height) // 2))
    return output


def main() -> None:
    sources = json.loads(ASSET_MAP.read_text(encoding="utf-8"))
    folders = {p.name.removeprefix("kejilion-"): p for p in DEST.glob("kejilion-*") if p.is_dir()}
    if set(sources) | set(CUSTOM) != set(folders):
        raise ValueError("Icon source list must match all imported kejilion app folders")
    for app, folder in sorted(folders.items()):
        image = decode_asset(app, sources[app]) if app in sources else fallback_icon(app)
        target = folder / "icon.png"
        final = normalized(app, image)
        final.save(target, "PNG", optimize=True)
        with Image.open(target) as check:
            if check.format != "PNG" or check.size != (SIZE, SIZE):
                raise ValueError(f"{app}: generated icon is invalid")
        print(f"  Written {target.relative_to(ROOT)} ({target.stat().st_size} bytes)", flush=True)
    print(f"Completed {len(folders)} application icons: {len(sources)} official sources, {len(CUSTOM)} marked original artwork")


if __name__ == "__main__":
    main()
