export type UserRole = "admin" | "veterinary_doctor" | "field_officer" | "data_entry_operator";

export type AppRouteKey =
  | "dashboard"
  | "animals"
  | "farmers"
  | "vaccinations"
  | "breeding"
  | "alerts"
  | "field_officers"
  | "ai_insights"
  | "reports"
  | "profile";

const routePermissions: Record<AppRouteKey, UserRole[]> = {
  dashboard: ["admin", "veterinary_doctor", "field_officer"],
  animals: ["admin", "veterinary_doctor"],
  farmers: ["admin", "veterinary_doctor"],
  vaccinations: ["admin", "veterinary_doctor"],
  breeding: ["admin", "veterinary_doctor"],
  alerts: ["admin", "veterinary_doctor", "field_officer"],
  field_officers: ["admin", "veterinary_doctor", "field_officer"],
  ai_insights: ["admin", "veterinary_doctor"],
  reports: ["admin", "veterinary_doctor", "field_officer"],
  profile: ["admin", "veterinary_doctor", "field_officer"],
};

const legacyRoleMap: Record<string, UserRole> = {
  admin: "admin",
  veterinary: "veterinary_doctor",
  veterinary_doctor: "veterinary_doctor",
  field_officer: "field_officer",
  data_entry: "field_officer",
  data_entry_operator: "field_officer",
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  veterinary_doctor: "Veterinary Doctor",
  field_officer: "Field Officer",
  data_entry_operator: "Field Officer",
};

export function normalizeRole(value: unknown): UserRole {
  const key = String(value || "").trim().toLowerCase();
  return legacyRoleMap[key] || "field_officer";
}

export function hasRouteAccess(role: UserRole, route: AppRouteKey): boolean {
  return routePermissions[route].includes(role);
}

export function getDefaultRouteForRole(role: UserRole): string {
  if (hasRouteAccess(role, "dashboard")) {
    return "/";
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
  admin: ["All modules", "User management", "Data governance"],
  veterinary_doctor: ["Animals", "Vaccinations", "Breeding", "Reports (assigned region)"],
  field_officer: ["Field module", "Emergency reports", "Own reports/evidence"],
  data_entry_operator: [],
} as const;
