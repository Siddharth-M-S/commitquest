export function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-gray-600 border-t-purple-400 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Full-screen centered loader for route-level loading states.
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <Spinner size={40} />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
