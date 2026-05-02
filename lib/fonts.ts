import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-display-next",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-next",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-next",
  display: "swap",
});

export const fontVariables = [fraunces.variable, inter.variable, jetbrainsMono.variable].join(" ");
