# Stellar Map Troubleshooting Guide

## Quick Diagnosis Checklist

Run through these checks in order:

1. [ ] Database schema exists and has data
2. [ ] Service layer can fetch data
3. [ ] Three.js scenes initialize
4. [ ] Nodes render in 3D space
5. [ ] XP filtering works
6. [ ] Interactions work (click, hover, focus)
7. [ ] Performance is acceptable

## Common Issues and Solutions

### Issue: "Container with ID 'core-ignition3D' not found"

**Cause**: Containers not rendered before Three.js initialization

**Solution**:
- Ensure containers are always in DOM (not conditionally rendered)
- Use `visibility: hidden` instead of `display: none`
- Wait for DOM to be ready before initializing scenes

**Check**:
```javascript
// In browser console:
document.getElementById('core-ignition3D') // Should not be null
```

### Issue: Empty map (no nodes visible)

**Possible Causes**:
1. No data in database
2. XP filtering too restrictive
3. Data structure mismatch
4. Service layer error

**Diagnosis Steps**:
1. Check browser console for errors
2. Check Network tab for API calls
3. Verify user XP is sufficient
4. Check database has nodes

**Solution**:
```sql
-- Check if data exists
SELECT COUNT(*) FROM stellar_map_nodes;
SELECT COUNT(*) FROM constellations;
SELECT COUNT(*) FROM constellation_families;
```

### Issue: Black screen or only background visible

**Possible Causes**:
1. Three.js scenes not initializing
2. Renderer not added to DOM
3. Animation loop not running
4. Camera positioned incorrectly

**Diagnosis Steps**:
1. Check browser console for Three.js errors
2. Verify canvas elements exist in DOM
3. Check if animation loop is running
4. Inspect scene objects in console

**Solution**:
- Check `ThreeSceneManager` initialized correctly
- Verify `startAnimation()` is called
- Check camera position and controls

### Issue: Nodes not positioned correctly

**Possible Causes**:
1. Positioning calculations wrong
2. Data structure mismatch
3. Missing constellation/family data

**Diagnosis Steps**:
1. Check hierarchy data structure
2. Verify positioning utilities work
3. Check node data has required fields

**Solution**:
- Verify data structure: `{ familyName: { constellationName: [nodes] } }`
- Check nodes have `difficulty`, `constellationAlias`, `familyAlias`
- Verify positioning functions receive correct parameters

## Database Troubleshooting

### Verify Schema Exists

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%stellar%' OR table_name LIKE '%constellation%');
```

**Expected Tables**:
- `constellation_families`
- `constellations`
- `stellar_map_nodes`

### Verify Data Exists

```sql
-- Count records
SELECT COUNT(*) as family_count FROM constellation_families;
SELECT COUNT(*) as constellation_count FROM constellations;
SELECT COUNT(*) as node_count FROM stellar_map_nodes;

-- Check data structure
SELECT id, name, level, color_hex 
FROM constellation_families 
LIMIT 5;

SELECT id, name, family_id, level 
FROM constellations 
LIMIT 10;

SELECT id, title, constellation_id, difficulty, xp_threshold 
FROM stellar_map_nodes 
LIMIT 10;
```

### Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('constellation_families', 'constellations', 'stellar_map_nodes');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('constellation_families', 'constellations', 'stellar_map_nodes');
```

### Verify Relationships

```sql
-- Check constellation-family relationships
SELECT 
  c.name as constellation,
  cf.name as family,
  cf.level
FROM constellations c
JOIN constellation_families cf ON c.family_id = cf.id
LIMIT 20;

-- Check node-constellation relationships
SELECT 
  n.title,
  n.difficulty,
  c.name as constellation,
  cf.name as family
FROM stellar_map_nodes n
JOIN constellations c ON n.constellation_id = c.id
JOIN constellation_families cf ON c.family_id = cf.id
LIMIT 20;
```

## Service Layer Troubleshooting

### Check Service Connection

```javascript
// In browser console:
import stellarMapService from './services/stellarMapService';

// Test connection
const { data, error } = await stellarMapService.getFamiliesByLevel('Ignition');
console.log('Families:', data, 'Error:', error);
```

### Check Service Methods

```javascript
// Test each method
const userXP = 10000; // Your test XP

// Test getFamiliesByLevel
const { data: families } = await stellarMapService.getFamiliesByLevel('Ignition');
console.log('Families:', families);

// Test getNodesGroupedByHierarchy
const { data: grouped } = await stellarMapService.getNodesGroupedByHierarchy('Ignition', userXP);
console.log('Grouped nodes:', grouped);
```

### Check Data Format

The service should return:
```javascript
{
  "Veil Piercers": {
    "Puppet Masters": [
      { id: "...", title: "...", difficulty: 5, ... }
    ]
  }
}
```

## Component Troubleshooting

### Check Component State

Add debug logging to `StellarMap.jsx`:
```javascript
useEffect(() => {
  console.log('Current Core:', currentCore);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Hierarchy Data:', hierarchyData);
  console.log('User XP:', visibilityData.userXP);
}, [currentCore, loading, error, hierarchyData, visibilityData]);
```

### Check Hooks

```javascript
// In browser console, check hook returns:
const visibilityData = useXPVisibility();
console.log('Visibility Data:', visibilityData);
```

### Check Data Flow

1. Service fetches data → `hierarchyData` state updated
2. `hierarchyData` changes → `NodeRenderer.render()` called
3. Nodes rendered → `nodeMeshes` updated
4. `nodeMeshes` updated → `InteractionManager` updated

## Three.js Rendering Troubleshooting

### Check Container Initialization

```javascript
// In browser console:
const container = document.getElementById('core-ignition3D');
console.log('Container:', container);
console.log('Dimensions:', container?.clientWidth, container?.clientHeight);
console.log('Display:', window.getComputedStyle(container).display);
console.log('Visibility:', window.getComputedStyle(container).visibility);
```

### Check Scene Creation

```javascript
// In StellarMap component, add:
useEffect(() => {
  const manager = sceneManagerRef.current;
  if (manager) {
    const scene = manager.getScene('Ignition');
    console.log('Scene:', scene);
    console.log('Scene children:', scene?.scene?.children);
  }
}, []);
```

### Check Node Rendering

```javascript
// After rendering, check:
const renderer = nodeRendererRef.current[currentCore];
console.log('Rendered objects:', renderer?.renderedObjects?.length);
console.log('Node meshes:', nodeMeshesRef.current.length);
```

### Check Animation Loop

```javascript
// Verify animation is running
// Check browser DevTools Performance tab
// Should see continuous requestAnimationFrame calls
```

## XP Visibility Troubleshooting

### Check XP Retrieval

```javascript
// In browser console:
const { profile } = useAuth();
console.log('User XP:', profile?.current_xp);

// Or directly:
const { data } = await supabase
  .from('profiles')
  .select('current_xp')
  .eq('id', userId)
  .single();
console.log('XP from DB:', data?.current_xp);
```

### Check Visibility Logic

```javascript
// Test visibility calculation
import { getCurrentGroup, DEPTH_RANGES } from './hooks/useXPVisibility';

const userXP = 10000;
const coreName = 'Ignition';
const group = getCurrentGroup(coreName, userXP);
const range = DEPTH_RANGES[group];

console.log('Group:', group);
console.log('Range:', range);
console.log('Should show difficulties:', range[0], 'to', range[1]);
```

### Check Data Filtering

```sql
-- Test XP filtering in database
-- Replace 10000 with your user's XP
SELECT 
  n.title,
  n.difficulty,
  n.xp_threshold,
  CASE 
    WHEN n.xp_threshold <= 10000 THEN 'Visible'
    ELSE 'Hidden (XP too low)'
  END as visibility
FROM stellar_map_nodes n
JOIN constellations c ON n.constellation_id = c.id
WHERE c.level = 'Ignition'
ORDER BY n.difficulty;
```

## Interaction Troubleshooting

### Check Event Listeners

```javascript
// Verify listeners are attached
const canvas = document.querySelector('#core-ignition3D canvas');
console.log('Canvas:', canvas);
// Check Event Listeners in DevTools Elements panel
```

### Check Raycasting

```javascript
// Add debug to InteractionManager.handleMouseMove
console.log('Mouse:', mouse.x, mouse.y);
console.log('Intersects:', intersects);
console.log('Hit info:', hitInfo);
```

### Check Node Selection

```javascript
// Verify nodes have correct userData
nodeMeshesRef.current.forEach(mesh => {
  console.log('Mesh:', mesh.userData);
  console.log('Has _is3DSubnode:', mesh.userData?._is3DSubnode);
});
```

## Performance Troubleshooting

### Check Render Optimization

```javascript
// Monitor frame rate
let lastTime = performance.now();
let frameCount = 0;

function checkFPS() {
  frameCount++;
  const currentTime = performance.now();
  if (currentTime >= lastTime + 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = currentTime;
  }
  requestAnimationFrame(checkFPS);
}
checkFPS();
```

### Check Memory Leaks

1. Open Chrome DevTools → Memory tab
2. Take heap snapshot before using Stellar Map
3. Use Stellar Map (switch cores, interact)
4. Take another heap snapshot
5. Compare - should not see continuous growth

### Check Node Count

```javascript
// Count total nodes being rendered
const totalNodes = Object.values(hierarchyData).reduce((sum, constellations) => {
  return sum + Object.values(constellations).reduce((s, nodes) => s + nodes.length, 0);
}, 0);
console.log('Total nodes:', totalNodes);
```

## Mobile Troubleshooting

### Check Touch Events

```javascript
// Test touch events
const canvas = document.querySelector('#core-ignition3D canvas');
canvas.addEventListener('touchstart', (e) => {
  console.log('Touch start:', e.touches);
});
```

### Check Mobile Layout

1. Open DevTools → Toggle device toolbar
2. Test on various screen sizes
3. Verify controls are accessible
4. Check touch targets are 44px minimum

## Debug Mode

### Enable Debug Logging

Add to `StellarMap.jsx`:
```javascript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('[StellarMap] Current core:', currentCore);
  console.log('[StellarMap] Hierarchy data:', hierarchyData);
  console.log('[StellarMap] Node meshes:', nodeMeshesRef.current.length);
}
```

### Visual Debug Overlay

Create a debug overlay component that shows:
- Current core
- User XP
- Visibility group
- Node count
- FPS
- Scene info

## Error Recovery

### Graceful Degradation

1. If Three.js fails → Show error message with reload button
2. If data fetch fails → Show error with retry button
3. If rendering fails → Show fallback UI
4. If interactions fail → Disable interactive features

### Error Messages

Common error messages and solutions:

- **"Container not found"** → Ensure containers are in DOM before initialization
- **"Scene initialization failed"** → Check Three.js is loaded, check browser compatibility
- **"No data found"** → Check database has data, check RLS policies
- **"Service error"** → Check Supabase connection, check environment variables

## Testing Checklist

Before deploying, verify:

- [ ] All three cores render correctly
- [ ] Nodes appear in correct positions
- [ ] XP filtering works for all visibility groups
- [ ] Clicking nodes opens links
- [ ] Hover shows tooltips
- [ ] Constellation focus works
- [ ] Subnode focus works
- [ ] Core switching is smooth
- [ ] White lines toggle works
- [ ] Mobile layout works
- [ ] Touch interactions work
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] No memory leaks
- [ ] Error handling works

## Getting Help

If issues persist:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Check database for data
4. Verify environment variables
5. Test with different user XP levels
6. Check Three.js version compatibility
7. Verify all dependencies are installed

## Quick Fixes

### Reset Everything

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Re-render

```javascript
// In React DevTools, find StellarMap component
// Force update or change a prop to trigger re-render
```

### Clear Three.js Cache

```javascript
// Manually dispose and recreate
const manager = sceneManagerRef.current;
if (manager) {
  manager.dispose();
  // Re-initialize
}
```
