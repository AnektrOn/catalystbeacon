# Quick Reference: Manual Accessibility Fixes

**Quick guide for fixing remaining accessibility issues**

---

## 🔧 Common Patterns

### Pattern 1: Icon-Only Button
```jsx
// ❌ Before
<button onClick={handleClick}>
  <Icon size={18} />
</button>

// ✅ After
<button 
  onClick={handleClick}
  aria-label="Descriptive action name"
>
  <Icon size={18} aria-hidden="true" />
</button>
```

### Pattern 2: Form Input
```jsx
// ❌ Before
<input type="text" placeholder="Enter name" />

// ✅ After
<label htmlFor="name-input">Name</label>
<input 
  id="name-input"
  type="text" 
  placeholder="Enter name"
/>
```

### Pattern 3: Image
```jsx
// ❌ Before
<img src={url} />

// ✅ After
<img src={url} alt="Descriptive text" />

// ✅ Decorative image
<img src={url} alt="" role="presentation" />
```

### Pattern 4: Button with Icon + Text
```jsx
// ✅ Already accessible (has visible text)
<button onClick={handleClick}>
  <Icon size={18} />
  Save Changes
</button>
```

---

## 📋 File-by-File Quick Fixes

### AppShellMobile.jsx (16 issues)
**Lines to fix:** 168, 177, 180, 183, 186, 205, 212, 238, 252, 267

**Quick fix:**
```jsx
// Find: <button className="glass-icon-btn">
// Add: aria-label="Navigation item name"
```

### CalendarTab.jsx (17 issues)
**Lines to fix:** 515, 531, 541, 552, 563, 581, 726, 741, 763, 788, 794, 823, 923, 972, 978, 1003, 1132

**Quick fix:**
- Navigation buttons: `aria-label="Previous month"` / `"Next month"`
- Action buttons: `aria-label="Save"` / `"Cancel"` / `"Delete event"`
- Date buttons: `aria-label="Select {date}"`

### HabitsTab Components (50+ issues)
**Pattern:**
```jsx
// Habit completion
<button 
  onClick={() => handleComplete(habit.id)}
  aria-label={`Mark ${habit.name} as complete`}
  aria-pressed={habit.completed}
>

// Habit edit
<button 
  onClick={() => handleEdit(habit.id)}
  aria-label={`Edit ${habit.name}`}
>
```

---

## ⚡ Fast Fix Script

Run this to see all buttons without aria-labels:

```bash
grep -rn "<button" src/ | grep -v "aria-label" | head -50
```

---

## ✅ Verification

After fixes, test with:
1. Browser DevTools → Accessibility panel
2. `npm run test:deep` - Check accessibility section
3. Keyboard navigation (Tab through all interactive elements)

---

**See MANUAL_ACTION_REPORT.md for detailed instructions**
