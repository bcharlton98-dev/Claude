#!/usr/bin/env python3
"""Validate a design-decisions.json file against the schema and WCAG contrast rules."""

import json
import math
import sys

BANNED_FONTS = {
    "inter", "roboto", "arial", "helvetica", "open sans",
    "lato", "poppins", "montserrat",
}

REQUIRED_TOKEN_KEYS = [
    "background", "surface", "surface-elevated", "surface-sunken",
    "text-primary", "text-secondary", "text-muted", "text-inverse",
    "brand-primary", "brand-primary-light", "brand-primary-dark",
    "brand-secondary", "brand-accent",
    "success", "warning", "error", "info",
    "border-default", "border-strong", "shadow-color",
]


def hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    """Convert #RRGGBB to (r, g, b)."""
    h = hex_str.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def relative_luminance(r: int, g: int, b: int) -> float:
    """WCAG 2.1 relative luminance."""
    def linearize(c: int) -> float:
        s = c / 255.0
        return s / 12.92 if s <= 0.04045 else math.pow((s + 0.055) / 1.055, 2.4)
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)


def contrast_ratio(hex1: str, hex2: str) -> float:
    """WCAG contrast ratio between two hex colors."""
    l1 = relative_luminance(*hex_to_rgb(hex1))
    l2 = relative_luminance(*hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def is_valid_hex(s: str) -> bool:
    """Check if string is a valid #RRGGBB hex color."""
    if not isinstance(s, str):
        return False
    if len(s) != 7 or s[0] != "#":
        return False
    try:
        int(s[1:], 16)
        return True
    except ValueError:
        return False


def validate(path: str) -> list[str]:
    """Return list of error messages. Empty = valid."""
    errors: list[str] = []

    try:
        with open(path) as f:
            data = json.load(f)
    except FileNotFoundError:
        return [f"File not found: {path}"]
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]

    # ── Painting section ──
    painting = data.get("painting", {})
    if not painting.get("title"):
        errors.append("painting.title is required")
    mood = painting.get("mood", [])
    if not isinstance(mood, list) or not (2 <= len(mood) <= 5):
        errors.append("painting.mood must be a list of 2-5 adjectives")

    # ── Colors section ──
    colors = data.get("colors", {})

    # Palette entries
    palette = colors.get("palette", [])
    if len(palette) < 6:
        errors.append(f"palette must have at least 6 entries, found {len(palette)}")
    for i, entry in enumerate(palette):
        for field in ("name", "hex", "origin", "role"):
            if not entry.get(field):
                errors.append(f"palette[{i}].{field} is required")
        if entry.get("hex") and not is_valid_hex(entry["hex"]):
            errors.append(f"palette[{i}].hex '{entry.get('hex')}' is not valid #RRGGBB")

    # Light mode tokens
    tokens = colors.get("tokens", {})
    for key in REQUIRED_TOKEN_KEYS:
        val = tokens.get(key)
        if not val:
            errors.append(f"colors.tokens.{key} is missing")
        elif not is_valid_hex(val):
            errors.append(f"colors.tokens.{key} = '{val}' is not valid #RRGGBB")

    # Dark mode tokens
    dark = colors.get("dark_mode", {})
    for key in REQUIRED_TOKEN_KEYS:
        val = dark.get(key)
        if not val:
            errors.append(f"colors.dark_mode.{key} is missing")
        elif not is_valid_hex(val):
            errors.append(f"colors.dark_mode.{key} = '{val}' is not valid #RRGGBB")

    # ── Contrast checks (only if tokens are valid hex) ──
    bg = tokens.get("background", "")
    if is_valid_hex(bg):
        checks = [
            ("text-primary", 4.5),
            ("text-secondary", 3.0),
            ("brand-primary", 3.0),
        ]
        for key, min_ratio in checks:
            fg = tokens.get(key, "")
            if is_valid_hex(fg):
                ratio = contrast_ratio(fg, bg)
                if ratio < min_ratio:
                    errors.append(
                        f"WCAG: {key} ({fg}) on background ({bg}) has "
                        f"contrast {ratio:.2f}:1, needs >= {min_ratio}:1"
                    )

    # Dark mode contrast checks
    dark_bg = dark.get("background", "")
    if is_valid_hex(dark_bg):
        dark_checks = [
            ("text-primary", 4.5),
            ("text-secondary", 3.0),
            ("brand-primary", 3.0),
        ]
        for key, min_ratio in dark_checks:
            fg = dark.get(key, "")
            if is_valid_hex(fg):
                ratio = contrast_ratio(fg, dark_bg)
                if ratio < min_ratio:
                    errors.append(
                        f"WCAG (dark): {key} ({fg}) on background ({dark_bg}) has "
                        f"contrast {ratio:.2f}:1, needs >= {min_ratio}:1"
                    )

    # ── Typography ──
    typo = data.get("typography", {})
    for font_key in ("heading_family", "body_family"):
        font = typo.get(font_key, "")
        if not font:
            errors.append(f"typography.{font_key} is required")
        elif font.lower() in BANNED_FONTS:
            errors.append(f"typography.{font_key} = '{font}' is BANNED (AI-slop)")

    ratio = typo.get("scale_ratio", 0)
    if not (1.1 <= ratio <= 1.5):
        errors.append(f"typography.scale_ratio = {ratio}, must be 1.1-1.5")

    base = typo.get("base_size_px", 0)
    if not (14 <= base <= 20):
        errors.append(f"typography.base_size_px = {base}, must be 14-20")

    # ── Spacing ──
    spacing = data.get("spacing", {})
    if spacing.get("base_px") not in (4, 8):
        errors.append(f"spacing.base_px must be 4 or 8, got {spacing.get('base_px')}")

    return errors


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate.py <design-decisions.json>")
        sys.exit(1)

    path = sys.argv[1]
    errors = validate(path)

    if errors:
        print(f"❌ VALIDATION FAILED — {len(errors)} error(s):\n")
        for i, err in enumerate(errors, 1):
            print(f"  {i}. {err}")
        sys.exit(1)
    else:
        print("✅ design-decisions.json is valid!")
        print("   All colors valid, WCAG contrast passes, no banned fonts.")
        sys.exit(0)


if __name__ == "__main__":
    main()
