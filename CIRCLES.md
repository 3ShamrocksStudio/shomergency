# Circles — Live Location Sharing

**Status in this build: LOCAL SIMULATION ONLY.**

The Circles feature in the Shomer PWA ships the **full UX** — create circles, add
members, per-member privacy (mutual / one-way), ghost mode, a live map of pulsing
member dots, member-SOS ripple alerts, and the "Find a Friend" radar-ping fly-to.
Everything you see and tap is real product UX.

What is **simulated** (clearly labeled in-app): the member **positions** and their
movement. They are generated client-side and persisted in `localStorage`
(`shomer_state_v1` → `circles`, `circleMembers`, `circleGhost`). There is **no**
real other phone, no server, and no real cross-device tracking.

## Why a PWA cannot do the real thing

A Progressive Web App **cannot** provide reliable always-on, background,
cross-device location sharing:

- **No dependable background geolocation.** Browsers suspend/kill background tabs;
  `navigator.geolocation` only runs while the page is foregrounded and awake. iOS
  Safari is especially aggressive. You cannot track a friend whose phone is in
  their pocket with the app closed.
- **No real-time fan-out.** Sharing A→B needs a server to relay positions; a static
  PWA has no backend and no accounts to bind people together.
- **No verified identity / consent.** "Mom can see me" must be enforced somewhere
  trustworthy — the client cannot be the authority.

So we built the complete experience now and simulate the data, rather than fake
real tracking that would silently fail in the field.

## What the native + backend phase must implement

1. **Accounts & verified invites** — real identities; invite-by-link/QR/phone with
   explicit accept. A member only joins a circle after consenting.
2. **Live-location backend** — a service (WebSocket / MQTT / push) that relays each
   member's position to exactly the people they've authorized, with presence
   (online/offline, last-seen) and rate limiting.
3. **Native background location** — iOS `CLLocationManager` "Always" authorization +
   significant-location / region monitoring; Android foreground-service location.
   This is the core capability a PWA lacks. Wrap the web UI (Capacitor / native
   shell) or go fully native.
4. **Per-member privacy, server-enforced** — the `shareTo` / `seeThem` matrix and
   ghost mode must be authoritative on the server, not just the client. Never send
   B's coordinates to A unless the server has a stored grant.
5. **End-to-end encryption** of location payloads; minimize retention; clear audit &
   revocation ("stop sharing" takes effect immediately, server-side).
6. **Member-SOS fan-out** — when a member triggers SOS, the server pushes a
   high-priority alert + their live track to every circle member (overriding normal
   privacy for the duration of the emergency), mirroring the in-app ripple.
7. **Battery & abuse controls** — adaptive update cadence, geofencing, and
   protections against stalking/coercion (e.g. tamper-evident "sharing paused").

## Client data shape (current simulation)

```
SS.circles        = [{ id, name, type:'family'|'friends' }]
SS.circleMembers  = [{ id, cid, name, rel, emoji, color,
                       lat, lng, baseLat, baseLng, moving,
                       shareTo,   // I share MY location with them
                       seeThem,   // I can see THEIR location
                       sos, seed }]
SS.circleGhost    = false   // pause all my outgoing sharing
```

In the native build these become server-side records keyed to authenticated
accounts; the client keeps only a cache.
