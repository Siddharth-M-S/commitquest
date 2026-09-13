import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — CommitQuest",
  description:
    "CommitQuest Pro is 100% free — star the GitHub repo to unlock private stats, premium frames, and more.",
  openGraph: {
    title: "CommitQuest Pro — Free Forever",
    description: "Unlock premium frames, private stats, and compare mode. No credit card, ever.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}