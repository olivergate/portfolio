import { DeckProvider } from "@/components/controls/DeckProvider";
import { Footer } from "@/components/layout/Footer";
import { MainFocus } from "@/components/layout/MainFocus";
import { Nav } from "@/components/layout/Nav";
import { SiteShell } from "@/components/layout/SiteShell";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DeckProvider>
      <SiteShell>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1} className="site-main">
          <MainFocus />
          {children}
        </main>
        <Footer />
      </SiteShell>
    </DeckProvider>
  );
}
