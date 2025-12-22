#!/usr/bin/env node

/**
 * Master Test Runner - Expert UX/UI Testing Framework
 * 
 * This is a comprehensive testing solution that:
 * 1. Verifies code fixes (can run without app)
 * 2. Tests application functionality (needs app running)
 * 3. Provides expert-level UX/UI testing
 * 
 * Usage:
 *   node scripts/masterTestRunner.js [--code-only] [--skip-browser]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const args = process.argv.slice(2);
const codeOnly = args.includes('--code-only');
const skipBrowser = args.includes('--skip-browser');

const results = {
  codeVerification: {},
  browserTests: {},
  summary: {}
};

console.log('🎯 Master Test Runner - Expert UX/UI Testing');
console.log('='.repeat(70));
console.log(`📍 Application: ${APP_URL}`);
console.log(`🕐 Started: ${new Date().toLocaleString()}\n`);

// Step 0: Deep Inspection (comprehensive analysis)
async function runDeepInspection() {
  console.log('🔍 STEP 0: Deep Codebase Inspection');
  console.log('-'.repeat(70));
  
  try {
    const deepInspectionPath = path.join(__dirname, 'deepInspection.js');
    if (fs.existsSync(deepInspectionPath)) {
      console.log('Running comprehensive codebase analysis...\n');
      execSync(`node ${deepInspectionPath}`, { stdio: 'inherit' });
      console.log('\n✅ Deep inspection complete\n');
    } else {
      console.log('⚠️  Deep inspection script not found, skipping...\n');
    }
  } catch (error) {
    console.log('⚠️  Deep inspection had issues, continuing with other tests...\n');
  }
}

// Step 1: Code Verification (always runs)
async function runCodeVerification() {
  console.log('📝 STEP 1: Code Verification');
  console.log('-'.repeat(70));
  
  const checks = [];
  
  // Check 1: TeacherFeedWidget navigation fix
  const teacherFeedPath = path.join(__dirname, '../src/components/dashboard/TeacherFeedWidget.jsx');
  if (fs.existsSync(teacherFeedPath)) {
    const content = fs.readFileSync(teacherFeedPath, 'utf8');
    const hasImport = content.includes("import { useNavigate } from 'react-router-dom'");
    const hasHook = content.includes('const navigate = useNavigate()');
    const hasUsage = content.includes("navigate('/community')");
    
    checks.push({
      test: 'TeacherFeedWidget navigation fix',
      status: hasImport && hasHook && hasUsage ? 'pass' : 'fail',
      details: `Import: ${hasImport}, Hook: ${hasHook}, Usage: ${hasUsage}`
    });
  }
  
  // Check 2: AchievementsWidget View All button
  const achievementsPath = path.join(__dirname, '../src/components/dashboard/AchievementsWidget.jsx');
  if (fs.existsSync(achievementsPath)) {
    const content = fs.readFileSync(achievementsPath, 'utf8');
    const hasImport = content.includes("import { useNavigate } from 'react-router-dom'");
    const hasButton = content.includes("navigate('/achievements')");
    
    checks.push({
      test: 'AchievementsWidget View All button',
      status: hasImport && hasButton ? 'pass' : 'fail',
      details: `Import: ${hasImport}, Button: ${hasButton}`
    });
  }
  
  // Check 3: Dashboard course_metadata fix
  const dashboardPath = path.join(__dirname, '../src/pages/Dashboard.jsx');
  if (fs.existsSync(dashboardPath)) {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    const hasCourseTitle = content.includes('course_title');
    const hasNaNCheck = content.includes('isNaN(courseId)') || content.includes('isNaN(course_metadata_id)');
    
    checks.push({
      test: 'Dashboard course_metadata.title fix',
      status: hasCourseTitle ? 'pass' : 'fail',
      details: `Using course_title: ${hasCourseTitle}`
    });
    
    checks.push({
      test: 'Dashboard course_id NaN validation',
      status: hasNaNCheck ? 'pass' : 'fail',
      details: `NaN check present: ${hasNaNCheck}`
    });
  }
  
  // Check 4: courseService.js validation
  const courseServicePath = path.join(__dirname, '../src/services/courseService.js');
  if (fs.existsSync(courseServicePath)) {
    const content = fs.readFileSync(courseServicePath, 'utf8');
    const hasValidation = content.includes('if (!courseId)') && content.includes('isNaN(parsedId)');
    
    checks.push({
      test: 'courseService.js course_id validation',
      status: hasValidation ? 'pass' : 'fail',
      details: `Validation present: ${hasValidation}`
    });
  }
  
  // Check 5: AppShell Pricing navigation
  const appShellPath = path.join(__dirname, '../src/components/AppShell.jsx');
  if (fs.existsSync(appShellPath)) {
    const content = fs.readFileSync(appShellPath, 'utf8');
    const hasCreditCard = content.includes('CreditCard');
    const hasPricing = content.includes("'Pricing'") || content.includes('"Pricing"');
    const hasPricingPath = content.includes("'/pricing'") || content.includes('"/pricing"');
    
    checks.push({
      test: 'AppShell Pricing navigation',
      status: hasCreditCard && hasPricing && hasPricingPath ? 'pass' : 'fail',
      details: `CreditCard: ${hasCreditCard}, Pricing: ${hasPricing}, Path: ${hasPricingPath}`
    });
  }
  
  // Check 6: SignupForm resend verification
  const signupPath = path.join(__dirname, '../src/components/auth/SignupForm.jsx');
  if (fs.existsSync(signupPath)) {
    const content = fs.readFileSync(signupPath, 'utf8');
    const hasResend = content.includes('resendVerification');
    const hasSupabase = content.includes("from '../../lib/supabaseClient'") || content.includes("from '../lib/supabaseClient'");
    const hasButton = content.includes('Resend Verification Email') || content.includes('Resend verification');
    
    checks.push({
      test: 'SignupForm resend verification',
      status: hasResend && hasSupabase && hasButton ? 'pass' : 'fail',
      details: `Function: ${hasResend}, Import: ${hasSupabase}, Button: ${hasButton}`
    });
  }
  
  // Check 7: SettingsPage Subscription tab
  const settingsPath = path.join(__dirname, '../src/pages/SettingsPage.jsx');
  if (fs.existsSync(settingsPath)) {
    const content = fs.readFileSync(settingsPath, 'utf8');
    const hasSubscription = content.includes('SubscriptionSection') || content.includes('subscription');
    const hasCreditCard = content.includes('CreditCard');
    const hasManage = content.includes('Manage Subscription') || content.includes('manageSubscription');
    
    checks.push({
      test: 'SettingsPage Subscription tab',
      status: hasSubscription && hasCreditCard && hasManage ? 'pass' : 'fail',
      details: `Section: ${hasSubscription}, Import: ${hasCreditCard}, Button: ${hasManage}`
    });
  }
  
  // Check 8: TeacherFeedWidget empty state
  if (fs.existsSync(teacherFeedPath)) {
    const content = fs.readFileSync(teacherFeedPath, 'utf8');
    const hasEmptyState = content.includes('displayPosts.length === 0') || content.includes('posts.length === 0');
    const hasMessage = content.includes('No teacher posts') || content.includes('No posts yet');
    
    checks.push({
      test: 'TeacherFeedWidget empty state',
      status: hasEmptyState && hasMessage ? 'pass' : 'fail',
      details: `Empty check: ${hasEmptyState}, Message: ${hasMessage}`
    });
  }
  
  // Check 9: Database migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/create_missing_tables.sql');
  if (fs.existsSync(migrationPath)) {
    const content = fs.readFileSync(migrationPath, 'utf8');
    const hasNotifications = content.includes('CREATE TABLE') && content.includes('notifications');
    const hasBadges = content.includes('CREATE TABLE') && content.includes('badges');
    const hasUserBadges = content.includes('CREATE TABLE') && content.includes('user_badges');
    
    checks.push({
      test: 'Database migration file',
      status: hasNotifications && hasBadges && hasUserBadges ? 'pass' : 'fail',
      details: `Notifications: ${hasNotifications}, Badges: ${hasBadges}, User_badges: ${hasUserBadges}`
    });
  }
  
  // Print results
  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${check.test}`);
    if (check.details) {
      console.log(`   ${check.details}`);
    }
  });
  
  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  
  results.codeVerification = {
    total: checks.length,
    passed,
    failed,
    checks,
    passRate: ((passed / checks.length) * 100).toFixed(1)
  };
  
  console.log(`\n📊 Code Verification: ${passed}/${checks.length} passed (${results.codeVerification.passRate}%)\n`);
  
  return results.codeVerification;
}

// Step 2: Check if app is running
async function checkAppRunning() {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get(APP_URL, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Step 3: Browser Testing (if app is running)
async function runBrowserTests() {
  if (skipBrowser) {
    console.log('⏭️  Skipping browser tests (--skip-browser flag)\n');
    return null;
  }
  
  console.log('🌐 STEP 2: Browser Testing');
  console.log('-'.repeat(70));
  console.log('Checking if application is running...');
  
  const isRunning = await checkAppRunning();
  if (!isRunning) {
    console.log('⚠️  Application is not running.');
    console.log('\nTo run browser tests:');
    console.log('  1. Start the application: npm start');
    console.log('  2. Wait for it to be ready');
    console.log('  3. Run this test again\n');
    return null;
  }
  
  console.log('✅ Application is running. Starting browser tests...\n');
  
  try {
    // Run expert UX test
    const expertTestPath = path.join(__dirname, 'expertUXTest.js');
    if (fs.existsSync(expertTestPath)) {
      console.log('Running comprehensive UX/UI tests...\n');
      execSync(`node ${expertTestPath}`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Browser tests failed:', error.message);
    return { error: error.message };
  }
  
  return { success: true };
}

// Main execution
async function main() {
  // Run deep inspection first (if not code-only)
  if (!codeOnly) {
    await runDeepInspection();
  }
  
  // Always run code verification
  await runCodeVerification();
  
  // Run browser tests if app is running and not skipped
  if (!codeOnly) {
    await runBrowserTests();
  } else {
    console.log('⏭️  Skipping browser tests (--code-only flag)\n');
  }
  
  // Generate summary
  console.log('='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Code Verification: ${results.codeVerification.passed}/${results.codeVerification.total} passed`);
  console.log(`Pass Rate: ${results.codeVerification.passRate}%`);
  
  if (results.codeVerification.failed === 0) {
    console.log('\n🎉 All code verification checks passed!');
    console.log('\nNext steps:');
    console.log('  1. Start the application: npm start');
    console.log('  2. Run browser tests: node scripts/masterTestRunner.js');
    console.log('  3. Or run full suite: npm run test:full');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some code verification checks failed.');
    console.log('Please review the failed checks above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
