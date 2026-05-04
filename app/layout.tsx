import type { Metadata } from "next";
import Script from "next/script";
import { BOOTSTRAP_SCRIPT } from "@/lib/bootstrap-script";
import { fontVariables } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Oliver Kaikane Gate",
    template: "%s — Oliver Kaikane Gate",
  },
  description:
    "Senior full-stack engineer (React/TypeScript, Python). 7+ years across data platforms and consumer products. Building with LLMs and going deep on agentic systems.",
  metadataBase: new URL("https://olivergate.com"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: StyleApplier reads slider state from localStorage
    // on mount and writes CSS custom properties to <html style="...">. The SSR
    // HTML has no inline style attribute on <html>, so the first client render
    // legitimately diverges from SSR. The divergence is benign and intentional —
    // the documented React/Next.js pattern is to suppress just on the element
    // that diverges.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <Script id="style-bootstrap" strategy="beforeInteractive">
          {BOOTSTRAP_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
