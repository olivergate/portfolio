"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MobileSheet } from "@/components/controls/MobileSheet";
import { RevealObserver } from "@/components/controls/RevealObserver";
import { ShareToast } from "@/components/controls/ShareToast";
import { SliderDeck } from "@/components/controls/SliderDeck";
import { StyleApplier } from "@/components/controls/StyleApplier";
import { StyleContext } from "@/components/controls/style-context";
import { shareUrl, useHashState } from "@/lib/hash-state";
import { DEFAULT_STYLE, type StyleState } from "@/lib/style-tokens";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = { children: React.ReactNode };

const DESKTOP_QUERY = "(min-width: 1025px)";

export function DeckProvider({ children }: Props) {
  const [state, setState] = useHashState();
  const [activeKey, setActiveKey] = useState<keyof StyleState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deckSlot, setDeckSlot] = useState<HTMLElement | null>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending toast timer on unmount so we don't setState on an
  // unmounted provider.
  useEffect(
    () => () => {
      if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    },
    [],
  );

  // Locate the desktop deck-slot rendered by the server layout.
  useEffect(() => {
    setDeckSlot(document.querySelector<HTMLElement>(".deck-slot"));
  }, []);

  const setAxis = useCallback(
    (axis: keyof StyleState, value: number) => {
      setState((prev) => ({ ...prev, [axis]: value }));
    },
    [setState],
  );

  const reset = useCallback(() => setState(DEFAULT_STYLE), [setState]);

  const share = useCallback(async () => {
    const url = shareUrl(state);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setToast("link copied — paste anywhere");
      } else {
        window.location.hash = url.split("#")[1] ?? "";
        setToast("URL updated — copy from address bar");
      }
    } catch {
      window.location.hash = url.split("#")[1] ?? "";
      setToast("URL updated — copy from address bar");
    }
    // Clear any prior dismiss timer so back-to-back shares don't race
    // (the second share's toast would otherwise vanish on the first timer).
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, [state]);

  // Mount the SliderDeck in exactly one place. While `isDesktop` is null
  // (pre-mount / SSR), we render nothing — the desktop slot is a tiny visual
  // gap until JS settles, which is fine.
  const showDesktopDeck = isDesktop === true && deckSlot !== null;
  const showMobileDeck = isDesktop === false;

  return (
    <StyleContext.Provider
      value={{ state, setState, setAxis, reset, share, activeKey, setActiveKey }}
    >
      <StyleApplier />
      <RevealObserver />
      {children}
      {showDesktopDeck && deckSlot ? createPortal(<SliderDeck />, deckSlot) : null}
      {showMobileDeck ? <MobileSheet /> : null}
      <ShareToast message={toast} />
    </StyleContext.Provider>
  );
}
