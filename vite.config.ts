import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Where /api goes. The deployed API by default; set VITE_API_PROXY in .env.local to
 *  point back at a server running locally:
 *
 *    VITE_API_PROXY=http://localhost:5000
 */
const DEPLOYED_API = "https://inspectra-server-beta.onrender.com";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // "" as the prefix so the var does not have to be exposed to client code: this is
  // read at config time by Vite itself, never bundled.
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_PROXY || DEPLOYED_API;

  return {
    plugins: [react(), tailwindcss()],
    // Same-origin API in dev, so no CORS preflight and no cookie SameSite questions:
    // the browser only ever talks to localhost:5173, and Vite forwards from there.
    server: {
      // strictPort: fail loudly instead of sliding to 5174. The API pins CLIENT_URL
      // to :5173 for CORS and for the links in verification and reset emails, so a
      // silent fallback port breaks both.
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target,
          // Rewrites the Host header, which a named host behind TLS needs in order to
          // route and to present the right certificate.
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
