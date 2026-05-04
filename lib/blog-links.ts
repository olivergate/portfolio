/**
 * Centralized blog-post hrefs that other parts of the site link to.
 *
 * The first post — about the UX principles of this portfolio and why I chose
 * the four sliders — is referenced from `RethemeFab` via the "About these
 * sliders →" footer link. Keeping the slug in one place means renaming the
 * post is a single-file edit; the blog index reads from `content/blog.json`
 * and validates the slug exists at build time via the Zod schema.
 *
 * Update both this constant and `content/blog.json` together when the post
 * is renamed.
 */
export const FOUR_SLIDERS_POST_SLUG = "four-sliders";
export const FOUR_SLIDERS_POST_HREF = `/blog/${FOUR_SLIDERS_POST_SLUG}`;
