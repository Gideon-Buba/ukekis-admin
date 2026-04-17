import api from "./axios";

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELED";

export interface Booking {
  id: string;
  clientId: string;
  businessOwnerId: string;
  serviceId: string;
  scheduledTime: string;
  status: BookingStatus;
  createdAt: string;
  service: {
    title: string;
    price: string;
    image: { url: string } | null;
  };
  businessOwner: {
    businessName: string;
    phoneNumber: string | null;
  };
  client: {
    user: {
      name: string;
      email: string;
    };
  };
}

export async function fetchBookings(status?: BookingStatus | ""): Promise<Booking[]> {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  const { data } = await api.get<Booking[]>(`/admin/bookings?${query}`);
  return Array.isArray(data) ? data : [];
}
