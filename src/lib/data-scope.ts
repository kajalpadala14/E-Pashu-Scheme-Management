import type { SessionUser } from "@/contexts/userSession";
import type { InstituteRecord, SchemeBeneficiaryRecord, SchemeDataRecord } from "./types";

/**
 * Data Scope Types
 */
export type DataScope = {
  type: "district" | "block" | "institute";
  block?: string;
  institute?: string;
};

/**
 * Parse user region string into structured scope
 * 
 * Examples:
 * - "Dantewada" → { type: "block", block: "Dantewada" }
 * - "Dantewada / VH Dantewada" → { type: "institute", block: "Dantewada", institute: "VH Dantewada" }
 * - "" or null → { type: "district" }
 */
export function parseRegion(region: string | undefined | null): { block: string; institute: string } {
  const parts = String(region || "")
    .split("/")
    .map((p) => p.trim());
  return {
    block: parts[0] || "",
    institute: parts[1] || "",
  };
}

/**
 * Get user's data access scope based on role and region
 */
export function getUserDataScope(user: SessionUser | null): DataScope {
  if (!user) {
    return { type: "district" };
  }

  // Admin, district officer, departmental officer, deputy director — full district access
  if (["admin", "district_officer", "departmental_officer", "deputy_director_vet"].includes(user.role)) {
    return { type: "district" };
  }

  const { block, institute } = parseRegion(user.region);

  // Field officer or veterinary doctor with institute assignment
  if (institute && ["field_officer", "veterinary_doctor"].includes(user.role)) {
    return { type: "institute", block, institute };
  }

  // Block officer, data entry operator, or field/vet without institute — block level
  if (block) {
    return { type: "block", block };
  }

  // Fallback: district level (shouldn't happen with proper setup)
  return { type: "district" };
}

/**
 * Normalize string for case-insensitive comparison
 */
function norm(value: string | undefined | null): string {
  return String(value || "").trim().toLowerCase();
}

/**
 * Check if two values match (case-insensitive)
 */
function matches(a: string | undefined | null, b: string | undefined | null): boolean {
  return norm(a) === norm(b);
}

/**
 * Filter institutes by user scope
 */
export function filterInstitutesByScope(
  institutes: InstituteRecord[],
  scope: DataScope
): InstituteRecord[] {
  if (scope.type === "district") {
    return institutes;
  }

  if (scope.type === "institute" && scope.institute) {
    return institutes.filter((i) => matches(i.instituteName, scope.institute));
  }

  if (scope.type === "block" && scope.block) {
    return institutes.filter((i) => matches(i.block, scope.block));
  }

  return institutes;
}

/**
 * Filter beneficiaries by user scope
 */
export function filterBeneficiariesByScope(
  beneficiaries: SchemeBeneficiaryRecord[],
  scope: DataScope
): SchemeBeneficiaryRecord[] {
  if (scope.type === "district") {
    return beneficiaries;
  }

  if (scope.type === "institute" && scope.institute) {
    return beneficiaries.filter((b) => matches(b.village, scope.institute));
  }

  if (scope.type === "block" && scope.block) {
    return beneficiaries.filter((b) => matches(b.block, scope.block));
  }

  return beneficiaries;
}

/**
 * Filter scheme records by user scope
 */
export function filterSchemesByScope(
  schemes: SchemeDataRecord[],
  scope: DataScope
): SchemeDataRecord[] {
  if (scope.type === "district") {
    return schemes;
  }

  if (scope.type === "institute" && scope.institute) {
    return schemes.filter(
      (s) =>
        matches(s.instituteName, scope.institute) ||
        matches(s.village, scope.institute)
    );
  }

  if (scope.type === "block" && scope.block) {
    return schemes.filter((s) => matches(s.block, scope.block));
  }

  return schemes;
}

/**
 * Combined dashboard data filter — applies scope to all data types at once
 */
export function filterDashboardDataByScope<T extends {
  institutes?: InstituteRecord[];
  schemeRecords?: SchemeDataRecord[];
  beneficiaryRecords?: SchemeBeneficiaryRecord[];
}>(data: T, scope: DataScope): T {
  return {
    ...data,
    institutes: data.institutes ? filterInstitutesByScope(data.institutes, scope) : undefined,
    schemeRecords: data.schemeRecords ? filterSchemesByScope(data.schemeRecords, scope) : undefined,
    beneficiaryRecords: data.beneficiaryRecords ? filterBeneficiariesByScope(data.beneficiaryRecords, scope) : undefined,
  } as T;
}

/**
 * Check if user can see a specific block
 */
export function canAccessBlock(scope: DataScope, blockName: string): boolean {
  if (scope.type === "district") return true;
  if (scope.type === "block" || scope.type === "institute") {
    return matches(scope.block, blockName);
  }
  return false;
}

/**
 * Check if user can see a specific institute
 */
export function canAccessInstitute(scope: DataScope, instituteName: string, block?: string): boolean {
  if (scope.type === "district") return true;
  
  if (scope.type === "institute") {
    return matches(scope.institute, instituteName);
  }
  
  if (scope.type === "block" && block) {
    return matches(scope.block, block);
  }
  
  return false;
}

/**
 * Get human-readable scope description
 */
export function getScopeLabel(scope: DataScope): string {
  if (scope.type === "district") return "Full District";
  if (scope.type === "institute" && scope.institute) {
    return scope.block ? `${scope.institute} (${scope.block})` : scope.institute;
  }
  if (scope.type === "block" && scope.block) return scope.block;
  return "Unknown Scope";
}

/**
 * Centralized block ownership check.
 *
 * Replaces all local `matchesBlock(region, targetBlock)` helpers scattered across
 * pages. For a scoped user (block or institute level) this returns true only when
 * the target block belongs to the user's assigned block. District-level users
 * always match.
 *
 * @param scope  - The DataScope derived from the current user via getUserDataScope()
 * @param targetBlock - The block field of the record being checked
 */
export function matchesBlockScope(scope: DataScope, targetBlock: string): boolean {
  if (scope.type === "district") return true;
  const ownBlock = norm(scope.block);
  const other = norm(targetBlock);
  return !!ownBlock && !!other && (ownBlock.includes(other) || other.includes(ownBlock));
}

/**
 * Centralized institute ownership check.
 *
 * Returns true when the user's scope covers the given institute name.
 * District and block users pass block-level check. Institute-scoped users
 * must match exactly.
 */
export function matchesInstituteScope(scope: DataScope, instituteName: string, block?: string): boolean {
  if (scope.type === "district") return true;

  if (scope.type === "institute") {
    return matches(scope.institute, instituteName);
  }

  // block scope — match on block if provided, otherwise allow
  if (scope.type === "block" && scope.block) {
    if (block) return matchesBlockScope(scope, block);
    return true;
  }

  return false;
}

/**
 * Check if a record belongs to the user's write scope.
 * Used for canEdit / canAdd / bulk-upload permission guards.
 *
 * @param scope - The current user's DataScope
 * @param recordBlock - The block field on the record
 * @param recordInstitute - The institute/village field on the record (optional)
 */
export function isWithinWriteScope(
  scope: DataScope,
  recordBlock: string,
  recordInstitute?: string,
): boolean {
  if (scope.type === "district") return true;

  if (!matchesBlockScope(scope, recordBlock)) return false;

  if (scope.type === "institute" && scope.institute && recordInstitute) {
    return matches(scope.institute, recordInstitute);
  }

  return true;
}
