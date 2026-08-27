# Isipathana College Media Unit (ICMU) Web Platform

The official digital platform for the Isipathana College Media Unit. This platform serves as a modern news portal, media archive, and administrative dashboard for ICMU operations.

## Features

- **Public News Feed**: An Instagram-style, mobile-first vertical scrolling news feed.
- **Admin Dashboard**: Comprehensive CMS for managing articles, updates, and user roles.
- **Analytics Integration**: Custom Google Analytics 4 (GA4) integration via Supabase Edge Functions, offering real-time insights (views, read time, device breakdowns) without exposing credentials.
- **Web Push Notifications**: Service worker integration for admin feedback delivery.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Analytics**: GA4 Data API via Deno Edge Functions
- **Hosting**: Netlify / Supabase

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure your `.env.local` with Supabase keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Start the development server: `npm run dev`

## Deployment

The platform is optimized for seamless deployment. Edge functions should be deployed directly to Supabase (`supabase functions deploy`), while the frontend is built using `npm run build` and served statically.
# isipathanamedia
