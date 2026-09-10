 
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

let appVersion = "2.0.0";
try {
  const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  appVersion = pkg.version || "2.0.0";
} catch (e) {
  console.warn("Could not read package.json version");
}

// ── Localhost Dev-Only Release Manager Plugin ─────────────────────────────
function devReleasePlugin() {
  return {
    name: "dev-release-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__api/dev-release", async (req, res) => {
        const sendJson = (status, data) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        const rootDir = process.cwd();
        const pkgPath = path.resolve(rootDir, "package.json");
        const changelogJsonPath = path.resolve(rootDir, "src/data/changelogs.json");
        const changelogMdPath = path.resolve(rootDir, "CHANGELOG.md");

        const readJson = (filePath, fallback = {}) => {
          try {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
          } catch {
            return fallback;
          }
        };

        const writeJson = (filePath, data) => {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
        };

        const renderMarkdown = (releases) => {
          let md = `# Changelog\n\nAll notable changes to the ICMU Web Platform will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n## [Unreleased]\n\n`;
          for (const rel of releases) {
            const v = rel.version || rel.title;
            const dateStr = rel.isoDate || rel.date || new Date().toISOString().split("T")[0];
            md += `## [${v}] - ${dateStr}\n\n`;
            if (rel.desc) {
              md += `${rel.desc}\n\n`;
            }
            if (Array.isArray(rel.steps) && rel.steps.length > 0) {
              md += `### Highlights\n`;
              for (const step of rel.steps) {
                const title = typeof step === "string" ? step : step.t;
                const desc = typeof step === "string" ? "" : step.d;
                if (desc) {
                  md += `- **${title}**: ${desc}\n`;
                } else {
                  md += `- ${title}\n`;
                }
              }
              md += `\n`;
            }
          }
          return md;
        };

        if (req.method === "GET") {
          const pkg = readJson(pkgPath, { version: "2.0.0" });
          const releases = readJson(changelogJsonPath, []);
          let markdown = "";
          try {
            markdown = fs.readFileSync(changelogMdPath, "utf-8");
          } catch {}
          return sendJson(200, {
            success: true,
            version: pkg.version || "2.0.0",
            releases,
            changelogMarkdown: markdown,
          });
        }

        if (req.method === "POST" || req.method === "DELETE") {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", () => {
            try {
              const payload = JSON.parse(body || "{}");
              const pkg = readJson(pkgPath, { version: "2.0.0" });
              let releases = readJson(changelogJsonPath, []);

              if (req.method === "POST") {
                const newVersion = payload.version ? payload.version.trim().replace(/^v/i, "") : pkg.version;
                if (!newVersion) return sendJson(400, { success: false, error: "Version is required" });

                const newRelease = {
                  id: "v" + newVersion.replace(/\./g, "-"),
                  version: newVersion,
                  title: payload.title || `Release ${newVersion}`,
                  subtitle: payload.subtitle || "System Update",
                  badge: payload.badge || "FEATURE RELEASE",
                  desc: payload.desc || "",
                  date: payload.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  isoDate: new Date().toISOString().split("T")[0],
                  isMajor: Boolean(payload.isMajor),
                  steps: Array.isArray(payload.steps) ? payload.steps : [],
                };

                releases = [newRelease, ...releases.filter((r) => r.version !== newVersion)];
                pkg.version = newVersion;

                writeJson(pkgPath, pkg);
                writeJson(changelogJsonPath, releases);
                fs.writeFileSync(changelogMdPath, renderMarkdown(releases), "utf-8");

                return sendJson(200, { success: true, version: newVersion, releases });
              }

              if (req.method === "DELETE") {
                const targetVersion = payload.version ? payload.version.trim().replace(/^v/i, "") : null;
                if (!targetVersion) return sendJson(400, { success: false, error: "Target version is required" });

                releases = releases.filter((r) => r.version !== targetVersion);
                const newVersion = releases[0]?.version || "2.0.0";
                pkg.version = newVersion;

                writeJson(pkgPath, pkg);
                writeJson(changelogJsonPath, releases);
                fs.writeFileSync(changelogMdPath, renderMarkdown(releases), "utf-8");

                return sendJson(200, { success: true, version: newVersion, releases });
              }
            } catch (err) {
              return sendJson(500, { success: false, error: err.message });
            }
          });
          return;
        }

        sendJson(405, { success: false, error: "Method not allowed" });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [react(), devReleasePlugin()],
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
