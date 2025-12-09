import solidDevTools from "solid-devtools/vite";
import solidPlugin from "vite-plugin-solid";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    solidDevTools({
      autoname: true,
    }),
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
