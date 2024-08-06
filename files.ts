import { extractYaml, test as frontmatterPresent } from "@std/front-matter";

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
