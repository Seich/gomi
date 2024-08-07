import { Liquid } from "https://esm.sh/liquidjs@10.16.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const flickr = (engine: Liquid) => {
  const api_key = Deno.env.get("FLICKR_KEY");
  const user_id = Deno.env.get("FLICKR_USER");

  engine.registerTag("flickr", {
    parse(tagToken, remainTokens) {
      this.tpls = [];
      this.liquid.parser
        .parseStream(remainTokens)
        .on("template", (tpl) => this.tpls.push(tpl))
        .on("tag:endflickr", function () {
          this.stop();
        })
        .on("end", () => {
          throw new Error(`tag ${tagToken.getText()} not closed`);
        })
        .start();
    },
    *render(context, emitter) {
      if (!api_key || !user_id) return "";

      const res: Response = yield fetch(
        `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&per_page=6&format=json&nojsoncallback=1&sort=date-taken-desc&extras=url_z`,
      );
      const data = yield res.json();

      for (const photo of data.photos.photo) {
        const res = yield fetch(photo.url_z);
        const data = yield res.arrayBuffer();
        const image = encodeBase64(data);
        context.push({
          image: `data:image/jpg;base64,${image}`,
          url: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`,
          alt: photo.title,
        });
        yield this.liquid.renderer.renderTemplates(this.tpls, context, emitter);
        context.pop();
      }
    },
  });
};

export default flickr;
