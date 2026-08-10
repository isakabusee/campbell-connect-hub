/**
 * Guarded service-worker registration.
 * Only registers in the published production app — never in dev, iframes,
 * or Lovable preview hosts. Supports `?sw=off` as a kill switch.
 */
const SW_URL = "/sw.js";

function isPreviewHost(hostname: string) {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((r) => (r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || "").endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const inIframe = window.self !== window.top;
  const swOff = new URLSearchParams(window.location.search).get("sw") === "off";
  const refuse =
    !import.meta.env.PROD || inIframe || swOff || isPreviewHost(window.location.hostname);

  if (refuse) {
    void unregisterAppWorkers();
    return;
  }

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(SW_URL).catch(() => {
      /* offline caching is a progressive enhancement */
    });
  });
}
