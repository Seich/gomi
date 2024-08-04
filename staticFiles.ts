import { walk } from "@std/fs";
import { parse } from "@std/path";

export interface StaticFile {
  type: "staticFile";
  url: string;
  filename: string;
  input: string;
  ext: string;
  meta: Record<string, never>;
}

const getStaticFile = (input: string, url: string): StaticFile => {
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

  const staticFiles: StaticFile[] = [];
  for await (const file of files) {
    if (file.name.startsWith(".")) continue; // Exclude hidden files
    if (file.path.includes("/_")) continue; // Exclude files under dirs that starts with _
    staticFiles.push(getStaticFile(file.path, file.path.replace(inputDir, "")));
  }

  return staticFiles;
};
