import { Liquid, Tokenizer } from "https://esm.sh/liquidjs@10.16.1";

const flickr = (engine: Liquid, tokenizer: Tokenizer) => {
  engine.registerTag("flickr", { parse() {}, render() {} });
  engine.registerTag("endflickr", { parse() {}, render() {} });
};

export default flickr;
