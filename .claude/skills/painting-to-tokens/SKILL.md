---
name: painting-to-tokens
description: Extract a color palette from a painting image and generate design tokens (CSS custom properties + Tailwind @theme). Use when the user provides a painting, artwork, photograph, or any image and wants to derive a design system, color palette, theme, or tokens from it. Also use when the user says "make it look like this painting" or "extract colors from this image."
allowed-tools: Bash(python *), Read, Write
---

# Painting-to-Tokens: Extract Design System from Art

You are creating a unique, production-ready design token set derived from a
painting or artwork. YOUR job is the creative interpretation. The SCRIPT
handles mechanical CSS generation.

## Phase 1: Analyze the Painting

Read the image the user provides. Study it carefully and identify:

- **Dominant colors** (2-3): The colors that occupy the most visual area
- **Accent colors** (2-3): Smaller pops of contrast or emphasis
- **Shadow tones** (1-2): The darkest areas — these become text and deep backgrounds
- **Light tones** (1-2): The lightest areas — these become surfaces and backgrounds
- **Mood**: Is it warm/cool? High/low contrast? Saturated/muted?

Give each color a **descriptive name** inspired by the painting — not generic names.
Examples: `deep-shadow-teal`, `petal-highlight`, `weathered-stone`, `horizon-blush`,
`moss-undertone`. NEVER use names like `primary`, `blue-500`, or `color-1`.

## Phase 2: Map to Design Roles

Map your extracted colors to these required token roles:

### Surface tokens (backgrounds)
- `background`: Lightest tone from the painting (page background)
- `surface`: Slightly darker than background (card backgrounds)
- `surface-elevated`: Between background and surface (modals, popovers)
- `surface-sunken`: Darker than surface (inset areas, code blocks)

### Text tokens
- `text-primary`: Darkest shadow tone (main body text, must pass WCAG AA on background)
- `text-secondary`: Mid-shadow tone (secondary text)
- `text-muted`: Lighter (placeholders, captions)
- `text-inverse`: Light tone for use on dark backgrounds

### Brand tokens
- `brand-primary`: The most distinctive color from the painting
- `brand-primary-light`: A lighter tint of brand-primary
- `brand-primary-dark`: A darker shade of brand-primary
- `brand-secondary`: The second-most distinctive color
- `brand-accent`: A contrasting pop color (for CTAs, badges, highlights)

### Semantic tokens
- `success`: A green-leaning color from the painting (or derive one)
- `warning`: A warm/amber-leaning color from the painting
- `error`: A red-leaning color (derive if not present in painting)
- `info`: A cool/blue-leaning color (derive if not present in painting)

### Border & shadow tokens
- `border-default`: A subtle mid-tone for card borders
- `border-strong`: A more visible border color
- `shadow-color`: The hue for box-shadows (use the painting's shadow tone)

## Phase 3: Choose Typography

Pick a font pairing that matches the painting's mood. See
[references/font_pairings.md](references/font_pairings.md) for options.

Rules:
- NEVER use Inter, Roboto, Arial, Helvetica, or Open Sans (overused, AI-slop signals)
- The heading font should have personality
- The body font should be highly legible at 14-16px
- Both must be available on Google Fonts (free)

## Phase 4: Choose Spacing & Shape

Based on the painting's mood:
- **Spacing base**: 4px (compact/editorial) or 8px (relaxed/spacious)
- **Border radius**: Sharp 0-2px (angular/modernist paintings), Soft 4-8px (impressionist/nature), Round 12-20px (playful/abstract)
- **Typography scale ratio**: 1.2 (minor third, subtle), 1.25 (major third, balanced), 1.333 (perfect fourth, dramatic)

## Phase 5: Write Decisions File

Write ALL decisions to `design-decisions.json` in the project root. Follow the
schema in [references/decisions_schema.md](references/decisions_schema.md) exactly.

## Phase 6: Validate

```bash
python ${CLAUDE_SKILL_DIR}/scripts/validate.py design-decisions.json
```

If validation fails, fix your decisions and re-validate.

## Phase 7: Generate Tokens

```bash
python ${CLAUDE_SKILL_DIR}/scripts/generate_tokens.py design-decisions.json ./src/
```

This generates:
- `src/tokens.css` — CSS custom properties + Tailwind v4 `@theme` block
- `src/tokens.ts` — TypeScript constants for use in JS (e.g., chart colors)

## Phase 8: Show the User

Present a summary:
1. The painting's mood in 2-3 words
2. A table of color names → hex values → roles
3. The font pairing chosen and why
4. The spacing/radius choices and why
5. Instructions for importing: add `@import "./tokens.css";` before `@import "tailwindcss";` in their main CSS file

## Anti-AI-Slop Rules

These are hard constraints. NEVER violate them:

1. **No purple gradients** — unless the painting is literally purple
2. **No indigo-500 / violet-500** — the Tailwind defaults that trained every AI
3. **No Inter / Roboto** — dead giveaway of AI-generated UI
4. **No equal-spacing-everything** — vary padding/margins based on content hierarchy
5. **Every hex value must trace back to the painting** — you must be able to point to where in the painting each color lives (even derived colors should explain their origin)
6. **Dark mode must shift hue, not just lightness** — shadows get warmer in dark mode, highlights get cooler
7. **Shadow colors must match the palette** — no `rgba(0,0,0,0.1)`, use the painting's shadow tones
