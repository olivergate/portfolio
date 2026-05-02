import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <aside className="deck-slot" aria-hidden="true">
        {/* Phase 1: slider deck mounts here. Empty in Phase 0. */}
      </aside>
      <div>
        <Nav />
        {children}
        <Footer />
      </div>
    </div>
  );
}
