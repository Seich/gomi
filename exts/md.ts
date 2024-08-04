import { unified } from "npm:unified";
import rehypeSanitize from "npm:rehype-sanitize";
import rehypeStringify from "npm:rehype-stringify";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import { ContentUnit } from "../gomi.ts";

export const renderMD = async (unit: ContentUnit) => {
  let output = "";

  if (unit.type === "blogPost") {
    const md = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(unit.content);

    output = md.toString();
  }

  return output;
};
