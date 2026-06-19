import Stripe from "stripe";

// Lazily instantiate so the app builds/runs even without Stripe keys
// (Pro checkout simply 503s until configured).
let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return stripe;
}

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID ?? "";
