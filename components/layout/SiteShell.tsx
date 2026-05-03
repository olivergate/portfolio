"use client";

import { usePathname } from "next/navigation";

/**
 * Pathname-aware site wrapper.
 *
 * On `/`, renders the two-column `site-shell` grid: a sticky `deck-slot` aside
 * (where DeckProvider portals the slider deck) plus the main content column.
 *
 * On every other route (`/jd`, `/tone`, `/lab`, `/game`), the slider deck
 * isn't useful — the page has its own controls or none at all. We render the
 * content full-width, no grid, no empty aside taking 380px.
 */
type Props = { children: React.ReactNode };

export function SiteShell({ children }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <div className="site-shell">
        <aside className="deck-slot" aria-label="Style controls" />
        <div className="site-content">{children}</div>
      </div>
    );
  }

  return <div className="site-content site-content--solo">{children}</div>;
}
