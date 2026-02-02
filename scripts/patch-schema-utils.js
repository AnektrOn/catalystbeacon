#!/usr/bin/env node
/**
 * Patches schema-utils to:
 * 1. Disable ajv strict mode for compatibility (unknown keywords like "link")
 * 2. Add validateOptions in validate.js for babel-loader (schema-utils v2 API)
 * 3. Re-export validateOptions from index.js so require("schema-utils") returns a callable for babel-loader
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

// Find all schema-utils dist directories
const findSchemaUtilsDist = () => {
  try {
    const result = execSync(
      `find "${projectRoot}/node_modules" -type d -name "dist" -path "*/schema-utils/dist" 2>/dev/null`,
      { encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
};

const findSchemaUtilsValidateFiles = () => {
  try {
    const result = execSync(
      `find "${projectRoot}/node_modules" -name "validate.js" -path "*/schema-utils/dist/*" 2>/dev/null`,
      { encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
};

const patchFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already fully patched (both strict mode and validateOptions)
    const hasStrictPatch = content.includes('strict: false') && content.includes('// Patched');
    const hasValidateOptionsPatch = content.includes('exports.validateOptions');
    
    if (hasStrictPatch && hasValidateOptionsPatch) {
      return false; // Already fully patched
    }
    
    let patched = false;
    
    // Patch 1: Disable strict mode in Ajv constructor
    const ajvPattern = /const ajv = new Ajv\(\s*\{[\s\S]*?allErrors:\s*true,[\s\S]*?verbose:\s*true,[\s\S]*?\$data:\s*true[\s\S]*?\}\s*\);/;
    const ajvReplacement = `const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    $data: true,
    strict: false // Patched: Disable strict mode to allow unknown keywords like "link"
  });`;
    
    if (ajvPattern.test(content)) {
      content = content.replace(ajvPattern, ajvReplacement);
      patched = true;
    }
    
    // Patch 2: Add validateOptions alias for compatibility with babel-loader (expects schema-utils v2 API)
    if (!content.includes('exports.validateOptions')) {
      const validatePattern = /exports\.validate = validate;/;
      const validateReplacement = `exports.validate = validate;
// Patched: Add validateOptions alias for compatibility with babel-loader and other packages expecting schema-utils v2 API
exports.validateOptions = validate;`;
      
      if (validatePattern.test(content)) {
        content = content.replace(validatePattern, validateReplacement);
        patched = true;
      }
    }
    
    if (patched) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error.message);
    return false;
  }
};

// Patch index.js so require("schema-utils") returns a callable (babel-loader uses: const validateOptions = require("schema-utils"))
const patchIndex = (indexPath) => {
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    if (content.includes('// Patched index: default = validate for babel-loader')) {
      return false;
    }
    if (!content.includes('enableValidation') || !content.includes('require("./validate")')) {
      return false;
    }
    // Add validateOptions to destructuring (validate.js patch adds this export)
    if (!content.includes('validateOptions,')) {
      content = content.replace(
        /const\s*\{\s*validate,\s*ValidationError,/,
        'const { validate, validateOptions, ValidationError,'
      );
    }
    // Replace object export with callable default + named exports
    if (!content.includes('module.exports = fn;')) {
      content = content.replace(
        /module\.exports\s*=\s*\{[\s\S]*?validate,[\s\S]*?ValidationError,[\s\S]*?enableValidation,[\s\S]*?disableValidation,[\s\S]*?needValidate[\s\S]*?\};/,
        `// Patched index: default = validate for babel-loader (expects require("schema-utils")(schema, options))
const fn = typeof validateOptions === 'function' ? validateOptions : validate;
module.exports = fn;
module.exports.validate = validate;
module.exports.validateOptions = typeof validateOptions === 'function' ? validateOptions : validate;
module.exports.ValidationError = ValidationError;
module.exports.enableValidation = enableValidation;
module.exports.disableValidation = disableValidation;
module.exports.needValidate = needValidate;
`
      );
    }
    if (content.includes('module.exports = fn;')) {
      fs.writeFileSync(indexPath, content, 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error patching index:', err.message);
    return false;
  }
};

let patched = 0;

findSchemaUtilsValidateFiles().forEach(file => {
  if (patchFile(file)) {
    patched++;
    console.log(`✅ Patched: ${file.replace(projectRoot, '')}`);
  }
});

findSchemaUtilsDist().forEach(distDir => {
  const indexPath = path.join(distDir, 'index.js');
  if (fs.existsSync(indexPath) && patchIndex(indexPath)) {
    patched++;
    console.log(`✅ Patched: ${indexPath.replace(projectRoot, '')}`);
  }
});

if (patched > 0) {
  console.log(`\n✅ Successfully patched ${patched} schema-utils file(s)`);
} else if (findSchemaUtilsValidateFiles().length > 0 || findSchemaUtilsDist().length > 0) {
  console.log('✅ All schema-utils files already patched');
} else {
  console.log('⚠️  No schema-utils files found to patch');
}
