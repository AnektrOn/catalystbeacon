# 🎨 Color Palette System - Location & Usage

## Where Color Palettes Are Stored

**Location:** `src/config/colorPalettes.js`

This file contains **9 color palettes**:
1. **ocean** - Ocean Blue
2. **forest** - Forest Green  
3. **sunset** - Sunset Orange
4. **royal** - Royal Purple
5. **teal** - Ocean Teal
6. **rose** - Rose Pink
7. **dark** - Dark Mode
8. **midnight** - Midnight Blue
9. **earth** - Earth Tone (default)

## How It Works

1. **Color Palette Switcher** (`src/utils/colorPaletteSwitcher.js`)
   - Applies CSS variables to `document.documentElement`
   - Saves selection to localStorage
   - Dispatches `colorPaletteChanged` event

2. **Color Palette Dropdown** (`src/components/common/ColorPaletteDropdown.jsx`)
   - Shows all available palettes
   - Displays preview with primary color and gradient
   - Located in the header (right side)

3. **CSS Variables Applied**
   - All palettes define the same CSS variable names
   - Components use these variables via `var(--color-primary)`, etc.
   - Header and sidebar backgrounds now use these variables

## What Changes With Color Palette

✅ **Header Background** - Uses `var(--bg-primary)` with transparency
✅ **Header Border** - Uses `var(--color-primary)` 
✅ **Sidebar Background** - Uses gradient with `var(--color-primary)` and `var(--color-earth-green)`
✅ **Sidebar Border** - Uses `var(--color-primary)`
✅ **Background Gradient** - Uses `var(--color-old-lace)`, `var(--color-bone)`, `var(--color-primary)`
✅ **All Glass Effects** - Use `var(--bg-primary)` and `var(--color-primary)`

## If You Only See 2 Colors

The color palette dropdown should show **9 palettes**. If you only see 2:
1. Check browser console for errors
2. Verify `getAllPalettes()` returns all 9 palettes
3. Check if the dropdown is being cut off (CSS overflow issue)

## Testing

To verify all palettes are available:
```javascript
import { getAllPalettes } from './utils/colorPaletteSwitcher';
console.log('All palettes:', Object.keys(getAllPalettes()));
// Should show: ['ocean', 'forest', 'sunset', 'royal', 'teal', 'rose', 'dark', 'midnight', 'earth']
```

