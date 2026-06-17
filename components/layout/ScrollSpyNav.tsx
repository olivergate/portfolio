"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Anchor = { kind: "anchor"; id: string; label: string };
type Route = { kind: "route"; href: string; label: string; external?: boolean };
type Entry = Anchor | Route;

const ENTRIES: Entry[] = [
  { kind: "anchor", id: "cv", label: "CV" },
  { kind: "anchor", id: "projects", label: "Projects" },
  { kind: "anchor", id: "jd", label: "JD" },
  { kind: "anchor", id: "tone", label: "Tone" },
  {
    kind: "route",
    href: "https://owasp-tester.vercel.app",
    label: "OWASP Trainer",
    external: true,
  },
  { kind: "route", href: "/blog", label: "Blog" },
];

// Hoisted to module scope so the IntersectionObserver effect doesn't tear
// down + rebuild on every parent re-render (the array ref was previously
// new each render → unstable dep → observer churn on pathname changes).
const ANCHORS = ENTRIES.filter((e): e is Anchor => e.kind === "anchor");

/**
 * Minimal nav that mixes in-page anchors and routes.
 *
 * Anchors track which section is in view via IntersectionObserver and
 * underline accordingly. Click → smooth scroll. Internal routes render as
 * Next.js Links and underline when usePathname() matches; external routes
 * render as plain anchors that open in a new tab.
 *
 * Cross-page behavior: when the visitor is *not* on `/`, the anchor entries
 * become Links to `/#cv` etc., so clicking takes them to the home page and
 * the browser-native fragment scroll (with scroll-margin-top from
 * styles/globals.css) lands the section under the sticky nav.
 *
 * A `|` separator precedes each route (vs `·` between anchors), so standalone
 * destinations read as a distinct group from the in-page section anchors —
 * "… Tone | OWASP Trainer | Blog". The OWASP Trainer route is external (the
 * live demo) and opens in a new tab.
 */
export function ScrollSpyNav() {
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/";
  const [activeAnchor, setActiveAnchor] = useState<string>(ANCHORS[0]?.id ?? "");

  useEffect(() => {
    if (!onHome) return;
    const sectionEls = ANCHORS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sectionEls.length === 0) return;

    const visible = new Map<string, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry);
          else visible.delete(entry.target.id);
        }
        if (visible.size === 0) return;
        // Prefer the innermost visible section. #projects is the CV's 06
        // section, nested inside #cv — without this the enveloping #cv (whose
        // top sits far above the viewport) always wins on min-top and the
        // Projects label never lights. Skip any section that contains another
        // visible section (i.e. an ancestor), then pick the topmost of the rest.
        let best: { id: string; top: number } | null = null;
        for (const [id, e] of visible) {
          const el = document.getElementById(id);
          const isAncestor =
            el !== null &&
            [...visible.keys()].some((other) => {
              if (other === id) return false;
              const otherEl = document.getElementById(other);
              return otherEl !== null && el.contains(otherEl);
            });
          if (isAncestor) continue;
          const top = e.boundingClientRect.top;
          if (best === null || top < best.top) best = { id, top };
        }
        if (best) setActiveAnchor(best.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const el of sectionEls) observer.observe(el);
    return () => observer.disconnect();
  }, [onHome]);

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

  return (
    <nav className="scrollspy-nav" aria-label="Sections">
      {ENTRIES.map((entry, i) => {
        // Anchors are joined by `·`; every route gets a `|` before it, so the
        // route group reads "… Tone | OWASP Trainer | Blog" — a clear break
        // between in-page sections and standalone destinations.
        const sep =
          i === 0 ? null : entry.kind === "route" ? (
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

        // External routes open in a new tab and never reflect active state.
        if (entry.external) {
          return (
            <span key={entry.href} className="scrollspy-row">
              {sep}
              <a
                href={entry.href}
                className="scrollspy-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {entry.label}
                <span aria-hidden="true" className="scrollspy-ext">
                  ↗
                </span>
              </a>
            </span>
          );
        }

        // Match the route exactly or a sub-path — `/blog` shouldn't shadow `/blogfoo`.
        const active = pathname === entry.href || pathname.startsWith(`${entry.href}/`);
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
