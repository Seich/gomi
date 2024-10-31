import { serveDir } from "@std/http";
import { Gomi } from "./gomi.ts";
import { injectLiveReloadScript } from "./liveReloadServer.ts";

export const serveGomita = (gomi: Gomi) => {
  return async (req: Request) => {
    const res = await serveDir(req, {
      fsRoot: Gomi.outputDir,
      showIndex: true,
      showDirListing: true,
    });

    // When reload events are enabled attach livereload to html pages
    if (
      gomi.events.areEnabled() &&
      res.headers.get("content-type")?.includes("text/html")
    ) {
      return injectLiveReloadScript(req, res);
    }

    return res;
  };
};
