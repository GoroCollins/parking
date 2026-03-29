import { type ParkingArea } from '../types';
import { useNavigate } from "react-router-dom";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { extractErrorMessage } from "@/utils/errorHandler";

interface ParkingAreasListProps {
  parkingAreas?: ParkingArea[];
  isLoading?: boolean;
  error?: unknown;
}

export default function ParkingAreasList({
  parkingAreas,
  isLoading,
  error,
}: ParkingAreasListProps) {
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading parking areas…
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
  if (!parkingAreas || parkingAreas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No parking areas found.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Rate Per Hour</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {parkingAreas.map((parkingarea) => (
            <TableRow
              key={parkingarea.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/parkingarea/${parkingarea.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/parkingarea/${parkingarea.id}`);
                }
              }}
              className="cursor-pointer hover:bg-muted/50"
            >
              {/* Name */}
              <TableCell className="font-medium">
                {parkingarea.name}
              </TableCell>

              {/* Description */}
              <TableCell className="text-muted-foreground">
                {parkingarea.description || "—"}
              </TableCell>

              {/* Rate Per Hour */}
          <TableCell className="text-muted-foreground">
            {parkingarea.rate_per_hour != null
              ? Number(parkingarea.rate_per_hour).toFixed(2)
              : "—"}
          </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
