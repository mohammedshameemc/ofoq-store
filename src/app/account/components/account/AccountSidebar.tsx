import { trans } from "@mongez/localization";
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";

import { addressesAtom } from "app/account/atoms/address-atom";
import { useLogout } from "app/account/hooks";
import ConfirmModal from "app/admin/components/ConfirmModal";
import URLS from "shared/utils/urls";
import AccountSidebarRoute from "./AccountSidebarRoute";

export default function AccountSidebar() {
  const addresses = addressesAtom.value;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logout = useLogout();

  const accountSidebarRoutes = [
    {
      label: trans("dashboard"),
      path: URLS.auth.root,
      icon: <RxDashboard className="w-5 h-5" />,
    },
    {
      label: trans("CheckOut"),
      path: URLS.checkout,
      icon: <IoMdCheckmarkCircleOutline className="w-5 h-5" />,
    },
    {
      label: trans("Address"),
      path: URLS.auth.addresses,
      icon: <IoLocationOutline className="w-5 h-5" />,
      data: (addresses && addresses.length) || 0,
    },
  ];

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="flex items-start gap-3 flex-col px-5">
        {accountSidebarRoutes.map(route => (
          <AccountSidebarRoute key={route.label} route={route} />
        ))}
        
        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full px-2 py-3 flex items-center justify-start gap-2 text-slate-700 bg-[#f6f6f6] hover:bg-slate-900 hover:text-white transition-all rounded-sm text-sm">
          <MdOutlineLogout className="w-5 h-5" />
          <p className="font-semibold">{trans("logout").toUpperCase()}</p>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the home page."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
