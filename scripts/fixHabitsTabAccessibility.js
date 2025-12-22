#!/usr/bin/env node

/**
 * Targeted Fix for HabitsTab Components Accessibility
 * Fixes common patterns in all HabitsTab*.jsx files
 */

const fs = require('fs');
const path = require('path');

const masteryPath = path.join(__dirname, '../src/components/mastery');
const habitsTabFiles = fs.readdirSync(masteryPath).filter(f => f.startsWith('HabitsTab') && f.endsWith('.jsx'));

console.log(`Found ${habitsTabFiles.length} HabitsTab files to fix\n`);

habitsTabFiles.forEach(filename => {
  const filePath = path.join(masteryPath, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Tab buttons
  const tabButtonPattern = /(<button[^>]*onClick=\{\(\) => setActiveTab\('([^']+)'\)\}[^>]*)(>[\s\S]*?<(\w+) size=\{20\}[^>]*>[\s\S]*?My Habits|Library)/g;
  if (tabButtonPattern.test(content)) {
    content = content.replace(
      /(<button[^>]*onClick=\{\(\) => setActiveTab\('personal'\)\}[^>]*className="[^"]*"[^>]*)(>)/,
      '$1 role="tab" aria-selected={activeTab === \'personal\'} aria-label="My Habits"$2'
    );
    content = content.replace(
      /(<button[^>]*onClick=\{\(\) => setActiveTab\('library'\)\}[^>]*className="[^"]*"[^>]*)(>)/,
      '$1 role="tab" aria-selected={activeTab === \'library\'} aria-label="Habits Library"$2'
    );
    modified = true;
  }

  // Pattern 2: Add habit button
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setShowAddHabit\(true\)\}[^>]*className="glass-primary-btn"[^>]*)(>)/g,
    '$1 aria-label="Add new custom habit"$2'
  );

  // Pattern 3: Create/Cancel buttons
  content = content.replace(
    /(<button[^>]*onClick=\{createCustomHabit\}[^>]*className="glass-primary-btn"[^>]*)(>[\s\S]{0,50}Create Habit)/g,
    '$1 aria-label="Create new custom habit"$2'
  );
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setShowAddHabit\(false\)\}[^>]*className="glass-secondary-btn"[^>]*)(>[\s\S]{0,50}Cancel)/g,
    '$1 aria-label="Cancel creating habit"$2'
  );

  // Pattern 4: Complete habit buttons (with checkmark)
  const completeButtonMatch = content.match(/onClick=\{\(\) => completeHabit\(habit\.id\)\}/g);
  if (completeButtonMatch) {
    content = content.replace(
      /(<button[^>]*onClick=\{\(\) => completeHabit\(habit\.id\)\}[^>]*className="[^"]*"[^>]*)(>[\s\S]{0,100}<CheckCircle)/g,
      (match, p1, p2) => {
        if (match.includes('aria-label')) return match;
        return p1 + ' aria-label={habit.completed_today ? `Mark ${habit.title} as incomplete` : `Complete ${habit.title}`} aria-pressed={habit.completed_today}' + p2;
      }
    );
    modified = true;
  }

  // Pattern 5: Delete habit buttons
  const deleteButtonMatch = content.match(/onClick=\{\(\) => deleteHabit\(habit\.id\)\}/g);
  if (deleteButtonMatch) {
    content = content.replace(
      /(<button[^>]*onClick=\{\(\) => deleteHabit\(habit\.id\)\}[^>]*)(>[\s\S]{0,100}<Trash2)/g,
      (match, p1, p2) => {
        if (match.includes('aria-label')) return match;
        return p1 + ' aria-label={`Delete habit ${habit.title}`}' + p2;
      }
    );
    modified = true;
  }

  // Pattern 6: Add habit from library button
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => addHabitFromLibrary\(habit\)\}[^>]*className="glass-primary-btn"[^>]*)(>)/g,
    '$1 aria-label={`Add ${habit.title} to your habits`}$2'
  );

  // Pattern 7: Browse library button
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setActiveTab\('library'\)\}[^>]*className="glass-primary-btn"[^>]*)(>[\s\S]{0,50}Browse Library)/g,
    '$1 aria-label="Browse habits library"$2'
  );

  // Pattern 8: Add aria-hidden to icons
  content = content.replace(/<(Plus|CheckCircle|Trash2|Target|Star) size=\{(\d+)\}([^>]*?)(\/?>)/g, (match, icon, size, rest, close) => {
    if (rest.includes('aria-hidden')) return match;
    return `<${icon} size={${size}}${rest} aria-hidden="true"${close}`;
  });

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filename}`);
  } else {
    console.log(`⏭️  Skipped (no changes): ${filename}`);
  }
});

console.log('\n✅ All HabitsTab files processed');

