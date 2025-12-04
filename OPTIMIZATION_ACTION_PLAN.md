# Performance Optimization Action Plan

**Priority:** HIGH - Main bundle is 471 KB (target: < 200 KB)

## 🎯 Goal
Reduce initial bundle size by 57% (from 471 KB to < 200 KB)

## 📊 Current State
- **Main Bundle:** 471 KB ⚠️
- **CSS Bundle:** 136 KB ⚠️
- **Total Initial Load:** 607 KB

## 🚀 Optimization Strategy

### Phase 1: Quick Wins (Target: -150 KB)

#### 1. Optimize lucide-react Imports 🔥
**Current:** 41 files importing from lucide-react  
**Impact:** ~50-100 KB potential savings  
**Action:**
- Verify tree-shaking works
- Use named imports: `import { Icon } from 'lucide-react'`
- Consider icon library alternative if tree-shaking doesn't work

**Files to check:**
- All dashboard widgets
- All mastery tabs
- All pages

#### 2. Optimize @radix-ui Imports 🔥
**Current:** Multiple @radix-ui components  
**Impact:** ~30-50 KB potential savings  
**Action:**
- Verify unused components are tree-shaken
- Check if all components are actually used
- Consider lighter alternatives for simple components

#### 3. Split Main Bundle Further 🔥
**Current:** Main bundle contains all core code  
**Impact:** ~100-150 KB potential savings  
**Action:**
- Split vendor code from app code
- Lazy load non-critical libraries
- Move heavy dependencies to chunks

**Target:** Split main.js into:
- `vendor.js` (React, React-DOM, React-Router) - ~150 KB
- `app.js` (App code) - ~100 KB
- `supabase.js` (Supabase client) - lazy load

### Phase 2: CSS Optimization (Target: -86 KB)

#### 4. Purge Unused Tailwind Classes 🔥
**Current:** 136 KB CSS  
**Impact:** ~50-70 KB potential savings  
**Action:**
- Run Tailwind purge
- Verify purge configuration
- Remove unused styles

#### 5. Split CSS by Route
**Impact:** ~20-30 KB potential savings  
**Action:**
- Split CSS into route-specific chunks
- Load CSS on-demand

### Phase 3: Advanced Optimizations

#### 6. Component-Level Code Splitting
**Impact:** ~30-50 KB potential savings  
**Action:**
- Lazy load heavy components (charts, editors)
- Split dashboard widgets
- Lazy load modals and dialogs

#### 7. Optimize Dependencies
**Impact:** ~20-40 KB potential savings  
**Action:**
- Review all dependencies
- Replace heavy libraries with lighter alternatives
- Remove unused dependencies

## 📋 Implementation Checklist

### Immediate (This Week)
- [ ] Analyze main bundle contents (identify large modules)
- [ ] Verify lucide-react tree-shaking
- [ ] Verify @radix-ui tree-shaking
- [ ] Configure webpack bundle splitting
- [ ] Optimize Tailwind CSS purge

### Short Term (Next Week)
- [ ] Implement vendor chunk splitting
- [ ] Lazy load Supabase client where possible
- [ ] Split CSS by route
- [ ] Component-level code splitting

### Medium Term (Next Sprint)
- [ ] Replace heavy dependencies
- [ ] Implement service worker
- [ ] Advanced caching strategies

## 🎯 Success Metrics

### Target Bundle Sizes
- **Main Bundle:** < 200 KB (from 471 KB)
- **CSS Bundle:** < 50 KB (from 136 KB)
- **Total Initial Load:** < 250 KB (from 607 KB)

### Performance Targets
- **FCP:** < 1.8s
- **LCP:** < 2.5s
- **TTI:** < 3.8s
- **TBT:** < 200ms

## 🔧 Technical Implementation

### Webpack Configuration
Need to configure webpack (via react-app-rewired or eject) to:
1. Split vendor code
2. Optimize chunk sizes
3. Enable better tree-shaking

### Code Changes Needed
1. Optimize imports (lucide-react, @radix-ui)
2. Add more lazy loading
3. Split components further
4. Optimize CSS

## 📝 Notes

- Main bundle is the biggest issue (471 KB)
- CSS is also large (136 KB)
- Code splitting is working but needs refinement
- Focus on reducing initial load first

