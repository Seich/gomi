import { Hash, Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";
import { getPlugins } from "../plugins.ts";
import { codeToHtml } from "npm:shiki";

export const registerCodeTag = (engine: Liquid) => {
  const lightTheme = Deno.env.get("SHIKI_THEME_LIGHT") ?? "min-light";
  const darkTheme = Deno.env.get("SHIKI_THEME_DARK") ?? "min-dark";

  engine.registerTag("code", {
    parse(tagToken, remainTokens) {
      this.args = new Hash(tagToken.args);
      this.tpls = [];
      this.liquid.parser
        .parseStream(remainTokens)
        .on("template", (tpl) => this.tpls.push(tpl))
        .on("tag:endcode", function () {
          this.stop();
        })
        .on("end", () => {
          throw new Error(`tag ${tagToken.getText()} not closed`);
        })
        .start();
    },
    *render(context, emitter) {
      const { lang } = yield this.args.render(context);
      emitter.write("<code>");
      const a = yield this.liquid.render(this.tpls, context.getAll(), context.opts)
      const code: string = yield codeToHtml(a.trim(), {
        lang: lang ?? "text",
        themes: {
          light: lightTheme,
          dark: darkTheme,
        },
      });
      emitter.write(code);
      emitter.write("</code>");
    },
  });
};

export const renderLiquid = async (content: string, variables: object) => {
  const engine = new Liquid({});
  const plugins = await getPlugins();
  plugins.forEach((p) => p(engine, Tokenizer));

  engine.registerFilter("dynamic", function (content) {
    return this.liquid.parseAndRender(content, this.context.getAll());
  });

  registerCodeTag(engine);

  try {
    const f = await engine.parseAndRender(content, variables);
    return f;
  } catch (e) {
    console.error(e);
    return "";
  }
};
