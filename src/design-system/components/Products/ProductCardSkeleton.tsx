import { cn } from "shared/lib/utils";

type ProductCardSkeletonProps = {
  grid?: number;
};

export default function ProductCardSkeleton({ grid }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white relative p-2 md:p-4 rounded max-w-[190px] md:min-w-[230px] max-h-[400px] md:h-[415px] lg:h-[400px] overflow-hidden",
        grid === 4 && "w-[230px] md:min-w-[230px] 2xl:min-w-[269px]",
        grid === 3 && "w-[230px] md:min-w-[230px] 2xl:min-w-[359px]",
      )}>
      {/* Image skeleton */}
      <div className="relative mx-auto w-full flex items-center justify-center mt-10">
        <div className="w-full h-[170px] lg:h-[200px] md:max-w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="mt-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-10 bg-gray-200 rounded-full animate-pulse w-full mt-4" />
      </div>
    </div>
  );
}
