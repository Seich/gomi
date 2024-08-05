import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";

const image = (engine: Liquid, tokenizer: Tokenizer) => {
  engine.registerTag("image", {
    parse(tagToken) {
      this.params = tagToken.args.match(/(?:[^\s"]+|"[^"]*")+/g);
      this.filename = this.params[0];
      this.alt = this.params[1];// TODO: Remove outer "'s
    },
    render(ctx) {
      const path = ctx.environments.page.url
        .replace(".html", "")
        .split("/")
        .join("-");

      return `<img src="/files/${path}/${this.filename}" alt="${this.alt}" />`;
    },
  });
};

export default image;
