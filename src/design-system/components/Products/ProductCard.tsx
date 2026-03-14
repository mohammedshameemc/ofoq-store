import { trans } from "@mongez/localization";
import { Link } from "@mongez/react-router";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { FaRegEye } from "react-icons/fa";

import { formatPrice } from "shared/lib/formats";
import { cn } from "shared/lib/utils";
import { translateText } from "shared/utils/translate-text";
import { Product } from "shared/utils/types";
import URLS from "shared/utils/urls";

type TProduct = {
  product: Product;
  grid?: number;
};

export default function ProductCard({ product, grid }: TProduct) {
  let discount = 0;
  if (product.price && product.salePrice) {
    discount = Math.round(
      ((product.price - product.salePrice) * 100) / product.price,
    );
  }

  return (
    <div
      className={cn(
        "group bg-white relative p-2 md:p-4 rounded max-w-[190px] md:min-w-[230px] max-h-[400px] md:h-[415px] lg:h-[400px] cursor-pointer overflow-hidden",
        grid === 4 && "w-[230px] md:min-w-[230px] 2xl:min-w-[269px]",
        grid === 3 && "w-[230px] md:min-w-[230px] 2xl:min-w-[359px]",
      )}>
      {discount > 0 && (
        <div className="absolute left-3 md:left-4 top-3 md:top-5 w-10 md:w-14 h-6 bg-[#dd3842] z-20 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{discount}%</span>
        </div>
      )}
      <div className="absolute right-3 md:right-5 top-3 md:top-5 z-20 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-all duration-500">
        <Link
          href={URLS.shop.viewProduct(product.id)}
          className="group/show size-9 flex items-center justify-center rounded-full shadow bg-white hover:bg-blue transition-all duration-300">
          <FaRegEye className="size-4 group-hover/show:text-white transition-all duration-300" />
          <p className="inline-block pointer-events-none absolute bg-primary text-white right-11 text-xs px-2 py-1 rounded-sm w-max opacity-0 group-hover/show:opacity-100 translate-x-2 group-hover/show:translate-x-0 transition-all duration-500 after:content-[''] after:-right-2 after:top-1/2 after:-translate-y-1/2 after:size-2 after:bg-primary after:absolute after:clip-triangle after:rotate-90">
            {trans("Quick View")}
          </p>
        </Link>
      </div>

      {/* Image Container */}
      <div className="relative mx-auto w-full flex items-center justify-center mt-10">
        <img
          className="w-full h-[170px] lg:h-[200px] md:max-w-48 z-10 aspect-square object-contain opacity-100 hover:opacity-0 transition-opacity duration-300 ease-out"
          src={product.images[0].url}
          alt=""
          loading="lazy"
        />
        <img
          className="absolute w-full h-[170px] lg:h-[200px] md:max-w-48 aspect-square object-contain"
          src={
            product.images[1] ? product.images[1].url : product.images[0].url
          }
          alt=""
          loading="lazy"
        />
      </div>

      {/* Content Container - slides up on hover */}
      <div className="bg-white z-20 relative translate-y-[50px] group-hover:-translate-y-6 lg:translate-y-6 lg:group-hover:-translate-y-16 transition-all duration-500 py-1 text-left">
        <Link
          to={URLS.shop.viewProduct(product.id)}
          className="line-clamp-2 h-10 mt-2 leading-5 font-semibold text-sm hover:text-blue transition-colors duration-200">
          {translateText(product.name)}
        </Link>

        {product.price && product.salePrice ? (
          <div className="flex gap-2 items-end">
            <span className="text-secondary font-semibold text-md">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-darkGray line-through text-sm">
              {formatPrice(product.price)}
            </span>
          </div>
        ) : (
          <span className="text-lg text-blue font-semibold">
            {formatPrice(product.price)}
          </span>
        )}

        <div className="flex items-center gap-2 mt-2">
          {product.inStock ? (
            <>
              <CheckIcon className="text-green size-5" />
              <p className="text-green text-sm">{trans("In Stock")}</p>
            </>
          ) : (
            <>
              <Cross1Icon className="text-red size-3" />
              <p className="text-red text-sm">{trans("Out Of Stock")}</p>
            </>
          )}
        </div>

        {/* View Product Button */}
        <Link href={URLS.shop.viewProduct(product.id)} className="block w-full mt-4">
          <button className="w-full h-8 md:h-10 rounded-full bg-blue text-white text-sm font-semibold hover:bg-blue/90 transition-colors duration-200">
            {trans("View Product")}
          </button>
        </Link>
      </div>
    </div>
  );
}
