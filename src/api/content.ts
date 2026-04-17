import api from "./axios";

export interface ProductImage {
  url: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  isFavorite: boolean;
  averageRating: number | null;
  totalReviews: number;
  images: ProductImage[];
}

export interface ProductsResponse {
  data: Product[];
  pagination: { nextCursor: string | null; hasNextPage: boolean; limit: number };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: number;
  isFavorite: boolean;
  averageRating: number | null;
  totalReviews: number;
  businessOwner: { businessName: string; bio: string | null };
}

export interface ServicesResponse {
  data: Service[];
  pagination: { nextCursor: string | null; hasNextPage: boolean; limit: number };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  clientId: string;
  productId?: string;
  serviceId?: string;
  createdAt: string;
}

export async function fetchProducts(cursor?: string, limit = 50): Promise<ProductsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const { data } = await api.get<ProductsResponse>(`/products?${params}`);
  return data;
}

export async function fetchServices(cursor?: string, limit = 50): Promise<ServicesResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const { data } = await api.get<ServicesResponse>(`/business-owner/services/public?${params}`);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/admin/services/${id}`);
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/reviews/product/${productId}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchServiceReviews(serviceId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/reviews/service/${serviceId}`);
  return Array.isArray(data) ? data : [];
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/admin/reviews/${id}`);
}
