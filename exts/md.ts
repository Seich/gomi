import { test as frontmatterPresent, extractYaml } from "@std/front-matter";
import { unified } from "npm:unified";
import rehypeSanitize from "npm:rehype-sanitize";
import rehypeStringify from "npm:rehype-stringify";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";

import { BlogPost } from "../blogPosts.ts";
import { StaticFile } from "../staticFiles.ts";

export const renderMD = async (file: BlogPost | StaticFile) => {
  const fileContent = await Deno.readTextFile(file.input);
  let body = fileContent;
  let attrs: Record<string, string> = {};

  if (frontmatterPresent(fileContent)) {
    const frontmatter = extractYaml<Record<string, string>>(fileContent);
    body = frontmatter.body;
    attrs = frontmatter.attrs;
  }

  const content = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(body);

  return { frontmatter: attrs, content: content.toString() };
};
