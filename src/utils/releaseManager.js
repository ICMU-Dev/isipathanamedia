/**
 * Release & Changelog Manager Utilities
 * Only active and permitted on localhost for authorized developers.
 */

export const AUTHORIZED_DEVELOPER_INDEXES = ["24929", "25473"];
export const AUTHORIZED_DEVELOPER_IDS = ["6bc30e58-7cd3-4a39-9919-b8913cebb28a"];

/**
 * Verifies if current environment is localhost
 */
export const isLocalhost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

/**
 * Checks if the currently authenticated user is an authorized developer
 */
export const isAuthorizedDeveloper = (user) => {
  if (!user) return false;
  const index = String(user.indexNumber || user.index_number || "").trim();
  const id = String(user.id || "").trim();

  return (
    AUTHORIZED_DEVELOPER_INDEXES.includes(index) ||
    AUTHORIZED_DEVELOPER_IDS.includes(id)
  );
};

/**
 * Bumps a semver version string by type
 * @param {string} currentVersion - e.g. "2.0.0"
 * @param {'patch' | 'minor' | 'major'} type
 * @returns {string} - e.g. "2.0.1"
 */
export const bumpVersion = (currentVersion = "2.0.0", type = "patch") => {
  const clean = String(currentVersion).replace(/^v/i, "").trim();
  const parts = clean.split(".").map((p) => parseInt(p, 10) || 0);

  let [major = 2, minor = 0, patch = 0] = parts;

  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else {
    // default patch +1
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
};

/**
 * Decrements version back to previous release or patch -1
 */
export const decrementVersion = (currentVersion = "2.0.1", fallbackVersion = "2.0.0") => {
  if (fallbackVersion && fallbackVersion !== currentVersion) {
    return fallbackVersion;
  }
  const clean = String(currentVersion).replace(/^v/i, "").trim();
  const parts = clean.split(".").map((p) => parseInt(p, 10) || 0);
  let [major = 2, minor = 0, patch = 1] = parts;

  if (patch > 0) {
    patch -= 1;
  } else if (minor > 0) {
    minor -= 1;
    patch = 0;
  } else if (major > 0) {
    major -= 1;
    minor = 0;
    patch = 0;
  }

  return `${major}.${minor}.${patch}`;
};

/**
 * Format current date for changelog display
 */
export const formatReleaseDate = (d = new Date()) => {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date for CHANGELOG.md ISO (YYYY-MM-DD)
 */
export const formatIsoDate = (d = new Date()) => {
  return d.toISOString().split("T")[0];
};

/**
 * Formats structured releases array into standard Keep-a-Changelog Markdown
 */
export const generateChangelogMarkdown = (releases = []) => {
  let md = `# Changelog\n\nAll notable changes to the ICMU Web Platform will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n## [Unreleased]\n\n`;

  for (const rel of releases) {
    const v = rel.version || rel.title;
    const dateStr = rel.isoDate || rel.date || formatIsoDate();
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

/**
 * Dev API: Fetch current release info from Vite dev middleware
 */
export const fetchDevReleaseInfo = async () => {
  if (!isLocalhost()) return { success: false, error: "Not on localhost" };
  try {
    const res = await fetch("/__api/dev-release", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Dev API: Publish new release via Vite dev middleware
 */
export const publishDevRelease = async (releaseData) => {
  if (!isLocalhost()) return { success: false, error: "Only available on localhost" };
  try {
    const res = await fetch("/__api/dev-release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(releaseData),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Dev API: Delete release via Vite dev middleware
 */
export const deleteDevRelease = async (version) => {
  if (!isLocalhost()) return { success: false, error: "Only available on localhost" };
  try {
    const res = await fetch("/__api/dev-release", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};
