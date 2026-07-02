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
| `NEXT_PUBLIC_SITE_URL` | No* | Public site URL for SEO/sharing (*auto-detected on Vercel if omitted) |
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

Your repo is already on GitHub: `kendagordavid/alamatracks_results`

### Option A — Vercel Dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub
2. **Import** `kendagordavid/alamatracks_results`
3. Framework preset: **Next.js** (auto-detected)
4. Add these **Environment Variables** for Production, Preview, and Development:

| Variable | Value |
|---|---|
| `ALAMATRACKS_API_URL` | Your **public** Django API base URL (see below) |
| `ALAMATRACKS_EVENT_ID` | `369e6570-3ca5-475d-ae21-26caa6466f20` (or your prod event UUID) |
| `NEXT_PUBLIC_AUTO_REFRESH_SECONDS` | `45` |

5. Click **Deploy**

After the first deploy, optionally set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://alamatracks-results.vercel.app`) and redeploy for correct Open Graph links. If omitted, Vercel auto-detects the deployment URL.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add ALAMATRACKS_API_URL
vercel env add ALAMATRACKS_EVENT_ID
vercel --prod
```

### Critical: API URL must be public

Vercel runs in the cloud — **`127.0.0.1` will not work** in production.

Use one of:

| Setup | `ALAMATRACKS_API_URL` |
|---|---|
| Production Django (cloud) | `https://alamatracks-api.serow.app/api/v1` |
| Local dev API (temporary) | Use [ngrok](https://ngrok.com) or similar tunnel, e.g. `https://abc123.ngrok.io/api/v1` |

Verify the API before deploying:

```bash
curl "https://YOUR-API-HOST/api/v1/tracks/public/results/?event=YOUR-EVENT-UUID"
```

You should get JSON with `event` and `results` — not `Event not found` or connection errors.

> **Note:** The SBITT event UUID may only exist on your local database. If the cloud API returns `"Event not found"`, use the event UUID from your production Django instance, or deploy/sync the event to the cloud API first.

### After deploy

- Visit your Vercel URL → `/results` should load finishers
- Check **Vercel → Project → Logs** if the page shows errors
- Add a custom domain under **Project → Settings → Domains**

## Architecture

```
Browser → Next.js (/api/results proxy) → AlamaTracks Django API
                ↓
         React Query cache (client)
```

Results are enriched client-side: overall rank, pace, gun time, and gender inference from category names.

## API Notes

The public results endpoint returns **published finishers only**. Fields like team, country, splits, DNS, and DNF are not yet exposed by the API — the UI handles these gracefully with placeholders.
