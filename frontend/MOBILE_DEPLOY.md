# 📱 Kagi Mobile App - TestFlight Deployment Guide

## ✅ Setup Complete!

Your Vue.js app is now ready for iOS deployment.

---

## 🚀 Quick Start - Deploy to TestFlight

### 1. Open Xcode
```bash
cd /Users/davidronai/Desktop/git/Kagi/frontend
npx cap open ios
```

### 2. Configure Project (First Time Only)
In Xcode:
1. Select **App** target in left sidebar
2. **General** tab:
   - **Team**: Select your Apple Developer account
   - **Bundle Identifier**: `com.kagi.app` (or your custom domain)
   - **Version**: `1.0.0`
   - **Build**: `1`

3. **Signing & Capabilities** tab:
   - ✅ **Automatically manage signing**
   - Select your **Team**

### 3. Build & Archive
1. Select target device: **Any iOS Device (arm64)**
2. Menu: **Product → Archive**
3. Wait for build to complete (~2-5 min)

### 4. Upload to TestFlight
1. In Organizer window (opens automatically):
   - Click **Distribute App**
   - Select **App Store Connect**
   - Click **Upload**
   - Click **Next** through all dialogs
   - Wait for processing (~10-30 min)

2. Go to [App Store Connect](https://appstoreconnect.apple.com):
   - **My Apps** → **Kagi**
   - **TestFlight** tab
   - Add testers or groups
   - Enable testing

---

## 🔄 Update Workflow (After Changes)

Every time you update the app:

```bash
# 1. Build web app
pnpm build

# 2. Sync to iOS
npx cap sync ios

# 3. Open Xcode
npx cap open ios

# 4. Increment build number in Xcode (General tab)
# 5. Product → Archive
# 6. Distribute to TestFlight
```

---

## 📝 Important Files

### `capacitor.config.ts`
```ts
{
  appId: 'com.kagi.app',      // Your bundle ID
  appName: 'Kagi',            // App name
  webDir: 'dist'              // Build output
}
```

### `src/mobile.js`
Mobile initialization:
- Status bar styling
- Keyboard config
- Splash screen
- Native features

### Icons & Splash Screens
Located in: `ios/App/App/Assets.xcassets/`

To update:
1. Replace images in Xcode
2. Or use: https://capacitorjs.com/docs/guides/splash-screens-and-icons

---

## 🎨 Customization

### App Icons
1. Create 1024x1024 PNG
2. In Xcode: Assets.xcassets → AppIcon
3. Drag & drop your icon

### Splash Screen
1. Create 2732x2732 PNG (centered design)
2. In Xcode: Assets.xcassets → Splash
3. Drag & drop your splash image

### App Name
Edit: `ios/App/App/Info.plist`
```xml
<key>CFBundleDisplayName</key>
<string>Kagi</string>
```

---

## 🔌 Native Plugins Installed

- ✅ **@capacitor/status-bar** - Status bar styling
- ✅ **@capacitor/splash-screen** - Splash screen control
- ✅ **@capacitor/keyboard** - Keyboard management
- ✅ **@capacitor/haptics** - Haptic feedback

### Add More Plugins
```bash
pnpm add @capacitor/camera        # Camera access
pnpm add @capacitor/geolocation   # GPS
pnpm add @capacitor/push-notifications  # Push
npx cap sync ios
```

See: https://capacitorjs.com/docs/plugins

---

## 🐛 Troubleshooting

### CocoaPods Error
```bash
export LANG=en_US.UTF-8
cd ios/App && pod install
```

### Build Fails
1. Clean build: **Product → Clean Build Folder** (⇧⌘K)
2. Delete derived data: **~/Library/Developer/Xcode/DerivedData**
3. Rebuild

### Web Assets Not Updating
```bash
pnpm build
npx cap sync ios
```

### App Crashes on Launch
Check console in Xcode for errors. Common issues:
- API URL not accessible
- Missing permissions in Info.plist
- CORS issues (update backend CORS)

---

## 📱 Testing

### iOS Simulator
```bash
npx cap run ios
```

### Real Device
1. Connect iPhone via USB
2. Select device in Xcode
3. Click **Run** (⌘R)
4. Trust developer on device

### TestFlight
1. Install TestFlight app from App Store
2. Accept invite email
3. Download and test

---

## 🔒 Permissions

If you need device permissions, add to `ios/App/App/Info.plist`:

```xml
<!-- Camera -->
<key>NSCameraUsageDescription</key>
<string>Take photos for your profile</string>

<!-- Location -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Show nearby facilities</string>

<!-- Notifications -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

---

## 🎯 Production Release

When ready for App Store:

1. Update version in Xcode (e.g., `1.0.0`)
2. Archive build
3. **Distribute App** → **App Store Connect**
4. In App Store Connect:
   - Fill app information
   - Upload screenshots
   - Submit for review
5. Apple review: ~1-3 days

---

## 📊 Build Info

- **Platform**: iOS 13.0+
- **Capacitor**: v7.4.3
- **Xcode**: Latest version
- **Language**: Swift (native iOS)
- **Web**: Vue.js 3

---

## 🔗 Useful Links

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Deployment Guide](https://capacitorjs.com/docs/ios#deploying-to-app-store)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight](https://developer.apple.com/testflight/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)

---

## ✨ Next Steps

1. **Test on device** - Run on real iPhone
2. **Add icons** - Create app icon & splash screen
3. **Configure backend** - Ensure API accessible
4. **Submit to TestFlight** - Get early feedback
5. **Iterate** - Update based on feedback
6. **App Store** - Release to production!

Good luck with your app! 🚀
