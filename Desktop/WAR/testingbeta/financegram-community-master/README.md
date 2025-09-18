# Financegram Community Terminal (Firebase Prep)

Bloomberg-styled Financegram frontend prepped for a Firebase backend. All tasks remain CLI-friendly and Android-conscious.

## Prerequisites

- Node.js 18+
- npm 10+
- Firebase project (Firestore + Authentication enabled)
- Optional: Firebase CLI for deployment/emulator work

## Setup

```bash
cp .env.example .env
# fill Firebase credentials
npm install
```

### Firebase environment variables

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

These drive the web SDK; keep them in `.env` for local builds and supply them in your hosting environment.

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # type-check + production bundle
npm run preview  # serve built assets
npm run lint     # eslint
```

## Firestore expectations

| Collection              | Purpose                                     |
|-------------------------|---------------------------------------------|
| `market_quotes`         | symbol, label, price, change, updated_at    |
| `market_series`         | intraday chart points                       |
| `news_items`            | title, source, url, description, image_url  |
| `talent_jobs`           | job listings + tags + posted_at             |
| `community_posts`       | forum threads (forum, forum_label, score)   |
| `learning_certifications` | course catalog with cost_range           |
| `profiles` (optional)   | `{ communities: [{ id, label }] }`          |

If Firestore is empty or unavailable, the UI falls back to cached Bloomberg-style datasets so the terminal never goes blank.

## Auth flow (preview mode)

The client stores sessions locally (`financegram.local.session`) and assigns Bloomberg-style community memberships based on email domain. Hook it up to Firebase Auth/Firestore rules when ready.

## Theme & UX

- VT323 glyphs on black with lime highlights to mimic a Bloomberg terminal.
- All panels animate and degrade gracefully without live data.
- University/region forums auto-attach (EMEA / USA / Asia / University of Navarra). Extend `src/lib/community.ts` for more.

## Testing

```bash
npm run build
npm run lint
```

Add Vitest/Jest suites once live data endpoints are ready.

## Deployment

1. Build: `npm run build`
2. Deploy `dist/` via Firebase Hosting (`firebase deploy --only hosting`), Netlify, Vercel, etc.

Remember to inject the same Firebase environment variables at deploy time so the dashboard talks to your project.
