# Color Palette Analysis & Zone Mapping

## Color Variables Used in Codebase

### Primary Colors
- `--color-primary` - Main brand/accent color
- `--color-secondary` - Secondary accent color

### Semantic Colors
- `--color-success` - Success states (green)
- `--color-warning` - Warning states (orange/yellow)
- `--color-error` - Error states (red)
- `--color-info` - Info states (blue)

### Background Colors
- `--bg-primary` - Main background color
- `--bg-secondary` - Secondary background color

### Text Colors
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary/muted text color

### Earth Tone Palette (Legacy Support)
- `--color-old-lace` - Light background (maps to bg-primary)
- `--color-bone` - Secondary light background (maps to bg-secondary)
- `--color-dark-goldenrod` - Primary accent (maps to color-primary)
- `--color-kobicha` - Dark text (maps to text-primary)
- `--color-coyote` - Secondary text (maps to text-secondary)
- `--color-earth-green` - Dark background (used in gradients)

### Gradients
- `--gradient-primary` - Primary gradient (primary to dark)
- `--gradient-secondary` - Secondary gradient
- `--gradient-warm` - Warm background gradient
- `--gradient-earth` - Earth tone gradient

## Zone Mapping

### Header Zone
- **Background**: `var(--bg-primary)` with 85% opacity
- **Border**: `var(--color-primary)` with 30% opacity
- **Text**: `var(--text-primary)`
- **Shadow**: `var(--color-primary)` with 20% opacity

### Sidebar Zone
- **Background**: Gradient from `var(--color-primary)` to `var(--color-earth-green)` (10% opacity each)
- **Border**: `var(--color-primary)` with 20% opacity
- **Text**: `var(--text-primary)` for labels, `var(--text-secondary)` for buttons
- **Active Button**: `var(--gradient-primary)` background, `var(--text-primary)` text

### Background Zone
- **Default Gradient**: `var(--color-old-lace)` → `var(--color-bone)` → `var(--color-primary)`
- **Blur Shapes**: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-kobicha)` with 20% opacity

### Navigation Buttons
- **Default**: `var(--text-secondary)` text, transparent background
- **Hover**: `var(--color-primary)` with 10% opacity background
- **Active**: `var(--gradient-primary)` background, `var(--text-primary)` text

### Icons & Accents
- **Primary Icons**: `var(--color-primary)` color
- **Focus Rings**: `var(--color-primary)` with 50% opacity

## New Palettes Added

### 1. Black & White (`blackwhite`)
- **Base**: Pure white background, black text
- **Accent**: Blue (#3B82F6) for primary actions
- **Use Case**: Clean, professional, high contrast

### 2. White & Black (`whiteblack`)
- **Base**: Pure black background, white text
- **Accent**: Light blue (#60A5FA) for primary actions
- **Use Case**: Dark theme with high contrast

## All Palettes (11 total)

1. **ocean** - Ocean Blue
2. **forest** - Forest Green
3. **sunset** - Sunset Orange
4. **royal** - Royal Purple
5. **teal** - Ocean Teal
6. **rose** - Rose Pink
7. **dark** - Dark Mode
8. **midnight** - Midnight Blue
9. **earth** - Earth Tone (default)
10. **blackwhite** - Black & White (NEW)
11. **whiteblack** - White & Black (NEW)

## Fixed Issues

✅ Replaced all hardcoded `text-gray-*` classes with CSS variables
✅ Header background now uses `var(--bg-primary)`
✅ Sidebar background uses palette colors
✅ Navigation buttons use `var(--text-secondary)` and `var(--text-primary)`
✅ All zones now properly respond to color palette changes

