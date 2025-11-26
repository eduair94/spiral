import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/spiral/", // GitHub Pages base path - matches repo name: eduair94/spiral
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
