import { SapApiClient } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

export const useBanks = () => {
  return useQuery({
    queryKey: queryKeys.banks,
    queryFn: () => SapApiClient.getSapInstance().getBanks(),
    enabled: !!SapApiClient.getInstance(),
  });
};
