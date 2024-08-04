import { copy, ensureDir } from "@std/fs";
import { join, parse } from "@std/path";
import { renderMD } from "./exts/md.ts";

import { BlogPost } from "./blogPosts.ts";
import { Gomi } from "./gomi.ts";
import { StaticFile } from "./staticFiles.ts";
import { LayoutCalculator } from "./layouts.ts";

export const compileFile = async (
  file: BlogPost | StaticFile,
  layouts: LayoutCalculator,
) => {
  switch (file.ext) {
    case ".md":
      renderMD(file, layouts);
      break;
    default: {
      const outputPath = join(Gomi.outputDir, file.url);
      const { dir } = parse(outputPath);
      await ensureDir(dir);
      await copy(file.input, outputPath, { overwrite: true });
    }
  }
};
