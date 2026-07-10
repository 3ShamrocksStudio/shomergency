# SHOMER — Native Android Wrapper (Capacitor)

A **thin native shell** over the live SHOMER PWA. The web app stays the single source of
truth — the wrapper loads `https://www.shomer-app.co.il/shomer.html` directly, so every web
deploy reaches native users with no rebuild. Native adds only the three things a PWA can't do.

## What native adds (and why the PWA can't)
| Capability | How | Web fallback |
|---|---|---|
| **Un-silenceable alarm** | `AlarmForegroundService` plays the SOS loop on the **ALARM audio stream** (`USAGE_ALARM`), forces alarm volume to max, holds audio focus, foreground service, wake lock. Ignores ringer/mute/DND. | Web-Audio alarm (silenceable) |
| **Background shake-to-SOS** | `ShakeService` foreground service runs an accelerometer listener even when backgrounded; 5 hard shakes → sound alarm + launch app → app fires the real SOS over REST/SSE. | In-app shake only (app must be open) |
| **Background FCM push** | (Phase 2 — see `DAVE-PLAY-STORE-CHECKLIST.md` §7) needs the Firebase Android app + `google-services.json`. | Web push (works only while installed PWA, unreliable when killed) |

The bridge in `shomer.html` is **feature-detected and additive** — plain browsers are 100%
unchanged. Realtime stays **REST+SSE over HTTPS** (no RTDB WebSocket SDK).

## Architecture
- `capacitor.config.json` → `server.url` points at the live site (thin wrapper).
- Native code: `android/app/src/main/java/il/co/shomerapp/`
  - `AlarmForegroundService.java` — un-silenceable alarm
  - `ShakeService.java` — background shake detector
  - `ShomerNativePlugin.java` — Capacitor plugin exposing `startAlarm/stopAlarm/enableBackgroundShake/disableBackgroundShake` to JS
  - `MainActivity.java` — registers the plugin; on shake-launch calls `window.__shomerNativeSOS()`
- `android/app/src/main/res/raw/sos_alarm.wav` — 4s seamless-loop harsh alarm asset
- appId: `il.co.shomerapp`

## Build (needs JDK 17 + Android SDK; this repo does NOT commit them)
```bash
cd native/shomer-android
export JAVA_HOME=/path/to/jdk-17 ANDROID_HOME=/path/to/android-sdk
npm install
npx cap sync android
# Debug APK (sideload/test):
cd android && ./gradlew assembleDebug
#   → android/app/build/outputs/apk/debug/app-debug.apk
# Signed release AAB (Play upload) — needs keystore/ + keystore.properties:
./gradlew bundleRelease
#   → android/app/build/outputs/bundle/release/app-release.aab
```

## Signing
Release keystore lives in `keystore/` (gitignored) with creds in `keystore/KEYSTORE-CREDENTIALS.txt`.
**Back this up.** Losing it means you can never update the app under the same Play identity.

## Prebuilt artifacts (this session)
- `SHOMER-v1.0.0-debug.apk` — sideload on your Android device to test.
- `SHOMER-v1.0.0-release.aab` — signed; upload to Play.
