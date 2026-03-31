import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";

export function useTotalOccupiedSlots() {
  const { data, error, isLoading } = useSWR<number>(
    "/slots/parkingslots/occupied_slots/",
    async (url: string) => {
      const res = await fetcher(url);
      return res.occupied_slots;
    }
  );

  return {
    value: data,
    isLoading,
    isError: error,
  };
}