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
        target: "http://localhost:5000", // Backend API portu 5000 olarak ayarlandı
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
