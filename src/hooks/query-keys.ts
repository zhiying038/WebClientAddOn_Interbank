import type { InterbankPostingInput } from "../api/api.types";

export const queryKeys = {
  slLogin: ["sl-login"] as const,
  sapConfig: ["sap-config"] as const,
  sapLogin: ["sap-login"] as const,
  currentUser: ["sl-current-user"] as const,
  banks: ["banks"] as const,
  payments: (input: InterbankPostingInput, username: string) =>
    ["previewPayment", input, username] as const,
  paymentErrors: (input: InterbankPostingInput, username: string) =>
    ["previewErrors", input, username] as const,
};
