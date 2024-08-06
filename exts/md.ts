import { unified } from "npm:unified";
import rehypeStringify from "npm:rehype-stringify";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import remarkGfm from "npm:remark-gfm";
import rehypeShiki from "npm:@shikijs/rehype";

export const renderMD = async (content: string) => {
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
    .process(content);

  return md.toString();
};
