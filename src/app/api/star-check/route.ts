import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setPro, setStarPro } from "@/lib/subscriptions";

export const runtime = "nodejs";

const REPO_OWNER = "Siddharth-M-S";
const REPO_NAME = "commitquest";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.login || !session?.accessToken) {
    return NextResponse.json(
      { error: "Sign in with GitHub first." },
      { status: 401 }
    );
  }

  const login = session.login as string;
  const token = session.accessToken as string;

  // Check if the user has starred the repo
  const res = await fetch(
    `https://api.github.com/user/starred/${REPO_OWNER}/${REPO_NAME}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (res.status === 204) {
    // Starred — grant Pro
    await setPro(login, true);
    await setStarPro(login, true);
    return NextResponse.json({ pro: true });
  }

  if (res.status === 404) {
    // Not starred
    return NextResponse.json({
      pro: false,
      starUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    });
  }

  // Unexpected error from GitHub API
  return NextResponse.json(
    { error: "Could not verify star status. Please try again." },
    { status: 500 }
  );
}
