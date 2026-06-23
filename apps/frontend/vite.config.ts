import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8001,
  },
  resolve: {
    alias: {
      "@common/types": path.resolve(__dirname, "../../libs/common/src/index.ts"),
    },
  },
});
