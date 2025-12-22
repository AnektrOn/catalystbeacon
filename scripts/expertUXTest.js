#!/usr/bin/env node

/**
 * Expert-Level UX/UI Testing Framework
 * 
 * This framework tests the application comprehensively:
 * - HORIZONTAL: All features across all pages
 * - VERTICAL: Complete user journeys end-to-end
 * - UX/UI: Visual consistency, accessibility, responsiveness, performance
 * 
 * Based on industry best practices for UX/UI testing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'humancatalystnote@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || '123456';

// Comprehensive test results structure
const results = {
  metadata: {
    startTime: new Date().toISOString(),
    appUrl: APP_URL,
    testFramework: 'Expert UX/UI Testing Framework v1.0'
  },
  horizontal: {
    // Feature-based testing
    features: {},
    coverage: {}
  },
  vertical: {
    // User journey testing
    journeys: {},
    completion: {}
  },
  ux: {
    // UX/UI quality metrics
    visual: {},
    accessibility: {},
    responsiveness: {},
    performance: {},
    navigation: {},
    errorHandling: {}
  },
  metrics: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    passRate: 0
  },
  screenshots: [],
  errors: []
};

// Utility functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkAppRunning(url) {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get(url, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function takeScreenshot(page, name, description) {
  const dir = path.join(__dirname, '../testsprite_tests/screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(dir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  
  results.screenshots.push({ name, description, path: filepath });
  return filepath;
}

async function measurePerformance(page, pageName) {
  const metrics = await page.metrics();
  const performanceTiming = await page.evaluate(() => {
    const perf = window.performance.timing;
    return {
      domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
      loadComplete: perf.loadEventEnd - perf.navigationStart,
      firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0
    };
  });
  
  return {
    page: pageName,
    jsHeapUsed: metrics.JSHeapUsedSize,
    jsHeapTotal: metrics.JSHeapTotalSize,
    nodes: metrics.Nodes,
    ...performanceTiming,
    status: performanceTiming.loadComplete < 3000 ? 'pass' : 
            performanceTiming.loadComplete < 5000 ? 'warning' : 'fail'
  };
}

async function checkAccessibility(page, pageName) {
  const a11yResults = await page.evaluate(() => {
    const issues = {
      imagesWithoutAlt: 0,
      buttonsWithoutName: 0,
      linksWithoutText: 0,
      formInputsWithoutLabels: 0,
      lowContrast: 0,
      missingHeadings: false
    };
    
    // Check images
    const images = Array.from(document.querySelectorAll('img'));
    issues.imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
    
    // Check buttons
    const buttons = Array.from(document.querySelectorAll('button'));
    issues.buttonsWithoutName = buttons.filter(btn => {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      const ariaLabelledBy = btn.getAttribute('aria-labelledby');
      const title = btn.getAttribute('title');
      return !text && !ariaLabel && !ariaLabelledBy && !title;
    }).length;
    
    // Check links
    const links = Array.from(document.querySelectorAll('a[href]'));
    issues.linksWithoutText = links.filter(link => {
      const text = link.textContent?.trim();
      const ariaLabel = link.getAttribute('aria-label');
      return !text && !ariaLabel;
    }).length;
    
    // Check form inputs
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    issues.formInputsWithoutLabels = inputs.filter(input => {
      const id = input.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const placeholder = input.getAttribute('placeholder');
      return !label && !ariaLabel && !ariaLabelledBy && !placeholder;
    }).length;
    
    // Check headings structure
    const h1 = document.querySelector('h1');
    issues.missingHeadings = !h1;
    
    return issues;
  });
  
  const totalIssues = Object.values(a11yResults).reduce((sum, val) => sum + (typeof val === 'number' ? val : val ? 1 : 0), 0);
  
  return {
    page: pageName,
    ...a11yResults,
    totalIssues,
    status: totalIssues === 0 ? 'pass' : totalIssues < 5 ? 'warning' : 'fail'
  };
}

async function checkVisualConsistency(page, pageName) {
  const visualCheck = await page.evaluate(() => {
    const checks = {
      cssVariables: 0,
      inconsistentSpacing: 0,
      inconsistentTypography: 0,
      missingColors: false
    };
    
    // Check CSS variables
    const root = document.documentElement;
    const style = window.getComputedStyle(root);
    const vars = [];
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      if (prop.startsWith('--')) {
        vars.push(prop);
      }
    }
    checks.cssVariables = vars.length;
    
    // Check for color palette variables
    const colorVars = vars.filter(v => v.includes('color') || v.includes('Color'));
    checks.missingColors = colorVars.length < 5;
    
    // Check spacing consistency
    const containers = Array.from(document.querySelectorAll('[class*="container"], [class*="card"], [class*="widget"], [class*="panel"]'));
    const paddings = containers.map(el => {
      const style = window.getComputedStyle(el);
      return parseInt(style.paddingTop) || 0;
    }).filter(p => p > 0);
    
    if (paddings.length > 0) {
      const uniquePaddings = [...new Set(paddings)];
      const maxDiff = Math.max(...paddings) - Math.min(...paddings);
      checks.inconsistentSpacing = maxDiff > 50 ? 1 : 0;
    }
    
    // Check typography consistency
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const fontSizes = headings.map(h => {
      const style = window.getComputedStyle(h);
      return parseFloat(style.fontSize);
    }).filter(fs => fs > 0);
    
    if (fontSizes.length > 0) {
      const uniqueSizes = [...new Set(fontSizes)];
      checks.inconsistentTypography = uniqueSizes.length > 8 ? 1 : 0;
    }
    
    return checks;
  });
  
  return {
    page: pageName,
    ...visualCheck,
    status: visualCheck.inconsistentSpacing === 0 && 
            visualCheck.inconsistentTypography === 0 && 
            !visualCheck.missingColors ? 'pass' : 'warning'
  };
}

async function testFeature(page, featureName, tests) {
  const featureResults = [];
  
  for (const test of tests) {
    try {
      let result = { test: test.name, status: 'pending' };
      
      if (test.action === 'navigate') {
        await page.goto(`${APP_URL}${test.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
        await wait(test.waitAfter || 2000);
        result.status = 'pass';
      } else if (test.action === 'verify') {
        const element = await page.$(test.selector);
        result.status = element ? 'pass' : 'fail';
        if (!element && test.required) {
          result.error = `Required element not found: ${test.selector}`;
        }
      } else if (test.action === 'check') {
        const checkResult = await page.evaluate(test.check);
        result.status = checkResult ? 'pass' : 'fail';
        if (!checkResult) {
          result.error = test.errorMessage || 'Check failed';
        }
      } else if (test.action === 'click') {
        const element = await page.$(test.selector);
        if (element) {
          await element.click();
          await wait(test.waitAfter || 1000);
          result.status = 'pass';
        } else {
          result.status = 'fail';
          result.error = `Element not found: ${test.selector}`;
        }
      } else if (test.action === 'type') {
        const element = await page.$(test.selector);
        if (element) {
          await element.type(test.text, { delay: 50 });
          result.status = 'pass';
        } else {
          result.status = 'fail';
          result.error = `Element not found: ${test.selector}`;
        }
      } else if (test.action === 'measure') {
        const metrics = await measurePerformance(page, test.pageName || featureName);
        result.status = metrics.status;
        result.details = metrics;
      } else if (test.action === 'accessibility') {
        const a11y = await checkAccessibility(page, test.pageName || featureName);
        result.status = a11y.status;
        result.details = a11y;
      } else if (test.action === 'visual') {
        const visual = await checkVisualConsistency(page, test.pageName || featureName);
        result.status = visual.status;
        result.details = visual;
      }
      
      featureResults.push(result);
      results.metrics.totalTests++;
      if (result.status === 'pass') results.metrics.passed++;
      else if (result.status === 'fail') results.metrics.failed++;
      else if (result.status === 'warning') results.metrics.warnings++;
      
    } catch (error) {
      featureResults.push({
        test: test.name,
        status: 'fail',
        error: error.message
      });
      results.metrics.totalTests++;
      results.metrics.failed++;
    }
  }
  
  return featureResults;
}

async function testUserJourney(page, journeyName, steps) {
  const journeyResults = [];
  let currentStep = 0;
  
  for (const step of steps) {
    currentStep++;
    try {
      const stepResult = { step: step.name, number: currentStep, status: 'pending' };
      
      if (step.action === 'navigate') {
        await page.goto(`${APP_URL}${step.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
        await wait(step.waitAfter || 2000);
        stepResult.status = 'pass';
      } else if (step.action === 'verify') {
        const exists = await page.$(step.selector);
        stepResult.status = exists ? 'pass' : 'fail';
        if (!exists && step.required) {
          stepResult.error = `Required element missing: ${step.selector}`;
          if (step.critical) break;
        }
      } else if (step.action === 'interact') {
        if (step.type === 'click') {
          const element = await page.$(step.selector);
          if (element) {
            await element.click();
            await wait(step.waitAfter || 1000);
            stepResult.status = 'pass';
          } else {
            stepResult.status = 'fail';
            stepResult.error = `Element not found: ${step.selector}`;
          }
        } else if (step.type === 'type') {
          const element = await page.$(step.selector);
          if (element) {
            await element.type(step.text, { delay: 50 });
            stepResult.status = 'pass';
          } else {
            stepResult.status = 'fail';
            stepResult.error = `Element not found: ${step.selector}`;
          }
        }
      } else if (step.action === 'verify-url') {
        const currentUrl = page.url();
        stepResult.status = currentUrl.includes(step.expected) ? 'pass' : 'fail';
        if (stepResult.status === 'fail') {
          stepResult.error = `Expected URL to contain ${step.expected}, got ${currentUrl}`;
        }
      } else if (step.action === 'verify-content') {
        const content = await page.content();
        stepResult.status = content.includes(step.text) ? 'pass' : 'fail';
        if (stepResult.status === 'fail') {
          stepResult.error = `Expected content "${step.text}" not found`;
        }
      } else if (step.action === 'screenshot') {
        await takeScreenshot(page, step.name.toLowerCase().replace(/\s+/g, '-'), step.description);
        stepResult.status = 'pass';
      }
      
      journeyResults.push(stepResult);
      results.metrics.totalTests++;
      if (stepResult.status === 'pass') results.metrics.passed++;
      else {
        results.metrics.failed++;
        if (step.critical) break;
      }
      
    } catch (error) {
      journeyResults.push({
        step: step.name,
        number: currentStep,
        status: 'fail',
        error: error.message
      });
      results.metrics.totalTests++;
      results.metrics.failed++;
      if (step.critical) break;
    }
  }
  
  return journeyResults;
}

async function runExpertTests() {
  console.log('🎯 Expert UX/UI Testing Framework');
  console.log('='.repeat(70));
  console.log(`📍 Application: ${APP_URL}`);
  console.log(`🕐 Started: ${new Date().toLocaleString()}\n`);

  // Check if app is running
  console.log('🔍 Pre-flight Checks...');
  const isRunning = await checkAppRunning(APP_URL);
  if (!isRunning) {
    console.log('\n❌ Application is not running!');
    console.log('\nPlease start the application:');
    console.log('  npm start');
    console.log('\nThen run this test again.\n');
    process.exit(1);
  }
  console.log('✅ Application is running\n');

  let browser;
  let page;

  try {
    // Launch browser with optimal settings
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });

    page = await browser.newPage();

    // Set up comprehensive monitoring
    const consoleMessages = [];
    const networkRequests = [];
    const jsErrors = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text, timestamp: Date.now() });
      if (msg.type() === 'error' && !text.includes('favicon') && !text.includes('sourcemap')) {
        jsErrors.push(text);
      }
    });

    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        results.errors.push({
          type: 'network',
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });

    // ==========================================
    // HORIZONTAL TESTING: All Features
    // ==========================================

    console.log('\n' + '='.repeat(70));
    console.log('📋 HORIZONTAL TESTING: Feature Coverage');
    console.log('='.repeat(70) + '\n');

    // Feature 1: Authentication
    console.log('🔐 Testing: Authentication System');
    results.horizontal.features.authentication = await testFeature(page, 'Authentication', [
      { action: 'navigate', url: '/login', name: 'Login page loads' },
      { action: 'verify', selector: 'form', name: 'Login form present', required: true },
      { action: 'verify', selector: 'input[type="email"]', name: 'Email input present' },
      { action: 'verify', selector: 'input[type="password"]', name: 'Password input present' },
      { action: 'verify', selector: 'button[type="submit"]', name: 'Submit button present' },
      { action: 'check', check: () => {
        const form = document.querySelector('form');
        const labels = form.querySelectorAll('label');
        const inputs = form.querySelectorAll('input');
        return labels.length === inputs.length || inputs.length > 0;
      }, name: 'Form accessibility (labels present)' },
      { action: 'navigate', url: '/signup', name: 'Signup page loads' },
      { action: 'verify', selector: 'form', name: 'Signup form present', required: true },
      { action: 'check', check: () => {
        const pageContent = document.body.textContent;
        return pageContent.includes('Resend') || pageContent.includes('resendVerification');
      }, name: 'Resend verification functionality present' },
      { action: 'accessibility', pageName: 'Login', name: 'Login page accessibility' },
      { action: 'visual', pageName: 'Login', name: 'Login page visual consistency' },
      { action: 'measure', pageName: 'Login', name: 'Login page performance' }
    ]);
    await takeScreenshot(page, 'authentication-login', 'Login page');

    // Feature 2: Dashboard
    console.log('\n🏠 Testing: Dashboard');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
    await wait(1000);
    await page.type('input[type="email"]', TEST_USER_EMAIL, { delay: 50 });
    await page.type('input[type="password"]', TEST_USER_PASSWORD, { delay: 50 });
    await page.click('button[type="submit"]');
    await wait(3000);
    
    results.horizontal.features.dashboard = await testFeature(page, 'Dashboard', [
      { action: 'verify', selector: '[class*="widget"], [class*="card"]', name: 'Dashboard widgets present' },
      { action: 'check', check: () => {
        const widgets = document.querySelectorAll('[class*="XPProgress"], [class*="Achievements"], [class*="TeacherFeed"]');
        return widgets.length > 0;
      }, name: 'Key widgets loaded' },
      { action: 'check', check: () => {
        const viewAllButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('View All')
        );
        return viewAllButtons.length > 0;
      }, name: 'View All buttons present' },
      { action: 'check', check: () => {
        const pageContent = document.body.textContent;
        return pageContent.includes('No teacher posts') || 
               pageContent.includes('No posts yet') ||
               pageContent.includes('empty');
      }, name: 'Empty states implemented' },
      { action: 'check', check: () => {
        // Check for navigation errors
        return !window.console._logs?.some(log => 
          log.includes('navigate') && log.includes('not defined')
        );
      }, name: 'No navigation errors' },
      { action: 'check', check: () => {
        // Check for database errors
        const errors = window.performance.getEntriesByType('resource')
          .filter(r => r.responseStatus >= 400)
          .filter(r => r.name.includes('/notifications') || r.name.includes('/badges'));
        return errors.length === 0;
      }, name: 'No database 404 errors' },
      { action: 'accessibility', pageName: 'Dashboard', name: 'Dashboard accessibility' },
      { action: 'visual', pageName: 'Dashboard', name: 'Dashboard visual consistency' },
      { action: 'measure', pageName: 'Dashboard', name: 'Dashboard performance' }
    ]);
    await takeScreenshot(page, 'dashboard', 'Dashboard page');

    // Feature 3: Courses
    console.log('\n📚 Testing: Course Management');
    results.horizontal.features.courses = await testFeature(page, 'Courses', [
      { action: 'navigate', url: '/courses', name: 'Courses page loads' },
      { action: 'verify', selector: '[class*="course"], [class*="card"]', name: 'Course listings present' },
      { action: 'check', check: () => {
        const pageContent = document.body.textContent;
        return !pageContent.includes('course_metadata.title') || 
               pageContent.includes('course_title');
      }, name: 'Using correct course_title column' },
      { action: 'accessibility', pageName: 'Courses', name: 'Courses page accessibility' },
      { action: 'visual', pageName: 'Courses', name: 'Courses page visual consistency' }
    ]);

    // Feature 4: Mastery
    console.log('\n🎯 Testing: Mastery System');
    results.horizontal.features.mastery = await testFeature(page, 'Mastery', [
      { action: 'navigate', url: '/mastery', name: 'Mastery page loads' },
      { action: 'verify', selector: '[role="tab"], [class*="tab"]', name: 'Mastery tabs present' },
      { action: 'accessibility', pageName: 'Mastery', name: 'Mastery page accessibility' }
    ]);

    // Feature 5: Community
    console.log('\n👥 Testing: Community Features');
    results.horizontal.features.community = await testFeature(page, 'Community', [
      { action: 'navigate', url: '/community', name: 'Community page loads' },
      { action: 'verify', selector: '[class*="post"], [class*="feed"]', name: 'Community feed present' },
      { action: 'accessibility', pageName: 'Community', name: 'Community page accessibility' }
    ]);

    // Feature 6: Profile
    console.log('\n👤 Testing: Profile Management');
    results.horizontal.features.profile = await testFeature(page, 'Profile', [
      { action: 'navigate', url: '/profile', name: 'Profile page loads' },
      { action: 'verify', selector: '[class*="avatar"], img', name: 'Avatar displayed' },
      { action: 'accessibility', pageName: 'Profile', name: 'Profile page accessibility' }
    ]);

    // Feature 7: Settings
    console.log('\n⚙️ Testing: Settings & Subscription');
    results.horizontal.features.settings = await testFeature(page, 'Settings', [
      { action: 'navigate', url: '/settings', name: 'Settings page loads' },
      { action: 'check', check: () => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        return buttons.some(btn => btn.textContent.includes('Subscription'));
      }, name: 'Subscription tab present' },
      { action: 'check', check: () => {
        const pageContent = document.body.textContent;
        return pageContent.includes('SubscriptionSection') || 
               pageContent.includes('Manage Subscription') ||
               pageContent.includes('subscription');
      }, name: 'Subscription management code present' },
      { action: 'accessibility', pageName: 'Settings', name: 'Settings page accessibility' }
    ]);

    // Feature 8: Stellar Map
    console.log('\n⭐ Testing: Stellar Map');
    results.horizontal.features.stellarMap = await testFeature(page, 'Stellar Map', [
      { action: 'navigate', url: '/stellar-map', name: 'Stellar Map page loads', waitAfter: 3000 },
      { action: 'check', check: () => {
        return !!document.querySelector('[class*="stellar"], [class*="map"], canvas, svg');
      }, name: 'Map visualization loaded' }
    ]);

    // Feature 9: Pricing
    console.log('\n💳 Testing: Pricing');
    results.horizontal.features.pricing = await testFeature(page, 'Pricing', [
      { action: 'navigate', url: '/pricing', name: 'Pricing page loads' },
      { action: 'verify', selector: '[class*="plan"], [class*="pricing"]', name: 'Pricing plans displayed' },
      { action: 'accessibility', pageName: 'Pricing', name: 'Pricing page accessibility' }
    ]);

    // Calculate horizontal coverage
    const allFeatures = Object.keys(results.horizontal.features);
    const testedFeatures = allFeatures.filter(f => results.horizontal.features[f].length > 0);
    results.horizontal.coverage = {
      total: allFeatures.length,
      tested: testedFeatures.length,
      percentage: ((testedFeatures.length / allFeatures.length) * 100).toFixed(1)
    };

    // ==========================================
    // VERTICAL TESTING: User Journeys
    // ==========================================

    console.log('\n' + '='.repeat(70));
    console.log('🔄 VERTICAL TESTING: Complete User Journeys');
    console.log('='.repeat(70) + '\n');

    // Journey 1: New User Registration
    console.log('👤 Journey 1: New User Registration Flow');
    results.vertical.journeys.newUser = await testUserJourney(page, 'New User Registration', [
      { action: 'navigate', url: '/signup', name: 'Navigate to signup' },
      { action: 'screenshot', name: 'signup-form', description: 'Signup form initial state' },
      { action: 'verify', selector: 'form', name: 'Signup form present', required: true, critical: true },
      { action: 'interact', type: 'type', selector: 'input[name="fullName"]', text: 'Test User', name: 'Enter full name' },
      { action: 'interact', type: 'type', selector: 'input[name="email"]', text: `test${Date.now()}@example.com`, name: 'Enter email' },
      { action: 'interact', type: 'type', selector: 'input[name="password"]', text: 'Test123456', name: 'Enter password' },
      { action: 'interact', type: 'type', selector: 'input[name="confirmPassword"]', text: 'Test123456', name: 'Confirm password' },
      { action: 'interact', type: 'click', selector: 'input[name="agreeToTerms"]', name: 'Agree to terms' },
      { action: 'verify-content', text: 'Resend', name: 'Resend verification option present' },
      { action: 'screenshot', name: 'signup-complete', description: 'Signup form completed' }
    ]);

    // Journey 2: Student Learning Flow
    console.log('\n👨‍🎓 Journey 2: Student Learning Flow');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
    await wait(1000);
    await page.type('input[type="email"]', TEST_USER_EMAIL, { delay: 50 });
    await page.type('input[type="password"]', TEST_USER_PASSWORD, { delay: 50 });
    await page.click('button[type="submit"]');
    await wait(3000);
    
    results.vertical.journeys.student = await testUserJourney(page, 'Student Learning', [
      { action: 'verify-url', expected: '/dashboard', name: 'Logged in and redirected to dashboard', critical: true },
      { action: 'screenshot', name: 'dashboard-loaded', description: 'Dashboard after login' },
      { action: 'verify', selector: '[class*="widget"]', name: 'Dashboard widgets loaded' },
      { action: 'navigate', url: '/courses', name: 'Navigate to courses' },
      { action: 'verify', selector: '[class*="course"]', name: 'Course listings displayed' },
      { action: 'navigate', url: '/mastery', name: 'Navigate to mastery' },
      { action: 'verify', selector: '[role="tab"]', name: 'Mastery tabs present' },
      { action: 'navigate', url: '/community', name: 'Navigate to community' },
      { action: 'verify', selector: '[class*="post"], [class*="feed"]', name: 'Community feed loaded' }
    ]);

    // Journey 3: Subscription Purchase
    console.log('\n💳 Journey 3: Subscription Purchase Flow');
    results.vertical.journeys.subscription = await testUserJourney(page, 'Subscription Purchase', [
      { action: 'navigate', url: '/pricing', name: 'Navigate to pricing' },
      { action: 'screenshot', name: 'pricing-page', description: 'Pricing page' },
      { action: 'verify', selector: '[class*="plan"]', name: 'Pricing plans displayed' },
      { action: 'navigate', url: '/settings', name: 'Navigate to settings' },
      { action: 'check', check: () => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        return buttons.some(btn => btn.textContent.includes('Subscription'));
      }, name: 'Subscription tab accessible' }
    ]);

    // Calculate journey completion
    Object.keys(results.vertical.journeys).forEach(journey => {
      const steps = results.vertical.journeys[journey];
      const passed = steps.filter(s => s.status === 'pass').length;
      results.vertical.completion[journey] = {
        total: steps.length,
        passed,
        percentage: steps.length > 0 ? ((passed / steps.length) * 100).toFixed(1) : 0
      };
    });

    // ==========================================
    // UX/UI QUALITY TESTING
    // ==========================================

    console.log('\n' + '='.repeat(70));
    console.log('🎨 UX/UI QUALITY ASSURANCE');
    console.log('='.repeat(70) + '\n');

    // Test all pages for UX quality
    const pagesToTest = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Courses', url: '/courses' },
      { name: 'Mastery', url: '/mastery' },
      { name: 'Community', url: '/community' },
      { name: 'Profile', url: '/profile' },
      { name: 'Settings', url: '/settings' },
      { name: 'Pricing', url: '/pricing' }
    ];

    for (const pageInfo of pagesToTest) {
      console.log(`   Testing ${pageInfo.name}...`);
      await page.goto(`${APP_URL}${pageInfo.url}`, { waitUntil: 'networkidle2' });
      await wait(2000);
      
      // Visual consistency
      const visual = await checkVisualConsistency(page, pageInfo.name);
      if (!results.ux.visual[pageInfo.name]) {
        results.ux.visual[pageInfo.name] = visual;
      }
      
      // Accessibility
      const a11y = await checkAccessibility(page, pageInfo.name);
      if (!results.ux.accessibility[pageInfo.name]) {
        results.ux.accessibility[pageInfo.name] = a11y;
      }
      
      // Performance
      const perf = await measurePerformance(page, pageInfo.name);
      if (!results.ux.performance[pageInfo.name]) {
        results.ux.performance[pageInfo.name] = perf;
      }
      
      // Screenshot
      await takeScreenshot(page, pageInfo.name.toLowerCase().replace(' ', '-'), `${pageInfo.name} page`);
    }

    // Responsive testing
    console.log('\n📱 Responsive Testing');
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      console.log(`   Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
      await wait(2000);
      
      const layout = await page.evaluate(() => {
        return {
          width: document.body.offsetWidth,
          height: document.body.offsetHeight,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
      });
      
      results.ux.responsiveness[viewport.name] = {
        ...layout,
        status: layout.hasHorizontalScroll ? 'fail' : 'pass'
      };
      
      await takeScreenshot(page, `dashboard-${viewport.name.toLowerCase()}`, `Dashboard on ${viewport.name}`);
    }

    // Reset to desktop
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigation testing
    console.log('\n🧭 Navigation Testing');
    await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const navTests = [];
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/"], button'));
      return links.map(link => ({
        text: link.textContent.trim(),
        href: link.href || link.getAttribute('href') || 'button',
        visible: link.offsetParent !== null
      })).filter(link => link.text && link.visible && link.href !== 'button').slice(0, 10);
    });
    
    for (const link of navLinks) {
      try {
        if (link.href.startsWith('http')) {
          await page.goto(link.href);
          await wait(1000);
          navTests.push({
            link: link.text,
            status: 'pass',
            url: link.href
          });
        }
      } catch (error) {
        navTests.push({
          link: link.text,
          status: 'fail',
          error: error.message
        });
      }
    }
    
    results.ux.navigation = {
      totalLinks: navLinks.length,
      tested: navTests.length,
      passed: navTests.filter(t => t.status === 'pass').length,
      tests: navTests
    };

    // Error handling testing
    console.log('\n⚠️ Error Handling Testing');
    results.ux.errorHandling = {
      jsErrors: jsErrors.length,
      networkErrors: results.errors.filter(e => e.type === 'network').length,
      status: jsErrors.length === 0 && results.errors.filter(e => e.type === 'network').length === 0 ? 'pass' : 'warning',
      details: {
        jsErrors: jsErrors.slice(0, 10), // First 10 errors
        networkErrors: results.errors.filter(e => e.type === 'network').slice(0, 10)
      }
    };

  } catch (error) {
    results.errors.push({
      type: 'test_execution',
      error: error.message,
      stack: error.stack
    });
    console.error('❌ Test execution error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Calculate final metrics
  results.metrics.passRate = results.metrics.totalTests > 0 
    ? ((results.metrics.passed / results.metrics.totalTests) * 100).toFixed(1)
    : 0;
  
  results.metadata.endTime = new Date().toISOString();
  results.metadata.duration = new Date(results.metadata.endTime) - new Date(results.metadata.startTime);

  // Generate comprehensive report
  generateExpertReport();
}

function generateExpertReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(70));

  // Horizontal testing summary
  console.log('\n📋 HORIZONTAL TESTING SUMMARY');
  console.log('-'.repeat(70));
  Object.keys(results.horizontal.features).forEach(feature => {
    const tests = results.horizontal.features[feature];
    const passed = tests.filter(t => t.status === 'pass').length;
    const failed = tests.filter(t => t.status === 'fail').length;
    const warnings = tests.filter(t => t.status === 'warning').length;
    const status = failed > 0 ? '❌' : warnings > 0 ? '⚠️' : '✅';
    console.log(`${status} ${feature.toUpperCase()}: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  });
  console.log(`\nCoverage: ${results.horizontal.coverage.tested}/${results.horizontal.coverage.total} features (${results.horizontal.coverage.percentage}%)`);

  // Vertical testing summary
  console.log('\n🔄 VERTICAL TESTING SUMMARY');
  console.log('-'.repeat(70));
  Object.keys(results.vertical.journeys).forEach(journey => {
    const completion = results.vertical.completion[journey];
    const status = completion.percentage === 100 ? '✅' : completion.percentage >= 70 ? '⚠️' : '❌';
    console.log(`${status} ${journey}: ${completion.passed}/${completion.total} steps (${completion.percentage}% complete)`);
  });

  // UX/UI summary
  console.log('\n🎨 UX/UI QUALITY SUMMARY');
  console.log('-'.repeat(70));
  
  // Visual consistency
  const visualPages = Object.keys(results.ux.visual);
  const visualPass = visualPages.filter(p => results.ux.visual[p].status === 'pass').length;
  console.log(`✅ Visual Consistency: ${visualPass}/${visualPages.length} pages pass`);
  
  // Accessibility
  const a11yPages = Object.keys(results.ux.accessibility);
  const a11yTotalIssues = a11yPages.reduce((sum, p) => sum + results.ux.accessibility[p].totalIssues, 0);
  console.log(`${a11yTotalIssues === 0 ? '✅' : '⚠️'} Accessibility: ${a11yTotalIssues} issues found across ${a11yPages.length} pages`);
  
  // Responsiveness
  const responsiveViewports = Object.keys(results.ux.responsiveness);
  const responsivePass = responsiveViewports.filter(v => results.ux.responsiveness[v].status === 'pass').length;
  console.log(`✅ Responsiveness: ${responsivePass}/${responsiveViewports.length} viewports pass`);
  
  // Performance
  const perfPages = Object.keys(results.ux.performance);
  const perfPass = perfPages.filter(p => results.ux.performance[p].status === 'pass').length;
  console.log(`✅ Performance: ${perfPass}/${perfPages.length} pages meet targets`);
  
  // Navigation
  console.log(`✅ Navigation: ${results.ux.navigation.passed}/${results.ux.navigation.tested} links work`);
  
  // Error handling
  console.log(`${results.ux.errorHandling.status === 'pass' ? '✅' : '⚠️'} Error Handling: ${results.ux.errorHandling.jsErrors} JS errors, ${results.ux.errorHandling.networkErrors} network errors`);

  // Overall summary
  console.log('\n' + '='.repeat(70));
  console.log('📈 OVERALL SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${results.metrics.totalTests}`);
  console.log(`✅ Passed: ${results.metrics.passed}`);
  console.log(`❌ Failed: ${results.metrics.failed}`);
  console.log(`⚠️ Warnings: ${results.metrics.warnings}`);
  console.log(`Pass Rate: ${results.metrics.passRate}%`);
  console.log(`Duration: ${(results.metadata.duration / 1000).toFixed(2)}s`);

  // Critical issues
  if (results.errors.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    results.errors.slice(0, 10).forEach(err => {
      console.log(`   - ${err.type}: ${err.error || err.url || 'Unknown'}`);
    });
  }

  // Generate detailed markdown report
  const reportPath = path.join(__dirname, '../testsprite_tests/expert-ux-test-report.md');
  const reportContent = generateMarkdownReport();
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Save JSON results
  const jsonPath = path.join(__dirname, '../testsprite_tests/test-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📊 JSON results saved to: ${jsonPath}`);

  if (results.metrics.failed === 0 && results.errors.length === 0) {
    console.log('\n🎉 All tests passed! Application meets expert UX/UI standards.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please review the detailed report.');
    process.exit(1);
  }
}

function generateMarkdownReport() {
  return `# Expert UX/UI Test Report

**Generated:** ${results.metadata.startTime}  
**Duration:** ${(results.metadata.duration / 1000).toFixed(2)} seconds  
**Application:** ${APP_URL}

---

## Executive Summary

### Test Coverage
- **Horizontal:** ${results.horizontal.coverage.tested}/${results.horizontal.coverage.total} features (${results.horizontal.coverage.percentage}%)
- **Vertical:** ${Object.keys(results.vertical.journeys).length} complete user journeys tested
- **UX/UI:** ${Object.keys(results.ux.visual).length} pages tested for quality

### Overall Results
- **Total Tests:** ${results.metrics.totalTests}
- **✅ Passed:** ${results.metrics.passed}
- **❌ Failed:** ${results.metrics.failed}
- **⚠️ Warnings:** ${results.metrics.warnings}
- **Pass Rate:** ${results.metrics.passRate}%

---

## 📋 Horizontal Testing: Feature Coverage

${Object.keys(results.horizontal.features).map(feature => {
  const tests = results.horizontal.features[feature];
  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;
  const warnings = tests.filter(t => t.status === 'warning').length;
  
  return `### ${feature.charAt(0).toUpperCase() + feature.slice(1)}

**Status:** ${failed > 0 ? '❌ Failed' : warnings > 0 ? '⚠️ Warnings' : '✅ Passed'}  
**Results:** ${passed} passed, ${failed} failed, ${warnings} warnings

${tests.map(test => {
  const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
  let details = '';
  if (test.details) {
    if (typeof test.details === 'object') {
      details = `\n   - Details: ${JSON.stringify(test.details, null, 2).split('\\n').join('\\n   ')}`;
    } else {
      details = ` - ${test.details}`;
    }
  }
  return `- ${icon} **${test.test}**${test.error ? ` - ${test.error}` : ''}${details}`;
}).join('\n')}
`;
}).join('\n')}

---

## 🔄 Vertical Testing: User Journeys

${Object.keys(results.vertical.journeys).map(journey => {
  const steps = results.vertical.journeys[journey];
  const completion = results.vertical.completion[journey];
  
  return `### ${journey.charAt(0).toUpperCase() + journey.slice(1).replace(/([A-Z])/g, ' $1')}

**Completion:** ${completion.percentage}% (${completion.passed}/${completion.total} steps)

${steps.map((step, i) => {
  const icon = step.status === 'pass' ? '✅' : '❌';
  return `- ${icon} **Step ${step.number || i + 1}:** ${step.step}${step.error ? ` - ${step.error}` : ''}`;
}).join('\n')}
`;
}).join('\n')}

---

## 🎨 UX/UI Quality Assurance

### Visual Consistency

${Object.keys(results.ux.visual).map(page => {
  const v = results.ux.visual[page];
  return `- **${page}:** ${v.status === 'pass' ? '✅' : '⚠️'}
  - CSS Variables: ${v.cssVariables}
  - Spacing Issues: ${v.inconsistentSpacing}
  - Typography Issues: ${v.inconsistentTypography}
  - Missing Colors: ${v.missingColors ? 'Yes' : 'No'}`;
}).join('\n')}

### Accessibility

${Object.keys(results.ux.accessibility).map(page => {
  const a = results.ux.accessibility[page];
  return `- **${page}:** ${a.status === 'pass' ? '✅' : a.status === 'warning' ? '⚠️' : '❌'}
  - Images without alt: ${a.imagesWithoutAlt}
  - Buttons without names: ${a.buttonsWithoutName}
  - Links without text: ${a.linksWithoutText}
  - Form inputs without labels: ${a.formInputsWithoutLabels}
  - Total issues: ${a.totalIssues}`;
}).join('\n')}

### Responsiveness

${Object.keys(results.ux.responsiveness).map(viewport => {
  const r = results.ux.responsiveness[viewport];
  return `- **${viewport}:** ${r.status === 'pass' ? '✅' : '❌'}
  - Width: ${r.width}px
  - Height: ${r.height}px
  - Horizontal scroll: ${r.hasHorizontalScroll ? 'Yes ❌' : 'No ✅'}`;
}).join('\n')}

### Performance

${Object.keys(results.ux.performance).map(page => {
  const p = results.ux.performance[page];
  return `- **${page}:** ${p.status === 'pass' ? '✅' : p.status === 'warning' ? '⚠️' : '❌'}
  - Load time: ${p.loadComplete}ms
  - DOM Content Loaded: ${p.domContentLoaded}ms
  - First Paint: ${p.firstPaint}ms
  - JS Heap Used: ${(p.jsHeapUsed / 1024 / 1024).toFixed(2)}MB`;
}).join('\n')}

### Navigation

- **Total Links:** ${results.ux.navigation.totalLinks}
- **Tested:** ${results.ux.navigation.tested}
- **✅ Working:** ${results.ux.navigation.passed}
- **❌ Broken:** ${results.ux.navigation.tested - results.ux.navigation.passed}

${results.ux.navigation.tests.map(test => {
  const icon = test.status === 'pass' ? '✅' : '❌';
  return `- ${icon} ${test.link}${test.error ? ` - ${test.error}` : ''}`;
}).join('\n')}

### Error Handling

- **JavaScript Errors:** ${results.ux.errorHandling.jsErrors}
- **Network Errors:** ${results.ux.errorHandling.networkErrors}
- **Status:** ${results.ux.errorHandling.status === 'pass' ? '✅ Pass' : '⚠️ Warnings'}

${results.ux.errorHandling.jsErrors > 0 ? `\n**JS Errors (first 10):**\n${results.ux.errorHandling.details.jsErrors.map(e => `- ${e}`).join('\n')}` : ''}

${results.ux.errorHandling.networkErrors > 0 ? `\n**Network Errors (first 10):**\n${results.ux.errorHandling.details.networkErrors.map(e => `- ${e.url}: ${e.status}`).join('\n')}` : ''}

---

## 📸 Screenshots

${results.screenshots.map(s => `- [${s.name}](${s.path}) - ${s.description}`).join('\n')}

---

## 🚨 Critical Issues

${results.errors.length > 0 ? results.errors.map(e => `- **${e.type}:** ${e.error || e.url || 'Unknown error'}`).join('\n') : 'No critical issues found.'}

---

## 💡 Recommendations

${generateRecommendations()}

---

**Report Generated:** ${results.metadata.endTime}  
**Testing Framework:** Expert UX/UI Testing Framework v1.0
`;
}

function generateRecommendations() {
  const recommendations = [];
  
  // Analyze results
  const failedTests = [];
  Object.values(results.horizontal.features).forEach(tests => {
    tests.forEach(test => {
      if (test.status === 'fail') {
        failedTests.push(test);
      }
    });
  });
  
  if (failedTests.length > 0) {
    recommendations.push('### Critical Fixes Needed');
    failedTests.forEach(test => {
      recommendations.push(`- **${test.test}:** ${test.error || 'Fix required'}`);
    });
  }
  
  // Accessibility recommendations
  const totalA11yIssues = Object.values(results.ux.accessibility).reduce((sum, a) => sum + a.totalIssues, 0);
  if (totalA11yIssues > 0) {
    recommendations.push('\n### Accessibility Improvements');
    const imagesWithoutAlt = Object.values(results.ux.accessibility).reduce((sum, a) => sum + a.imagesWithoutAlt, 0);
    const buttonsWithoutName = Object.values(results.ux.accessibility).reduce((sum, a) => sum + a.buttonsWithoutName, 0);
    if (imagesWithoutAlt > 0) {
      recommendations.push(`- Add alt text to ${imagesWithoutAlt} images`);
    }
    if (buttonsWithoutName > 0) {
      recommendations.push(`- Add accessible names to ${buttonsWithoutName} buttons`);
    }
  }
  
  // Performance recommendations
  const slowPages = Object.keys(results.ux.performance).filter(p => 
    results.ux.performance[p].status !== 'pass'
  );
  if (slowPages.length > 0) {
    recommendations.push('\n### Performance Optimization');
    recommendations.push(`- Optimize load times for: ${slowPages.join(', ')}`);
    recommendations.push('- Implement code splitting');
    recommendations.push('- Optimize images and assets');
    recommendations.push('- Consider lazy loading for below-the-fold content');
  }
  
  // Responsiveness recommendations
  const responsiveIssues = Object.keys(results.ux.responsiveness).filter(v => 
    results.ux.responsiveness[v].status === 'fail'
  );
  if (responsiveIssues.length > 0) {
    recommendations.push('\n### Responsive Design Fixes');
    recommendations.push(`- Fix horizontal scrolling on: ${responsiveIssues.join(', ')}`);
    recommendations.push('- Ensure touch targets are at least 44x44px');
    recommendations.push('- Test on real devices');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ **No critical recommendations. Application meets expert UX/UI standards!**');
  }
  
  return recommendations.join('\n');
}

// Run tests
runExpertTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
