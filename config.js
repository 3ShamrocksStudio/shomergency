/* SHOMER — runtime configuration.
 *
 * Leave these EMPTY and the app runs exactly as today: a fully working,
 * local-only PWA (single device, no cloud). Fill them in and the app
 * lights up REAL multi-user mode: live community reports, live SOS to
 * nearby guardians, and web-push alerts.
 *
 * All three values are PUBLIC and safe to commit:
 *   - supabaseUrl / supabaseAnonKey come from your Supabase project
 *     (Project Settings → API). The anon key is meant for browsers.
 *   - vapidPublicKey is the public half of your web-push VAPID key pair.
 *
 * See BACKEND_SETUP.md for the 5-minute setup.
 */
window.SHOMER_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcd1234.supabase.co"
  supabaseAnonKey: "",  // e.g. "eyJhbGciOi..."
  vapidPublicKey: "",   // e.g. "BNc...."  (public VAPID key, base64url)
};
