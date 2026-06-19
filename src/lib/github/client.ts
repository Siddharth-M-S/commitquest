import { GraphQLClient } from "graphql-request";
import { ensureProxy } from "@/lib/proxy";

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

// Creates a GraphQL client authenticated with the given token.
// For signed-in users pass their OAuth token; for public profile
// lookups pass the server's GITHUB_PUBLIC_TOKEN.
export function githubClient(token: string): GraphQLClient {
  ensureProxy();
  return new GraphQLClient(GITHUB_GRAPHQL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export function publicToken(): string {
  const t = process.env.GITHUB_PUBLIC_TOKEN;
  if (!t) {
    throw new Error(
      "GITHUB_PUBLIC_TOKEN is not set — required for public profile lookups."
    );
  }
  return t;
}
