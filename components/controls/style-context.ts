"use client";

import { createContext, useContext } from "react";
import { DEFAULT_STYLE, type StyleState } from "@/lib/style-tokens";

export type StyleContextValue = {
  state: StyleState;
  setAxis: (axis: keyof StyleState, value: number) => void;
  setState: React.Dispatch<React.SetStateAction<StyleState>>;
  reset: () => void;
  activeKey: keyof StyleState | null;
  setActiveKey: (key: keyof StyleState | null) => void;
};

export const StyleContext = createContext<StyleContextValue>({
  state: DEFAULT_STYLE,
  setAxis: () => {},
  setState: () => {},
  reset: () => {},
  activeKey: null,
  setActiveKey: () => {},
});

export function useStyleContext(): StyleContextValue {
  return useContext(StyleContext);
}
