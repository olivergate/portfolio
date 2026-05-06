import { readFileSync } from "node:fs";
import path from "node:path";
import { SampleJDsSchema, type StretchLevel, statusAtLevel } from "@/lib/jd-schemas";
import { LabProjects } from "@/lib/retro-schemas";
import { CVSchema, ToneSchema } from "@/lib/schemas";

const cvPath = path.join(process.cwd(), "content", "cv.json");
const tonePath = path.join(process.cwd(), "content", "tone.json");
const sampleJDsPath = path.join(process.cwd(), "content", "sample-jds.json");
const projectsPath = path.join(process.cwd(), "content", "projects.json");

try {
  const cvRaw = readFileSync(cvPath, "utf8");
  const cv = CVSchema.safeParse(JSON.parse(cvRaw));
  if (!cv.success) {
    console.error("content/cv.json failed validation:");
    for (const issue of cv.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const ids = new Set<string>();
  for (const role of cv.data.roles) {
    if (ids.has(role.id)) {
      console.error(`duplicate role id: ${role.id}`);
      process.exit(1);
    }
    ids.add(role.id);
    const bulletIds = new Set<string>();
    for (const b of role.bullets) {
      if (bulletIds.has(b.id)) {
        console.error(`duplicate bullet id within role ${role.id}: ${b.id}`);
        process.exit(1);
      }
      bulletIds.add(b.id);
    }
  }

  console.log(
    `content/cv.json OK — ${cv.data.roles.length} roles, ${cv.data.projects.length} projects, ${cv.data.education.length} education entries`,
  );

  const toneRaw = readFileSync(tonePath, "utf8");
  const tone = ToneSchema.safeParse(JSON.parse(toneRaw));
  if (!tone.success) {
    console.error("content/tone.json failed validation:");
    for (const issue of tone.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const pledgeNumbers = new Set<number>();
  for (const p of tone.data.pledges) {
    if (pledgeNumbers.has(p.number)) {
      console.error(`duplicate pledge number: ${p.number}`);
      process.exit(1);
    }
    pledgeNumbers.add(p.number);
  }

  console.log(`content/tone.json OK — ${tone.data.pledges.length} pledges`);

  const sampleJDsRaw = readFileSync(sampleJDsPath, "utf8");
  const sampleJDs = SampleJDsSchema.safeParse(JSON.parse(sampleJDsRaw));
  if (!sampleJDs.success) {
    console.error("content/sample-jds.json failed validation:");
    for (const issue of sampleJDs.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const roleBulletIds = new Set<string>();
  for (const role of cv.data.roles) {
    for (const b of role.bullets) roleBulletIds.add(b.id);
  }
  const projectIds = new Set(cv.data.projects.map((p) => p.id));

  for (const jd of sampleJDs.data) {
    const chipIds = new Set<string>();
    for (const chip of jd.chips) {
      if (chipIds.has(chip.id)) {
        console.error(`duplicate chip id within JD ${jd.key}: ${chip.id}`);
        process.exit(1);
      }
      chipIds.add(chip.id);
      for (const ref of chip.cite) {
        const [prefix, id] = ref.split(":");
        if (prefix === "role" && id && !roleBulletIds.has(id)) {
          console.error(`JD ${jd.key} chip ${chip.id} cites unknown role bullet "${id}"`);
          process.exit(1);
        }
        if (prefix === "project" && id && !projectIds.has(id)) {
          console.error(`JD ${jd.key} chip ${chip.id} cites unknown project "${id}"`);
          process.exit(1);
        }
      }
      const levels: StretchLevel[] = ["strict", "balanced", "generous"];
      for (const level of levels) {
        if (statusAtLevel(chip, level) === "hit" && chip.cite.length === 0) {
          console.error(
            `JD ${jd.key} chip ${chip.id} resolves to Hit at "${level}" with no cite — Hits require evidence (ADR-0016)`,
          );
          process.exit(1);
        }
      }
    }
  }

  console.log(
    `content/sample-jds.json OK — ${sampleJDs.data.length} JDs, ${sampleJDs.data.reduce((n, j) => n + j.chips.length, 0)} chips total`,
  );

  const projectsRaw = readFileSync(projectsPath, "utf8");
  const projects = LabProjects.safeParse(JSON.parse(projectsRaw));
  if (!projects.success) {
    console.error("content/projects.json failed validation:");
    for (const issue of projects.error.issues) {
      console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const sampleIds = new Set<string>();
  for (const s of projects.data.featured.samples) {
    if (sampleIds.has(s.id)) {
      console.error(`duplicate retro sample id: ${s.id}`);
      process.exit(1);
    }
    sampleIds.add(s.id);
  }

  const secondaryIds = new Set<string>();
  for (const p of projects.data.secondary) {
    if (secondaryIds.has(p.slug)) {
      console.error(`duplicate secondary project slug: ${p.slug}`);
      process.exit(1);
    }
    secondaryIds.add(p.slug);
  }

  console.log(
    `content/projects.json OK — featured "${projects.data.featured.slug}" (${projects.data.featured.samples.length} samples), ${projects.data.secondary.length} secondary cards`,
  );
} catch (err) {
  console.error("content validation crashed:", err);
  process.exit(1);
}
