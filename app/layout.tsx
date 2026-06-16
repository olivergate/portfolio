import type { Metadata } from "next";
import Script from "next/script";
import { BOOTSTRAP_SCRIPT } from "@/lib/bootstrap-script";
import { fontVariables } from "@/lib/fonts";
import "@/styles/globals.css";

const SITE_DESCRIPTION =
  "Spending most of my current bandwidth on agent orchestration and harness design, on top of 7+ years senior full-stack (React/TypeScript, Python) across data platforms and consumer products.";

export const metadata: Metadata = {
  title: {
    default: "Oliver Kaikane Gate",
    template: "%s — Oliver Kaikane Gate",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://olivergate.com"),
  // Intentional unfurls when a recruiter pastes a URL into Slack/LinkedIn/email.
  // Custom 1200×630 opengraph-image is a follow-up; the tags themselves unfurl
  // with title + description today.
  openGraph: {
    type: "profile",
    siteName: "Oliver Kaikane Gate",
    title: "Oliver Kaikane Gate — Senior Full Stack Developer",
    description: SITE_DESCRIPTION,
    url: "https://olivergate.com",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oliver Kaikane Gate — Senior Full Stack Developer",
    description: SITE_DESCRIPTION,
  },
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
