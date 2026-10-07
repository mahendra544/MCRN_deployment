import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        user: resolve(__dirname, "user.html"),
        police: resolve(__dirname, "police.html"),
        admin: resolve(__dirname, "admin.html"),
        contact: resolve(__dirname, "contact.html"),
        reporting: resolve(__dirname, "reporting.html"),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.API_GATEWAY_URL || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.API_GATEWAY_URL || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
