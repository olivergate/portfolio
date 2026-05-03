import { DeckProvider } from "@/components/controls/DeckProvider";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { SiteShell } from "@/components/layout/SiteShell";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DeckProvider>
      <SiteShell>
        <Nav />
        {children}
        <Footer />
      </SiteShell>
    </DeckProvider>
  );
}
