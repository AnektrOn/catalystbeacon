# iOS Configuration Guide

This directory contains iOS configuration templates and documentation.

## Setup Instructions

After running `npx cap add ios`, you'll need to configure the following:

### 1. App Icons

Create app icons in all required sizes and add them to:
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required sizes:
- 20x20 pt (iPhone Notification - 20pt @2x, @3x)
- 29x29 pt (iPhone Settings - 29pt @2x, @3x)
- 40x40 pt (iPhone Spotlight - 40pt @2x, @3x)
- 60x60 pt (iPhone App - 60pt @2x, @3x)
- 76x76 pt (iPad App - 76pt @1x, @2x)
- 83.5x83.5 pt (iPad Pro App - 83.5pt @2x)
- 1024x1024 pt (App Store)

### 2. Splash Screens

Create splash screens and add to:
`ios/App/App/Assets.xcassets/Splash.imageset/`

Recommended sizes:
- 1242x2688 px (iPhone X/XS/11 Pro Max)
- 828x1792 px (iPhone XR/11)
- 1242x2208 px (iPhone 6/7/8 Plus)
- 750x1334 px (iPhone 6/7/8)

### 3. Info.plist

Copy `Info.plist.template` to `ios/App/App/Info.plist` and customize:
- Bundle identifier
- Version numbers
- Privacy descriptions
- URL schemes

### 4. Xcode Project Settings

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the project in the navigator
3. Set minimum iOS version to 15.0+
4. Configure signing & capabilities:
   - Push Notifications
   - Associated Domains (for universal links)
   - Background Modes

### 5. App Store Connect

1. Create app record in App Store Connect
2. Configure app metadata
3. Upload screenshots (required sizes):
   - 6.5" display (iPhone 14 Pro Max): 1290x2796 px
   - 5.5" display (iPhone 8 Plus): 1242x2208 px
   - iPad Pro 12.9": 2048x2732 px
4. Set privacy policy URL
5. Configure in-app purchases if needed

## Build Commands

```bash
# Build React app and sync to iOS
npm run build:mobile

# Open in Xcode
npm run open:ios

# Or sync only
npm run sync:ios
```

## Testing

1. Connect iOS device or use simulator
2. Select device in Xcode
3. Click Run (⌘R)

## App Store Submission Checklist

- [ ] App icons in all required sizes
- [ ] Splash screens configured
- [ ] Info.plist properly configured
- [ ] Privacy policy URL set
- [ ] Screenshots uploaded (all required sizes)
- [ ] App description and keywords set
- [ ] Version and build numbers set
- [ ] Code signing configured
- [ ] Push notification certificates configured
- [ ] TestFlight beta testing (optional)
