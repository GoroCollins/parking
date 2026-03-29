import { type ParkingSession } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { extractErrorMessage } from "@/utils/errorHandler";
import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";

export default function ParkingSessionsList() {
  const { data: parkingSessions, error, isLoading } = useSWR<ParkingSession[]>(
    "/slots/parkingsessions/",
    fetcher
  );

  // Format date helper
  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  // Loading state
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading parking sessions…
      </p>
    );
  }

  // Error state
  if (error) {
    return (
      <p className="text-sm text-destructive">
        {extractErrorMessage(error)}
      </p>
    );
  }

  // Empty state
  if (!parkingSessions || parkingSessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No parking sessions found.
      </p>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Assigned By</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {parkingSessions.map((session) => (
            <TableRow key={session.id}>
              
              {/* Start Time */}
              <TableCell className="font-medium">
                {formatDate(session.start_time)}
              </TableCell>

              {/* End Time */}
              <TableCell className="text-muted-foreground">
                {formatDate(session.end_time)}
              </TableCell>

              {/* Duration */}
              <TableCell className="text-muted-foreground">
                {session.duration ?? "—"}
              </TableCell>

              {/* Amount */}
              <TableCell className="text-muted-foreground">
                {session.amount != null
                  ? session.amount.toFixed(2)
                  : "—"}
              </TableCell>

              {/* Assigned By */}
              <TableCell className="text-muted-foreground">
                {session.created_by ?? "—"}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}