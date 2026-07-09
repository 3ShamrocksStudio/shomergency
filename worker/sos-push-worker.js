/* ════════════════════════════════════════════════════════════════════════════
   SHOMER — FREE SOS PUSH FAN-OUT (Cloudflare Worker, free tier · NO Firebase Blaze)

   Closed/locked-app SOS alerts WITHOUT the paid Firebase plan:
   - The client writes the SOS to RTDB and then POSTs {id} to THIS worker.
   - The worker reads the SOS + every device's FCM token + the sender's pairs from
     RTDB (open rules, via REST), picks recipients (paired OR within 5 km), and sends
     a high-priority FCM Web Push via the FCM HTTP v1 API.
   - The push is delivered to each recipient's service worker `push` event, which fires
     even when SHOMER is backgrounded or the phone is locked.

   SECURITY: the FCM service-account JSON lives ONLY here, as a Cloudflare SECRET
   (env.FCM_SERVICE_ACCOUNT) — never in the client. No billing; Cloudflare free tier.

   Deploy: see worker/README.md  (npx wrangler deploy + wrangler secret put FCM_SERVICE_ACCOUNT)
   ════════════════════════════════════════════════════════════════════════════ */

const DB = 'https://shomergency-default-rtdb.firebaseio.com';
const LINK = 'https://www.shomer-app.co.il/shomer.html';
const ALLOW_ORIGIN = 'https://www.shomer-app.co.il';
const RADIUS_M = 5000;

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, cors);

    let body;
    try { body = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400, cors); }
    const id = body && body.id;
    if (!id || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) return json({ error: 'missing/invalid id' }, 400, cors);

    const sos = await rtdb('/sos/' + id);
    if (!sos || sos.resolved || sos.lat == null) return json({ skipped: 'no active sos' }, 200, cors);

    const [tokens, senderPairs] = await Promise.all([rtdb('/tokens'), rtdb('/pairs/' + sos.uid)]);
    const toks = tokens || {};
    const paired = new Set(senderPairs ? Object.keys(senderPairs) : []);
    const recipients = [];
    for (const uid of Object.keys(toks)) {
      if (uid === sos.uid) continue;
      const t = toks[uid];
      if (!t || !t.token) continue;
      const near = t.lat == null || distM(sos.lat, sos.lng, t.lat, t.lng) <= RADIUS_M;
      if (paired.has(uid) || near) recipients.push(t.token);
    }
    if (!recipients.length) return json({ sent: 0, reason: 'no recipients' }, 200, cors);

    let accessToken, projectId;
    try {
      const sa = JSON.parse(env.FCM_SERVICE_ACCOUNT);
      projectId = sa.project_id;
      accessToken = await getAccessToken(sa);
    } catch (e) {
      return json({ error: 'service account / token error', detail: String(e).slice(0, 120) }, 500, cors);
    }

    const type = sos.type && sos.type !== 'unknown' ? ' · ' + sos.type : '';
    const message = (token) => ({
      message: {
        token,
        notification: { title: '🚨 SHOMER — SOS nearby', body: (sos.name || 'Someone') + ' needs help' + type },
        data: { tag: 'sos-' + id, url: LINK },
        webpush: {
          headers: { Urgency: 'high', TTL: '600' },
          fcmOptions: { link: LINK },
          notification: { requireInteraction: true }
        },
        android: { priority: 'high' },
        apns: { headers: { 'apns-priority': '10' } }
      }
    });

    let sent = 0, failed = 0;
    await Promise.all(recipients.slice(0, 500).map(async (token) => {
      try {
        const r = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify(message(token))
        });
        if (r.ok) sent++; else failed++;
      } catch (e) { failed++; }
    }));
    return json({ sent, failed, recipients: recipients.length }, 200, cors);
  }
};

async function rtdb(path) {
  try { const r = await fetch(DB + path + '.json'); return r.ok ? await r.json() : null; } catch (e) { return null; }
}
function json(o, status, cors) {
  return new Response(JSON.stringify(o), { status, headers: Object.assign({ 'Content-Type': 'application/json' }, cors) });
}
function distM(aLat, aLng, bLat, bLng) {
  const R = 6371000, toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/* ── FCM HTTP v1 OAuth: sign a JWT with the service-account key, exchange for an
   access token. (The legacy server-key API was shut off in 2024, so v1 is required.) */
async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  };
  const enc = (o) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ alg: 'RS256', typ: 'JWT' }) + '.' + enc(claim);
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToBuf(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = unsigned + '.' + b64url(new Uint8Array(sig));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('no access_token: ' + JSON.stringify(d).slice(0, 120));
  return d.access_token;
}
function b64url(bytes) {
  let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pemToBuf(pem) {
  const b = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b); const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
