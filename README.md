# SHOMER™ (שומר) — "Shomergency" PWA

**Citizens Protecting Citizens**
Real-time safety map · Instant SOS + alarm · Dead Man's Switch · Shake-to-SOS · Community mutual aid

A single-file, front-end-only Progressive Web App. No backend, no tracking.
Live: https://3shamrocksstudio.github.io/shomergency/

© 2026 **3Shamrocks Studio** · כל הזכויות שמורות · All rights reserved.

---

## Stack & files
- `shomer.html` — the entire app (HTML + CSS + JS in one file).
- `manifest.json` — PWA install manifest.
- `sw.js` — service worker (offline shell, network-first navigation, self-heal on the shared github.io origin, push handler).
- `index.html` — lightweight launcher / SW self-heal shell.
- `logo-*.png`, `*-icon-96.png`, `3shamrocks.png` — icons + studio mark.

## Key features
- **Real interactive map** — [Leaflet 1.9.4](https://leafletjs.com/) (loaded at runtime from cdnjs) with **OpenStreetMap** tiles, lightly tuned to the navy/gold brand. Live geolocation with a blue "me" dot that follows the device.
- **Brand-crafted markers** + an on-map **legend** that explains every colour:
  - **Live SOS** — pulsing red marker.
  - **Statistical hotspots** — category-coded markers (sexual offence, violence, harassment/stalking, theft/property, drugs, medical) placed at major cities.
  - **My location** — blue dot.
- **SOS** — full-volume WebAudio alarm (3 sirens), shared-location pin, auto-call prompt, responder simulation.
- **Three alarms** — (1) police siren, (2) air-raid/battle siren, (3) sonic-deterrent scream — all synthesized with WebAudio (no audio files), engineered to be loud and frightening.
- **Dead Man's Switch** (with a 1-min demo interval), **Shake-to-SOS** (+ desktop "simulate shake"), photo reports, full **LocalStorage** persistence (`shomer_state_v1`).
- **SOS safety / anti-abuse flow** (see below) — alarm-first, a cancel countdown that leaves **no trace** on a false alarm, a real/accidental/test resolution prompt, a per-day rate limit, optional hold-to-arm, and a reputation/trust stub.
- **Connect a Guardian — live location** (see below) — pair a trusted person via a real shareable invite link, see each other on a live map, with who-sees-whom controls. Real cross-window live sync today; cross-device is the backend phase.
- **6 languages** (he, en, ar, ru, am, fr) with correct RTL/LTR. The auto-filled username is **random and locale-appropriate**, and re-rolls with the chosen language (and is fully editable, incl. a 🎲 button).
- **Plain-language Settings** — every Settings section and toggle carries a short "what this does / why" helper line written from the user's point of view (he/en).

## Data & sources — honesty note
The city markers are an **aggregate statistical safety overview — NOT specific incidents**. Individual pins on the map come **only** from user reports and live SOS.

Figures reflect publicly reported national / area trends:
- **Israel CBS (Central Bureau of Statistics)** — Personal Security Survey 2024: ~15% of adults reported some personal harm in the past year (reported via *The Jerusalem Post*).
- **CBS / Statista 2023** — online offences most common, followed by violence/threats.
- **Taub Center 2024** — homicide rose ~2.8× in Arab communities (2018–2023).
- **Israel Police open data** — crime-by-locality datasets at [data.gov.il](https://data.gov.il/).

These sources are also cited in-app (map banner, marker popups, and Settings → "Data & sources").

## SOS safety / anti-abuse flow

Designed so a panic press helps the user **immediately** while keeping the shared map **clean, clear, and relevant** — false alarms and misuse never reach it.

1. **Press SOS → the loud alarm sounds on the user's own phone instantly.** (Unchanged — the alarm is a personal deterrent and fires first, every time.)
2. **A cancel countdown appears** (big "I'm safe / Cancel" button + visible countdown ring). During this window **nothing is broadcast and nothing is mapped.** Duration is a Setting (`Settings → SOS safety`), default **10s**, lowerable to **7s / 5s** for high-risk situations.
3. **Cancel within the window → false alarm:** the alarm stops and there is **no trace** — no pin, no feed card, no broadcast, no mapped history. (Only a private false-alarm counter is bumped for the trust stub.)
4. **Window expires → active event:** a **pulsing SOS pin** drops on the map and a (locally simulated) **broadcast to nearby guardians** begins, with a feed card and responder simulation.
5. **On resolve ("I'm safe") → "Was this real / accidental / test?"** — **accidental and test are removed from the map and feed and are never shown to others.** Only **confirmed-real** events stay mapped.
6. **Anti-abuse:**
   - **Rate limit** — max **3 active (broadcast) SOS per user per day** (configurable via `SS.sos.maxPerDay`). Over the limit, the personal alarm still sounds but the broadcast/pin are withheld.
   - **Hold-to-arm** — optional toggle; requires a ~2s press-and-hold on the SOS button to fire, preventing pocket-dials. (Automatic triggers — shake / Dead Man's Switch — bypass the hold but still get the cancel countdown.)
   - **Trust / reputation stub** — a transparent local heuristic (`trustScore()`): confirmed-real builds trust; accidental / test / false-alarm-cancels erode it. Surfaced read-only in `Settings → SOS safety`.

### ⚠️ What a real backend MUST enforce (this is a front-end-only simulation)

The flow above is **fully implemented as UX**, but cross-device delivery, limits, and reputation are **simulated locally** and are trivially bypassable (clearing storage resets counters). A production build must move the trust boundary to the server:

| Concern | In this PWA (sim) | A real backend MUST |
|---|---|---|
| **Broadcast / fan-out** | Local toast + responder timer; no message leaves the device | Authoritatively fan out the SOS to nearby accounts (geo-query + push/SMS), and **never** publish a cancelled or accidental/test event. |
| **Rate limit** | `SS.sos.activeToday` in LocalStorage | Enforce per-account/device limits server-side (storage clear must not reset them); apply geo/velocity heuristics. |
| **Reputation / trust** | `trustScore()` local heuristic | Compute from tamper-proof cross-device history; throttle, force hold-to-arm, or queue manual review for repeat false-alarmers. |
| **Map authority** | Pin lives only on this device | The server is the source of truth for what is mapped; accidental/test/false events are never persisted or served to others. |
| **Identity** | None | Authenticated accounts so limits & reputation attach to a real principal. |
| **Auto-call** | `confirm()` → `tel:` (opens dialer) | A native wrapper to place/escalate calls and attach location to emergency dispatch. |

## Connect a Guardian — live location (honest: real now vs. backend phase)

Pair a trusted person (parent/partner) and see each other on a live map. Open
**☰ → Connect a Guardian** (top of the Circles sheet). Full test guide + the
real-vs-backend matrix is in **[TEST.md](TEST.md)**.

**✓ Real now (no server):** your live GPS marker (`watchPosition`); a real
shareable invite link (`?g=<token>#n=<name>`) via `navigator.share` / clipboard;
an accept flow that pairs locally and cleans the URL; a genuine **live-location
transport** (`BroadcastChannel` + `localStorage` relay, per-tab identity in
`sessionStorage`) that carries your real position between **windows/tabs of the
same browser** → the guardian shows a green **LIVE** marker on real coordinates;
per-guardian who-sees-whom toggles; ghost/pause; one-tap disconnect. All on-device.

**⏳ Backend / native phase (flagged in-app):** live exchange across *different*
devices (needs a relay server), always-on **background** tracking (needs a native
app + OS permission), verified accounts, and end-to-end encryption. When no live
peer is broadcasting on a pair, the guardian's marker is shown at a clearly
**badged "simulated"** position so the map UX is complete — never faked as the
real person's live location.

The in-app **"Real now ✓ / Backend·native phase ⏳"** matrix states this verbatim,
so the user is never misled about what the web build can and can't do.

## Known limitations
- **Map tiles need network at runtime** — Leaflet + OSM tiles are fetched by the browser from cdnjs / openstreetmap.org. Offline, the app shell loads but map tiles will be blank. (The CSP allows exactly these origins and nothing else.)
- **Crime data is aggregate/statistical**, not case-level. No real incident database is wired in.
- Push, auto-dial, and background SOS are best-effort within PWA limits; a native wrapper (e.g. Capacitor) would be needed for true hands-free / lock-screen widgets.
- Front-end only: "responders", live counts, and the activity feed are demonstrations of the product, not a live backend.

## Security
- Strict CSP, **no `eval`**. The only external origins permitted are `cdnjs.cloudflare.com` (Leaflet), `*.tile.openstreetmap.org` (tiles), and Google Fonts.
- All user-supplied data is rendered via `textContent` / escaped (`ESC()`) — never injected as raw HTML.

---
SHOMER™ (שומר) — a **3Shamrocks Studio** product.
