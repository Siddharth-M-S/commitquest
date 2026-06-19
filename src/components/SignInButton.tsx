"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/account" })}
      className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200"
    >
      Sign in with GitHub
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-gray-700 px-5 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-500 hover:text-red-300"
    >
      ⎋ Sign out
    </button>
  );
}
