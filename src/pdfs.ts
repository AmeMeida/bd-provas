export const pdfs = Object.fromEntries(
  Object.entries(
    import.meta.glob("./banco-de-provas/**/*.pdf", {
      query: "?url",
      import: "default",
      eager: true,
    }) as Record<string, string>,
  ).map(([path, file]) => {
    const fixedPath = path.replace("./banco-de-provas/", "");

    return [fixedPath, file];
  }),
);

type Folder = {
  files: string[];
  folders: Record<string, Folder>;
};

function folderize(paths: Record<string, string>) {
  let folders: Record<string, Folder> = {};

  for (const [path, file] of Object.entries(paths)) {
    const paths = path.split("/");

    paths.pop();
    const lastFolder = paths.pop()!;

    let current = folders;

    for (const p of paths) {
      if (!current[p]) {
        current[p] = { files: [], folders: {} };
      }

      current = current[p].folders;
    }

    if (!current[lastFolder]) {
      current[lastFolder] = { files: [], folders: {} };
    }

    current[lastFolder].files.push(file);
  }

  return folders;
}

export const folders = folderize(pdfs);
