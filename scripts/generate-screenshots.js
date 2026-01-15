#!/usr/bin/env node

/**
 * Product Screenshot Generator
 * 
 * Generates clean, high-quality screenshots of the app interface
 * for marketing and landing page usage.
 * 
 * Requirements:
 * - App must be running on localhost:3000 (or set PORT env var)
 * - Puppeteer must be installed
 * 
 * Usage:
 *   npm run screenshots
 *   or
 *   node scripts/generate-screenshots.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000',
  outputDir: path.join(__dirname, '..', 'screenshots'),
  viewports: {
    desktop: { width: 1920, height: 1080, deviceScaleFactor: 2 },
    mobile: { width: 375, height: 812, deviceScaleFactor: 2 }, // iPhone X size
  },
  waitTime: 5000, // Wait 5 seconds for content to load
  screenshotDelay: 3000, // Additional delay before screenshot
  maxWaitForLoaders: 30000, // Maximum time to wait for loaders to disappear (30 seconds)
  // Auto-login credentials (can be overridden via env vars)
  loginEmail: process.env.SCREENSHOT_EMAIL || 'humancatalystnote@gmail.com',
  loginPassword: process.env.SCREENSHOT_PASSWORD || '123456',
};

/**
 * Helper function to wait/delay (replaces deprecated waitForTimeout)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Screenshot definitions
const SCREENSHOTS = [
  {
    name: 'dashboard-desktop',
    route: '/dashboard',
    viewport: 'desktop',
    description: 'Dashboard / Home screen - Desktop',
    waitForSelector: '.dashboard-grid',
    crop: null, // Full page
  },
  {
    name: 'dashboard-mobile',
    route: '/dashboard',
    viewport: 'mobile',
    description: 'Dashboard / Home screen - Mobile',
    waitForSelector: '.dashboard-grid',
    crop: null,
  },
  {
    name: 'course-catalog-desktop',
    route: '/courses',
    viewport: 'desktop',
    description: 'Lesson list view - Desktop',
    waitForSelector: '.grid, .space-y-3', // Grid or list view
    crop: null,
  },
  {
    name: 'course-catalog-mobile',
    route: '/courses',
    viewport: 'mobile',
    description: 'Lesson list view - Mobile',
    waitForSelector: '.grid, .space-y-3',
    crop: null,
  },
  {
    name: 'lesson-detail-desktop',
    route: process.env.LESSON_ROUTE || '/courses/1/chapters/1/lessons/1', // Configure via LESSON_ROUTE env var
    viewport: 'desktop',
    description: 'Lesson detail view - Desktop',
    waitForSelector: 'h1, .glass-panel-floating',
    crop: null,
    optional: true, // Mark as optional since route may not exist
  },
  {
    name: 'lesson-detail-mobile',
    route: process.env.LESSON_ROUTE || '/courses/1/chapters/1/lessons/1',
    viewport: 'mobile',
    description: 'Lesson detail view - Mobile',
    waitForSelector: 'h1, .glass-panel-floating',
    crop: null,
    optional: true,
  },
  {
    name: 'roadmap-desktop',
    route: '/roadmap/ignition',
    viewport: 'desktop',
    description: 'Progress / Pathway view - Desktop',
    waitForSelector: '.neural-path-container, .map-container',
    crop: null,
  },
  {
    name: 'roadmap-mobile',
    route: '/roadmap/ignition',
    viewport: 'mobile',
    description: 'Progress / Pathway view - Mobile',
    waitForSelector: '.neural-path-container, .map-container',
    crop: null,
  },
];

/**
 * Ensure output directory exists
 */
async function ensureOutputDir() {
  const dirs = [
    CONFIG.outputDir,
    path.join(CONFIG.outputDir, 'desktop'),
    path.join(CONFIG.outputDir, 'mobile'),
    path.join(CONFIG.outputDir, 'landing-page'),
    path.join(CONFIG.outputDir, 'social'),
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  console.log(`✅ Output directory ready: ${CONFIG.outputDir}`);
}

/**
 * Handle authentication if needed
 */
async function handleAuth(page) {
  // Check if we're on a login page
  const currentUrl = page.url();
  if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
    console.log('   🔐 Attempting automatic login...');
    
    try {
      // Wait for login form to be ready - try multiple selectors
      await Promise.race([
        page.waitForSelector('input#email', { timeout: 5000 }),
        page.waitForSelector('input[name="email"]', { timeout: 5000 }),
        page.waitForSelector('input[type="email"]', { timeout: 5000 }),
      ]).catch(() => {
        // If none found, continue anyway
      });
      
      // Fill in email - try multiple selectors
      let emailInput = await page.$('input#email');
      if (!emailInput) emailInput = await page.$('input[name="email"]');
      if (!emailInput) emailInput = await page.$('input[type="email"]');
      
      if (emailInput) {
        await emailInput.click({ clickCount: 3 }); // Select all existing text
        await emailInput.type(CONFIG.loginEmail, { delay: 50 });
        console.log(`   ✅ Email entered: ${CONFIG.loginEmail}`);
        await delay(500);
      } else {
        console.log('   ⚠️  Email input not found');
      }
      
      // Fill in password - try multiple selectors
      let passwordInput = await page.$('input#password');
      if (!passwordInput) passwordInput = await page.$('input[name="password"]');
      if (!passwordInput) passwordInput = await page.$('input[type="password"]');
      
      if (passwordInput) {
        await passwordInput.click({ clickCount: 3 }); // Select all existing text
        await passwordInput.type(CONFIG.loginPassword, { delay: 50 });
        console.log('   ✅ Password entered');
        await delay(500);
      } else {
        console.log('   ⚠️  Password input not found');
      }
      
      // Submit form - try multiple methods
      let submitted = false;
      
      // Method 1: Find submit button by type
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('   ✅ Login form submitted (via button)');
        submitted = true;
      } else {
        // Method 2: Press Enter in password field
        if (passwordInput) {
          await passwordInput.focus();
          await page.keyboard.press('Enter');
          console.log('   ✅ Login form submitted (via Enter key)');
          submitted = true;
        }
      }
      
      if (submitted) {
        // Wait for navigation away from login page
        try {
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        } catch (navError) {
          // Navigation might have already happened, check URL
          await delay(2000);
        }
        
        const newUrl = page.url();
        if (!newUrl.includes('/login') && !newUrl.includes('/signup')) {
          console.log('   ✅ Login successful!');
          // Wait a bit for the page to fully load
          await delay(2000);
          return true;
        } else {
          console.log('   ⚠️  Still on login page. Login may have failed.');
          return false;
        }
      } else {
        console.log('   ⚠️  Could not submit login form');
        return false;
      }
    } catch (error) {
      console.log(`   ⚠️  Auto-login failed: ${error.message}`);
      console.log('   💡 Falling back to manual login (waiting 10 seconds)...');
      await delay(10000);
      
      const newUrl = page.url();
      if (newUrl.includes('/login') || newUrl.includes('/signup')) {
        console.log('   ⚠️  Still on login page. Screenshots may not work for protected routes.');
        return false;
      }
      return true; // Assume manual login worked
    }
  }
  return true;
}

/**
 * Wait for all loaders to disappear
 */
async function waitForLoadersToDisappear(page) {
  console.log('   ⏳ Waiting for loaders to disappear...');
  
  const startTime = Date.now();
  const maxWait = CONFIG.maxWaitForLoaders;
  let lastLoaderCount = Infinity;
  let stableCount = 0;
  
  while (Date.now() - startTime < maxWait) {
    const loaderInfo = await page.evaluate(() => {
      // Check for various loader indicators
      const loaders = [];
      
      // CosmicLoader and PageTransition overlay (fixed position with high z-index)
      const fixedOverlays = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' && 
               (parseInt(style.zIndex) >= 9999 || style.zIndex === '9999') &&
               (style.display !== 'none' && style.visibility !== 'hidden');
      });
      loaders.push(...fixedOverlays);
      
      // Animated spinners (visible)
      const spinners = Array.from(document.querySelectorAll('.animate-spin, [class*="animate-spin"]')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      loaders.push(...spinners);
      
      // Loading spinners
      const loadingSpinners = Array.from(document.querySelectorAll('.loading-spinner, [class*="loading-spinner"]')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      loaders.push(...loadingSpinners);
      
      // Dashboard loading state
      const dashboardLoading = document.querySelector('.dashboard-loading');
      if (dashboardLoading) {
        const style = window.getComputedStyle(dashboardLoading);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          loaders.push(dashboardLoading);
        }
      }
      
      // Check for loading text (but exclude completed/loaded states)
      const loadingTexts = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = (el.textContent || '').toLowerCase().trim();
        const style = window.getComputedStyle(el);
        return text === 'loading...' || 
               (text.includes('loading') && !text.includes('completed') && !text.includes('loaded')) &&
               style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      // Filter out elements that are hidden
      const visibleLoaders = loaders.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
      });
      
      return {
        count: visibleLoaders.length + loadingTexts.length,
        types: {
          fixedOverlays: fixedOverlays.length,
          spinners: spinners.length,
          loadingTexts: loadingTexts.length,
        }
      };
    });
    
    if (loaderInfo.count === 0) {
      // No loaders found, but wait a bit to ensure they don't reappear
      stableCount++;
      if (stableCount >= 3) {
        console.log('   ✅ All loaders disappeared (stable)');
        return true;
      }
    } else {
      stableCount = 0;
      if (loaderInfo.count !== lastLoaderCount) {
        console.log(`   ⏳ Found ${loaderInfo.count} loader(s) (overlays: ${loaderInfo.types.fixedOverlays}, spinners: ${loaderInfo.types.spinners}, text: ${loaderInfo.types.loadingTexts})`);
        lastLoaderCount = loaderInfo.count;
      }
    }
    
    // Wait a bit before checking again
    await delay(500);
  }
  
  console.log('   ⚠️  Some loaders may still be visible (timeout reached)');
  return false;
}

/**
 * Inject mock data and clean UI
 */
async function preparePage(page) {
  // Clean any personal data from the page
  await page.evaluate(() => {
    // Generic names to use for replacement
    const genericNames = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Morgan'];
    const randomName = genericNames[Math.floor(Math.random() * genericNames.length)];
    
    // Replace email addresses with generic ones
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim() && node.parentElement && !node.parentElement.closest('script')) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      
      // Replace emails (more comprehensive pattern)
      if (text.includes('@')) {
        textNode.textContent = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, 'student@example.com');
      }
      
      // Replace specific email if it appears
      if (text.includes('humancatalystnote@gmail.com')) {
        textNode.textContent = text.replace(/humancatalystnote@gmail\.com/g, 'student@example.com');
      }
    });
    
    // Replace user names in various contexts - PRIORITY: Dashboard greeting
    // First, target the dashboard title specifically (most important)
    const dashboardTitle = document.querySelector('.dashboard-title');
    if (dashboardTitle) {
      const titleText = dashboardTitle.textContent || dashboardTitle.innerText || '';
      // Replace any greeting pattern with generic name
      const cleanedTitle = titleText
        .replace(/Good (morning|afternoon|evening), [^!]+!/gi, `Good morning, ${randomName}!`)
        .replace(/Welcome, [^!]+!/gi, `Welcome, ${randomName}!`)
        // Replace any name pattern (First Last) in the title
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, randomName)
        // Replace any single capitalized word that might be a name (conservative)
        .replace(/\b([A-Z][a-z]{2,})\b(?=,|!)/g, randomName);
      dashboardTitle.textContent = cleanedTitle;
      dashboardTitle.innerText = cleanedTitle;
    }
    
    // Also replace in all other elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.children.length === 0 && el.textContent) {
        const text = el.textContent;
        
        // Replace in greetings (but skip if already processed in dashboard-title)
        if (!el.classList.contains('dashboard-title') && text.match(/Good (morning|afternoon|evening),/i)) {
          el.textContent = text.replace(/Good (morning|afternoon|evening), [^!]+!/gi, `Good morning, ${randomName}!`);
        }
        
        // Replace "Welcome, [Name]"
        if (!el.classList.contains('dashboard-title') && text.match(/Welcome, [^!]+!/i)) {
          el.textContent = text.replace(/Welcome, [^!]+!/gi, `Welcome, ${randomName}!`);
        }
        
        // Replace standalone names in titles/headings
        if (el.parentElement && (
          el.parentElement.classList.contains('dashboard-title') ||
          el.tagName === 'H1' ||
          el.tagName === 'H2'
        )) {
          // More aggressive replacement in titles
          el.textContent = text.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, randomName);
        }
      }
    });
    
    // Replace in input fields (if visible)
    const emailInputs = document.querySelectorAll('input[type="email"], input[name="email"]');
    emailInputs.forEach(input => {
      if (input.value && input.value.includes('@')) {
        input.value = 'student@example.com';
      }
    });
    
      // Replace specific email if it appears anywhere
      const specificEmail = 'humancatalystnote@gmail.com';
      if (document.body.innerHTML.includes(specificEmail)) {
        // Replace in HTML
        document.body.innerHTML = document.body.innerHTML.replace(
          new RegExp(specificEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          'student@example.com'
        );
      }
      
      // Also replace in any data attributes or hidden text
      const allElementsWithEmail = Array.from(document.querySelectorAll('*'));
      allElementsWithEmail.forEach(el => {
        // Check text content
        if (el.textContent && el.textContent.includes(specificEmail)) {
          el.textContent = el.textContent.replace(
            new RegExp(specificEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            'student@example.com'
          );
        }
        
        // Check all attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.value && attr.value.includes(specificEmail)) {
            el.setAttribute(attr.name, attr.value.replace(
              new RegExp(specificEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
              'student@example.com'
            ));
          }
        });
      });
  });
  
  // Wait a bit for any animations to settle
  await delay(500);
}

/**
 * Take a screenshot with specific settings
 */
async function takeScreenshot(page, screenshot, browser) {
  const viewport = CONFIG.viewports[screenshot.viewport];
  
  console.log(`\n📸 Capturing: ${screenshot.description}`);
  console.log(`   Route: ${screenshot.route}`);
  console.log(`   Viewport: ${viewport.width}x${viewport.height} @ ${viewport.deviceScaleFactor}x`);
  
  // Set viewport
  await page.setViewport(viewport);
  
    // Navigate to route
    const url = `${CONFIG.baseUrl}${screenshot.route}`;
    console.log(`   Navigating to: ${url}`);
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      // Handle authentication if needed
      await handleAuth(page);
      
      // Wait for specific selector if provided
      if (screenshot.waitForSelector) {
        try {
          await page.waitForSelector(screenshot.waitForSelector, { timeout: 15000 });
          console.log(`   ✅ Found selector: ${screenshot.waitForSelector}`);
        } catch (e) {
          console.log(`   ⚠️  Selector "${screenshot.waitForSelector}" not found, continuing anyway...`);
        }
      }
      
      // Wait for all loaders to disappear
      await waitForLoadersToDisappear(page);
      
      // Additional wait for content to fully load
      console.log('   ⏳ Waiting for content to stabilize...');
      await delay(CONFIG.waitTime);
      
      // Wait for network to be idle (no active requests)
      // Check if there are any pending network requests
      let networkIdle = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!networkIdle && attempts < maxAttempts) {
        const pendingRequests = await page.evaluate(() => {
          // Check if there are any fetch requests in progress
          // This is a simple heuristic - we check if the page seems stable
          return performance.getEntriesByType('resource').filter(
            entry => entry.transferSize === 0 && Date.now() - entry.responseEnd < 1000
          ).length;
        });
        
        if (pendingRequests === 0) {
          networkIdle = true;
        } else {
          await delay(500);
          attempts++;
        }
      }
      
      // Additional delay to ensure everything is rendered
      await delay(1000);
      
      // Prepare page (clean data, etc.)
      console.log('   🧹 Cleaning personal data...');
      await preparePage(page);
      
      // Hide any modals, overlays, and loaders that might still be showing
      await page.evaluate(() => {
        // CRITICAL: Hide all modals (they use z-50 and fixed positioning)
        // OnboardingModal and UpgradeModal use: fixed inset-0 z-50
        const modals = Array.from(document.querySelectorAll('*')).filter(el => {
          const style = window.getComputedStyle(el);
          return style.position === 'fixed' && 
                 (style.zIndex === '50' || parseInt(style.zIndex) >= 50) &&
                 (style.top === '0px' || style.top === '0') &&
                 (style.left === '0px' || style.left === '0') &&
                 (style.width === '100vw' || style.width === '100%') &&
                 (style.height === '100vh' || style.height === '100%');
        });
        modals.forEach(modal => {
          modal.style.display = 'none';
          modal.style.visibility = 'hidden';
          modal.style.opacity = '0';
          modal.style.pointerEvents = 'none';
        });
        
        // Hide upgrade prompt (specific class)
        const upgradePrompts = document.querySelectorAll('.upgrade-prompt');
        upgradePrompts.forEach(prompt => {
          prompt.style.display = 'none';
          prompt.style.visibility = 'hidden';
        });
        
        // Hide all toasts (react-hot-toast and sonner)
        const toastSelectors = [
          '[data-sonner-toast]',
          '[data-sonner-toaster]',
          '.react-hot-toast',
          '.react-hot-toast-container',
          '[class*="toast"]',
          '[id*="toast"]',
        ];
        toastSelectors.forEach(selector => {
          try {
            const toasts = document.querySelectorAll(selector);
            toasts.forEach(toast => {
              toast.style.display = 'none';
              toast.style.visibility = 'hidden';
              toast.style.opacity = '0';
            });
          } catch (e) {
            // Ignore errors
          }
        });
        
        // Hide common modal/overlay elements (fallback)
        const commonSelectors = [
          '.modal',
          '[role="dialog"]',
          '.notification',
          '.onboarding-modal',
          '.upgrade-modal',
          // Page transition overlay
          '[style*="z-index: 9999"]',
          '[style*="z-index: 50"]',
          // Cosmic loader
          '.cosmic-loader',
          // Loading states
          '.dashboard-loading',
          '.loading-spinner',
        ];
        
        commonSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
            });
          } catch (e) {
            // Ignore errors
          }
        });
        
        // Hide any loading spinners and animated elements
        const spinners = document.querySelectorAll(
          '.loader, .spinner, [class*="loading"], .animate-spin, [class*="animate-spin"]'
        );
        spinners.forEach(el => {
          const style = window.getComputedStyle(el);
          // Only hide if it's actually visible
          if (style.display !== 'none' && style.visibility !== 'hidden') {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          }
        });
        
        // Hide elements with "Loading" text (but be careful not to hide content)
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
          const text = (el.textContent || '').toLowerCase().trim();
          const style = window.getComputedStyle(el);
          // Only hide if it's clearly a loading indicator
          if ((text === 'loading...' || text === 'loading') && 
              !text.includes('completed') && 
              !text.includes('loaded') &&
              el.children.length === 0 &&
              style.display !== 'none') {
            const parent = el.parentElement;
            // Only hide if parent has only this child (likely a loading container)
            if (parent && parent.children.length === 1) {
              parent.style.display = 'none';
            } else {
              el.style.display = 'none';
            }
          }
        });
      });
      
      // Additional delay before screenshot to ensure everything is ready
      console.log('   ⏳ Final delay before screenshot...');
      await delay(CONFIG.screenshotDelay);
      
      // One more comprehensive check for loaders and modals
      await page.evaluate(() => {
        // Force hide any remaining loaders
        const loaderSelectors = [
          '[style*="z-index: 9999"]',
          '[style*="z-index: 50"]',
          '.animate-spin',
          '[class*="animate-spin"]',
          '.loading-spinner',
          '.cosmic-loader',
          '.dashboard-loading',
        ];
        
        loaderSelectors.forEach(selector => {
          try {
            const loaders = document.querySelectorAll(selector);
            loaders.forEach(loader => {
              const style = window.getComputedStyle(loader);
              // Only hide if visible
              if (style.display !== 'none' && style.visibility !== 'hidden') {
                loader.style.display = 'none';
                loader.style.visibility = 'hidden';
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
              }
            });
          } catch (e) {
            // Ignore errors
          }
        });
        
        // Force hide any remaining modals (fixed position with high z-index)
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' && 
              (parseInt(style.zIndex) >= 50 || style.zIndex === '50') &&
              style.display !== 'none') {
            // Check if it's a modal overlay (covers the screen)
            const rect = el.getBoundingClientRect();
            if (rect.width >= window.innerWidth * 0.8 && 
                rect.height >= window.innerHeight * 0.8) {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
            }
          }
        });
        
        // Force hide any remaining toasts
        const toastContainers = document.querySelectorAll(
          '[data-sonner-toaster], [data-sonner-toast], .react-hot-toast-container'
        );
        toastContainers.forEach(container => {
          container.style.display = 'none';
          container.style.visibility = 'hidden';
          container.style.opacity = '0';
        });
      });
      
      await delay(500);
    
      // Check if we're on an error page or still loading
      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      if (pageContent.includes('404') || pageContent.includes('Not Found') || 
          (pageTitle && pageTitle.toLowerCase().includes('error'))) {
        if (screenshot.optional) {
          console.log(`   ⚠️  Route not found (optional screenshot, skipping)`);
          return false;
        } else {
          console.log(`   ⚠️  Route may not exist, but continuing...`);
        }
      }
      
      // Generate base filename
      const baseFilename = `${screenshot.name}`;
      
      // Full page screenshot (desktop and mobile versions)
      const viewportDir = screenshot.viewport === 'desktop' ? 'desktop' : 'mobile';
      const fullPath = path.join(CONFIG.outputDir, viewportDir, `${baseFilename}.png`);
      
      await page.screenshot({
        path: fullPath,
        fullPage: true,
        type: 'png',
      });
      
      console.log(`   ✅ Saved: ${fullPath}`);
    
    // Generate cropped versions for different use cases
    const pageMetrics = await page.metrics();
    const viewportHeight = viewport.height;
    const viewportWidth = viewport.width;
    
    // Landing page version (horizontal crop, top portion)
    if (screenshot.viewport === 'desktop') {
      const landingPath = path.join(CONFIG.outputDir, 'landing-page', `${baseFilename}-landing.png`);
      
      // Crop to show top 60% of viewport (good for hero sections)
      await page.screenshot({
        path: landingPath,
        clip: {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: Math.floor(viewportHeight * 0.6),
        },
        type: 'png',
      });
      
      console.log(`   ✅ Saved (landing): ${landingPath}`);
    }
    
    // Social media version (vertical crop for mobile screenshots)
    if (screenshot.viewport === 'mobile') {
      const socialPath = path.join(CONFIG.outputDir, 'social', `${baseFilename}-social.png`);
      
      // For mobile, use full height but ensure it's vertical-friendly
      await page.screenshot({
        path: socialPath,
        fullPage: true,
        type: 'png',
      });
      
      console.log(`   ✅ Saved (social): ${socialPath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error capturing ${screenshot.name}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Screenshot Generation\n');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Output Directory: ${CONFIG.outputDir}\n`);
  
  // Ensure output directory exists
  await ensureOutputDir();
  
  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });
  
  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  
  // Set dark mode preference
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' },
  ]);
  
  // Track results
  const results = {
    success: 0,
    failed: 0,
    total: SCREENSHOTS.length,
  };
  
  // Process each screenshot
  for (const screenshot of SCREENSHOTS) {
    const success = await takeScreenshot(page, screenshot, browser);
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }
    
    // Small delay between screenshots
    await delay(1000);
  }
  
  // Close browser
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Screenshot Generation Complete');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${results.success}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`\n📁 Screenshots saved to: ${CONFIG.outputDir}`);
  console.log('\n📂 Directory structure:');
  console.log('   desktop/     - Desktop screenshots (full page)');
  console.log('   mobile/       - Mobile screenshots (full page)');
  console.log('   landing-page/ - Cropped versions for landing pages');
  console.log('   social/       - Vertical versions for social media');
  console.log('\n✨ Done!');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, CONFIG, SCREENSHOTS };
