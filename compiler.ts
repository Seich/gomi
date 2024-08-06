import { copy, ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { renderMD } from "./exts/md.ts";
import { renderLiquid } from "./exts/liquid.ts";
import { Gomi } from "./gomi.ts";
import { renderScss } from "./exts/scss.ts";
import { ContentUnit } from "./contentUnit.ts";
import { readFileWithFrontMatter } from "./files.ts";

export const compileFile = async (file: ContentUnit, gomi: Gomi) => {
  let content: string = "";
  let variables: Record<string, string | object> = {
    site: {
      posts: gomi.posts,
    },
    page: { ...file },
  };

  switch (file.ext) {
    case ".md": {
      variables = {
        ...variables,
        post: { ...file.meta },
        content,
      };

      content = gomi.layouts.use(await renderMD(file), file.input);

      break;
    }

    case ".xml":
    case ".html": {
      const { body, attrs } = await readFileWithFrontMatter(file.input);
      content = await renderLiquid(body, variables, gomi);
      if (attrs) {
        content = gomi.layouts.use(content, file.input);
      }
      break;
    }

    case ".scss": {
      content = await renderScss(file);
      break;
    }

    // If a file can't be processed it'll be copied over
    default: {
      const outputFilePath = join(Gomi.outputDir, file.url);
      const { dir: outputPath } = parse(outputFilePath);
      await ensureDir(outputPath);
      return copy(file.input, outputFilePath, { overwrite: true });
    }
  }

  const outputFilePath = join(Gomi.outputDir, file.url);
  const { dir: outputPath } = parse(outputFilePath);
  await ensureDir(outputPath);
  await ensureFile(outputFilePath);

  content = await renderLiquid(content, variables, gomi);
  await Deno.writeTextFile(outputFilePath, content);
};
