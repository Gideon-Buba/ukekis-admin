import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookings, type BookingStatus } from "@/api/bookings";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS: { label: string; value: BookingStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Canceled", value: "CANCELED" },
];

type BadgeVariant = "warning" | "default" | "success" | "destructive" | "secondary";

const statusVariant: Record<string, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "default",
  COMPLETED: "success",
  REJECTED: "destructive",
  CANCELED: "destructive",
};

export default function BookingsPage() {
  const [status, setStatus] = useState<BookingStatus | "">("");

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["bookings", status],
    queryFn: () => fetchBookings(status),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Bookings" />
      <main className="flex-1 p-6 lg:p-8 space-y-4">

        {/* Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus | "")}
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
              <div className="px-6 py-12 text-center text-red-500 text-sm">Failed to load bookings.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Service</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Business</th>
                      <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings?.map((b) => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900">{b.client.user.name}</div>
                          <div className="text-xs text-gray-400">{b.client.user.email}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {b.service.image?.url ? (
                              <img src={b.service.image.url} alt={b.service.title} className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                            ) : null}
                            <span className="text-gray-900">{b.service.title}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-gray-900">{b.businessOwner.businessName}</div>
                          {b.businessOwner.phoneNumber && (
                            <div className="text-xs text-gray-400">{b.businessOwner.phoneNumber}</div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-gray-900">{formatCurrency(b.service.price)}</td>
                        <td className="px-3 py-3 text-gray-700">{formatDate(b.scheduledTime)}</td>
                        <td className="px-3 py-3">
                          <Badge variant={statusVariant[b.status] ?? "secondary"}>{b.status}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right text-gray-500 text-xs">{formatDate(b.createdAt)}</td>
                      </tr>
                    ))}
                    {!bookings?.length && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No bookings found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
