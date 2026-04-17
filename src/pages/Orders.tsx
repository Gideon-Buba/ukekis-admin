import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchOrders, fetchOrderByReference, type OrderStatus } from "@/api/orders";
import { Topbar } from "@/components/Topbar";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS: { label: string; value: OrderStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function OrderDetailModal({ reference, open, onClose }: { reference: string; open: boolean; onClose: () => void }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", reference],
    queryFn: () => fetchOrderByReference(reference),
    enabled: open && !!reference,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order {reference}</DialogTitle>
          <DialogDescription>Full order details and fulfillment info</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-32 w-full" /></div>
        ) : order ? (
          <div className="space-y-5 text-sm">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                <p className="text-gray-700">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Client</p>
                <p className="text-gray-900">{order.client?.name}</p>
                <p className="text-xs text-gray-400">{order.client?.email}</p>
              </div>
            </div>

            {/* Shipping */}
            {order.shippingAddress && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Address</p>
                <p className="text-gray-700">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
                <p className="text-gray-500 text-xs mt-1">{order.shippingAddress.phone}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Product</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Qty</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2 text-gray-900">{item.product?.name ?? "—"}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-900">{formatCurrency(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fulfillments */}
            {order.fulfillments?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fulfillments</p>
                <div className="space-y-2">
                  {order.fulfillments.map((f) => (
                    <div key={f.id} className="rounded-lg bg-gray-50 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">{f.carrierName || "—"}</span>
                        <OrderStatusBadge status={f.status} />
                      </div>
                      {f.trackingNumber && <p className="text-gray-500">Tracking: {f.trackingNumber}</p>}
                      {f.estimatedDelivery && <p className="text-gray-500">Est. Delivery: {formatDate(f.estimatedDelivery)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Order not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedRef, setSelectedRef] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["orders", search, status, page],
    queryFn: () => fetchOrders({ search, status, page, limit: 20 }),
  });

  const orders = response?.orders ?? [];
  const totalPages = response?.totalPages ?? 1;

  function openDetail(ref: string) {
    setSelectedRef(ref);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Orders" />
      <main className="flex-1 p-6 lg:p-8 space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by reference…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 h-9 rounded-md border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 w-64"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as OrderStatus | ""); setPage(1); }}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-red-500 text-sm">Failed to load orders.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reference</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Items</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                      <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const itemNames = order.items.map((i) => i.product?.name).filter(Boolean).join(", ");
                      return (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-6 py-3 font-mono text-xs text-gray-600">{order.reference}</td>
                          <td className="px-3 py-3 text-gray-700 max-w-[200px] truncate">{itemNames || "—"}</td>
                          <td className="px-3 py-3"><OrderStatusBadge status={order.status} /></td>
                          <td className="px-3 py-3 text-right font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-3 py-3 text-right text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                          <td className="px-6 py-3 text-right">
                            <Button size="sm" variant="outline" onClick={() => openDetail(order.reference)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <OrderDetailModal reference={selectedRef} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
