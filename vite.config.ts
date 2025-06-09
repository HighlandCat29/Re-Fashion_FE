// vite.config.ts (project root)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/comments": {
        target:
          "https://refashion-fqe8c7bfcgg5h0e7.southeastasia-01.azurewebsites.net/api",
        changeOrigin: true,
      },
    },
  },
});
