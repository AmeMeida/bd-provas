import { defineConfig } from "astro/config";
import rehypeMathjax from "rehype-mathjax";
import remarkMath from "remark-math";

// https://astro.build/config
export default defineConfig({
  site: "https://amemeida.github.io/bd-provas",
  base: "bd-provas",
  prefetch: true,
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeMathjax],
  },
});
