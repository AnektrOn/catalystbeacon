# Android Configuration Guide

This directory contains Android configuration templates and documentation.

## Setup Instructions

After running `npx cap add android`, you'll need to configure the following:

### 1. App Icons

Create adaptive icon and legacy icons:

**Adaptive Icon** (1024x1024 px source):
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

**Legacy Icons** (for Android < 8.0):
- mdpi: 48x48 px
- hdpi: 72x72 px
- xhdpi: 96x96 px
- xxhdpi: 144x144 px
- xxxhdpi: 192x192 px

Add to: `android/app/src/main/res/mipmap-*/`

### 2. Splash Screens

Create splash screens for all densities:
- mdpi: 320x480 px
- hdpi: 480x800 px
- xhdpi: 720x1280 px
- xxhdpi: 1080x1920 px
- xxxhdpi: 1440x2560 px

Add to: `android/app/src/main/res/drawable-*/`

### 3. AndroidManifest.xml

Key configurations:
- Package name: `com.hcuniversity.beacon`
- Minimum SDK: API 24 (Android 7.0)
- Target SDK: API 34+ (Android 14)
- Permissions
- Deep linking configuration

### 4. Build Configuration

Edit `android/app/build.gradle`:
- Set `minSdkVersion` to 24
- Set `targetSdkVersion` to 34
- Set `compileSdkVersion` to 34
- Configure signing configs
- Set version code and version name

### 5. Google Play Console

1. Create app in Google Play Console
2. Configure app details:
   - App name, short description, full description
   - Category: Education
   - Content rating questionnaire
   - Screenshots:
     - Phone: 1080x1920 px minimum
     - 7" tablet: 1200x1920 px
     - 10" tablet: 1600x2560 px
   - Feature graphic: 1024x500 px
   - Privacy policy URL
3. Complete Data Safety section
4. Set up app signing key

## Build Commands

```bash
# Build React app and sync to Android
npm run build:mobile

# Open in Android Studio
npm run open:android

# Or sync only
npm run sync:android

# Build APK
cd android && ./gradlew assembleDebug

# Build App Bundle (AAB) for Play Store
cd android && ./gradlew bundleRelease
```

## Testing

1. Enable USB debugging on Android device
2. Connect device via USB
3. Run: `adb devices` to verify connection
4. In Android Studio, click Run

## Play Store Submission Checklist

- [ ] Adaptive icon created
- [ ] Legacy icons for all densities
- [ ] Splash screens for all densities
- [ ] AndroidManifest.xml configured
- [ ] Minimum SDK: API 24
- [ ] Target SDK: API 34+
- [ ] App signing key configured
- [ ] Privacy policy URL set
- [ ] Screenshots uploaded (phone + tablets)
- [ ] Feature graphic uploaded
- [ ] Content rating completed
- [ ] Data Safety section completed
- [ ] App Bundle (AAB) built
