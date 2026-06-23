# SH✡MER — background / "not in app" behaviour (honest capability map)

The brief: SOS must work even when the user isn't actively in the app. We implement the
**web platform maximum** now and are explicit about the hard limits that genuinely need the
**native Capacitor wrapper**. Nothing here is faked.

## Implemented now (web maximum)
| Capability | What it does | Works when… |
|---|---|---|
| **Service worker + push handler** (`sw.js`) | Receives Web Push/FCM and shows a persistent, `requireInteraction` notification with "Open map / Call 100" actions | App backgrounded **or closed**, *if* a push is delivered (needs FCM config + a sender) |
| **Screen Wake Lock** (`navigator.wakeLock`) | Keeps the screen awake during an active SOS so the alarm/strobe survive idle; re-acquired on tab re-focus | App foreground/idle |
| **Background Sync registration** (`sos-sync`) | Best-effort retry of a queued SOS when connectivity returns | Chromium browsers |
| **Lock-screen notification** on SOS | `pushNotify()` posts a notification on trigger | App foreground/backgrounded |
| **Persistent alarm + strobe + morse** | Continue while the tab is alive (foreground or backgrounded-but-not-killed) | App not force-closed |
| **PWA install (A2HS)** | Installed PWA gets its own process + better background longevity than a tab | Installed |

## Hard web limits — these need the NATIVE build (Capacitor)
- **App force-closed / phone locked (esp. iOS):** a PWA cannot run JS, hold the mic/torch, or
  trigger the alarm when the OS has killed/suspended it. iOS suspends background JS aggressively.
- **Shake-to-SOS while backgrounded:** `DeviceMotion` events don't fire when the page is
  hidden/suspended — hardware-trigger-from-background needs a native background service.
- **Hardware-button SOS (power-button taps):** not exposable to web at all — native only.
- **Guaranteed background delivery of the cross-device alarm** (responder alerts, mutual
  check-in miss, geofence arrival): requires **FCM push from a server** (the documented
  Firebase gap) so the OS wakes the app; the web SW can then display it.

## In-app honesty
The app shows the **"augments, not a replacement — call 100/101/102"** guardrail throughout,
and labels every simulated cross-device path "(simulated — needs backend)". For true
always-on background SOS, the roadmap is: **(1)** wire Firebase (config + VAPID + a Cloud
Function sender) to make push real, then **(2)** ship the **Capacitor** native wrapper for
background services, hardware triggers, and force-closed operation.

## What Dave must provide to close the gap
Firebase project + **Firestore/Realtime DB** + **FCM web config + VAPID key** (see
`FIREBASE-SETUP.md`). Native background/hardware items require building the Capacitor app.
