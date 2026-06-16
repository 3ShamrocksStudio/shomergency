/* SHOMER — cloud backend integration (dormant until configured).
 *
 * If window.SHOMER_CONFIG.supabaseUrl is empty, this file is a no-op and the
 * app stays in pure local mode. When configured, it:
 *   • signs the device in anonymously (stable auth.uid per device),
 *   • mirrors reports + SOS events to Supabase,
 *   • subscribes to realtime so other users' reports/SOS appear live,
 *   • registers a web-push subscription for lock-screen SOS alerts.
 *
 * The single-file app calls these hooks (all optional-chained, so they are
 * safe no-ops when this module is dormant):
 *   ShomerBackend.syncReport(rep)
 *   ShomerBackend.broadcastSOS(evt)   -> returns the remote SOS id
 *   ShomerBackend.cancelSOS(remoteId)
 *   ShomerBackend.registerPush()
 *
 * And it calls back INTO the app (defined in shomer.html) when remote data
 * arrives:  window.onRemoteReport(row)  and  window.onRemoteSOS(row).
 */
(function () {
  const cfg = window.SHOMER_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    // Dormant: expose a no-op surface so callers never throw.
    window.ShomerBackend = {
      enabled: false,
      ready: Promise.resolve(false),
      async syncReport() {},
      async broadcastSOS() { return null; },
      async cancelSOS() {},
      async registerPush() {},
    };
    return;
  }

  let sb = null;
  let uid = null;

  async function init() {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    // Anonymous sign-in (stable per device via persisted session).
    let { data: { session } } = await sb.auth.getSession();
    if (!session) {
      const { data, error } = await sb.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }
    uid = session.user.id;

    await hydrate();
    subscribeRealtime();
    return true;
  }

  // Pull recent community data so a fresh open shows the live map.
  async function hydrate() {
    try {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { data: reports } = await sb
        .from("reports").select("*").gte("created_at", since)
        .order("created_at", { ascending: false }).limit(100);
      (reports || []).forEach((r) => safe(window.onRemoteReport, r));

      const { data: sos } = await sb
        .from("sos_events").select("*").eq("status", "active")
        .order("created_at", { ascending: false }).limit(50);
      (sos || []).forEach((s) => safe(window.onRemoteSOS, s));
    } catch (e) { /* non-fatal */ }
  }

  function subscribeRealtime() {
    sb.channel("shomer-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" },
        (p) => { if (p.new.user_id !== uid) safe(window.onRemoteReport, p.new); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sos_events" },
        (p) => { if (p.new.user_id !== uid) safe(window.onRemoteSOS, p.new); })
      .subscribe();
  }

  function safe(fn, arg) { try { typeof fn === "function" && fn(arg); } catch (e) {} }

  const ready = init().catch((e) => { console.warn("[Shomer backend] init failed:", e); return false; });

  window.ShomerBackend = {
    enabled: true,
    ready,

    async syncReport(rep) {
      try {
        await ready; if (!sb) return;
        await sb.from("reports").insert({
          user_id: uid, type: rep.type, description: (rep.desc || "").slice(0, 500),
          lat: rep.lat, lng: rep.lng, anon: !!rep.anon, photo_count: (rep.photos || []).length,
        });
      } catch (e) {}
    },

    async broadcastSOS(evt) {
      try {
        await ready; if (!sb) return null;
        const { data } = await sb.from("sos_events").insert({
          user_id: uid, lat: evt.lat, lng: evt.lng, trigger: evt.trigger || "manual", status: "active",
        }).select("id").single();
        return data?.id || null;
      } catch (e) { return null; }
    },

    async cancelSOS(remoteId) {
      try {
        await ready; if (!sb || !remoteId) return;
        await sb.from("sos_events").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", remoteId);
      } catch (e) {}
    },

    async registerPush() {
      try {
        await ready;
        if (!sb || !cfg.vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          if (Notification.permission === "denied") return;
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8(cfg.vapidPublicKey),
          });
        }
        const json = sub.toJSON();
        await sb.from("push_subscriptions").upsert({
          user_id: uid, endpoint: sub.endpoint,
          p256dh: json.keys.p256dh, auth: json.keys.auth,
          lat: window.userLat, lng: window.userLng, updated_at: new Date().toISOString(),
        }, { onConflict: "endpoint" });
      } catch (e) {}
    },
  };

  function urlB64ToUint8(b64) {
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const base = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }
})();
