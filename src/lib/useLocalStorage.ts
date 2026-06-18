"use client";

import { useEffect, useState } from "react";

/**
 * Persists a piece of state to localStorage. SSR-safe: starts from `initial`
 * on the server and first client render, then hydrates from storage in an
 * effect so there's no hydration mismatch.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        const isObj = (v: unknown) => v != null && typeof v === "object" && !Array.isArray(v);
        // Merge stored values over the defaults so newly-added keys keep their
        // default instead of coming back `undefined` (e.g. settings migrations).
        const next =
          isObj(parsed) && isObj(initial)
            ? ({ ...(initial as object), ...(parsed as object) } as T)
            : (parsed as T);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(next);
      }
    } catch {
      /* ignore unreadable/corrupt storage */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable — non-fatal */
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}
