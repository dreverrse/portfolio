import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-24">
      <Skeleton className="h-4 w-36 mb-6" />
      <Skeleton className="h-10 sm:h-16 w-3/4 mb-3" />
      <Skeleton className="h-10 sm:h-16 w-1/2 mb-6" />
      <Skeleton className="h-4 w-full max-w-xl mb-2" />
      <Skeleton className="h-4 w-2/3 max-w-xl mb-10" />

      <div className="flex flex-col sm:flex-row gap-4 mb-24">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-36" />
      </div>

      <Skeleton className="h-8 w-32 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border">
            <Skeleton className="h-8 w-8 mb-4" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>

      <div className="p-8 rounded-2xl border border-border">
        <Skeleton className="h-7 w-56 mx-auto mb-4" />
        <Skeleton className="h-4 w-72 max-w-full mx-auto mb-8" />
        <Skeleton className="h-12 w-40 mx-auto" />
      </div>
    </div>
  );
}
