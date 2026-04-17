import { Badge } from "@/components/ui/badge";

const roleConfig: Record<string, { label: string; variant: "default" | "success" | "purple" }> = {
  CLIENT: { label: "Client", variant: "default" },
  BUSINESS_OWNER: { label: "Business Owner", variant: "success" },
  SUPER_ADMIN: { label: "Super Admin", variant: "purple" },
};

export function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] ?? { label: role, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
