// SHOMER — push-broadcast Edge Function
//
// Sends a Web Push notification to nearby guardians when a new SOS fires.
// Invoke with the new SOS event payload; it looks up push_subscriptions
// within a bounding box around the SOS and pushes to each.
//
// Required function secrets (set via `supabase secrets set`):
//   VAPID_PUBLIC_KEY   — your VAPID public key
//   VAPID_PRIVATE_KEY  — your VAPID private key
//   VAPID_SUBJECT      — mailto: contact, e.g. mailto:safety@3shamrocks.studio
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const RADIUS_KM = 5; // notify guardians within ~5 km of the SOS

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { record } = await req.json(); // expects { record: <sos_events row> }
    const sos = record ?? (await req.json());
    if (!sos?.id) {
      return new Response(JSON.stringify({ error: "missing SOS record" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") ?? "mailto:safety@3shamrocks.studio",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!,
    );

    // Bounding box (~111 km per degree latitude).
    const dLat = RADIUS_KM / 111;
    const dLng = RADIUS_KM / (111 * Math.cos(((sos.lat ?? 0) * Math.PI) / 180) || 1);

    let query = supabase.from("push_subscriptions").select("*").neq("user_id", sos.user_id);
    if (typeof sos.lat === "number" && typeof sos.lng === "number") {
      query = query
        .gte("lat", sos.lat - dLat).lte("lat", sos.lat + dLat)
        .gte("lng", sos.lng - dLng).lte("lng", sos.lng + dLng);
    }
    const { data: subs, error } = await query;
    if (error) throw error;

    const payload = JSON.stringify({
      title: "🚨 SH✡MER — SOS nearby",
      body: "A guardian near you needs help. Tap to open the map.",
      tag: "sos-" + sos.id,
    });

    const results = await Promise.allSettled(
      (subs ?? []).map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        ).catch(async (err: any) => {
          // Prune dead subscriptions (410 Gone / 404).
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
          throw err;
        })
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return new Response(JSON.stringify({ sent, total: subs?.length ?? 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
