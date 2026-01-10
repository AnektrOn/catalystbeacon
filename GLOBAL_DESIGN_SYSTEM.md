# Global Ethereal Design System

## Overview
All components now use a unified design system based on the XPCircleWidget design. Everything uses the same fonts, colors, and card styles.

## Global CSS Variables

### Fonts
- `--font-ethereal-body`: 'Rajdhani', sans-serif (used everywhere)
- `--font-ethereal-heading`: 'Cinzel', serif (used for headings/labels)

### Colors
- `--ethereal-cyan`: #a5f3fc
- `--ethereal-white`: #ffffff
- `--ethereal-violet`: #a78bfa
- `--ethereal-text`: #e0e0e0
- `--ethereal-bg-glass`: rgba(8, 8, 12, 0.4)
- `--ethereal-border`: rgba(255, 255, 255, 0.08)
- `--ethereal-border-hover`: rgba(255, 255, 255, 0.15)
- `--ethereal-bg-hover`: rgba(20, 20, 25, 0.6)
- `--ethereal-light-color`: rgba(165, 243, 252, 0.08)

### Card Shadows
- `--ethereal-shadow-base`: Base shadow for cards
- `--ethereal-shadow-hover`: Hover shadow
- `--ethereal-shadow-elevated`: Elevated card shadow

### Card Sizing
- `--ethereal-card-padding-small`: 24px
- `--ethereal-card-padding-medium`: 32px
- `--ethereal-card-padding-large`: 40px
- `--ethereal-card-radius`: 24px
- `--ethereal-card-radius-small`: 20px
- `--ethereal-card-radius-large`: 28px
- `--ethereal-card-blur`: 20px

## Usage

### Using the Global Card Class
```jsx
<div className="ethereal-card">
  Your content
</div>

// With variants
<div className="ethereal-card elevated interactive size-small">
  Your content
</div>
```

### Using Components
```jsx
import ModernCard from '../components/dashboard/ModernCard'
import EtherealCard from '../components/common/EtherealCard'

// Both use the same global variables
<ModernCard elevated interactive>
  Content
</ModernCard>

<EtherealCard size="medium" withParticles>
  Content
</EtherealCard>
```

### Typography Classes
```jsx
<h1 className="ethereal-heading">Heading</h1>
<p className="ethereal-body">Body text</p>
```

### Centering
```jsx
<div className="ethereal-center">Centered content</div>
<div className="ethereal-center-content">Flex centered</div>
```

## Files Updated

1. **src/index.css** - Added global CSS variables
2. **src/styles/ethereal-design-system.css** - Global card styles and utilities
3. **src/index.js** - Imports the design system CSS
4. **All card components** - Now use global variables

## Benefits

- ✅ Single source of truth for design
- ✅ Consistent fonts everywhere (Rajdhani + Cinzel)
- ✅ Consistent card styling
- ✅ Easy to update globally
- ✅ Proper centering with auto margins
- ✅ No more duplicate CSS

## Migration

All components automatically use the global system. No changes needed unless you want to customize specific instances.
