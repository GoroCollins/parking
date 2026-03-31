import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetcher } from "@/utils/swrFetcher";
import { extractErrorMessage } from "@/utils/errorHandler";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  role?: string;
}

export default function UsersList() {
  const { data: users, error, isLoading } = useSWR<User[]>("/users/users/", fetcher);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading users…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {extractErrorMessage(error)}
      </p>
    );
  }

  if (!users || users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No users found.
      </p>
    );
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.full_name || "—"}</TableCell>
              <TableCell>{user.role || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}