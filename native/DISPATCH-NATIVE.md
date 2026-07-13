# SH✡MER — NATIVE BUILD & LAUNCH BRIEF (Dispatch / Claude Code)

Everything in this brief runs **on Dave's Mac**. Claude built the whole native project;
these are the steps that need credentials or local tooling Claude cannot reach.

Repo: `3ShamrocksStudio/shomer-app` — native project lives in `/native`.

---

## ⛔ BLOCKERS — must be done BEFORE any public launch

### 1. Firebase RTDB rules are INSECURE (critical)
`pairs/` is currently **world-writable**: any authenticated user can write into
*anyone's* guardian circle. On a public safety app this means a stranger can insert
themselves as a guardian of a person walking home alone. **Do not launch without this.**

Create `database.rules.json`:

```json
{
  "rules": {
    "registry":  { ".read": false, ".write": "auth != null" },
    "pairs": {
      "$uid": {
        ".read":  "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        "$peer": { ".validate": "newData.hasChildren(['name','ts'])" }
      }
    },
    "invites": {
      "$token": {
        ".read":  "auth != null",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['fromUid','ts'])"
      }
    },
    "presence": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid == $uid",
        ".validate": "newData.hasChildren(['lat','lng','ts'])"
      }
    },
    "ping": {
      "$uid": {
        ".read":  "auth != null && auth.uid == $uid",
        ".write": "auth != null"
      }
    },
    "sos": { ".read": "auth != null", ".write": "auth != null" },
    "stats": { ".read": "auth != null", ".write": false }
  }
}
```

Deploy:
```bash
firebase login
firebase use shomergency
firebase deploy --only database
```

### 2. Remove the founder SMS bypass
In `shomer.html`, search `founderFastPath` and delete the bypass block. It exists so Dave
could log in while Twilio had his prefix blocked. It must not ship.

### 3. Re-enable Twilio Verify Fraud Guard
Twilio Console → Verify → Service `VAa6d1d6e530cbcd67bda268bb22dc0ace` → Fraud Guard → **Standard**.

### 4. Twilio sender name
Messaging Service → set the alpha sender ID so SMS reads **SHOMER**, not "SIGNAL".

---

## 1. Build the native app

```bash
cd native
npm install
npx cap add android
npm run build          # copies the live PWA into www/ and syncs Capacitor
```

### Android permissions
Add to `native/android/app/src/main/AndroidManifest.xml` inside `<manifest>`:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

And inside `<application>`:

```xml
<service
    android:name="com.equimaps.capacitor_background_geolocation.BackgroundGeolocationService"
    android:foregroundServiceType="location"
    android:enabled="true"
    android:exported="false" />
```

### Firebase for push
Download `google-services.json` from the Firebase console (project `shomergency`, add an
Android app with package `il.co.shomerapp`) and place it at:
`native/android/app/google-services.json`

### Run it
```bash
npm run android      # opens Android Studio
```
Test on a real device: grant location **"Allow all the time"**, background the app, and
confirm a paired guardian still sees the position move. **This is the whole point of going
native — verify it before shipping.**

---

## 2. Ship to Google Play

1. **Google Play Console** account — $25 one-time.
2. Generate an upload key:
   ```bash
   keytool -genkey -v -keystore shomer-release.keystore \
     -alias shomer -keyalg RSA -keysize 2048 -validity 10000
   ```
   Store the keystore + password in 1Password. **If this is lost, the app can never be updated.**
3. Configure signing in `native/android/app/build.gradle`.
4. Build the bundle:
   ```bash
   npm run bundle       # → android/app/build/outputs/bundle/release/app-release.aab
   ```
5. Upload the `.aab` to Play Console → Internal testing first, then Production.

### Play Store listing — required content
- **App name:** SHOMER — Citizens for Citizens
- **Short description:** Free community safety. One tap tells the people who love you where you are.
- **Category:** Maps & Navigation / Lifestyle
- **Privacy policy URL:** https://www.shomer-app.co.il/privacy.html *(exists)*
- **Data safety form:** declare Location (precise), collected + shared with the user's chosen
  guardians, not sold, encrypted in transit, user can delete.

### ⚠️ Background location declaration (this is where apps get rejected)
Google requires a written justification and a demo video for `ACCESS_BACKGROUND_LOCATION`.
Use this:

> SHOMER is a personal-safety app. Users add trusted guardians (family, friends) who can see
> their live location. Background location is essential to the core feature: if a user is
> attacked, incapacitated, or their phone is locked in their pocket, their guardians must
> still be able to find them. Location is only shared with guardians the user has explicitly
> added and who have approved the connection, sharing can be paused at any time (Ghost mode),
> and it is never sold or used for advertising.

Record a short screen video showing: adding a guardian → the approval → the map updating with
the app backgrounded. Attach it to the declaration.

---

## 3. iOS (after Android is validated)

Requires Xcode on the Mac and an Apple Developer account ($99/yr).

```bash
npx cap add ios
npm run ios
```

Add to `native/ios/App/App/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>SHOMER shares your location with the guardians you choose, so they can find you if something happens.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>SHOMER keeps protecting you when the app is closed. Your chosen guardians can see where you are in an emergency — even if your phone is locked.</string>
<key>UIBackgroundModes</key>
<array><string>location</string></array>
```

---

## Status

| Item | Owner | State |
|---|---|---|
| Capacitor project, config, native bridge | Claude | ✅ done, in repo |
| Background geolocation wiring | Claude | ✅ done |
| Watch session + last-seen (web) | Claude | ✅ live |
| Firebase rules fix | **Dispatch** | ⛔ blocker |
| Remove founderFastPath | **Dispatch** | ⛔ blocker |
| Twilio Fraud Guard + sender | **Dispatch** | ⛔ blocker |
| Play Console account + keystore | **Dave** | pending |
| Android build + device test | **Dispatch** | pending |
| Store listing + bg-location video | **Dave** | pending |
| iOS | later | after Android |

**Realistic timeline:** Android submitted tonight → live in 1–7 days (Play review).
Nothing reaches a store the same day. iOS follows once Android is validated.
