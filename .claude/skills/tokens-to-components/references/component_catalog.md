# Component Catalog

All components consume CSS custom properties from tokens.css. No hardcoded colors.

## Core (always generate)

### Button
- Variants: `primary`, `secondary`, `ghost`, `danger`
- Sizes: `sm`, `md`, `lg`
- States: default, hover, active, focus, disabled, loading
- Props: `variant`, `size`, `disabled`, `loading`, `leftIcon`, `rightIcon`, `fullWidth`
- Must have visible spring-feel active state (scale 0.97)
- Focus ring uses brand-primary with 2px offset

### Card
- Variants: `default`, `elevated`, `outlined`, `filled`
- Slots: `header`, `body`, `footer` (all optional)
- Props: `variant`, `padding`, `onClick` (makes it clickable with hover state)
- Hue-matched shadow using shadow-color token
- Optional: subtle noise texture on surface

### Input
- Types: `text`, `email`, `password`, `number`, `search`
- States: default, focus, error, disabled
- Props: `label`, `placeholder`, `error`, `helperText`, `leftIcon`, `rightIcon`
- Label animates on focus (optional)
- Error state uses error token color with subtle background tint

### Badge
- Variants: `default`, `success`, `warning`, `error`, `info`, `brand`
- Sizes: `sm`, `md`
- Props: `variant`, `size`, `dot` (shows status dot instead of text)
- Uses semantic color tokens

## Extended (generate on request)

### Select
- Custom dropdown (not native <select>)
- Keyboard navigable (arrow keys, enter, escape)
- Props: `options`, `value`, `onChange`, `placeholder`, `label`, `error`

### Dialog / Modal
- Overlay with backdrop blur
- Focus trap
- Escape to close
- Props: `open`, `onClose`, `title`, `children`, `size`
- Animate: scale from 0.95 + fade

### Toast / Notification
- Variants: `success`, `error`, `warning`, `info`
- Auto-dismiss with progress bar
- Props: `message`, `variant`, `duration`, `action`
- Animate: slide in from top-right

### Tabs
- Horizontal tab list with animated indicator
- Keyboard navigable (arrow keys)
- Props: `tabs`, `activeTab`, `onChange`
- Active indicator slides with spring easing

### Avatar
- Sizes: `xs`, `sm`, `md`, `lg`, `xl`
- Fallback: initials from name
- Props: `src`, `name`, `size`, `status` (online/offline/busy)
- Status dot positioned at bottom-right

### Tooltip
- Positions: `top`, `bottom`, `left`, `right`
- Trigger: hover with 300ms delay
- Props: `content`, `position`, `children`
- Animate: fade + slight translate

### Toggle / Switch
- Accessible checkbox alternative
- Props: `checked`, `onChange`, `label`, `disabled`
- Smooth slide animation with brand-primary when active

### Skeleton
- Loading placeholder
- Variants: `text`, `circular`, `rectangular`
- Animated shimmer using brand colors (not grey)
- Props: `variant`, `width`, `height`, `lines`

### Divider
- Horizontal or vertical
- Props: `orientation`, `label` (optional text in middle)
- Uses border-default token

### Alert
- Variants: `success`, `warning`, `error`, `info`
- Props: `variant`, `title`, `children`, `dismissible`
- Left border accent using semantic color
- Optional icon
