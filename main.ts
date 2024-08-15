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
  All settings available for gomi are handled by environment variables. A .env file
  can be used to configure gomi.

    PORT
        The port the server should run on, if not set a random port is chosen.
    INPUT
        The directory to build. 
    OUTPUT
        The directory where the build result will be placed.
    SHIKI_THEME_DARK
        The syntax highlighter colorscheme to user for a dark theme.
    SHIKI_THEME_LIGHT
        The syntax highlighter colorscheme to user for a light theme.
    SITE_*
        Any environment variable starting with SITE_ will be available when building 
        to the templates.

Layouts:
  Any file named _layout.html will be used as layout for the current directory
  and all of it's decendants. They are nested within their ancestors. These are 
  processed using liquid. They have site, post and page contexts available.
  {{ content }} will be replaced within the layout with their descendants and 
  their content.

  For example here's how you'd show a list of posts:

  {% for post in site.posts limit:10 %}
    <a href="{post.url}">{{post.title}}</a>
  {% endfor %}


Posts:
  The _posts directory is special, the file names are used to determine it's final
  url. They follow the same format as jekyll: YEAR-MONTH-DAY-title.md and are placed
  in the equivalent url: /YEAR/MONTH/DAY/title.html

  Anything placed on the frontmatter will be available at build time under the post context
  for liquid to use on layouts. 

  Posts allow for markdown and liquid to be used simultaneously. Liquid is processed
  first and then markdown before finally being embedded within it's corresponding template
  and being processed by liquid one last time. There's a "dynamic" filter available
  to process liquid once more at any point in time if needed.

Files
  All files not under _posts are copied over to the output as they are. Some files 
  receive some additional processing:

  HTML
    html files are embedded on their respective layouts and ran through liquid.

  SCSS
    Sass files are compiled before being placed on the same place in the output directory. 
    Their extension is changed over to be .css

Plugins
  A very basic plugin system is available to add additional tags and filters to liquid.
  Any file ending with .liquid.ts place in the _plugins directory will be loaded.
  We are using liquidjs under the hood.

  Here's a minimal example:

    const hello = (engine: Liquid, tokenizer: Tokenizer) => {
      engine.registerTag("hello", {
        parse(tagToken) {},
        render(ctx) {
          return "Hello!"
        },
      });
    };

    export default hello;
  
  More information is available here: https://liquidjs.com/tutorials/register-filters-tags.html
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
      try {
        gomi.compile(_event.paths);
      } catch (e) {
        console.log(e);
      }
    }
  }
}

main();
