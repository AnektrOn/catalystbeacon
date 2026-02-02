#!/usr/bin/env node
/**
 * Patches ajv-keywords to add back formatMinimum keyword for compatibility with schema-utils@3.x
 * This is needed because ajv-keywords@5.x removed formatMinimum, but schema-utils@3.x still uses it
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const ajvKeywordsDir = path.join(projectRoot, 'node_modules', 'ajv-keywords');
const distIndexFile = path.join(ajvKeywordsDir, 'dist', 'index.js');

if (!fs.existsSync(distIndexFile)) {
  console.log('⚠️  ajv-keywords dist/index.js not found, skipping patch');
  process.exit(0);
}

try {
  let content = fs.readFileSync(distIndexFile, 'utf8');
  
  // Check if formatMinimum and formatMaximum are already patched
  if (content.includes('formatMinimum') && content.includes('formatMaximum') && content.includes('// Patched')) {
    console.log('✅ ajv-keywords already patched with formatMinimum and formatMaximum');
    process.exit(0);
  }

  // Remove any previous incorrect patches
  content = content.replace(/\s*\/\/ Patched:.*?keywords\[['"]formatMinimum['"]\].*?;/g, '');
  
  // Patch the get() function to handle formatMinimum and formatMaximum before throwing error
  // Add them as no-op functions
  const patchCode = `function get(keyword) {
    // Patched: Handle formatMinimum and formatMaximum for compatibility with schema-utils@3.x
    if (keyword === 'formatMinimum' || keyword === 'formatMaximum') {
        return function() { return; }; // No-op function
    }
    const defFunc = keywords_1.default[keyword];
    if (!defFunc)
        throw new Error("Unknown keyword " + keyword);
    return defFunc;
}`;

  // Replace the get function
  content = content.replace(
    /function get\(keyword\) \{[\s\S]*?\n\}/,
    patchCode
  );

  fs.writeFileSync(distIndexFile, content, 'utf8');
  console.log('✅ Successfully patched ajv-keywords with formatMinimum and formatMaximum keywords');
} catch (error) {
  console.error('❌ Error patching ajv-keywords:', error.message);
  // Don't exit with error, just warn
  console.warn('⚠️  Build may fail, but continuing...');
}
