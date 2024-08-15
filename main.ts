import "@std/dotenv/load";

import { parseArgs } from "@std/cli";
import { serveDir } from "@std/http";
import { Gomi } from "./gomi.ts";

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["watch", "version", "help"],

    alias: {
      version: "v",
      watch: "w",
      help: "h",
    },
  });

  if (args.help) {
    console.log(`
Gomi(ta) a small static site generator.
Docs: https://gomita.alchem.ee
Bugs: https://github.com/seich/gomi/issues

To build the site:
  gomi

To serve the site:
  gomi serve

To automatically rebuild the site as it's updated:
  gomi serve --watch
or:
  gomi --watch

Commands:
  serve       Builds the site and starts a server for it
  build       Builds the site

Options:
  -v, --version
      Show the version of gomi currently running.
  -w, --watch
      Automatically rebuild the site whenever a file is changed
  -h, --help
      Prints this message

Environment Variables:
  PORT
      The port the server should run on, if not set a random port is chosen.
  INPUT
      The folder to build. 
  OUTPUT
      The folder where the build result will be placed.
  SHIKI_THEME_DARK
      The syntax highlighter colorscheme to user for a dark theme.
  SHIKI_THEME_LIGHT
      The syntax highlighter colorscheme to user for a light theme.
  SITE_*
      Any environment variable starting with SITE_ will be available when building 
      to the templates.
`);
    return;
  }

  if (args.version) {
    console.log(`Gomi(ta) v${Gomi.version}`);
    return;
  }

  const gomi = await Gomi.build();
  await gomi.compile();
  if (args._.includes("serve")) {
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
  }

  if (args.watch) {
    const watcher = Deno.watchFs(Gomi.inputDir);
    for await (const _event of watcher) {
      gomi.compile(_event.paths);
    }
  }
}

await main();
