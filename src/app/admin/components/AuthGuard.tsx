import { navigateTo } from "@mongez/react-router";
import { useEffect, useState } from "react";
import { authService } from "services/supabase";
import URLS from "shared/utils/urls";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component to protect admin routes
 * Redirects to login if user is not authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();

      if (!isAuthenticated) {
        navigateTo(URLS.admin.login);
        return;
      }

      // User is authenticated
      setIsAuthorized(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      navigateTo(URLS.admin.login);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b38d1] mx-auto mb-4 shadow-md"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authorized (already redirected)
  if (!isAuthorized) {
    return null;
  }

  // Show protected content
  return <>{children}</>;
}
