import { resolve } from "@std/path";
import { ensureDirSync, existsSync } from "@std/fs";
import { getBlogPosts } from "./blogPosts.ts";
import { getStaticFiles } from "./staticFiles.ts";
import { compileFile } from "./compiler.ts";
import { LayoutStore } from "./layouts.ts";
import { ContentUnit } from "./contentUnit.ts";
import { getPlugins, Plugin } from "./plugins.ts";

export class Gomi {
  static outputDir = resolve(Deno.env.get("OUTPUT") ?? "output");
  static inputDir = resolve(Deno.env.get("INPUT") ?? "src");
  static postsDir = resolve(this.inputDir, "_posts");
  static pluginsDir = resolve(this.inputDir, "_plugins");

  posts: ContentUnit[] = [];
  staticFiles: ContentUnit[] = [];
  plugins: Plugin[];
  layouts: LayoutStore;

  constructor(
    posts: ContentUnit[],
    staticFiles: ContentUnit[],
    layouts: LayoutStore,
    plugins: Plugin[],
  ) {
    if (!posts || !staticFiles) {
      throw new Error("You probably meant to use Gomi.build() instead.");
    }

    console.log(`Gomi(ta) v1.0.0`);
    console.log(`===========================`);
    console.log(`OUTPUT = ${Gomi.outputDir}`);
    console.log(`INPUT = ${Gomi.inputDir}`);
    console.log(`POSTS = ${Gomi.postsDir} (${posts.length})`);
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

    const layouts = await LayoutStore.build(Gomi.inputDir);
    const plugins = await getPlugins(Gomi.pluginsDir);
    const blogPosts = await getBlogPosts(Gomi.postsDir);
    const staticFiles = await getStaticFiles(Gomi.inputDir);

    ensureDirSync(Gomi.outputDir);

    return new Gomi(blogPosts, staticFiles, layouts, plugins);
  }

  async compile() {
    // TODO: accept file changes to rebuild only that file
    await Promise.all(
      [...this.posts, ...this.staticFiles].map((file) =>
        compileFile(file, this),
      ),
    );
    console.log("Site built.");
  }
}
