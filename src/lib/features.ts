function parseFlag(value: unknown, defaultValue: boolean): boolean {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }
  return defaultValue;
}

export const FEATURES = {
  ENABLE_DASHBOARD: parseFlag(import.meta.env.VITE_ENABLE_DASHBOARD, true),
  ENABLE_LIVE_MONITORING: parseFlag(import.meta.env.VITE_ENABLE_LIVE_MONITORING, true),
} as const;
