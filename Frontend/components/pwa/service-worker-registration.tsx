"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability just degrades to "open in browser" -- not worth surfacing to the user.
      });
    }
  }, []);

  return null;
}
