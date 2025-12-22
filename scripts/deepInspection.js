#!/usr/bin/env node

/**
 * Deep Inspection Framework - Expert-Level Codebase Analysis
 * 
 * This tool performs comprehensive inspection of:
 * - All components (imports, exports, usage, props)
 * - All routes (defined vs used, navigation links)
 * - All services (database queries, error handling)
 * - All database tables (schema matches code usage)
 * - All error handling (try/catch, error boundaries)
 * - All accessibility (ARIA, alt text, keyboard nav)
 * - All performance (lazy loading, memoization)
 * - All security (RLS, input validation)
 * - All consistency (naming, patterns, styles)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = {
  components: { checked: [], issues: [], missing: [] },
  routes: { defined: [], used: [], missing: [], broken: [] },
  services: { checked: [], issues: [], missing: [] },
  database: { tables: [], queries: [], mismatches: [] },
  errors: { handlers: [], missing: [], issues: [] },
  accessibility: { issues: [], missing: [] },
  performance: { issues: [], opportunities: [] },
  security: { issues: [], missing: [] },
  consistency: { issues: [], violations: [] },
  imports: { missing: [], unused: [], circular: [] },
  exports: { missing: [], unused: [] }
};

const srcPath = path.join(__dirname, '../src');
const supabasePath = path.join(__dirname, '../supabase');

console.log('🔍 Deep Inspection Framework - Expert-Level Analysis');
console.log('='.repeat(80));
console.log(`📁 Source: ${srcPath}`);
console.log(`🕐 Started: ${new Date().toLocaleString()}\n`);

// Utility functions
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

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function extractExports(content) {
  const exports = [];
  // Named exports
  const namedExportRegex = /export\s+(?:const|function|class|let|var)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  // Default exports
  if (content.includes('export default')) {
    exports.push('default');
  }
  return exports;
}

function checkFileExists(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);
  let resolvedPath = null;
  
  // Handle relative imports
  if (importPath.startsWith('.')) {
    resolvedPath = path.resolve(fromDir, importPath);
    // Try with extensions
    const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
    for (const ext of extensions) {
      const testPath = resolvedPath + ext;
      if (fs.existsSync(testPath)) {
        return { exists: true, path: testPath };
      }
    }
    // Try index files
    const indexExtensions = ['/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
    for (const ext of indexExtensions) {
      const testPath = resolvedPath + ext;
      if (fs.existsSync(testPath)) {
        return { exists: true, path: testPath };
      }
    }
  } else {
    // Handle node_modules or absolute paths
    return { exists: true, path: importPath }; // Assume exists for now
  }
  
  return { exists: false, path: resolvedPath };
}

// 1. COMPONENT INSPECTION
function inspectComponents() {
  console.log('📦 STEP 1: Component Inspection');
  console.log('-'.repeat(80));
  
  const componentFiles = getAllFiles(path.join(srcPath, 'components'), ['.jsx', '.js']);
  const pageFiles = getAllFiles(path.join(srcPath, 'pages'), ['.jsx', '.js']);
  const allFiles = [...componentFiles, ...pageFiles];
  
  let checked = 0;
  let issues = 0;
  
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const relativePath = path.relative(srcPath, file);
    checked++;
    
    // Check for React component
    const isComponent = content.includes('export') && (
      content.includes('function ') || 
      content.includes('const ') || 
      content.includes('= ()') ||
      content.includes('React.Component') ||
      content.includes('extends Component')
    );
    
    if (isComponent) {
      results.components.checked.push(relativePath);
      
      // Check imports
      const imports = extractImports(content);
      imports.forEach(imp => {
        const check = checkFileExists(imp, file);
        if (!check.exists && !imp.startsWith('react') && !imp.startsWith('@')) {
          results.imports.missing.push({
            file: relativePath,
            import: imp,
            expected: check.path
          });
          issues++;
        }
      });
      
      // Check for error boundaries
      if (content.includes('ErrorBoundary') || content.includes('componentDidCatch')) {
        results.errors.handlers.push(relativePath);
      }
      
      // Check for accessibility
      const hasAriaLabels = content.includes('aria-label') || content.includes('aria-labelledby');
      const hasAltText = content.includes('alt=') || content.includes('alt:');
      const hasRole = content.includes('role=');
      
      if (!hasAriaLabels && content.includes('<button') && !content.includes('aria-label')) {
        results.accessibility.missing.push({
          file: relativePath,
          issue: 'Button without aria-label',
          line: content.split('\n').findIndex(line => line.includes('<button'))
        });
      }
      
      if (!hasAltText && content.includes('<img')) {
        results.accessibility.missing.push({
          file: relativePath,
          issue: 'Image without alt text',
          line: content.split('\n').findIndex(line => line.includes('<img'))
        });
      }
      
      // Check for performance optimizations
      if (content.includes('React.memo') || content.includes('useMemo') || content.includes('useCallback')) {
        // Good
      } else if (content.includes('export default') || content.includes('export const')) {
        // Could benefit from memoization
        if (content.split('\n').length > 50) {
          results.performance.opportunities.push({
            file: relativePath,
            suggestion: 'Consider using React.memo for large component'
          });
        }
      }
      
      // Check for error handling
      if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
        results.errors.missing.push({
          file: relativePath,
          issue: 'Async function without try/catch'
        });
      }
      
      // Check for PropTypes or TypeScript
      const hasPropTypes = content.includes('PropTypes') || content.includes('.propTypes');
      const hasTypeScript = file.endsWith('.ts') || file.endsWith('.tsx');
      if (!hasPropTypes && !hasTypeScript && content.includes('props')) {
        results.consistency.issues.push({
          file: relativePath,
          issue: 'Component uses props but no PropTypes or TypeScript'
        });
      }
    }
  });
  
  console.log(`✅ Checked ${checked} component files`);
  console.log(`⚠️  Found ${issues} issues\n`);
  
  return { checked, issues };
}

// 2. ROUTE INSPECTION
function inspectRoutes() {
  console.log('🛣️  STEP 2: Route Inspection');
  console.log('-'.repeat(80));
  
  const appFile = path.join(srcPath, 'App.js');
  const appJsxFile = path.join(srcPath, 'App.jsx');
  const appContent = readFileContent(appFile) || readFileContent(appJsxFile);
  
  if (!appContent) {
    console.log('❌ Could not find App.js or App.jsx\n');
    return;
  }
  
  // Extract defined routes
  const routeRegex = /path=["']([^"']+)["']/g;
  let match;
  while ((match = routeRegex.exec(appContent)) !== null) {
    results.routes.defined.push(match[1]);
  }
  
  // Check all files for route usage
  const allFiles = getAllFiles(srcPath, ['.js', '.jsx']);
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    // Check for navigate calls
    const navigateRegex = /navigate\(['"]([^'"]+)['"]\)/g;
    let navMatch;
    while ((navMatch = navigateRegex.exec(content)) !== null) {
      results.routes.used.push(navMatch[1]);
    }
    
    // Check for Link components
    const linkRegex = /to=["']([^"']+)["']/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      results.routes.used.push(linkMatch[1]);
    }
  });
  
  // Find missing routes (used but not defined)
  const uniqueUsed = [...new Set(results.routes.used)];
  uniqueUsed.forEach(route => {
    if (!results.routes.defined.includes(route) && !route.startsWith('#')) {
      results.routes.missing.push(route);
    }
  });
  
  // Find unused routes (defined but not used)
  results.routes.defined.forEach(route => {
    if (!results.routes.used.includes(route) && route !== '/' && route !== '*') {
      results.routes.broken.push(route);
    }
  });
  
  console.log(`✅ Found ${results.routes.defined.length} defined routes`);
  console.log(`✅ Found ${uniqueUsed.length} used routes`);
  console.log(`⚠️  ${results.routes.missing.length} routes used but not defined`);
  console.log(`⚠️  ${results.routes.broken.length} routes defined but not used\n`);
}

// 3. SERVICE INSPECTION
function inspectServices() {
  console.log('⚙️  STEP 3: Service Inspection');
  console.log('-'.repeat(80));
  
  const serviceFiles = getAllFiles(path.join(srcPath, 'services'), ['.js', '.jsx']);
  
  serviceFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const relativePath = path.relative(srcPath, file);
    results.services.checked.push(relativePath);
    
    // Check for Supabase queries
    const hasSupabase = content.includes('supabase') || content.includes('from(');
    if (hasSupabase) {
      // Check for error handling
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      if (!hasErrorHandling) {
        results.services.issues.push({
          file: relativePath,
          issue: 'Supabase query without try/catch error handling'
        });
      }
      
      // Check for RLS awareness
      const hasRLS = content.includes('auth.uid()') || content.includes('user_id');
      if (!hasRLS && content.includes('.from(')) {
        results.security.issues.push({
          file: relativePath,
          issue: 'Database query may not respect RLS policies'
        });
      }
    }
    
    // Check for input validation
    const functions = content.match(/async\s+function\s+(\w+)|const\s+(\w+)\s*=\s*async\s*\(/g) || [];
    functions.forEach(func => {
      const funcName = func.match(/(\w+)/)[1];
      const funcBody = content.substring(content.indexOf(func));
      if (!funcBody.includes('if (!') && !funcBody.includes('validate') && !funcBody.includes('required')) {
        results.security.issues.push({
          file: relativePath,
          issue: `Function ${funcName} may lack input validation`
        });
      }
    });
  });
  
  console.log(`✅ Checked ${serviceFiles.length} service files`);
  console.log(`⚠️  Found ${results.services.issues.length} issues\n`);
}

// 4. DATABASE INSPECTION
function inspectDatabase() {
  console.log('🗄️  STEP 4: Database Schema Inspection');
  console.log('-'.repeat(80));
  
  // Read migration files
  const migrationFiles = getAllFiles(path.join(supabasePath, 'migrations'), ['.sql']);
  
  const allTables = new Set();
  migrationFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_]+)/gi;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      allTables.add(match[1]);
    }
  });
  
  results.database.tables = Array.from(allTables);
  
  // Check code for table usage
  const allFiles = getAllFiles(srcPath, ['.js', '.jsx']);
  const tableUsage = new Map();
  
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    results.database.tables.forEach(table => {
      if (content.includes(`.from('${table}')`) || content.includes(`.from("${table}")`)) {
        if (!tableUsage.has(table)) {
          tableUsage.set(table, []);
        }
        tableUsage.get(table).push(path.relative(srcPath, file));
      }
    });
  });
  
  // Find unused tables
  const unusedTables = results.database.tables.filter(table => !tableUsage.has(table));
  
  console.log(`✅ Found ${results.database.tables.length} database tables`);
  console.log(`✅ ${tableUsage.size} tables are used in code`);
  console.log(`⚠️  ${unusedTables.length} tables defined but not used in code\n`);
  
  results.database.unused = unusedTables;
}

// 5. ERROR HANDLING INSPECTION
function inspectErrorHandling() {
  console.log('⚠️  STEP 5: Error Handling Inspection');
  console.log('-'.repeat(80));
  
  const allFiles = getAllFiles(srcPath, ['.js', '.jsx']);
  
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    // Check for async functions without error handling
    const asyncFunctions = content.match(/async\s+(?:function\s+\w+|\([^)]*\)\s*=>)/g) || [];
    asyncFunctions.forEach(() => {
      const hasTryCatch = content.includes('try') && content.includes('catch');
      if (!hasTryCatch) {
        const relativePath = path.relative(srcPath, file);
        if (!results.errors.missing.find(e => e.file === relativePath)) {
          results.errors.missing.push({
            file: relativePath,
            issue: 'Async function without try/catch'
          });
        }
      }
    });
    
    // Check for error boundaries
    if (content.includes('ErrorBoundary') || content.includes('componentDidCatch')) {
      const relativePath = path.relative(srcPath, file);
      if (!results.errors.handlers.includes(relativePath)) {
        results.errors.handlers.push(relativePath);
      }
    }
  });
  
  console.log(`✅ Found ${results.errors.handlers.length} error boundaries`);
  console.log(`⚠️  Found ${results.errors.missing.length} files with missing error handling\n`);
}

// 6. ACCESSIBILITY INSPECTION
function inspectAccessibility() {
  console.log('♿ STEP 6: Accessibility Inspection');
  console.log('-'.repeat(80));
  
  const componentFiles = getAllFiles(path.join(srcPath, 'components'), ['.jsx', '.js']);
  const pageFiles = getAllFiles(path.join(srcPath, 'pages'), ['.jsx', '.js']);
  const allFiles = [...componentFiles, ...pageFiles];
  
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const relativePath = path.relative(srcPath, file);
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check buttons
      if (line.includes('<button') && !line.includes('aria-label') && !line.includes('aria-labelledby')) {
        const hasText = line.includes('>') && line.split('>')[1]?.trim().length > 0;
        if (!hasText) {
          results.accessibility.issues.push({
            file: relativePath,
            line: index + 1,
            issue: 'Button without accessible name',
            code: line.trim()
          });
        }
      }
      
      // Check images
      if (line.includes('<img') && !line.includes('alt=')) {
        results.accessibility.issues.push({
          file: relativePath,
          line: index + 1,
          issue: 'Image without alt text',
          code: line.trim()
        });
      }
      
      // Check form inputs
      if ((line.includes('<input') || line.includes('<textarea')) && !line.includes('aria-label') && !line.includes('aria-labelledby') && !line.includes('id=')) {
        results.accessibility.issues.push({
          file: relativePath,
          line: index + 1,
          issue: 'Form input without label association',
          code: line.trim()
        });
      }
    });
  });
  
  console.log(`⚠️  Found ${results.accessibility.issues.length} accessibility issues\n`);
}

// 7. PERFORMANCE INSPECTION
function inspectPerformance() {
  console.log('⚡ STEP 7: Performance Inspection');
  console.log('-'.repeat(80));
  
  const allFiles = getAllFiles(srcPath, ['.js', '.jsx']);
  
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const relativePath = path.relative(srcPath, file);
    
    // Check for large files
    const lineCount = content.split('\n').length;
    if (lineCount > 500) {
      results.performance.issues.push({
        file: relativePath,
        issue: `Large file (${lineCount} lines) - consider splitting`,
        severity: 'medium'
      });
    }
    
    // Check for missing lazy loading
    if (relativePath.includes('pages/') && !content.includes('React.lazy')) {
      // Check if it's imported in App.js with lazy
      const appFile = path.join(srcPath, 'App.js');
      const appJsxFile = path.join(srcPath, 'App.jsx');
      const appContent = readFileContent(appFile) || readFileContent(appJsxFile);
      if (appContent && !appContent.includes(`lazy(() => import('${relativePath}')`)) {
        results.performance.opportunities.push({
          file: relativePath,
          suggestion: 'Consider lazy loading this page component'
        });
      }
    }
    
    // Check for missing memoization
    if (content.includes('export default') && content.includes('props') && !content.includes('React.memo')) {
      if (lineCount > 100) {
        results.performance.opportunities.push({
          file: relativePath,
          suggestion: 'Consider using React.memo for component optimization'
        });
      }
    }
    
    // Check for missing useMemo/useCallback
    if (content.includes('useState') && content.includes('useEffect') && !content.includes('useMemo') && !content.includes('useCallback')) {
      const hasExpensiveOps = content.includes('map(') || content.includes('filter(') || content.includes('reduce(');
      if (hasExpensiveOps) {
        results.performance.opportunities.push({
          file: relativePath,
          suggestion: 'Consider using useMemo for expensive computations'
        });
      }
    }
  });
  
  console.log(`⚠️  Found ${results.performance.issues.length} performance issues`);
  console.log(`💡 Found ${results.performance.opportunities.length} optimization opportunities\n`);
}

// 8. SECURITY INSPECTION
function inspectSecurity() {
  console.log('🔒 STEP 8: Security Inspection');
  console.log('-'.repeat(80));
  
  const allFiles = getAllFiles(srcPath, ['.js', '.jsx']);
  
  allFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const relativePath = path.relative(srcPath, file);
    
    // Check for hardcoded secrets
    if (content.match(/password\s*=\s*['"][^'"]+['"]/i) && !content.includes('process.env')) {
      results.security.issues.push({
        file: relativePath,
        issue: 'Potential hardcoded password',
        severity: 'high'
      });
    }
    
    // Check for SQL injection risks
    if (content.includes('query(') && content.includes('${') && !content.includes('parameterized')) {
      results.security.issues.push({
        file: relativePath,
        issue: 'Potential SQL injection risk - use parameterized queries',
        severity: 'high'
      });
    }
    
    // Check for XSS risks
    if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify')) {
      results.security.issues.push({
        file: relativePath,
        issue: 'Using dangerouslySetInnerHTML without sanitization',
        severity: 'high'
      });
    }
    
    // Check for missing input validation
    if (content.includes('async function') && content.includes('params') && !content.includes('validate') && !content.includes('required')) {
      results.security.issues.push({
        file: relativePath,
        issue: 'Function may lack input validation',
        severity: 'medium'
      });
    }
  });
  
  console.log(`⚠️  Found ${results.security.issues.length} security issues\n`);
}

// 9. CONSISTENCY INSPECTION
function inspectConsistency() {
  console.log('🎨 STEP 9: Code Consistency Inspection');
  console.log('-'.repeat(80));
  
  const allFiles = getAllFiles(srcPath, ['.js', '.jsx']);
  
  // Check naming conventions
  const namingIssues = [];
  allFiles.forEach(file => {
    const fileName = path.basename(file);
    const relativePath = path.relative(srcPath, file);
    
    // Check component naming (PascalCase)
    // Note: shadcn/ui components use lowercase (button.jsx, input.jsx) which is correct
    if (file.includes('components/') && fileName.endsWith('.jsx') && !file.includes('components/ui/')) {
      const expectedName = fileName.replace('.jsx', '');
      if (expectedName[0] !== expectedName[0].toUpperCase()) {
        namingIssues.push({
          file: relativePath,
          issue: 'Component file should use PascalCase'
        });
      }
    }
    
    // Check service naming (camelCase)
    if (file.includes('services/') && fileName.endsWith('.js')) {
      const expectedName = fileName.replace('.js', '');
      if (expectedName[0] !== expectedName[0].toLowerCase()) {
        namingIssues.push({
          file: relativePath,
          issue: 'Service file should use camelCase'
        });
      }
    }
  });
  
  results.consistency.issues = namingIssues;
  
  console.log(`⚠️  Found ${namingIssues.length} naming convention issues\n`);
}

// 10. COMPREHENSIVE REPORT
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE INSPECTION REPORT');
  console.log('='.repeat(80));
  
  // Summary
  const totalIssues = 
    results.imports.missing.length +
    results.routes.missing.length +
    results.services.issues.length +
    results.errors.missing.length +
    results.accessibility.issues.length +
    results.performance.issues.length +
    results.security.issues.length +
    results.consistency.issues.length;
  
  console.log(`\n📈 SUMMARY`);
  console.log(`-`.repeat(80));
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log(`Components Checked: ${results.components.checked.length}`);
  console.log(`Routes Defined: ${results.routes.defined.length}`);
  console.log(`Services Checked: ${results.services.checked.length}`);
  console.log(`Database Tables: ${results.database.tables.length}`);
  
  // Detailed breakdown
  console.log(`\n📋 DETAILED BREAKDOWN`);
  console.log(`-`.repeat(80));
  
  if (results.imports.missing.length > 0) {
    console.log(`\n❌ Missing Imports (${results.imports.missing.length}):`);
    results.imports.missing.slice(0, 10).forEach(imp => {
      console.log(`   - ${imp.file}: ${imp.import}`);
    });
  }
  
  if (results.routes.missing.length > 0) {
    console.log(`\n❌ Missing Routes (${results.routes.missing.length}):`);
    results.routes.missing.forEach(route => {
      console.log(`   - ${route}`);
    });
  }
  
  if (results.services.issues.length > 0) {
    console.log(`\n⚠️  Service Issues (${results.services.issues.length}):`);
    results.services.issues.slice(0, 10).forEach(issue => {
      console.log(`   - ${issue.file}: ${issue.issue}`);
    });
  }
  
  if (results.errors.missing.length > 0) {
    console.log(`\n⚠️  Missing Error Handling (${results.errors.missing.length}):`);
    results.errors.missing.slice(0, 10).forEach(err => {
      console.log(`   - ${err.file}: ${err.issue}`);
    });
  }
  
  if (results.accessibility.issues.length > 0) {
    console.log(`\n♿ Accessibility Issues (${results.accessibility.issues.length}):`);
    results.accessibility.issues.slice(0, 10).forEach(issue => {
      console.log(`   - ${issue.file}:${issue.line} - ${issue.issue}`);
    });
  }
  
  if (results.security.issues.length > 0) {
    console.log(`\n🔒 Security Issues (${results.security.issues.length}):`);
    results.security.issues.forEach(issue => {
      console.log(`   - ${issue.file}: ${issue.issue} [${issue.severity}]`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../testsprite_tests/deep-inspection-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport();
  const mdPath = path.join(__dirname, '../testsprite_tests/deep-inspection-report.md');
  fs.writeFileSync(mdPath, markdownReport);
  console.log(`📄 Markdown report saved to: ${mdPath}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 No issues found! Codebase is in excellent shape.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  Found ${totalIssues} issues. Please review the detailed reports.`);
    process.exit(1);
  }
}

function generateMarkdownReport() {
  return `# Deep Inspection Report

**Generated:** ${new Date().toISOString()}  
**Framework:** Expert-Level Codebase Analysis

---

## Executive Summary

- **Components Checked:** ${results.components.checked.length}
- **Routes Defined:** ${results.routes.defined.length}
- **Services Checked:** ${results.services.checked.length}
- **Database Tables:** ${results.database.tables.length}
- **Total Issues:** ${results.imports.missing.length + results.routes.missing.length + results.services.issues.length + results.errors.missing.length + results.accessibility.issues.length + results.performance.issues.length + results.security.issues.length + results.consistency.issues.length}

---

## 1. Component Inspection

### Checked Components
${results.components.checked.map(c => `- ${c}`).join('\n')}

### Issues
${results.imports.missing.length > 0 ? `\n**Missing Imports (${results.imports.missing.length}):**\n${results.imports.missing.map(i => `- ${i.file}: ${i.import}`).join('\n')}` : 'No issues found.'}

---

## 2. Route Inspection

### Defined Routes
${results.routes.defined.map(r => `- ${r}`).join('\n')}

### Issues
${results.routes.missing.length > 0 ? `\n**Missing Routes (${results.routes.missing.length}):**\n${results.routes.missing.map(r => `- ${r}`).join('\n')}` : 'No missing routes.'}

---

## 3. Service Inspection

### Checked Services
${results.services.checked.map(s => `- ${s}`).join('\n')}

### Issues
${results.services.issues.length > 0 ? results.services.issues.map(i => `- ${i.file}: ${i.issue}`).join('\n') : 'No issues found.'}

---

## 4. Database Inspection

### Tables Found
${results.database.tables.map(t => `- ${t}`).join('\n')}

### Unused Tables
${results.database.unused ? results.database.unused.map(t => `- ${t}`).join('\n') : 'All tables are used.'}

---

## 5. Error Handling

### Error Boundaries
${results.errors.handlers.map(h => `- ${h}`).join('\n')}

### Missing Error Handling
${results.errors.missing.length > 0 ? results.errors.missing.map(e => `- ${e.file}: ${e.issue}`).join('\n') : 'All async functions have error handling.'}

---

## 6. Accessibility

### Issues Found
${results.accessibility.issues.length > 0 ? results.accessibility.issues.slice(0, 20).map(a => `- ${a.file}:${a.line} - ${a.issue}`).join('\n') : 'No accessibility issues found.'}

---

## 7. Performance

### Issues
${results.performance.issues.length > 0 ? results.performance.issues.map(p => `- ${p.file}: ${p.issue}`).join('\n') : 'No performance issues found.'}

### Optimization Opportunities
${results.performance.opportunities.length > 0 ? results.performance.opportunities.map(o => `- ${o.file}: ${o.suggestion}`).join('\n') : 'No optimization opportunities identified.'}

---

## 8. Security

### Issues Found
${results.security.issues.length > 0 ? results.security.issues.map(s => `- **${(s.severity || 'medium').toUpperCase()}:** ${s.file}: ${s.issue}`).join('\n') : 'No security issues found.'}

---

## 9. Code Consistency

### Issues
${results.consistency.issues.length > 0 ? results.consistency.issues.map(c => `- ${c.file}: ${c.issue}`).join('\n') : 'No consistency issues found.'}

---

## Recommendations

${generateRecommendations()}

---

**Report Generated:** ${new Date().toISOString()}
`;
}

function generateRecommendations() {
  const recommendations = [];
  
  if (results.imports.missing.length > 0) {
    recommendations.push('### Fix Missing Imports');
    recommendations.push('Review and fix all missing import paths.');
  }
  
  if (results.routes.missing.length > 0) {
    recommendations.push('### Add Missing Routes');
    recommendations.push('Define routes that are used but not defined in App.js.');
  }
  
  if (results.security.issues.length > 0) {
    recommendations.push('### Security Fixes (HIGH PRIORITY)');
    results.security.issues.filter(s => s.severity === 'high').forEach(issue => {
      recommendations.push(`- Fix: ${issue.file} - ${issue.issue}`);
    });
  }
  
  if (results.accessibility.issues.length > 0) {
    recommendations.push('### Accessibility Improvements');
    recommendations.push('Add ARIA labels, alt text, and proper form labels.');
  }
  
  if (results.performance.opportunities.length > 0) {
    recommendations.push('### Performance Optimizations');
    recommendations.push('Consider implementing lazy loading and memoization.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ **No critical recommendations. Codebase is in excellent shape!**');
  }
  
  return recommendations.join('\n');
}

// Main execution
async function runDeepInspection() {
  try {
    inspectComponents();
    inspectRoutes();
    inspectServices();
    inspectDatabase();
    inspectErrorHandling();
    inspectAccessibility();
    inspectPerformance();
    inspectSecurity();
    inspectConsistency();
    generateReport();
  } catch (error) {
    console.error('Fatal error during inspection:', error);
    process.exit(1);
  }
}

// Run inspection
runDeepInspection();
