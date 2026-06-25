import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — CommitQuest",
  description: "Terms and conditions for using CommitQuest.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-purple-400">
            ← CommitQuest
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-2 text-base font-bold text-white">1. Acceptance of Terms</h2>
            <p>By accessing or using CommitQuest ("the Service") at commitquest.netlify.app, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">2. Description of Service</h2>
            <p>CommitQuest is a web application that transforms your public GitHub contribution history into a visual RPG-style character card. A Pro tier is available that unlocks additional features including private repository stats, premium card frames, custom titles, and high-resolution downloads.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">3. User Accounts</h2>
            <p>You may use the Service without an account for public profiles. To access Pro features, you must sign in with your GitHub account. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">4. Pro Subscription</h2>
            <p>CommitQuest Pro is available as a one-time or annual payment processed securely through our payment provider. Pro features are activated upon successful payment confirmation. Pricing is displayed on the <Link href="/pricing" className="text-purple-400 hover:underline">pricing page</Link>.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">5. Acceptable Use</h2>
            <p>You agree not to misuse the Service, attempt to circumvent Pro feature restrictions, scrape or abuse the API, or use the Service for any unlawful purpose. We reserve the right to suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">6. Intellectual Property</h2>
            <p>CommitQuest and its original content, features, and functionality are owned by the developers and are protected by applicable intellectual property laws. GitHub data displayed belongs to respective GitHub users.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">7. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranty of any kind. We do not guarantee uninterrupted access, accuracy of GitHub data, or fitness for a particular purpose.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, CommitQuest shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">10. Contact</h2>
            <p>For questions about these terms, visit our <Link href="/faq" className="text-purple-400 hover:underline">FAQ page</Link> or contact us through GitHub.</p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-xs text-gray-600">
          <Link href="/privacy" className="hover:text-purple-400">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-purple-400">Refund Policy</Link>
        </div>
      </div>
    </main>
  );
}
