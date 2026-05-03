"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MobileSheet } from "@/components/controls/MobileSheet";
import { RevealObserver } from "@/components/controls/RevealObserver";
import { SliderDeck } from "@/components/controls/SliderDeck";
import { StyleApplier } from "@/components/controls/StyleApplier";
import { StyleContext } from "@/components/controls/style-context";
import { useLocalStorageState } from "@/lib/local-storage-state";
import { DEFAULT_STYLE, type StyleState } from "@/lib/style-tokens";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = { children: React.ReactNode };

const DESKTOP_QUERY = "(min-width: 1025px)";

/**
 * The slider deck retunes the main CV (`/`) — it has no purpose on /jd, /tone,
 * /lab, /game. On those routes we render children plain: no deck UI, no
 * StyleApplier (so the URL hash from a stale `/` link doesn't bleed styles
 * onto a different page), no mobile sheet, no hidden hydration cost.
 *
 * Kept inside DeckProvider rather than scoping in the layout because the
 * layout is a server component and pathname-conditioning is cleanest as a
 * client-side bail.
 */
function isHomeRoute(pathname: string | null): boolean {
  return pathname === "/";
}

export function DeckProvider({ children }: Props) {
  const pathname = usePathname();
  if (!isHomeRoute(pathname)) {
    return <>{children}</>;
  }
  return <DeckProviderInner>{children}</DeckProviderInner>;
}

function DeckProviderInner({ children }: Props) {
  const [state, setState] = useLocalStorageState();
  const [activeKey, setActiveKey] = useState<keyof StyleState | null>(null);
  const [deckSlot, setDeckSlot] = useState<HTMLElement | null>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

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

  // Mount the SliderDeck in exactly one place. While `isDesktop` is null
  // (pre-mount / SSR), we render nothing — the desktop slot is a tiny visual
  // gap until JS settles, which is fine.
  const showDesktopDeck = isDesktop === true && deckSlot !== null;
  const showMobileDeck = isDesktop === false;

  return (
    <StyleContext.Provider value={{ state, setState, setAxis, reset, activeKey, setActiveKey }}>
      <StyleApplier />
      <RevealObserver />
      {children}
      {showDesktopDeck && deckSlot ? createPortal(<SliderDeck />, deckSlot) : null}
      {showMobileDeck ? <MobileSheet /> : null}
    </StyleContext.Provider>
  );
}
