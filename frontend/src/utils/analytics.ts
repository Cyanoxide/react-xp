/**
 * Umami, injected at runtime and only when a website ID was built in.
 *
 * The ID comes from `.env.production.local`, which is gitignored, so a clone or
 * a fork gets no script tag, no request and no ID — analytics are simply absent
 * rather than broken or pointed at someone else's account. See `.env.example`.
 *
 * `.env.production.local` is read by `vite build` and never by `vite dev`, so
 * working locally cannot put localhost traffic in the stats. The `PROD` guard
 * says the same thing twice, in case the value is ever put in a file the dev
 * server does read.
 *
 * Umami is cookieless, which is why there is no consent banner in the app.
 * Anything added here that sets a cookie changes that.
 */
const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

export function initAnalytics() {
    if (!websiteId || !import.meta.env.PROD) return;

    const script = document.createElement('script');
    script.src = 'https://cloud.umami.is/script.js';
    // The tracker reads its configuration off `document.currentScript`, so the
    // attributes have to be set before it is appended, and it has to stay a
    // classic script — as a module `currentScript` is null and it gives up
    // without a word. For the same reason there is no `data-host-url`: absent,
    // it defaults to Umami Cloud's own endpoint.
    script.setAttribute('data-website-id', websiteId);
    document.head.appendChild(script);
}
