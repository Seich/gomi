import { copy, ensureDir, walk } from "@std/fs";
import { format, join, parse } from "@std/path";

import { renderScss } from "./exts/scss.ts";
import { renderMD } from "./exts/md.ts";
import {
  FileUnit,
  ParsedFile,
  readFileWithFrontMatter,
  writeFile,
} from "./files.ts";
import { Gomi } from "./gomi.ts";
import { hashString } from "./hash.ts";

export class StaticFile implements FileUnit {
  file: ParsedFile;
  content = "";
  hash = "";
  shouldCopy = false;

  constructor(file: ParsedFile, { shouldCopy }: { shouldCopy: boolean }) {
    this.file = file;
    this.shouldCopy = shouldCopy;
  }

  async compile() {
    try {
      const outputFilePath = join(Gomi.outputDir, this.file.url);
      const { dir } = parse(outputFilePath);

      // TODO: Hash file and don't copy again
      if (this.shouldCopy) {
        await ensureDir(dir);
        await copy(this.file.input.filepath, outputFilePath, {
          overwrite: true,
        });
        return;
      }

      const hash = await hashString(this.file.input?.content ?? "");
      if (hash === this.hash) return;
      if (!this.file.input.content) {
        this.content = "";
        return;
      }

      switch (this.file.input.ext) {
        case ".scss":
          this.file.url = format({
            ...parse(this.file.url),
            ext: ".css",
            base: "",
          });
          this.content = renderScss(this.file.input.content);
          break;
        case ".html":
        case ".xml":
          this.content = this.file.input.content;
          break;
        case ".md":
          this.file.url = format({
            ...parse(this.file.url),
            ext: ".html",
            base: "",
          });
          this.content = await renderMD(this.file.input.content);
          break;
      }

      this.hash = hash;
    } catch (e) {
      console.error(e);
    }
  }

  async reload(gomi: Gomi) {
    try {
      const { attrs, body } = this.shouldCopy
        ? { attrs: {}, body: "" }
        : await readFileWithFrontMatter(this.file.input.filepath);

      this.file.meta = {
        ...this.file.meta,
        ...attrs,
      };

      this.file.input.content = body;
      await this.compile();
      await this.write(gomi);
    } catch (e) {
      console.error(e);
    }
  }

  async write(gomi: Gomi) {
    await writeFile(this, gomi);
  }

  static async load(filepath: string) {
    const { base, ext } = parse(filepath);
    const shouldCopy = ![".html", ".xml", ".scss", ".md"].includes(ext);
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
