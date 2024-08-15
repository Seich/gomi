import sass from "https://deno.land/x/denosass@1.0.6/mod.ts";

export const renderScss = (content: string) => {
  if (!content) return "";

  const compiler = sass(content);
  const output = compiler.to_string("expanded") as string;
  return output;
};
