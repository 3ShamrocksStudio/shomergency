# SHOMER on Google Play — Dave's Checklist

Plain steps. Do them in order. Anything marked **[ME]** I've already done; **[YOU]** is yours.

---

## STEP 0 — Test it on your phone first **[YOU, 5 min]**
Before anything store-related, sideload the debug app and make sure it feels right:
1. I'll send you **`SHOMER-v1.0.0-debug.apk`**. Get it onto your Android phone (email it to
   yourself, or copy via USB/Google Drive, and tap it).
2. Tap the file → Android says "install unknown apps" → allow it for your Files/Browser → Install.
3. Open **SHOMER**. It's the same app you know, now wrapped natively.
4. **Test the two big wins:**
   - Trigger an SOS, then **press volume-down / flip the phone to silent** — the alarm should
     KEEP blaring (that's the native alarm stream). Cancel with your code as usual.
   - In Settings turn on Shake-to-SOS, **background the app** (home button), and shake hard 5×
     — it should fire even though the app isn't on screen.
5. Tell me what works / what to tune. **We fix anything before the store.**

---

## STEP 1 — Create your Play developer account **[YOU, ~15 min + $25 one-time]**
1. Go to **play.google.com/console** → sign in with the Google account you want to own the app.
2. Pay the **one-time $25** registration fee.
3. **Account type — my recommendation for a safety app: ORGANIZATION.**
   - *Organization* shows "3Shamrocks Studio" as the developer (more trustworthy for a safety
     app, separates it from your personal name). It now needs a **D‑U‑N‑S number** (free, but
     can take a few days to get for the business).
   - *Personal* is faster (no D‑U‑N‑S) but shows your personal legal name publicly.
   - → If you can wait a few days, get the D‑U‑N‑S and go Organization. If you want to move now,
     start Personal — you can't easily switch later, so decide up front.

> ⚠️ Google now requires **new personal accounts** to run a **closed test with ~20 testers for
> ~14 days** before they'll let you publish to the public. Plan for that 2-week window (Step 5).

---

## STEP 2 — Create the app + upload **[YOU, ~20 min]**
1. Play Console → **Create app**. Name: **SHOMER**. Type: **App**. Free. Confirm the declarations.
2. Left menu → **Testing → Closed testing → Create track** (call it "alpha").
3. **Upload the file I give you: `SHOMER-v1.0.0-release.aab`** (the signed one — NOT the .apk).
4. Google Play will manage the final signing key ("Play App Signing") — accept that.

---

## STEP 3 — Store listing fields **[YOU, ~30 min]** — here's the copy to paste
- **App name:** `SHOMER — שומר` (or `SHOMER`)
- **Short description (≤80 chars):** `Citizens protecting citizens. One-tap SOS, live safety map, loud alarm.`
- **Full description:** use the text from the website's About/landing — emphasize: instant SOS,
  loud alarm, live map, shake-to-SOS, works with your trusted circle. **Do NOT promise it works
  when the phone is fully off** (be accurate — it's a safety app).
- **App icon:** 512×512 PNG — use `SHOMER_logo_big.png` from the repo (I can export a 512 version).
- **Feature graphic:** 1024×500 — I can make one from the brand assets.
- **Screenshots:** at least 2 phone screenshots (I can capture these from the live app).
- **Category:** *Health & Fitness* or *Lifestyle* (safety apps usually go Health & Fitness).
- **Privacy policy URL:** REQUIRED — `https://www.shomer-app.co.il/shomer.html` has a privacy
  section; Google wants a dedicated URL. I can publish a `privacy.html` page for you.
- **Data safety form:** declare location (used for SOS/map), no selling of data.

---

## STEP 4 — Content rating + declarations **[YOU, ~10 min]**
- Fill the **content-rating questionnaire** (it's a safety/comms app → low rating).
- **Foreground service / special-use** review: Google will ask why the app uses a background
  service. Answer: *"Personal-safety app; a foreground service runs the emergency alarm and an
  optional shake-to-trigger sensor so an SOS works when the screen is off. User-initiated,
  clearly notified."* (This is why the manifest uses `specialUse` — expect this question.)

---

## STEP 5 — Closed test → then production **[YOU, ~14 days]**
1. Add **~20 testers** (their Gmail addresses) to the closed track — friends, family, early users.
2. Keep the test running **≥14 days** with real installs/opt-ins.
3. After that Google unlocks **Production** — promote the same build and submit for review.

---

## STEP 6 — What only YOU can do (I cannot)
- Create/verify the Play account, pay $25, D‑U‑N‑S, and press **Publish**.
- Everything up to that line is done or ready.

---

## STEP 7 — Background push (FCM) — OPTIONAL, do later **[needs YOU + ME]**
Not required to launch. When you want "we just added / fixed X" announcements delivered even
when the app is killed:
1. Firebase Console → your `shomergency` project → **Add app → Android** → package
   `il.co.shomerapp` → download **`google-services.json`**.
2. Send me that file — I'll drop it in, re-enable the push plugin, and rebuild. Then you can send
   announcements from Firebase Console → Cloud Messaging (free). **No SMS, no cost.**
