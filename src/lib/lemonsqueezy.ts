// Lemon Squeezy client — replaces stripe.ts
// Uses the REST API directly (no SDK needed).

export const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

export const LS_VARIANT_ID = process.env.LS_VARIANT_ID ?? "1822326";
export const LS_STORE_ID   = process.env.LS_STORE_ID ?? "";

export function getLSApiKey(): string | null {
  return process.env.LS_API_KEY ?? null;
}

export async function createCheckoutUrl(
  variantId: string,
  login: string,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  const apiKey = getLSApiKey();
  const storeId = LS_STORE_ID;
  if (!apiKey || !storeId) return null;

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: { login },
          },
          product_options: {
            redirect_url: successUrl,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: String(storeId) },
          },
          variant: {
            data: { type: "variants", id: String(variantId) },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("LS createCheckout error:", res.status, text);
    return null;
  }

  const json = await res.json();
  return (json?.data?.attributes?.url as string) ?? null;
}
