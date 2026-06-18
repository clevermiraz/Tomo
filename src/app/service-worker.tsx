"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes the app installable and
 * available offline. Kept intentionally minimal — no push notifications.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          /* registration failed — app still works, just not offline */
        });
    }
  }, []);

  return null;
}
