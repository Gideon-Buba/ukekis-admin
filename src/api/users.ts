import api from "./axios";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessOwner {
  userId: string;
  businessName: string;
  bio: string;
  physicalAddress: string;
  contactInfo: string;
  ownerName: string;
  email: string;
  isSuspended: boolean;
  joinedAt: string;
  productCount: number;
  serviceCount: number;
  bookingCount: number;
}

function normalizeArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "items", "users", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get("/users");
  return normalizeArray<User>(data);
}

export async function fetchBusinessOwners(): Promise<BusinessOwner[]> {
  const { data } = await api.get("/admin/business-owners");
  return normalizeArray<BusinessOwner>(data);
}

export async function suspendUser(id: string): Promise<void> {
  await api.patch(`/users/${id}/suspend`);
}

export async function unsuspendUser(id: string): Promise<void> {
  await api.patch(`/users/${id}/unsuspend`);
}

export async function assignRole(id: string, role: string): Promise<void> {
  await api.patch(`/admin/users/${id}/role`, { role });
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
