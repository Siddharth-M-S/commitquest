# 📖 The CommitQuest Handbook

> The complete reference book for the CommitQuest application — architecture, setup,
> every feature, every config (env, GitHub OAuth, Upstash, Stripe, Vercel), and
> "how to change X" recipes for the future.
>
> **App:** Turn a GitHub history into a Pokémon-style RPG character card, with a Pro tier.
> **Repo:** https://github.com/Siddharth-M-S/commitquest
> **Live:** https://commitquest-lomh.vercel.app
> **As of commit:** `d9ad7e3`

---

## Table of Contents

**Part I — Overview**
1. [What CommitQuest Is](#1-what-commitquest-is)
2. [Tech Stack & Versions](#2-tech-stack--versions)
3. [Architecture](#3-architecture)

**Part II — Setup & Configuration**
4. [Prerequisites & Accounts](#4-prerequisites--accounts)
5. [Environment Variables](#5-environment-variables)
6. [Local Development Setup](#6-local-development-setup)
7. [GitHub OAuth App](#7-github-oauth-app)
8. [GitHub Public Token (PAT)](#8-github-public-token-pat)
9. [Upstash Redis](#9-upstash-redis)
10. [Stripe](#10-stripe)
11. [Vercel Deployment](#11-vercel-deployment)

**Part III — How the App Works**
12. [File & Route Map](#12-file--route-map)
13. [Data Pipeline](#13-data-pipeline)
14. [RPG Mechanics](#14-rpg-mechanics)
15. [Caching & Freshness](#15-caching--freshness)
16. [The Character Card & OG Image](#16-the-character-card--og-image)
17. [CardActions: Download, Share, Customize](#17-cardactions-download-share-customize)

**Part IV — Auth, Pro & Billing**
18. [How Login Works](#18-how-login-works)
19. [How the App Knows You're Pro](#19-how-the-app-knows-youre-pro)
20. [The Purchase Flow](#20-the-purchase-flow)
21. [Cancel / Refund & the Account Page](#21-cancel--refund--the-account-page)

**Part V — Pro Features**
22. [Private Repo Stats](#22-private-repo-stats)
23. [Clean + 2× Download](#23-clean--2x-download)
24. [Premium Themes](#24-premium-themes)
25. [Custom Title/Tagline + Layouts](#25-custom-titletagline--layouts)
26. [README Badge](#26-readme-badge)
27. [Leaderboard](#27-leaderboard)
28. [Compare](#28-compare)

**Part VI — Reference**
29. [Pages](#29-pages) · 30. [API Routes](#30-api-routes) · 31. [Components](#31-components) · 32. [Lib Modules](#32-lib-modules)

**Part VII — Security & Privacy**
33. [Server-Side Pro](#33-server-side-pro) · 34. [Private-Data Guarantees](#34-private-data-guarantees) · 35. [Secrets Handling](#35-secrets-handling)

**Part VIII — UX & Error Handling**
36. [Loaders & Skeletons](#36-loaders--skeletons) · 37. [Friendly Errors](#37-friendly-errors) · 38. [Header & Navigation](#38-header--navigation)

**Part IX — Operations & "How to Change X"**
39. [Change Recipes](#39-change-recipes) · 40. [Troubleshooting](#40-troubleshooting) · 41. [Cost & Scaling](#41-cost--scaling)

**Part X — Session Changelog**
42. [What We Built This Session](#42-what-we-built-this-session)

**Appendices**
- [A. Env Var Table](#appendix-a--env-var-table)
- [B. Redis Key Reference](#appendix-b--redis-key-reference)
- [C. Stripe Events](#appendix-c--stripe-events)
- [D. File Tree](#appendix-d--file-tree)
- [E. Glossary](#appendix-e--glossary)

---

# Part I — Overview

## 1. What CommitQuest Is

CommitQuest turns anyone's **GitHub history into a persistent RPG character card**.
Commits, pull requests, reviews, stars, and streaks become **XP**, a **level**, a
**character class** (from your top language), and unlockable **achievements** — then
it generates a glossy, shareable 1200×630 card image.

**Product model:**
- **Free** — anyone can view any GitHub user's card (no login), download it, share it,
  and browse the leaderboard. This is the viral, zero-friction core.
- **Pro ($4/mo)** — for the signed-in owner: private-repo contributions counted, clean
  watermark-free + 2× downloads, premium frames, custom title/tagline/layouts, a
  README badge, and head-to-head Compare.

**Philosophy:** runs **$0 until your first paying customer** — Next.js on Vercel Hobby +
free Upstash Redis + GitHub API + Stripe pay-per-transaction. No traditional database.

## 2. Tech Stack & Versions

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js (App Router) | `14.2.35` |
| Language | TypeScript | `5.6.3` |
| UI | React | `18.3.1` |
| Styling | Tailwind CSS | `3.4.14` |
| Auth | NextAuth (GitHub OAuth) | `4.24.8` |
| GitHub API | graphql-request | `7.1.2` |
| Store/Cache | @upstash/redis | `1.34.3` |
| Billing | stripe | `^22.2.2` |
| Card images | `next/og` (built into Next) | — |
| Proxy (corp dev) | undici | `^8.5.0` |

Scripts (`package.json`): `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

## 3. Architecture

```
                       ┌─────────────────────────────┐
   Browser  ─────────► │   Next.js (App Router)       │
   (anon or signed-in) │   on Vercel (Node runtime)   │
                       └──────┬───────────┬───────────┘
                              │           │
            ┌─────────────────┘           └──────────────────┐
            ▼                                                  ▼
   ┌───────────────────┐                          ┌────────────────────────┐
   │ GitHub GraphQL    │   stats (commits, PRs,   │ Upstash Redis          │
   │ api.github.com    │   stars, languages,      │ • stats cache          │
   │ (public PAT OR    │   contribution calendar) │ • pro: flags           │
   │  user OAuth token)│                          │ • prefs, leaderboard   │
   └───────────────────┘                          └────────────────────────┘
                              │
                              ▼
                       ┌──────────────┐    webhook    ┌─────────┐
                       │ Stripe       │ ◄───────────► │ /api/.. │
                       │ Checkout/Sub │               └─────────┘
                       └──────────────┘
```

**Request flow for a profile (`/<username>`):**
1. Page resolves `isPro(username)` (Redis) and the viewer's session.
2. `getStats(username)` → cache hit returns instantly; miss → GitHub GraphQL (one query
   per year, in parallel) → RPG engine builds the character → cached → leaderboard recorded.
3. `CharacterCard` renders; the OG route renders the shareable image on demand.

Everything runs in the Node.js runtime (`export const runtime = "nodejs"`) because the OG
font loading and Stripe need Node APIs.

---

# Part II — Setup & Configuration

## 4. Prerequisites & Accounts

- **Node.js** 18+ and npm
- **GitHub account** (for the OAuth App + a Personal Access Token)
- **Upstash account** (free Redis) — https://console.upstash.com
- **Stripe account** (Pro billing) — https://dashboard.stripe.com
- **Vercel account** (hosting) — https://vercel.com

## 5. Environment Variables

Copy the template and fill it in:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Purpose / Where to get it |
|----------|----------|---------------------------|
| `GITHUB_PUBLIC_TOKEN` | **Yes** | Classic GitHub PAT used to render *anyone's* public card when no one is signed in. Scopes: `read:user`, `public_repo`. |
| `NEXTAUTH_SECRET` | **Yes** | Session encryption. Generate: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` in dev; your prod URL on Vercel. |
| `GITHUB_CLIENT_ID` | For login | GitHub OAuth App client ID. |
| `GITHUB_CLIENT_SECRET` | For login | GitHub OAuth App secret. |
| `UPSTASH_REDIS_REST_URL` | Prod **mandatory** | Upstash Redis REST URL. Without it, all state is in-memory and resets on restart. |
| `UPSTASH_REDIS_REST_TOKEN` | Prod **mandatory** | Upstash Redis REST token. |
| `STRIPE_SECRET_KEY` | For Pro | Stripe secret key (`sk_...`). |
| `STRIPE_PRO_PRICE_ID` | For Pro | The recurring $4/mo price ID (`price_...`). |
| `STRIPE_WEBHOOK_SECRET` | For Pro | Webhook signing secret (`whsec_...`). |
| `LOCAL_PRO_USERS` | Dev only | Comma-separated usernames treated as Pro locally (e.g. `torvalds,you`). **Never set in production.** |
| `HTTPS_PROXY` / `HTTP_PROXY` | Optional | Only if developing behind a corporate proxy (see §6). |

> See [Appendix A](#appendix-a--env-var-table) for the same table plus the "what breaks if missing" column.

## 6. Local Development Setup

```bash
npm install
cp .env.local.example .env.local   # then fill values
npm run dev                        # http://localhost:3000
```

- Visit `http://localhost:3000` and search a username, or open `/torvalds` directly.
- **Minimum to run:** just `GITHUB_PUBLIC_TOKEN` (+ `NEXTAUTH_SECRET`/`URL`). Without
  Redis/OAuth/Stripe the app still runs: cache is in-memory, login shows no button, Pro
  checkout 503s. Use `LOCAL_PRO_USERS` to preview Pro visuals without paying.

**Corporate proxy (dev only):** `src/lib/proxy.ts` reads `HTTPS_PROXY`/`HTTP_PROXY` and
installs an `undici` ProxyAgent so GitHub API calls succeed behind a proxy. On Vercel
there's no proxy env, so it's a **no-op** — fully portable.

**`@vercel/og` Windows font patch:** on Windows, `@vercel/og` builds a malformed
`file://` URL for its default font. Locally this repo passes explicit bundled fonts
(`assets/NotoSans-Regular.ttf`) and patches `node_modules` (not committed). Vercel builds
on Linux where the bug doesn't exist, so **no patch is needed in production**. The font is
bundled into the serverless function via `next.config.js`:

```js
experimental: { outputFileTracingIncludes: { "/api/og/[username]": ["./assets/**"] } }
```

## 7. GitHub OAuth App

Enables login + private stats. Create at https://github.com/settings/developers → **New OAuth App**.

- **Homepage URL:** your site (e.g. `https://commitquest-lomh.vercel.app`)
- **Authorization callback URL:** `https://<your-domain>/api/auth/callback/github`
  (locally: `http://localhost:3000/api/auth/callback/github`)
- Copy **Client ID** + generate a **Client Secret** → `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.

**Scope:** the app requests `read:user repo` (`src/lib/auth.ts`). The broad `repo` scope is
what lets a Pro user's own token read their **private** contribution counts. Because it's
broad, users see a private-repo consent prompt; if you ever change the scope, **all existing
users must re-authorize**.

## 8. GitHub Public Token (PAT)

A **classic** Personal Access Token at https://github.com/settings/tokens with scopes
`read:user` + `public_repo`. This is the server's token for rendering **anyone's** public
card when no user is signed in (drives virality). Set as `GITHUB_PUBLIC_TOKEN`. Each yearly
GraphQL query costs ~1 point against the 5,000/hour limit.

## 9. Upstash Redis

Create a free DB at https://console.upstash.com → copy the **REST URL** + **REST token**
into `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.

**Why it's mandatory in production:** Redis persists the **Pro flags**, **card prefs**, and
the **leaderboard**, plus the stats cache. Without it everything falls back to in-memory maps
that **reset on every deploy/restart** — meaning purchases would vanish. Keys used:

| Key pattern | Purpose | File |
|-------------|---------|------|
| `stats:<login>` | Free (public) stats cache, 6h TTL | `cache.ts` |
| `stats:pro:<login>` | Pro stats cache (may include private totals), 5min TTL | `cache.ts` |
| `pro:<login>` | Pro subscription flag (`=1`) | `subscriptions.ts` |
| `prefs:<login>` | Pro card prefs (title/tagline/theme/layout) | `prefs.ts` |
| `leaderboard:xp` | Sorted set, score = XP | `leaderboard.ts` |
| `lb:profile:<login>` | Leaderboard display blob | `leaderboard.ts` |

## 10. Stripe

1. **Product + Price:** create Product "CommitQuest Pro" with a **recurring $4/month** price.
   Copy the price ID (`price_...`) → `STRIPE_PRO_PRICE_ID`.
2. **Secret key:** `sk_...` → `STRIPE_SECRET_KEY`.
3. **Webhook endpoint:** `https://<your-domain>/api/stripe/webhook` with events:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `customer.subscription.paused`.
   Copy the signing secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.
4. **Test mode:** use card `4242 4242 4242 4242`, any future expiry/CVC.
5. **Go live:** swap to live keys + a live webhook secret; set the business/account name in
   the Stripe dashboard (required for Checkout).

> ⚠️ The displayed "$4/mo" on `/pricing` is **UI text**; the real charge is whatever the
> Stripe Price is set to. Keep them in sync.

**Test the webhook locally:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# paste the printed whsec_... into .env.local as STRIPE_WEBHOOK_SECRET
```

## 11. Vercel Deployment

1. Import the repo at https://vercel.com/new (Next.js auto-detected; leave defaults).
2. **Settings → Environment Variables:** add every var from §5 (mark secrets as Sensitive).
   Your current project (`commitquest-lomh`) already has them set.
3. **Deploy.** Every push to `main` auto-deploys.
4. **OG font** is bundled via `outputFileTracingIncludes` (already configured) — no action.

> ⚠️ Env var changes only apply to **deployments created after** the change. After editing
> env, redeploy.
>
> ⚠️ Vercel **Hobby is non-commercial**. Once you monetize, move to Vercel Pro ($20/mo) or a
> commercial-OK host (Netlify/Cloudflare).
>
> **Immutability note:** only the bare domain (`commitquest-lomh.vercel.app`) reflects the
> latest deploy — the `-hash-` preview URLs are pinned to specific builds.

---

# Part III — How the App Works

## 12. File & Route Map

```
src/
├── app/
│   ├── layout.tsx                 # Root layout — mounts <SiteHeader/>
│   ├── page.tsx                   # Home (username search, Reveal)
│   ├── error.tsx                  # Global error boundary
│   ├── not-found.tsx              # Branded 404
│   ├── globals.css
│   ├── [username]/
│   │   ├── page.tsx               # Public profile (works w/o login) + ?upgraded banner
│   │   └── loading.tsx            # Card skeleton during fetch
│   ├── account/page.tsx           # Signed-in identity + Pro status
│   ├── pricing/page.tsx           # Free vs Pro, sign-in, upgrade
│   ├── faq/page.tsx               # 30-question FAQ (accordions)
│   ├── leaderboard/
│   │   ├── page.tsx               # Top 50 by XP
│   │   └── loading.tsx
│   ├── compare/
│   │   ├── page.tsx               # Compare landing (Pro-gated form)
│   │   └── [a]/[b]/
│   │       ├── page.tsx           # Head-to-head result
│   │       └── loading.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # NextAuth handler
│       ├── stats/[username]/route.ts     # JSON stats
│       ├── og/[username]/route.tsx       # Shareable card image
│       ├── badge/[username]/route.ts     # Pro README SVG badge
│       ├── prefs/route.ts                # GET/POST Pro card prefs
│       ├── me/route.ts                   # {login, pro, authConfigured}
│       ├── checkout/route.ts             # Stripe Checkout session
│       └── stripe/webhook/route.ts       # Stripe → setPro
├── components/
│   ├── CharacterCard.tsx          # On-page card (HTML)
│   ├── CardActions.tsx            # Download/share/customize studio
│   ├── SiteHeader.tsx             # Global header (nav + auth state)
│   ├── SignInButton.tsx           # SignIn/SignOut client buttons
│   ├── CompareForm.tsx            # Compare input form
│   ├── Spinner.tsx                # Spinner + PageLoader
│   ├── SkillBar.tsx               # Skill progress bars
│   └── AchievementBadge.tsx       # Achievement icons
└── lib/
    ├── auth.ts                    # NextAuth options (GitHub, scope=repo)
    ├── cache.ts                   # Redis + in-memory; free 6h / pro 5min
    ├── card-theme.ts              # Stat themes, premium themes, rarity
    ├── subscriptions.ts           # isPro / setPro (+ LOCAL_PRO_USERS)
    ├── prefs.ts                   # Pro card prefs store + sanitize
    ├── leaderboard.ts             # XP sorted set + record/top/rank
    ├── stats-service.ts           # fetch + cache + build + record
    ├── stripe.ts                  # lazy Stripe client + PRO_PRICE_ID
    ├── proxy.ts                   # corp proxy dispatcher (dev)
    ├── types.ts                   # shared types
    ├── github/{client,queries,fetcher}.ts
    └── rpg/{engine,xp,levels,skills,achievements}.ts
```

## 13. Data Pipeline

`getStats(login, { token?, pro? })` in `src/lib/stats-service.ts` orchestrates:

1. **Cache check** — `getCachedStats(login, pro)`. Hit → record leaderboard, return.
2. **Fetch** — `fetchRawStats(login, token ?? publicToken())`:
   - `PROFILE_QUERY` once: profile + owned non-fork repos (stars, languages, `isPrivate`).
   - `CONTRIB_QUERY` **once per year** (the API caps `contributionsCollection` at 1 year),
     all years **in parallel** — so even a decade-old account resolves fast.
3. **Private fold** — if `pro && privateContributions > 0`, add private contributions to
   `totalCommits` (Pro perk).
4. **Build** — `buildGameStats(raw)` → XP, level, skills, class, achievements.
5. **Cache + record** — `setCachedStats(login, game, pro)` and `recordLeader(game, pro)`.

**Token selection:** the owner's OAuth token when self-viewing (unlocks private data),
otherwise the server `GITHUB_PUBLIC_TOKEN`.

**Derived stats:** commits/PRs/reviews/issues = summed yearly contributions; stars = sum of
owned non-fork repo stargazers; streaks/max-day/weekend from the contribution calendar;
languages = byte totals across owned repos.

**NOT available:** commit hour-of-day (so `lateNightCommits`/`morningCommits` are always 0).

## 14. RPG Mechanics

### XP — `src/lib/rpg/xp.ts`
```
XP = commits×10 + PRs×50 + reviews×30 + issues×15 + stars×5
   + min(repos,50)×100 + longestStreak×25 + (currentStreak>0 ? currentStreak×10 : 0)
```
PRs/reviews outweigh commits, and repo XP is capped at 50 repos — to discourage farming.

### Levels — `src/lib/rpg/levels.ts`
`xpForLevel(n) = floor(100 × n^2.2)` (fast early, demanding late). Titles:

| Min level | Title |
|-----------|-------|
| 1 | Apprentice Coder |
| 5 | Code Squire |
| 10 | Senior Dev |
| 15 | Architect |
| 20 | Principal Engineer |
| 25 | Tech Lead |
| 30 | Staff Engineer |
| 40 | Distinguished Engineer |
| 50 | 10x Mythic |

### Rarity — `src/lib/card-theme.ts`
`<10` COMMON · `≥10` RARE · `≥20` EPIC · `≥30` LEGENDARY (holo) · `≥50` MYTHIC (holo).

### Class / Skills — `src/lib/rpg/skills.ts`
30 language→class mappings (TypeScript→Ranger/DEX, Python→Wizard/INT, JavaScript→Rogue/AGI,
Rust→Paladin/DEF, Go→Monk/SPD, …); unmapped → **Wanderer (LCK)**. Skills = languages >2% of
code, top 5 by share; **primary class = most-written language** (sets the card color theme).

### Achievements — `src/lib/rpg/achievements.ts`
10 threshold-based: Month Warrior (30-day streak), Centurion (100-day), Polyglot (10+ langs),
PR Machine (100+ PRs), OSS Hero (100+ stars), Weekend Hacker, Code Tsunami (50+ in a day),
Code Sheriff (50+ reviews) — plus **Night Owl / Early Bird** which **can never unlock** (hour-of-day
data isn't exposed by GitHub).

## 15. Caching & Freshness

`src/lib/cache.ts`:
- **Free TTL = 6 hours**, **Pro TTL = 5 minutes** (priority refresh).
- **Separate namespaces** (`stats:` vs `stats:pro:`) so private totals never leak into public cards.
- Redis when configured, else in-memory `Map` (dev).

**Propagation:** one fetch serves many viewers; a Pro user's changes surface within ~5 min,
free profiles within ~6 h.

**The private-numbers tradeoff:** private contributions only enter the cache when the **owner**
views their own signed-in profile. If the Pro cache expires while only strangers view the card,
the next fetch uses the public token (no private access) and temporarily shows public-only
numbers until the owner visits again. Aggregate numbers only — never names/code.

## 16. The Character Card & OG Image

- **On-page card:** `src/components/CharacterCard.tsx` — HTML/Tailwind. Shows rarity, level,
  avatar, `@username` (links to GitHub), class banner, XP bar, 6 stats, "🔒 Includes private
  repo contributions" note when applicable, skill tree, achievements.
- **Shareable image:** `src/app/api/og/[username]/route.tsx` — `next/og`, 1200×630. Decides
  Pro **server-side** (`isPro`). Honored only for Pro: `?theme=`, `?layout=`, `?title=`,
  `?tagline=`, `?scale=2`. Free cards get a `⚔ CommitQuest` watermark; Pro cards are clean.
  Layouts: `detailed` (skills footer), `compact` (stat boxes, no footer), `minimal` (no boxes).

## 17. CardActions: Download, Share, Customize

`src/components/CardActions.tsx` (client):
- **Download PNG** — Pro gets clean **2× hi-res** (`?scale=2`), free gets 1× watermarked.
- **Copy link** · **Share** — native device share sheet if available, else a menu: X,
  LinkedIn, Facebook, Reddit, WhatsApp.
- **👑 Customize** (owner + Pro only) — a studio with title/tagline inputs, theme + layout
  pickers, a **debounced live-preview image**, and **Save** (POST `/api/prefs`).

---

# Part IV — Auth, Pro & Billing

## 18. How Login Works

`src/lib/auth.ts` — NextAuth GitHub provider, scope `read:user repo`. On sign-in the JWT/session
stores:
- `session.login` — your GitHub username (your identity everywhere)
- `session.accessToken` — your GitHub token (used only to read *your own* private stats)

Types are augmented in `src/types/next-auth.d.ts`. The handler lives at
`src/app/api/auth/[...nextauth]/route.ts`. **There is no email/password and no signup** — GitHub
is the login. Sign-in is a button (header, `/pricing`, `/account`), not a page.

## 19. How the App Knows You're Pro

`src/lib/subscriptions.ts`:
```ts
isPro(login):
  if !login                          -> false
  if login in LOCAL_PRO_USERS (dev)  -> true
  if redis pro:<login> == 1          -> true
  else                               -> false
```
Pro is a **server-side flag keyed by username** — not a cookie, not the URL. Two layers:

| Behavior | How known | Login needed? |
|----------|-----------|---------------|
| Public card/OG/badge looks Pro to anyone | `isPro(username)` by username | ❌ |
| Edit card, Compare, private stats | session `login` → `isPro(login)` | ✅ |

**Security:** no URL param can grant Pro. `?theme/?scale/?layout/?title/?tagline` are ignored
unless `isPro(username)` is true server-side.

## 20. The Purchase Flow

1. Browse free (no login). Click **✦ Go Pro** → `/pricing`.
2. **Sign in with GitHub** (Step 1 — checkout requires a session).
3. **Upgrade to Pro** → `POST /api/checkout` creates a Stripe subscription session stamped
   with your username (`client_reference_id` + `metadata.login`), redirects to Stripe.
4. Pay → Stripe calls **`/api/stripe/webhook`** → on `checkout.session.completed` runs
   `setPro(login, true)` → writes `pro:<login>=1`.
5. Success redirect → `/<login>?upgraded=1` shows the **🎉 Welcome to Pro** banner (or
   "activating…" if the webhook hasn't landed yet).

From then on `isPro(login)` is true and Pro is unlocked everywhere — even on your public card.

## 21. Cancel / Refund & the Account Page

Webhook (`src/app/api/stripe/webhook/route.ts`):
- `customer.subscription.deleted` / `paused` → `setPro(login, false)`
- `customer.subscription.updated` → Pro on only if status `active`/`trialing`, else off

Cancellation happens Stripe-side ("Cancel anytime"); the webhook flips Pro off. On cancel you
keep the free experience; premium features turn off.

**Account page** (`/account`) shows your live `@username`, server-checked Pro status, a "how we
know you're Pro" explainer, and Sign out. Linked from the header user menu (**⚙ Account**).

---

# Part V — Pro Features

## 22. Private Repo Stats
**What:** private-repo contributions count toward commits/XP/level. **Why:** if you work in
private, your real numbers finally show. **How gated:** owner's OAuth token only (scope `repo`);
`if (pro && privateContributions>0) totalCommits += privateContributions`. Private repo **names
are never shown** — `topRepos` excludes `isPrivate`; card shows a generic "🔒" note. **Files:**
`auth.ts`, `github/fetcher.ts`, `stats-service.ts`, `CharacterCard.tsx`.

## 23. Clean + 2× Download
**What:** no watermark + 2400×1260 (2×) PNG. **How:** OG route omits the `⚔ CommitQuest` footer
when `proStyle`; `?scale=2` honored only for Pro; `CardActions` downloads `…-2x.png`.

## 24. Premium Themes
`holo / gold / obsidian / rose` (`PREMIUM_THEMES` in `card-theme.ts`). Applied via `?theme=` or
saved pref, **only when Pro**. Free always uses the language type-color theme.

## 25. Custom Title/Tagline + Layouts
Title (≤24 chars) replaces the class banner; tagline (≤40) replaces the subtitle; layouts
`detailed/compact/minimal`. Stored per user (`prefs.ts`, `prefs:<login>`), edited in the
Customize studio, saved via `POST /api/prefs` (sign-in + Pro required, input sanitized).

## 26. README Badge
`GET /api/badge/<username>` → auto-updating 480×120 SVG (name, level, class, rarity, XP, 👑 PRO).
Pro-gated: non-Pro get a 200 "upgrade to embed" placeholder SVG. Embed:
```md
![CommitQuest](https://YOUR-DOMAIN/api/badge/your-username)
```

## 27. Leaderboard
`/leaderboard` — top 50 by **XP** (`leaderboard:xp` sorted set). You join automatically (every
profile view calls `recordLeader`). **Pro flair:** amber row + 👑 PRO pill (visibility boost,
**not** rank). Your own row gets a purple ring. Ranking stays pure-XP/honest.

## 28. Compare
`/compare` (form) and `/compare/[a]/[b]` (result). **Pro-gated by the viewer** — you (signed-in
Pro) can compare any two public profiles. Scores 9 metrics (level, XP, commits, PRs, reviews,
stars, streak, repos, followers), renders both cards side-by-side + a winner table.

---

# Part VI — Reference

## 29. Pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/` | `app/page.tsx` | none | Username search; Reveal has a spinner |
| `/[username]` | `app/[username]/page.tsx` | none | Public card; `?upgraded=1` banner; friendly errors |
| `/account` | `app/account/page.tsx` | optional | Identity + Pro status |
| `/pricing` | `app/pricing/page.tsx` | optional | Free vs Pro, sign-in, upgrade |
| `/faq` | `app/faq/page.tsx` | none | 30-question accordion FAQ |
| `/leaderboard` | `app/leaderboard/page.tsx` | none | Top 50 by XP |
| `/compare` | `app/compare/page.tsx` | Pro | Gated form |
| `/compare/[a]/[b]` | `app/compare/[a]/[b]/page.tsx` | Pro | Head-to-head |

Plus `error.tsx`, `not-found.tsx`, and `loading.tsx` for profile/leaderboard/compare.

## 30. API Routes

| Route | Method | Gating | Returns |
|-------|--------|--------|---------|
| `/api/auth/[...nextauth]` | * | — | NextAuth |
| `/api/stats/[username]` | GET | owner token if self | JSON stats |
| `/api/og/[username]` | GET | Pro decides cosmetics | PNG image |
| `/api/badge/[username]` | GET | Pro (else placeholder) | SVG |
| `/api/prefs` | GET/POST | GET=signed-in, POST=signed-in+Pro | card prefs |
| `/api/me` | GET | — | `{login, pro, authConfigured}` |
| `/api/checkout` | POST | signed-in (401 else) | `{url}` Stripe |
| `/api/stripe/webhook` | POST | Stripe signature | `{received:true}` |

## 31. Components
`CharacterCard`, `CardActions`, `SiteHeader`, `SignInButton` (SignIn/SignOut), `CompareForm`,
`Spinner`/`PageLoader`, `SkillBar`, `AchievementBadge`.

## 32. Lib Modules
`auth`, `cache`, `card-theme`, `subscriptions`, `prefs`, `leaderboard`, `stats-service`,
`stripe`, `proxy`, `types`, `github/{client,queries,fetcher}`, `rpg/{engine,xp,levels,skills,achievements}`.

---

# Part VII — Security & Privacy

## 33. Server-Side Pro
Pro is decided only by `isPro(username)` on the server. No URL parameter, cookie, or client value
can grant Pro. Cosmetic params are honored **after** the server confirms Pro.

## 34. Private-Data Guarantees
- Private data is read **only** with the owner's own token, **only** on their signed-in self-view.
- Private repo **names/content are never read, stored, or shown** — only aggregate counts.
- `topRepos` filters out `isPrivate`; the card shows a generic "🔒 Includes private repo
  contributions" note.

## 35. Secrets Handling
- `.env.local` is **gitignored**; only `.env.local.example` (empty placeholders) is committed.
- Mark Vercel vars **Sensitive**.
- `LOCAL_PRO_USERS` is dev-only and must never be set in production (it would grant Pro).

---

# Part VIII — UX & Error Handling

## 36. Loaders & Skeletons
Route-level `loading.tsx` (Suspense) for profile (card skeleton), leaderboard, and compare;
button spinners on Reveal, Compare, Download ("Preparing…"), Save ("Saving…"); a spinner overlay
on the Customize live-preview image. `Spinner`/`PageLoader` in `components/Spinner.tsx`.

## 37. Friendly Errors
- **Profile** (`friendlyError`): classifies into "couldn't find @user" / "we're busy (rate
  limit)" / generic — never leaks env names or stack traces; offers "Try another username".
- **Global** `error.tsx`: "🛠️ Something went wrong" + Try again / Go home (logs real error to console).
- **404** `not-found.tsx`: branded page.
- **Checkout**: inline red notice instead of `alert()`; handles non-JSON responses.
- **Compare**: friendly "couldn't compare these profiles".

## 38. Header & Navigation
`SiteHeader` (sticky, global): brand · Leaderboard/Compare/FAQ · **✦ Go Pro** (hidden when Pro) ·
auth state (Sign in *or* `@user` + 👑 PRO + dropdown with My card / ⚙ Account / Sign out). The
**Sign in** button only appears when GitHub OAuth is configured (`authConfigured`).

---

# Part IX — Operations & "How to Change X"

## 39. Change Recipes

**Change the Pro price**
1. Stripe → create/update the recurring Price → copy `price_...`.
2. Update `STRIPE_PRO_PRICE_ID` in Vercel → redeploy.
3. Update the "$4/mo" text in `src/app/pricing/page.tsx` to match.

**Add a premium theme** — add an entry to `PREMIUM_THEMES` in `src/lib/card-theme.ts`, then add
its name to `PRO_THEMES` in `CardActions.tsx` and `PREF_THEMES` in `prefs.ts`.

**Add/loosen an achievement** — edit `src/lib/rpg/achievements.ts` (note hour-of-day data is
unavailable). Add the icon mapping in `AchievementBadge.tsx` if new.

**Tune XP** — edit `XP_WEIGHTS` / `MAX_REPOS_CREDITED` in `src/lib/rpg/xp.ts`.

**Change cache freshness** — edit `FREE_TTL_SECONDS` / `PRO_TTL_SECONDS` in `src/lib/cache.ts`.

**Add a language→class** — edit `LANGUAGE_CLASSES` in `src/lib/rpg/skills.ts`.

**Redesign the card** — visual HTML card in `CharacterCard.tsx`; the shareable image in
`api/og/[username]/route.tsx` (keep the two visually in sync).

**Add a new Pro feature** — gate it with `await isPro(username)` server-side; for owner-only
editing also check the session `login` matches. Never trust URL/client for Pro.

**Add a card layout** — add to `PREF_LAYOUTS` in `prefs.ts`, handle it in the OG route's layout
switch, and add the button in `CardActions.tsx`.

## 40. Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| No "Sign in" button | `GITHUB_CLIENT_ID/SECRET` not set → `authConfigured:false`. Add them, redeploy. |
| Paid but not Pro | Webhook not firing: check Stripe webhook URL/secret + that the 4 events are enabled. |
| Leaderboard empty | Upstash not reachable/configured → in-memory only. Set Upstash env. |
| Pro resets after deploy | No Redis → in-memory store. Configure Upstash. |
| OG image 500 / blank | Font bundling — ensure `outputFileTracingIncludes` present; locally ensure `assets/NotoSans-Regular.ttf` exists. |
| "GITHUB_PUBLIC_TOKEN not set" | Add the classic PAT. |
| GitHub rate limit | Cards cached; wait a minute. Each yearly query ~1 of 5,000/hr. |
| Private stats not showing | Only counts when the **owner** views their signed-in self-view; revisit to republish. |

## 41. Cost & Scaling
All free to start: Vercel Hobby, Upstash free, GitHub API, Stripe pay-per-transaction. Move to a
commercial-OK host once monetized (Vercel Hobby is non-commercial). Scale levers: raise cache TTLs,
add more PATs, or cache the OG image at a CDN edge.

---

# Part X — Session Changelog

## 42. What We Built This Session

Mapped to commits **`f43a74f`** (big feature set) and **`d9ad7e3`** (account + auth UX), on top of
the prior MVP (`6993e3a`).

**Card design**
- Reverted Pro card to the clean type-color foil (same frame as Free); removed the holo sparkle
  overlay and the rainbow frame; removed the top-center gold "PRO" pill; Pro differs by the
  footer marker + (optional) premium frame.

**Pro functional features (the 12-feature table)**
- ✅ Private repo stats (scope `repo`, owner token, names excluded, `includesPrivate` flag)
- ✅ Clean watermark-free card + 2× hi-res download
- ✅ Premium theme picker (holo/gold/obsidian/rose)
- ✅ Custom title/tagline
- ✅ Multiple layouts (detailed/compact/minimal)
- ✅ README badge (already existed; documented)
- ✅ Auto-refresh: Pro 5-min vs Free 6-h cache (separate namespaces)
- ✅ Customize studio with live preview + save (`/api/prefs`, `prefs.ts`)
- ❌ Animated holo web card — **cancelled** per request
- (Full private-repo *detail* beyond aggregates still needs the OAuth scope decision — done via `repo`.)

**New surfaces**
- 🏆 **Leaderboard** (`/leaderboard`, `leaderboard.ts`) with Pro flair.
- ⚔ **Compare** (`/compare`, `/compare/[a]/[b]`) — Pro-gated, 9-metric winner.
- ❓ **FAQ** (`/faq`) — 30 questions across 8 sections.
- 🧭 **Global header** (`SiteHeader`) with nav + auth/Pro state + Go Pro button.
- ⚙ **Account page** (`/account`) + SignIn/SignOut buttons.

**Sharing & polish**
- Share menu: X, LinkedIn, Facebook, Reddit, WhatsApp + native share.
- Username links to the GitHub profile.
- Route-level loaders/skeletons + button spinners.

**Robustness**
- Friendly error handling everywhere (profile `friendlyError`, `error.tsx`, `not-found.tsx`,
  inline checkout notice, compare error) — no raw code/env leaks to users.
- `?upgraded=1` Stripe success banner (Welcome to Pro / activating…).
- Pricing Pro list corrected to list all real features; "Step 1 of 2" sign-in note.
- Redis-backed prefs/leaderboard with graceful in-memory fallback.

**Known bug fixed:** OG render crash from an unconditional `transformOrigin` (only set it with a
matching `transform` when scaling).

---

# Appendix A — Env Var Table

| Variable | Required | Breaks if missing |
|----------|----------|-------------------|
| `GITHUB_PUBLIC_TOKEN` | Yes | Public cards 500 ("token not set") |
| `NEXTAUTH_SECRET` | Yes | Sessions broken |
| `NEXTAUTH_URL` | Yes | OAuth redirects/Checkout URLs wrong |
| `GITHUB_CLIENT_ID`/`SECRET` | Login | No Sign-in button; can't buy Pro |
| `UPSTASH_REDIS_REST_URL`/`TOKEN` | Prod | Pro/prefs/leaderboard reset on restart |
| `STRIPE_SECRET_KEY` | Pro | Checkout 503 |
| `STRIPE_PRO_PRICE_ID` | Pro | Checkout 503 |
| `STRIPE_WEBHOOK_SECRET` | Pro | Webhook 503; Pro never activates |
| `LOCAL_PRO_USERS` | Dev | — (dev convenience) |
| `HTTPS_PROXY`/`HTTP_PROXY` | Dev (proxy) | GitHub calls fail behind proxy |

# Appendix B — Redis Key Reference

| Key | Type | TTL | Set by |
|-----|------|-----|--------|
| `stats:<login>` | JSON | 6h | `cache.ts` |
| `stats:pro:<login>` | JSON | 5min | `cache.ts` |
| `pro:<login>` | `1` | none | `subscriptions.setPro` |
| `prefs:<login>` | JSON | none | `prefs.setPrefs` |
| `leaderboard:xp` | sorted set | none | `leaderboard.recordLeader` |
| `lb:profile:<login>` | JSON | none | `leaderboard.recordLeader` |

# Appendix C — Stripe Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | `setPro(login, true)` |
| `customer.subscription.deleted` | `setPro(login, false)` |
| `customer.subscription.paused` | `setPro(login, false)` |
| `customer.subscription.updated` | Pro on if `active`/`trialing`, else off |

# Appendix D — File Tree
See [§12](#12-file--route-map) for the annotated tree.

# Appendix E — Glossary

- **XP** — experience points from GitHub activity (see §14).
- **Rarity** — COMMON→MYTHIC tier from level.
- **Class** — RPG class from your most-written language.
- **Holo** — holographic foil styling on high rarities / the `holo` premium theme.
- **OG image** — the 1200×630 shareable card from `next/og`.
- **Pro flag** — `pro:<username>=1` in Redis; the source of truth for Pro.
- **Owner self-view** — a signed-in user viewing their own profile (unlocks private stats).

---

*End of handbook. Keep this file updated as the app evolves — it's the single source of truth.*
