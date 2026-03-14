import ProductCardSkeleton from "design-system/components/Products/ProductCardSkeleton";
import { Skeleton } from "design-system/components/ui/skeleton";

export default function HomePageSkeleton() {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-col items-start gap-5 w-full max-w-[1400px] mx-auto py-6 px-4">
        {/* Slider Row Skeleton - matches min-h-[385px] and grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full min-h-[385px]">
          {/* Main carousel skeleton */}
          <div className="md:col-span-2 h-full w-full">
            <Skeleton className="w-full h-full min-h-[385px] rounded-md bg-borderLight" />
          </div>

          {/* Side banners skeleton */}
          <div className="flex flex-col sm:flex-row md:items-center lg:flex-col gap-2 h-full justify-between w-full">
            <Skeleton className="max-h-[200px] lg:h-full w-full rounded-md bg-borderLight" />
            <Skeleton className="max-h-[200px] lg:h-full w-full rounded-md bg-borderLight" />
          </div>
        </div>

        {/* Categories Row Skeleton - matches py-5 and actual category card dimensions */}
        <div className="w-full overflow-x-auto py-5">
          <div className="flex items-center justify-start gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="min-w-[150px] flex flex-col items-center gap-3">
                {/* Category image - 100x100 circle */}
                <Skeleton className="w-[100px] h-[100px] rounded-full bg-borderLight" />
                {/* Category name */}
                <Skeleton className="h-4 w-24 bg-borderLight" />
                {/* Product count */}
                <Skeleton className="h-3 w-16 bg-borderLight" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section with Gray Background */}
      <div className="my-5 bg-lightGray w-full py-10">
        <div className="flex flex-col items-start gap-14 max-w-[1400px] mx-auto py-6 px-4">
          {/* Deals Row Skeleton */}
          <div className="w-full">
            <Skeleton className="h-8 w-48 mb-4 bg-borderLight" />
            <div className="flex flex-col md:flex-row items-start gap-4 w-full">
              {/* Banner skeleton */}
              <Skeleton className="w-full md:w-[33%] h-[300px] md:h-[400px] rounded-lg bg-borderLight" />

              {/* Products carousel skeleton */}
              <div className="w-full md:w-[67%]">
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Row Skeleton */}
          <div className="w-full">
            <Skeleton className="h-8 w-48 mb-4 bg-borderLight" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>

          {/* Middle Banner Row Skeleton */}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="w-full h-[250px] rounded-lg bg-borderLight" />
              <Skeleton className="w-full h-[250px] rounded-lg bg-borderLight" />
            </div>
          </div>

          {/* Recommended Row Skeleton */}
          <div className="w-full">
            <Skeleton className="h-8 w-48 mb-4 bg-borderLight" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
