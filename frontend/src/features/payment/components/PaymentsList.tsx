import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Payment } from "../types";


interface Props {
  data: Payment[];
  isLoading?: boolean;

  // 👇 sorting-related props
  sort: string;
  dir: "asc" | "desc";
  onSort: (field: string) => void;
}

export default function PaymentsTable({
  data,
  isLoading = false,
  onSort,
  sort,
  dir,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No payment found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payment Number</TableHead>
          <TableHead>Slot</TableHead>
          <TableHead>Payment Type</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead
            onClick={(e) => {
              e.stopPropagation();
              onSort("receipted_at");
            }}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center gap-1">
              <span>Payment Date</span>
              {sort === "transaction_date" && (
                <span className="text-xs">
                  {dir === "asc" ? "▲" : "▼"}
                </span>
              )}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((payment) => (
         <TableRow key={payment.id}>
          <TableCell className="font-medium">
            {payment.id}
          </TableCell>

          <TableCell>
            {payment.slot}
          </TableCell>

          <TableCell>
            {payment.payment_type_name} ({payment.payment_type})
          </TableCell>

          <TableCell>
            {payment.receipted_by}
          </TableCell>

          <TableCell className="text-right">
            {payment.amount}
          </TableCell>

          <TableCell>
            {new Date(payment.transaction_date).toLocaleDateString()}
          </TableCell>
        </TableRow>

        ))}
      </TableBody>
    </Table>
  );
}
