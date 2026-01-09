# Neural Path RPG - Learning Roadmap System

## Overview

The Neural Path RPG is a sci-fi gamified learning path system that transforms the traditional roadmap into an immersive neural network experience. This document outlines the new design direction while preserving understanding of the previous roadmap implementation.

---

## Previous System Understanding

### Legacy Roadmap System (Duolingo-style)
The previous system had these key features that should be preserved:

1. **Database Schema**
   - `roadmap_progress` - Tracks user progress through masterschool roadmaps
   - `roadmap_notifications` - Stores notifications about roadmap changes
   - `roadmap_lessons` view - Consolidated view of all lessons sorted by difficulty
   - Enhanced `course_metadata` with `difficulty_numeric` field
   - Enhanced `user_lesson_progress` with tracking fields

2. **Core Functionality**
   - Sequential lesson unlocking (first lesson always unlocked)
   - Time & scroll tracking (5 minutes + 100% scroll required)
   - XP rewards (10 × difficulty level)
   - Skill points awarded for linked stats
   - Lesson completion flow with rewards modal
   - Progress tracking and persistence

3. **Components & Services**
   - `roadmapService.js` - Backend service for roadmap operations
   - `useRoadmapLessonTracking.js` - Hook for tracking lesson progress
   - RoadmapNode, RoadmapPath, LessonTracker components
   - CompleteLessonModal for rewards display

4. **Masterschool Support**
   - System designed for Ignition, Insight, and Transformation masterschools
   - Lessons sorted by difficulty → stat link → course/chapter/lesson

---

## New Design: Neural Path RPG

### Visual Design Philosophy

The new system transforms the learning path into a **neural network visualization** with:

- **Neural Nodes**: Each lesson is a node in a neural network
- **Sci-Fi Aesthetic**: Dark theme with neon accents (blue, red, gold)
- **Interactive Canvas**: Particle effects and animated connections
- **Gamification**: Boss nodes, story cards, mission briefings
- **Immersive UX**: Audio feedback, haptic vibrations, cinematic scrolling

### Key Visual Elements

#### 1. Node States
- **Locked**: Gray core, no halo, dimmed label
- **Active**: White pulsing core, rotating halo, glowing label
- **Completed**: Gray core, subtle glow, muted label
- **Boss**: Red-tinted core, special animations (every 5th node)

#### 2. Neural Connections
- **Chaos Bundles**: Multiple filament paths between nodes
- **Pulse Packets**: Animated data packets traveling along active paths
- **Mouse Proximity**: Connections brighten when mouse is near
- **Active Path Highlighting**: Completed paths glow white, locked paths are dim

#### 3. Interactive Elements
- **HUD**: Top overlay showing sync percentage and sector name
- **Story Cards**: Narrative text appearing between nodes
- **Mission Modal**: Sci-fi styled briefing before starting a lesson
- **Recenter Button**: Floating button to scroll back to active node
- **Navigation Bar**: Bottom nav with Path, Inventory, Network tabs

#### 4. Particle System
- 60 floating particles in background
- Mouse repulsion effect
- Parallax scrolling effect
- Subtle depth simulation

---

## Technical Implementation

### HTML Structure

```html
<!-- HUD Overlay -->
<div class="hud">
  <div class="hud-item">SYNC 85%</div>
  <div class="hud-item">SECTOR ALPHA</div>
</div>

<!-- Scrollable Map Container -->
<div class="map-container">
  <canvas id="neuron-canvas"></canvas>
  <!-- Nodes injected via JS -->
</div>

<!-- Floating Recenter Button -->
<button id="recenter-btn">Recenter</button>

<!-- Mission Modal -->
<div id="modal-overlay">
  <div class="mission-card">
    <!-- Mission briefing -->
  </div>
</div>

<!-- Navigation Bar -->
<div class="nav-bar">
  <!-- Path, Inv, Net tabs -->
</div>
```

### Configuration

```javascript
const CONFIG = {
  count: 35,              // Number of nodes
  spacing: 120,           // Vertical spacing between nodes
  amplitude: 140,        // Horizontal variation
  paddingTop: 300,       // Top padding for intro
  filamentCount: 8,      // Connection filaments per path
  filamentChaos: 25,     // Randomness in connections
  particleCount: 60,     // Background particles
  bossInterval: 5        // Boss node every N nodes
};
```

### State Management

```javascript
const STATE = {
  currentLevel: 12,       // Current active node
  particles: [],          // Particle system
  mouse: { x, y },        // Mouse position for interactions
  audioReady: false       // Web Audio API state
};
```

### Core Functions

1. **Node Creation**
   - Generate nodes with irregular S-curve pattern
   - Assign status: locked, active, completed
   - Mark boss nodes every N intervals
   - Create story cards at intervals

2. **Canvas Rendering**
   - Draw particles with mouse interaction
   - Render chaos bundle connections
   - Animate pulse packets on active paths
   - Draw avatar spark orbiting active node

3. **Interactions**
   - Click handler with shake animation for locked nodes
   - Modal system for mission briefings
   - Audio feedback (hover, click, error sounds)
   - Haptic vibration on interactions

4. **Scroll Management**
   - Cinematic intro scroll to active node
   - Recenter button visibility based on scroll position
   - Story card fade-in on scroll

---

## Integration with Existing System

### Database Integration

The new visual system should integrate with existing database schema:

```javascript
// Use existing roadmapService
import { roadmapService } from './services/roadmapService';

// Fetch lessons
const lessons = await roadmapService.getRoadmapLessons('Ignition');

// Get user progress
const progress = await roadmapService.getUserRoadmapProgress(userId, 'Ignition');

// Check unlock status
const isUnlocked = await roadmapService.isLessonUnlocked(userId, 'Ignition', lessonId);
```

### Component Mapping

| Old Component | New Implementation |
|--------------|-------------------|
| RoadmapNode | Neural node with halo/core/label |
| RoadmapPath | Canvas chaos bundle connections |
| LessonTracker | Mission modal + tracking (keep existing) |
| CompleteLessonModal | Mission completion modal (redesign) |
| RoadmapNotificationBanner | Story cards in neural path |

### State Preservation

- **Node Status**: Map to locked/active/completed states
- **Progress Tracking**: Use existing `roadmap_progress` table
- **Lesson Completion**: Integrate with existing completion flow
- **XP & Rewards**: Keep existing reward system

---

## Implementation Plan

### Phase 1: Core Visual System
1. Create React component structure
2. Implement canvas rendering system
3. Build node component with states
4. Add particle system
5. Implement connection rendering

### Phase 2: Interactions
1. Add click handlers with animations
2. Implement modal system
3. Add audio feedback system
4. Create scroll management
5. Add touch support for mobile

### Phase 3: Integration
1. Connect to roadmapService
2. Map database data to visual nodes
3. Integrate progress tracking
4. Connect lesson completion flow
5. Add navigation routing

### Phase 4: Polish
1. Optimize performance
2. Add loading states
3. Implement error handling
4. Add accessibility features
5. Mobile responsiveness

---

## Key Features to Preserve

### From Old System
- ✅ Sequential unlocking logic
- ✅ Time & scroll tracking (5 min + 100% scroll)
- ✅ XP rewards (10 × difficulty)
- ✅ Skill points system
- ✅ Progress persistence
- ✅ Masterschool support (Ignition/Insight/Transformation)
- ✅ Stat link grouping
- ✅ Notification system

### New Additions
- 🆕 Neural network visualization
- 🆕 Boss node variants
- 🆕 Story cards for narrative
- 🆕 Audio feedback system
- 🆕 Particle effects
- 🆕 Cinematic scrolling
- 🆕 Mission briefing modals
- 🆕 Haptic feedback

---

## Styling Guidelines

### Color Palette
```css
:root {
  --neon-blue: #00f3ff;
  --neon-red: #ff003c;
  --neon-gold: #ffd700;
  --bg-dark: #020202;
  --bg-card: #111;
  --text-primary: #e0e0e0;
  --text-dim: #555;
}
```

### Typography
- Font: 'Rajdhani' (sans-serif)
- Node labels: 11px, uppercase, letter-spacing 2px
- HUD: 14px, letter-spacing 1px
- Modal titles: 24px, bold, tracking-wider

### Animations
- Node pulse: 2s infinite ease-in-out
- Halo rotation: 10s infinite linear
- Shake (locked): 0.4s cubic-bezier
- Modal entrance: 0.4s cubic-bezier scale + translate

---

## File Structure

```
src/
  components/
    neural-path/
      NeuralPath.jsx          # Main container
      NeuralPath.css          # Styles
      Node.jsx                # Individual node component
      Node.css                # Node styles
      CanvasRenderer.js        # Canvas drawing logic
      ParticleSystem.js       # Particle management
      MissionModal.jsx        # Mission briefing modal
      StoryCard.jsx           # Narrative cards
      HUD.jsx                 # Top overlay
      NavigationBar.jsx       # Bottom nav
  services/
    roadmapService.js         # (Existing - keep)
  hooks/
    useRoadmapLessonTracking.js  # (Existing - keep)
    useNeuralPath.js         # New hook for neural path state
  pages/
    NeuralPathIgnition.jsx   # New roadmap page
    NeuralPathInsight.jsx    # (Future)
    NeuralPathTransformation.jsx  # (Future)
```

---

## Migration Strategy

### Step 1: Create New Components
- Build neural path components alongside old roadmap
- Keep old roadmap functional during development
- Test new components in isolation

### Step 2: Data Integration
- Connect new components to existing roadmapService
- Map database data to visual nodes
- Preserve all existing functionality

### Step 3: Route Migration
- Add new routes: `/neural-path/ignition`
- Keep old routes: `/roadmap/ignition` (for fallback)
- Feature flag to switch between old/new

### Step 4: Full Migration
- Replace old roadmap routes
- Remove old roadmap components (or archive)
- Update navigation links

---

## Performance Considerations

### Canvas Optimization
- Use `requestAnimationFrame` for smooth 60fps
- Limit particle count based on device
- Debounce mouse tracking
- Cache connection paths

### React Optimization
- Memoize node components
- Virtualize long node lists
- Lazy load modal content
- Code split neural path pages

### Asset Optimization
- Compress audio files
- Use CSS animations over JS where possible
- Minimize canvas redraws
- Optimize particle calculations

---

## Accessibility

### Keyboard Navigation
- Tab through nodes
- Enter to activate node
- Escape to close modal
- Arrow keys to navigate

### Screen Reader Support
- ARIA labels for nodes
- Status announcements
- Modal descriptions
- Progress announcements

### Visual Accessibility
- High contrast mode option
- Reduced motion option
- Larger touch targets
- Clear focus indicators

---

## Testing Checklist

### Visual Testing
- [ ] Nodes render correctly in all states
- [ ] Connections animate smoothly
- [ ] Particles respond to mouse
- [ ] Modal animations work
- [ ] Scroll behavior is smooth

### Functional Testing
- [ ] Node unlocking works
- [ ] Click handlers fire correctly
- [ ] Modal opens/closes properly
- [ ] Audio plays on interactions
- [ ] Progress updates correctly

### Integration Testing
- [ ] Database data loads correctly
- [ ] Progress persists
- [ ] Lesson completion works
- [ ] Rewards are awarded
- [ ] Navigation works

### Performance Testing
- [ ] 60fps on desktop
- [ ] 30fps minimum on mobile
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Fast modal transitions

---

## Future Enhancements

### Short Term
- [ ] Add more particle effects
- [ ] Expand audio library
- [ ] Add more story cards
- [ ] Implement skill trees
- [ ] Add achievements

### Long Term
- [ ] 3D neural network view
- [ ] VR/AR support
- [ ] Multiplayer progress sharing
- [ ] AI-generated story content
- [ ] Dynamic difficulty adjustment

---

## Notes

- The HTML provided is a standalone prototype
- React conversion will require componentization
- Canvas rendering should be optimized for React
- Audio system needs browser compatibility checks
- Mobile touch interactions need refinement

---

**Last Updated:** January 2025  
**Status:** Design Phase - Ready for Implementation  
**Next Steps:** Create React component structure and begin Phase 1 implementation
