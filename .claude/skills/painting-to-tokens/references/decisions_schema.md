# Design Decisions JSON Schema

The `design-decisions.json` file must follow this exact structure.
All color values must be hex format (#RRGGBB). All names must be kebab-case.

```json
{
  "painting": {
    "title": "Name or description of the painting",
    "artist": "Artist name (if known, else 'Unknown')",
    "mood": ["adjective1", "adjective2", "adjective3"]
  },
  "colors": {
    "palette": [
      {
        "name": "descriptive-kebab-name",
        "hex": "#RRGGBB",
        "origin": "Where in the painting this color comes from",
        "role": "Which design role(s) this maps to"
      }
    ],
    "tokens": {
      "background": "#RRGGBB",
      "surface": "#RRGGBB",
      "surface-elevated": "#RRGGBB",
      "surface-sunken": "#RRGGBB",
      "text-primary": "#RRGGBB",
      "text-secondary": "#RRGGBB",
      "text-muted": "#RRGGBB",
      "text-inverse": "#RRGGBB",
      "brand-primary": "#RRGGBB",
      "brand-primary-light": "#RRGGBB",
      "brand-primary-dark": "#RRGGBB",
      "brand-secondary": "#RRGGBB",
      "brand-accent": "#RRGGBB",
      "success": "#RRGGBB",
      "warning": "#RRGGBB",
      "error": "#RRGGBB",
      "info": "#RRGGBB",
      "border-default": "#RRGGBB",
      "border-strong": "#RRGGBB",
      "shadow-color": "#RRGGBB"
    },
    "dark_mode": {
      "background": "#RRGGBB",
      "surface": "#RRGGBB",
      "surface-elevated": "#RRGGBB",
      "surface-sunken": "#RRGGBB",
      "text-primary": "#RRGGBB",
      "text-secondary": "#RRGGBB",
      "text-muted": "#RRGGBB",
      "text-inverse": "#RRGGBB",
      "brand-primary": "#RRGGBB",
      "brand-primary-light": "#RRGGBB",
      "brand-primary-dark": "#RRGGBB",
      "brand-secondary": "#RRGGBB",
      "brand-accent": "#RRGGBB",
      "success": "#RRGGBB",
      "warning": "#RRGGBB",
      "error": "#RRGGBB",
      "info": "#RRGGBB",
      "border-default": "#RRGGBB",
      "border-strong": "#RRGGBB",
      "shadow-color": "#RRGGBB"
    }
  },
  "typography": {
    "heading_family": "Font Name",
    "body_family": "Font Name",
    "heading_weight": 700,
    "body_weight": 400,
    "scale_ratio": 1.25,
    "base_size_px": 16
  },
  "spacing": {
    "base_px": 8,
    "scale": [0, 4, 8, 12, 16, 24, 32, 48, 64, 96]
  },
  "shape": {
    "radius_sm": "4px",
    "radius_md": "8px",
    "radius_lg": "16px",
    "radius_full": "9999px"
  }
}
```

## Validation rules

- All hex values must be valid 6-digit hex (#RRGGBB)
- `text-primary` must have >= 4.5:1 contrast ratio against `background` (WCAG AA)
- `text-secondary` must have >= 3:1 contrast ratio against `background`
- `brand-primary` must have >= 3:1 contrast ratio against `background`
- All palette entries must have non-empty `name`, `hex`, `origin`, and `role`
- `mood` array must have 2-5 entries
- Font families must not be in the banned list (Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Poppins, Montserrat)
- `scale_ratio` must be between 1.1 and 1.5
- `base_size_px` must be between 14 and 20
- `spacing.base_px` must be 4 or 8
