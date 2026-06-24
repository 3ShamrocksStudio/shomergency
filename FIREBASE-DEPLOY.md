# SH✡MER — Firebase go-live checklist (Blaze)

Everything client-side is wired + deployed. To make it fully real-time/closed-app, these
remaining steps need the Firebase **console** or the **CLI** (I have no CLI/login on this
machine, so I can't run the deploys — see "Let me deploy it" at the bottom).

## A) Console toggles (2 min, free)
1. **Authentication → Sign-in method → Anonymous → Enable.** (RTDB auth — currently
   `auth/configuration-not-found`.)
2. **Authentication → Sign-in method → Phone → Enable.** (Real SMS verification.)
3. **Authentication → Settings → Authorized domains** → add `3shamrocksstudio.github.io`
   (and keep `localhost`). Needed for Phone Auth reCAPTCHA + auth on the live site.
4. **(Cost-safe testing)** Authentication → Sign-in method → Phone → **Phone numbers for
   testing** → add e.g. `+972 50-000-0000` with code `123456`. This verifies the flow with
   **no real SMS / no cost**. Use it for all testing.

## B) Deploy rules + functions (CLI)
From `Shomer/Core/`:
```bash
npm i -g firebase-tools          # or: npx firebase-tools
firebase login                   # interactive (or use a CI token — see bottom)
cd functions && npm install && cd ..
firebase deploy --only database,functions
```
- `database.rules.json` — auth-scoped RTDB rules (presence/sos/positions/checkin/geo/tokens/alarms).
- `functions/` — `sosFanout` (push to nearby guardians on a new SOS) + `alarmFanout` (targeted
  push for geofence arrival / check-in). Node 20, Blaze.

## What turns on after A+B
- **Presence → real "guardians nearby" count** (header chip) — live across devices.
- **Cross-device SOS** — others see your SOS pin + type in real time; **closed-app push** to
  nearby guardians via `sosFanout`.
- **Geofence arrival** → on-device now + **closed-app push** via `alarmFanout`.
- **Real SMS phone verification** (falls back to the labelled demo code until the Phone provider
  is on — so no SMS is ever sent by accident).

## Cost discipline (built in)
- Verification sends **one** SMS per attempt; **resend is rate-limited to 30s**.
- Until the Phone provider is enabled, the app uses the **demo code (no SMS, $0)**.
- FCM + RTDB stay in free tier; functions only run on real events (SOS / arrival / miss).
- **Always test with a Firebase test phone number** (step A4) to avoid SMS charges.

## Honest remaining gap
- **Mutual check-in cross-device alarm to the guardian** needs **guardian↔uid pairing**: the
  current guardian invite exchanges a code/link, not a Firebase uid, so `alarmFanout` can't yet
  target the guardian's device. The transport (`/alarms` + function) is ready; the missing piece
  is storing the paired guardian's uid at invite-accept time. Flagged — small follow-up once auth
  is live.

## "Let me deploy it for you"
Run `npx firebase-tools login:ci`, paste me the token, and I'll deploy rules + functions
non-interactively (`FIREBASE_TOKEN=… firebase deploy --only database,functions`) and verify.
