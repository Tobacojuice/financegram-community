# Financegram Community Terminal (Supabase Prep)

This workspace prepares the Bloomberg-styled Financegram frontend for a Supabase-backed API. Everything runs from the CLI for Android-first testing.

## Prerequisites

- Node.js 18+
- npm 10+
- Optional: Docker Desktop (for Postgres/Redis when you extend the backend)
- Supabase project URL + anon key

## Setup

```bash
cp .env.example .env
# edit .env with your Supabase project credentials
npm install
```

### Supabase environment

The frontend reads these variables:

- `VITE_SUPABASE_URL` – project REST URL
- `VITE_SUPABASE_ANON_KEY` – anon public key

Store secure keys in a `.env` file; never commit secrets.

## Available Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # type-check + production build
npm run preview  # serve the production build locally
npm run lint     # run ESLint
```

## Supabase Expectations

| Domain       | Table / endpoint                 | Notes |
|--------------|----------------------------------|-------|
| Auth         | Supabase Auth (email OTP, LinkedIn OAuth) | LinkedIn requires OAuth app + redirect URL. |
| Markets      | `market_quotes`, `market_series` | Provide camelCase aliases (`change_percent`, etc.). |
| News         | `news_items`                     | Include `image_url`, `published_at`. |
| Talent       | `talent_jobs`                    | Optional `tags` array. |
| Communities  | `community_posts`                | `forum`, `forum_label`, `score`, `comments`. |
| Learning     | `learning_certifications`        | Certification catalogue with `cost_range`. |
| Profiles     | `profiles`                       | Optional `communities` JSON array `{ id, label }`. |

If a query fails, the UI falls back to cached Bloomberg-style data so the terminal keeps rendering.

## Auth Flow Notes

- Email login triggers Supabase OTP. Until the user confirms via email, the UI drops into a local preview session.
- LinkedIn OAuth delegates to Supabase; configure the provider in the Supabase dashboard (`Authentication ? Providers`).
- Sessions refresh via persistent Supabase auth storage (`financegram.supabase.session`).

## Data Localisation

The terminal auto-enrolls users into forums (EMEA / USA / Asia / University of Navarra) based on their email domain. Extend `src/lib/community.ts` to support additional schools or regions.

## Extending the Backend

1. Use Supabase SQL editor or migrations to create/seed the tables above.
2. Schedule integrations (Investing.com, Bloomberg, etc.) via Supabase Edge Functions or external workers.
3. Add REST policies (RLS) so only authenticated users can read/write sensitive rows.

## Testing

```bash
npm run build   # includes type-checking
npm run lint
```

Add Vitest/Jest suites as you wire real data.

## Deployment

Bundle with `npm run build` and serve the `dist/` directory via any static host (Vercel, Netlify, S3). Ensure `.env` variables are provided at build-time.

---
Everything renders in English, uses the VT323 terminal theme, and degrades gracefully without Supabase. Once your Supabase project serves real data, the Bloomberg-style dashboards will light up automatically.
