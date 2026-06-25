import { createContext } from "react";
import type { SessionUser } from "./userSession";

export interface UserContextValue {
  user: SessionUser | null;
  roleLabel: string;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
  sessionChecking: boolean;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);
