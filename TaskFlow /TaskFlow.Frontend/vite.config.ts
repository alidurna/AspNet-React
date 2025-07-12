import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://localhost:7173",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1.0"),
      },
      "/hub": {
        target: "https://localhost:7173",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
