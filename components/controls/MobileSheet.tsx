"use client";

import { useEffect, useRef, useState } from "react";
import { SliderDeck } from "@/components/controls/SliderDeck";

/**
 * Mobile-only floating button that opens the slider deck as a bottom sheet.
 * Visible only below 1024px (CSS-controlled). On desktop the deck is rendered
 * directly into the layout's `.deck-slot` aside.
 */
export function MobileSheet() {
  const [open, setOpen] = useState(false);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  return (
    <div className="mobile-sheet-root">
      <button
        type="button"
        className="mobile-sheet-fab deck-mono"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-sheet-panel"
        aria-label="Open style controls"
      >
        ◐ STYLE
      </button>

      {open && (
        <button
          type="button"
          className="mobile-sheet-backdrop"
          aria-label="Close style controls"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        id="mobile-sheet-panel"
        ref={sheetRef}
        className={`mobile-sheet-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="Style controls"
        tabIndex={-1}
      >
        <button
          type="button"
          className="mobile-sheet-handle"
          onClick={() => setOpen(false)}
          aria-label="Close"
        />
        <div className="mobile-sheet-body">
          <SliderDeck />
        </div>
      </div>
    </div>
  );
}
