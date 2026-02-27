import { Column } from "shared/utils/types";
import { CarouselProducts } from "./CarouselProducts";

interface DealsRowProps {
  column: Column[];
}

export default function DealsRow({ column }: DealsRowProps) {
  return (
    <div className="flex flex-col items-start gap-y-1 w-full">
      <div className="flex flex-col md:flex-row items-start gap-y-2 w-full">
        <div
          // src={column[0].module.banner?.image[0].value.url}
          className="w-full md:w-[33%] md:h-[400px] object-cover  bg-[#2b38d1]"
        >
        </div>
        <div className="w-full md:w-[67%]">
          <CarouselProducts products={column[1].module.products!} />
        </div>
      </div>
    </div>
  );
}
