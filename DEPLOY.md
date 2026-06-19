# Deploying CommitQuest

CommitQuest is a standard Next.js app and deploys best on **Vercel**. This guide
takes you from local code to a live URL, then wires up the Pro tier.

> Note about the local Windows patch: this repo patches a `@vercel/og` Windows
> font bug in `node_modules` (not committed). Vercel builds on Linux where the
> bug doesn't exist, so no patch is needed in production.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "CommitQuest MVP + Pro tier"
git branch -M main
git remote add origin https://github.com/<you>/commitquest.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to <https://vercel.com/new> and import the repo.
2. Framework preset is auto-detected (Next.js). Leave defaults.
3. Add **Environment Variables** (Settings → Environment Variables):

   | Variable | Required | Value |
   |----------|----------|-------|
   | `GITHUB_PUBLIC_TOKEN` | yes | Classic PAT (`read:user`, `public_repo`) |
   | `NEXTAUTH_SECRET` | yes | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | yes | your prod URL, e.g. `https://commitquest.vercel.app` |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | for login | from your GitHub OAuth App |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | recommended | free Upstash Redis (cache + Pro store) |
   | `STRIPE_SECRET_KEY` | for Pro | from Stripe dashboard |
   | `STRIPE_PRO_PRICE_ID` | for Pro | the $4/mo recurring price ID |
   | `STRIPE_WEBHOOK_SECRET` | for Pro | from the webhook endpoint (step 4) |

4. Deploy. You get a URL like `https://commitquest.vercel.app`.

## 3. GitHub OAuth App (enables login + private stats)

1. <https://github.com/settings/developers> → New OAuth App.
2. Homepage URL: your Vercel URL.
3. Authorization callback URL:
   `https://<your-domain>/api/auth/callback/github`
4. Copy Client ID + generate a secret → put both in Vercel env vars → redeploy.

## 4. Stripe (Pro tier)

1. Create a **Product** "CommitQuest Pro" with a **recurring $4/month price**.
   Copy the price ID (`price_...`) → `STRIPE_PRO_PRICE_ID`.
2. Copy your secret key (`sk_...`) → `STRIPE_SECRET_KEY`.
3. Add a **webhook endpoint**: `https://<your-domain>/api/stripe/webhook`
   - Events: `checkout.session.completed`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `customer.subscription.paused`.
   - Copy the signing secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. Visit `/pricing`, sign in, and "Upgrade to Pro" runs Stripe
   Checkout. On success the webhook flips the user to Pro in Redis.

### Test Stripe locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the printed whsec_... into .env.local as STRIPE_WEBHOOK_SECRET
```

## 5. Upstash Redis (cache + Pro persistence)

Without Redis, the stats cache and Pro flags live in memory and reset on every
deploy/restart. For production, create a free database at
<https://console.upstash.com> and paste the REST URL + token into Vercel.

## Cost summary

Everything has a free tier (Vercel Hobby, Upstash free, GitHub, Stripe
pay-per-transaction). Note Vercel Hobby is non-commercial — move to Pro ($20/mo)
once you monetize.
