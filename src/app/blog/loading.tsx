import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <Skeleton className="h-9 sm:h-10 w-32 mb-4" />
      <Skeleton className="h-5 w-full max-w-2xl mb-12" />

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
