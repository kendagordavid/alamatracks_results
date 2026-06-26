# AlamaTracks Public Results

Production-ready public race results website powered by Next.js and the AlamaTracks API.

## Features

- Premium landing page with event metadata, stats, and athlete search
- Virtualized results table with sorting, filtering, pagination, CSV export, and print
- Shareable athlete profiles with QR codes
- Statistics dashboard with Recharts visualizations
- Light/dark theme, auto-refresh, SEO (metadata, sitemap, JSON-LD)
- Server-side API proxy with React Query client caching

## Prerequisites

- Node.js 20+
- AlamaTracks Django API running and reachable

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ALAMATRACKS_API_URL` | Yes | Base API URL, e.g. `http://127.0.0.1:8000/api/v1` |
| `ALAMATRACKS_EVENT_ID` | Yes | Event UUID for public results |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL for SEO/sharing |
| `NEXT_PUBLIC_EVENT_LOGO_URL` | No | Optional event logo image URL |
| `NEXT_PUBLIC_AUTO_REFRESH_SECONDS` | No | Polling interval (default `45`, `0` to disable) |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Deploy on Vercel

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set environment variables from `.env.example`
4. Set `ALAMATRACKS_API_URL` to your production Django API host
5. Deploy

## Architecture

```
Browser → Next.js (/api/results proxy) → AlamaTracks Django API
                ↓
         React Query cache (client)
```

Results are enriched client-side: overall rank, pace, gun time, and gender inference from category names.

## API Notes

The public results endpoint returns **published finishers only**. Fields like team, country, splits, DNS, and DNF are not yet exposed by the API — the UI handles these gracefully with placeholders.
