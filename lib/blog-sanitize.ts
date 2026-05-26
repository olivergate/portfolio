import { defaultSchema } from "rehype-sanitize";

// Allowlist of additional SVG tags and attributes used by inline charts
// in blog posts. If you don't recognise a tag or attribute here, don't
// add it — the cost of expanding this list is paid by every future
// reader of every future post.
const svgAttrs = [
  "viewBox",
  "xmlns",
  "role",
  "ariaLabel",
  "aria-label",
  "width",
  "height",
  "className",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "textAnchor",
  "text-anchor",
  "fontFamily",
  "font-family",
  "fontSize",
  "font-size",
  "fontWeight",
  "font-weight",
  "fill",
  "stroke",
  "strokeWidth",
  "stroke-width",
];

export const blogSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "svg", "text", "line", "rect", "style"],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    svg: svgAttrs,
    text: svgAttrs,
    line: svgAttrs,
    rect: svgAttrs,
    style: [],
  },
};

type HastNode = {
  type: string;
  tagName?: string;
  properties?: { className?: string[] } & Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

// A blockquote whose first text starts with `[!pull]` becomes a styled
// pull quote (className `blog-pull`); the marker is stripped.
export function rehypePullQuote() {
  function visit(node: HastNode): void {
    if (node.type === "element" && node.tagName === "blockquote") {
      const firstP = node.children?.find((c) => c.type === "element" && c.tagName === "p");
      const firstChild = firstP?.children?.[0];
      if (
        firstChild?.type === "text" &&
        typeof firstChild.value === "string" &&
        firstChild.value.startsWith("[!pull]")
      ) {
        firstChild.value = firstChild.value.replace(/^\[!pull\]\s*/, "");
        node.properties ??= {};
        const props = node.properties;
        props.className = ["blog-pull", ...(props.className ?? [])];
      }
    }
    if (node.children) for (const child of node.children) visit(child);
  }
  return (tree: HastNode) => visit(tree);
}
