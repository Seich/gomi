import { walk } from "@std/fs";
import { format, join, parse } from "@std/path";

import { renderLiquid } from "./exts/liquid.ts";
import { renderMD } from "./exts/md.ts";
import {
  FileUnit,
  ParsedFile,
  readFileWithFrontMatter,
  writeFile,
} from "./files.ts";
import { Gomi } from "./gomi.ts";
import { hashString } from "./hash.ts";

export class BlogPost implements FileUnit {
  file: ParsedFile;
  shouldCopy = false;
  content = "";
  hash = "";

  title = "";
  date = "";
  url = "";

  constructor(file: ParsedFile) {
    this.file = file;

    this.title = (file.meta?.title as string) ?? "";
    this.date = (file.meta?.date as string) ?? "";
    this.url = file.url;
  }

  async compile() {
    const hash = await hashString(this.file.input?.content ?? "");
    if (hash === this.hash) return;
    if (!this.file.input.content) return;

    this.content = await renderMD(this.file.input.content);
    this.hash = hash;

    return;
  }

  async reload(gomi: Gomi) {
    try {
      const { attrs, body } = await readFileWithFrontMatter(
        this.file.input.filepath,
      );

      this.file.meta = {
        ...this.file.meta,
        ...attrs,
      };

      this.file.input.content = body;
      this.compile();
      this.write(gomi);
    } catch (e) {
      console.log(e);
    }
  }

  async write(gomi: Gomi) {
    await writeFile(this, gomi);
  }

  static parseFilename(filepath: string): ParsedFile {
    const { name, ext } = parse(filepath);

    const nameComponents = name.split("-");
    const dateComponents = nameComponents.splice(0, 3).map((v) => parseInt(v));

    const [year, month, day] = dateComponents;
    const date = new Temporal.PlainDate(year, month, day);

    const filename = format({
      name: nameComponents.join("-"),
      ext: ".html",
    });

    const url = join(...name.split("-").slice(0, 3), filename);

    return {
      filename,
      url,
      meta: {
        date: date.toString(),
      },
      input: {
        filepath,
        ext,
      },
    };
  }

  static async load(filepath: string) {
    const post = BlogPost.parseFilename(filepath);
    const { attrs, body } = await readFileWithFrontMatter(filepath);

    post.meta = {
      ...post.meta,
      ...attrs,
    };

    post.input.content = body;

    const blogPost = new BlogPost(post);
    await blogPost.compile();
    return blogPost;
  }

  static async loadAll() {
    try {
      const files = walk(Gomi.postsDir, {
        exts: [".md"],
        includeDirs: false,
        includeSymlinks: false,
      });

      const blogPosts: BlogPost[] = [];
      for await (const file of files) {
        const post = await BlogPost.load(file.path);
        blogPosts.push(post);
      }

      return blogPosts.sort((a, b) =>
        Temporal.PlainDate.compare(
          b.file.meta.date as string,
          a.file.meta.date as string,
        ),
      );
    } catch (_) {
      return [];
    }
  }
}
