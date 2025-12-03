---
description: Earth Tone Color Palette and Usage Guide
---

# Earth Tone Color Palette

This project uses a specific earth-tone color palette to create a warm, premium, and grounded aesthetic.

## Core Colors

| Color Name       | Hex Code  | Tailwind Variable      | Usage                                      |
| ---------------- | --------- | ---------------------- | ------------------------------------------ |
| **Old Lace**     | `#F7F1E1` | `--color-old-lace`     | Light background, badges (Free tier)       |
| **Bone**         | `#E3D8C1` | `--color-bone`         | Secondary light background, badges         |
| **Dark Goldenrod**| `#B4833D` | `--color-dark-goldenrod`| Primary action color, active states, icons |
| **Kobicha**      | `#66371B` | `--color-kobicha`      | Dark text, strong borders, deep accents    |
| **Coyote**       | `#81754B` | `--color-coyote`       | Secondary accents, borders, muted text     |
| **Earth Green**  | `#3F3F2C` | `--color-earth-green`  | Dark mode backgrounds, deep accents        |

## Gradients

*   **Primary Gradient**: `linear-gradient(135deg, #B4833D 0%, #66371B 100%)`
    *   Used for: Active navigation items, primary buttons.
*   **Secondary Gradient**: `linear-gradient(135deg, #81754B 0%, #3F3F2C 100%)`
    *   Used for: Secondary cards, headers.
*   **Warm Gradient**: `linear-gradient(135deg, #F7F1E1 0%, #E3D8C1 100%)`
    *   Used for: Light mode backgrounds.
*   **Earth Gradient**: `linear-gradient(135deg, #B4833D 0%, #81754B 50%, #3F3F2C 100%)`
    *   Used for: Main dashboard headers, feature highlights.

## Glassmorphism

The `glassmorphism.css` file has been updated to use these colors.
*   **Buttons**: `glass-primary-btn` uses the Primary Gradient.
*   **Active States**: `glass-nav-btn-active`, `glass-tab-btn-active` use Dark Goldenrod (`#B4833D`).
*   **Focus Rings**: Inputs and buttons use a 50% opacity Dark Goldenrod ring.

## Usage in Code

When adding new components, prefer using the CSS variables or the specific hex codes to maintain consistency.

Example:
```jsx
<div className="bg-[#B4833D] text-white">...</div>
// or
<div style={{ backgroundColor: 'var(--color-dark-goldenrod)' }}>...</div>
```

## Mobile Responsiveness

*   The desktop sidebar (`.app-shell-sidebar`) is hidden on screens smaller than 1023px.
*   Mobile navigation is handled by a separate bottom nav or hamburger menu (implementation details in `AppShellMobile.jsx` or similar).
