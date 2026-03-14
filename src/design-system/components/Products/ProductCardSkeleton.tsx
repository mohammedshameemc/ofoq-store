import { Skeleton } from "../ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="group bg-white relative p-2 md:p-4 rounded max-w-[190px] md:min-w-[230px] max-h-[400px] md:h-[415px] lg:h-[400px]">
      {/* Image skeleton */}
      <div className="relative mx-auto w-full flex items-center justify-center mt-10 mb-4">
        <Skeleton className="w-full h-[170px] lg:h-[200px] md:max-w-48 bg-borderLight" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 py-1">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-borderLight" />
          <Skeleton className="h-4 w-3/4 bg-borderLight" />
        </div>

        {/* Price skeleton */}
        <div className="flex gap-2 items-center">
          <Skeleton className="h-6 w-20 bg-borderLight" />
          <Skeleton className="h-4 w-16 bg-borderLight" />
        </div>

        {/* Stock status skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-borderLight" />
          <Skeleton className="h-4 w-16 bg-borderLight" />
        </div>
      </div>
    </div>
  );
}
