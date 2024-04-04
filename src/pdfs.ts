export const referenceFiles = import.meta.glob("./banco-de-provas/*/**/*.pdf", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const inlineFiles = import.meta.glob("./banco-de-provas/*/**/*.{md,mdx,c}", {
  query: "?raw",
  import: "default",  
  eager: true,
}) as Record<string, string>;

export type Folder = {
  slug: string;
  files: File[];
  folders: Record<string, Folder>;
};

export type FlatFolder = {
  slug: string;
  files: File[];
  folders: {
    name: string;
    slug: string;
  }[];
};

export type File = {
  name: string;
  slug: string;
} & (
  | {
      type: "reference";
      uri: string;
    }
  | {
      type: "inline";
      content: string;
    }
);

const referenceFormats = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"];
// const inlineFormats = [".md", ".mdx", ".c", ".txt", ".html", ".js", ".ts", ".json"];

function folderize(paths: Record<string, string>): Folder {
  const rootFolder: Folder = {
    slug: "",
    files: [],
    folders: {},
  };

  for (const [path, fileUrl] of Object.entries(paths)) {
    const paths = path.split("/");

    paths.shift();
    paths.shift();

    const extension = "." + paths[paths.length - 1]!.split(".").pop()!;

    const file: File = {
      name: paths[paths.length - 1]!,
      slug: paths.join("/").replace(/\..+$/, ""),
      ...(referenceFormats.includes(extension) ? {
        type: "reference",
        uri: fileUrl,
      } : {
        type: "inline",
        content: fileUrl
      }),
    };

    if (paths.length === 1) {
      rootFolder.files.push(file);
      continue;
    }

    paths.pop();
    const lastFolder = paths.pop()!;

    let current = rootFolder.folders;

    for (const p of paths) {
      if (!current[p!]) {
        current[p!] = {
          slug: paths.slice(0, paths.indexOf(p!) + 1).join("/"),
          files: [],
          folders: {},
        };
      }

      current = current[p!]!.folders!;
    }

    if (!current[lastFolder]) {
      current[lastFolder] = {
        slug: paths.join("/") + "/" + lastFolder,
        files: [],
        folders: {},
      };
    }

    current[lastFolder!]?.files.push(file);
  }

  return rootFolder;
}

function flattenFolder(folder: Folder, path: string = ""): FlatFolder[] {
  const folders = Object.entries(folder.folders).flatMap(
    ([folderName, folder]) => {
      return flattenFolder(folder, path ? `${path}/${folderName}` : folderName);
    },
  );

  return [
    {
      slug: path,
      files: folder.files,
      folders: Object.entries(folder.folders).map(([folderName, folder]) => ({
        name: folderName,
        slug: folder.slug,
      })),
    },
    ...folders,
  ];
}

export const folders = flattenFolder(folderize({...referenceFiles, ...inlineFiles}));
