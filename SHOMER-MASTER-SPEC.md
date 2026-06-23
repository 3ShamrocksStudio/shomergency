# SH✡MER — MASTER SPEC (single source of truth)

> This file is the **one canonical specification** for SH✡MER. All work happens in this
> repo only. Do not create parallel working copies.
>
> **Canonical repo:** `~/Desktop/3S Projects/Shomer/Core`
> **Git remote:** `https://github.com/3ShamrocksStudio/shomergency.git`
> **Live (GitHub Pages):** https://3shamrocksstudio.github.io/shomergency/
> **Siblings (separate products, NOT this repo):** `Shomer/Forest` → `shomer-forest`,
> `Shomer/Beach` → `shomer-beach`. They re-skin this base; Core is upstream of them.

---

## 0 — Repo of record
The `shomergency` Pages repo is `Shomer/Core`. Forest and Beach are distinct verticals
with their own repos and deploys; their commit history shows they were *rebuilt on the
Shomergency base*, i.e. Core is the source they derive from — nothing flows back from them.

## 1 — Branding / colours / UI / UX
- Use Dave's **existing final SH✡MER badge logo AS-IS** (`SHOMER_logo_big.png`). Never
  regenerate, redraw, or replace it. The brand mark is **SH✡MER** with the Star-of-David
  glyph as the "O".
- Logo shown large/clear on a professional textured navy ground (onboarding hero).
- Canonical palette is **locked in [`BRAND.md`](BRAND.md)** — extracted from the badge
  (navy base + metallic gold Star of David + brushed-platinum chrome) and the 3S Design
  System. Applied cohesively on every screen via CSS custom properties in `:root`.
- Professional UI system: Inter/Heebo type, consistent spacing/radius/elevation tokens.
- Full **RTL Hebrew + English** i18n (plus ar/ru/am/fr) that localises the product name
  and all strings.
- **3Shamrocks Studio** footer (real studio logo `3shamrocks.png` + "© 2026 3Shamrocks
  Studio. All rights reserved." + SHOMER™) on every screen, never over functional controls.

## 2 — Functional product + real data + responder users
- Every feature works end-to-end on the client. Real Leaflet map + OSM/Carto tiles + live
  geolocation blue dot + legend (live = pulsing dot, categories = colour-coded dots).
- **Real, cited public data only** — no fabricated incidents. City markers are an
  *aggregate statistical overview* (Israel CBS Personal Security Survey 2024; Israel Police
  open data, data.gov.il; Taub Center 2024), cited in the map banner, popups, and
  Settings → "Data & sources". Individual pins come only from user reports + live SOS.
- **Responder roles** — Police 👮 / Firefighter 🚒 / Paramedic 🚑 — selectable in the
  profile; the chosen role badges the user's own live map marker and shows in their profile.
- **SOS** — real full-volume WebAudio alarm (3 sirens), cancel-countdown anti-abuse flow,
  PIN/hold-to-arm, same-device lock-screen notification, daily rate limit, real/accidental/
  test resolution. **Cross-device push (FCM)** — see §Firebase / gaps.
- **My SHOMER / live location** — consent-gated guardian pairing via shareable invite link,
  Israeli phone validation, explicit opt-in. Cross-window live sync today; cross-device is
  the backend phase.

## 3 — Quality bar
Entirely functional, bug-free, every control clear. Honesty guardrail shown in-app: **SH✡MER
augments personal safety and is NOT a replacement for emergency services (100 / 101 / 102).**
Grok (xAI) may be used for *supporting visuals only* — never the logo.

## 4 — Launch prep (prepared, NOT posted)
Ready-to-publish LinkedIn + Instagram launch copy + a step-by-step launch plan live in
[`LAUNCH/`](LAUNCH/). Posting requires Dave's accounts and his explicit go.

---

## Definition of Done — audit
| # | Item | Status |
|---|------|--------|
| 1 | Real cited data live | ✅ done (aggregate, cited; no fabricated incidents) |
| 2 | Map + legend + geolocation | ✅ done (Leaflet + Carto/OSM, blue me-dot, legend) |
| 3 | SOS + alarms real | ✅ done (WebAudio sirens, anti-abuse flow, same-device notify) |
| 4 | Responder roles + distinct icons | ✅ done (role badges own marker + profile + role select) |
| 5 | Brand palette locked + applied | ✅ done (BRAND.md + `:root`, applied everywhere) |
| 6 | Existing logo used as-is | ✅ done (never regenerated) |
| 7 | 3S © footer on every screen | ✅ done (studio credit + SHOMER™ mini-credit) |
| 8 | i18n fully localises | ✅ done (he/en primary + ar/ru/am/fr) |
| 9 | No console errors on core flows | ✅ verified (onboarding → map, no warns/errors) |
| 10 | "Not a replacement" shown | ✅ done (onboarding + near SOS + footer/legal) |
| 11 | Deployed + verified live | ✅ on deploy |
| 12 | **Real cross-device FCM push** | ⚠️ **GAP** — client receive-side wired & gated; needs Dave's Firebase web config + VAPID key + a one-time Cloud Function sender deploy. A static host cannot send push to other devices. See [`FIREBASE-SETUP.md`](FIREBASE-SETUP.md). |

The cross-device broadcast is honestly labelled **"(simulated)"** in-app until the Firebase
sender is deployed.
