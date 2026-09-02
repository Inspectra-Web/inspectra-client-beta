import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Same-origin API in dev, so no CORS preflight and no cookie SameSite questions.
  server: {
    // strictPort: fail loudly instead of sliding to 5174. The API pins CLIENT_URL
    // to :5173 for CORS and for the links in verification and reset emails, so a
    // silent fallback port breaks both.
    port: 5173,
    strictPort: true,
    proxy: { "/api": { target: "http://localhost:5000", changeOrigin: true } },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
