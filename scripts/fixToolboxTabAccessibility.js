#!/usr/bin/env node

/**
 * Targeted Fix for ToolboxTab Components Accessibility
 * Fixes common patterns in all ToolboxTab*.jsx files
 */

const fs = require('fs');
const path = require('path');

const masteryPath = path.join(__dirname, '../src/components/mastery');
const toolboxTabFiles = fs.readdirSync(masteryPath).filter(f => f.startsWith('ToolboxTab') && f.endsWith('.jsx'));

console.log(`Found ${toolboxTabFiles.length} ToolboxTab files to fix\n`);

toolboxTabFiles.forEach(filename => {
  const filePath = path.join(masteryPath, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Tab buttons
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setActiveTab\('my-toolbox'\)\}[^>]*className="[^"]*"[^>]*)(>)/,
    '$1 role="tab" aria-selected={activeTab === \'my-toolbox\'} aria-label="My Toolbox"$2'
  );
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setActiveTab\('library'\)\}[^>]*className="[^"]*"[^>]*)(>)/,
    '$1 role="tab" aria-selected={activeTab === \'library\'} aria-label="Toolbox Library"$2'
  );

  // Pattern 2: Add tool button
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setShowAddTool\(true\)\}[^>]*className="glass-primary-btn"[^>]*)(>)/g,
    '$1 aria-label="Add new custom tool"$2'
  );

  // Pattern 3: Create/Cancel buttons
  content = content.replace(
    /(<button[^>]*onClick=\{createCustomTool\}[^>]*className="glass-primary-btn"[^>]*)(>[\s\S]{0,50}Create Tool)/g,
    '$1 aria-label="Create new custom tool"$2'
  );
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setShowAddTool\(false\)\}[^>]*className="glass-secondary-btn"[^>]*)(>[\s\S]{0,50}Cancel)/g,
    '$1 aria-label="Cancel creating tool"$2'
  );

  // Pattern 4: Use tool buttons
  const useToolMatch = content.match(/onClick=\{\(\) => useTool\(tool\.id\)\}/g);
  if (useToolMatch) {
    content = content.replace(
      /(<button[^>]*onClick=\{\(\) => useTool\(tool\.id\)\}[^>]*)(>)/g,
      (match, p1, p2) => {
        if (match.includes('aria-label')) return match;
        return p1 + ' aria-label={`Use tool: ${tool.title}`}' + p2;
      }
    );
    modified = true;
  }

  // Pattern 5: Delete tool buttons
  const deleteToolMatch = content.match(/onClick=\{\(\) => deleteTool\(tool\.id\)\}/g);
  if (deleteToolMatch) {
    content = content.replace(
      /(<button[^>]*onClick=\{\(\) => deleteTool\(tool\.id\)\}[^>]*)(>)/g,
      (match, p1, p2) => {
        if (match.includes('aria-label')) return match;
        return p1 + ' aria-label={`Delete tool ${tool.title}`}' + p2;
      }
    );
    modified = true;
  }

  // Pattern 6: Add tool from library button
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => addToolFromLibrary\(tool\)\}[^>]*className="glass-primary-btn"[^>]*)(>)/g,
    '$1 aria-label={`Add ${tool.title} to your toolbox`}$2'
  );

  // Pattern 7: Browse library button
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setActiveTab\('library'\)\}[^>]*className="glass-primary-btn"[^>]*)(>[\s\S]{0,50}Browse Library)/g,
    '$1 aria-label="Browse toolbox library"$2'
  );

  // Pattern 8: Add aria-hidden to icons
  content = content.replace(/<(Plus|CheckCircle|Trash2|Target|Star|Wrench|Tool|Hammer|Settings) size=\{(\d+)\}([^>]*?)(\/?>)/g, (match, icon, size, rest, close) => {
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

console.log('\n✅ All ToolboxTab files processed');

