import { copy, ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { renderMD } from "./exts/md.ts";
import { renderLiquid } from "./exts/liquid.ts";
import { Gomi } from "./gomi.ts";
import { renderScss } from "./exts/scss.ts";
import { ContentUnit } from "./contentUnit.ts";
import { readFileWithFrontMatter } from "./files.ts";

export const compileFile = async (file: ContentUnit, gomi: Gomi) => {
  let content = "";
  let variables: Record<string, string | object> = {
    site: {
      posts: gomi.posts,
    },
  };

  switch (file.ext) {
    case ".md": {
      content = gomi.layouts.use(await renderMD(file), file.input);
      variables = {
        ...variables,
        page: { ...file },
        post: { ...file.meta },
        content,
      };

      break;
    }

    case ".xml":
    case ".html": {
      const { body } = await readFileWithFrontMatter(file.input);
      content = gomi.layouts.use(body, file.input);

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
