import "@std/dotenv/load";

import { parseArgs } from "@std/cli";
import { serveDir } from "@std/http";
import { Gomi } from "./gomi.ts";

const gomi = await Gomi.build();

const args = parseArgs(Deno.args);
if (args._.includes("serve")) {
  gomi.compile();

  Deno.serve(
    {
      port: parseInt(Deno.env.get("PORT") ?? "0"),
    },
    (req) =>
      serveDir(req, {
        fsRoot: Gomi.outputDir,
        showIndex: true,
        showDirListing: true,
      }),
  );
} else {
  await gomi.compile();
}

if (args.watch) {
  const watcher = Deno.watchFs(Gomi.inputDir);
  for await (const _event of watcher) {
    gomi.compile(_event.paths);
  }
}
