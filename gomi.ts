import { ensureDir, existsSync } from "@std/fs";
import { resolve } from "@std/path";
import { EventEmitter } from "node:events";

import { BlogPost } from "./BlogPost.ts";
import { FileUnit, getEnvVariables } from "./files.ts";
import { LayoutStore } from "./layouts.ts";
import { getPlugins, Plugin } from "./plugins.ts";
import { StaticFile } from "./StaticFiles.ts";

const config = await import("./deno.json", { with: { type: "json" } });

class GomiEvents extends EventEmitter {
  #enabled = false;

  areEnabled() {
    return this.#enabled;
  }

  enable() {
    this.#enabled = true;
  }

  onFileCompiled(cb: (unit: FileUnit) => void) {
    this.on("fileCompiled", cb);
  }

  onLayoutUpdated(cb: (layout: string) => void) {
    this.on("layoutUpdated", cb);
  }

  emitFileCompilation(unit: FileUnit) {
    if (!this.#enabled) return;
    this.emit("fileCompiled", unit);
  }

  emitLayoutUpdate(layout: string) {
    if (!this.#enabled) return;
    this.emit("layoutUpdated", layout);
  }
}

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
  events: GomiEvents;

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
    this.events = new GomiEvents();
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

  emitEvents() {
    this.events.enable();
  }

  async compile(files?: string[]) {
    if (files) {
      for (const file of files) {
        // TODO: Only recompile files affected by the layout changes.
        // Recompile everything on layout changes.
        if (file.includes("_layout.html")) {
          this.layouts = await LayoutStore.build();
          await this.compile();
          this.events.emitLayoutUpdate(file);
          return;
        }

        // Check if the file is already loaded
        let unit = [...this.posts, ...this.staticFiles].find(
          (p) => p.file.input.filepath === file,
        );

        if (unit) {
          await unit.reload(this);
          this.events.emitFileCompilation(unit);
          console.log(`${unit.file.input.filepath} rebuilt.`);
          return;
        }

        // Load the file if it hasn't been loaded before
        if (file.includes(Gomi.postsDir)) {
          unit = await BlogPost.load(file);
          this.posts.push(unit as BlogPost);
        } else {
          unit = await StaticFile.load(file);
          this.staticFiles.push(unit);
        }

        unit.reload(this);
        this.events.emitFileCompilation(unit);
      }

      return;
    }

    for await (const unit of [...this.posts, ...this.staticFiles]) {
      await unit.write(this);
    }
  }
}
