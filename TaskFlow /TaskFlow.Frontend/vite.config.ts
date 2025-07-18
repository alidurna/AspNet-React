import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // 'path' modülünü import et

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // '@' takma adını 'src' dizinine işaret et
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5281",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
