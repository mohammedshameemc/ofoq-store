import { GiHamburgerMenu } from "react-icons/gi";

import { modalAtom } from "design-system/atoms/model-atom";
import { Button } from "design-system/components/ui/button";
import { cn } from "shared/lib/utils";
import { isLTR } from "shared/utils/helpers";
import Logo from "../Logo";
import SearchInput from "./components/search/search-input";

import LanguageConverter from "./components/converters/language-converter";

export default function Header() {
  const handleOpenModal = () => {
    modalAtom.onOpen("mobileSidebar");
  };

  return (
    <div className="w-full py-5">
      <div className="w-full flex items-center justify-between gap-5">
        <Button
          onClick={handleOpenModal}
          variant={"ghost"}
          className="hover:bg-transparent block lg:hidden">
          <GiHamburgerMenu className="h-7 w-7 text-black" />
        </Button>
        <Logo />
        <div
          className={cn(
            "w-full xl:w-[700px] 2xl:w-[800px] hidden lg:block",
            isLTR() ? "ml-14" : "mr-auto",
          )}>
          <SearchInput />
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageConverter />
        </div>
      </div>
    </div>
  );
}
