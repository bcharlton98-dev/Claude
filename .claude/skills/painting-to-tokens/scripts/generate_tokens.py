#!/usr/bin/env python3
"""
Generate CSS custom properties + Tailwind v4 @theme block and TypeScript token
constants from a validated design-decisions.json file.

Usage:
    python generate_tokens.py <design-decisions.json> <output-dir>

Produces:
    <output-dir>/tokens.css   — CSS custom properties + @theme
    <output-dir>/tokens.ts    — TypeScript constants
"""

import json
import math
import os
import sys
from datetime import datetime


def hex_to_hsl(hex_str: str) -> tuple[int, float, float]:
    """Convert #RRGGBB to (h, s%, l%) for CSS hsl()."""
    h_str = hex_str.lstrip("#")
    r, g, b = int(h_str[0:2], 16) / 255, int(h_str[2:4], 16) / 255, int(h_str[4:6], 16) / 255
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2

    if mx == mn:
        hue = 0.0
        s = 0.0
    else:
        d = mx - mn
        s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
        if mx == r:
            hue = ((g - b) / d + (6 if g < b else 0)) * 60
        elif mx == g:
            hue = ((b - r) / d + 2) * 60
        else:
            hue = ((r - g) / d + 4) * 60

    return round(hue), round(s * 100, 1), round(l * 100, 1)


def generate_tint_shade_scale(hex_color: str, name: str) -> list[tuple[str, str]]:
    """Generate a 50-900 scale from a single hex color for the @theme block."""
    h_str = hex_color.lstrip("#")
    r, g, b = int(h_str[0:2], 16), int(h_str[2:4], 16), int(h_str[4:6], 16)

    # Lightness targets for each stop (50=very light, 900=very dark)
    targets = {
        50: 0.95, 100: 0.90, 200: 0.80, 300: 0.65,
        400: 0.50, 500: 0.40, 600: 0.30, 700: 0.22, 800: 0.15, 900: 0.10,
    }

    results = []
    for stop, target_l in targets.items():
        h, s, l = hex_to_hsl(hex_color)
        # Blend toward white (tint) or black (shade)
        if target_l > l / 100:
            # Tint: blend toward white
            factor = (target_l - l / 100) / (1 - l / 100) if l < 100 else 0
            nr = round(r + (255 - r) * factor)
            ng = round(g + (255 - g) * factor)
            nb = round(b + (255 - b) * factor)
        else:
            # Shade: blend toward black
            factor = 1 - (target_l / (l / 100)) if l > 0 else 1
            nr = round(r * (1 - factor))
            ng = round(g * (1 - factor))
            nb = round(b * (1 - factor))

        nr = max(0, min(255, nr))
        ng = max(0, min(255, ng))
        nb = max(0, min(255, nb))
        results.append((f"--color-{name}-{stop}", f"#{nr:02x}{ng:02x}{nb:02x}"))

    return results


def build_css(data: dict) -> str:
    """Build the full CSS output with @theme and dark mode."""
    tokens = data["colors"]["tokens"]
    dark = data["colors"]["dark_mode"]
    typo = data["typography"]
    spacing = data["spacing"]
    shape = data["shape"]
    painting = data["painting"]

    lines = []
    lines.append(f"/* Design tokens generated from: {painting['title']}")
    if painting.get("artist") and painting["artist"] != "Unknown":
        lines.append(f"   Artist: {painting['artist']}")
    lines.append(f"   Mood: {', '.join(painting['mood'])}")
    lines.append(f"   Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} */")
    lines.append("")

    # Google Fonts import
    heading_font = typo["heading_family"].replace(" ", "+")
    body_font = typo["body_family"].replace(" ", "+")
    heading_wght = typo.get("heading_weight", 700)
    body_wght = typo.get("body_weight", 400)
    lines.append(f'@import url("https://fonts.googleapis.com/css2?family={heading_font}:wght@{heading_wght}&family={body_font}:wght@{body_wght};{body_wght + 200};{min(body_wght + 300, 900)}&display=swap");')
    lines.append("")

    # -- Tailwind v4 @theme block --
    lines.append("@theme {")

    # Generate color scales from key brand colors
    brand_scales = [
        ("brand-primary", tokens["brand-primary"]),
        ("brand-secondary", tokens["brand-secondary"]),
        ("brand-accent", tokens["brand-accent"]),
    ]
    for scale_name, hex_val in brand_scales:
        tw_name = scale_name.replace("-", "")  # brandprimary -> too long
        # Use short names for Tailwind classes
        short_names = {
            "brand-primary": "brand",
            "brand-secondary": "secondary",
            "brand-accent": "accent",
        }
        tw_name = short_names.get(scale_name, scale_name)
        lines.append(f"  /* {scale_name} scale from {hex_val} */")
        for prop, val in generate_tint_shade_scale(hex_val, tw_name):
            lines.append(f"  {prop}: {val};")
        lines.append("")

    lines.append("  /* ── Semantic role tokens ── */")
    for key, val in tokens.items():
        css_key = f"--color-{key}"
        lines.append(f"  {css_key}: {val};")
    lines.append("")

    # Typography
    lines.append("  /* ── Typography ── */")
    lines.append(f"  --font-heading: '{typo['heading_family']}', system-ui, sans-serif;")
    lines.append(f"  --font-body: '{typo['body_family']}', system-ui, sans-serif;")
    lines.append("")

    # Spacing scale
    lines.append("  /* ── Spacing ── */")
    for i, val in enumerate(spacing["scale"]):
        lines.append(f"  --spacing-{i}: {val}px;")
    lines.append("")

    # Border radius
    lines.append("  /* ── Shape ── */")
    for key in ("radius_sm", "radius_md", "radius_lg", "radius_full"):
        css_key = key.replace("_", "-")
        lines.append(f"  --{css_key}: {shape[key]};")

    lines.append("}")
    lines.append("")

    # -- Light mode (default) root styles --
    lines.append(":root {")
    for key, val in tokens.items():
        lines.append(f"  --{key}: {val};")
    lines.append(f"  --font-heading: '{typo['heading_family']}', system-ui, sans-serif;")
    lines.append(f"  --font-body: '{typo['body_family']}', system-ui, sans-serif;")
    lines.append(f"  --shadow-color: {tokens['shadow-color']};")
    lines.append("}")
    lines.append("")

    # -- Dark mode --
    lines.append('[data-theme="dark"] {')
    for key, val in dark.items():
        lines.append(f"  --{key}: {val};")
    lines.append(f"  --shadow-color: {dark['shadow-color']};")
    lines.append("}")
    lines.append("")

    # Also support prefers-color-scheme
    lines.append("@media (prefers-color-scheme: dark) {")
    lines.append("  :root:not([data-theme]) {")
    for key, val in dark.items():
        lines.append(f"    --{key}: {val};")
    lines.append(f"    --shadow-color: {dark['shadow-color']};")
    lines.append("  }")
    lines.append("}")
    lines.append("")

    # -- Utility classes --
    lines.append("/* ── Utility classes ── */")
    shadow_hex = tokens["shadow-color"]
    h, s, l = hex_to_hsl(shadow_hex)
    lines.append(f"""
.card-shadow {{
  box-shadow:
    0 1px 1px hsla({h}, {s}%, {l}%, 0.04),
    0 2px 4px hsla({h}, {s}%, {l}%, 0.04),
    0 4px 8px hsla({h}, {s}%, {l}%, 0.03);
}}

.card-elevated {{
  box-shadow:
    0 1px 2px hsla({h}, {s}%, {l}%, 0.05),
    0 2px 4px hsla({h}, {s}%, {l}%, 0.05),
    0 4px 8px hsla({h}, {s}%, {l}%, 0.04),
    0 8px 16px hsla({h}, {s}%, {l}%, 0.03),
    0 16px 32px hsla({h}, {s}%, {l}%, 0.02);
}}""")

    return "\n".join(lines) + "\n"


def build_ts(data: dict) -> str:
    """Build TypeScript token constants."""
    tokens = data["colors"]["tokens"]
    dark = data["colors"]["dark_mode"]
    typo = data["typography"]
    painting = data["painting"]

    lines = []
    lines.append(f"// Design tokens from: {painting['title']}")
    lines.append(f"// Mood: {', '.join(painting['mood'])}")
    lines.append(f"// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append("export const tokens = {")
    lines.append("  light: {")
    for key, val in tokens.items():
        ts_key = key.replace("-", "_")
        lines.append(f'    {ts_key}: "{val}",')
    lines.append("  },")
    lines.append("  dark: {")
    for key, val in dark.items():
        ts_key = key.replace("-", "_")
        lines.append(f'    {ts_key}: "{val}",')
    lines.append("  },")
    lines.append("} as const;")
    lines.append("")
    lines.append("export const typography = {")
    lines.append(f'  heading: "{typo["heading_family"]}",')
    lines.append(f'  body: "{typo["body_family"]}",')
    lines.append(f"  scaleRatio: {typo['scale_ratio']},")
    lines.append(f"  baseSizePx: {typo['base_size_px']},")
    lines.append("} as const;")
    lines.append("")

    # Generate type-scale helper
    ratio = typo["scale_ratio"]
    base = typo["base_size_px"]
    lines.append("/** Pre-computed type scale (px) */")
    lines.append("export const typeScale = {")
    scale_names = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"]
    for i, name in enumerate(scale_names):
        step = i - 2  # base is step 0
        size = round(base * (ratio ** step), 1)
        lines.append(f'  "{name}": {size},')
    lines.append("} as const;")
    lines.append("")

    # Chart-friendly color array
    lines.append("/** Colors suitable for charts and data visualization */")
    lines.append("export const chartColors = [")
    for key in ["brand-primary", "brand-secondary", "brand-accent", "success", "warning", "info"]:
        lines.append(f'  "{tokens[key]}",')
    lines.append("] as const;")
    lines.append("")

    return "\n".join(lines) + "\n"


def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_tokens.py <design-decisions.json> <output-dir>")
        sys.exit(1)

    decisions_path = sys.argv[1]
    output_dir = sys.argv[2]

    with open(decisions_path) as f:
        data = json.load(f)

    os.makedirs(output_dir, exist_ok=True)

    css_path = os.path.join(output_dir, "tokens.css")
    ts_path = os.path.join(output_dir, "tokens.ts")

    css_content = build_css(data)
    ts_content = build_ts(data)

    with open(css_path, "w") as f:
        f.write(css_content)

    with open(ts_path, "w") as f:
        f.write(ts_content)

    print(f"✅ Generated token files:")
    print(f"   {css_path} ({len(css_content)} bytes)")
    print(f"   {ts_path} ({len(ts_content)} bytes)")
    print()
    print(f"   Painting: {data['painting']['title']}")
    print(f"   Mood: {', '.join(data['painting']['mood'])}")
    print(f"   Fonts: {data['typography']['heading_family']} + {data['typography']['body_family']}")
    print(f"   Colors: {len(data['colors']['palette'])} palette entries → {len(data['colors']['tokens'])} tokens")


if __name__ == "__main__":
    main()
