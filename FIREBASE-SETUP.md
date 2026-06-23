# SH✡MER — Firebase Cloud Messaging (real cross-device SOS push)

**Status:** the client receive-side is fully wired and **gated**. With no config, the app
runs exactly as today (no network calls, no console errors). It goes live the moment you
(a) paste your Firebase web config below and (b) deploy a tiny sender (Cloud Function).

## Why a sender is required (honest note)
GitHub Pages is a **static host** — it can never *send* a push to another device. Sending
to other users' FCM tokens is a privileged server operation that needs the Firebase **Admin
SDK** running on a backend. Your **Blaze plan** exists precisely so you can run a **Cloud
Function** for this. So:

- **Receive side (this app):** DONE — registers an FCM token, handles foreground + background
  messages. Inert until you add config.
- **Send side (broadcast SOS to nearby guardians):** needs a Cloud Function (steps below).
  Until then, the in-app "broadcast" is honestly labelled **"(simulated)"**.

---

## Step 1 — Firebase project
1. https://console.firebase.google.com → **Add project** → `shomer` (Blaze is already active).
2. Add a **Web app** → copy the `firebaseConfig` object.
3. **Build → Cloud Messaging** → **Web Push certificates** → **Generate key pair** → copy the
   VAPID key.

## Step 2 — Paste config (client)
In `shomer.html`, find `window.SHOMER_FCM = null;` (top of file) and replace it:
```js
window.SHOMER_FCM = {
  apiKey: "…",
  authDomain: "shomer-xxxx.firebaseapp.com",
  projectId: "shomer-xxxx",
  messagingSenderId: "…",
  appId: "…",
  vapidKey: "…"          // the Web Push key pair from Step 1.3
};
```
Commit + push. That's it — devices now register real FCM tokens (stored at `SS.fcmToken`)
and will display real foreground + lock-screen notifications. The existing `sw.js` push
handler renders background messages.

## Step 3 — Token storage + sender (backend, one-time)
The app stores each device's token locally (`SS.fcmToken`). To broadcast, those tokens must
reach a server. Minimal design:

1. **Firestore** (free tier): when a token is obtained, write `{token, lat, lng, role, ts}`
   to a `guardians` collection. (Add ~10 lines to `initFCM()` once you choose Firestore.)
2. **Cloud Function** `broadcastSOS` (Blaze): on an SOS write, query guardians within radius
   and `admin.messaging().sendEachForMulticast({tokens, notification})`.

```js
// functions/index.js (sketch — deploy with `firebase deploy --only functions`)
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin"); admin.initializeApp();
exports.broadcastSOS = onDocumentCreated("sos/{id}", async (event) => {
  const sos = event.data.data();
  const near = await admin.firestore().collection("guardians").get(); // + geo filter
  const tokens = near.docs.map(d => d.data().token).filter(Boolean);
  if (!tokens.length) return;
  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title: "🚨 SH✡MER SOS nearby", body: "A guardian needs help. Tap to open the map." },
    webpush: { fcmOptions: { link: "https://3shamrocksstudio.github.io/shomergency/shomer.html" } }
  });
});
```
3. In `activateSOS()` (client), write the SOS doc to Firestore (replace the simulated
   broadcast toast). Remove the "(simulated)" label once verified.

## Security
- Only the **web** config + **VAPID** key go in the client (these are public by design).
- The Admin SDK / service-account key lives **only** in the Cloud Function — never in the repo.
- Lock Firestore rules so clients can write their own guardian/SOS docs but not read others'
  raw tokens.

## Test
1. Two devices/browsers, both grant notifications.
2. Confirm each logs a token (`SS.fcmToken`).
3. Trigger SOS on A → B receives a real push. Done.
