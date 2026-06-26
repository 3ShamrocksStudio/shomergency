# SHOMER — free SOS push fan-out (Cloudflare Worker)

Sends closed/locked-app SOS push notifications **without** the paid Firebase Blaze
plan. Runs on the **Cloudflare Workers free tier** (100k requests/day — far more than
needed). The FCM service-account secret stays server-side in the Worker.

## How it fits together
1. Client writes the SOS to RTDB **and** POSTs `{ "id": "<sosId>" }` to this Worker.
2. Worker reads the SOS + everyone's FCM token + the sender's pairs from RTDB (open
   rules, REST), picks recipients (paired **or** within 5 km), and sends a
   high-priority FCM Web Push (HTTP v1 API) to each token.
3. Each recipient's service worker `push` event fires — even backgrounded/locked.

## One-time deploy (Dave — ~5 min, free)
Prerequisites: a free Cloudflare account, Node installed.

```bash
cd worker
npx wrangler login                      # opens browser, free Cloudflare account
npx wrangler deploy                     # deploys sos-push-worker.js, prints the URL
npx wrangler secret put FCM_SERVICE_ACCOUNT
# → paste the FULL service-account JSON, from:
#   Firebase console → Project settings → Service accounts → Generate new private key
```

`wrangler deploy` prints a URL like `https://shomer-sos-push.<you>.workers.dev`.

## Wire it into the app (one line)
Paste that URL into `shomer.html` config block:
```js
window.SHOMER_PUSH_URL = 'https://shomer-sos-push.<you>.workers.dev';
```
Until it's set, the app runs normally and simply doesn't send background pushes (no
errors, no cost).

## Cost
- Cloudflare Workers free tier: 100,000 requests/day. ✅ $0.
- FCM (Firebase Cloud Messaging): free, unlimited, no Blaze needed for sending. ✅ $0.
- The only Firebase cost would be Cloud Functions (NOT used here) — avoided entirely.

## Notes / limits
- iOS: push only works if SHOMER is **Added to Home Screen** (iOS 16.4+). A plain
  Safari tab gets nothing in the background. The app shows an A2HS + notification
  prompt. For rock-solid iOS background/locked alerts, a native wrapper is more
  reliable (parked per budget).
- Android (Chrome): background + locked delivery works once notifications are allowed.
