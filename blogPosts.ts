import { format, join, parse } from "@std/path";
import { walk } from "@std/fs";
import { ContentUnit } from "./contentUnit.ts";
import { readFileWithFrontMatter } from "./files.ts";

const getBlogPost = async (filepath: string): Promise<ContentUnit> => {
  // Parse filename
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

  // Read content
  const { body, attrs } = await readFileWithFrontMatter(filepath);

  return {
    type: "blogPost",
    filename,
    url,
    input: filepath,
    ext,
    meta: { date: date.toString(), ...attrs },
    content: body,
  };
};

export const getBlogPosts = async (postsDir: string) => {
  const files = walk(postsDir, {
    exts: [".md"],
    includeDirs: false,
    includeSymlinks: false,
  });

  const blogPosts: ContentUnit[] = [];
  for await (const file of files) {
    const post = await getBlogPost(file.path);
    blogPosts.push(post);
  }

  return blogPosts.sort((a, b) =>
    Temporal.PlainDate.compare(b.meta.date as string, a.meta.date as string),
  );
};
