import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { fetchUsers, suspendUser, unsuspendUser, assignRole, deleteUser, type User } from "@/api/users";
import { Topbar } from "@/components/Topbar";
import { RoleBadge } from "@/components/RoleBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const [search, setSearch] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User suspended");
      setSuspendTarget(null);
    },
    onError: () => toast.error("Failed to suspend user"),
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => unsuspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User unsuspended");
      setUnsuspendTarget(null);
    },
    onError: () => toast.error("Failed to unsuspend user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => assignRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated");
      setRoleTarget(null);
    },
    onError: () => toast.error("Failed to update role"),
  });

  const filteredUsers = users?.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  function openRoleDialog(user: User) {
    setSelectedRole(user.role);
    setRoleTarget(user);
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Users" />
      <main className="flex-1 p-6 lg:p-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-md border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

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
                Failed to load users. Please check the API endpoint or server logs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((user) => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3"><RoleBadge role={user.role} /></td>
                        <td className="px-3 py-3">
                          {user.isSuspended ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!user.isSuspended && (
                              <Button size="sm" variant="outline" onClick={() => setSuspendTarget(user)}>
                                Suspend
                              </Button>
                            )}
                            {user.isSuspended && (
                              <Button size="sm" variant="outline" onClick={() => setUnsuspendTarget(user)}>
                                Unsuspend
                              </Button>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => openRoleDialog(user)}>
                              Role
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(user)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredUsers?.length && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          {search ? `No users match "${search}"` : "No users found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Suspend Dialog */}
      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(o) => !o && setSuspendTarget(null)}
        title="Suspend User"
        description={`Are you sure you want to suspend ${suspendTarget?.name}? They will lose access to the platform.`}
        confirmLabel="Suspend"
        onConfirm={() => suspendTarget && suspendMutation.mutate(suspendTarget.id)}
        loading={suspendMutation.isPending}
      />

      {/* Unsuspend Dialog */}
      <ConfirmDialog
        open={!!unsuspendTarget}
        onOpenChange={(o) => !o && setUnsuspendTarget(null)}
        title="Unsuspend User"
        description={`Restore access for ${unsuspendTarget?.name}?`}
        confirmLabel="Unsuspend"
        onConfirm={() => unsuspendTarget && unsuspendMutation.mutate(unsuspendTarget.id)}
        loading={unsuspendMutation.isPending}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete User"
        description={`This will permanently delete ${deleteTarget?.name}'s account. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />

      {/* Assign Role Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Change the role for {roleTarget?.name}</DialogDescription>
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
              onClick={() => roleTarget && roleMutation.mutate({ id: roleTarget.id, role: selectedRole })}
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
