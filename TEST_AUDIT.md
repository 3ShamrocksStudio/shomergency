# SHOMER / Shomergency — Solo Test & Audit Checklist

**App:** Single-file PWA (`shomer.html` + `manifest.json` + `sw.js` + icons)
**Live URL:** https://3shamrocksstudio.github.io/shomergency/
**Audience:** One person (Dave), testing solo in a real browser.

This document is a step-by-step self-test. Work top to bottom. Each section lists
**exact steps** and the **expected result**. A "Known limitations" section at the end
explains, honestly, what this front-end-only prototype does *not* do.

> **Best device for the full experience:** a phone (Chrome on Android, or Safari on
> iOS) over the live HTTPS URL — that unlocks real geolocation, device-motion shake,
> the camera, push permission, and the install prompt. Everything except live shake
> and the OS install prompt can also be tested on a desktop browser.

---

## 0. First-run reset (do this before each clean test)

1. Open the app. If you've used it before, open the menu (**☰**) → **הגדרות / Settings**.
2. Scroll to the bottom → **🔄 איפוס אפליקציה / נתוני דמו (Reset app / demo data)**.
3. Confirm the dialog.
   - **Expected:** page reloads and you land back on the **onboarding** screen with all
     data cleared (profile, reports, SOS history, settings).

---

## 1. Onboarding (persists, never loops)

1. On the onboarding screen, optionally type a first name.
2. Type **any** phone number (e.g. `050-123-4567`). Leaving it blank also works (demo mode).
3. Tap **המשך / Continue**.
   - **Expected:** advances to the **location** step.
4. Tap **אפשר גישה למיקום / Allow location** and accept the browser prompt
   (or tap **דלג / Skip** to continue without location).
   - **Expected (allow):** box turns green and shows your lat/long. Button changes to "Continue".
5. Tap Continue → on the **emergency settings** step, pick an alarm, set volume, optionally
   tap **🔊 בדוק אזעקה / Test alarm** (you should hear it).
6. Tap **✓ כניסה לשומר / Enter Shomer**.
   - **Expected:** you enter the map. A welcome toast appears.
7. **Reload the page (Cmd/Ctrl-R).**
   - **Expected:** the app opens **straight to the map** — onboarding does **not** appear
     again. Your name shows in **Profile**. Your chosen alarm/volume is remembered.

✅ *Pass criteria:* any phone number reaches the map, onboarding survives reload, no loop.

---

## 2. SOS safety / anti-abuse flow (alarm-first · cancel-no-trace · resolve · rate-limit · hold-to-arm)

The key rule under test: **false alarms and misuse must NEVER appear on the map.**

### 2a. Press → cancel within the countdown = FALSE ALARM, no trace
1. On the map, press the big red **SOS** button.
   - **Expected:** the **loud siren fires immediately**, and a full-screen **cancel countdown**
     appears (ring + number counting 10→0) with a big green **"I'm safe — Cancel"** button.
   - **Expected:** at this point there is **NO map pin** and **NO feed card** yet (broadcast hasn't happened).
2. Tap **"I'm safe — Cancel"** (or the SOS button) **before** the countdown ends.
   - **Expected:** siren stops, overlay closes, toast says *"Cancelled — false alarm. Nothing shared, nothing on the map."*
   - **Expected:** open Updates feed → **no SOS card**. Map → **no pin**. Profile → SOS history → **no new event** (a false alarm leaves no trace).

### 2b. Press → let it fire = ACTIVE event (maps + pulses + broadcasts)
1. Press **SOS**, then **let the countdown reach 0** (don't cancel).
   - **Expected:** overlay closes; a **pulsing red pin** drops at your location; the red **SOS strip**
     appears (now with an **"✓ I'm safe"** button); a toast says *"SOS broadcast — nearby guardians notified (simulated)"*;
     the Updates feed gets a **"🚨 Your active SOS"** card; after ~2s the auto-dial 100 confirm appears; responder count climbs.

### 2c. Resolve as accidental / test → removed from the map
1. With an active SOS, tap **"✓ I'm safe"** on the strip.
   - **Expected:** a prompt asks **"Real / Accidental / Test?"**
2. Choose **Accidental** (or **Test**).
   - **Expected:** the **pin is removed** and the **feed card disappears**; toast confirms it was *removed from the map, not shared with others.*
3. Repeat 2b, then choose **Real**.
   - **Expected:** the pin **stays** (confirmed-real events remain mapped).
4. Profile → SOS history shows each event tagged **confirmed / accidental / test** (private log; accidental/test are still gone from the public map).

### 2d. Rate limit (max 3 active/day)
1. Fire-and-let-activate **3 times** (resolve each). On the **4th**, let it activate.
   - **Expected:** alarm still sounds, strip shows **"broadcast paused (daily limit)"**, toast explains the daily limit; **no new pin/broadcast**. `Settings → SOS safety` shows **3/3**.
   - *(Configurable via `SS.sos.maxPerDay`. This is a local sim — a real server enforces it; see README.)*

### 2e. Countdown duration setting & hold-to-arm
1. `Settings → SOS safety` → set **Cancel window** to **5s** → press SOS → countdown now starts at **5**.
2. Toggle **Hold-to-arm** on → a single tap on SOS only shows a *"press & hold 2s"* hint; **press and hold ~2s** → the gold ring fills and SOS fires.

✅ *Pass criteria:* alarm always fires first; cancel leaves zero trace (no pin/feed/history); activation maps + pulses; accidental/test scrub from the map; real stays; rate limit blocks broadcast; duration + hold-to-arm work; all settings persist across reload.

---

## 3. Shake-to-SOS (toggle + sensitivity + simulate button)

Open menu → **Settings** → **Shake-to-SOS** section.

1. **Toggle:** turn the **הפעל Shake-to-SOS / Enable Shake-to-SOS** switch off and on.
   - **Expected:** a toast confirms on/off. State persists across reload.
2. **Sensitivity:** drag the **רגישות ניעור / Shake sensitivity** slider.
   - **Expected:** the label reads High / Medium / Low and persists across reload.
3. **Simulate (desktop-friendly):** tap **📳 סימולציית ניעור (בדיקה) / Simulate shake (test)**.
   - **Expected:** a "shake detected (simulated)" toast, then a full **SOS** fires
     (siren + pin + strip), exactly as a real 5-shake gesture would. The event is logged
     to SOS history with the **shake** tag. Cancel it when done.
4. **Real shake (phone only):** with the toggle on, physically shake the phone ~5 times hard.
   - **Expected:** SOS fires automatically. *(Requires a real device with motion sensors;
     iOS asks for motion permission once.)*

✅ *Pass criteria:* toggle + sensitivity persist; simulate button fires SOS on desktop.

---

## 4. Dead Man's Switch (short demo interval + countdown + check-in + auto-fire)

Open menu → **⏱️ Dead Man's Switch**.

1. Pick the **1 / דמו (demo)** interval (also 5 and 10 minutes available).
2. Tap **▶ הפעל / Activate**.
   - **Expected:** a blue strip with a live **countdown** appears; the menu badge shows
     "פעיל / Active"; the status card shows a `1:00` timer counting down.
3. Wait. At **60 seconds left** the strip turns orange and warns "60 seconds to confirm".
4. Tap **✓ הכל בסדר / I'm OK** before the timer ends.
   - **Expected:** countdown resets to the full interval.
5. To watch it fire: let the timer run all the way to `0:00` without confirming.
   - **Expected:** at zero it **automatically triggers SOS** (siren + pin), shows
     "⚠️ DMS — Auto SOS!", and logs an SOS-history event tagged **DMS**.
6. **Persistence across reload:** activate DMS, then reload mid-countdown.
   - **Expected:** the countdown **resumes** from roughly where it was (a toast says
     "DMS resumed after reload"). If the deadline already passed while the app was closed,
     it clears safely and says "DMS expired while app was closed" — it does **not** blast
     the alarm on load.

✅ *Pass criteria:* settable interval (incl. 1-min demo), visible countdown, check-in works,
timeout fires SOS within ~1 minute, state survives reload.

---

## 5. Reports (photo/camera → submit → map + reports list → persists)

Open menu → **📝 דיווח אירוע / Report incident** (or the **🔔 Updates → +** path).

1. Pick an incident **type**.
2. Type a **description** (required — submitting empty shows a prompt to describe it).
3. **Photos:** tap **🖼️** to attach from gallery, or **📷** to use the camera, then snap.
   - **Expected:** thumbnails appear; a count badge updates. (Up to 5 photos.)
4. Tap **📍 שתף מיקום נוכחי / Share current location** and accept the prompt
   (required before sending — sending without it shows a reminder).
5. Tap **📤 שלח דיווח / Send report**.
   - **Expected:**
     - A "report sent" toast (with photo count).
     - A **blue pin** appears on the map at the report location (tap it → detail sheet).
     - The report appears in the **Updates** feed.
     - The report appears in **Profile → הדיווחים שלי / My reports**, with thumbnails.
6. **Reload.** Open Profile → My reports, and check the map.
   - **Expected:** the report, its thumbnails, and its map pin are **all still there**.

✅ *Pass criteria:* report submits, shows on map + reports list, persists across reload.

> Note: stored photos are downscaled to thumbnails so reports fit in browser storage.
> The detail view shows a photo count; the reports list shows the thumbnails.

---

## 6. Map (live blue dot + seeded hotspots + interactive)

1. On the map, tap the **📍** button (bottom-left).
   - **Expected:** accepts the location prompt, drops/centres a **blue "me" dot**, and
     zooms to you. On a moving phone the dot follows your real position (live watch).
2. Pinch / scroll or use the **+ / −** controls to zoom; drag to pan.
   - **Expected:** map zooms and pans smoothly.
3. Tap any colored **hotspot pin**.
   - **Expected:** a tooltip shows the incident type, area, status; some open a full detail sheet.
4. Check the **legend** (bottom-right) for the color key.

✅ *Pass criteria:* blue dot tracks real location, seeded Israel hotspots present, map interactive.

---

## 7. Language (live switch + persist + Hebrew RTL)

1. During onboarding, or in **Settings → שפה / Language**, tap **English**, **العربية**,
   **Рус**, **አማ**, or **FR**.
   - **Expected:** UI text switches **immediately**. Hebrew & Arabic lay out **right-to-left**;
     English/Russian/Amharic/French lay out left-to-right.
2. **Reload.**
   - **Expected:** the app comes back up in your **last chosen language**.

✅ *Pass criteria:* language applies live, RTL is correct for he/ar, choice persists.

> Note: the core UI is fully translated in all 6 languages. A few controls added in this
> pass (shake settings, reset, profile section headers) are bilingual Hebrew/English and
> will read in English for the non-Hebrew locales.

---

## 8. Install prompt (PWA)

- **Android / desktop Chrome (over the live HTTPS URL):** after a few seconds an
  **"Install Shomer"** banner appears, or use the browser's install icon in the address bar.
  - **Expected:** tapping Install adds the app to your home screen / launcher; it opens
    standalone (no browser chrome) with the SHOMER icon.
- **iOS Safari:** use **Share → Add to Home Screen** (iOS does not support the
  auto-prompt API).

✅ *Pass criteria:* the app is installable and launches standalone.

---

## 9. Persistence summary (everything that survives a reload)

Stored under a single LocalStorage key `shomer_state_v1`:

| Data | Survives reload? |
|------|------------------|
| Onboarding complete / profile (name, phone) | ✅ |
| Chosen language | ✅ |
| Alarm type + volume | ✅ |
| Shake enabled + sensitivity | ✅ |
| Dead Man's Switch interval + active countdown | ✅ (resumes) |
| Notification + privacy toggles, alert radius | ✅ |
| Submitted reports (incl. photo thumbnails + map pins) | ✅ |
| SOS event history | ✅ |

The **Reset app / demo data** button (Settings) wipes all of the above and returns to onboarding.

---

## Known limitations (front-end-only prototype — be honest about these)

This is a **client-side-only** prototype. There is **no server / backend**. As a result:

1. **No real multi-user delivery.** SOS alerts, reports, and "guardians responding" are
   **local to this one device**. Nothing is actually sent to other people, to dispatchers,
   or to the police. The responder counts, "247 active guardians", and the live event ticker
   are **simulated** for demonstration.
2. **No real push notifications.** The app can show a *local* browser notification (if you
   grant permission), and `sw.js` contains a push handler, but there is **no push server**,
   so no alerts arrive when the app is closed/backgrounded on a real network.
3. **SOS cannot force a phone call.** Browsers can't auto-dial. SOS offers to open the
   dialer (`tel:100`); you still tap call. Lock-screen / hardware SOS is the OS's feature,
   not this app's.
4. **Geolocation & shake need a real device + permission.** On desktop, geolocation may be
   approximate or unavailable, and there is no motion sensor — use the **Simulate shake**
   button to test that path. iOS requires a one-time motion-permission grant for shake.
5. **Camera needs HTTPS + permission.** Works on the live URL and `localhost`. If denied or
   absent, the app falls back to gallery file-picking.
6. **Photos are stored as downscaled thumbnails** to stay within browser storage limits;
   full-resolution images are not persisted.
7. **Data is per-device, per-browser.** Clearing site data / using a different browser or a
   private window starts fresh. There is no account sync.
8. **Map is a stylized SVG of Israel**, not real map tiles. Pins are placed via approximate
   geo→SVG interpolation from known city anchors, so positions are indicative, not survey-grade.
9. **DMS / timers only run while a tab is open.** A backgrounded or closed tab won't fire the
   auto-SOS in real time; on reopening, an expired DMS is reported as expired (it does not
   retroactively blast the alarm).
10. **SOS anti-abuse is simulated locally and is bypassable.** The cancel-no-trace flow, the
    pulsing pin, and the resolution prompt are real UX, but the **broadcast, the per-day rate
    limit (`SS.sos.activeToday`), and the trust score (`trustScore()`) live in LocalStorage** —
    clearing site data resets the counters. A real deployment must enforce **broadcast/fan-out,
    rate-limiting, and reputation on the server**, keyed to an authenticated account, and must
    never publish cancelled/accidental/test events. See README → *"What a real backend MUST enforce"*.

These are inherent to a no-backend prototype and would be resolved by adding a server,
push infrastructure, real map tiles, and a native wrapper.

---

*By 3Shamrocks.Studio · Verified in-browser (Chromium preview) prior to deploy.*
