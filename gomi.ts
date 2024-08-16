import { ensureDir, existsSync } from "@std/fs";
import { resolve } from "@std/path";

import { BlogPost } from "./BlogPost.ts";
import { getEnvVariables } from "./files.ts";
import { LayoutStore } from "./layouts.ts";
import { getPlugins, Plugin } from "./plugins.ts";
import { StaticFile } from "./staticFiles.ts";

const config = await import("./deno.json", { with: { type: "json" } });

export class Gomi {
  static outputDir = resolve(Deno.env.get("OUTPUT") ?? "output");
  static inputDir = resolve(Deno.env.get("INPUT") ?? "src");
  static postsDir = resolve(this.inputDir, "_posts");
  static pluginsDir = resolve(this.inputDir, "_plugins");
  static env = getEnvVariables();
  static version = config.default.version;

  posts: BlogPost[] = [];
  staticFiles: StaticFile[] = [];
  plugins: Plugin[];
  layouts: LayoutStore;

  constructor(
    posts: BlogPost[],
    staticFiles: StaticFile[],
    layouts: LayoutStore,
    plugins: Plugin[],
  ) {
    if (!posts || !staticFiles) {
      throw new Error("You probably meant to use Gomi.build() instead.");
    }

    console.log(`Gomi(ta) v${Gomi.version}`);
    console.log(`===========================`);
    console.log(`OUTPUT = ${Gomi.outputDir}`);
    console.log(`INPUT = ${Gomi.inputDir} (${staticFiles.length})`);
    console.log(`POSTS = ${Gomi.postsDir} (${posts.length})`);
    console.log(`PLUGINS = ${Gomi.pluginsDir} (${plugins.length})`);
    console.log(`===========================`);

    this.posts = posts;
    this.staticFiles = staticFiles;
    this.layouts = layouts;
    this.plugins = plugins;
  }

  static async build() {
    if (!existsSync(Gomi.inputDir)) {
      throw new Error("Input directory does not exist.");
    }

    const plugins = await getPlugins();
    const layouts = await LayoutStore.build();
    const blogPosts = await BlogPost.loadAll();
    const staticFiles = await StaticFile.loadAll();

    await ensureDir(Gomi.outputDir);

    return new Gomi(blogPosts, staticFiles, layouts, plugins);
  }

  async compile(files?: string[]) {
    if (files) {
      for (const file of files) {
        const unit = [...this.posts, ...this.staticFiles].find(
          (p) => p.file.input.filepath === file,
        );

        if (unit) {
          await unit.reload(this);
          console.log(`${unit.file.input.filepath} rebuilt.`);
        }

        // TODO: handle a new file being added.
      }
      return;
    }

    for await (const unit of [...this.posts, ...this.staticFiles]) {
      await unit.write(this);
    }

    console.log("Site built.");
  }
}
