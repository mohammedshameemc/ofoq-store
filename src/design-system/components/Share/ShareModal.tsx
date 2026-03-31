import { trans } from "@mongez/localization";
import { useState } from "react";
import {
  FaCheck,
  FaCopy,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productUrl: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  productName,
  productUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleWhatsAppShare = () => {
    const message = `Check out this ${productName} on Ofoq trading ${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(`Check out this ${productName} on Ofoq trading`)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleInstagramShare = () => {
    const message = `Check out this ${productName} on Ofoq trading ${productUrl}`;
    navigator.clipboard.writeText(message);
    alert(
      trans(
        "Product details copied! Open Instagram app and paste in your story or post.",
      ),
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IoShareSocialOutline className="w-5 h-5" />
            {trans("Share Product")}
          </DialogTitle>
          <DialogDescription>
            {trans("Share this product with others")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button
            variant="default"
            className="w-full gap-3 h-12 text-base font-semibold bg-[#25D366] hover:bg-[#128C7E] transition-all duration-300 shadow-md hover:shadow-lg rounded-lg border-0"
            onClick={handleWhatsAppShare}>
            <FaWhatsapp className="w-5 h-5" />
            {trans("Share on WhatsApp")}
          </Button>

          <Button
            variant="default"
            className="w-full gap-3 h-12 text-base font-semibold bg-[#1877F2] hover:bg-[#145dbf] transition-all duration-300 shadow-md hover:shadow-lg rounded-lg border-0"
            onClick={handleFacebookShare}>
            <FaFacebook className="w-5 h-5" />
            {trans("Share on Facebook")}
          </Button>

          <Button
            variant="default"
            className="w-full gap-3 h-12 text-base font-semibold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg rounded-lg border-0"
            onClick={handleInstagramShare}>
            <FaInstagram className="w-5 h-5" />
            {trans("Share on Instagram")}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                {trans("Or copy link")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={productUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0">
              {copied ? (
                <FaCheck className="w-4 h-4 text-green-600" />
              ) : (
                <FaCopy className="w-4 h-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 text-center">
              {trans("Link copied to clipboard!")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
