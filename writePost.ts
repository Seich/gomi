import { ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { BlogPost } from "./BlogPost.ts";
import { renderLiquid } from "./exts/liquid.ts";
import { Gomi } from "./gomi.ts";

export const writePost = async (unit: BlogPost, gomi: Gomi) => {
  const outputFilePath = join(Gomi.outputDir, unit.file.url);
  const { dir: outputPath } = parse(outputFilePath);
  await ensureDir(outputPath);
  await ensureFile(outputFilePath);

  let content = unit.content;
  content = gomi.layouts.use(content, unit.file.input.filepath);
  content = await renderLiquid(
    gomi.layouts.use(content, unit.file.input.filepath),
    {
      site: { posts: gomi.posts },
      page: { ...unit.file },
      post: { ...unit.file.meta },
    },
  );
  await Deno.writeTextFile(outputFilePath, content);
};
