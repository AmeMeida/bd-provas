import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { markdownFiles } from "./markdown.astro";

export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-\/]+/g, "")
    .replace(/--+/g, "-");
}

export const referenceFiles = import.meta.glob(
  "./banco-de-provas/*/**/*.{pdf,md,mdx,c,js,java,py}",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

export const inlineFiles = import.meta.glob(
  "./banco-de-provas/*/**/*.{c,js,java,py}",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

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
  uri: string;
} & (
  | {
      type: "reference";
    }
  | {
      type: "inline";
      content: string;
    }
  | {
      type: "markdown";
      content: AstroComponentFactory;
    }
);

// export const referenceFormats = [
//   ".pdf",
//   ".doc",
//   ".docx",
//   ".ppt",
//   ".pptx",
//   ".xls",
//   ".xlsx",
// ];
const inlineFormats = [".c", ".txt", ".html", ".js", ".ts", ".json"];

function addPath(files: File[], file: File) {
  if (files.some((folderFile) => folderFile.slug === file.slug)) {
    file.slug += "-1";

    const name = file.name.split(".")
    name[0] += "-1"

    file.name = name.join(".")
  }

  files.push(file)
}

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
      slug: slugify(paths.join("/").replace(/\..+$/, "")),
      uri: fileUrl,
      ...(inlineFormats.includes(extension)
        ? {
            type: "inline",
            content: inlineFiles[path]!,
          }
        : extension === ".md" || extension === ".mdx"
          ? {
              type: "markdown",
              content: markdownFiles[path]?.Content as AstroComponentFactory,
            }
          : {
              type: "reference",
            }),
    };

    if (paths.length === 1) {
      addPath(rootFolder.files, file)
      continue;
    }

    paths.pop();
    const lastFolder = paths.pop()!;

    let current = rootFolder.folders;

    for (const p of paths) {
      if (!current[p!]) {
        current[p!] = {
          slug: slugify(paths.slice(0, paths.indexOf(p!) + 1).join("/")),
          files: [],
          folders: {},
        };
      }

      current = current[p!]!.folders!;
    }

    if (!current[lastFolder]) {
      current[lastFolder] = {
        slug: slugify(paths.join("/") + "/" + lastFolder),
        files: [],
        folders: {},
      };
    }

    addPath(current[lastFolder!]?.files!, file)
  }

  return rootFolder;
}

export function flattenFolder(folder: Folder, path: string = ""): FlatFolder[] {
  const folders = Object.entries(folder.folders).flatMap(
    ([folderName, folder]) => {
      return flattenFolder(folder, path ? `${path}/${folderName}` : folderName);
    },
  );

  return [
    {
      slug: !!path ? slugify(path) : "/",
      files: folder.files,
      folders: Object.entries(folder.folders).map(([folderName, folder]) => ({
        name: folderName,
        slug: slugify(folder.slug),
      })),
    },
    ...folders,
  ];
}

const preFolders = folderize(referenceFiles);
export const folders = flattenFolder(preFolders);
