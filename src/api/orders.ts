import api from "./axios";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  vendorId: string;
  product: { name: string };
}

export interface FulfillmentItem {
  id: string;
  fulfillmentId: string;
  productId: string;
  quantity: number;
  product: { name: string };
}

export interface Fulfillment {
  id: string;
  orderId: string;
  vendorId: string;
  status: string;
  trackingNumber: string | null;
  carrierName: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  vendor: { id: string; name: string };
  items: FulfillmentItem[];
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface Order {
  id: string;
  reference: string;
  clientId: string;
  totalAmount: string;
  status: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  client: { id: string; name: string; email: string };
  items: OrderItem[];
  fulfillments: Fulfillment[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface FetchOrdersParams {
  search?: string;
  status?: OrderStatus | "";
  page?: number;
  limit?: number;
}

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<OrdersResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  const { data } = await api.get<OrdersResponse>(`/api/fulfillment/orders?${query}`);
  return data;
}

export async function fetchOrderByReference(reference: string): Promise<Order> {
  const { data } = await api.get<Order>(`/api/fulfillment/orders/${reference}`);
  return data;
}
