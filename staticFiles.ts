import { walk } from "@std/fs";
import { parse } from "@std/path";
import { ContentUnit } from "./gomi.ts";

const getStaticFile = (input: string, url: string): ContentUnit => {
  const { base, ext } = parse(input);
  return {
    type: "staticFile",
    filename: base,
    url,
    input,
    ext,
    meta: {},
  };
};

export const getStaticFiles = async (inputDir: string) => {
  const files = walk(inputDir, {
    includeDirs: false,
    includeSymlinks: false,
  });

  const staticFiles: ContentUnit[] = [];
  for await (const file of files) {
    if (file.name.startsWith(".")) continue; // Exclude hidden files
    if (file.path.includes("/_")) continue; // Exclude files under dirs that starts with _
    staticFiles.push(getStaticFile(file.path, file.path.replace(inputDir, "")));
  }

  return staticFiles;
};
