import Link from "next/link";
import { SectionHeader } from "@/components/cv/SectionHeader";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";

export default function NotFound() {
  return (
    <div className="site-shell">
      <aside className="deck-slot" aria-hidden="true" />
      <div>
        <Nav />
        <main>
          <SectionHeader number="404" title="Not found" meta="Out of bounds" />
          <p style={{ maxWidth: "62ch" }}>
            Nothing lives at that URL.{" "}
            <Link href="/" style={{ color: "var(--accent)" }}>
              Back to the CV
            </Link>
            .
          </p>
        </main>
        <Footer />
      </div>
    </div>
  );
}
