import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {/* PWA Meta Tags */}
      <meta name="application-name" content="Car Rental App" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="CarRental" />
      <meta name="description" content="Ứng dụng thuê xe trực tuyến - Đặt xe dễ dàng, nhanh chóng và an toàn" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/icons/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#3b82f6" />

      <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://car-rental-app.com" />
      <meta name="twitter:title" content="Car Rental App" />
      <meta name="twitter:description" content="Ứng dụng thuê xe trực tuyến - Đặt xe dễ dàng, nhanh chóng và an toàn" />
      <meta name="twitter:image" content="https://car-rental-app.com/icons/icon-192x192.png" />
      <meta name="twitter:creator" content="@carrental" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Car Rental App" />
      <meta property="og:description" content="Ứng dụng thuê xe trực tuyến - Đặt xe dễ dàng, nhanh chóng và an toàn" />
      <meta property="og:site_name" content="Car Rental App" />
      <meta property="og:url" content="https://car-rental-app.com" />
      <meta property="og:image" content="https://car-rental-app.com/icons/icon-192x192.png" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
