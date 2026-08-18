# Deployment Checklist — Attendo

> Full command-by-command reference lives in [README.md](README.md). This is the go/no-go checklist for taking it live.

## Quick answers

| Question | Answer |
|---|---|
| Needs a backend? | **Yes.** Express server (`server/`) — also serves the built React client in production (one service, not split hosting). |
| Needs a database? | **Yes.** PostgreSQL — holds all app data (students, classes, attendance, billing, rate tiers, outgoings) *and* login sessions. |
| Needs env vars? | **3 required:** `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production` — all auto-populated by the Render Blueprint below. **Optional:** `OWNER_EMAIL` + `GOOGLE_CLIENT_ID`/`VITE_GOOGLE_CLIENT_ID` + `FACEBOOK_APP_ID`/`VITE_FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` for social sign-in. |
| Needs authentication? | **Yes, but self-contained by default.** No accounts required. First visit prompts a 4–6 digit PIN; that PIN plus a session cookie (httpOnly, secure in production, 30-day expiry) is the gate. Google/Facebook sign-in is available as an addition if configured, gated to a single `OWNER_EMAIL`. |

## Files already in place — nothing new to create

- `render.yaml` — Render Blueprint, provisions a free Postgres DB + free Node web service from one file
- `migrations/001_init.sql`, `002_outgoings.sql`, `run.js` — run automatically on every deploy
- `.env.example`, `client/.env.example` — shape of the local env vars; **not** used in production, Render injects real values
- Root `package.json` (npm workspaces: `client` + `server`) — one `npm install` covers both
- `client/vite.config.js` — PWA manifest already wired (`vite-plugin-pwa`), so the deployed app supports "Add to Home Screen"

## Checklist

### 1. Push to GitHub (required — Render deploys from git, not local files)
- [ ] `git remote add origin <your-repo-url>` (if not already set)
- [ ] `git push -u origin master`

### 2. Deploy via Render Blueprint
- [ ] Render dashboard → New → Blueprint → connect the GitHub repo
- [ ] Confirm Render picks up `render.yaml` (1 database + 1 web service)
- [ ] If using social sign-in, fill in `OWNER_EMAIL` and the Google/Facebook env vars in the Render dashboard (marked `sync: false` — not auto-populated)
- [ ] First deploy runs `npm install && npm run build`, then `npm run migrate && npm start`

### 3. First-run setup
- [ ] Visit the live `*.onrender.com` URL
- [ ] Set the PIN when prompted (or sign in with Google/Facebook if configured) — this becomes the owner's login going forward
- [ ] Students page → branding card: set the studio name and currency symbol
- [ ] Students page → rates card: confirm/adjust the seeded rate tiers ("Group Session", "1:1 Private") to match this trainer's actual pricing
- [ ] Confirm students, attendance, and billing/trends pages all load against the fresh database

### 4. Free-tier trade-offs — confirm these are acceptable before relying on this for real data
- [ ] **Cold starts:** the free web service spins down after ~15 min idle; the next request takes 30–50s to wake it up
- [ ] **Database expiry:** Render deletes free Postgres databases automatically after 30 days. If this is meant to hold real, ongoing data (not a demo), upgrade the database to a paid plan (Starter, ~$6–7/mo) *before* real use — otherwise the data silently disappears after a month

### 5. Ongoing
- [ ] Every push to the connected branch auto-redeploys (migrations re-run automatically)
- [ ] Take periodic backups: `npm run backup` (writes to `backups/`, gitignored — contains real student/client data, never commit it)

## Cloning this for another trainer

1. Copy this repo (fresh `git init`, don't carry over `.git` history, `backups/`, or `.env*` files — see README's "Customizing for a new trainer" section).
2. Manual edits: `client/index.html` title, `client/vite.config.js` PWA manifest strings, `render.yaml` service/database names.
3. Everything else — rate tiers, studio name, currency, owner login — is configured through the app itself after first deploy, no further code changes needed.
