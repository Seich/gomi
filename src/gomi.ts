import { Config } from "./config";
import { watch } from "node:fs/promises";
import { resolve } from "node:path";
import { getLogger, type Logger } from "@logtape/logtape";
import { Glob } from "bun";

import { Environment } from "binja";

export class Gomi {
  config: Config;
  logger: Logger;
  environment: Environment;

  constructor() {
    this.config = new Config();
    this.logger = getLogger("gomi");
    this.environment = new Environment({});
  }

  static async serve(shouldWatch: boolean, _isHot: boolean) {
    const gomi = new Gomi();

    gomi.config.print();
    await gomi.compile();

    Bun.serve({
      port: 8080,
      async fetch(req) {
        const path = new URL(req.url).pathname.replace("/", "");
        const file = Bun.file(resolve(gomi.config.outputDir, path));
        return new Response(file);
      },
    });

    if (shouldWatch) {
      gomi.logger.info(`Watching ${gomi.config.inputDir} for changes`);
      const watcher = watch(gomi.config.inputDir, { recursive: true });
      for await (const event of watcher) {
        gomi.logger.info(`Compiling ${event.filename}`);
        await gomi.compile();
        gomi.logger.info(`Done.`);
      }
    }
  }

  async compile() {
    const glob = new Glob("*.{html}");
    for await (const filename of glob.scan({ cwd: this.config.inputDir })) {
      if (filename.includes("_layout.html")) return;

      const inputFile = Bun.file(resolve(this.config.inputDir, filename));
      const outFile = Bun.file(resolve(this.config.outputDir, filename));



      const file = await inputFile.text();
      const content = await this.environment.renderString(file);

      await outFile.write(content);
    }
  }
}
