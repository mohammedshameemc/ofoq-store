import { FaWhatsapp } from "react-icons/fa";
import { Button } from "../ui/button";

interface WhatsAppShareButtonProps {
  productName: string;
  productUrl: string;
  phoneNumber?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function WhatsAppShareButton({
  productName,
  productUrl,
  phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919562321211",
  className = "",
  variant = "default",
  size = "default",
}: WhatsAppShareButtonProps) {
  const handleWhatsAppShare = () => {
    const message = `Check out this product:\n\n${productName}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleWhatsAppShare}>
      <FaWhatsapp className="w-5 h-5" />
      Enquire on WhatsApp
    </Button>
  );
}
