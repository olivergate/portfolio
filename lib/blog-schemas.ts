import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "must be a kebab-case slug");

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");

export const BlogStatusSchema = z.enum(["draft", "review", "published"]);
export type BlogStatus = z.infer<typeof BlogStatusSchema>;

export const BlogFrontmatterSchema = z.object({
  slug,
  title: z.string().min(1),
  date: isoDate,
  status: BlogStatusSchema,
  summary: z.string().min(1),
  kicker: z.string().min(1).optional(),
  length: z.string().min(1).optional(),
  source_brief: z.string().min(1).optional(),
  source_data: z.array(z.string().min(1)).optional(),
  post: z.number().int().positive().optional(),
});
export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;

export type BlogPost = BlogFrontmatter & {
  bodyMd: string;
};

export type Blog = {
  posts: BlogPost[];
};
