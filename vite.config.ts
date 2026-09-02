import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// mode=pages → GitHub Pages（仓库名 Time-Series-complete-leaderboard）
export default defineConfig(({ mode }) => {
  const pages = mode === "pages";
  return {
    plugins: [react(), tailwindcss()],
    base: pages ? "/Time-Series-complete-leaderboard/" : "/",
    build: {
      outDir: pages ? "docs" : "dist",
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      port: 8080,
      allowedHosts: ["1xl23ns467895.vicp.fun"],
    },
    preview: {
      host: "0.0.0.0",
      port: 8080,
      allowedHosts: ["1xl23ns467895.vicp.fun"],
    },
  };
});
