import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — CommitQuest",
  description: "Privacy policy for CommitQuest.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-purple-400">
            ← CommitQuest
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-2 text-base font-bold text-white">1. Information We Collect</h2>
            <p>When you use CommitQuest, we may collect:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>GitHub public data:</strong> username, display name, avatar, public contribution stats, language usage, stars, and repositories.</li>
              <li><strong>GitHub private data (Pro only):</strong> aggregate private contribution counts — we never read code, file names, or repo names.</li>
              <li><strong>Account data:</strong> GitHub login and OAuth token (stored securely in your session, never logged or shared).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">2. How We Use Your Information</h2>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>To generate and display your GitHub RPG character card.</li>
              <li>To verify your Pro status via GitHub star check.</li>
              <li>To cache your card stats for performance (public cards: 6 hours, Pro cards: 5 minutes).</li>
              <li>To display your entry on the public leaderboard.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">3. Data Storage</h2>
            <p>We store the following data in our Redis database:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>Your Pro status (a simple flag — your GitHub username mapped to a boolean).</li>
              <li>Your card customization preferences (title, tagline, theme, layout) — only if you save them.</li>
              <li>Cached GitHub stats (temporary, auto-expires).</li>
            </ul>
            <p className="mt-2">We do not store passwords, payment card details, or private repository content.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">4. Data Sharing</h2>
            <p>We do not sell, trade, or share your personal data with third parties except:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>GitHub:</strong> to fetch your contribution data via their API.</li>
              <li><strong>Upstash:</strong> our Redis provider, used to store Pro status and preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">5. Cookies &amp; Sessions</h2>
            <p>We use a secure, httpOnly session cookie (via NextAuth.js) to keep you signed in. No third-party tracking cookies are used. No advertising cookies are used.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">6. Your Rights</h2>
            <p>You may request deletion of your data at any time by contacting us. This includes your Pro status, saved preferences, and cached stats. Your public GitHub data is controlled by GitHub directly.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">7. Security</h2>
            <p>We use HTTPS, secure session handling, and server-side Pro verification to protect your data. OAuth tokens are never exposed to the client or logged.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. The latest version will always be available at this URL.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">9. Contact</h2>
            <p>For privacy-related questions, visit our <Link href="/faq" className="text-purple-400 hover:underline">FAQ page</Link> or contact us through GitHub.</p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-xs text-gray-600">
          <Link href="/terms" className="hover:text-purple-400">Terms &amp; Conditions</Link>
        </div>
      </div>
    </main>
  );
}
