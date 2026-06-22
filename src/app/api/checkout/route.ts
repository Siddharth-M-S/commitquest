import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PRO_PRICE_ID } from "@/lib/stripe";

// NOTE: Lemon Squeezy checkout is implemented but commented out until
// LS store verification is complete. See src/lib/lemonsqueezy.ts.
// import { createCheckoutUrl, LS_VARIANT_ID, LS_STORE_ID, getLSApiKey } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.login) {
    return NextResponse.json(
      { error: "Sign in with GitHub first." },
      { status: 401 }
    );
  }

  const stripe = getStripe();
  if (!stripe || !PRO_PRICE_ID) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 503 }
    );
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      client_reference_id: session.login,
      metadata: { login: session.login },
      subscription_data: { metadata: { login: session.login } },
      success_url: `${base}/${session.login}?upgraded=1`,
      cancel_url: `${base}/pricing`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
