import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStats } from "@/lib/stats-service";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const login = params.username;
  try {
    const session = await getServerSession(authOptions);
    // Use the signed-in user's token only when requesting their own profile.
    const token =
      session?.login?.toLowerCase() === login.toLowerCase()
        ? session.accessToken
        : undefined;

    const stats = await getStats(login, token);
    return NextResponse.json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to load stats for "${login}": ${message}` },
      { status: 502 }
    );
  }
}
