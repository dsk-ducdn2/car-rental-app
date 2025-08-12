import { component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import ThemeToggle from "./components/ThemeToggle";

import "./global.css";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
        <script dangerouslySetInnerHTML={`(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s? s==='dark' : m; if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`}></script>
      </head>
      <body lang="en">
        <RouterOutlet />
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        {/* Floating theme toggle for global access */}
        <div class="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </body>
    </QwikCityProvider>
  );
});
