import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "must be a kebab-case slug");

const Contact = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
});

const Header = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  location: z.string().min(1),
  contact: Contact,
});

const About = z.object({
  paragraphs: z.array(z.string().min(1)).min(1),
});

const Bullet = z.object({
  id: slug,
  text: z.string().min(1),
});

const Role = z.object({
  id: slug,
  title: z.string().min(1),
  company: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  summary: z.string().min(1),
  bullets: z.array(Bullet).min(1),
  technologies: z.array(z.string().min(1)).min(1),
});

const Education = z.object({
  id: slug,
  degree: z.string().min(1),
  school: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  notes: z.array(z.string().min(1)),
});

const Skills = z.object({
  primary: z.array(z.string().min(1)),
  ai: z.array(z.string().min(1)),
  frontend: z.array(z.string().min(1)),
  backend: z.array(z.string().min(1)),
  infra: z.array(z.string().min(1)),
  leadership: z.array(z.string().min(1)),
});

const Project = z.object({
  id: slug,
  title: z.string().min(1),
  stack: z.string().min(1),
  description: z.string().min(1),
});

export const CVSchema = z.object({
  header: Header,
  about: About,
  experienceOverview: z.string().min(1),
  roles: z.array(Role).min(1),
  education: z.array(Education).min(1),
  skills: Skills,
  projects: z.array(Project).min(1),
  avocations: z.array(z.string().min(1)),
});

export type CV = z.infer<typeof CVSchema>;
export type CVRole = z.infer<typeof Role>;
export type CVBullet = z.infer<typeof Bullet>;
export type CVProject = z.infer<typeof Project>;
export type CVEducation = z.infer<typeof Education>;
export type CVSkills = z.infer<typeof Skills>;

const Tenet = z.object({
  number: z.number().int().min(1).max(99),
  title: z.string().min(1),
  formal: z.string().min(1),
  personal: z.string().min(1),
});

const ToneSignature = z.object({
  text: z.string().min(1),
});

export const ToneSchema = z.object({
  intro: z.object({
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  tenets: z.array(Tenet).min(1),
  signature: ToneSignature,
});

export type Tone = z.infer<typeof ToneSchema>;
export type ToneTenet = z.infer<typeof Tenet>;
