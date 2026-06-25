import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { SchemeBeneficiaryManagement } from "@/components/SchemeBeneficiaryManagement";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/useUser";
import { listSchemeBeneficiaryRecords, listSchemeDataRecords } from "@/lib/dataService";
import { collectSchemeNames } from "@/lib/schemeAnalytics";
import type { SchemeBeneficiaryRecord } from "@/lib/types";

export default function BeneficiariesPage() {
  const { user } = useUser();
  const { data: records = [], error, isLoading } = useQuery({
    queryKey: ["schemeBeneficiaryRecords"],
    queryFn: listSchemeBeneficiaryRecords,
    initialData: [] as SchemeBeneficiaryRecord[],
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: schemeRecords = [] } = useQuery({
    queryKey: ["schemeDataRecords"],
    queryFn: listSchemeDataRecords,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const beneficiarySchemes = useMemo(() => collectSchemeNames(schemeRecords, records), [records, schemeRecords]);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Management</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-teal-700">Beneficiary Management</span>
        </div>

        <PageHeader
          title="Beneficiary Management"
          description="Manage registration, verification, approval, scheme allocation, distribution, and reports for Dantewada Pashudhan schemes."
        />

        {error ? (
          <Card className="border-red-200">
            <CardContent className="p-4 text-sm text-red-700">Unable to load beneficiary data: {error instanceof Error ? error.message : "Unexpected error"}</CardContent>
          </Card>
        ) : null}

        <SchemeBeneficiaryManagement records={records} schemes={beneficiarySchemes} user={user} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
