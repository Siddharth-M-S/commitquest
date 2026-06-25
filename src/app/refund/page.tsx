import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy — CommitQuest",
  description: "Refund and cancellation policy for CommitQuest Pro.",
};

export default function RefundPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-purple-400">
            ← CommitQuest
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight">Refund &amp; Cancellation Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-2 text-base font-bold text-white">1. Digital Product</h2>
            <p>CommitQuest Pro is a digital service. Upon successful payment, Pro features are activated immediately on your account. Because the service is delivered digitally and instantly, all sales are generally considered final.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">2. Refund Eligibility</h2>
            <p>We offer refunds in the following cases:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>You were charged but Pro features were not activated within 24 hours.</li>
              <li>You were charged more than once for the same purchase (duplicate charge).</li>
              <li>Technical issues on our end prevented you from accessing the Service entirely.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">3. Non-Refundable Cases</h2>
            <p>Refunds will not be issued in the following cases:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>You changed your mind after purchase.</li>
              <li>You did not use the Pro features after activation.</li>
              <li>Your GitHub account was suspended or deleted.</li>
              <li>You violated our Terms and Conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">4. How to Request a Refund</h2>
            <p>To request a refund, contact us through our <Link href="/faq" className="text-purple-400 hover:underline">FAQ page</Link> or via GitHub within 7 days of your purchase. Please provide your GitHub username and payment details. We will review and respond within 3 business days.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">5. Cancellation</h2>
            <p>For annual subscriptions, you may cancel at any time. Pro features will remain active until the end of the current billing period. No partial refunds are issued for unused time in the current period.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">6. Processing Time</h2>
            <p>Approved refunds are processed within 5–7 business days and will be credited to your original payment method.</p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-xs text-gray-600">
          <Link href="/terms" className="hover:text-purple-400">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="hover:text-purple-400">Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}
