"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { RethemeFab } from "@/components/controls/RethemeFab";
import { RevealObserver } from "@/components/controls/RevealObserver";
import { StyleApplier } from "@/components/controls/StyleApplier";
import { StyleContext } from "@/components/controls/style-context";
import { useLocalStorageState } from "@/lib/local-storage-state";
import { DEFAULT_STYLE, type StyleState } from "@/lib/style-tokens";

type Props = { children: React.ReactNode };

/**
 * The rethemer FAB and the slider tokens it drives belong to the consolidated
 * single-page document on `/` only. /game stays its own route (ADR-0028) and
 * doesn't need the rethemer; on that path we render plain.
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

  const setAxis = useCallback(
    (axis: keyof StyleState, value: number) => {
      setState((prev) => ({ ...prev, [axis]: value }));
    },
    [setState],
  );

  const reset = useCallback(() => setState(DEFAULT_STYLE), [setState]);

  return (
    <StyleContext.Provider value={{ state, setState, setAxis, reset, activeKey, setActiveKey }}>
      <StyleApplier />
      <RevealObserver />
      {children}
      <RethemeFab />
    </StyleContext.Provider>
  );
}
