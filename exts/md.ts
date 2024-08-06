import { unified } from "npm:unified";
import rehypeStringify from "npm:rehype-stringify";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import remarkGfm from "npm:remark-gfm";
import rehypeShiki from "npm:@shikijs/rehype";
import { ContentUnit } from "../contentUnit.ts";

export const renderMD = async (unit: ContentUnit) => {
  let output = "";

  if (unit.type === "blogPost") {
    const md = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeShiki, {
        themes: {
          light: "vitesse-light",
          dark: "vitesse-dark",
        },
      })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(unit.content);

    output = md.toString();
  }

  return output;
};
