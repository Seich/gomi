import { existsSync, walk } from "@std/fs";
import { importString } from "https://deno.land/x/import@0.2.1/mod.ts";
import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";
import { Gomi } from "./gomi.ts";

export type Plugin = (engine: Liquid, tokenizer: typeof Tokenizer) => void;

const plugins: Plugin[] = [];
export const getPlugins = async () => {
  if (!existsSync(Gomi.pluginsDir) || plugins.length > 0) {
    return plugins;
  }

  const files = walk(Gomi.pluginsDir, {
    exts: [".liquid.ts"],
    includeDirs: false,
    includeSymlinks: false,
  });

  for await (const file of files) {
    console.log(`Loading: ${file.path}`);
    const plugin = await importString(await Deno.readTextFile(file.path));
    plugins.push(plugin.default);
  }

  return plugins;
};
