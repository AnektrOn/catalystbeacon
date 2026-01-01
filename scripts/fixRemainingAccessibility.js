#!/usr/bin/env node

/**
 * Fix remaining accessibility issues in page components
 * Targets: CommunityPage, CoursePlayerPage, ProfilePage, SettingsPage
 */

const fs = require('fs');
const path = require('path');

const pagesPath = path.join(__dirname, '../src/pages');
const targetFiles = ['CommunityPage.jsx', 'CoursePlayerPage.jsx', 'ProfilePage.jsx', 'SettingsPage.jsx'];

console.log(`Fixing remaining page components\n`);

targetFiles.forEach(filename => {
  const filePath = path.join(pagesPath, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipped (not found): ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix common button patterns
  
  // Pattern 1: Create post/comment buttons
  content = content.replace(
    /(<button[^>]*onClick=\{handleSubmit\}[^>]*className="[^"]*"[^>]*)(>[\s\S]{0,100}(Post|Submit|Send|Create))/g,
    (match, p1, p2) => {
      if (match.includes('aria-label')) return match;
      return p1 + ' aria-label="Submit post"' + p2;
    }
  );

  // Pattern 2: Like/Heart buttons
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*handleLike[^}]*\}[^>]*)(>[\s\S]{0,50}<Heart)/g,
    (match, p1, p2) => {
      if (match.includes('aria-label')) return match;
      return p1 + ' aria-label={post.isLiked ? "Unlike post" : "Like post"}' + p2;
    }
  );

  // Pattern 3: Comment buttons
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*Comment[^}]*\}[^>]*)(>[\s\S]{0,50}<MessageCircle)/g,
    (match, p1, p2) => {
      if (match.includes('aria-label')) return match;
      return p1 + ' aria-label="Comment on post"' + p2;
    }
  );

  // Pattern 4: Navigation buttons (prev/next)
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*(handlePrev|handleNext|prevLesson|nextLesson)[^}]*\}[^>]*)(>[\s\S]{0,50}<(ChevronLeft|ChevronRight|ArrowLeft|ArrowRight))/g,
    (match, p1, handler, p3, icon) => {
      if (match.includes('aria-label')) return match;
      const direction = handler.includes('Prev') || handler.includes('prev') || icon.includes('Left') ? 'Previous' : 'Next';
      return p1 + ` aria-label="${direction} lesson"` + '>' + p3 + '<' + icon;
    }
  );

  // Pattern 5: Edit profile buttons
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*Edit[^}]*\}[^>]*className="[^"]*"[^>]*)(>[\s\S]{0,50}Edit)/g,
    (match, p1, p2) => {
      if (match.includes('aria-label')) return match;
      return p1 + ' aria-label="Edit profile"' + p2;
    }
  );

  // Pattern 6: Save changes buttons
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*Save[^}]*\}[^>]*className="[^"]*"[^>]*)(>[\s\S]{0,100}Save)/g,
    (match, p1, p2) => {
      if (match.includes('aria-label')) return match;
      return p1 + ' aria-label="Save changes"' + p2;
    }
  );

  // Pattern 7: Close/Cancel buttons
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*(onClose|handleClose|setShow[^}]*false)[^}]*\}[^>]*)(>[\s\S]{0,50}<X)/g,
    (match, p1, p2, p3) => {
      if (match.includes('aria-label')) return match;
      return p1 + ' aria-label="Close"' + p2;
    }
  );

  // Pattern 8: Tab buttons in settings
  content = content.replace(
    /(<button[^>]*onClick=\{\(\) => setActiveTab\('([^']+)'\)\}[^>]*)(>[\s\S]{0,100}(Profile|Preferences|Security|Notifications|Subscription))/g,
    (match, p1, tabName, p3, label) => {
      if (match.includes('aria-label')) return match;
      return p1 + ` role="tab" aria-selected={activeTab === '${tabName}'} aria-label="${label} settings"` + p3;
    }
  );

  // Pattern 9: Image upload/change buttons
  content = content.replace(
    /(<button[^>]*onClick=\{[^}]*(Avatar|Background|Image)[^}]*\}[^>]*)(>[\s\S]{0,50}(Change|Upload))/g,
    (match, p1, p2, p3, action) => {
      if (match.includes('aria-label')) return match;
      return p1 + ` aria-label="${action} profile picture"` + p3;
    }
  );

  // Pattern 10: Add aria-hidden to decorative icons
  content = content.replace(/<(Heart|MessageCircle|ChevronLeft|ChevronRight|ArrowLeft|ArrowRight|Edit|Trash2|Plus|X|Send) size=\{(\d+)\}([^>]*?)(\/?>)/g, (match, icon, size, rest, close) => {
    if (rest.includes('aria-hidden')) return match;
    // Only add aria-hidden if the button doesn't have visible text
    const hasVisibleText = rest.includes('className') && !rest.includes('sr-only');
    if (!hasVisibleText) {
      return `<${icon} size={${size}}${rest} aria-hidden="true"${close}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filename}`);
  } else {
    console.log(`⏭️  No changes needed: ${filename}`);
  }
});

console.log('\n✅ All page components processed');


