export const files = import.meta.glob("./banco-de-provas/**/*.pdf", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type Folder = {
  files: [string, string][];
  folders: Record<string, Folder>;
};

export type FlatFolder = {
  path: string;
  files: [string, string][];
  folders: string[];
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

    const filePath = paths.join("/").replace(/\..+$/, "");

    if (paths.length === 1) {
      rootFolder.files.push([filePath, file]);
      continue;
    }

    paths.pop();
    const lastFolder = paths.pop()!;

    let current = rootFolder.folders;

    for (const p of paths) {
      if (!current[p!]) {
        current[p!] = { files: [], folders: {} };
      }

      current = current[p!]!.folders!;
    }

    if (!current[lastFolder]) {
      current[lastFolder] = { files: [], folders: {} };
    }

    current[lastFolder!]?.files.push([filePath, file]);
  }

  return rootFolder;
}

function flattenFolder(folder: Folder, path: string = ""): FlatFolder[] {
  const folders = Object.entries(folder.folders).flatMap(
    ([folderName, folder]) => {
      return flattenFolder(folder, `${path}/${folderName}`);
    },
  );

  return [
    {
      path: path || "/",
      files: folder.files,
      folders: Object.keys(folder.folders),
    },
    ...folders,
  ];
}

export const folders = flattenFolder(folderize(files));
