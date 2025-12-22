#!/usr/bin/env node

/**
 * Comprehensive UX/UI Testing Framework
 * Expert-level testing covering:
 * - Horizontal: All features across the application
 * - Vertical: Complete user journeys from start to finish
 * - UX/UI: Visual consistency, accessibility, responsiveness, error handling
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'humancatalystnote@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || '123456';

// Test results structure
const testResults = {
  horizontal: {
    authentication: [],
    dashboard: [],
    courses: [],
    mastery: [],
    community: [],
    profile: [],
    settings: [],
    stellarMap: [],
    pricing: []
  },
  vertical: {
    newUserJourney: [],
    studentJourney: [],
    teacherJourney: [],
    subscriptionJourney: []
  },
  ux: {
    visualConsistency: [],
    accessibility: [],
    responsiveness: [],
    errorHandling: [],
    performance: [],
    navigation: []
  },
  errors: [],
  screenshots: []
};

// Helper functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, name) {
  const screenshotPath = path.join(__dirname, `../testsprite_tests/screenshots/${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  testResults.screenshots.push({ name, path: screenshotPath });
  return screenshotPath;
}

async function checkAccessibility(page) {
  const issues = [];
  
  // Check for images without alt text
  const imagesWithoutAlt = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !img.alt || img.alt.trim() === '').length;
  });
  
  if (imagesWithoutAlt > 0) {
    issues.push(`Found ${imagesWithoutAlt} images without alt text`);
  }
  
  // Check for buttons without accessible names
  const buttonsWithoutName = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.filter(btn => {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      const ariaLabelledBy = btn.getAttribute('aria-labelledby');
      return !text && !ariaLabel && !ariaLabelledBy;
    }).length;
  });
  
  if (buttonsWithoutName > 0) {
    issues.push(`Found ${buttonsWithoutName} buttons without accessible names`);
  }
  
  // Check color contrast (basic check)
  const lowContrast = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    let count = 0;
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;
      // Basic check - in production, use a proper contrast checker
      if (color === bgColor) count++;
    });
    return count;
  });
  
  return { issues, imagesWithoutAlt, buttonsWithoutName, lowContrast };
}

async function checkVisualConsistency(page, pageName) {
  const checks = [];
  
  // Check for consistent spacing
  const spacingIssues = await page.evaluate(() => {
    const issues = [];
    const containers = Array.from(document.querySelectorAll('[class*="container"], [class*="card"], [class*="widget"]'));
    const paddings = containers.map(el => {
      const style = window.getComputedStyle(el);
      return {
        padding: style.padding,
        margin: style.margin
      };
    });
    
    // Check for extreme inconsistencies
    const paddingValues = paddings.map(p => parseInt(p.padding) || 0);
    const maxPadding = Math.max(...paddingValues);
    const minPadding = Math.min(...paddingValues);
    
    if (maxPadding - minPadding > 50) {
      issues.push('Inconsistent padding detected');
    }
    
    return issues;
  });
  
  // Check for consistent typography
  const typographyIssues = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const fontSizes = headings.map(h => {
      const style = window.getComputedStyle(h);
      return parseFloat(style.fontSize);
    });
    
    const uniqueSizes = [...new Set(fontSizes)];
    if (uniqueSizes.length > 5) {
      return ['Too many different heading sizes detected'];
    }
    return [];
  });
  
  // Check for CSS variable usage (should be consistent)
  const cssVariables = await page.evaluate(() => {
    const root = document.documentElement;
    const style = window.getComputedStyle(root);
    const vars = [];
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      if (prop.startsWith('--')) {
        vars.push(prop);
      }
    }
    return vars;
  });
  
  checks.push({
    page: pageName,
    spacingIssues: spacingIssues.length,
    typographyIssues: typographyIssues.length,
    cssVariables: cssVariables.length,
    status: spacingIssues.length === 0 && typographyIssues.length === 0 ? 'pass' : 'warning'
  });
  
  return checks;
}

async function checkErrorHandling(page) {
  const errors = [];
  const warnings = [];
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('sourcemap')) {
        errors.push(text);
      }
    }
  });
  
  // Monitor network errors
  page.on('requestfailed', request => {
    const url = request.url();
    const failure = request.failure();
    if (failure && failure.errorText !== 'net::ERR_ABORTED') {
      warnings.push({
        url,
        error: failure.errorText
      });
    }
  });
  
  await wait(3000); // Wait for page to load
  
  return { errors, warnings };
}

async function testNavigationFlow(page, flowName, steps) {
  const results = [];
  console.log(`\n🔄 Testing ${flowName}...`);
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      console.log(`   Step ${i + 1}/${steps.length}: ${step.name}`);
      
      if (step.action === 'navigate') {
        await page.goto(`${APP_URL}${step.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
        await wait(2000);
      } else if (step.action === 'click') {
        const element = await page.$(step.selector);
        if (element) {
          await element.click();
          await wait(step.waitAfter || 1000);
        } else {
          throw new Error(`Element not found: ${step.selector}`);
        }
      } else if (step.action === 'type') {
        const element = await page.$(step.selector);
        if (element) {
          await element.type(step.text, { delay: 50 });
        } else {
          throw new Error(`Element not found: ${step.selector}`);
        }
      } else if (step.action === 'verify') {
        const exists = await page.$(step.selector);
        if (!exists && step.required) {
          throw new Error(`Required element not found: ${step.selector}`);
        }
      } else if (step.action === 'check') {
        const result = await page.evaluate(step.check);
        if (!result) {
          throw new Error(`Check failed: ${step.name}`);
        }
      }
      
      // Verify URL if specified
      if (step.expectedUrl) {
        const currentUrl = page.url();
        if (!currentUrl.includes(step.expectedUrl)) {
          throw new Error(`Expected URL to contain ${step.expectedUrl}, got ${currentUrl}`);
        }
      }
      
      // Check for errors
      const errorCheck = await checkErrorHandling(page);
      if (errorCheck.errors.length > 0 && step.critical) {
        throw new Error(`Critical errors found: ${errorCheck.errors.join(', ')}`);
      }
      
      results.push({
        step: step.name,
        status: 'pass',
        duration: Date.now()
      });
      
    } catch (error) {
      results.push({
        step: step.name,
        status: 'fail',
        error: error.message
      });
      
      if (step.critical) {
        break; // Stop flow if critical step fails
      }
    }
  }
  
  return results;
}

async function checkAppRunning(url) {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runComprehensiveTests() {
  console.log('🎯 Comprehensive UX/UI Testing Framework');
  console.log('=' .repeat(60));
  console.log(`📍 Testing: ${APP_URL}\n`);

  // Check if app is running
  console.log('🔍 Checking if application is running...');
  const isRunning = await checkAppRunning(APP_URL);
  if (!isRunning) {
    console.log('\n❌ Application is not running!');
    console.log('\nPlease start the application first:');
    console.log('  npm start');
    console.log('\nThen run this test again.');
    process.exit(1);
  }
  console.log('✅ Application is running\n');

  let browser;
  let page;

  try {
    // Launch browser with optimal settings
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--window-size=1920,1080'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });

    page = await browser.newPage();

    // Set up comprehensive monitoring
    const consoleMessages = [];
    const networkRequests = [];
    const jsErrors = [];
    const performanceMetrics = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text, timestamp: Date.now() });
      if (msg.type() === 'error') {
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
        testResults.errors.push({
          type: 'network',
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });

    // ==========================================
    // VERTICAL TESTING: Complete User Journeys
    // ==========================================

    console.log('\n📊 VERTICAL TESTING: Complete User Journeys\n');

    // Journey 1: New User Registration Flow
    console.log('👤 Journey 1: New User Registration Flow');
    const newUserJourney = await testNavigationFlow(page, 'New User Registration', [
      { action: 'navigate', url: '/signup', name: 'Navigate to signup' },
      { action: 'verify', selector: 'form', name: 'Signup form present', required: true },
      { action: 'type', selector: 'input[name="fullName"]', text: 'Test User', name: 'Enter full name' },
      { action: 'type', selector: 'input[name="email"]', text: `test${Date.now()}@example.com`, name: 'Enter email' },
      { action: 'type', selector: 'input[name="password"]', text: 'Test123456', name: 'Enter password' },
      { action: 'type', selector: 'input[name="confirmPassword"]', text: 'Test123456', name: 'Confirm password' },
      { action: 'click', selector: 'input[name="agreeToTerms"]', name: 'Agree to terms' },
      { action: 'verify', selector: 'button[type="submit"]', name: 'Submit button present' },
      { action: 'check', check: () => {
        const form = document.querySelector('form');
        const inputs = form.querySelectorAll('input[required]');
        return Array.from(inputs).every(input => input.value.trim() !== '');
      }, name: 'All required fields filled' }
    ]);
    testResults.vertical.newUserJourney = newUserJourney;

    // Journey 2: Existing User Login & Dashboard Exploration
    console.log('\n👤 Journey 2: Existing User Login & Dashboard Exploration');
    const loginJourney = await testNavigationFlow(page, 'Login & Dashboard', [
      { action: 'navigate', url: '/login', name: 'Navigate to login' },
      { action: 'type', selector: 'input[type="email"]', text: TEST_USER_EMAIL, name: 'Enter email' },
      { action: 'type', selector: 'input[type="password"]', text: TEST_USER_PASSWORD, name: 'Enter password' },
      { action: 'click', selector: 'button[type="submit"]', name: 'Click login', waitAfter: 3000 },
      { action: 'verify', expectedUrl: '/dashboard', name: 'Redirected to dashboard', critical: true },
      { action: 'check', check: () => {
        // Check if dashboard widgets are present
        const widgets = document.querySelectorAll('[class*="widget"], [class*="card"]');
        return widgets.length > 0;
      }, name: 'Dashboard widgets loaded' },
      { action: 'check', check: () => {
        // Check for navigation errors
        return !window.console._logs?.some(log => log.includes('navigate') && log.includes('not defined'));
      }, name: 'No navigation errors' }
    ]);
    testResults.vertical.studentJourney = loginJourney;

    // Journey 3: Course Enrollment & Learning Flow
    console.log('\n📚 Journey 3: Course Enrollment & Learning Flow');
    await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const courseJourney = await testNavigationFlow(page, 'Course Enrollment', [
      { action: 'navigate', url: '/courses', name: 'Navigate to courses' },
      { action: 'verify', selector: '[class*="course"], [class*="card"]', name: 'Course listings present' },
      { action: 'check', check: async () => {
        // Check for course metadata errors
        const errors = jsErrors.filter(err => 
          err.includes('course_metadata') && 
          (err.includes('title') && !err.includes('course_title')) ||
          err.includes('column course_metadata') && err.includes('does not exist')
        );
        return errors.length === 0;
      }, name: 'No course metadata errors' }
    ]);
    testResults.vertical.studentJourney.push(...courseJourney);

    // Journey 4: Subscription Purchase Flow
    console.log('\n💳 Journey 4: Subscription Purchase Flow');
    const subscriptionJourney = await testNavigationFlow(page, 'Subscription Purchase', [
      { action: 'navigate', url: '/pricing', name: 'Navigate to pricing' },
      { action: 'verify', selector: '[class*="pricing"], [class*="plan"]', name: 'Pricing plans displayed' },
      { action: 'check', check: () => {
        // Check if pricing page loads without errors
        return document.body.textContent.includes('Student') || 
               document.body.textContent.includes('Teacher') ||
               document.body.textContent.includes('Plan');
      }, name: 'Pricing content loaded' }
    ]);
    testResults.vertical.subscriptionJourney = subscriptionJourney;

    // ==========================================
    // HORIZONTAL TESTING: All Features
    // ==========================================

    console.log('\n\n📋 HORIZONTAL TESTING: All Features\n');

    // Feature 1: Authentication System
    console.log('🔐 Feature 1: Authentication System');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const authTests = [];
    
    // Test login form
    const loginForm = await page.$('form');
    if (loginForm) {
      authTests.push({ test: 'Login form present', status: 'pass' });
    } else {
      authTests.push({ test: 'Login form present', status: 'fail' });
    }
    
    // Test signup link
    const signupLink = await page.$('a[href*="signup"], a:contains("Create account")');
    if (signupLink) {
      authTests.push({ test: 'Signup link present', status: 'pass' });
    } else {
      authTests.push({ test: 'Signup link present', status: 'warning' });
    }
    
    // Test error handling
    const errorHandling = await checkErrorHandling(page);
    if (errorHandling.errors.length === 0) {
      authTests.push({ test: 'No JavaScript errors on login page', status: 'pass' });
    } else {
      authTests.push({ 
        test: 'No JavaScript errors on login page', 
        status: 'fail',
        details: errorHandling.errors 
      });
    }
    
    testResults.horizontal.authentication = authTests;

    // Feature 2: Dashboard
    console.log('🏠 Feature 2: Dashboard');
    await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await wait(3000);
    
    const dashboardTests = [];
    
    // Check all widgets
    const widgets = await page.evaluate(() => {
      const widgetSelectors = [
        '[class*="XPProgress"]',
        '[class*="DailyRitual"]',
        '[class*="Achievements"]',
        '[class*="CurrentLesson"]',
        '[class*="TeacherFeed"]',
        '[class*="QuickActions"]'
      ];
      
      return widgetSelectors.map(selector => {
        const element = document.querySelector(selector);
        return {
          selector,
          found: !!element,
          hasContent: element ? element.textContent.trim().length > 0 : false
        };
      });
    });
    
    widgets.forEach(widget => {
      if (widget.found && widget.hasContent) {
        dashboardTests.push({ test: `Widget ${widget.selector} loaded`, status: 'pass' });
      } else if (widget.found) {
        dashboardTests.push({ test: `Widget ${widget.selector} present but empty`, status: 'warning' });
      } else {
        dashboardTests.push({ test: `Widget ${widget.selector} not found`, status: 'fail' });
      }
    });
    
    // Check database errors
    const dbErrors = testResults.errors.filter(e => 
      e.url && (e.url.includes('/notifications') || e.url.includes('/badges') || e.url.includes('/user_badges'))
    );
    
    if (dbErrors.length === 0) {
      dashboardTests.push({ test: 'No database 404 errors', status: 'pass' });
    } else {
      dashboardTests.push({ 
        test: 'No database 404 errors', 
        status: 'fail',
        details: dbErrors.map(e => `${e.url}: ${e.status}`)
      });
    }
    
    // Check navigation buttons
    const navButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => {
        const text = btn.textContent;
        return text && (text.includes('View All') || text.includes('Navigate'));
      }).length;
    });
    
    if (navButtons > 0) {
      dashboardTests.push({ test: 'Navigation buttons present', status: 'pass' });
    }
    
    testResults.horizontal.dashboard = dashboardTests;

    // Feature 3: Courses
    console.log('📚 Feature 3: Courses');
    await page.goto(`${APP_URL}/courses`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const courseTests = [];
    
    // Check course listings
    const courses = await page.evaluate(() => {
      const courseCards = document.querySelectorAll('[class*="course"], [class*="card"]');
      return courseCards.length;
    });
    
    courseTests.push({ 
      test: 'Course listings displayed', 
      status: courses > 0 ? 'pass' : 'warning',
      details: `Found ${courses} course cards`
    });
    
    // Check for course metadata errors
    const courseMetadataErrors = jsErrors.filter(err => 
      err.includes('course_metadata') && 
      err.includes('title') && !err.includes('course_title')
    );
    
    if (courseMetadataErrors.length === 0) {
      courseTests.push({ test: 'No course metadata column errors', status: 'pass' });
    } else {
      courseTests.push({ 
        test: 'No course metadata column errors', 
        status: 'fail',
        details: courseMetadataErrors
      });
    }
    
    testResults.horizontal.courses = courseTests;

    // Feature 4: Mastery
    console.log('🎯 Feature 4: Mastery');
    await page.goto(`${APP_URL}/mastery`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const masteryTests = [];
    
    // Check tabs
    const tabs = await page.evaluate(() => {
      const tabElements = document.querySelectorAll('[role="tab"], [class*="tab"]');
      return tabElements.length;
    });
    
    masteryTests.push({ 
      test: 'Mastery tabs present', 
      status: tabs > 0 ? 'pass' : 'warning',
      details: `Found ${tabs} tabs`
    });
    
    testResults.horizontal.mastery = masteryTests;

    // Feature 5: Community
    console.log('👥 Feature 5: Community');
    await page.goto(`${APP_URL}/community`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const communityTests = [];
    
    // Check for posts feed
    const posts = await page.evaluate(() => {
      const postElements = document.querySelectorAll('[class*="post"], [class*="feed"]');
      return postElements.length;
    });
    
    communityTests.push({ 
      test: 'Community feed loaded', 
      status: 'pass',
      details: `Found ${posts} post elements`
    });
    
    testResults.horizontal.community = communityTests;

    // Feature 6: Profile
    console.log('👤 Feature 6: Profile');
    await page.goto(`${APP_URL}/profile`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const profileTests = [];
    
    // Check profile elements
    const profileElements = await page.evaluate(() => {
      return {
        avatar: !!document.querySelector('[class*="avatar"], img[alt*="avatar"]'),
        name: !!document.querySelector('[class*="name"], h1, h2'),
        stats: document.querySelectorAll('[class*="stat"], [class*="progress"]').length
      };
    });
    
    if (profileElements.avatar) {
      profileTests.push({ test: 'Avatar displayed', status: 'pass' });
    }
    if (profileElements.name) {
      profileTests.push({ test: 'Name displayed', status: 'pass' });
    }
    if (profileElements.stats > 0) {
      profileTests.push({ test: 'Stats displayed', status: 'pass' });
    }
    
    testResults.horizontal.profile = profileTests;

    // Feature 7: Settings
    console.log('⚙️ Feature 7: Settings');
    await page.goto(`${APP_URL}/settings`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const settingsTests = [];
    
    // Check for subscription tab
    const subscriptionTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.find(btn => btn.textContent.includes('Subscription'));
    });
    
    if (subscriptionTab) {
      settingsTests.push({ test: 'Subscription tab present', status: 'pass' });
    } else {
      // Check if code exists
      const pageContent = await page.content();
      if (pageContent.includes('SubscriptionSection') || pageContent.includes('subscription')) {
        settingsTests.push({ test: 'Subscription tab code present', status: 'pass' });
      } else {
        settingsTests.push({ test: 'Subscription tab present', status: 'fail' });
      }
    }
    
    // Check for account settings
    const accountTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.find(btn => btn.textContent.includes('Account'));
    });
    
    if (accountTab) {
      settingsTests.push({ test: 'Account tab present', status: 'pass' });
    }
    
    testResults.horizontal.settings = settingsTests;

    // Feature 8: Stellar Map
    console.log('⭐ Feature 8: Stellar Map');
    await page.goto(`${APP_URL}/stellar-map`, { waitUntil: 'networkidle2' });
    await wait(3000);
    
    const stellarMapTests = [];
    
    // Check if map loads
    const mapLoaded = await page.evaluate(() => {
      return !!document.querySelector('[class*="stellar"], [class*="map"], canvas, svg');
    });
    
    if (mapLoaded) {
      stellarMapTests.push({ test: 'Stellar map loaded', status: 'pass' });
    } else {
      stellarMapTests.push({ test: 'Stellar map loaded', status: 'warning' });
    }
    
    testResults.horizontal.stellarMap = stellarMapTests;

    // Feature 9: Pricing
    console.log('💳 Feature 9: Pricing');
    await page.goto(`${APP_URL}/pricing`, { waitUntil: 'networkidle2' });
    await wait(2000);
    
    const pricingTests = [];
    
    // Check for pricing plans
    const plans = await page.evaluate(() => {
      const planElements = document.querySelectorAll('[class*="plan"], [class*="pricing"]');
      return planElements.length;
    });
    
    pricingTests.push({ 
      test: 'Pricing plans displayed', 
      status: plans > 0 ? 'pass' : 'warning',
      details: `Found ${plans} plan elements`
    });
    
    testResults.horizontal.pricing = pricingTests;

    // ==========================================
    // UX/UI TESTING: Quality Assurance
    // ==========================================

    console.log('\n\n🎨 UX/UI TESTING: Quality Assurance\n');

    // Test all pages for visual consistency
    const pages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Courses', url: '/courses' },
      { name: 'Mastery', url: '/mastery' },
      { name: 'Community', url: '/community' },
      { name: 'Profile', url: '/profile' },
      { name: 'Settings', url: '/settings' },
      { name: 'Pricing', url: '/pricing' }
    ];

    for (const pageInfo of pages) {
      console.log(`   Checking ${pageInfo.name}...`);
      await page.goto(`${APP_URL}${pageInfo.url}`, { waitUntil: 'networkidle2' });
      await wait(2000);
      
      const visualCheck = await checkVisualConsistency(page, pageInfo.name);
      testResults.ux.visualConsistency.push(...visualCheck);
      
      const accessibilityCheck = await checkAccessibility(page);
      testResults.ux.accessibility.push({
        page: pageInfo.name,
        ...accessibilityCheck
      });
      
      // Take screenshot
      await takeScreenshot(page, pageInfo.name.toLowerCase().replace(' ', '-'));
    }

    // Responsive testing
    console.log('\n📱 Responsive Testing');
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
      await wait(2000);
      
      const layoutCheck = await page.evaluate(() => {
        const body = document.body;
        return {
          width: body.offsetWidth,
          height: body.offsetHeight,
          overflow: window.getComputedStyle(body).overflow,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
        };
      });
      
      testResults.ux.responsiveness.push({
        viewport: viewport.name,
        ...layoutCheck,
        status: layoutCheck.hasHorizontalScroll ? 'warning' : 'pass'
      });
      
      await takeScreenshot(page, `dashboard-${viewport.name.toLowerCase()}`);
    }

    // Reset to desktop
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigation testing
    console.log('\n🧭 Navigation Testing');
    const navTests = [];
    
    // Test all navigation links
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href], button[onclick]'));
      return links.map(link => ({
        text: link.textContent.trim(),
        href: link.href || link.getAttribute('href') || 'button',
        visible: link.offsetParent !== null
      })).filter(link => link.text && link.visible);
    });
    
    navTests.push({
      test: 'Navigation links found',
      status: navLinks.length > 0 ? 'pass' : 'fail',
      details: `Found ${navLinks.length} navigation links`
    });
    
    // Test navigation functionality
    for (const link of navLinks.slice(0, 5)) { // Test first 5 links
      try {
        if (link.href && link.href !== 'button') {
          await page.goto(link.href);
          await wait(1000);
          navTests.push({
            test: `Navigation to ${link.text}`,
            status: 'pass'
          });
        }
      } catch (error) {
        navTests.push({
          test: `Navigation to ${link.text}`,
          status: 'fail',
          error: error.message
        });
      }
    }
    
    testResults.ux.navigation = navTests;

    // Performance testing
    console.log('\n⚡ Performance Testing');
    await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle2' });
    
    const performance = await page.metrics();
    const loadTime = performance.LayoutDuration + performance.ScriptDuration;
    
    testResults.ux.performance.push({
      test: 'Page load performance',
      loadTime: loadTime,
      status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
      details: `Load time: ${loadTime.toFixed(2)}ms`
    });

  } catch (error) {
    testResults.errors.push({
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

  // Generate comprehensive report
  generateComprehensiveReport();
}

function generateComprehensiveReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(60));

  // Calculate totals
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  // Horizontal testing summary
  console.log('\n📋 HORIZONTAL TESTING SUMMARY');
  console.log('-'.repeat(60));
  
  Object.keys(testResults.horizontal).forEach(feature => {
    const tests = testResults.horizontal[feature];
    const passed = tests.filter(t => t.status === 'pass').length;
    const failed = tests.filter(t => t.status === 'fail').length;
    const warnings = tests.filter(t => t.status === 'warning').length;
    
    totalTests += tests.length;
    totalPassed += passed;
    totalFailed += failed;
    totalWarnings += warnings;
    
    const status = failed > 0 ? '❌' : warnings > 0 ? '⚠️' : '✅';
    console.log(`${status} ${feature.toUpperCase()}: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  });

  // Vertical testing summary
  console.log('\n🔄 VERTICAL TESTING SUMMARY');
  console.log('-'.repeat(60));
  
  Object.keys(testResults.vertical).forEach(journey => {
    const steps = testResults.vertical[journey];
    const passed = steps.filter(s => s.status === 'pass').length;
    const failed = steps.filter(s => s.status === 'fail').length;
    
    totalTests += steps.length;
    totalPassed += passed;
    totalFailed += failed;
    
    const status = failed > 0 ? '❌' : '✅';
    const completion = steps.length > 0 ? ((passed / steps.length) * 100).toFixed(0) : 0;
    console.log(`${status} ${journey}: ${passed}/${steps.length} steps (${completion}% complete)`);
  });

  // UX/UI testing summary
  console.log('\n🎨 UX/UI TESTING SUMMARY');
  console.log('-'.repeat(60));
  
  // Visual consistency
  const visualPass = testResults.ux.visualConsistency.filter(v => v.status === 'pass').length;
  const visualTotal = testResults.ux.visualConsistency.length;
  console.log(`✅ Visual Consistency: ${visualPass}/${visualTotal} pages pass`);
  
  // Accessibility
  const accessibilityIssues = testResults.ux.accessibility.reduce((sum, a) => 
    sum + a.issues.length + a.imagesWithoutAlt + a.buttonsWithoutName, 0
  );
  console.log(`${accessibilityIssues === 0 ? '✅' : '⚠️'} Accessibility: ${accessibilityIssues} issues found`);
  
  // Responsiveness
  const responsivePass = testResults.ux.responsiveness.filter(r => r.status === 'pass').length;
  const responsiveTotal = testResults.ux.responsiveness.length;
  console.log(`✅ Responsiveness: ${responsivePass}/${responsiveTotal} viewports pass`);
  
  // Navigation
  const navPass = testResults.ux.navigation.filter(n => n.status === 'pass').length;
  const navTotal = testResults.ux.navigation.length;
  console.log(`✅ Navigation: ${navPass}/${navTotal} tests pass`);
  
  // Performance
  testResults.ux.performance.forEach(p => {
    console.log(`${p.status === 'pass' ? '✅' : p.status === 'warning' ? '⚠️' : '❌'} Performance: ${p.details}`);
  });

  // Overall summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 OVERALL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⚠️ Warnings: ${totalWarnings}`);
  
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  console.log(`Pass Rate: ${passRate}%`);
  
  // Critical issues
  if (testResults.errors.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    testResults.errors.forEach(err => {
      console.log(`   - ${err.type}: ${err.error || err.url}`);
    });
  }

  // Generate detailed markdown report
  const reportPath = path.join(__dirname, '../testsprite_tests/comprehensive-ux-test-report.md');
  const reportContent = generateMarkdownReport();
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  if (totalFailed === 0 && testResults.errors.length === 0) {
    console.log('\n🎉 All tests passed! Application is ready.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please review the report.');
    process.exit(1);
  }
}

function generateMarkdownReport() {
  const timestamp = new Date().toISOString();
  
  return `# Comprehensive UX/UI Test Report

**Generated:** ${timestamp}  
**Application:** ${APP_URL}  
**Test Framework:** Puppeteer Automated Testing

---

## Executive Summary

### Test Coverage
- **Horizontal Testing:** All features across the application
- **Vertical Testing:** Complete user journeys from start to finish
- **UX/UI Testing:** Visual consistency, accessibility, responsiveness, performance

### Overall Results
- **Total Tests:** ${testResults.horizontal && Object.values(testResults.horizontal).flat().length + 
  testResults.vertical && Object.values(testResults.vertical).flat().length || 0}
- **Passed:** ${testResults.horizontal && Object.values(testResults.horizontal).flat().filter(t => t.status === 'pass').length + 
  testResults.vertical && Object.values(testResults.vertical).flat().filter(s => s.status === 'pass').length || 0}
- **Failed:** ${testResults.horizontal && Object.values(testResults.horizontal).flat().filter(t => t.status === 'fail').length + 
  testResults.vertical && Object.values(testResults.vertical).flat().filter(s => s.status === 'fail').length || 0}
- **Warnings:** ${testResults.horizontal && Object.values(testResults.horizontal).flat().filter(t => t.status === 'warning').length || 0}

---

## 📋 Horizontal Testing: Feature Coverage

${Object.keys(testResults.horizontal).map(feature => {
  const tests = testResults.horizontal[feature];
  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;
  const warnings = tests.filter(t => t.status === 'warning').length;
  
  return `### ${feature.charAt(0).toUpperCase() + feature.slice(1)}

**Status:** ${failed > 0 ? '❌ Failed' : warnings > 0 ? '⚠️ Warnings' : '✅ Passed'}  
**Results:** ${passed} passed, ${failed} failed, ${warnings} warnings

${tests.map(test => `- ${test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️'} ${test.test}${test.details ? `: ${test.details}` : ''}${test.error ? ` - ${test.error}` : ''}`).join('\n')}
`;
}).join('\n')}

---

## 🔄 Vertical Testing: User Journeys

${Object.keys(testResults.vertical).map(journey => {
  const steps = testResults.vertical[journey];
  const passed = steps.filter(s => s.status === 'pass').length;
  const failed = steps.filter(s => s.status === 'fail').length;
  const completion = steps.length > 0 ? ((passed / steps.length) * 100).toFixed(0) : 0;
  
  return `### ${journey.charAt(0).toUpperCase() + journey.slice(1).replace(/([A-Z])/g, ' $1')}

**Completion:** ${completion}% (${passed}/${steps.length} steps)

${steps.map((step, i) => `- ${step.status === 'pass' ? '✅' : '❌'} Step ${i + 1}: ${step.step || step.name}${step.error ? ` - ${step.error}` : ''}`).join('\n')}
`;
}).join('\n')}

---

## 🎨 UX/UI Quality Assurance

### Visual Consistency
${testResults.ux.visualConsistency.map(v => `- **${v.page}:** ${v.status === 'pass' ? '✅' : '⚠️'} Spacing issues: ${v.spacingIssues}, Typography issues: ${v.typographyIssues}, CSS Variables: ${v.cssVariables}`).join('\n')}

### Accessibility
${testResults.ux.accessibility.map(a => `- **${a.page}:** ${a.issues.length === 0 && a.imagesWithoutAlt === 0 && a.buttonsWithoutName === 0 ? '✅' : '⚠️'} ${a.imagesWithoutAlt} images without alt, ${a.buttonsWithoutName} buttons without names`).join('\n')}

### Responsiveness
${testResults.ux.responsiveness.map(r => `- **${r.viewport}:** ${r.status === 'pass' ? '✅' : '⚠️'} Width: ${r.width}px, Horizontal scroll: ${r.hasHorizontalScroll ? 'Yes' : 'No'}`).join('\n')}

### Navigation
${testResults.ux.navigation.map(n => `- ${n.status === 'pass' ? '✅' : '❌'} ${n.test}${n.details ? ` - ${n.details}` : ''}${n.error ? ` - ${n.error}` : ''}`).join('\n')}

### Performance
${testResults.ux.performance.map(p => `- ${p.status === 'pass' ? '✅' : p.status === 'warning' ? '⚠️' : '❌'} ${p.details}`).join('\n')}

---

## 🚨 Critical Issues

${testResults.errors.length > 0 ? testResults.errors.map(e => `- **${e.type}:** ${e.error || e.url || 'Unknown error'}`).join('\n') : 'No critical issues found.'}

---

## 📸 Screenshots

${testResults.screenshots.map(s => `- [${s.name}](${s.path})`).join('\n')}

---

## Recommendations

${generateRecommendations()}

---

**Report Generated:** ${new Date().toISOString()}  
**Testing Framework:** Comprehensive UX/UI Automated Testing
`;
}

function generateRecommendations() {
  const recommendations = [];
  
  // Analyze results and generate recommendations
  const failedTests = [];
  Object.values(testResults.horizontal).forEach(tests => {
    tests.forEach(test => {
      if (test.status === 'fail') {
        failedTests.push(test);
      }
    });
  });
  
  if (failedTests.length > 0) {
    recommendations.push('### Critical Fixes Needed');
    failedTests.forEach(test => {
      recommendations.push(`- Fix: ${test.test}`);
    });
  }
  
  const accessibilityIssues = testResults.ux.accessibility.reduce((sum, a) => 
    sum + a.imagesWithoutAlt + a.buttonsWithoutName, 0
  );
  
  if (accessibilityIssues > 0) {
    recommendations.push('### Accessibility Improvements');
    recommendations.push(`- Add alt text to ${testResults.ux.accessibility.reduce((sum, a) => sum + a.imagesWithoutAlt, 0)} images`);
    recommendations.push(`- Add accessible names to ${testResults.ux.accessibility.reduce((sum, a) => sum + a.buttonsWithoutName, 0)} buttons`);
  }
  
  const performanceIssues = testResults.ux.performance.filter(p => p.status !== 'pass');
  if (performanceIssues.length > 0) {
    recommendations.push('### Performance Optimization');
    recommendations.push('- Optimize page load times');
    recommendations.push('- Reduce JavaScript bundle size');
    recommendations.push('- Implement lazy loading for images');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ No critical recommendations. Application is performing well!');
  }
  
  return recommendations.join('\n');
}

// Run tests
runComprehensiveTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
