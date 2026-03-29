import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
