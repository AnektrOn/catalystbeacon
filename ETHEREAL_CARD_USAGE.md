# Ethereal Card Design System

The XPCircleWidget card design has been extracted into reusable components that can be applied everywhere in your app.

## Components Available

### 1. `EtherealCard` (New Component)
A standalone component matching the XPCircleWidget design exactly.

**Location:** `src/components/common/EtherealCard.jsx`

**Usage:**
```jsx
import EtherealCard from '../components/common/EtherealCard'

<EtherealCard 
  size="medium" // 'small' | 'medium' | 'large'
  elevated={false}
  interactive={true}
  withParticles={true}
  onClick={() => {}}
>
  <div>Your content here</div>
</EtherealCard>
```

### 2. `ModernCard` (Updated)
The existing ModernCard component has been updated to match the XPCircleWidget design.

**Location:** `src/components/dashboard/ModernCard.jsx`

**Usage:**
```jsx
import ModernCard from '../components/dashboard/ModernCard'

<ModernCard 
  size="medium"
  elevated={true}
  interactive={true}
  className="modern-card-with-particles" // Optional: adds particle effect
>
  <div>Your content here</div>
</ModernCard>
```

## Design Features

The ethereal card design includes:
- **Glassmorphism**: `rgba(8, 8, 12, 0.4)` background with `blur(20px)`
- **Ambient Lighting**: Breathing light source animation
- **Floating Particles**: Optional animated particles
- **Ethereal Shadows**: Multi-layered shadows with cyan glow
- **Smooth Transitions**: 0.5s ease transitions
- **Hover Effects**: Enhanced glow and border on hover

## CSS Variables

You can customize the design using CSS variables:

```css
:root {
  --ethereal-bg: rgba(8, 8, 12, 0.4);
  --ethereal-border: rgba(255, 255, 255, 0.08);
  --ethereal-cyan: #a5f3fc;
  --ethereal-white: #ffffff;
  --ethereal-violet: #a78bfa;
}
```

## Migration Guide

### Replace `glass-card-premium` classes:

**Before:**
```jsx
<div className="glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300">
  Content
</div>
```

**After:**
```jsx
import ModernCard from '../components/dashboard/ModernCard'

<ModernCard size="medium" interactive>
  Content
</ModernCard>
```

### Replace custom card implementations:

**Before:**
```jsx
<div className="custom-card">
  Content
</div>
```

**After:**
```jsx
import EtherealCard from '../components/common/EtherealCard'

<EtherealCard size="medium">
  Content
</EtherealCard>
```

## Examples

### Dashboard Widget
```jsx
import ModernCard from '../components/dashboard/ModernCard'

<ModernCard elevated interactive>
  <h3>Widget Title</h3>
  <p>Widget content</p>
</ModernCard>
```

### Landing Page Card
```jsx
import EtherealCard from '../components/common/EtherealCard'

<EtherealCard size="large" withParticles interactive>
  <h2>Feature Title</h2>
  <p>Feature description</p>
</EtherealCard>
```

### Stat Card
```jsx
import ModernCard from '../components/dashboard/ModernCard'

<ModernCard size="small">
  <div className="stat-value">42</div>
  <div className="stat-label">Total</div>
</ModernCard>
```

## Size Variants

- **small**: `padding: 24px`, `borderRadius: 20px`
- **medium**: `padding: 32px`, `borderRadius: 24px` (default)
- **large**: `padding: 40px`, `borderRadius: 28px`

## Props

### EtherealCard Props:
- `children` (ReactNode): Card content
- `className` (string): Additional CSS classes
- `size` ('small' | 'medium' | 'large'): Card size variant
- `elevated` (boolean): Enhanced shadow effect
- `interactive` (boolean): Hover and click interactions
- `withParticles` (boolean): Show floating particles
- `onClick` (function): Click handler
- `style` (object): Inline styles

### ModernCard Props:
- Same as EtherealCard, plus:
- `className`: Can use `modern-card-with-particles` for particle effect

## Performance Notes

- Particles are lightweight CSS animations
- Backdrop filters may impact performance on older devices
- Consider disabling particles on mobile if needed
