---
name: tokens-to-components
description: Generate React/TypeScript UI components from design tokens. Use when the user has design tokens (from painting-to-tokens or a tokens.css file) and wants to generate a component library, UI kit, or set of reusable components. Also use when user says "generate components from these tokens" or "build a component library."
allowed-tools: Bash(python *), Read, Write, Edit
---

# Tokens-to-Components: Generate UI Components from Design Tokens

You are generating production-ready React/TypeScript components that consume
design tokens via CSS custom properties. The SCRIPT handles boilerplate
generation. YOU handle creative component composition and documentation.

## Prerequisites

Ensure these files exist before proceeding:
- `src/tokens.css` — CSS custom properties (from painting-to-tokens skill or manual)
- `src/tokens.ts` — TypeScript token constants (optional but recommended)

If they don't exist, tell the user to run the `painting-to-tokens` skill first.

## Phase 1: Discover Project Context

Read the project's existing code to understand:
- **Framework**: React, Vue, Svelte, etc.
- **Styling approach**: Tailwind, CSS Modules, styled-components, etc.
- **Existing components**: What already exists to avoid duplicating
- **File conventions**: How files are named and organized

## Phase 2: Choose Components

Based on the project's needs, select from the component catalog:
[references/component_catalog.md](references/component_catalog.md)

Minimum set (always generate):
- Button (primary, secondary, ghost, danger variants)
- Card (with header, body, footer slots)
- Input (text, with label, error state, helper text)
- Badge (status colors, sizes)

Extended set (generate if the project needs them):
- Select, Dialog/Modal, Toast/Notification, Tabs, Avatar,
  Tooltip, Toggle, Skeleton, Divider, Alert

## Phase 3: Generate Components

```bash
python ${CLAUDE_SKILL_DIR}/scripts/generate_components.py <tokens.css-path> <output-dir> [--components button,card,input,badge,select,dialog,toast,tabs]
```

The script generates one file per component with:
- TypeScript types for all props
- CSS custom property consumption (NO hardcoded hex values)
- `data-theme` aware (light/dark mode automatic)
- Accessible by default (ARIA attributes, keyboard navigation)
- Tailwind v4 class usage where appropriate

## Phase 4: Customize Generated Components

After generation, YOU should review and customize:

1. **Adjust the visual style** to match the painting's mood:
   - Organic/nature paintings → softer shadows, rounded corners, subtle gradients
   - Angular/geometric paintings → sharp corners, flat colors, strong borders
   - Impressionist paintings → layered shadows, texture overlays, warm tones
   - Dark/moody paintings → deep backgrounds, glowing accents, edge highlights

2. **Add micro-interactions** that feel organic:
   - Button press: `transform: scale(0.97)` with spring easing
   - Card hover: subtle `translateY(-2px)` + shadow deepen
   - Focus rings: use `brand-primary` with 3px offset, not browser default
   - Transitions: 150-200ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring feel

3. **Add SVG noise texture** to surface components for anti-AI-slop:
   ```css
   .textured-surface::before {
     content: '';
     position: absolute;
     inset: 0;
     opacity: 0.03;
     background-image: url("data:image/svg+xml,..."); /* grain texture */
     pointer-events: none;
     border-radius: inherit;
   }
   ```

## Phase 5: Generate Preview Page

```bash
python ${CLAUDE_SKILL_DIR}/scripts/generate_preview.py <tokens.css-path> <output-dir>
```

This generates a self-contained HTML preview showing all components with both
light and dark mode. Open it in a browser to review with the user.

## Phase 6: Integration Guide

Tell the user how to use the components:

1. Import the component: `import { Button } from './components/ui/Button'`
2. Use with variants: `<Button variant="primary" size="md">Click me</Button>`
3. Dark mode: Add `data-theme="dark"` to `<html>` or any container
4. Customizing: Override CSS custom properties on any container

## Anti-AI-Slop Component Rules

1. **No purple/indigo defaults** — all colors come from tokens
2. **No perfectly symmetric layouts** in preview — vary card sizes, offset grids
3. **No `rounded-xl` on everything** — use the shape tokens from the painting
4. **Shadows must use the painting's shadow color** — not rgba(0,0,0,x)
5. **Typography hierarchy over color hierarchy** — use font weight and size for emphasis, not colored badges
6. **Buttons must have visible state changes** — hover, active, focus, disabled must all look different
7. **Cards should NOT all look identical** — vary by content type (info, action, status)
