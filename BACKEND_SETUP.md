# SHOMER — Backend Setup (turn on real multi-user mode)

The app ships **fully working in local mode** with no setup. This guide flips
on the real cloud backend: live community reports, live SOS to nearby
guardians, and lock-screen push alerts.

Everything in code is done. You only do the account steps below (~10 min, free tier).

---

## What you do (only you can — it needs your account)

### 1. Create a free Supabase project
1. Go to https://supabase.com → **New project** (free tier is fine).
2. After it provisions, open **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (the long `eyJ...` one — safe for browsers)

### 2. Enable anonymous sign-in
- **Authentication → Providers → Anonymous** → toggle **ON**.
  (Each device gets a stable identity without asking users to register.)

### 3. Create the database tables
- **SQL Editor → New query** → paste the contents of
  `supabase/migrations/0001_init.sql` → **Run**.
  (Creates the tables, Row-Level Security, and realtime — all in one go.)

### 4. Paste your keys into the app
- Edit `config.js` and fill in:
  ```js
  window.SHOMER_CONFIG = {
    supabaseUrl: "https://abcd1234.supabase.co",
    supabaseAnonKey: "eyJhbGciOi...",
    vapidPublicKey: "",   // fill after step 5 (optional, for push)
  };
  ```
- Commit + push. That alone turns on **live reports + live SOS map**.

### 5. (Optional) Lock-screen push alerts
Push needs a VAPID key pair and the edge function deployed.

1. Generate keys (any machine with Node):
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copy the **public** key into `config.js` → `vapidPublicKey`.
2. Install the Supabase CLI and deploy the function:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy push-broadcast
   supabase secrets set \
     VAPID_PUBLIC_KEY=<public> \
     VAPID_PRIVATE_KEY=<private> \
     VAPID_SUBJECT=mailto:safety@3shamrocks.studio
   ```
3. Fire it automatically on every new SOS — **Database → Webhooks → Create**:
   - Table: `sos_events`, Events: **Insert**
   - Type: **Supabase Edge Function** → `push-broadcast`

---

## What's already built (code complete)

| Piece | File | Status |
|------|------|--------|
| DB schema + RLS + realtime | `supabase/migrations/0001_init.sql` | ✅ |
| Push edge function (VAPID web-push) | `supabase/functions/push-broadcast/index.ts` | ✅ |
| Client sync + anon auth + realtime | `backend.js` | ✅ |
| App hooks (SOS / reports / push) | `shomer.html` | ✅ |
| Runtime config (public keys) | `config.js` | ✅ (empty = local mode) |
| Offline caching of new files | `sw.js` | ✅ |

## Safe by design
- **Empty `config.js` = today's exact local-only app.** No behavior changes
  until keys are present, so the live site never breaks while you set this up.
- The anon key and VAPID **public** key are meant to be public — committing
  them is fine. **Never** commit the VAPID *private* key or the service-role
  key (those live only in Supabase function secrets).
- Row-Level Security: a device can only write its own reports/SOS/push rows;
  the safety map is readable by signed-in devices.

## Known follow-ups (tracked in Linear)
- Proximity push currently needs the reporter's location stored on their push
  subscription; without location a device won't match the SOS radius.
- Photos still stay on-device (thumbnails only) — cloud Storage upload is a
  later milestone.
