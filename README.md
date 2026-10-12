# Dayledger (starter)

Next.js (App Router, JavaScript) + Auth.js (Google login) + Prisma + Neon Postgres + Vertex AI photo check.

## What works in this starter
- Google sign-in (asks for read-only calendar access)
- `GET /api/calendar?from=&to=` - the signed-in user's events
- `GET/PUT/DELETE /api/state` - saves settings, days and ledger rows per user
- `POST /api/verify-photo` - checks a photo with Gemini on Vertex AI (10 checks per user per day, enforced on the server)
- A simple home page that signs in and lists today's events

## What is NOT done yet
The real Dayledger screens (task list, points, credit card, tabs, proof flow) are still in
`reference/dayledger-artifact.html`. That file only runs inside Claude (it uses Claude-only
features), so its screens, styles and points rules have to be ported into this project.
Points rules should be calculated on the server, not in the browser.

## Run it on your computer
1. Install Node.js (LTS).
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill it in (never commit `.env.local`).
4. `npx prisma migrate dev --name init`   (creates the tables in Neon)
5. For the photo check locally: `gcloud auth application-default login`
6. `npm run dev` and open http://localhost:3000

## Google sign-in setup (Google Cloud Console)
APIs & Services -> enable "Google Calendar API" -> OAuth consent screen (External, Testing,
add your own email as a test user) -> Credentials -> Create OAuth client ID (Web application).
Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- https://YOUR-APP.vercel.app/api/auth/callback/google
Put the client ID and secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

## Deploy
Push to a private GitHub repo, import it in Vercel, add every variable from `.env.example`
under Project Settings -> Environment Variables, then deploy. Run the migration once with
`npx prisma migrate deploy` (using your DIRECT_URL). Set up Workload Identity Federation as
in the build guide so Vercel can call Vertex AI without a key file.
