import { trans } from "@mongez/localization";
import { Button } from "design-system/components/ui/button";
import { Separator } from "design-system/components/ui/separator";
import { FaWhatsapp } from "react-icons/fa";
// import { FaRecycle } from "react-icons/fa";
// import { LuShip } from "react-icons/lu";
import { FiLayers } from "react-icons/fi";
import { formatPrice } from "shared/lib/formats";

import { Link } from "@mongez/react-router";
import ShareModal from "design-system/components/Share/ShareModal";
import { useState } from "react";
import { IoShareSocialOutline } from "react-icons/io5";
import { useProductActions } from "shared/hooks/use-product-actions";
import { translateText } from "shared/utils/translate-text";
import { Product } from "shared/utils/types";
import URLS from "shared/utils/urls";

interface DisplayProductDataProps {
  product: Product;
}

export default function DisplayProductData({
  product,
}: DisplayProductDataProps) {
  const { addToCompare } = useProductActions(product);
  // const { addToCompare, estimatedDelivery } = useProductActions(product);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const productUrl = `${window.location.origin}${URLS.shop.viewProduct(product.id)}`;
  const phoneNumber = "919562321211";

  const handleWhatsAppEnquiry = () => {
    const message = `Hi, I'm interested in this product:\n\n${translateText(product.name)}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Calculate discount if both price and salePrice exist
  const calculateDiscount = () => {
    if (
      product.price &&
      product.salePrice &&
      product.price > product.salePrice
    ) {
      const discountAmount = product.price - product.salePrice;
      const discountPercentage = Math.round(
        (discountAmount / product.price) * 100,
      );
      return {
        amount: discountAmount,
        percentage: discountPercentage,
      };
    }
    return null;
  };

  const discount =
    product.discount?.amount && product.discount?.percentage
      ? product.discount
      : calculateDiscount();

  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex items-start gap-3 flex-wrap">
        <h1 className="text-primary text-lg lg:text-[24px] font-medium">
          {translateText(product.name)}
        </h1>
        {product.badge && translateText(product.badge) && (
          <span className="bg-red text-white text-xs font-semibold px-3 py-1 rounded-full">
            {translateText(product.badge)}
          </span>
        )}
      </div>
      <Separator />
      <div className="flex flex-col items-start gap-3 w-full">
        {product.price && product.salePrice ? (
          <div className="flex gap-3 items-end">
            <span className="text-blue font-semibold text-[26px]">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-darkGray line-through text-[18px] ">
              {formatPrice(product.price)}
            </span>
          </div>
        ) : (
          <span className="text-lg text-blue font-semibold">
            {formatPrice(product.price)}
          </span>
        )}
        {discount && discount.amount > 0 && discount.percentage > 0 && (
          <p className="text-red text-sm font-semibold">
            {trans("Discount")}: {formatPrice(discount.amount)} (
            {discount.percentage}%)
          </p>
        )}
        {translateText(product.shortDescription) && (
          <p className="text-gray text-base">
            {translateText(product.shortDescription)}
          </p>
        )}

        <div className="flex items-start flex-col gap-3 w-full mt-2">
          <Button
            variant={"default"}
            className="w-full rounded-lg h-14 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] transition-all duration-300 shadow-lg hover:shadow-xl gap-3 border-0"
            size={"lg"}
            onClick={handleWhatsAppEnquiry}>
            <FaWhatsapp className="w-6 h-6" />
            <span>{trans("Enquire on WhatsApp")}</span>
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full mt-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-lg border-2 border-gray-300 hover:border-blue hover:bg-blue/5 transition-all duration-300 gap-2 font-semibold"
            onClick={addToCompare}>
            <FiLayers className="w-5 h-5" />
            <span className="text-sm">{trans("Add to Compare")}</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-lg border-2 border-gray-300 hover:border-blue hover:bg-blue/5 transition-all duration-300 gap-2 font-semibold"
            onClick={() => setIsShareModalOpen(true)}>
            <IoShareSocialOutline className="w-5 h-5" />
            <span className="text-sm">{trans("Share")}</span>
          </Button>
        </div>
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productName={translateText(product.name)}
        productUrl={productUrl}
        phoneNumber={phoneNumber}
      />
      {/* <Separator />
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 text-gray">
          <LuShip className="w-5 h-5" />
          <p className="text-sm font-semibold text-gray">{estimatedDelivery}</p>
        </div>
        <div className="flex items-center gap-2 text-gray">
          <FaRecycle className="w-5 h-5" />
          <p className="text-sm font-semibold text-gray">{trans("tax_rule")}</p>
        </div>
      </div> */}
      <Separator />
      <div className="flex items-start flex-col gap-2 w-full md:w-[280px]">
        <div className="flex items-center justify-between w-full text-sm text-gray font-medium ">
          <h1>{trans("Availability")}:</h1>
          {product.inStock ? (
            <div className="flex items-center gap-2">
              <p className="text-emerald-600">{trans("In Stock")}</p>
              {product.stock?.available && (
                <span className="text-xs text-gray">
                  ({product.stock.available} {trans("available")})
                </span>
              )}
            </div>
          ) : (
            <p className="text-red">{trans("Out Of Stock")}</p>
          )}
        </div>
        {product.isLowStock && product.inStock && (
          <div className="w-full">
            <p className="text-orange-500 text-xs font-semibold">
              ⚠ {trans("Low Stock - Order Soon!")}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between w-full text-sm text-gray font-medium">
          <h1>{trans("Category")}:</h1>
          <Link
            href={`${URLS.shop.products}?category=${product.category.id}`}
            className="text-primary hover:text-blue">
            {translateText(product.category.name)}
          </Link>
        </div>
        {product.type && (
          <div className="flex items-center justify-between w-full text-sm text-gray font-medium">
            <h1>{trans("Type")}:</h1>
            <p className="text-gray">{product.type}</p>
          </div>
        )}
      </div>
      {product.specifications && product.specifications.length > 0 && (
        <>
          <Separator />
          <div className="flex items-start flex-col gap-2 w-full">
            <h2 className="text-primary text-base font-semibold mb-2">
              {trans("Specifications")}
            </h2>
            <div className="w-full space-y-2">
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between w-full text-sm text-gray font-medium">
                  <h1>{spec.label}:</h1>
                  <p className="text-primary font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
