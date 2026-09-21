import { Skeleton } from "@/components/ui/Skeleton";

/** Shimmer skeleton shown before the home page hydrates. */
export default function HomeLoading() {
  return (
    <div className="container-page py-16">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-7 w-48 rounded-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-14 w-40 rounded-full" />
            <Skeleton className="h-14 w-40 rounded-full" />
          </div>
        </div>
        <Skeleton className="aspect-[5/4] w-full rounded-[28px]" />
      </div>
      <div className="mt-24 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}
