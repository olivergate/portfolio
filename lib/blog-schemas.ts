import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "must be a kebab-case slug");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");

const BlogBlock = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("p"), text: z.string().min(1) }),
  z.object({ kind: z.literal("h2"), text: z.string().min(1) }),
  z.object({ kind: z.literal("list"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ kind: z.literal("pull"), text: z.string().min(1) }),
]);

export const BlogPostSchema = z.object({
  slug,
  title: z.string().min(1),
  date: isoDate,
  kicker: z.string().min(1).optional(),
  summary: z.string().min(1),
  body: z.array(BlogBlock).min(1),
});

export const BlogSchema = z.object({
  posts: z.array(BlogPostSchema),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogBlock = z.infer<typeof BlogBlock>;
export type Blog = z.infer<typeof BlogSchema>;
