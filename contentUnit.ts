export type ContentUnit = {
  url: string;
  filename: string;
  input: string;
  ext: string;
  meta: object;
} & (
  | {
      type: "blogPost";
      content: string;
      meta: {
        date: string;
      };
    }
  | {
      type: "staticFile";
    }
);
