# SH✡MER — Revisions batch (2026-06-24)

Single thorough pass. Test EVERY item at mobile **390×844 + 360×640**, screenshot each.
**No dev/debug/status text anywhere** — users see nothing internal. Terminology: **SHOMER only**
(replace "guardian"/other terms). Cohesive with the 3S Design System.

## Assets (BRAND/)
- `BRAND/SVG/SHOMER.APP_WHITE.svg` — white logo → **map header** (replaces the shield IMAGE).
- `BRAND/SVG/SHOMER.APP.svg` — colour variant.
- `SHOMER_logo_big.png` — shield image → **SOS message screen** (top, large/clear).
- `3shamrocks.png` — 3S studio logo → **footer** (replace the text, very small).

## Items
1. **Onboarding** — overcorrected/"stuffed" at top. Lay out professionally + balanced (vertical
   rhythm, centred), still no scroll but *designed*, not cramped.
2. **Map screen** —
   - White SHOMER SVG in the header (replace shield image).
   - Legend → **top-left**; **remove** the "סקירת בטיחות / statistical overview" banner (legend takes it).
   - SOS button fully clear of the bottom dark gradient + prominent.
   - ALL map control icons → **circular** frames (no rounded-rects); top menu buttons framed too.
   - Icons **colourful** (semantic event palette), not gold.
3. **Dropdown menu** — icons larger/clearer, **no frame**, colourful differentiation;
   **Emergency numbers** row = **red** background.
4. **Connect a SHOMER** — SHOMER-in-context, less text. **Strip ALL dev/status text** app-wide
   ("real now / backend / native phase" etc.).
5. **Profile** — **remove "guardian level"** (vanity gamification). SHOMER terminology only.
6. **Footer (all screens)** — 3S **logo image** (white-text), VERY small (replaces the text).
7. **Settings** — minimise text, fewer frames, more spacing, stronger branded language, less scroll.
8. **Global** — break monotone dark-blue: alternate **dark + light** sections / light surfaces.
9. **Sounds (new)** — feedback on: a new SHOMER joins nearby · a new event · an event update.
   Tie to live realtime events.
10. **Event response** — nearby SHOMERs see a **pulsing red dot + shortest path** to an EVENT
   (not just SOS). Locked phone blink = native-only (flag); do the in-app version. SOS screen:
   shield IMAGE logo on top, large/clear.
11. **Landing page** — apply the full 3S Design System branding (logos, colours, icons, fonts,
   typography, messaging, imagery, tone) — cohesive with the app.

## Honest constraints
- Locked-screen blink / fully-closed control needs the **native (Capacitor)** build — web PWA
  can't; in-app version done + flagged.
- Real SMS / closed-app push = Firebase (already wired; deploy rules+functions via CLI).
