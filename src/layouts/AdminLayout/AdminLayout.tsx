import { navigateTo } from "@mongez/react-router";
import { AuthGuard } from "app/admin/components/AuthGuard";
import ConfirmModal from "app/admin/components/ConfirmModal";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  AiOutlineAppstore,
  AiOutlineDashboard,
  AiOutlineLogout,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
  AiOutlineStar,
} from "react-icons/ai";
import { BiCategory, BiPackage } from "react-icons/bi";
import { authService } from "services/supabase";
import URLS from "shared/utils/urls";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function AdminLayout({ children }: PropsWithChildren) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Update current path on route changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [currentPath]);

  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      icon: <AiOutlineDashboard className="h-5 w-5" />,
      path: URLS.admin.dashboard,
    },
    {
      label: "Categories",
      icon: <BiCategory className="h-5 w-5" />,
      path: URLS.admin.categories,
    },
    {
      label: "Products",
      icon: <BiPackage className="h-5 w-5" />,
      path: URLS.admin.products,
    },
    {
      label: "Top Products",
      icon: <AiOutlineStar className="h-5 w-5" />,
      path: URLS.admin.topProducts,
    },
    {
      label: "Top Categories",
      icon: <AiOutlineAppstore className="h-5 w-5" />,
      path: URLS.admin.topCategories,
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      navigateTo(URLS.admin.login);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("adminUser");
      navigateTo(URLS.admin.login);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") ||
      '{"name":"Admin","email":"admin@ofoq.com"}',
  );

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "w-72" : "w-[76px]"
          } bg-white border-r border-borderLight transition-all duration-300 ease-in-out flex flex-col relative z-10`}>
          {/* Logo */}
          <div className="h-[68px] flex items-center justify-between px-5 border-b border-borderLight">
            {isSidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#2b38d1] rounded-lg flex items-center justify-center shadow-md shadow-[#2b38d1]/20">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-wide">
                  OFOQ
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
              {isSidebarOpen ? (
                <AiOutlineMenuFold className="h-5 w-5" />
              ) : (
                <AiOutlineMenuUnfold className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {isSidebarOpen && (
              <p className="px-4 pb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Navigation
              </p>
            )}
            {sidebarItems.map(item => {
              // Match even with locale prefix (e.g. /en/admin/dashboard)
              const isActive =
                currentPath === item.path || currentPath.endsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigateTo(item.path);
                    setCurrentPath(window.location.pathname);
                  }}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#2b38d1] text-white shadow-md shadow-[#2b38d1]/25"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } ${!isSidebarOpen && "justify-center"}`}>
                  <span
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600 transition-colors"
                    }>
                    {item.icon}
                  </span>
                  {isSidebarOpen && (
                    <span
                      className={`font-medium text-sm ${isActive ? "font-semibold" : ""}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-borderLight p-4">
            <div
              className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}>
              <div className="h-10 w-10 rounded-xl bg-[#2b38d1] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {adminUser.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {adminUser.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {adminUser.email}
                  </p>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium">
                <AiOutlineLogout className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access the admin panel."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        variant="warning"
        loading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </AuthGuard>
  );
}
