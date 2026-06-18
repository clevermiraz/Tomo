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
      // Hydrate from storage after mount (SSR-safe; avoids hydration mismatch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore unreadable/corrupt storage */
    }
    setLoaded(true);
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
