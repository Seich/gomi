import { unified } from "unified";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";

export const renderMD = async (content: string) => {
  const lightTheme = Deno.env.get("SHIKI_THEME_LIGHT") ?? "vitesse-light";
  const darkTheme = Deno.env.get("SHIKI_THEME_DARK") ?? "vitesse-dark";

  const md = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeShiki, {
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return md.toString();
};
