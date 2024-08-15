import { unified } from "npm:unified";
import rehypeStringify from "npm:rehype-stringify";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import remarkGfm from "npm:remark-gfm";
import rehypeShiki from "npm:@shikijs/rehype";

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
