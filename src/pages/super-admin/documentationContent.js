import overviewDoc from "./docs/01-overview.md?raw";
import rolesDoc from "./docs/02-roles.md?raw";
import publicSiteDoc from "./docs/03-public-site.md?raw";
import adminPanelDoc from "./docs/04-admin-panel.md?raw";
import superAdminDoc from "./docs/05-super-admin.md?raw";
import streamingRadioDoc from "./docs/06-streaming-radio.md?raw";
import folderGuideDoc from "./docs/07-folder-guide.md?raw";

export const documentationSections = [
  {
    id: "project-overview",
    slug: "project-overview",
    number: "01",
    title: "Project Overview & Purpose",
    category: "General",
    badge: "Core",
    summary: "Platform mission, visitor services, core feature map, and simple tech stack.",
    content: overviewDoc,
  },
  {
    id: "roles",
    slug: "roles",
    number: "02",
    title: "User Roles & Permissions",
    category: "Security",
    badge: "Access Control",
    summary: "Clear guide to the 5 roles, dual operator setups, safety locks, and login sessions.",
    content: rolesDoc,
  },
  {
    id: "public-site",
    slug: "public-site",
    number: "03",
    title: "Public Website Features",
    category: "Public",
    badge: "Visitor Facing",
    summary: "Home page flow, full articles vs quick updates, live player, and Vibhavi FM radio.",
    content: publicSiteDoc,
  },
  {
    id: "admin-panel",
    slug: "admin-panel",
    number: "04",
    title: "Content Admin Panel",
    category: "Editorial",
    badge: "Management",
    summary: "Article lifecycle, #view-<id> deep-linking, WebP photo cropper, and 19 themes.",
    content: adminPanelDoc,
  },
  {
    id: "super-admin",
    slug: "super-admin",
    number: "05",
    title: "Super Admin Controls",
    category: "Super Admin",
    badge: "Master Control",
    summary: "Provisioning staff accounts, password resets, freezing access, and session audits.",
    content: superAdminDoc,
  },
  {
    id: "streaming-radio",
    slug: "streaming-radio",
    number: "06",
    title: "Live Streaming & Radio",
    category: "Media",
    badge: "Broadcast",
    summary: "YouTube & Facebook live embed flow, RadioKing API audio stream, and PWA install.",
    content: streamingRadioDoc,
  },
  {
    id: "folder-guide",
    slug: "folder-guide",
    number: "07",
    title: "File & Folder Guide",
    category: "Development",
    badge: "Codebase",
    summary: "Clean roadmap of directories, shared libraries, and quick navigation tips.",
    content: folderGuideDoc,
  },
];

// Unified markdown document export
export const documentationMarkdown = documentationSections
  .map((sec) => sec.content)
  .join("\n\n---\n\n");
