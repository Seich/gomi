import { BlogPost } from "../blogPosts.ts";
import { LayoutCalculator } from "../layouts.ts";
import { StaticFile } from "../staticFiles.ts";

export const renderMD = (
  file: BlogPost | StaticFile,
  layout: LayoutCalculator,
) => {
  // console.log(file);
  console.log(layout.for(file.input));
};
