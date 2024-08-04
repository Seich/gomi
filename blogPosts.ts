import { format, parse } from "@std/path";
import { test as frontmatterPresent, extractYaml } from "@std/front-matter";
import { walk } from "@std/fs";
import { ContentUnit } from "./gomi.ts";

const getBlogPost = async (input: string): Promise<ContentUnit> => {
  // Parse filename
  const { name, ext } = parse(input);

  const nameComponents = name.split("-");
  const dateComponents = nameComponents.splice(0, 3).map((v) => parseInt(v));

  const [year, month, day] = dateComponents;
  const date = new Temporal.PlainDate(year, month, day);

  const filename = format({
    name: nameComponents.join("-"),
    ext: ".html",
  });

  const url = [...name.split("-").slice(0, 3), filename].join("/");

  // Read content
  const fileContent = await Deno.readTextFile(input);
  let body = fileContent;
  let attrs: Record<string, string> = {};

  if (frontmatterPresent(fileContent)) {
    const frontmatter = extractYaml<Record<string, string>>(fileContent);
    body = frontmatter.body;
    attrs = frontmatter.attrs;
  }

  return {
    type: "blogPost",
    filename,
    url,
    input,
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
    Temporal.PlainDate.compare(b.meta.date, a.meta.date),
  );
};
