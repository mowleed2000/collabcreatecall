/**
 * Cloudflare Worker — mints short-lived xAI Realtime client secrets.
 *
 * Deploy:
 *   1. Create a Worker in the Cloudflare dashboard (or wrangler)
 *   2. Set secret: XAI_API_KEY = your key from https://console.x.ai
 *   3. Optional: set ALLOWED_ORIGIN to https://collabcreatemarketing.com
 *   4. Point the site at this Worker URL:
 *        window.CCM_XAI_TOKEN_URL = 'https://YOUR_WORKER.workers.dev/session'
 *
 * Never put XAI_API_KEY in frontend JavaScript or GitHub Pages.
 */

const XAI_CLIENT_SECRETS_URL = 'https://api.x.ai/v1/realtime/client_secrets';

function corsHeaders(origin, allowedOrigin) {
  const allow =
    !allowedOrigin || allowedOrigin === '*'
      ? origin || '*'
      : origin && allowedOrigin.split(',').map((s) => s.trim()).includes(origin)
        ? origin
        : allowedOrigin.split(',')[0].trim();

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const headers = {
      ...corsHeaders(origin, allowedOrigin),
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || (url.pathname !== '/' && url.pathname !== '/session')) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    }

    if (!env.XAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'XAI_API_KEY is not configured on the worker' }), {
        status: 500,
        headers
      });
    }

    try {
      const upstream = await fetch(XAI_CLIENT_SECRETS_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + env.XAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expires_after: { seconds: 300 }
        })
      });

      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to mint ephemeral token' }), {
        status: 502,
        headers
      });
    }
  }
};
