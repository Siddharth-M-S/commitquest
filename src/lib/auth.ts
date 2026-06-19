import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        // `repo` lets a Pro user's own token read their PRIVATE repos so
        // private contributions can count toward their card. Only the owner's
        // token is ever used this way; we never expose private repo names.
        params: { scope: "read:user repo" },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the GitHub access token + login on first sign-in.
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        // GitHub profile exposes `login`.
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.login = token.login as string | undefined;
      return session;
    },
  },
};
