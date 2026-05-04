import { ScrollSpyNav } from "@/components/layout/ScrollSpyNav";

/**
 * The site nav is a scroll-spy strip that highlights the section currently in
 * view as the visitor scrolls the consolidated single-page document.
 *
 * `/game` is intentionally not in the spy list — it remains a separate route
 * for Phase 5–6's prompt-safety demo. If/when needed, link to it from the
 * footer rather than the spy nav.
 */
export function Nav() {
  return <ScrollSpyNav />;
}
