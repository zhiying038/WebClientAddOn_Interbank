import { SapApiClient, type BankPayment, type InterbankPostingInput } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { Modals } from "@ui5/webcomponents-react";

export const useGenerateFile = () => {
  return useMutation({
    mutationKey: ["generatePaymentFile"],
    mutationFn: async ({
      input,
      rows,
      username,
    }: {
      input: InterbankPostingInput;
      username: string;
      rows: BankPayment[];
    }) => await SapApiClient.getSapInstance().generatePaymentFile(input, rows, username),
    onError: (error) => {
      Modals.showMessageBox({
        type: "Error",
        children: error.message,
      });
    },
  });
};
