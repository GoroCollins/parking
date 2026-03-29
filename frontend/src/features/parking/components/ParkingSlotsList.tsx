import { type ParkingSlot } from '../types';
import { useNavigate } from "react-router-dom";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { extractErrorMessage } from "@/utils/errorHandler";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle,} from "lucide-react";

interface ParkingSlotsListProps {
  parkingSlots?: ParkingSlot[];
  isLoading?: boolean;
  error?: unknown;
}

export default function ParkingSlotsList({
  parkingSlots,
  isLoading,
  error,
}: ParkingSlotsListProps) {
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading parking slots…
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
  if (!parkingSlots || parkingSlots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No parking slots found.
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
            <TableHead>Parking Area</TableHead>
            <TableHead>Slot Availability</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {parkingSlots.map((parkingslot) => (
            <TableRow
              key={parkingslot.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/parkingslot/${parkingslot.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/parkingslot/${parkingslot.id}`);
                }
              }}
              className="cursor-pointer hover:bg-muted/50"
            >
              {/* Name */}
              <TableCell className="font-medium">
                {parkingslot.name}
              </TableCell>

              {/* Description */}
              <TableCell className="text-muted-foreground">
                {parkingslot.description || "—"}
              </TableCell>

              {/* Parking Area */}
              <TableCell className="text-muted-foreground">
                {parkingslot.area || "—"}
              </TableCell>

              <TableCell>
                {parkingslot.available && (
                    <Badge variant="secondary">
                      Available
                    </Badge>
                )}
                {!parkingslot.available && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Slot already in use
                    </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
