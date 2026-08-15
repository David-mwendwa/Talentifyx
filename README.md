# Talentifyx

**Where top talent meets precision matching.** Discover verified engineering and tech
opportunities tailored to your stack.

Talentifyx is a MERN job board built around one idea: a candidate's declared tech stack
should rank the market for them. Every listing is real — ingested from the open
[Arbeitnow](https://www.arbeitnow.com/) job board API, tagged with the technologies it
actually asks for, and scored against the signed-in user's stack.

> Talentifyx is v2 of a project that started as **Careerport**, a Jobify-style application
> tracker. The original code is preserved on the `v1.0.0-legacy` branch; `main` is a fresh
> rebuild as a real job board.

## What it does

- **Live job data** — ~350 tech roles ingested from Arbeitnow, refreshed automatically (see
  Keeping listings fresh) or on demand with `npm run ingest`
- **Stack extraction** — each listing's title, tags and description are matched against a
  canonical technology list, so a job is filterable by React, Kubernetes, Terraform, etc.
- **Precision matching** — signed-in users get roles scored by how much of their declared
  stack the listing overlaps (`/dashboard`)
- **Split-pane browsing** — LinkedIn/Indeed-style list + live detail preview, with filters
  for stack, seniority, work mode and location
- **Application board** — a drag-and-drop kanban across saved → applied → interview → offer
  → rejected. Each card opens a drawer holding notes, the contact you are dealing with,
  salary discussed, a follow-up date, and the stage-change timeline
- **Follow-ups** — set a date on any application; overdue and due-today items surface on the
  dashboard so a thread never goes quiet by accident
- **Funnel metrics** — interview and offer conversion rates over everything you actually sent
- **Saved searches** — save any filter combination and see how many roles match it now, with
  a badge for what is new since you last looked
- **Skill gaps** — the technologies that appear most often alongside your stack, ranked by
  how many extra roles each one would unlock
- **Profile** — stack, drag-and-drop CV upload (PDF/DOC/DOCX, 5MB), profile links, salary
  expectation, experience, desired role
- **Market insights** — demand by stack, roles by seniority, and where the roles are
- **About page** explaining the whole product
- **Dark mode** throughout

## Stack

| Layer | Choices |
|---|---|
| Frontend | React 18 (Vite, plain JS), React Router 6, Tailwind v3, Recharts, react-icons |
| Backend | Express 4, Mongoose 8, JWT auth in httpOnly cookies, helmet + rate limiting |
| Data | MongoDB; job listings sourced from the Arbeitnow public API |

## Running locally

MongoDB comes from the workspace Docker compose:

```bash
docker compose -f ../infra/docker-compose.yml up -d
```

Then:

```bash
npm run install:all          # installs frontend + backend
cp backend/.env.example backend/.env
npm run ingest               # pulls live jobs from Arbeitnow into MongoDB
npm run seed:demo            # optional: demo account + a populated board
npm run dev                  # frontend on :5173, API on :5004
```

Demo login: `demo@talentifyx.dev` / `demopass123`

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Frontend + backend together via concurrently |
| `npm run server` | Backend only |
| `npm run build` | Production build of the frontend |
| `npm run ingest` | Fetch + upsert jobs from Arbeitnow (`npm run ingest -- 12` for more pages) |
| `npm run seed:demo` | Create the demo user and seed their application board |
| `npm run repair:descriptions --prefix backend` | Re-sanitize stored descriptions after a sanitizer change |

## Keeping listings fresh

The API syncs itself. It checks hourly and re-ingests when the stored data is older than
`SYNC_INTERVAL_HOURS` (12 by default), and it runs that same check on boot — which is what
makes it work on free hosting, where the service is spun down when idle and a long-running
timer would never fire. A sync that fails is logged and recorded, never fatal: the existing
listings stay served and the next check tries again. Overlapping runs are prevented, so a
slow fetch cannot stack up behind the next tick.

`SyncState` records the last successful run, and the UI shows it — the landing page badge
reads "synced 2 hours ago". Set `AUTO_SYNC=off` to turn the scheduler off and drive
ingestion externally (a CI cron calling `npm run ingest`, for instance).

## How matching works

`backend/utils/stack.js` holds the canonical stack list and the patterns that identify each
technology in job text. Two details matter:

- **Patterns are word-boundary anchored and deliberately narrow.** An early version matched
  bare `go`, `js` and `ts`, which tagged 143 unrelated German-language listings as Go roles.
  Abbreviations that collide with ordinary words are not used — `golang` only.
- **Only listings with at least one detected technology are ingested.** That is what makes
  the board a tech board rather than a copy of a general job feed.

Match score is the share of the *user's* stack a listing covers, so a role hitting 4 of your
5 technologies scores 80% (`getMatchedJobs` in `backend/controllers/jobController.js`).

## Security note

Arbeitnow descriptions are third-party HTML rendered with `dangerouslySetInnerHTML`. They
are run through an allow-list sanitizer (`backend/utils/sanitize.js`) **at ingest time**, so
what is stored in MongoDB is already safe — scripts, styles and all attributes are stripped.

A minority of listings arrive entity-escaped (`&lt;h2&gt;` rather than `<h2>`). Those slip
past a tag sanitizer untouched and then render as visible markup in the browser, so they are
decoded before sanitizing. The decode is gated on escaped tags *outnumbering* real ones,
which separates a genuinely escaped description from one that merely quotes `&lt;div&gt;` in
its prose.

Ingest only rewrites listings still present in the Arbeitnow feed, so rows that have rolled
off keep whatever the sanitizer produced that day. After changing the sanitizer, run
`npm run repair:descriptions --prefix backend` to bring them up to date.

## CV uploads

Dropped files are validated on both sides (type and size) and stored **in MongoDB**, in a
`Resume` collection separate from the user document — Render's free disk is ephemeral, so
anything written to it disappears on the next deploy, and no Cloudinary credentials are
assumed. Only lightweight metadata (name, size, uploaded date) lives on the user, so loading
a user never drags a few megabytes of PDF along with it.

Filenames are sanitized before storage because they are echoed back in a
`Content-Disposition` header, and downloads are always served as `attachment` with the
stored MIME type, never inline. PDFs can be previewed in-app: the file is fetched as an
authenticated blob and rendered from an object URL, so the API never has to serve anything
inline. Word files fall back to a download prompt — browsers have no native viewer for them.

## Deployment

Two pieces, matching the other projects in this workspace:

- Frontend → Netlify (`netlify.toml`), with `VITE_API_URL` pointed at the API
- API → Render (`render.yaml`), with `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` set
- Database → MongoDB Atlas; Render does not host MongoDB

Because the halves sit on different origins, auth cookies are cross-site
(`SameSite=None; Secure`) and CORS runs against an explicit allowlist. See
**[DEPLOYMENT.md](DEPLOYMENT.md)** for the step-by-step, including the Atlas settings and
the mistakes that cost the most time.

## Data credit

Job listings come from the free [Arbeitnow job board API](https://www.arbeitnow.com/job-board-api).
