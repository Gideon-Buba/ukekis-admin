import { useQuery } from "@tanstack/react-query";
import {
  Users, Package, Wrench, CalendarCheck, ShoppingCart, DollarSign,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  fetchAdminStats, fetchRevenueChart, fetchUserGrowth,
  fetchRecentOrders, fetchRecentUsers,
} from "@/api/stats";
import { StatCard } from "@/components/StatCard";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/RoleBadge";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatCurrency, formatDate, truncateId } from "@/lib/utils";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  const { data: revenueChart, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue-chart"],
    queryFn: fetchRevenueChart,
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ["user-growth"],
    queryFn: fetchUserGrowth,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => fetchRecentOrders(10),
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["recent-users"],
    queryFn: () => fetchRecentUsers(10),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 lg:p-8 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.users.total ?? "—"}
            subtitle={
              stats
                ? `${stats.users.clients} clients · ${stats.users.businessOwners} owners · ${stats.users.newThisMonth} new this month`
                : undefined
            }
            icon={Users}
            iconColor="text-brand-600"
            loading={statsLoading}
          />
          <StatCard
            title="Suspended Users"
            value={stats?.users.suspended ?? "—"}
            icon={Users}
            iconColor="text-red-500"
            loading={statsLoading}
          />
          <StatCard
            title="Total Products"
            value={stats?.products.total ?? "—"}
            icon={Package}
            iconColor="text-orange-500"
            loading={statsLoading}
          />
          <StatCard
            title="Total Services"
            value={stats?.services.total ?? "—"}
            icon={Wrench}
            iconColor="text-violet-600"
            loading={statsLoading}
          />
          <StatCard
            title="Total Bookings"
            value={stats?.bookings.total ?? "—"}
            icon={CalendarCheck}
            iconColor="text-teal-600"
            loading={statsLoading}
          />
          <StatCard
            title="Total Orders"
            value={stats?.orders.total ?? "—"}
            subtitle={
              stats
                ? `${stats.orders.pending} pending · ${stats.orders.delivered} delivered · ${stats.orders.cancelled} cancelled`
                : undefined
            }
            icon={ShoppingCart}
            iconColor="text-pink-600"
            loading={statsLoading}
          />
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue"
            value={stats ? formatCurrency(stats.revenue.total) : "—"}
            icon={DollarSign}
            iconColor="text-green-600"
            loading={statsLoading}
          />
          <StatCard
            title="Released Revenue"
            value={stats ? formatCurrency(stats.revenue.released) : "—"}
            icon={DollarSign}
            iconColor="text-green-500"
            loading={statsLoading}
          />
          <StatCard
            title="Escrowed Revenue"
            value={stats ? formatCurrency(stats.revenue.escrowed) : "—"}
            icon={DollarSign}
            iconColor="text-amber-600"
            loading={statsLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={revenueChart?.map((p) => ({ ...p, revenue: parseFloat(p.revenue) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${v}`} />
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Line type="monotone" dataKey="revenue" stroke="#0f7c6d" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              {growthLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="New Users" fill="#0f7c6d" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Tables */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Order</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders?.map((order) => {
                        const itemNames = order.items
                          .map((i) => i.product?.name ?? i.service?.name)
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-3">
                              <div className="font-mono text-xs text-gray-500">{order.reference ?? truncateId(order.id)}</div>
                              <div className="text-xs text-gray-400 mt-0.5 max-w-[140px] truncate">{itemNames || "—"}</div>
                            </td>
                            <td className="px-3 py-3 text-gray-700">{order.client?.name ?? "—"}</td>
                            <td className="px-3 py-3"><OrderStatusBadge status={order.status} /></td>
                            <td className="px-6 py-3 text-right font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                          </tr>
                        );
                      })}
                      {!recentOrders?.length && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">No recent orders</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers?.map((user) => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </td>
                          <td className="px-3 py-3"><RoleBadge role={user.role} /></td>
                          <td className="px-6 py-3 text-right text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                      {!recentUsers?.length && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">No recent users</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
