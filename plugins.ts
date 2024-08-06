import { existsSync, walk } from "@std/fs";
import { toFileUrl } from "@std/path";
import { dynamicImport } from "https://deno.land/x/import@0.2.1/mod.ts";
import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";

export type Plugin = (engine: Liquid, tokenizer: typeof Tokenizer) => void;

const plugins: Plugin[] = [];
export const getPlugins = async (pluginsDir: string) => {
  if (!existsSync(pluginsDir) || plugins.length > 0) {
    return plugins;
  }

  const files = walk(pluginsDir, {
    exts: [".liquid.ts"],
    includeDirs: false,
    includeSymlinks: false,
  });

  for await (const file of files) {
    const plugin = await dynamicImport(toFileUrl(file.path).toString());
    plugins.push(plugin.default);
  }

  return plugins;
};
