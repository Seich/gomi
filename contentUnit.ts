export type ContentUnit = {
  url: string;
  filename: string;
  input: string;
  ext: string;
  meta: Record<string, unknown>;
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
