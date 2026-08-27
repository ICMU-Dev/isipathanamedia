# Changelog

All notable changes to the ICMU Web Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **GA4 Admin Analytics Integration**: Integrated Google Analytics 4 (GA4) via a secure Supabase Edge Function (`get-ga4-metrics`). The Admin Panel now displays real-time article performance metrics (views, user trends, device breakdown) without exposing credentials.
- **Instagram-Style News Feed**: Migrated the public news page to a mobile-first, vertical scrolling feed with edge-to-edge images and unified `ArticleCard` components.
- **Subtext Logic**: Added dynamic subtext for articles (displaying the ICMU profile and submitter name) and updates (displaying the submitter directly without ICMU branding).
- **Social SVG Icons**: Added brand SVG icons (Facebook, Instagram) to replace text badges.

### Changed
- **Component Modularization**: Split the top 10 monolithic files in the codebase into smaller, manageable sub-components.
- **Documentation**: Rewrote the root `README.md` to accurately reflect the ICMU Web Platform architecture and deleted outdated boilerplate documentation.
- **Memory/System Docs**: Updated the AI memory index (`MEMORY.md`) to include recent UI, technical, and refactoring decisions.

### Removed
- **MPMU & Nethinethera Modules**: Completely deleted the MPMU admin panel, Nethinethera admin panel, and all related features, services, hooks, and edge functions to streamline the platform.
- **Voting Sections**: Removed MPMU-specific voting sections (VotingPreview, MpmuNominees) from the public `/nethinethera` page.
- **Old Docs**: Removed the generic `docs/` folder, `PROJECT.md`, and old task artifacts.
