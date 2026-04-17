import api from "./axios";

export interface AdminStats {
  users: {
    total: number;
    clients: number;
    businessOwners: number;
    admins: number;
    suspended: number;
    newThisMonth: number;
  };
  products: { total: number };
  services: { total: number };
  bookings: { total: number };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: string;
    released: string;
    escrowed: string;
  };
}

export interface RevenueChartPoint {
  month: string;
  revenue: string;
}

export interface UserGrowthPoint {
  month: string;
  count: number;
}

export interface RecentOrderItem {
  quantity: number;
  price: string;
  product?: { name: string };
  service?: { name: string };
}

export interface RecentOrder {
  id: string;
  reference: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  client: { id: string; name: string; email: string };
  items: RecentOrderItem[];
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuspended: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>("/admin/stats");
  return data;
}

export async function fetchRevenueChart(): Promise<RevenueChartPoint[]> {
  const { data } = await api.get<RevenueChartPoint[]>("/admin/stats/revenue-chart");
  return data;
}

export async function fetchUserGrowth(): Promise<UserGrowthPoint[]> {
  const { data } = await api.get<UserGrowthPoint[]>("/admin/stats/user-growth");
  return data;
}

export async function fetchRecentOrders(limit = 10): Promise<RecentOrder[]> {
  const { data } = await api.get<RecentOrder[]>(`/admin/recent-orders?limit=${limit}`);
  return data;
}

export async function fetchRecentUsers(limit = 10): Promise<RecentUser[]> {
  const { data } = await api.get<RecentUser[]>(`/admin/recent-users?limit=${limit}`);
  return data;
}
