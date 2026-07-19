export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl glass">
            <div className="aspect-[4/5] bg-white/5" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-2/3 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
