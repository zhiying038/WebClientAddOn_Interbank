import type { SLUser } from "@/api";
import { createContext, useContext } from "react";

interface UserContextValue {
  user: SLUser | undefined;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = UserContext.Provider;

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
