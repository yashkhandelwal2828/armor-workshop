import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: { workshop: "index.html", credits: "credits.html" },
    },
  },
});
