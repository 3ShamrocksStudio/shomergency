# SH✡MER — Revisions Batch 2 (2026-06-24)

From Dave's real device test. **CRITICAL functional items first** — marketing is gated on these
working + verified. Test on **TWO genuinely separate sessions**, mobile, screenshots.
**No claiming done without real cross-session proof.**

## 🔴 CRITICAL (core not actually working)

1. **SOS DOES NOT ALERT OTHER USERS.** Other devices got NO notification/alert/sound.
   Diagnose (other app not open/connected? RTDB write failing? wrong path / not subscribed?).
   - Active SOS must reach every connected SHOMER **LIVE** (visible event + sound).
   - Closed-app delivery via **push** → needs Cloud Functions deploy
     (`firebase deploy --only database,functions`, still pending — prep it).
   - VERIFY across two real separate sessions.

2. **OTHER SHOMERS NOT VISIBLE ON MAP.** Show other active SHOMERs as **anonymized presence
   markers** — approximate location, **no identity**. Makes the network real + SOS visibly
   reaches nearby SHOMERs.

3. **PAIRING ISN'T REAL.** "Add a friend" only sends a link with no real link between users.
   Mutual accept must **link the two accounts in the backend** so SOS + location flow between
   paired SHOMERs.

4. **CONSOLIDATE** "connect a SHOMER" + "Circles / מעגלים" into ONE concept:
   **"השומרים שלי"** (My SHOMERs) = your trusted circle; "add a SHOMER" adds to it.
   Rename מעגלים → השומרים שלי everywhere.

## Executive decisions (Dave delegated)
- Profile **"points/נקודות" → REMOVE** (vanity, like the level).
- SOS-cancel **"tested it" option → REMOVE** (abuse vector — never broadcast a test to others).

## Landing page
- Remove the **"CITIZENS FOR CITIZENS"** banner.
- Headline → **"SHOMER – אפליקציית חירום וסיוע מיידי. אזרחים למען אזרחים."**
- Remove **"ONE TAP · YOU'RE NOT ALONE"**.
- Fix carousel (only 1 of 3 images shows) + **REMOVE ALL TEXT off the carousel images**.
- **"ראה איך זה עובד" → "איך זה עובד?"**
- **"המפה שמראה מי לידך" is FALSE** — rewrite truthfully.
- Remove **"בנוי לרגע האמת"**.
- **"שלושה דברים. מיידיים" → "שלוש פעולות מהירות:"**
- **"נראים ונשמעים מיד" → "שומעים ורואים אתכם באופן מיידי!"**
- Location text → **"שיתוף מקום רק עם מי שרוצים (הורים, חברים). ניתן לעצור בכל רגע."**
- Help text → **"בחירום, שומרים באזורך מקבלים מסלול הגעה בדיוק אליך לסיוע מיידי."**

## Onboarding
- Screen-1 logo **LARGER**.
- **RESTORE** the 3Shamrocks © copyright line next to the small logo (it vanished).
- Move **"שומר אינו תחליף"** disclaimer **BELOW** the phone field.
- **"אפשר גישה למיקום" → "שתף מיקום"**.
- Skip → **"דלג – המשך בלי שיתוף מיקום"**.

## Map
- Remove **"חירום מיידי"** under the SOS button.
- **"Install Keeper" → "Install SHOMER"** (audit for any leftover "Keeper").
- On active SOS, show the route to the event **IMMEDIATELY** + pulsing red dot at event location.

## Order
CRITICAL four + decisions → then copy/UI. Deploy + verify (two sessions) + mobile screenshots.
Report honestly what's truly working.
