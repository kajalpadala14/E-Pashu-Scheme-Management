import { normalizeRole, roleLabels, type UserRole } from "@/lib/rbac";

export type { UserRole } from "@/lib/rbac";

export interface SessionUser {
  id?: string;
  name: string;
  role: UserRole;
  region: string;
  email: string;
  active?: boolean;
  token?: string;
  loginAt?: string;
  expiresAt?: string;
}

export const USER_STORAGE_KEY = "e-pashu-session-user";
export const SESSION_DURATION_MS = 30 * 60 * 1000;

export const sessionUsers: Record<UserRole, SessionUser> = {
  admin: {
    name: "Dr. Asha Verma",
    role: "admin",
    region: "",
    email: "admin@epashu.gov",
  },
  district_officer: {
    name: "District Scheme Officer",
    role: "district_officer",
    region: "Dantewada",
    email: "district@epashu.gov",
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

export const sessionRoleLabels = roleLabels;

export function readStoredUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }

    if (parsed.role && parsed.email) {
      const role = normalizeRole(parsed.role);
      const fallback = sessionUsers[role];
      return {
        id: parsed.id,
        role,
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : fallback.name,
        region: typeof parsed.region === "string" && parsed.region.trim() ? parsed.region : fallback.region,
        email: String(parsed.email).trim().toLowerCase(),
        active: parsed.active !== false,
        token: typeof parsed.token === "string" ? parsed.token : createSessionToken(parsed.email, role),
        loginAt: typeof parsed.loginAt === "string" ? parsed.loginAt : new Date().toISOString(),
        expiresAt: typeof parsed.expiresAt === "string" ? parsed.expiresAt : new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function withSessionToken(user: SessionUser): SessionUser {
  const role = normalizeRole(user.role);
  return {
    ...user,
    role,
    email: String(user.email || "").trim().toLowerCase(),
    token: createSessionToken(user.email, role),
    loginAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };
}

export function refreshSessionExpiry(user: SessionUser): SessionUser {
  return {
    ...user,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };
}

function createSessionToken(email: unknown, role: UserRole) {
  const header = encodeTokenPart({ alg: "HS256", typ: "JWT" });
  const payload = encodeTokenPart({
    sub: String(email || "").trim().toLowerCase(),
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + SESSION_DURATION_MS) / 1000),
  });
  return `${header}.${payload}.client-session`;
}

function encodeTokenPart(value: Record<string, unknown>) {
  return btoa(JSON.stringify(value)).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
