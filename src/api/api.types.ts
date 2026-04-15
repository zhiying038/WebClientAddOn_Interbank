export interface ODataList<T> {
  value: T[];
}

export interface SLUser {
  UserCode: string;
  UserName: string;
}

export interface SapApiConfig {
  U_ApiUrl: string;
  U_Username: string;
  U_Password: string;
}

export type Bank = {
  Code: string;
  Name: string;
  RequirePayCode: "Y" | "N";
  SupportFeedbackFile: "Y" | "N";
  U_BaseDate?: string;
};

export type BankPayment = {
  Amount: number;
  DocEntry: number;
  Payee: string;
  Payment_Type: string;
  ObjType: number;
};

export type BankPaymentError = {
  DocEntry: number;
  Error_Type: string;
  Reason: string;
};

export type InterbankPostingInput = {
  Bank: string;
  DocNoFr: string;
  DocNoTo: string;
  Draft: boolean;
  Method: string;
  PayCode: string;
  PostDate: string;
};

export type PaymentData = {
  Encrypt: boolean;
  FileRef: string;
  FileType: string;
  Content: string;
};

export type ProcessedFeedbackResponse = {
  Row: number;
  DocEntry: number | null;
  DocNum: number | null;
  Canceled: string | null;
  ObjType: string | null;
  Status: string;
  FeedbackMessage: string;
};
