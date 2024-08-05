import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";
import { Gomi } from "../gomi.ts";

export const renderLiquid = async (
  content: string,
  variables: object,
  gomi: Gomi,
) => {
  const engine = new Liquid({});
  gomi.plugins.forEach((p) => p(engine, Tokenizer));

  const f = await engine.parseAndRender(content, variables);

  return f;
};
