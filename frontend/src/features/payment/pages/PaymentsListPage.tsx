import useSWR from "swr";
import { useSearchParams } from "react-router-dom";
import { fetcher } from "@/utils/swrFetcher";
//import PaymentVoucherFilters from "@/features/purchases/components/paymentvouchers/PaymentVoucherFilters";
import Pagination from "@/features/payment/components/Pagination";
import type { Payment } from "@/features/payment/types";
import PaymentsTable from "@/features/payment/components/PaymentsList";


interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export default function PaymentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();


  const ordering = searchParams.get("ordering") ?? "-payment_date";

  const sort = ordering.startsWith("-")
    ? ordering.slice(1)
    : ordering;

  const dir: "asc" | "desc" = ordering.startsWith("-") ? "desc" : "asc";

  const onSort = (field: string) => {
    const params = new URLSearchParams(searchParams);

    const current = params.get("ordering");

    if (current === field) {
      params.set("ordering", `-${field}`);
    } else if (current === `-${field}`) {
      params.set("ordering", field);
    } else {
      params.set("ordering", field);
    }

    params.set("page", "1");
    setSearchParams(params, { replace: true });
  };


  const filters = {
    search: searchParams.get("search") ?? "",
    payment_type: searchParams.get("payment_type")
      ? searchParams.get("payment_type")!.split(",")
      : [],
    invoice: searchParams.get("session") ?? "",
    document_number: searchParams.get("document_number") ?? "",
    payment_date_from: searchParams.get("transaction_date_from") ?? "",
    payment_date_to: searchParams.get("transaction_date_to") ?? "",
  };

  const updateFilters = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.set("page", "1");
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? 20);

  const onPageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params, { replace: true });
  };

  const queryString = searchParams.toString();

  const { data, isLoading } = useSWR<PaginatedResponse<Payment>>(`/slots/payment-details/?${queryString}`, fetcher);

  return (
    <>
      {/* <PaymentVoucherFilters
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
      /> */}

      <PaymentsTable
        data={data?.results ?? []}
        isLoading={isLoading}
        sort={sort}
        dir={dir}
        onSort={onSort}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={data?.count ?? 0}
        onPageChange={onPageChange}
      />
    </>
  );
}
