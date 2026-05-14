"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * On client-side route change, move focus to <main id="main">. Next.js's
 * built-in route announcer reads the new <title> + <h1>, but does not move
 * focus, so a screen-reader user staying on the page across navigations would
 * stay on the previous activation point (often the nav). Moving focus to the
 * landmark gives them an unambiguous "you are here" anchor for the new page.
 *
 * Skips the first render (so initial page load doesn't steal focus from
 * whatever the user was already interacting with — typically nothing on
 * first paint, but the principle holds) and ignores pure hash changes
 * (in-page anchor navigation already moves focus to the target).
 */
export function MainFocus() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const main = document.getElementById("main");
    if (main) {
      main.focus({ preventScroll: false });
    }
  }, [pathname]);

  return null;
}
