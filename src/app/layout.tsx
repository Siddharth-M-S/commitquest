import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "CommitQuest — Your GitHub history as an RPG character",
  description:
    "Turn your GitHub commit history into a persistent RPG character. What class are you?",
  icons: {
    icon: "/icon.svg",
  },
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
      <body className="flex min-h-screen flex-col font-mono antialiased overflow-x-hidden">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
