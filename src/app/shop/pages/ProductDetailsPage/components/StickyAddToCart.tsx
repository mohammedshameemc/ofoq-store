import { trans } from "@mongez/localization";
import { Button } from "design-system/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { formatPrice } from "shared/lib/formats";
import { translateText } from "shared/utils/translate-text";
import { Product } from "shared/utils/types";
import URLS from "shared/utils/urls";

interface StickyAddToCartProps {
  product: Product;
}

export default function StickyAddToCart({ product }: StickyAddToCartProps) {
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const productUrl = `${window.location.origin}${URLS.shop.viewProduct(product.id)}`;

  const handleWhatsAppEnquiry = () => {
    const message = `Hi, I'm interested in this product:\n\n${translateText(product.name)}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 p-4 w-full border border-t-slate-200">
      <div className="flex justify-between items-center w-full max-w-[1440px] mx-auto">
        <div className="flex items-start gap-3">
          <img
            loading="lazy"
            src={product.images[0].url}
            alt={""}
            className="w-16 h-16 object-cover border border-borderLight rounded-md p-1 shadow-sm"
          />
          <div className="flex flex-col items-start gap-1 w-full max-w-[350px]">
            <h1 className="text-primary font-bold text-sm line-clamp-2">
              {translateText(product.name)}
            </h1>
            {product.price && product.salePrice ? (
              <div className="flex gap-3 items-end">
                <span className="text-blue font-semibold text-md">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-darkGray line-through text-dm ">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-md text-blue font-semibold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
        <div className="w-full max-w-[500px]">
          <Button
            variant="default"
            className="w-full rounded-lg h-14 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] transition-all duration-300 shadow-lg hover:shadow-xl gap-3 border-0"
            size="lg"
            onClick={handleWhatsAppEnquiry}>
            <FaWhatsapp className="w-6 h-6" />
            <span>{trans("Enquire on WhatsApp")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
