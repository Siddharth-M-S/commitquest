import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPro, isStarPro, setPro, setStarPro } from "@/lib/subscriptions";

export const runtime = "nodejs";

const REPO_OWNER = "Siddharth-M-S";
const REPO_NAME = "commitquest";

export async function GET() {
  const session = await getServerSession(authOptions);
  const login = session?.login ?? null;
  const accessToken = session?.accessToken ?? null;

  const authConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  let pro = login ? await isPro(login) : false;

  // If Pro came from a star, re-verify it's still starred.
  // If they un-starred, silently revoke Pro.
  if (pro && login && accessToken && (await isStarPro(login))) {
    const res = await fetch(
      `https://api.github.com/user/starred/${REPO_OWNER}/${REPO_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (res.status === 404) {
      // Un-starred — revoke Pro silently
      await setPro(login, false);
      await setStarPro(login, false);
      pro = false;
    }
  }

  return NextResponse.json({ login, pro, authConfigured });
}
