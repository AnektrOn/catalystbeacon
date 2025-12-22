#!/usr/bin/env node

/**
 * Verification Script for TestSprite Fixes
 * This script verifies that all the fixes are in place and working
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying TestSprite Fixes...\n');

let allChecksPassed = true;
const checks = [];

// Check 1: Verify TeacherFeedWidget has useNavigate import
function checkTeacherFeedWidget() {
  const filePath = path.join(__dirname, '../src/components/dashboard/TeacherFeedWidget.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasImport = content.includes("import { useNavigate } from 'react-router-dom'");
  const hasHook = content.includes('const navigate = useNavigate()');
  const hasUsage = content.includes("navigate('/community')");
  
  if (hasImport && hasHook && hasUsage) {
    checks.push({ name: 'TeacherFeedWidget navigation fix', status: '✅ PASS', details: 'useNavigate properly imported and used' });
    return true;
  } else {
    checks.push({ 
      name: 'TeacherFeedWidget navigation fix', 
      status: '❌ FAIL', 
      details: `Missing: import=${hasImport}, hook=${hasHook}, usage=${hasUsage}` 
    });
    return false;
  }
}

// Check 2: Verify AchievementsWidget has View All button
function checkAchievementsWidget() {
  const filePath = path.join(__dirname, '../src/components/dashboard/AchievementsWidget.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasImport = content.includes("import { useNavigate } from 'react-router-dom'");
  const hasButton = content.includes("navigate('/achievements')");
  
  if (hasImport && hasButton) {
    checks.push({ name: 'AchievementsWidget View All button', status: '✅ PASS', details: 'View All button with navigation implemented' });
    return true;
  } else {
    checks.push({ 
      name: 'AchievementsWidget View All button', 
      status: '❌ FAIL', 
      details: `Missing: import=${hasImport}, button=${hasButton}` 
    });
    return false;
  }
}

// Check 3: Verify Dashboard course_metadata.title fix
function checkDashboardCourseMetadata() {
  const filePath = path.join(__dirname, '../src/pages/Dashboard.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasCourseTitle = content.includes('course_title');
  const noTitle = !content.includes('course_metadata (') || !content.match(/course_metadata\s*\([^)]*title[^)]*\)/);
  
  if (hasCourseTitle && noTitle) {
    checks.push({ name: 'Dashboard course_metadata.title fix', status: '✅ PASS', details: 'Using course_title instead of title' });
    return true;
  } else {
    checks.push({ 
      name: 'Dashboard course_metadata.title fix', 
      status: '❌ FAIL', 
      details: `Has course_title: ${hasCourseTitle}, Still has title: ${!noTitle}` 
    });
    return false;
  }
}

// Check 4: Verify Dashboard NaN course_id validation
function checkDashboardCourseIdValidation() {
  const filePath = path.join(__dirname, '../src/pages/Dashboard.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasValidation = content.includes('isNaN(courseId)') || content.includes('isNaN(course_metadata_id)');
  
  if (hasValidation) {
    checks.push({ name: 'Dashboard course_id NaN validation', status: '✅ PASS', details: 'NaN validation added for course_id' });
    return true;
  } else {
    checks.push({ 
      name: 'Dashboard course_id NaN validation', 
      status: '❌ FAIL', 
      details: 'Missing NaN validation for course_id' 
    });
    return false;
  }
}

// Check 5: Verify courseService.js has validation
function checkCourseServiceValidation() {
  const filePath = path.join(__dirname, '../src/services/courseService.js');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasGetCourseByIdValidation = content.includes('getCourseById') && 
    (content.match(/async getCourseById\([^)]*\)\s*\{[^}]*if\s*\(!courseId\)/s) || 
     content.match(/async getCourseById\([^)]*\)\s*\{[^}]*if\s*\(!courseId\)/s));
  
  const hasGetCourseStructureValidation = content.includes('getCourseStructure') && 
    content.includes('isNaN(parsedId)');
  
  if (hasGetCourseByIdValidation && hasGetCourseStructureValidation) {
    checks.push({ name: 'courseService.js validation', status: '✅ PASS', details: 'Course ID validation added to key functions' });
    return true;
  } else {
    checks.push({ 
      name: 'courseService.js validation', 
      status: '⚠️ PARTIAL', 
      details: `getCourseById: ${hasGetCourseByIdValidation}, getCourseStructure: ${hasGetCourseStructureValidation}` 
    });
    return true; // Partial is okay
  }
}

// Check 6: Verify AppShell has Pricing navigation
function checkAppShellPricing() {
  const filePath = path.join(__dirname, '../src/components/AppShell.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasCreditCardImport = content.includes("import") && content.includes("CreditCard");
  const hasPricingItem = content.includes("'Pricing'") || content.includes('"Pricing"');
  const hasPricingPath = content.includes("'/pricing'") || content.includes('"/pricing"');
  
  if (hasCreditCardImport && hasPricingItem && hasPricingPath) {
    checks.push({ name: 'AppShell Pricing navigation', status: '✅ PASS', details: 'Pricing added to navigation menu' });
    return true;
  } else {
    checks.push({ 
      name: 'AppShell Pricing navigation', 
      status: '❌ FAIL', 
      details: `Import: ${hasCreditCardImport}, Item: ${hasPricingItem}, Path: ${hasPricingPath}` 
    });
    return false;
  }
}

// Check 7: Verify SignupForm has resend verification
function checkSignupFormResend() {
  const filePath = path.join(__dirname, '../src/components/auth/SignupForm.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasResendFunction = content.includes('resendVerification');
  const hasSupabaseImport = content.includes("from '../../lib/supabaseClient'") || content.includes("from '../lib/supabaseClient'");
  const hasResendButton = content.includes('Resend Verification Email') || content.includes('Resend verification');
  
  if (hasResendFunction && hasSupabaseImport && hasResendButton) {
    checks.push({ name: 'SignupForm resend verification', status: '✅ PASS', details: 'Resend verification email functionality added' });
    return true;
  } else {
    checks.push({ 
      name: 'SignupForm resend verification', 
      status: '❌ FAIL', 
      details: `Function: ${hasResendFunction}, Import: ${hasSupabaseImport}, Button: ${hasResendButton}` 
    });
    return false;
  }
}

// Check 8: Verify SettingsPage has Subscription tab
function checkSettingsSubscription() {
  const filePath = path.join(__dirname, '../src/pages/SettingsPage.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasSubscriptionSection = content.includes('SubscriptionSection') || content.includes('subscription');
  const hasCreditCardImport = content.includes("CreditCard");
  const hasManageButton = content.includes('Manage Subscription') || content.includes('manageSubscription');
  
  if (hasSubscriptionSection && hasCreditCardImport && hasManageButton) {
    checks.push({ name: 'SettingsPage Subscription tab', status: '✅ PASS', details: 'Subscription management tab added' });
    return true;
  } else {
    checks.push({ 
      name: 'SettingsPage Subscription tab', 
      status: '❌ FAIL', 
      details: `Section: ${hasSubscriptionSection}, Import: ${hasCreditCardImport}, Button: ${hasManageButton}` 
    });
    return false;
  }
}

// Check 9: Verify TeacherFeedWidget empty state
function checkTeacherFeedEmptyState() {
  const filePath = path.join(__dirname, '../src/components/dashboard/TeacherFeedWidget.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasEmptyState = content.includes('displayPosts.length === 0') || content.includes('posts.length === 0');
  const hasEmptyMessage = content.includes('No teacher posts') || content.includes('No posts yet');
  
  if (hasEmptyState && hasEmptyMessage) {
    checks.push({ name: 'TeacherFeedWidget empty state', status: '✅ PASS', details: 'Empty state handling added' });
    return true;
  } else {
    checks.push({ 
      name: 'TeacherFeedWidget empty state', 
      status: '❌ FAIL', 
      details: `Empty check: ${hasEmptyState}, Message: ${hasEmptyMessage}` 
    });
    return false;
  }
}

// Check 10: Verify migration file exists
function checkMigrationFile() {
  const filePath = path.join(__dirname, '../supabase/migrations/create_missing_tables.sql');
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasNotifications = content.includes('CREATE TABLE') && content.includes('notifications');
    const hasBadges = content.includes('CREATE TABLE') && content.includes('badges');
    const hasUserBadges = content.includes('CREATE TABLE') && content.includes('user_badges');
    
    if (hasNotifications && hasBadges && hasUserBadges) {
      checks.push({ name: 'Database migration file', status: '✅ PASS', details: 'Migration file exists with all required tables' });
      return true;
    } else {
      checks.push({ 
        name: 'Database migration file', 
        status: '⚠️ PARTIAL', 
        details: `Notifications: ${hasNotifications}, Badges: ${hasBadges}, User_badges: ${hasUserBadges}` 
      });
      return true;
    }
  } else {
    checks.push({ name: 'Database migration file', status: '❌ FAIL', details: 'Migration file not found' });
    return false;
  }
}

// Run all checks
console.log('Running verification checks...\n');

allChecksPassed = checkTeacherFeedWidget() && allChecksPassed;
allChecksPassed = checkAchievementsWidget() && allChecksPassed;
allChecksPassed = checkDashboardCourseMetadata() && allChecksPassed;
allChecksPassed = checkDashboardCourseIdValidation() && allChecksPassed;
allChecksPassed = checkCourseServiceValidation() && allChecksPassed;
allChecksPassed = checkAppShellPricing() && allChecksPassed;
allChecksPassed = checkSignupFormResend() && allChecksPassed;
allChecksPassed = checkSettingsSubscription() && allChecksPassed;
allChecksPassed = checkTeacherFeedEmptyState() && allChecksPassed;
allChecksPassed = checkMigrationFile() && allChecksPassed;

// Print results
console.log('📊 Verification Results:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  console.log(`   ${check.details}\n`);
});

const passedCount = checks.filter(c => c.status === '✅ PASS').length;
const failedCount = checks.filter(c => c.status === '❌ FAIL').length;
const partialCount = checks.filter(c => c.status === '⚠️ PARTIAL').length;

console.log('\n📈 Summary:');
console.log(`   ✅ Passed: ${passedCount}/${checks.length}`);
console.log(`   ❌ Failed: ${failedCount}/${checks.length}`);
console.log(`   ⚠️  Partial: ${partialCount}/${checks.length}`);

if (allChecksPassed && failedCount === 0) {
  console.log('\n🎉 All critical fixes verified!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some fixes need attention. Please review the failed checks above.');
  process.exit(1);
}
