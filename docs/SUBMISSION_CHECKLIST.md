# App Store Submission Checklist

Use this checklist before submitting your app to the App Store and Play Store.

## Pre-Submission Requirements

### Code & Build
- [ ] App builds successfully for iOS (Xcode)
- [ ] App builds successfully for Android (Android Studio)
- [ ] No console errors or warnings
- [ ] All features tested and working
- [ ] Performance optimized for mobile devices
- [ ] Memory leaks checked and fixed
- [ ] Battery usage optimized

### Assets
- [ ] App icon created (1024x1024px)
- [ ] All required app icon sizes generated
- [ ] Splash screens created for all device sizes
- [ ] Screenshots taken for all required device sizes
- [ ] Feature graphic created (Android)
- [ ] App preview video created (iOS, optional)

### Configuration
- [ ] Bundle identifier set (iOS)
- [ ] Package name set (Android)
- [ ] Version number set
- [ ] Build number set
- [ ] Minimum iOS version: 15.0+
- [ ] Minimum Android SDK: API 24 (Android 7.0)
- [ ] Target Android SDK: API 34+ (Android 14)

### Privacy & Security
- [ ] Privacy policy URL accessible
- [ ] Terms of service URL accessible
- [ ] All required permissions explained in Info.plist (iOS)
- [ ] All required permissions explained in AndroidManifest.xml (Android)
- [ ] Data encryption in transit (HTTPS)
- [ ] Secure authentication implemented
- [ ] No hardcoded secrets or API keys

### Functionality
- [ ] Authentication flow works
- [ ] Push notifications work
- [ ] Deep linking works
- [ ] In-app purchases work (if applicable)
- [ ] Offline functionality works (if applicable)
- [ ] All API endpoints working
- [ ] Error handling implemented
- [ ] Loading states implemented

## iOS App Store Specific

### App Store Connect Setup
- [ ] App Store Connect account created
- [ ] App record created
- [ ] App information completed
- [ ] Screenshots uploaded
- [ ] App description written
- [ ] Keywords set
- [ ] Category selected
- [ ] Age rating configured
- [ ] Privacy policy URL set
- [ ] Support URL set

### Xcode Configuration
- [ ] Code signing configured
- [ ] Provisioning profiles set up
- [ ] Push notification certificates configured
- [ ] Associated domains configured (for universal links)
- [ ] Info.plist properly configured
- [ ] App icons added to Assets.xcassets
- [ ] Splash screens configured

### Testing
- [ ] Tested on physical iOS device
- [ ] Tested on iPhone (multiple sizes)
- [ ] Tested on iPad (if supported)
- [ ] Tested on different iOS versions
- [ ] TestFlight beta testing completed (optional)

### Submission
- [ ] Archive created in Xcode
- [ ] App validated
- [ ] App uploaded to App Store Connect
- [ ] App submitted for review
- [ ] Review notes provided (if needed)

## Google Play Store Specific

### Google Play Console Setup
- [ ] Google Play Console account created
- [ ] App created in console
- [ ] App information completed
- [ ] Screenshots uploaded
- [ ] Feature graphic uploaded
- [ ] App description written
- [ ] Content rating questionnaire completed
- [ ] Data Safety section completed
- [ ] Privacy policy URL set

### Android Configuration
- [ ] App signing key created
- [ ] Signing configuration set up
- [ ] AndroidManifest.xml configured
- [ ] Permissions properly declared
- [ ] App icons added (adaptive icon)
- [ ] Splash screens configured
- [ ] ProGuard rules configured (if using)

### Testing
- [ ] Tested on physical Android device
- [ ] Tested on different Android versions
- [ ] Tested on different screen sizes
- [ ] Tested on different manufacturers
- [ ] Internal testing track completed (optional)

### Submission
- [ ] App Bundle (AAB) built
- [ ] App Bundle signed
- [ ] App Bundle uploaded to Play Console
- [ ] Release notes written
- [ ] App submitted for review

## Post-Submission

### Monitoring
- [ ] Set up crash reporting (Firebase Crashlytics, Sentry, etc.)
- [ ] Set up analytics (Firebase Analytics, etc.)
- [ ] Monitor app reviews
- [ ] Respond to user feedback
- [ ] Monitor app performance

### Updates
- [ ] Plan for regular updates
- [ ] Version numbering strategy
- [ ] Changelog template
- [ ] Update release process

## Common Rejection Reasons (Avoid These)

### iOS App Store
- Missing privacy policy URL
- App crashes on launch
- Broken functionality
- Missing required app icons
- Incomplete app information
- Violation of App Store guidelines

### Google Play Store
- Missing privacy policy
- Incomplete Data Safety section
- App crashes
- Missing required screenshots
- Violation of Play Store policies
- Target SDK too low

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
