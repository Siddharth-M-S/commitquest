# CommitQuest

Turn your GitHub commit history into a persistent RPG character. Earn XP, level
up, map your languages to character classes, and unlock achievements — then
share an auto-generated character card anywhere.

Built to run **$0 until your first paying customer**: Next.js on Vercel Hobby +
Upstash Redis (free) + GitHub API. No database required for the core experience.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **NextAuth** — GitHub OAuth (`read:user public_repo`)
- **graphql-request** — GitHub GraphQL API
- **@upstash/redis** — stats cache (6h TTL); falls back to in-memory cache if
  not configured, so the app runs with zero external services in local dev
- **next/og** — shareable 1200×630 character cards

## Project layout

```
src/
├── app/
│   ├── page.tsx                      # Landing page (username search)
│   ├── [username]/page.tsx           # Public profile (works without login)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── stats/[username]/route.ts # JSON stats endpoint
│       └── og/[username]/route.tsx   # Shareable card image
├── components/                       # CharacterCard, SkillBar, AchievementBadge
└── lib/
    ├── auth.ts                       # NextAuth options
    ├── cache.ts                      # Upstash + in-memory fallback
    ├── stats-service.ts              # fetch + cache + build orchestration
    ├── types.ts
    ├── github/                       # client, queries, year-loop fetcher
    └── rpg/                          # xp, levels, skills, achievements, engine
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill it in:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Required | Purpose |
   |----------|----------|---------|
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | for login | OAuth App from <https://github.com/settings/developers> |
   | `GITHUB_PUBLIC_TOKEN` | yes | Classic PAT (`read:user`, `public_repo`) used to render public profiles for users who haven't signed in |
   | `NEXTAUTH_SECRET` | yes | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | yes | `http://localhost:3000` in dev |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | optional | Enables shared cache; omitted = in-memory cache |

   For the OAuth App callback URL use:
   `http://localhost:3000/api/auth/callback/github`

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit <http://localhost:3000> and search any GitHub username, or open
   `/<username>` directly (e.g. `/torvalds`).

## How it works

- **Public profiles** are fetched with the server's `GITHUB_PUBLIC_TOKEN`, so
  anyone's card renders without that person signing up (drives virality).
- **Signed-in users** fetch their own profile with their own OAuth token, which
  unlocks private-repo contributions.
- **All-time stats** are gathered with one GraphQL query per year (the API caps
  `contributionsCollection` at a 1-year span). Years are fetched **in parallel**,
  so even a decade-old account resolves in a few hundred milliseconds. Each
  yearly query costs ~1 API point against the 5,000/hour limit.
- Results are cached for 6 hours, so one fetch serves many viewers.

## RPG mechanics

- **XP**: `commits×10 + PRs×50 + reviews×30 + issues×15 + stars×5 +
  min(repos,50)×100 + longestStreak×25 + currentStreak×10`. PRs/reviews are
  weighted heavier than commits, and repo XP is capped, to discourage farming.
- **Levels**: `xpForLevel(n) = floor(100 × n^2.2)` — fast early, demanding late.
  Titles range from *Apprentice Coder* to *10x Mythic*.
- **Classes**: 30 languages map to classes (TypeScript → Ranger, Python →
  Wizard, Rust → Paladin, …). Unmapped languages → *Wanderer*. Your primary
  class is your most-written language.
- **Achievements**: streaks, polyglot, OSS hero, code tsunami, etc.

> Note: the contribution calendar API does not expose commit hour-of-day, so the
> Night Owl / Early Bird achievements are placeholders (always 0) until a
> separate commit-timestamp fetch is added.

## Deploy

Push to GitHub and import into Vercel. Add the same env vars in the Vercel
dashboard. The Hobby plan covers launch; note Vercel's Hobby plan is for
non-commercial use — move to Pro once you monetize.
