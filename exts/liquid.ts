import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";
import { Gomi } from "../gomi.ts";
import { getPlugins } from "../plugins.ts";

export const renderLiquid = async (content: string, variables: object) => {
  const engine = new Liquid({});
  const plugins = await getPlugins(Gomi.pluginsDir);
  plugins.forEach((p) => p(engine, Tokenizer));

  try {
    const f = await engine.parseAndRender(content, variables);
    return f;
  } catch (e) {
    console.log(e);
  }
};
