#!/usr/bin/env node
/**
 * Ensures node_modules/ajv has a full dist/ folder (required by ajv-keywords).
 * npm sometimes installs ajv without dist; this restores it from the published tarball.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const ajvDir = path.join(projectRoot, 'node_modules', 'ajv');
const distDir = path.join(ajvDir, 'dist');
const distEntry = path.join(distDir, 'ajv.js');

if (fs.existsSync(distEntry)) {
  process.exit(0);
}

const tmpDir = path.join(projectRoot, 'node_modules', '.ajv-dist-tmp');
try {
  fs.mkdirSync(tmpDir, { recursive: true });
  execSync('npm pack ajv@8.12.0', { cwd: tmpDir, stdio: 'pipe' });
  const tgz = path.join(tmpDir, 'ajv-8.12.0.tgz');
  if (!fs.existsSync(tgz)) process.exit(1);
  execSync(`tar -xzf "${tgz}"`, { cwd: tmpDir, stdio: 'pipe' });
  const packedDist = path.join(tmpDir, 'package', 'dist');
  if (!fs.existsSync(packedDist)) process.exit(1);
  fs.cpSync(packedDist, distDir, { recursive: true });
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true });
  } catch (_) {}
}
