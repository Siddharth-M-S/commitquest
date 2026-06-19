import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommitQuest — Your GitHub history as an RPG character",
  description:
    "Turn your GitHub commit history into a persistent RPG character. What class are you?",
  openGraph: {
    title: "CommitQuest",
    description: "Turn your GitHub history into an RPG character.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono antialiased">{children}</body>
    </html>
  );
}
