import "@std/dotenv/load";

import { debounce } from "@std/async";
import { parseArgs } from "@std/cli";
import { serveDir } from "@std/http";
import { Gomi } from "./gomi.ts";

const gomi = await Gomi.build();

const compile = debounce(() => {
  console.log("File changed. Rebuilding...");
  gomi.compile();
}, 500);

const args = parseArgs(Deno.args);
if (args._.includes("serve")) {
  compile();

  Deno.serve(
    {
      port: parseInt(Deno.env.get("PORT") ?? "8000"),
    },
    (req) =>
      serveDir(req, {
        fsRoot: Gomi.outputDir,
        showIndex: true,
        showDirListing: true,
      }),
  );
}

if (args._.includes("build")) {
  compile();
}

if (args.watch) {
  const watcher = Deno.watchFs(Gomi.inputDir);
  for await (const _event of watcher) {
    compile();
  }
}
