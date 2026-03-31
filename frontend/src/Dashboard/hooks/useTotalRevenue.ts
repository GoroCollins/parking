import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";

export function useTotalRevenue() {
  const { data, error, isLoading } = useSWR<number>(
    "/slots/total-revenue/",
    async (url: string) => {
      const res = await fetcher(url);
      return res.total_revenue;
    }
  );

  return {
    value: data,
    isLoading,
    isError: error,
  };
}