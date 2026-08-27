 
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";

import fs from "fs";

let commitHash = "unknown";
try {
  commitHash = execSync("git rev-parse --short HEAD").toString().trim();
} catch (e) {
  console.warn("Could not retrieve git commit hash");
}

let appVersion = "1.0.0";
try {
  const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  appVersion = pkg.version || "1.0.0";
} catch (e) {
  console.warn("Could not read package.json version");
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable CSS code splitting for lazy-loaded routes
    cssCodeSplit: true,
    // Target modern browsers for smaller output
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Core React runtime ──────────────────────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // ── Supabase ────────────────────────────────────────────────────
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }

          // ── Animation (framer-motion, gsap, lenis, motion) ─────────────
          if (
            id.includes("node_modules/framer-motion/") ||
            id.includes("node_modules/motion/") ||
            id.includes("node_modules/gsap/") ||
            id.includes("node_modules/@gsap/") ||
            id.includes("node_modules/lenis/")
          ) {
            return "vendor-animation";
          }

          // ── OGL / WebGL (Nethinethera canvas effects only) ──────────────
          if (id.includes("node_modules/ogl/")) {
            return "vendor-webgl";
          }

          // ── Mermaid (super-admin docs only — very heavy ~1MB) ───────────
          if (id.includes("node_modules/mermaid/") || id.includes("node_modules/d3")) {
            return "vendor-mermaid";
          }

          // ── Recharts (admin dashboard charts) ───────────────────────────
          if (id.includes("node_modules/recharts/") || id.includes("node_modules/victory-")) {
            return "vendor-charts";
          }

          // ── TipTap rich text editor (article creation only) ─────────────
          if (
            id.includes("node_modules/@tiptap/") ||
            id.includes("node_modules/prosemirror-")
          ) {
            return "vendor-tiptap";
          }

          // ── Markdown rendering (article viewer + docs) ──────────────────
          if (
            id.includes("node_modules/react-markdown/") ||
            id.includes("node_modules/remark") ||
            id.includes("node_modules/rehype") ||
            id.includes("node_modules/unified/") ||
            id.includes("node_modules/hast") ||
            id.includes("node_modules/mdast") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/vfile")
          ) {
            return "vendor-markdown";
          }

          // ── Radix UI primitives ─────────────────────────────────────────
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // ── Misc utilities (date-fns, clsx, sonner, etc.) ───────────────
          if (
            id.includes("node_modules/date-fns/") ||
            id.includes("node_modules/sonner/") ||
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/tailwind-merge/")
          ) {
            return "vendor-utils";
          }
        },
      },
    },
    // Raise limit — supabase + gsap vendor chunks are legitimately large
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    // Pre-bundle known heavy dependencies for faster dev startup
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "gsap",
      "gsap/ScrollTrigger",
      "gsap/SplitText",
      "gsap/ScrollToPlugin",
      "gsap/ScrambleTextPlugin",
      "framer-motion",
      "lucide-react",
    ],
  },
});
