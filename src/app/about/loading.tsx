import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <Skeleton className="h-9 sm:h-10 w-52 mb-4" />
      <Skeleton className="h-5 w-full max-w-2xl mb-2" />
      <Skeleton className="h-5 w-3/4 max-w-2xl mb-12" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border">
            <Skeleton className="h-5 w-5 mb-2" />
            <Skeleton className="h-3 w-16 mb-1.5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      <Skeleton className="h-8 w-40 mb-6" />
      <div className="space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative pl-8 pb-8 border-l border-border">
            <Skeleton className="h-3 w-3 rounded-full absolute left-0 top-0 -translate-x-1/2" />
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-5 w-44 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>

      <Skeleton className="h-8 w-28 mt-16 mb-6" />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
    </div>
  );
}
