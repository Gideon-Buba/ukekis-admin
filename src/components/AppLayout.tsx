import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const displayEmail = user?.email;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar adminName={displayName} adminEmail={displayEmail} />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
