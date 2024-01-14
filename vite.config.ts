import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";
import dts from "vite-plugin-dts";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src", "index.ts"),
      name: "Table",
      fileName: (format) => `lib.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
        },
        // exports: "named",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@testing-library/jest-dom": "./node_modules/@testing-library/jest-dom",
    },
    extensions: [".js", ".ts", ".json", ".tsx"],
  },
});
