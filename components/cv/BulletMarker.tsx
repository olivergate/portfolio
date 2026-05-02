type Props = {
  size?: "default" | "sm";
};

/**
 * A small absolute-positioned marker that responds to the bullet-marker tokens
 * (square at brutalist, dash at midpoint, dot at refined).
 */
export function BulletMarker({ size = "default" }: Props) {
  const fallbackW = size === "sm" ? "0.5rem" : "0.55rem";
  return (
    <span
      aria-hidden="true"
      className="bullet-marker"
      style={{
        position: "absolute",
        left: 0,
        top: "calc(var(--line) * 0.5em)",
        transform: "translateY(-50%)",
        width: `var(--bullet-marker-w, ${fallbackW})`,
        height: "var(--bullet-marker-h, 1px)",
        background: "var(--bullet-marker-color, var(--fg))",
        borderRadius: "var(--bullet-marker-radius, 0)",
      }}
    />
  );
}
