import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getDashboardData, listInstitutes, listSchemeBeneficiaryRecords, listSchemeDataRecords, listUsers } from "./dataService";

function hasSession() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem("e-pashu-session-user");
    if (!raw) {
      return false;
    }

    const session = JSON.parse(raw) as { email?: string };
    return !!String(session.email || "").trim();
  } catch {
    return false;
  }
}

export default function Prefetcher() {
  const qc = useQueryClient();

  useEffect(() => {
    const opts = { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 };

    // Prioritize dashboard so first screen feels fast.
    void qc.prefetchQuery({ queryKey: ["dashboardData"], queryFn: getDashboardData, ...opts }).catch(() => {
      // ignore prefetch failures; UI will fallback to normal query
    });

    // Defer non-critical prefetches to avoid startup request burst.
    const timer = window.setTimeout(() => {
      void Promise.all([
        qc.prefetchQuery({ queryKey: ["institutes"], queryFn: listInstitutes, ...opts }),
        qc.prefetchQuery({ queryKey: ["schemeDataRecords"], queryFn: listSchemeDataRecords, ...opts }),
        qc.prefetchQuery({ queryKey: ["schemeBeneficiaryRecords"], queryFn: listSchemeBeneficiaryRecords, ...opts }),
        hasSession() ? qc.prefetchQuery({ queryKey: ["users"], queryFn: listUsers, ...opts }) : Promise.resolve(),
      ]).catch(() => {
        // ignore prefetch failures; UI will fallback to normal queries
      });
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [qc]);

  return null;
}
