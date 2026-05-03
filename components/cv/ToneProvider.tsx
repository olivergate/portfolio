"use client";

import { useCallback, useState } from "react";
import { ToneContext } from "@/components/cv/tone-context";
import type { CVTone } from "@/lib/schemas";

type Props = { children: React.ReactNode };

export function ToneProvider({ children }: Props) {
  const [tone, setToneState] = useState<CVTone>("honest");
  const setTone = useCallback((next: CVTone) => setToneState(next), []);
  return <ToneContext.Provider value={{ tone, setTone }}>{children}</ToneContext.Provider>;
}
