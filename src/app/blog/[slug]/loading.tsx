import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <Skeleton className="h-4 w-32 mb-8" />
      <Skeleton className="h-9 sm:h-12 w-full mb-2" />
      <Skeleton className="h-9 sm:h-12 w-4/5 mb-6" />

      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-1.5 mb-10">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      <div className="space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className={`h-4 ${i % 2 === 0 ? "w-2/3" : "w-5/6"}`} />
          </div>
        ))}
      </div>
    </article>
  );
}
