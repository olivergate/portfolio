"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The "4 axes · ∞ settings" copy describes the rethemer FAB which only mounts
 * on `/` (DeckProvider bails for non-home routes — see `components/controls/
 * DeckProvider.tsx`). Showing it on `/game`, `/blog`, etc. reads as a dead
 * promise, so we conditionally render that line on home only.
 *
 * The Accessibility link is always shown — per Phase 4.5, the conformance
 * statement lives at `/accessibility` and should be discoverable from every
 * page footer (the conventional placement third parties look for).
 */
export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer
      style={{
        marginTop: "var(--gap-section)",
        paddingTop: "var(--gap-block)",
        paddingBottom: "var(--gap-section)",
        borderTop: "var(--rule-weight) solid var(--rule)",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem 2rem",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
      }}
    >
      <span>© Oliver Kaikane Gate</span>
      <Link href="/accessibility" style={{ color: "inherit" }}>
        Accessibility
      </Link>
      <span>last revised — May 2026</span>
      {isHome && <span>4 axes · ∞ settings</span>}
    </footer>
  );
}
