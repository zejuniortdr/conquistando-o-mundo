// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://zejuniortdr.github.io",
  base: "/conquistando-o-mundo",
  trailingSlash: "always",
  build: { format: "directory" },
  image: { responsiveStyles: true },
});
