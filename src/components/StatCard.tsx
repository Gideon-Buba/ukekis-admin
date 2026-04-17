import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = "text-brand-600", loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
