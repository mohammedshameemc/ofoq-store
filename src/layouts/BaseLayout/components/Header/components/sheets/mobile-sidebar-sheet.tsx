import { trans } from "@mongez/localization";
import { Link } from "@mongez/react-router";

import { modalAtom } from "design-system/atoms/model-atom";
import { DialogHeader, DialogTitle } from "design-system/components/ui/dialog";
import { Input } from "design-system/components/ui/input";
import { Separator } from "design-system/components/ui/separator";
import { Sheet, SheetContent } from "design-system/components/ui/sheet";
import { isLTR } from "shared/utils/helpers";
import URLS from "shared/utils/urls";
import LanguageConverter from "../converters/language-converter";

export default function MobileSidebarSheet() {
  const data = modalAtom.useValue();

  const isModalOpen = data.isOpen && data.type === "mobileSidebar";
  if (!isModalOpen) {
    return null;
  }

  const handleClose = () => {
    modalAtom.onClose();
  };

  const handleOpenModel = () => {
    modalAtom.onOpen("search");
  };

  return (
    <Sheet open={isModalOpen} onOpenChange={handleClose}>
      <SheetContent
        className="w-full lg:max-w-sm"
        side={isLTR() ? "left" : "right"}>
        <DialogHeader>
          <DialogTitle asChild></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start gap-4 my-5">
          <div className="flex flex-col items-center gap-4 justify-center w-full">
            <h1 className="font-semibold text-primary text-lg text-center">
              {trans("searchModelTitle")}
            </h1>
            <div className="relative w-full" onClick={handleOpenModel}>
              <Input
                placeholder={trans("searchInputModelPlaceHolder")}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex items-start flex-col gap-3 w-full py-5">
            <div className="flex items-center gap-1" onClick={handleClose}>
              <Link
                href={URLS.home}
                className="text-[14px] font-semibold text-primary">
                {trans("home")}
              </Link>
            </div>
            <Separator className="my-1" />
            <div className="flex items-center gap-1" onClick={handleClose}>
              <Link
                href={`${URLS.shop.products}?page=1`}
                className="text-[14px] font-semibold text-primary">
                {trans("shop")}
              </Link>
            </div>
            <Separator className="my-1" />
            <div className="flex items-center gap-1" onClick={handleClose}>
              <Link
                href={URLS.blog.root}
                className="text-[14px] font-semibold text-primary">
                {trans("blog")}
              </Link>
            </div>
            <Separator className="my-1" />
            <div className="flex items-center gap-1" onClick={handleClose}>
              <Link
                href={URLS.contactUs}
                className="text-[14px] font-semibold text-primary">
                {trans("contact")}
              </Link>
            </div>
            <Separator />
            <div className="flex items-center gap-1 justify-between w-full flex-wrap">
              <LanguageConverter />
            </div>
            <Separator />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
