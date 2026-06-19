// Configures a proxy-aware global fetch dispatcher when running behind a
// corporate HTTP proxy (detected via HTTPS_PROXY/HTTP_PROXY env vars).
// On platforms without a proxy (e.g. Vercel), this is a no-op, so the code
// stays portable.
let configured = false;

export function ensureProxy(): void {
  if (configured) return;
  configured = true;

  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  if (!proxyUrl) return;

  try {
    // Lazy require so bundlers don't choke when undici isn't needed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ProxyAgent, setGlobalDispatcher } = require("undici");
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
  } catch {
    // undici unavailable — leave default dispatcher in place.
  }
}
