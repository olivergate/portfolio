"use client";

import { createContext, useContext } from "react";
import type { CVTone } from "@/lib/schemas";

export type ToneContextValue = {
  tone: CVTone;
  setTone: (next: CVTone) => void;
};

export const ToneContext = createContext<ToneContextValue>({
  tone: "honest",
  setTone: () => {},
});

export function useTone(): ToneContextValue {
  return useContext(ToneContext);
}
