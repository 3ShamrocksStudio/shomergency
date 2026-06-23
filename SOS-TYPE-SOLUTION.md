# SH✡MER — SOS emergency-type classification (solution writeup)

**Problem:** an SOS with no event type is far less actionable. We need (a) fast self-
classification that NEVER delays the SOS, (b) an incapacitated-user fallback so others can
define/confirm the type, and (c) real-time propagation of the type to nearby users.

## Research — patterns that actually work
- **United Hatzalah** — every case is classified by its *chief complaint*, which then drives
  automated routing to the nearest *appropriately-certified* responder. → Type is the key that
  makes a dispatch actionable; it should map to responder roles.
- **Citizen** — events are color-coded on a live map (active vs resolved), each alert carries
  *nature + precise location + advice*, and classification is curated/AI-assisted, not a free-
  for-all. → Lifecycle + live updates + a curated, abuse-resistant classification.
- **Noonlight** — hold-and-release + PIN; failure to cancel silently escalates. → The alarm/
  SOS fires FIRST; everything else is metadata layered on top. (SH✡MER already does this.)
- **RapidSOS** — emergency *type* and context ride along as "additional data" attached to the
  call. → Type is metadata on the SOS, not a precondition for it.
- **what3words** — a precise, easy-to-communicate location. → Future: attach a precise-location
  string to the event (nice-to-have).
- **Crowdsourced-verification research** — trust scores, consensus thresholds, and *corroboration
  when reporter-trust is low*; the unavoidable speed-vs-accuracy tension. → Community typing must
  be trust-weighted with an owner-override, never a single stranger's say-so.

## Options considered (per requirement)

**A. Fast self-classification (SOS must fire first):**
1. Pre-SOS type picker — ❌ blocks the SOS, fails the hard rule.
2. SOS fires → **type picker appears on the live SOS screen**, one-tap, optional, re-editable — ✅.
3. Long-press SOS to pick type — ❌ slows the panic press, easy to fumble.
→ **Chosen: #2.** SOS broadcasts immediately as **Unknown**; a glanceable one-tap type row sits
on the active-SOS screen. Tapping attaches/updates the type in <1s; ignoring it is fine.

**B. Incapacitated-user fallback (who may classify someone else's SOS):**
1. Anyone nearby edits the type directly — ❌ trivially abused.
2. Nearby users + the owner's guardians **suggest** a type; suggestions are **trust-weighted**;
   promotion needs consensus (≥2 corroborating) **or** one **verified responder** (medic/police/
   fire role) — ✅.
3. Only guardians may classify — ✅ safe but slow if no guardian is near.
→ **Chosen: #2, with #3 as the privileged fast-path** (a guardian or verified responder counts
as authoritative). Owner self-classification always outranks community.

**C. Real-time propagation:**
1. Poll — ❌ laggy. 2. **Push/real-time DB**: each type/state change fans out to everyone in the
event's alert radius (+ guardians); their map pin + alert card update instantly — ✅.
→ **Chosen: #2** (needs backend — see honesty note).

## Pressure-test
- **False/malicious type** — owner self-classify is authoritative; others only *suggest*; a
  suggestion changes the shown type only on trust-weighted consensus or a verified responder.
  Per-user suggestion rate-limit; suggestions decay if uncorroborated.
- **Conflicting types** — priority: **owner > verified responder > weighted community consensus**;
  with no consensus the event stays **Unknown** (never a coin-flip guess). Confidence is shown.
- **Latency** — the SOS never waits for type; type is async metadata, local-first.
- **Privacy** — only users within the event's alert radius (+ the owner's guardians) can see or
  suggest a type; classifier identity is shown as a **role**, never PII.
- **Liability/safety** — classification is framed as *"help describe the situation"*, never *"go
  respond."* The app never instructs a civilian to intervene; the **augments-not-replaces /
  100·101·102** banner stays on the SOS screen. Community input adds context only.
- **Unknown state** — a first-class, neutral state ("Type unknown — awaiting classification"),
  preferred over a wrong guess.
- **Abuse** — trust scoring + daily SOS rate-limit + consensus thresholds + owner override.

## Recommended solution — event lifecycle + data model
```
triggered ─▶ active+UNCLASSIFIED ─▶ self-classified ─┐
                     │                                ├─▶ verified ─▶ resolved
                     └▶ community-suggested ──────────┘   (reclassifiable at any state)
```
Event record (SS.sosHistory[i] / broadcast payload):
```
{ id, ts, lat, lng, trigger,
  type: 'unknown'|'viol'|'med'|'sex'|'stalk'|'fire'|'new',
  typeState: 'unclassified'|'self'|'community'|'verified',
  classifiedBy: 'owner'|'responder:medic'|'guardian'|'community',
  suggestions: [{by, role, type, ts, trustWeight}],   // for consensus
  resolution, broadcast, rateLimited }
```
- **Self-classify** sets `type`, `typeState='self'`, `classifiedBy='owner'` — authoritative.
- **Suggestions** accumulate; a tally reaching the consensus rule promotes to
  `typeState='community'`; a verified-responder suggestion promotes to `'verified'`.
- Every change re-renders the **SOS map pin glyph** (red urgent pin now carries the *type* icon),
  the **alert card** (type + who classified + confidence), and **fans out** to nearby users.

## Honesty note — what needs a backend
- **Fully implemented now (no backend):** owner fast self-classification, the Unknown state, the
  full lifecycle + reclassification, the type-driven SOS pin + alert card + SOS history, and
  cross-*window* live updates (same device/browser).
- **Needs the real-time backend (Firestore/RTDB + FCM — the already-documented gap):** other
  *devices* seeing your event and submitting suggestions, and the real-time fan-out of type
  changes across devices. This is built against the data model above and runs in the **local
  simulation** (clearly labelled "simulated") until Dave provisions Firebase (see
  `FIREBASE-SETUP.md`). What Dave must provide: Firebase project + Firestore/RTDB + FCM config.
