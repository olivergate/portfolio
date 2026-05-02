import Link from "next/link";

const links = [
  { href: "/", label: "CV" },
  { href: "/tone", label: "Tone" },
  { href: "/jd", label: "JD" },
  { href: "/lab", label: "Lab" },
  { href: "/game", label: "Game" },
];

export function Nav() {
  return (
    <nav
      aria-label="Primary"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 1.5rem",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "var(--tracking-meta)",
        textTransform: "uppercase",
        color: "var(--muted)",
        paddingBottom: "var(--gap-block)",
        borderBottom: "var(--rule-weight) solid var(--rule)",
        marginBottom: "var(--gap-block)",
      }}
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href} style={{ color: "inherit", textDecoration: "none" }}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
