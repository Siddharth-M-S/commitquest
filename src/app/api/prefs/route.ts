import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPro } from "@/lib/subscriptions";
import { getPrefs, setPrefs, sanitizePrefs } from "@/lib/prefs";

export const runtime = "nodejs";

// Return the signed-in user's saved card prefs.
export async function GET() {
  const session = await getServerSession(authOptions);
  const login = session?.login;
  if (!login) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json(await getPrefs(login));
}

// Save card prefs. Pro-only, and only for the signed-in user's own card.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const login = session?.login;
  if (!login) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!(await isPro(login))) {
    return NextResponse.json({ error: "Pro required" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const clean = sanitizePrefs(body);
  await setPrefs(login, clean);
  return NextResponse.json(clean);
}
