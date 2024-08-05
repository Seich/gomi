import sass from "https://deno.land/x/denosass@1.0.6/mod.ts";
import { format, parse } from "@std/path";
import { ContentUnit } from "../contentUnit.ts";

export const renderScss = async (file: ContentUnit) => {
  const path = parse(file.url);
  path.ext = ".css";
  path.base = "";

  file.url = format(path);

  const fileContent = await Deno.readTextFile(file.input);
  const compiler = sass(fileContent);
  const output = compiler.to_string("expanded") as string;
  return output;
};
