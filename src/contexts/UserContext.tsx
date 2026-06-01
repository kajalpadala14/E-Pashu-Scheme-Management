import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { normalizeRole, roleLabels, type UserRole } from "@/lib/rbac";
export type { UserRole } from "@/lib/rbac";

export interface SessionUser {
  id?: string;
  name: string;
  role: UserRole;
  region: string;
  email: string;
  active?: boolean;
}

const USER_STORAGE_KEY = "e-pashu-session-user";

const defaultUsers: Record<UserRole, SessionUser> = {
  admin: {
    name: "Dr. Asha Verma",
    role: "admin",
    region: "",
    email: "admin@epashu.gov",
  },
  veterinary_doctor: {
    name: "Dr. Rohit Mehta",
    role: "veterinary_doctor",
    region: "",
    email: "vet@epashu.gov",
  },
  field_officer: {
    name: "Rahul Kumar",
    role: "field_officer",
    region: "",
    email: "fo.rampur@epashu.gov",
  },
  block_officer: {
    name: "Block Scheme Officer",
    role: "block_officer",
    region: "Dantewada",
    email: "block.dantewada@epashu.gov",
  },
  data_entry_operator: {
    name: "Scheme Data Entry Operator",
    role: "data_entry_operator",
    region: "",
    email: "scheme.data@epashu.gov",
  },
  departmental_officer: {
    name: "Manoj Kumar",
    role: "departmental_officer",
    region: "",
    email: "departmental@epashu.gov",
  },
  deputy_director_vet: {
    name: "Dr. Neha Singh",
    role: "deputy_director_vet",
    region: "",
    email: "deputy.director@epashu.gov",
  },
};

interface UserContextValue {
  user: SessionUser | null;
  roleLabel: string;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function readStoredUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (parsed.role && parsed.email) {
      const role = normalizeRole(parsed.role);
      const fallback = defaultUsers[role];
      return {
        id: parsed.id,
        role,
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : fallback.name,
        region: typeof parsed.region === "string" && parsed.region.trim() ? parsed.region : fallback.region,
        email: String(parsed.email).trim().toLowerCase(),
        active: parsed.active !== false,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readStoredUser());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      roleLabel: user ? roleLabels[user.role] : "Guest",
      setUser,
      logout: () => setUser(null),
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}

export const sessionUsers = defaultUsers;
export const sessionRoleLabels = roleLabels;
