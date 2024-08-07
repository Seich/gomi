import { Liquid } from "https://esm.sh/liquidjs@10.16.1";

const image = (engine: Liquid) => {
  engine.registerTag("image", {
    parse(tagToken) {
      this.params = tagToken.args.match(/(?:[^\s"]+|"[^"]*")+/g);
      this.filename = this.params[0];
      this.alt = this.params[1].replace(/^"(.+(?="$))"$/, "$1");
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
