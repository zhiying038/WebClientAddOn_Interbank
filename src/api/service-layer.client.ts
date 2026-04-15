import { type ODataList, type SapApiConfig, type SLUser } from "./api.types";

export class ServiceLayerClient {
  private baseUrl: string = "";

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(company: string, username: string, password: string) {
    const response = await this.fetch("b1s/v2/Login", {
      method: "POST",
      body: JSON.stringify({
        CompanyDB: company,
        UserName: username,
        Password: password,
      }),
    });
    return response;
  }

  async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = import.meta.env.DEV
      ? `${this.baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
      : `${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      const body = await res.json();
      message =
        body?.error?.message ??
        body?.error?.message?.value ??
        body?.message ??
        body?.error ??
        message;
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  async getCurrentUser(): Promise<SLUser> {
    return this.fetch<SLUser>("b1s/v2/UsersService_GetCurrentUser", {
      method: "POST",
    });
  }

  async getSapApiConfig(): Promise<SapApiConfig> {
    const res = await this.fetch<ODataList<{ Code: string; U_Value: string }>>(
      "b1s/v2/FTAPICONFIG?$select=Code,U_Value"
    );
    const byCode = Object.fromEntries(res.value.map((r) => [r.Code, r.U_Value]));
    return {
      U_ApiUrl: byCode["ApiUrl"],
      U_Username: byCode["Username"],
      U_Password: byCode["Password"],
    };
  }

  async cancelOutgoingPayment(docentry: number | null) {
    return this.fetch(`b1s/v2/VendorPayments(${docentry})/Cancel`, {
      method: "POST",
    });
  }

  async cancelJournalEntry(docentry: number | null) {
    return this.fetch(`b1s/v2/JournalEntries(${docentry})/Cancel`, {
      method: "POST",
    });
  }
}

export const serviceLayerApi = new ServiceLayerClient(import.meta.env.VITE_SL_BASE_URL);
