/**
 * Copy to config.xai.js (gitignored locally) OR set this inline before script.js:
 *
 *   <script>
 *     window.CCM_XAI_TOKEN_URL = 'https://ccm-xai-session.YOUR_SUBDOMAIN.workers.dev/session';
 *   </script>
 *   <script src="/script.js"></script>
 *
 * The token URL must be the Cloudflare Worker in /workers/xai-session/
 * that holds your XAI_API_KEY as a secret — never the API key itself.
 */
window.CCM_XAI_TOKEN_URL = 'https://ccm-xai-session.YOUR_SUBDOMAIN.workers.dev/session';
window.CCM_XAI_CONFIG = Object.assign({}, window.CCM_XAI_CONFIG || {}, {
  model: 'grok-voice-latest',
  voice: 'eve'
});
