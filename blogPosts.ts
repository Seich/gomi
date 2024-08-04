import { format, parse } from "@std/path";
import { walk } from "@std/fs";

export interface BlogPost {
  type: "blogPost";
  url: string;
  filename: string;
  input: string;
  ext: string;
  meta: {
    date: Temporal.PlainDate;
  };
}

const getBlogPost = (input: string): BlogPost => {
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

  const url = [...dateComponents, filename].join("/");

  return {
    type: "blogPost",
    filename,
    url,
    input,
    ext,
    meta: { date },
  };
};

export const getBlogPosts = async (postsDir: string) => {
  const files = walk(postsDir, {
    exts: [".md"],
    includeDirs: false,
    includeSymlinks: false,
  });

  const blogPosts = [];
  for await (const file of files) {
    blogPosts.push(getBlogPost(file.path));
  }

  return blogPosts.sort((a, b) =>
    Temporal.PlainDate.compare(a.meta.date, b.meta.date),
  );
};
