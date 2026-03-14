import { Link } from "@mongez/react-router";
import { BiHomeAlt2, BiStore } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineContactSupport } from "react-icons/md";

import URLS from "shared/utils/urls";

export default function ResponsiveNavbar() {
  return (
    <div className="fixed bottom-0 lg:hidden w-full bg-white shadow-md z-50">
      <div className="flex items-center justify-between py-5 px-8">
        <Link href={URLS.home}>
          <BiHomeAlt2 className="w-6 h-6 sm:w-7 sm:h-7" />
        </Link>
        <Link href={URLS.shop.collections}>
          <BiStore className="w-6 h-6 sm:w-7 sm:h-7" />
        </Link>
        <Link href={URLS.contactUs}>
          <MdOutlineContactSupport className="w-6 h-6 sm:w-7 sm:h-7" />
        </Link>
        <Link href={URLS.auth.root}>
          <FaRegUser className="w-6 h-6 sm:w-7 sm:h-7" />
        </Link>
      </div>
    </div>
  );
}
