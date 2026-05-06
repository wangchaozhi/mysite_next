export default function Loading() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="h-11 w-32 animate-pulse rounded-full bg-white/60" />
      <article className="hero-card overflow-hidden rounded-[2rem]">
        <div className="space-y-5 border-b border-white/60 px-6 py-8 sm:px-10 sm:py-12">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[rgba(83,72,56,0.14)]" />
          <div className="h-10 w-4/5 animate-pulse rounded-full bg-[rgba(83,72,56,0.12)]" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-[rgba(83,72,56,0.1)]" />
        </div>
        <div className="space-y-4 px-6 py-8 sm:px-10 sm:py-10">
          <div className="h-4 animate-pulse rounded-full bg-[rgba(83,72,56,0.1)]" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-[rgba(83,72,56,0.1)]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-[rgba(83,72,56,0.1)]" />
        </div>
      </article>
    </main>
  );
}
