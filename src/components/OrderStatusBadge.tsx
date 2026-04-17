import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "success" | "purple" | "warning" | "outline";

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  SHIPPED: { label: "Shipped", variant: "purple" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "outline" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
