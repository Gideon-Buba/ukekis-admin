import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import BusinessOwnersPage from "@/pages/BusinessOwners";
import ModerationPage from "@/pages/Moderation";
import OrdersPage from "@/pages/Orders";
import BookingsPage from "@/pages/Bookings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/business-owners" element={<BusinessOwnersPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
