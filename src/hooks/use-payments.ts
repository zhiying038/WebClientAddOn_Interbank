import { SapApiClient, serviceLayerApi, type InterbankPostingInput } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Modals } from "@ui5/webcomponents-react";
import { queryKeys } from "./query-keys";

export const usePayments = (input: InterbankPostingInput, username: string, enabled: boolean) => {
  return useQuery({
    queryKey: queryKeys.payments(input, username),
    queryFn: () => SapApiClient.getSapInstance().getPayments(input, username),
    enabled: !!SapApiClient.getInstance() && enabled,
  });
};

export const usePaymentErrors = (
  input: InterbankPostingInput,
  username: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: queryKeys.paymentErrors(input, username),
    queryFn: () => SapApiClient.getSapInstance().getPaymentErrors(input, username),
    enabled: !!SapApiClient.getInstance() && enabled,
  });
};

export const useCancelPayment = () => {
  return useMutation({
    mutationKey: ["cancelPayment"],
    mutationFn: async ({ docentry }: { docentry: number | null }) =>
      await serviceLayerApi.cancelOutgoingPayment(docentry),
    onError: (error) => {
      Modals.showMessageBox({
        type: "Error",
        children: error.message,
      });
    },
  });
};

export const useCancelJE = () => {
  return useMutation({
    mutationKey: ["cancelPayment"],
    mutationFn: async ({ docentry }: { docentry: number | null }) =>
      await serviceLayerApi.cancelJournalEntry(docentry),
    onError: (error) => {
      Modals.showMessageBox({
        type: "Error",
        children: error.message,
      });
    },
  });
};
