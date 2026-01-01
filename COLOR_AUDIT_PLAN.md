# Complete Color Audit Plan

## Goal
Replace ALL hardcoded colors with CSS variables from the color palette system.
**Exception**: Main background can use user's custom background image.

## Color Variables Available
- `--color-primary` - Main accent
- `--color-secondary` - Secondary accent
- `--color-success` - Success states
- `--color-warning` - Warning states
- `--color-error` - Error states
- `--color-info` - Info states
- `--bg-primary` - Main background
- `--bg-secondary` - Secondary background
- `--text-primary` - Primary text
- `--text-secondary` - Secondary/muted text
- `--color-old-lace` - Light background (legacy)
- `--color-bone` - Secondary light (legacy)
- `--color-dark-goldenrod` - Primary accent (legacy, maps to primary)
- `--color-kobicha` - Dark text (legacy, maps to text-primary)
- `--color-coyote` - Secondary text (legacy, maps to text-secondary)
- `--color-earth-green` - Dark background (legacy)
- `--gradient-primary` - Primary gradient
- `--gradient-secondary` - Secondary gradient
- `--gradient-warm` - Warm gradient
- `--gradient-earth` - Earth gradient

## Replacement Rules

### Text Colors
- `text-gray-900` → `color: var(--text-primary)`
- `text-gray-800` → `color: var(--text-primary)`
- `text-gray-700` → `color: var(--text-primary)`
- `text-gray-600` → `color: var(--text-secondary)`
- `text-gray-500` → `color: var(--text-secondary)`
- `text-gray-400` → `color: var(--text-secondary)`
- `text-white` → `color: var(--text-primary)` (or white if on colored bg)
- `dark:text-white` → Remove, use `var(--text-primary)` which adapts
- `dark:text-gray-*` → Remove, use appropriate CSS variable

### Background Colors
- `bg-gray-*` → `backgroundColor: var(--bg-primary)` or `var(--bg-secondary)`
- `bg-white` → `backgroundColor: var(--bg-primary)`
- `bg-black` → `backgroundColor: var(--bg-secondary)`
- `bg-white/50` → `backgroundColor: color-mix(in srgb, var(--bg-primary) 50%, transparent)`
- `bg-black/20` → `backgroundColor: color-mix(in srgb, var(--bg-secondary) 20%, transparent)`

### Border Colors
- `border-gray-*` → `borderColor: color-mix(in srgb, var(--color-primary) 20%, transparent)`
- `border-white/10` → `borderColor: color-mix(in srgb, var(--bg-primary) 10%, transparent)`

### Semantic Colors
- `text-purple-500` → `color: var(--color-primary)` or appropriate semantic
- `bg-amber-*` → `backgroundColor: var(--color-warning)`
- `text-amber-*` → `color: var(--color-warning)`
- `from-amber-*` / `to-amber-*` → Use `var(--color-warning)` in gradients

## Files to Fix (Priority Order)

### High Priority (User-Facing)
1. ✅ Dashboard widgets (in progress)
2. Mastery pages
3. Course pages
4. Profile page
5. Common components (modals, buttons)

### Medium Priority
6. Stellar Map components
7. Settings page
8. Community page

### Low Priority
9. Landing pages (can keep some branding colors)
10. Test/debug components

## Progress Tracking
- [x] Created audit plan
- [ ] Dashboard widgets
- [ ] Mastery pages
- [ ] Course pages
- [ ] Profile page
- [ ] Common components
- [ ] Stellar Map
- [ ] Other pages

