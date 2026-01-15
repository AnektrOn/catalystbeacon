# Quick Start: Generate Product Screenshots

## 🚀 Quick Start

1. **Start your app** (in one terminal):
   ```bash
   npm start
   ```

2. **Wait for app to load**, then run (in another terminal):
   ```bash
   npm run screenshots
   ```

3. **Find your screenshots** in the `screenshots/` folder!

## 📋 What You Get

- ✅ Dashboard screenshots (desktop + mobile)
- ✅ Course catalog screenshots (desktop + mobile)  
- ✅ Lesson detail screenshots (desktop + mobile)
- ✅ Roadmap/Pathway screenshots (desktop + mobile)
- ✅ Multiple formats: full page, landing page crops, social media crops
- ✅ 2x resolution for crisp quality
- ✅ Clean data (no personal info)

## ⚙️ Configuration

### Custom Lesson Route

If you need to screenshot a specific lesson:

```bash
LESSON_ROUTE=/courses/123/chapters/1/lessons/1 npm run screenshots
```

### Custom Port

If your app runs on a different port:

```bash
PORT=3001 npm run screenshots
```

## 📁 Output Structure

```
screenshots/
├── desktop/        # Full page desktop (1920x1080 @ 2x)
├── mobile/         # Full page mobile (375x812 @ 2x)
├── landing-page/   # Cropped for landing pages
└── social/         # Vertical for social media
```

## 🔐 Authentication

Some routes require login. The script will:
1. Wait 10 seconds for you to manually log in
2. Or you can log in before running the script

**Tip**: Create a test account with generic data for best results.

## 📖 Full Documentation

See `scripts/SCREENSHOT_GUIDE.md` for complete documentation, troubleshooting, and advanced customization.

---

**That's it!** Your screenshots will be ready for marketing use. 🎉
