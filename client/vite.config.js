import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Match the IDE preview URL. Keep the port fixed rather than silently
  // selecting another port; OAuth origins must match the address in use.
  server: {
    host: "localhost",
    port: 5174,
    strictPort: true,
    proxy: { "/api": "http://localhost:8000" },
  },
});
