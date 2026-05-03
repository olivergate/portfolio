"use client";

import { useEffect, useRef, useState } from "react";
import { useTone } from "@/components/cv/tone-context";
import type { CVTonedText } from "@/lib/schemas";

type Props = {
  value: CVTonedText;
};

const FADE_MS = 280;

export function TonedText({ value }: Props) {
  const { tone } = useTone();
  const target = value[tone];
  const [shown, setShown] = useState(target);
  const [out, setOut] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (target === shown) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(target);
      return;
    }
    setOut(true);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(target);
      requestAnimationFrame(() => setOut(false));
    }, FADE_MS);
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, [target, shown]);

  return <span className={`toned-text ${out ? "is-out" : ""}`}>{shown}</span>;
}
