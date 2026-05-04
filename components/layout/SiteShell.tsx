/**
 * Single centered column for the consolidated site. The previous two-column
 * grid (sticky deck-slot + content) was retired with ADR-0028 + ADR-0026 —
 * the rethemer is a fixed-position FAB now and doesn't need a grid aside.
 */
type Props = { children: React.ReactNode };

export function SiteShell({ children }: Props) {
  return <div className="site-content">{children}</div>;
}
