import { trans } from "@mongez/localization";
import { AiFillThunderbolt } from "react-icons/ai";

export default function TopBanner() {
  return (
    <div className="w-full bg-[#2b38d1] flex items-center justify-center p-4 gap-6 overflow-x-hidden">
      <div className="flex items-center min-w-[350px] truncate">
        <p className="text-light text-sm"></p>
      </div>
      <div className="flex items-center min-w-[350px] truncate">
        <p className="text-light text-sm"></p>
      </div>
      <div className="flex items-center min-w-[350px] truncate">
        <p className="text-light text-sm"></p>
      </div>
    </div>
  );
}
