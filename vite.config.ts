import mongezVite from "@mongez/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // needed to load SVG as components
    svgr(),
    // needed to manage .env file and link tsconfig paths aliases
    mongezVite(),
    react(),
    visualizer({
      template: "treemap", // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "bundle.analyze.html",
    }),
  ],
  resolve: {
    alias: {
      services: path.resolve(__dirname, "./src/services"),
      shared: path.resolve(__dirname, "./src/shared"),
      "design-system": path.resolve(__dirname, "./src/design-system"),
      assets: path.resolve(__dirname, "./src/assets"),
      layouts: path.resolve(__dirname, "./src/layouts"),
      app: path.resolve(__dirname, "./src/app"),
    },
  },
  optimizeDeps: {
    include: ['react-medium-image-zoom', 'react-image-magnify'],
  },
  envPrefix: ["APP_", "VITE_"],
});
