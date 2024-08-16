import { extractYaml, test as frontmatterPresent } from "@std/front-matter";
import { ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { renderLiquid } from "./exts/liquid.ts";
import { Gomi } from "./gomi.ts";

export interface ParsedFile {
  url: string;
  filename: string;
  meta: Record<string, unknown>;
  input: {
    filepath: string;
    ext: string;
    content?: string;
  };
}

// TODO: include methods here as well
// reload, write, etc.
export interface FileUnit {
  file: ParsedFile;
  shouldCopy: boolean;
  content: string;
  hash: string;
}

export const readFileWithFrontMatter = async (filepath: string) => {
  const fileContent = await Deno.readTextFile(filepath);
  let body = fileContent;
  let attrs: Record<string, string> = {};

  if (frontmatterPresent(fileContent)) {
    const frontmatter = extractYaml<Record<string, string>>(fileContent);
    body = frontmatter.body;
    attrs = frontmatter.attrs;
  }

  return { body, attrs };
};

export const getEnvVariables = () => {
  const o = Object.entries(Deno.env.toObject())
    .filter(([key]) => key.startsWith("SITE_"))
    .map(([key, value]) => [key.replace(/^SITE_/, "").toLowerCase(), value]);

  return Object.fromEntries(o);
};

const ensureOutputDir = async (unit: FileUnit) => {
  const outputFilePath = join(Gomi.outputDir, unit.file.url);
  const { dir: outputPath } = parse(outputFilePath);
  await ensureDir(outputPath);
  await ensureFile(outputFilePath);

  return outputFilePath;
};

export const writeFile = async (unit: FileUnit, gomi: Gomi) => {
  if (unit.shouldCopy) return;

  const outputFilePath = await ensureOutputDir(unit);
  const env = getEnvVariables();
  const content = gomi.layouts.use(unit);

  const output = await renderLiquid(content, {
    site: { posts: gomi.posts, ...env },
    page: { ...unit.file },
    post: { ...unit.file.meta, file: unit },
    content: unit.content,
  });
  await Deno.writeTextFile(outputFilePath, output);
};
