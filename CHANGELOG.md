# Changelog

All notable changes to the ICMU Web Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.1] - 2026-10-05

Added new feature called "tools: that allows to use for Project handling, Contact 3rd parties and more. This update will roll over for next few weeks

### Highlights
- **New: ICMU Contacts**: Can't find contacts for projects or sponsorship? Not anymore. New Tool called ICMU Contacts is collection of contacts that can use for find contacts for each project or event you want. Please use this tool with a responsibility

## [2.0.1] - 2026-09-10

Fixed some minor issues with Admin + Broadcaster Role, Updates caption bugs and Data Fetching issues.

### Highlights
- **Upgraded to Tanstack v5**: Better invalidated Latest Data Fetching With cache handling
- **Live Stream Issues  Fixed**: Issues with Role Broadcaster fixed in RLS Polices
- **Improved Notifications & Indicators**: Backward Compatibility added to messages and Feedbacks notificaitons
- **"Updates" related issues fixed**: Fixed the known issues of Captions fetching
- **New minor improvements added**: Now Articles shows up to 10 in Public Page and added show more button to news section
- **SEO Improvements**: Improved OG Links to show dynamic content based on articles

## [2.0.0] - 2026-09-10

ICMU Web platform featuring the all-new V2 design system, a real-time notification hub, masonry article galleries, privacy-first GA4 analytics, blazing-fast data caching, and a zero-leak edge security architecture.

### Highlights
- **ICMU V2 Design System**: Brand-new liquid UI theme with fluid micro-interactions, responsive form controls, and modern dark aesthetics
- **Centralized Notification Hub**: Real-time alert center with audio chime, category filtering (Inbox, Articles, Feedback, System), and unread tracking.
- **Masonry Article Media**: Dynamic image masonry grid for high-impact photo journalism and article media.
- **GA4 Article Analytics**: Real-time view counts and reader engagement powered by secure edge functions.
- **Platform Documentation**: Integrated guides, developer references, and operational docs.
- **Zero-Leak Secret Management**: Hardcoded API keys, private tokens, and environment secrets completely removed from client bundles and routed through hardened Supabase Edge Functions
- **Avatar & Profile Pictures**: Fixed loading deadlocks and fallback letter flickers across the top bar, sidebar, active admins, and mobile nav
- **Article System**: Streamlined editor lifecycle, auto-saving, and draft workflows.
- **Admin & Broadcaster Roles**: Resolved role redirects, dashboard permission guards, and broadcaster view boundaries.
- **Release Manager**: Automated SemVer release pipeline synchronized directly with CHANGELOG.md and live system notifications

