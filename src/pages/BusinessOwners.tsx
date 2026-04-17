import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchBusinessOwners, suspendUser, unsuspendUser, assignRole, type BusinessOwner } from "@/api/users";
import { Topbar } from "@/components/Topbar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export default function BusinessOwnersPage() {
  const queryClient = useQueryClient();
  const { data: owners, isLoading, error } = useQuery({
    queryKey: ["business-owners"],
    queryFn: fetchBusinessOwners,
  });

  const [suspendTarget, setSuspendTarget] = useState<BusinessOwner | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<BusinessOwner | null>(null);
  const [roleTarget, setRoleTarget] = useState<BusinessOwner | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-owners"] });
      toast.success("User suspended");
      setSuspendTarget(null);
    },
    onError: () => toast.error("Failed to suspend user"),
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => unsuspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-owners"] });
      toast.success("User unsuspended");
      setUnsuspendTarget(null);
    },
    onError: () => toast.error("Failed to unsuspend user"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => assignRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-owners"] });
      toast.success("Role updated");
      setRoleTarget(null);
    },
    onError: () => toast.error("Failed to update role"),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Business Owners" />
      <main className="flex-1 p-6 lg:p-8">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-red-500 text-sm">
                Failed to load business owners. Please check the API endpoint or server logs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Business</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Products</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Services</th>
                      <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Bookings</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {owners?.map((owner) => (
                      <tr key={owner.userId} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900">{owner.businessName}</div>
                          <div className="text-xs text-gray-400 max-w-[180px] truncate">{owner.bio}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-gray-900">{owner.ownerName}</div>
                          <div className="text-xs text-gray-400">{owner.email}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                            {owner.productCount}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                            {owner.serviceCount}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold">
                            {owner.bookingCount}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {owner.isSuspended ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(owner.joinedAt)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!owner.isSuspended ? (
                              <Button size="sm" variant="outline" onClick={() => setSuspendTarget(owner)}>
                                Suspend
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setUnsuspendTarget(owner)}>
                                Unsuspend
                              </Button>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => { setSelectedRole("BUSINESS_OWNER"); setRoleTarget(owner); }}>
                              Role
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!owners?.length && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No business owners found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        title="Suspend Business Owner"
        description={`Suspend ${suspendTarget?.ownerName} (${suspendTarget?.businessName})? Their listings will be hidden.`}
        confirmLabel="Suspend"
        onConfirm={() => suspendTarget && suspendMutation.mutate(suspendTarget.userId)}
        loading={suspendMutation.isPending}
      />

      <ConfirmDialog
        open={!!unsuspendTarget}
        onOpenChange={(o) => !o && setUnsuspendTarget(null)}
        title="Unsuspend Business Owner"
        description={`Restore access for ${unsuspendTarget?.ownerName}?`}
        confirmLabel="Unsuspend"
        onConfirm={() => unsuspendTarget && unsuspendMutation.mutate(unsuspendTarget.userId)}
        loading={unsuspendMutation.isPending}
      />

      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Change the role for {roleTarget?.ownerName}</DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRoleTarget(null)}>Cancel</Button>
            <Button
              onClick={() => roleTarget && roleMutation.mutate({ id: roleTarget.userId, role: selectedRole })}
              disabled={roleMutation.isPending || !selectedRole}
            >
              {roleMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
