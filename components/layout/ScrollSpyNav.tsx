"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Anchor = { kind: "anchor"; id: string; label: string };
type Route = { kind: "route"; href: string; label: string };
type Entry = Anchor | Route;

const ENTRIES: Entry[] = [
  { kind: "anchor", id: "cv", label: "CV" },
  { kind: "anchor", id: "tone", label: "Tone" },
  { kind: "anchor", id: "lab", label: "Lab" },
  { kind: "anchor", id: "jd", label: "JD" },
  { kind: "route", href: "/blog", label: "Blog" },
];

/**
 * Minimal nav that mixes in-page anchors and routes.
 *
 * Anchors track which section is in view via IntersectionObserver and
 * underline accordingly. Click → smooth scroll. Routes always render as
 * Next.js Links and underline when usePathname() matches.
 *
 * Cross-page behavior: when the visitor is *not* on `/`, the anchor entries
 * become Links to `/#cv` etc., so clicking takes them to the home page and
 * the browser-native fragment scroll (with scroll-margin-top from
 * styles/globals.css) lands the section under the sticky nav.
 *
 * The `|` separator before the first route distinguishes route nav from
 * section anchors at a glance.
 */
export function ScrollSpyNav() {
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/";
  const anchors = ENTRIES.filter((e): e is Anchor => e.kind === "anchor");
  const [activeAnchor, setActiveAnchor] = useState<string>(anchors[0]?.id ?? "");

  useEffect(() => {
    if (!onHome) return;
    const sectionEls = anchors
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sectionEls.length === 0) return;

    const visible = new Map<string, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry);
          else visible.delete(entry.target.id);
        }
        if (visible.size === 0) return;
        let best: { id: string; top: number } | null = null;
        for (const [id, e] of visible) {
          const top = e.boundingClientRect.top;
          if (best === null || top < best.top) best = { id, top };
        }
        if (best) setActiveAnchor(best.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const el of sectionEls) observer.observe(el);
    return () => observer.disconnect();
  }, [onHome, anchors]);

  const onAnchorJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!onHome) return; // let the Link handle cross-page navigation
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveAnchor(id);
  };

  // Find the index of the first route entry — controls where the `|` lives.
  const firstRouteIdx = ENTRIES.findIndex((e) => e.kind === "route");

  return (
    <nav className="scrollspy-nav" aria-label="Sections">
      {ENTRIES.map((entry, i) => {
        const isFirstRoute = i === firstRouteIdx;
        const isFirst = i === 0;
        const sep = isFirst ? null : isFirstRoute ? (
          <span aria-hidden="true" className="scrollspy-sep" data-kind="route">
            |
          </span>
        ) : (
          <span aria-hidden="true" className="scrollspy-sep">
            ·
          </span>
        );

        if (entry.kind === "anchor") {
          const href = onHome ? `#${entry.id}` : `/#${entry.id}`;
          const active = onHome && activeAnchor === entry.id;
          return (
            <span key={entry.id} className="scrollspy-row">
              {sep}
              <Link
                href={href}
                className="scrollspy-link"
                data-active={active ? "true" : undefined}
                onClick={(e) => onAnchorJump(e, entry.id)}
              >
                {entry.label}
              </Link>
            </span>
          );
        }

        const active = pathname.startsWith(entry.href);
        return (
          <span key={entry.href} className="scrollspy-row">
            {sep}
            <Link
              href={entry.href}
              className="scrollspy-link"
              data-active={active ? "true" : undefined}
            >
              {entry.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
