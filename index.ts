import { createCLI, option } from "@bunli/core";
import { z } from "zod";
import { version } from "./package.json";
import {
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
} from "@logtape/logtape";
import { Gomi } from "./src/gomi";

await configure({
  sinks: {
    console: getConsoleSink({
      formatter: getAnsiColorFormatter(),
    }),
  },
  loggers: [
    { category: "gomi", lowestLevel: "debug", sinks: ["console"] },
    { category: ["logtape", "meta"], sinks: [] },
  ],
});

const cli = await createCLI({
  name: "gomi(ta)",
  version,
  description: "The small, blog-aware static site builder.",
});

cli.command({
  name: "serve",
  description: "compiles and serves",
  options: {
    watch: option(z.coerce.boolean().default(true), {
      description:
        "Automatically rebuild the website whenever a file is changed",
    }),
    hot: option(z.coerce.boolean().default(false), {
      description: "Automatically reload the website after every update.",
    }),
  },
  async handler({ flags }) {
    getLogger("gomi").info(`Gomi(ta) v${version}`);
    await Gomi.serve(flags.watch, flags.hot);
  },
});

await cli.run();
