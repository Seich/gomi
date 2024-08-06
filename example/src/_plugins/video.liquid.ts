import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";

const video = (engine: Liquid, tokenizer: Tokenizer) => {
  engine.registerTag("video", {
    parse(tagToken) {
      this.params = tagToken.args.match(/(?:[^\s"]+|"[^"]*")+/g);
      this.filename = this.params[0];
    },
    render(ctx) {
      const path = ctx.environments.page.url
        .replace(".html", "")
        .split("/")
        .join("-");

      return ` <video playsinline="" muted="muted" autoplay="autoplay" preload="auto" loop="loop">
    <source
        src="/files/${path}/${this.filename}"
        type="video/mp4" />
    </video>`;
    },
  });
};

export default video;
