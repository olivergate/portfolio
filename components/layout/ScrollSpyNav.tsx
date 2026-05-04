"use client";

import { useEffect, useState } from "react";

const SECTIONS: { id: string; label: string }[] = [
  { id: "cv", label: "CV" },
  { id: "tone", label: "Tone" },
  { id: "lab", label: "Lab" },
  { id: "jd", label: "JD" },
];

/**
 * Minimal scroll-spy nav. Underlines the section currently crossing the
 * middle band of the viewport. Click → smooth scroll to that section.
 *
 * No nav bar / logo / background — just four mono labels separated by `·`.
 * Stays sticky at the top of the page so it's always reachable while
 * scrolling through the long single-page document.
 */
export function ScrollSpyNav() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0]?.id ?? "");

  useEffect(() => {
    const sectionEls = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sectionEls.length === 0) return;

    // Track which sections are intersecting; whichever has the smallest top
    // edge (closest to viewport top) wins. Using the middle-band rootMargin so
    // the active section flips when its content crosses the page midpoint.
    const visible = new Map<string, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick the section whose top is closest to (but not below) the
        // observation band's top edge.
        let best: { id: string; top: number } | null = null;
        for (const [id, e] of visible) {
          const top = e.boundingClientRect.top;
          if (best === null || top < best.top) {
            best = { id, top };
          }
        }
        if (best) setActiveId(best.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const el of sectionEls) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <nav className="scrollspy-nav" aria-label="Sections">
      {SECTIONS.map((s, i) => (
        <span key={s.id} className="scrollspy-row">
          {i > 0 && (
            <span aria-hidden="true" className="scrollspy-sep">
              ·
            </span>
          )}
          <a
            href={`#${s.id}`}
            className="scrollspy-link"
            data-active={activeId === s.id ? "true" : undefined}
            onClick={(e) => onJump(e, s.id)}
          >
            {s.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
