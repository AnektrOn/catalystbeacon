# Product Screenshot Generator Guide

This guide explains how to generate clean, high-quality product screenshots of your app interface for marketing and landing page usage.

## Overview

The screenshot generator creates professional screenshots with:
- **2x resolution** for crisp, high-quality images
- **Multiple viewports** (desktop and mobile)
- **Multiple formats** (full page, landing page crops, social media crops)
- **Clean data** (generic user names, no personal information)
- **Dark theme** (consistent with your app's aesthetic)

## Prerequisites

1. **App must be running**: Start your development server
   ```bash
   npm start
   ```

2. **Authentication**: Some routes require authentication. You have two options:
   - **Option A**: Log in manually when prompted (script waits 10 seconds)
   - **Option B**: Create a test account and log in before running the script

3. **Dependencies**: Puppeteer is already installed as a dev dependency

## Usage

### Basic Usage

```bash
npm run screenshots
```

Or directly:

```bash
node scripts/generate-screenshots.js
```

### Custom Port

If your app runs on a different port:

```bash
PORT=3001 npm run screenshots
```

## Screenshots Generated

The script generates the following screenshots:

### 1. Dashboard / Home Screen
- **Desktop**: `desktop/dashboard-desktop.png`
- **Mobile**: `mobile/dashboard-mobile.png`
- Shows: User level, XP progression, current chapter, stats cards

### 2. Lesson List View (Course Catalog)
- **Desktop**: `desktop/course-catalog-desktop.png`
- **Mobile**: `mobile/course-catalog-mobile.png`
- Shows: Multiple lessons with clear titles, progress indicators

### 3. Lesson Detail View
- **Desktop**: `desktop/lesson-detail-desktop.png`
- **Mobile**: `mobile/lesson-detail-mobile.png`
- Shows: Single lesson with text content, minimal distractions

### 4. Progress / Pathway View (Roadmap)
- **Desktop**: `desktop/roadmap-desktop.png`
- **Mobile**: `mobile/roadmap-mobile.png`
- Shows: Visual roadmap, level progression, learning journey

## Output Structure

```
screenshots/
├── desktop/           # Full page desktop screenshots
├── mobile/           # Full page mobile screenshots
├── landing-page/     # Cropped versions for landing pages (top 60%)
└── social/           # Vertical versions for social media
```

## Customization

### Modify Screenshot Routes

Edit `scripts/generate-screenshots.js` and update the `SCREENSHOTS` array:

```javascript
const SCREENSHOTS = [
  {
    name: 'my-custom-screenshot',
    route: '/my-custom-route',
    viewport: 'desktop',
    description: 'My custom screenshot',
    waitForSelector: '.my-selector',
    crop: null,
  },
  // ... add more
];
```

### Adjust Viewport Sizes

Modify the `viewports` object in `CONFIG`:

```javascript
viewports: {
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  mobile: { width: 375, height: 812, deviceScaleFactor: 2 },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2 }, // Add tablet
}
```

### Change Wait Times

Adjust timing if content loads slowly:

```javascript
const CONFIG = {
  waitTime: 5000,        // Wait 5 seconds for content
  screenshotDelay: 3000, // Additional 3 second delay
};
```

## Troubleshooting

### Screenshots Show Login Page

**Problem**: Protected routes redirect to login.

**Solutions**:
1. Log in manually when the script prompts you (10 second window)
2. Create a test account and log in before running the script
3. Modify the script to automatically authenticate (see Advanced section)

### Selectors Not Found

**Problem**: Script warns about missing selectors.

**Solution**: This is usually fine - the script continues anyway. If screenshots are incomplete, increase `waitTime` in the config.

### Blank or Loading Screenshots

**Problem**: Content hasn't loaded yet.

**Solutions**:
1. Increase `waitTime` and `screenshotDelay` in config
2. Check that your app is actually running and accessible
3. Verify the route exists and is accessible

### Route Not Found (404)

**Problem**: Some routes might not exist or need specific IDs.

**Solution**: Update the route in the `SCREENSHOTS` array. For example:
- Lesson detail: `/courses/{courseId}/{chapter}/{lesson}` - replace with actual IDs
- Course detail: `/courses/{courseId}` - replace with actual course ID

## Advanced: Automatic Authentication

To automatically authenticate, you can modify the script to:

1. Navigate to login page
2. Fill in credentials (store in environment variables)
3. Submit form
4. Wait for redirect

Example addition to `handleAuth` function:

```javascript
async function handleAuth(page) {
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Auto-login if credentials provided
    const email = process.env.SCREENSHOT_EMAIL;
    const password = process.env.SCREENSHOT_PASSWORD;
    
    if (email && password) {
      await page.type('input[type="email"]', email);
      await page.type('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }
  }
}
```

Then set environment variables:
```bash
SCREENSHOT_EMAIL=test@example.com SCREENSHOT_PASSWORD=test123 npm run screenshots
```

## Best Practices

1. **Clean State**: Ensure your app is in a clean state before screenshots
2. **Test Data**: Use test accounts with realistic but generic data
3. **Consistent Theme**: Ensure dark mode is enabled (script does this automatically)
4. **No Modals**: Script automatically hides modals, but ensure none are showing
5. **Review Output**: Always review screenshots to ensure they look professional

## Tips for Marketing Use

- **Landing Pages**: Use cropped versions from `landing-page/` folder
- **Social Media**: Use vertical versions from `social/` folder
- **Documentation**: Use full page versions from `desktop/` or `mobile/`
- **Portfolio**: Mix and match based on what showcases your app best

## Example Workflow

1. Start your app: `npm start`
2. Wait for it to fully load
3. (Optional) Log in with a test account
4. Run screenshot generator: `npm run screenshots`
5. Review screenshots in `screenshots/` folder
6. Select best images for your marketing materials

## Notes

- Screenshots are saved as PNG files at 2x resolution
- Personal data (emails, names) is automatically replaced with generic values
- Modals and loading spinners are automatically hidden
- The script waits for content to load before capturing

---

**Need help?** Check the script comments or modify the configuration to suit your needs.
