# The Collective — Events Calendar

A Next.js app with four pieces:

1. **Public calendar** — `/` — two tabs, "Collective Events" and "Member Hosted Events", each filterable by category.
2. **Submission form** — `/submit` — anyone can post an event; it appears under "Member Hosted Events". The submitter sets a passcode for later editing.
3. **Collective-admin form** — `/collective-admin` — not linked from the nav, protected by `ADMIN_PASSWORD`. Posts under "Collective Events".
4. **Manage (edit/cancel)** — the "Manage this event" button on every card, gated by that event's passcode or the admin password.

Event data lives in Postgres. Uploaded banner images live on disk under `data/uploads/` (served via `/api/uploads/[filename]`), gitignored since they're runtime data — a single persistent disk mounted at `data/` is enough to preserve them on a host like Render, the same pattern used by the member directory app.

## Setup

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in:

- `DATABASE_URL` — a Postgres connection string. The `events` table is created automatically on first request; no migration step needed.
- `ADMIN_PASSWORD` — required to post/edit/cancel Collective Events, and works as a master password to manage any event.
- `CRON_SECRET` — shared secret the daily cleanup job sends to prove it's allowed to trigger expiry deletion. Make up any long random string.
- `SITE_URL` — the public URL of the deployed site.

Then:

```bash
npm run dev
```

## Auto-expiring events

`POST /api/cron/expire` (header `x-cron-secret: <CRON_SECRET>`) deletes every event whose start time has passed. This needs to be triggered **daily from outside the app** — see the Render Cron Job setup in the deployment notes, because a free/starter Render web service can sleep, and a client-side check alone wouldn't catch events that expire while nobody's visiting.

As a secondary safety net, the server also sweeps expired events on an hourly in-process timer (`lib/scheduler.js`) whenever it happens to be awake — this is a bonus, not a substitute for the Cron Job.

The public listing also always excludes events whose start time has passed, regardless of whether cleanup has run yet, so expired events disappear from the calendar immediately either way.

## Image uploads

Banner images are uploaded via `/api/uploads` (multipart), resized to a max width of 1600px and re-encoded as `.webp` server-side with `sharp`, then written to `data/uploads/`. On Render, attach a persistent disk mounted at `data` — see deployment notes.

## Notes for deployment

- The whole `data/` directory (uploaded banner images) needs to persist across deploys — attach a Render persistent disk mounted at `data/`.
- Postgres is a separate managed resource (Render Postgres, or any provider) — it persists independently of the web service and isn't affected by redeploys.
- This app is designed to run inside an iframe on a GoHighLevel page. It sends a `Content-Security-Policy: frame-ancestors` header (see `next.config.mjs`) allowing `possible-woman.com` and GHL's domains, and deliberately does not send `X-Frame-Options`, which would block framing outright.
- The frontend and API are served from the same Next.js app/origin, so no CORS configuration is needed for the app itself to function inside the iframe.
