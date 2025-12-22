#!/usr/bin/env node

/**
 * Bulk Accessibility Fix Script
 * 
 * This script systematically fixes common accessibility patterns:
 * - Adds aria-labels to icon-only buttons
 * - Adds alt text to images
 * - Associates form inputs with labels
 * 
 * Run this after manual fixes to catch remaining issues
 */

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src');

function getAllFiles(dir, ext = ['.js', '.jsx'], files = []) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
      getAllFiles(fullPath, ext, files);
    } else if (ext.some(e => item.endsWith(e))) {
      files.push(fullPath);
    }
  });
  return files;
}

function fixAccessibilityInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const originalLine = line;

    // Fix buttons without accessible names (icon-only buttons)
    if (line.includes('<button') && !line.includes('aria-label') && !line.includes('aria-labelledby')) {
      // Check if button has text content (next few lines)
      const nextLines = lines.slice(i, Math.min(i + 5, lines.length)).join('\n');
      const hasText = /<button[^>]*>[\s\S]{1,50}([A-Za-z]{3,})/.test(nextLines);
      
      if (!hasText) {
        // Try to infer label from context
        let ariaLabel = 'Button';
        
        // Check for common patterns
        if (line.includes('onClick') || line.includes('onClick=')) {
          const onClickMatch = lines.slice(i, i + 3).join(' ').match(/onClick.*?=>.*?\([^)]*['"]([^'"]+)['"]/);
          if (onClickMatch) {
            ariaLabel = onClickMatch[1].replace(/\//g, ' ').replace(/-/g, ' ');
          }
        }
        
        // Check for icon components
        const iconMatch = line.match(/(\w+) size/);
        if (iconMatch) {
          ariaLabel = `${iconMatch[1]} button`;
        }
        
        // Insert aria-label before closing >
        line = line.replace(/(<button[^>]*)(>)/, `$1 aria-label="${ariaLabel}"$2`);
        modified = true;
      }
    }

    // Fix images without alt text
    if (line.includes('<img') && !line.includes('alt=') && !line.includes('alt:')) {
      // Try to infer alt text from src or context
      const srcMatch = line.match(/src=["']([^"']+)["']/);
      let altText = 'Image';
      
      if (srcMatch) {
        const src = srcMatch[1];
        if (src.includes('avatar')) altText = 'User avatar';
        else if (src.includes('logo')) altText = 'Logo';
        else if (src.includes('thumbnail')) altText = 'Thumbnail';
        else {
          const filename = path.basename(src);
          altText = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        }
      }
      
      line = line.replace(/(<img[^>]*)(>)/, `$1 alt="${altText}"$2`);
      modified = true;
    }

    // Fix form inputs without labels
    if ((line.includes('<input') || line.includes('<textarea')) && 
        !line.includes('aria-label') && 
        !line.includes('aria-labelledby') && 
        !line.includes('id=')) {
      // Check if there's a label nearby
      const prevLines = lines.slice(Math.max(0, i - 5), i).join('\n');
      const hasLabel = prevLines.includes('<label') || prevLines.includes('Label');
      
      if (!hasLabel) {
        const inputType = line.match(/type=["']([^"']+)["']/)?.[1] || 'text';
        const placeholder = line.match(/placeholder=["']([^"']+)["']/)?.[1] || '';
        const ariaLabel = placeholder || `${inputType} input`;
        
        line = line.replace(/(<(?:input|textarea)[^>]*)(>)/, `$1 aria-label="${ariaLabel}"$2`);
        modified = true;
      }
    }

    newLines.push(line);
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    return true;
  }
  return false;
}

// Main execution
const componentFiles = getAllFiles(path.join(srcPath, 'components'), ['.jsx', '.js']);
const pageFiles = getAllFiles(path.join(srcPath, 'pages'), ['.jsx', '.js']);
const allFiles = [...componentFiles, ...pageFiles];

let fixed = 0;
allFiles.forEach(file => {
  try {
    if (fixAccessibilityInFile(file)) {
      fixed++;
      console.log(`Fixed: ${path.relative(srcPath, file)}`);
    }
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log(`\n✅ Fixed accessibility issues in ${fixed} files`);
