#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# SH✡MER — One-shot native Android build script
# Run this ON YOUR MAC. It does everything up to a testable app on your phone.
# Prereqs (one-time): Node.js, Android Studio installed, a phone in USB-debug mode.
# ═══════════════════════════════════════════════════════════════════════
set -e
echo "═══ SH✡MER native build ═══"

# 1. install deps
echo "→ installing dependencies..."
npm install

# 2. pull the LIVE web app into www/
echo "→ copying live web app..."
node scripts/copy-web.js

# 3. add the Android platform (generates android/)
echo "→ adding Android platform..."
npx cap add android || echo "  (android already added, continuing)"

# 4. sync web assets + plugins into the native project
echo "→ syncing..."
npx cap sync android

# 5. merge the permission additions into AndroidManifest
echo "→ AndroidManifest: add the permissions from android-config/AndroidManifest-additions.xml"
echo "   (manual one-time merge — see that file)"

# 6. open in Android Studio to build + run on your phone
echo "→ opening Android Studio..."
npx cap open android

echo ""
echo "═══ In Android Studio: press the green ▶ Run button with your phone connected. ═══"
echo "═══ Grant 'Allow all the time' location when prompted, background the app, test. ═══"
