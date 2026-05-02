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
    <html lang="en" className={fontVariables}>
      <body>
        <Script id="style-bootstrap" strategy="beforeInteractive">
          {BOOTSTRAP_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
