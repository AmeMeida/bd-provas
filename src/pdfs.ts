export const pdfs = Object.fromEntries(Object.entries(import.meta.glob("./banco-de-provas/**/*.pdf", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>).map(([path, file]) => {
  let fixedPath = path.replace("./banco-de-provas/", "");
  let paths = fixedPath.split("/")

  if (paths.length === 3) {
    paths.push(paths[2]!)
    paths[2] = "pdfs"
  }

  return [paths.join("/"), file]
}));

type NestedPaths = Record<string, Record<string, Record<string | "pdfs", string[]>>>

function groupUrls(urls: string[]): NestedPaths {
  const materia: NestedPaths = {};

  for (const url of urls) {
    const parts = url.split("/").filter(Boolean);

    if (!materia[parts[0]!])
      materia[parts[0]!] = {}

    const curso = materia[parts[0]!]!

    if (!curso[parts[1]!]) {
      curso[parts[1]!] = {}
    }

    const professor = curso[parts[1]!]!;

    if (!professor[parts[2]!]) {
      professor[parts[2]!] = [];
    }

    const provas = professor[parts[2]!]!;

    provas.push(parts[3]!)
  }

  return materia;
}

export const folders = groupUrls(Object.keys(pdfs)) as NestedPaths
