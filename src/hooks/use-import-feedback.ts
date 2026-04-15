import { useMutation } from "@tanstack/react-query";
import { Modals } from "@ui5/webcomponents-react";

import { SapApiClient } from "../api/api-client";

export const useImportFeedback = () => {
  return useMutation({
    mutationKey: ["importFeedback"],
    mutationFn: async ({ bank, file }: { bank: string; file: File }) =>
      await SapApiClient.getSapInstance().importFeedback(bank, file),
    onError: (error) => {
      Modals.showMessageBox({
        type: "Error",
        children: error.message,
      });
    },
  });
};
