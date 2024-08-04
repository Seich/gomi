import { copy, ensureDir, ensureFile } from "@std/fs";
import { join, parse } from "@std/path";

import { BlogPost } from "./blogPosts.ts";
import { renderMD } from "./exts/md.ts";
import { renderHTML } from "./exts/html.ts";
import { Gomi } from "./gomi.ts";
import { StaticFile } from "./staticFiles.ts";

export const compileFile = async (file: BlogPost | StaticFile, gomi: Gomi) => {
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

      content = gomi.layouts.use(md.content, file.input);
      variables = {
        ...variables,
        page: { ...md.frontmatter, ...file.meta },
        content: md.content,
      };

      break;
    }

    case ".html": {
      console.log(file);
      const f = await Deno.readTextFile(file.input);
      // const layout = gomi.layouts.for(file.input);
      content = gomi.layouts.use(f, file.input);
      console.log(f);

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
