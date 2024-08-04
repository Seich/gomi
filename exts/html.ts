import { Liquid } from "https://esm.sh/liquidjs@10.16.1";

const customTags = null;

export const renderHTML = async (content: string, variables: object) => {
  const engine = new Liquid();
  engine.registerTag("image", {
    parse: function (tagToken: TagToken, remainTokens: TopLevelToken[]) {},
    render: function* (ctx: Context) {},
  });
  engine.registerTag("video", {
    parse: function (tagToken: TagToken, remainTokens: TopLevelToken[]) {},
    render: function* (ctx: Context) {},
  });
  engine.registerTag("flickr", {
    parse: function (tagToken: TagToken, remainTokens: TopLevelToken[]) {},
    render: function* (ctx: Context) {},
  });
  engine.registerTag("endflickr", {
    parse: function (tagToken: TagToken, remainTokens: TopLevelToken[]) {},
    render: function* (ctx: Context) {},
  });
  const f = await engine.parseAndRender(content, variables);

  return f;
};
