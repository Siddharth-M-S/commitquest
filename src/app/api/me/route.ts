import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPro } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const login = session?.login ?? null;
  return NextResponse.json({
    login,
    pro: login ? await isPro(login) : false,
  });
}
