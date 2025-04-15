import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isProd = mode === "production";

  return {
    base: "/", // ← вот здесь теперь правильно

    build: {
      outDir: path.resolve(__dirname, "dist"),
      sourcemap: !isProd,
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
            },
          }
        : {},
      chunkSizeWarningLimit: 500,
    },

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    server: {
      port: 5173,
      open: true,
      historyApiFallback: true,
    },

    optimizeDeps: {
      include: isProd ? ["react", "react-dom"] : [],
    },

    css: {
      postcss: {
        plugins: [],
      },
    },
  };
});
