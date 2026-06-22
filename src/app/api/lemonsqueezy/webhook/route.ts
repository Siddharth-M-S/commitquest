import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { setPro } from "@/lib/subscriptions";

export const runtime = "nodejs";

// Lemon Squeezy signs webhooks with HMAC-SHA256 using your webhook secret.
export async function POST(req: Request) {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 }
    );
  }

  const sig = req.headers.get("x-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await req.text();

  // Verify HMAC-SHA256 signature
  const hmac = createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("hex");

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const digestBuf = Buffer.from(digest, "hex");
    if (
      sigBuf.length !== digestBuf.length ||
      !timingSafeEqual(sigBuf, digestBuf)
    ) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    meta?: { event_name?: string; custom_data?: { login?: string } };
    data?: {
      attributes?: {
        status?: string;
        user_email?: string;
      };
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = event?.meta?.event_name;
  const login = event?.meta?.custom_data?.login;

  if (!login) {
    // No login in custom_data — can't map to a user, skip silently
    console.warn("LS webhook: no login in custom_data for event", eventName);
    return NextResponse.json({ received: true });
  }

  switch (eventName) {
    // Subscription created or payment succeeded
    case "order_created":
    case "subscription_created":
    case "subscription_payment_success":
      await setPro(login, true);
      break;

    // Subscription cancelled, expired, or payment failed
    case "subscription_cancelled":
    case "subscription_expired":
    case "subscription_payment_failed":
    case "subscription_payment_recovered":
      if (eventName === "subscription_payment_recovered") {
        await setPro(login, true);
      } else {
        await setPro(login, false);
      }
      break;

    // Subscription resumed or updated — check status
    case "subscription_updated": {
      const status = event?.data?.attributes?.status;
      const active = status === "active" || status === "on_trial";
      await setPro(login, active);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
