import { extractYaml, test as frontmatterPresent } from "@std/front-matter";
import { ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { BlogPost } from "./BlogPost.ts";
import { renderLiquid } from "./exts/liquid.ts";
import { Gomi } from "./gomi.ts";
import { StaticFile } from "./staticFiles.ts";

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

const getEnvVariables = () => {
  const o = Object.entries(Deno.env.toObject())
    .filter(([key]) => key.startsWith("SITE_"))
    .map(([key, value]) => [key.replace(/^SITE_/, "").toLowerCase(), value]);

  return Object.fromEntries(o);
};

const ensureOutputDir = async (unit: BlogPost | StaticFile) => {
  const outputFilePath = join(Gomi.outputDir, unit.file.url);
  const { dir: outputPath } = parse(outputFilePath);
  await ensureDir(outputPath);
  await ensureFile(outputFilePath);

  return outputFilePath;
};

export const writePost = async (unit: BlogPost, gomi: Gomi) => {
  const outputFilePath = await ensureOutputDir(unit);
  const env = getEnvVariables();

  const content = await renderLiquid(
    gomi.layouts.use(unit.content, unit.file.input.filepath),
    {
      site: { posts: gomi.posts, ...env },
      page: { ...unit.file },
      post: { ...unit.file.meta },
      content: unit.content,
    },
  );
  await Deno.writeTextFile(outputFilePath, content);
};

export const writeStaticFile = async (unit: StaticFile, gomi: Gomi) => {
  if (unit.shouldCopy) return;

  const outputFilePath = await ensureOutputDir(unit);
  const env = getEnvVariables();

  const content =
    unit.file.input.ext === ".html"
      ? gomi.layouts.use(unit.content, unit.file.input.filepath)
      : unit.content;

  const output = await renderLiquid(content, {
    site: { posts: gomi.posts, ...env },
    page: { ...unit.file },
    post: { ...unit.file.meta },
    content: unit.content,
  });
  await Deno.writeTextFile(outputFilePath, output);
};
