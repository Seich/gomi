import { copy, ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { renderMD } from "./exts/md.ts";
import { renderHTML } from "./exts/html.ts";
import { Gomi, ContentUnit } from "./gomi.ts";

export const compileFile = async (file: ContentUnit, gomi: Gomi) => {
  const outputFilePath = join(Gomi.outputDir, file.url);
  const { dir: outputPath } = parse(outputFilePath);
  await ensureDir(outputPath);

  let content = "";
  let variables: Record<string, any> = {
    site: {
      posts: gomi.posts,
    },
  };
  switch (file.ext) {
    case ".md": {
      const md = await renderMD(file);

      content = gomi.layouts.use(md, file.input);
      variables = {
        ...variables,
        page: { ...file.meta },
        content: md,
      };

      break;
    }

    case ".html": {
      const f = await Deno.readTextFile(file.input);
      content = gomi.layouts.use(f, file.input);

      break;
    }

    // If a file can't be processed it'll be copied over
    default: {
      copy(file.input, outputFilePath, { overwrite: true });
    }
  }

  await ensureFile(outputFilePath);
  content = await renderHTML(content, variables);
  await Deno.writeTextFile(outputFilePath, content);
};
