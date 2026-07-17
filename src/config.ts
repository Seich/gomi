import { resolve } from "node:path";
import { version } from "../package.json";
import { getLogger, type Logger } from "@logtape/logtape";

export class Config {
  outputDir: string;
  inputDir: string;
  postsDir: string;
  version: string;
  logger: Logger;

  constructor() {
    this.outputDir = resolve(process.env?.OUTPUT ?? "./output/");
    this.inputDir = resolve(process.env?.INPUT ?? "./src");
    this.postsDir = resolve(this.inputDir, "_posts");
    this.version = version;
    this.logger = getLogger("gomi");
  }

  print() {
    this.logger.info(`OUTPUT = ${this.outputDir}`);
    this.logger.info(`INPUT = ${this.inputDir}`);
    this.logger.info(`POSTS = ${this.postsDir}`);
  }
}
