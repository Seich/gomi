import { copy, ensureDir, walk } from "@std/fs";
import { format, join, parse } from "@std/path";

import { renderScss } from "./exts/scss.ts";
import { ParsedFile, readFileWithFrontMatter } from "./files.ts";
import { Gomi } from "./gomi.ts";
import { hashString } from "./hash.ts";

export class StaticFile {
  file: ParsedFile;
  content = "";
  hash = "";
  shouldCopy = false;

  constructor(file: ParsedFile, { shouldCopy }: { shouldCopy: boolean }) {
    this.file = file;
    this.shouldCopy = shouldCopy;
  }

  async compile() {
    const outputFilePath = join(Gomi.outputDir, this.file.url);
    const { dir } = parse(outputFilePath);

    // TODO: Hash file and don't copy again
    if (this.shouldCopy) {
      await ensureDir(dir);
      return copy(this.file.input.filepath, outputFilePath, {
        overwrite: true,
      });
    }

    const hash = await hashString(this.file.input?.content ?? "");
    if (hash === this.hash) return this.content;

    switch (this.file.input.ext) {
      case ".scss":
        this.file.url = format({
          ...parse(this.file.url),
          ext: ".css",
          base: "",
        });
        this.content = renderScss(this.file.input.content ?? "");
        break;
      case ".xml":
      case ".html":
        this.content = this.file.input.content ?? "";
        break;
    }

    this.hash = hash;
    return this.content;
  }

  static async load(filepath: string) {
    const { base, ext } = parse(filepath);
    const shouldCopy = ![".html", ".xml", ".scss"].includes(ext);
    const { attrs, body } = shouldCopy
      ? { attrs: {}, body: "" }
      : await readFileWithFrontMatter(filepath);

    const file = new StaticFile(
      {
        filename: base,
        url: filepath.replace(Gomi.inputDir, ""),
        input: { filepath, ext, content: body },
        meta: { ...attrs },
      },
      { shouldCopy },
    );

    file.compile();

    return file;
  }

  static async loadAll() {
    const files = walk(Gomi.inputDir, {
      includeDirs: false,
      includeSymlinks: false,
    });

    const staticFiles: StaticFile[] = [];
    for await (const file of files) {
      if (file.name.startsWith(".")) continue; // Exclude hidden files
      if (file.path.includes("/_")) continue; // Exclude files under dirs that starts with _
      staticFiles.push(await StaticFile.load(file.path));
    }

    return staticFiles;
  }
}
