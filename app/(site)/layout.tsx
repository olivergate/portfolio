import { DeckProvider } from "@/components/controls/DeckProvider";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DeckProvider>
      <div className="site-shell">
        <aside className="deck-slot" aria-label="Style controls" />
        <div className="site-content">
          <Nav />
          {children}
          <Footer />
        </div>
      </div>
    </DeckProvider>
  );
}
