import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Briefcase, ShieldAlert, ShoppingCart, CalendarCheck, LogOut, Menu, X } from "lucide-react";
import ukekiLogo from "@/assets/ukeki_logo.svg";
import { useState } from "react";
import { removeToken } from "@/lib/token";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/business-owners", icon: Briefcase, label: "Business Owners" },
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/bookings", icon: CalendarCheck, label: "Bookings" },
  { to: "/moderation", icon: ShieldAlert, label: "Content Moderation" },
];

interface SidebarProps {
  adminName?: string;
  adminEmail?: string;
}

export function Sidebar({ adminName, adminEmail }: SidebarProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  const initials = adminName
    ? adminName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={ukekiLogo} alt="Ukekis" className="h-12 w-auto shrink-0" />
          <div className="leading-tight">
            <p className="font-bold text-gray-900 text-sm">Ukekis</p>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {adminName && <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>}
            {adminEmail && <p className="text-xs text-gray-500 truncate">{adminEmail}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-200 bg-white sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
