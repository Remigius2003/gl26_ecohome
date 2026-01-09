import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      devtools({
        autoname: true,
        locator: true,
      }),
      solidPlugin(),
    ],
    define: {
      "import.meta.env.VITE_AUTH_HOST": JSON.stringify(env.AUTH_HOST),
      "import.meta.env.VITE_GAME_HOST": JSON.stringify(env.GAME_HOST),
    },
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@scene": path.resolve(__dirname, "src/scene"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@api": path.resolve(__dirname, "src/api"),
      },
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        protocol: "wss",
        host: "localhost",
        path: "/sockjs-node",
        port: 443,
      },
      port: 3000,
      host: true,
    },
    build: { target: "esnext" },
  };
});
