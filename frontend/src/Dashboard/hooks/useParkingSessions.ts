import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";

export function useTotalParkingSessions() {
  const { data, error, isLoading } = useSWR<number>(
    "/slots/parkingsessions/count/",
    async (url: string) => {
      const res = await fetcher(url);
      return res.count;
    }
  );

  return {
    value: data,
    isLoading,
    isError: error,
  };
}