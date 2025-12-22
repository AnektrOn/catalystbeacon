/**
 * Browser Console Test Script
 * Copy and paste this entire script into your browser console (F12) on the Dashboard page
 * 
 * This script will:
 * 1. Check for navigation errors
 * 2. Monitor network requests for database errors
 * 3. Verify course metadata queries
 * 4. Test widget functionality
 */

(function() {
  console.log('%c🧪 TestSprite Fixes Verification Script', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
  console.log('Running automated checks...\n');

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Test 1: Check for navigation errors in console
  function checkNavigationErrors() {
    console.log('1️⃣ Checking for navigation errors...');
    const consoleErrors = [];
    
    // Override console.error temporarily to catch errors
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('navigate') && (message.includes('not defined') || message.includes('is not a function'))) {
        consoleErrors.push(message);
      }
      originalError.apply(console, args);
    };

    // Check existing console messages (if accessible)
    setTimeout(() => {
      if (consoleErrors.length === 0) {
        results.passed.push('✅ No navigation errors detected');
        console.log('   ✅ PASS: No "navigate is not defined" errors');
      } else {
        results.failed.push('❌ Navigation errors found: ' + consoleErrors.join(', '));
        console.log('   ❌ FAIL: Found navigation errors');
        consoleErrors.forEach(err => console.log('      -', err));
      }
      console.error = originalError;
    }, 1000);
  }

  // Test 2: Monitor network requests for database errors
  function checkDatabaseErrors() {
    console.log('\n2️⃣ Checking database requests...');
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    const dbErrors = {
      notifications: false,
      badges: false,
      user_badges: false
    };

    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string') {
        if (url.includes('/notifications') && url.includes('404')) {
          dbErrors.notifications = true;
        }
        if (url.includes('/badges') && url.includes('404')) {
          dbErrors.badges = true;
        }
        if (url.includes('/user_badges') && url.includes('404')) {
          dbErrors.user_badges = true;
        }
      }
      return originalFetch.apply(this, args);
    };

    // Check performance entries
    setTimeout(() => {
      const networkEntries = performance.getEntriesByType('resource');
      const failedRequests = networkEntries.filter(entry => {
        const url = entry.name;
        return (
          (url.includes('/notifications') || url.includes('/badges') || url.includes('/user_badges')) &&
          entry.responseStatus >= 400
        );
      });

      if (failedRequests.length === 0) {
        results.passed.push('✅ No database 404 errors detected');
        console.log('   ✅ PASS: No 404 errors for notifications, badges, or user_badges');
      } else {
        results.failed.push('❌ Database 404 errors found');
        console.log('   ❌ FAIL: Found database 404 errors');
        failedRequests.forEach(req => {
          console.log(`      - ${req.name} (Status: ${req.responseStatus})`);
        });
      }

      window.fetch = originalFetch;
    }, 2000);
  }

  // Test 3: Check for course metadata errors
  function checkCourseMetadataErrors() {
    console.log('\n3️⃣ Checking course metadata queries...');
    
    const originalFetch = window.fetch;
    let hasTitleError = false;
    let hasThumbnailError = false;

    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('course_metadata')) {
        if (url.includes('title') && !url.includes('course_title')) {
          hasTitleError = true;
        }
        if (url.includes('thumbnail_url')) {
          // This might be okay, just note it
        }
      }
      return originalFetch.apply(this, args);
    };

    setTimeout(() => {
      if (!hasTitleError) {
        results.passed.push('✅ Course metadata uses course_title (not title)');
        console.log('   ✅ PASS: Using course_title column');
      } else {
        results.warnings.push('⚠️ May still be using title instead of course_title');
        console.log('   ⚠️ WARNING: Check if using title instead of course_title');
      }

      window.fetch = originalFetch;
    }, 2000);
  }

  // Test 4: Verify navigation buttons exist
  function checkNavigationButtons() {
    console.log('\n4️⃣ Checking navigation buttons...');
    
    const buttons = {
      teacherFeedViewAll: document.querySelector('[href="/community"], button:contains("View All")'),
      achievementsViewAll: document.querySelector('button:contains("View All")'),
      pricingNav: document.querySelector('a[href="/pricing"], button:contains("Pricing")')
    };

    let allFound = true;
    if (!buttons.teacherFeedViewAll) {
      results.warnings.push('⚠️ Teacher Feed "View All" button not found');
      console.log('   ⚠️ WARNING: Teacher Feed View All button not found');
      allFound = false;
    }
    if (!buttons.achievementsViewAll) {
      results.warnings.push('⚠️ Achievements "View All" button not found');
      console.log('   ⚠️ WARNING: Achievements View All button not found');
      allFound = false;
    }
    if (!buttons.pricingNav) {
      results.warnings.push('⚠️ Pricing navigation not found');
      console.log('   ⚠️ WARNING: Pricing navigation not found');
      allFound = false;
    }

    if (allFound) {
      results.passed.push('✅ All navigation buttons found');
      console.log('   ✅ PASS: All navigation buttons present');
    }
  }

  // Test 5: Check for widget empty states
  function checkWidgetEmptyStates() {
    console.log('\n5️⃣ Checking widget empty states...');
    
    const teacherFeed = document.querySelector('[class*="TeacherFeed"], [class*="teacher-feed"]');
    if (teacherFeed) {
      const emptyState = teacherFeed.textContent.includes('No teacher posts') || 
                        teacherFeed.textContent.includes('No posts yet');
      if (emptyState || teacherFeed.querySelector('[class*="empty"]')) {
        results.passed.push('✅ Teacher Feed has empty state');
        console.log('   ✅ PASS: Teacher Feed empty state present');
      } else {
        results.warnings.push('⚠️ Teacher Feed empty state may be missing');
        console.log('   ⚠️ WARNING: Check Teacher Feed empty state');
      }
    }
  }

  // Run all tests
  checkNavigationErrors();
  checkDatabaseErrors();
  checkCourseMetadataErrors();
  
  setTimeout(() => {
    checkNavigationButtons();
    checkWidgetEmptyStates();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('%c📊 Test Results Summary', 'font-size: 14px; font-weight: bold;');
    console.log('='.repeat(50));
    
    if (results.passed.length > 0) {
      console.log('\n✅ PASSED:');
      results.passed.forEach(test => console.log('   ' + test));
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      results.warnings.forEach(test => console.log('   ' + test));
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ FAILED:');
      results.failed.forEach(test => console.log('   ' + test));
    }

    const totalTests = results.passed.length + results.warnings.length + results.failed.length;
    const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);
    
    console.log('\n📈 Summary:');
    console.log(`   Total Checks: ${totalTests}`);
    console.log(`   Passed: ${results.passed.length}`);
    console.log(`   Warnings: ${results.warnings.length}`);
    console.log(`   Failed: ${results.failed.length}`);
    console.log(`   Pass Rate: ${passRate}%`);

    if (results.failed.length === 0) {
      console.log('\n%c🎉 All critical tests passed!', 'font-size: 14px; font-weight: bold; color: #4CAF50;');
    } else {
      console.log('\n%c⚠️ Some tests failed. Please review the results above.', 'font-size: 14px; font-weight: bold; color: #FF9800;');
    }
  }, 3000);

  console.log('\n⏳ Waiting for checks to complete...');
  console.log('   (This will take a few seconds to monitor network requests)');
})();
