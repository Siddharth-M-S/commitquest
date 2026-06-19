import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { setPro } from "@/lib/subscriptions";

export const runtime = "nodejs";

// Stripe needs the raw body to verify the signature.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "bad signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const login =
        (s.metadata?.login as string | undefined) ??
        (s.client_reference_id as string | undefined);
      if (login) await setPro(login, true);
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.paused": {
      const sub = event.data.object as Stripe.Subscription;
      const login = sub.metadata?.login as string | undefined;
      if (login) await setPro(login, false);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const login = sub.metadata?.login as string | undefined;
      if (login) {
        const active = sub.status === "active" || sub.status === "trialing";
        await setPro(login, active);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
