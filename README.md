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
- **6 languages** (he, en, ar, ru, am, fr) with correct RTL/LTR. The auto-filled username is **random and locale-appropriate**, and re-rolls with the chosen language (and is fully editable, incl. a 🎲 button).

## Data & sources — honesty note
The city markers are an **aggregate statistical safety overview — NOT specific incidents**. Individual pins on the map come **only** from user reports and live SOS.

Figures reflect publicly reported national / area trends:
- **Israel CBS (Central Bureau of Statistics)** — Personal Security Survey 2024: ~15% of adults reported some personal harm in the past year (reported via *The Jerusalem Post*).
- **CBS / Statista 2023** — online offences most common, followed by violence/threats.
- **Taub Center 2024** — homicide rose ~2.8× in Arab communities (2018–2023).
- **Israel Police open data** — crime-by-locality datasets at [data.gov.il](https://data.gov.il/).

These sources are also cited in-app (map banner, marker popups, and Settings → "Data & sources").

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
