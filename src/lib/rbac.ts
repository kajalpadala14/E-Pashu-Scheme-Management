export type UserRole = "admin" | "veterinary_doctor" | "field_officer" | "departmental_officer" | "deputy_director_vet";

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "field_officer", label: "Field Officer" },
  { value: "veterinary_doctor", label: "Veterinary Doctor" },
  { value: "departmental_officer", label: "Departmental Officer" },
  { value: "deputy_director_vet", label: "Deputy Director (Vet)" },
] as const satisfies readonly { value: UserRole; label: string }[];

export type AppRouteKey =
  | "dashboard"
  | "animals"
  | "farmers"
  | "locations"
  | "vaccinations"
  | "breeding"
  | "alerts"
  | "field_officers"
  | "employees"
  | "ai_insights"
  | "reports"
  | "schemes"
  | "profile";

const fullAccessRoles = new Set<UserRole>(["admin", "veterinary_doctor", "deputy_director_vet"]);

const routePermissions: Record<AppRouteKey, UserRole[]> = {
  dashboard: ["field_officer"],
  animals: [],
  farmers: [],
  locations: [],
  vaccinations: [],
  breeding: [],
  alerts: ["field_officer"],
  field_officers: ["field_officer"],
  employees: ["departmental_officer"],
  ai_insights: [],
  reports: ["field_officer"],
  schemes: ["field_officer"],
  profile: ["field_officer"],
};

const legacyRoleMap: Record<string, UserRole> = {
  admin: "admin",
  veterinary: "veterinary_doctor",
  veterinary_doctor: "veterinary_doctor",
  "veterinary doctor": "veterinary_doctor",
  field_officer: "field_officer",
  "field officer": "field_officer",
  data_entry: "field_officer",
  data_entry_operator: "field_officer",
  departmental_officer: "departmental_officer",
  "departmental officer": "departmental_officer",
  deputy_director_vet: "deputy_director_vet",
  "deputy director vet": "deputy_director_vet",
};

export const roleLabels = Object.fromEntries(ROLE_OPTIONS.map((item) => [item.value, item.label])) as Record<UserRole, string>;

export function hasFullAccessRole(role: UserRole | null | undefined): boolean {
  return !!role && fullAccessRoles.has(role);
}

export function getRoleOptionLabel(role: UserRole): string {
  return roleLabels[role];
}

export function normalizeRole(value: unknown): UserRole {
  const key = String(value || "").trim().toLowerCase();
  return legacyRoleMap[key] || "field_officer";
}

export function hasRouteAccess(role: UserRole, route: AppRouteKey): boolean {
  return fullAccessRoles.has(role) || routePermissions[route].includes(role);
}

export function getDefaultRouteForRole(role: UserRole): string {
  if (hasRouteAccess(role, "dashboard")) {
    return "/";
  }
  if (hasRouteAccess(role, "employees")) {
    return "/employees";
  }
  if (hasRouteAccess(role, "animals")) {
    return "/animals";
  }
  if (hasRouteAccess(role, "reports")) {
    return "/reports";
  }
  return "/profile";
}

export function matchesUserRegion(
  region: string,
  area: { district?: string; tehsil?: string; block?: string; gramPanchayat?: string; village?: string },
): boolean {
  const normalizedRegion = String(region || "").trim().toLowerCase();
  if (!normalizedRegion) {
    return true;
  }

  const regionTokens = normalizedRegion
    .split(/[\/,>|-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (!regionTokens.length) {
    return true;
  }

  const areaTokens = [area.district, area.tehsil, area.block, area.gramPanchayat, area.village]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  if (!areaTokens.length) {
    return false;
  }

  return regionTokens.some((token) => areaTokens.some((value) => value.includes(token) || token.includes(value)));
}

// Sample role mapping used by admin access management and backend checks.
export const SAMPLE_ROLE_MAPPING = {
  admin: ["Full access", "User management", "Data governance"],
  veterinary_doctor: ["Full access", "User management", "Reports"],
  field_officer: ["Field module", "Emergency reports", "Own reports/evidence"],
  departmental_officer: ["User management", "Reports overview"],
  deputy_director_vet: ["Full access", "User approvals"],
} as const;
