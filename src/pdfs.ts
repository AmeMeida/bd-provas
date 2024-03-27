export const pdfs = import.meta.glob("./banco-de-provas/**/*.pdf", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;
