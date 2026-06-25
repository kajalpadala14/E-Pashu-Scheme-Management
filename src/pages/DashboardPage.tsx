import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, FileCheck2, Layers3, MapPinned } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/useUser";
import { listInstitutes, listLocations, listSchemeBeneficiaryRecords, listSchemeDataRecords } from "@/lib/dataService";
import { buildSchemeSummaryTotals } from "@/lib/schemeAnalytics";

export default function DashboardPage() {
  const { roleLabel, user } = useUser();
  const { data: schemeRecords = [], error: schemeError, isLoading: schemesLoading } = useQuery({
    queryKey: ["schemeDataRecords"],
    queryFn: listSchemeDataRecords,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: beneficiaryRecords = [], error: beneficiaryError, isLoading: beneficiariesLoading } = useQuery({
    queryKey: ["schemeBeneficiaryRecords"],
    queryFn: listSchemeBeneficiaryRecords,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: institutes = [], error: instituteError, isLoading: institutesLoading } = useQuery({
    queryKey: ["institutes"],
    queryFn: listInstitutes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: locations = [], error: locationError, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: listLocations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const error = schemeError || beneficiaryError || instituteError || locationError;
  const isLoading = schemesLoading || beneficiariesLoading || institutesLoading || locationsLoading;
  const totals = useMemo(() => {
    const schemeTotals = buildSchemeSummaryTotals(schemeRecords, beneficiaryRecords, institutes, locations);

    return {
      schemeRecords: schemeTotals.totalSchemeRecords,
      totalAchievement: schemeTotals.distributedUnits,
      activeBlocks: schemeTotals.activeBlocks,
      activeInstitutes: schemeTotals.activeInstitutes,
      beneficiaries: schemeTotals.totalBeneficiaries,
      schemes: schemeTotals.totalSchemes,
      linkedRecords: schemeTotals.linkedRecords,
    };
  }, [beneficiaryRecords, institutes, locations, schemeRecords]);

  const summaryChartData = useMemo(() => ([
    { name: "Scheme Records", value: totals.schemeRecords },
    { name: "Total Beneficiary", value: totals.beneficiaries },
    { name: "Active Blocks", value: totals.activeBlocks },
    { name: "Active Institutes", value: totals.activeInstitutes },
    { name: "Beneficiaries", value: totals.beneficiaries },
  ]), [totals.activeBlocks, totals.activeInstitutes, totals.beneficiaries, totals.schemeRecords]);

  const schemeChartData = useMemo(() => totals.linkedRecords
    .slice()
    .sort((left, right) => right.distributedUnits - left.distributedUnits || right.target - left.target)
    .slice(0, 6)
    .map((record) => ({
      name: record.schemeName,
      target: record.target,
      achievement: record.distributedUnits,
      progress: record.physicalProgressPercentage,
    })), [totals.linkedRecords]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Management Dashboard" description={`Secure portal access for ${roleLabel}${user?.region ? ` - ${user.region}` : ""}.`} />
        {error ? (
          <Card className="border-red-200">
            <CardContent className="p-4 text-sm text-red-700">Unable to load live dashboard data: {error instanceof Error ? error.message : "Unexpected error"}</CardContent>
          </Card>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Scheme Records" value={isLoading ? "…" : totals.schemeRecords.toLocaleString("en-IN")} hint="Live scheme sheet rows" icon={Layers3} />
          <StatCard label="Total Beneficiary" value={isLoading ? "…" : totals.beneficiaries.toLocaleString("en-IN")} hint="Linked scheme distribution total" icon={FileCheck2} tone="amber" />
          <StatCard label="Active Blocks" value={isLoading ? "…" : totals.activeBlocks.toLocaleString("en-IN")} hint="Blocks with linked records" icon={MapPinned} tone="blue" />
          <StatCard label="Active Institutes" value={isLoading ? "…" : totals.activeInstitutes.toLocaleString("en-IN")} hint="Institutes participating now" icon={Building2} tone="primary" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Summary Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheme Progress Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schemeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="target" fill="#a7f3d0" name="Target" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="achievement" fill="#0f766e" name="Achievement" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
