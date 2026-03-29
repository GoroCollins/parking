import { useState } from "react";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
// import { axiosInstance } from "@/services/apiClient";
import { fetcher } from "@/utils/swrFetcher";
import { extractErrorMessage } from "@/utils/errorHandler";
// import UserRoleForm from "../components/UserRoleForm";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  role?: string;
}

export default function UsersList() {
  const { data: users, error, mutate, isLoading } = useSWR<User[]>("/users/", fetcher);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading users…</p>;
  if (error) return <p className="text-sm text-destructive">{extractErrorMessage(error)}</p>;
  if (!users || users.length === 0) return <p className="text-sm text-muted-foreground">No users found.</p>;

  return (
    <div className="rounded-md border p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.full_name || "—"}</TableCell>
              <TableCell>{user.role || "—"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEditingUserId(user.id)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit Role
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* {editingUserId && (
        <UserRoleForm
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={async () => {
            toast.success("Role updated successfully");
            setEditingUserId(null);
            await mutate();
          }}
        />
      )} */}
    </div>
  );
}