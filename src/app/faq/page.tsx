import Link from "next/link";

export const metadata = {
  title: "FAQ — CommitQuest",
  description:
    "Everything about CommitQuest: how cards work, what counts, privacy, and Pro.",
};

interface QA {
  q: string;
  a: React.ReactNode;
}

interface Section {
  title: string;
  items: QA[];
}

const SECTIONS: Section[] = [
  {
    title: "🎮 The basics",
    items: [
      {
        q: "What is CommitQuest?",
        a: (
          <>
            CommitQuest turns your real GitHub history into a Pokémon-style RPG
            character card. Your commits, pull requests, reviews, stars and
            streaks become XP, a level, a character class, and unlockable
            achievements. The idea: make your dev work feel like a game and give
            you a card worth sharing.
          </>
        ),
      },
      {
        q: "How do I make my card?",
        a: (
          <>
            Just type any GitHub username on the{" "}
            <Link href="/" className="text-purple-400 hover:underline">
              home page
            </Link>{" "}
            and hit Reveal. No login needed to view a card — yours or anyone
            else&apos;s.
          </>
        ),
      },
      {
        q: "Do I need to sign in?",
        a: (
          <>
            No — viewing, downloading and sharing public cards works without an
            account. You only sign in (with GitHub) if you want to{" "}
            <strong>go Pro</strong>, customize your own card, or have your{" "}
            <strong>private</strong> contributions counted.
          </>
        ),
      },
      {
        q: "Is it free?",
        a: (
          <>
            Yes. The full card, all-time public stats, the glossy image and
            sharing are free forever. Pro ($4/mo) adds private stats, premium
            looks and power features — see{" "}
            <Link href="/pricing" className="text-purple-400 hover:underline">
              pricing
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    title: "📊 How the stats & RPG system work",
    items: [
      {
        q: "How is my level and XP calculated?",
        a: (
          <>
            XP is earned from your activity, weighted so quality counts more than
            raw volume: pull requests and reviews are worth more than individual
            commits, and long streaks give bonuses. Level uses a rising curve
            (it gets harder each level), and Level 50 earns the legendary
            &quot;10x Mythic&quot; title. To keep things fair, repo count is
            capped so spinning up empty repos won&apos;t inflate your score.
          </>
        ),
      },
      {
        q: "How is my character class decided?",
        a: (
          <>
            Your class comes from the language you&apos;ve written the most code
            in. For example: TypeScript → Ranger, Python → Wizard, JavaScript →
            Rogue, Rust → Paladin, Go → Monk. Your top language also sets your
            card&apos;s color theme. No clear main language? You become a
            Wanderer.
          </>
        ),
      },
      {
        q: "What are rarity tiers (Common, Rare, Mythic…)?",
        a: (
          <>
            Rarity is based on your level: Common (1–9), Rare (10+), Epic (20+),
            Legendary (30+), and Mythic (50+). Higher tiers get flashier badges.
          </>
        ),
      },
      {
        q: "What does \u201cPRs\u201d on the card mean exactly?",
        a: (
          <>
            It&apos;s your pull-request <em>contributions</em> as GitHub counts
            them across your contribution history — a measure of activity, not a
            lifetime count of every merged PR.
          </>
        ),
      },
      {
        q: "How are stars counted?",
        a: (
          <>
            Stars are summed across the repos you <strong>own</strong> (forks
            excluded). Stars on other people&apos;s repos you contributed to
            don&apos;t count toward your total.
          </>
        ),
      },
      {
        q: "Why are some achievements always locked?",
        a: (
          <>
            A couple of time-of-day achievements (like Night Owl / Early Bird)
            depend on the exact hour of each commit, which GitHub&apos;s public
            contribution data doesn&apos;t expose. Rather than guess, we leave
            them locked. Everything else — streaks, polyglot, PR machine, OSS
            hero, etc. — unlocks from real data.
          </>
        ),
      },
    ],
  },
  {
    title: "🔄 Freshness & accuracy",
    items: [
      {
        q: "How often does my card update?",
        a: (
          <>
            Cards are cached so one fetch can serve many viewers. Free cards
            refresh roughly every <strong>6 hours</strong>; Pro cards refresh
            about every <strong>5 minutes</strong> (&quot;priority refresh&quot;),
            so your latest commits show up far sooner.
          </>
        ),
      },
      {
        q: "I just committed — why doesn't it show yet?",
        a: (
          <>
            GitHub&apos;s own stats can take a little time to settle, and your
            card is cached (6h free / 5min Pro). Give it a few minutes; Pro
            updates the fastest.
          </>
        ),
      },
      {
        q: "My numbers look lower than I expected. Why?",
        a: (
          <>
            By default only <strong>public</strong> activity is counted. If a lot
            of your work is in private repos, go Pro and view your own profile
            while signed in — your private contributions then count too (see the
            privacy section below).
          </>
        ),
      },
    ],
  },
  {
    title: "👑 Pro — what you get & why",
    items: [
      {
        q: "What does Pro actually add?",
        a: (
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong>Private repo contributions</strong> counted toward your
              stats, XP and level.
            </li>
            <li>
              <strong>Clean, watermark-free card</strong> (the free card has a
              small CommitQuest mark).
            </li>
            <li>
              <strong>High-resolution 2× downloads</strong> — crisp for slides,
              READMEs and posts.
            </li>
            <li>
              <strong>Premium frames</strong>: holo, gold, obsidian, rose.
            </li>
            <li>
              <strong>Custom title &amp; tagline</strong> (e.g. &quot;Rust
              God&quot;).
            </li>
            <li>
              <strong>Multiple layouts</strong>: detailed, compact, minimal.
            </li>
            <li>
              <strong>Auto-updating README badge</strong> (SVG) for your repos.
            </li>
            <li>
              <strong>Compare</strong> two developers head-to-head.
            </li>
            <li>
              <strong>Leaderboard flair</strong> — a 👑 PRO highlight on the
              board.
            </li>
          </ul>
        ),
      },
      {
        q: "Why is it worth $4/month?",
        a: (
          <>
            Pro isn&apos;t just cosmetic. Private-repo counting can dramatically
            change your real numbers if you work in private; the 2× clean
            download and badge make your card genuinely useful in READMEs,
            portfolios and talks; and Compare + faster refresh are real tools,
            not stickers. If you only want a fun public card, Free is plenty.
          </>
        ),
      },
      {
        q: "Can I unlock Pro features with a URL trick?",
        a: (
          <>
            No. Pro is verified on our server for every render. Adding things
            like <code>?theme=gold</code> or <code>?scale=2</code> to a URL does
            nothing unless your account is actually Pro — so nobody can fake a
            Pro card.
          </>
        ),
      },
      {
        q: "Does going Pro change my ranking on the leaderboard?",
        a: (
          <>
            No. Ranking is pure XP — Pro never buys you a higher spot. Pro only
            adds a visual 👑 highlight to your row. (Private contributions can
            raise your XP, but that&apos;s real activity, not a pay-to-win
            boost.)
          </>
        ),
      },
    ],
  },
  {
    title: "🔒 Privacy & your private repos",
    items: [
      {
        q: "If I go Pro, do you read my private code?",
        a: (
          <>
            No. We never read, store or display your private source code, file
            contents, or repo names. We only count <strong>aggregate
            numbers</strong> — like how many private contributions you made — to
            add to your totals. Private repo names are explicitly excluded from
            the card.
          </>
        ),
      },
      {
        q: "Why does GitHub ask for broad repo permission then?",
        a: (
          <>
            GitHub&apos;s contribution API only reveals your private
            contribution counts when you authorize with your own token. That
            consent screen looks broad, but CommitQuest only ever uses it to read
            your <em>own</em> aggregate stats when <em>you</em> are signed in —
            never anyone else&apos;s, and never the contents.
          </>
        ),
      },
      {
        q: "How do my private stats end up on my shareable card?",
        a: (
          <>
            When <strong>you</strong> open your own profile while signed in, we
            compute your full (private-included) totals and cache them briefly.
            For the next few minutes, anyone viewing your card sees those
            aggregate numbers — without ever touching your private data
            themselves. Pop back to your profile any time to refresh it.
          </>
        ),
      },
      {
        q: "Can other people see my private numbers if I don't want them to?",
        a: (
          <>
            Private contributions are only included after <em>you</em> opt in by
            viewing your own signed-in Pro profile. If you never do that, your
            public card stays public-only. Either way, only totals — never names
            or code — are ever shown.
          </>
        ),
      },
    ],
  },
  {
    title: "🏆 Leaderboard & ⚔ Compare",
    items: [
      {
        q: "How do I get on the leaderboard?",
        a: (
          <>
            Automatically — your entry is recorded whenever your profile is
            viewed. The board ranks the top players by total XP. Open the{" "}
            <Link
              href="/leaderboard"
              className="text-purple-400 hover:underline"
            >
              leaderboard
            </Link>{" "}
            to see where you stand.
          </>
        ),
      },
      {
        q: "What is Compare?",
        a: (
          <>
            Compare puts two developers side-by-side and scores them across 9
            stats (level, XP, commits, PRs, reviews, stars, streak, repos,
            followers), then declares a winner. It&apos;s a Pro feature — see{" "}
            <Link href="/compare" className="text-purple-400 hover:underline">
              Compare
            </Link>
            .
          </>
        ),
      },
      {
        q: "Whose Pro status matters for Compare — mine or my friend's?",
        a: (
          <>
            Yours. As long as <strong>you</strong> (the viewer) are Pro, you can
            compare any two public profiles — your friend doesn&apos;t need to be
            Pro.
          </>
        ),
      },
    ],
  },
  {
    title: "💳 Billing & account",
    items: [
      {
        q: "How much is Pro and how am I billed?",
        a: (
          <>
            Pro is $4/month, billed securely through Stripe as a subscription.
            Your Pro status switches on the moment checkout completes.
          </>
        ),
      },
      {
        q: "Can I cancel anytime?",
        a: (
          <>
            Yes. Cancel through Stripe and your Pro features turn off at the end
            of the billing period — no lock-in. Your card and public stats stay
            available on the free tier.
          </>
        ),
      },
      {
        q: "What happens to my card if I cancel?",
        a: (
          <>
            Nothing disappears — you simply return to the free experience: public
            stats, the glossy card, and sharing. Premium frames, private
            counting, the badge and Compare turn off.
          </>
        ),
      },
      {
        q: "I paid but I'm not showing as Pro — what do I do?",
        a: (
          <>
            Pro activates via Stripe&apos;s confirmation, which is usually
            instant. If it hasn&apos;t flipped within a minute, refresh your
            profile (signed in). Still stuck? Reach out and we&apos;ll sort it.
          </>
        ),
      },
    ],
  },
  {
    title: "🛠 Embeds & sharing",
    items: [
      {
        q: "How do I share my card?",
        a: (
          <>
            On your profile, use Download (PNG), Copy link, or Share (X,
            LinkedIn, Facebook, Reddit, WhatsApp, or your device&apos;s native
            share). Pasting your profile link anywhere also shows a rich card
            preview.
          </>
        ),
      },
      {
        q: "How do I add the badge to my README? (Pro)",
        a: (
          <>
            Embed your badge image URL in your README markdown:
            <code className="mt-2 block rounded bg-gray-950 px-3 py-2 text-xs text-gray-300">
              ![CommitQuest](https://YOUR-DOMAIN/api/badge/your-username)
            </code>
            It updates automatically as your stats change. Free users get a small
            &quot;upgrade to embed&quot; placeholder instead.
          </>
        ),
      },
      {
        q: "Why is my downloaded image so sharp on Pro?",
        a: (
          <>
            Pro renders at 2× resolution (great for retina screens, slides and
            print), with no watermark. Free downloads are standard resolution
            with a small mark.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-purple-400"
          >
            ← CommitQuest
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ✦ Go Pro →
          </Link>
        </div>

        <h1 className="text-center text-4xl font-black tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-center text-gray-400">
          Everything about how CommitQuest works, what counts, your privacy, and
          Pro.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-lg font-bold text-purple-300">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-3 transition hover:border-gray-700"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-100">
                      <span>{item.q}</span>
                      <span className="shrink-0 text-gray-500 transition group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <div className="mt-3 text-sm leading-relaxed text-gray-300">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-purple-800/50 bg-purple-900/10 p-6 text-center">
          <p className="text-lg font-bold text-purple-200">
            Still curious? Reveal your card.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            See your dev character in seconds — no signup needed.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500"
          >
            Reveal my card →
          </Link>
        </div>
      </div>
    </main>
  );
}
