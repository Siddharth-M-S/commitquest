export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto mb-3 max-w-5xl">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-800" />
      </div>

      {/* Card skeleton */}
      <div className="mx-auto max-w-5xl rounded-3xl border border-gray-800 bg-gray-900/40 p-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-24 animate-pulse rounded-full bg-gray-800" />
          <div className="h-9 w-16 animate-pulse rounded bg-gray-800" />
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-2xl bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-800" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-gray-800" />
          </div>
        </div>

        <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-gray-800" />

        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-gray-800"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-800" />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Summoning this character from GitHub…
      </p>
    </main>
  );
}
