# SH✡MER Native — Build Tonight

You cannot compile a native app in the cloud — it needs Android Studio/Xcode on your Mac.
But everything else is done. Here's the shortest path to a real app on your phone tonight.

## Prerequisites (one-time, ~30 min if not installed)
1. **Node.js** — https://nodejs.org (LTS)
2. **Android Studio** — https://developer.android.com/studio (includes the Android SDK)
3. Your **Android phone** with USB debugging on (Settings → Developer options → USB debugging)

## Build it (10 min once prereqs are ready)
```bash
cd shomer-app/native      # wherever you cloned the repo
./BUILD-TONIGHT.sh
```
That script: installs deps → pulls the LIVE web app → adds Android → syncs → opens Android Studio.

## Then in Android Studio
1. Wait for Gradle to finish (first time is slow)
2. **One manual step:** open `android/app/src/main/AndroidManifest.xml` and paste in the
   permissions + service from `android-config/AndroidManifest-additions.xml`
3. Connect your phone, press the green **▶ Run**
4. On the phone: grant **"Allow all the time"** location
5. Background the app, walk around — confirm background geolocation works

That's a real, installable SH✡MER native app with background location.

## For the Play Store (later, needs $25 account)
- `android-config/build.gradle-signing.txt` — signing config
- `android-config/PLAY-STORE-LISTING.md` — full store listing, ready to paste
- Generate keystore, run `npm run bundle`, upload the .aab

## iOS (needs a Mac + Xcode, later)
```bash
npx cap add ios && npx cap open ios
```
Then Xcode: set your Apple team, add location permissions to Info.plist, Run.

---
Everything technical that CAN be done off-device is done. This is the on-device part.
