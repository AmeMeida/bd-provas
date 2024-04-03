export const pdfs = import.meta.glob("./banco-de-provas/**/*.pdf", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

type Folder = {
  files: string[];
  folders: Record<string, Folder>;
};

function folderize(paths: Record<string, string>): Folder {
  const rootFolder: Folder = {
    files: [],
    folders: {},
  };

  for (const [path, file] of Object.entries(paths)) {
    const paths = path.split("/");

    paths.shift();
    paths.shift();

    if (paths.length === 1) {
      rootFolder.files.push(file);
      continue;
    }

    paths.pop();
    const lastFolder = paths.pop()!;

    let current = rootFolder.folders;

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

  return rootFolder;
}

export const folders = folderize(pdfs);
