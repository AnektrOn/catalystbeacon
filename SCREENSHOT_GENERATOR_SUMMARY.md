# Product Screenshot Generator - Summary

## ✅ What's Been Created

A complete screenshot generation system for your consciousness training app that produces clean, high-quality marketing screenshots.

## 📁 Files Created

1. **`scripts/generate-screenshots.js`** - Main screenshot generation script
   - Uses Puppeteer to capture screenshots
   - Handles authentication flow
   - Cleans personal data automatically
   - Generates multiple formats and viewports

2. **`scripts/SCREENSHOT_GUIDE.md`** - Complete documentation
   - Usage instructions
   - Customization options
   - Troubleshooting guide
   - Advanced features

3. **`scripts/README_SCREENSHOTS.md`** - Quick start guide
   - Simple 3-step instructions
   - Common configurations
   - Output structure

## 🎯 Screenshots Generated

The script generates 8 base screenshots (each in multiple formats):

1. **Dashboard / Home Screen**
   - Desktop: `screenshots/desktop/dashboard-desktop.png`
   - Mobile: `screenshots/mobile/dashboard-mobile.png`
   - Shows: User level, XP progression, current chapter, stats

2. **Lesson List View (Course Catalog)**
   - Desktop: `screenshots/desktop/course-catalog-desktop.png`
   - Mobile: `screenshots/mobile/course-catalog-mobile.png`
   - Shows: Multiple lessons with titles, progress indicators

3. **Lesson Detail View**
   - Desktop: `screenshots/desktop/lesson-detail-desktop.png`
   - Mobile: `screenshots/mobile/lesson-detail-mobile.png`
   - Shows: Single lesson with content, minimal distractions
   - ⚠️ Note: Requires valid course/chapter/lesson route (configurable via `LESSON_ROUTE` env var)

4. **Progress / Pathway View (Roadmap)**
   - Desktop: `screenshots/desktop/roadmap-desktop.png`
   - Mobile: `screenshots/mobile/roadmap-mobile.png`
   - Shows: Visual roadmap, level progression, learning journey

## 🚀 Quick Start

```bash
# 1. Start your app (in one terminal)
npm start

# 2. Generate screenshots (in another terminal)
npm run screenshots

# 3. Find screenshots in screenshots/ folder
```

## 📐 Output Formats

Each screenshot is generated in multiple formats:

- **Full Page**: Complete page screenshot (desktop/mobile folders)
- **Landing Page**: Cropped top 60% for hero sections (landing-page folder)
- **Social Media**: Vertical format optimized for social (social folder)

All screenshots are at **2x resolution** for crisp quality.

## ⚙️ Features

✅ **Automatic Data Cleaning**
- Replaces email addresses with generic ones
- Replaces user names in greetings
- Hides modals and loading spinners

✅ **Multiple Viewports**
- Desktop: 1920x1080 @ 2x
- Mobile: 375x812 @ 2x (iPhone X size)

✅ **Smart Waiting**
- Waits for content to load
- Handles authentication flow
- Detects and handles errors gracefully

✅ **Configurable**
- Custom routes via environment variables
- Adjustable wait times
- Optional screenshots (won't fail if route doesn't exist)

## 🔧 Configuration

### Environment Variables

```bash
# Custom port
PORT=3001 npm run screenshots

# Custom lesson route
LESSON_ROUTE=/courses/123/chapters/1/lessons/1 npm run screenshots
```

### Customization

Edit `scripts/generate-screenshots.js` to:
- Add new screenshots
- Change viewport sizes
- Adjust wait times
- Modify output formats

## 📋 Requirements

- ✅ Puppeteer (already in devDependencies)
- ✅ App running on localhost:3000 (or custom PORT)
- ⚠️ Authentication: Some routes require login (script handles this)

## 🎨 Visual Style

Screenshots are captured with:
- **Dark theme** (automatically set)
- **High contrast** white text
- **Clean spacing** (no browser chrome)
- **No personal data** (automatically cleaned)
- **Professional appearance** (modals hidden, loading states cleared)

## 📖 Documentation

- **Quick Start**: `scripts/README_SCREENSHOTS.md`
- **Full Guide**: `scripts/SCREENSHOT_GUIDE.md`
- **Script Source**: `scripts/generate-screenshots.js`

## 🎯 Use Cases

Perfect for:
- ✅ Landing page hero sections
- ✅ Marketing materials
- ✅ App store listings
- ✅ Social media posts
- ✅ Documentation
- ✅ Portfolio showcases

## ⚠️ Important Notes

1. **Authentication**: Protected routes require login. The script waits 10 seconds for manual login, or you can log in before running.

2. **Lesson Route**: The lesson detail route uses a default that may not exist. Configure via `LESSON_ROUTE` env var or update the script with a valid route.

3. **App Must Be Running**: Make sure your dev server is running before executing the script.

4. **First Run**: The first run may take longer as Puppeteer downloads Chromium (if not already cached).

## 🎉 Next Steps

1. Start your app: `npm start`
2. Run the generator: `npm run screenshots`
3. Review screenshots in `screenshots/` folder
4. Use the best ones for your marketing materials!

---

**All set!** Your screenshot generation system is ready to use. 🚀
