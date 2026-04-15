import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import dayjs from "dayjs";
import type {
  Bank,
  BankPayment,
  BankPaymentError,
  InterbankPostingInput,
  ProcessedFeedbackResponse,
  SapApiConfig,
} from "./api.types";

const TOKEN_KEY = "AUTH_TOKEN";

interface SapApiLoginResponse {
  value: string;
}

export class SapApiClient {
  private static _instance: SapApiClient | null = null;
  private readonly client: AxiosInstance;

  static getInstance(): SapApiClient | null {
    return SapApiClient._instance;
  }

  static getSapInstance(): SapApiClient {
    if (!SapApiClient._instance) throw new Error("SAP API is not initialized");
    return SapApiClient._instance;
  }

  constructor(baseUrl: string, refreshAuth: () => Promise<string>) {
    this.client = axios.create({
      baseURL: baseUrl.replace(/\/$/, ""),
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_KEY)}`;
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          await refreshAuth();
          return this.client(error.config);
        }
        const { status, data } = error.response ?? {};
        const message = data?.message ?? data?.error ?? data?.Error ?? `HTTP ${status}`;
        throw new Error(message);
      }
    );
  }

  static async initialize(config: SapApiConfig) {
    const reauth = () => SapApiClient.login(config);
    SapApiClient._instance = new SapApiClient(config.U_ApiUrl, reauth);
    return SapApiClient._instance;
  }

  async fetch<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.request<T>({ url: path, ...config });
    return res.data;
  }

  async getBanks(): Promise<Bank[]> {
    return this.fetch<Bank[]>("/api/v1/SAPStoredProcedure/Execute?code=Banks", {
      method: "POST",
      data: {},
    });
  }

  async getPayments(input: InterbankPostingInput, username: string) {
    const response = await this.client.post<BankPayment[]>(
      `/api/v1/SAPStoredProcedure/Execute?Code=GetBankPayments`,
      {
        Bank: input.Bank,
        PayCode: input?.PayCode ?? "",
        Draft: input.Draft ? "Y" : "N",
        DocNoFr: input.DocNoFr === "" ? 0 : +input.DocNoFr,
        DocNoTo: input.DocNoTo === "" ? 0 : +input.DocNoTo,
        PayMean: input.Method,
        DocDate: input.PostDate,
        Username: username,
      }
    );
    return response.data ?? [];
  }

  async getPaymentErrors(input: InterbankPostingInput, username?: string) {
    const response = await this.client.post<BankPaymentError[]>(
      `/api/v1/SAPStoredProcedure/Execute?Code=GetBankPaymentErrors`,
      {
        Bank: input.Bank,
        Draft: input.Draft ? "Y" : "N",
        DocNoFr: input.DocNoFr === "" ? 0 : +input.DocNoFr,
        DocNoTo: input.DocNoTo === "" ? 0 : +input.DocNoTo,
        PayMean: input.Method,
        DocDate: input.PostDate,
        Username: username ?? "",
      }
    );
    return response.data ?? [];
  }

  async generatePaymentFile(input: InterbankPostingInput, rows: BankPayment[], username?: string) {
    const response = await this.client.post(
      `/api/v1/Interbank/GenerateFile`,
      {
        Bank: input.Bank,
        PayCode: input?.PayCode ?? "",
        Draft: input.Draft ? "Y" : "N",
        DocNoFr: input.DocNoFr === "" ? 0 : +input.DocNoFr,
        DocNoTo: input.DocNoTo === "" ? 0 : +input.DocNoTo,
        PayMean: input.Method,
        DocDate: dayjs(input.PostDate).format("YYYY-MM-DD"),
        Documents: JSON.stringify(rows.map((x) => ({ DocEntry: x.DocEntry, ObjType: x.ObjType }))),
        Username: username ?? "",
      },
      { responseType: "blob" }
    );

    const contentType = response.headers["content-type"];
    const contentDisposition = response.headers["content-disposition"];
    let filename = "download";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?(?:;|$)/);
      if (match) filename = match[1];
    }

    const blob = new Blob([response.data], { type: contentType });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  async importFeedback(bank: string, file: File) {
    const formData = new FormData();
    formData.append("bank", bank);
    formData.append("file", file);
    const response = await this.client.post<ProcessedFeedbackResponse[]>(
      `/api/v1/Interbank/ProcessFeedback`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "*",
        },
      }
    );
    return response.data;
  }

  private static async login(config: SapApiConfig) {
    const url = `${config.U_ApiUrl.replace(/\/$/, "")}/api/v1/SAPAuthentication/Login`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: config.U_Username,
        Password: config.U_Password,
      }),
    });
    if (!response.ok) throw new Error(`SAP Web API login failed: HTTP ${response.status}`);
    const data: SapApiLoginResponse = await response.json();
    localStorage.setItem(TOKEN_KEY, data.value);
    return data.value;
  }
}
