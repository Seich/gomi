import { walk } from "@std/fs";
import { dirname, join } from "@std/path";

type LayoutsMap = {
  [key: string]: string;
};

export class LayoutStore {
  layouts: LayoutsMap = {};
  inputDir: string = "";

  constructor(inputDir: string, layouts: LayoutsMap) {
    if (!layouts) throw new Error("You meant to call LayoutCalculator.build()");
    this.inputDir = inputDir;
    this.layouts = layouts;
  }

  static replaceInLayout(content: string, layout: string) {
    return layout.replace(/{{\s?content\s?}}/, content);
  }

  static async build(inputDir: string) {
    const layouts: LayoutsMap = {};

    // Find all layout files and read them.
    const files = walk(inputDir, {
      includeDirs: false,
    });

    for await (const file of files) {
      if (file.name !== "_layout.html") continue;
      const dir = dirname(file.path);
      const content = await Deno.readTextFile(file.path);
      layouts[dir] = content;
    }

    // Embed layouts within their parents all the way to the input root
    Object.keys(layouts).forEach((path) => {
      let layout = layouts[path];
      let currentDir = join(path, "..");

      while (currentDir !== join(inputDir, "..")) {
        if (layouts[currentDir]) {
          layout = LayoutStore.replaceInLayout(layout, layouts[currentDir]);
        }
        currentDir = join(currentDir, "..");
      }

      layouts[path] = layout;
    });

    return new LayoutStore(inputDir, layouts);
  }

  for(filepath: string) {
    let path = dirname(filepath);

    while (!(path in this.layouts)) {
      path = join(path, "..");
    }

    return this.layouts[path];
  }

  use(content: string, filepath: string) {
    const layout = this.for(filepath);
    return LayoutStore.replaceInLayout(content, layout);
  }
}
