import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PRO_PRICE_ID } from "@/lib/stripe";

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

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    // Carry the GitHub login through to the webhook.
    client_reference_id: session.login,
    metadata: { login: session.login },
    subscription_data: { metadata: { login: session.login } },
    success_url: `${base}/${session.login}?upgraded=1`,
    cancel_url: `${base}/pricing`,
  });

  return NextResponse.json({ url: checkout.url });
}
