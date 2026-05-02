"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Starts as `null` so the server and the first client
 * render produce identical markup; on mount, reads the actual match and
 * subscribes to changes.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
