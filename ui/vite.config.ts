import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  build: {
    // This is the output directory, relative to the project root (the `frontend` folder)
    outDir: '../api/core/static', 
    
    // Set to false to prevent Vite from clearing the directory on rebuild.
    // This is useful if you have other static files in the same directory.
    emptyOutDir: true,
  },
  // The public base path from which assets will be served.
  // This MUST match Django's STATIC_URL.
  base: mode === "development" ? "" : "/static/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
