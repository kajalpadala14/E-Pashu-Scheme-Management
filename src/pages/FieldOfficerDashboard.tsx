import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  FileCheck2,
  MapPinned,
  Users,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  Target,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/useUser";
import { listInstitutes, listSchemeBeneficiaryRecords, listSchemeDataRecords } from "@/lib/dataService";
import { collectSchemeNames } from "@/lib/schemeAnalytics";
import {
  getUserDataScope,
  filterInstitutesByScope,
  filterSchemesByScope,
  filterBeneficiariesByScope,
  getScopeLabel,
} from "@/lib/data-scope";

function norm(v: string | undefined | null) {
  return String(v || "").trim().toLowerCase();
}

export default function FieldOfficerDashboard() {
  const navigate = useNavigate();
  const { user, roleLabel } = useUser();
  const scope = useMemo(() => getUserDataScope(user), [user]);

  const { data: rawInstitutes = [], isLoading: iL } = useQuery({ queryKey: ["institutes"], queryFn: listInstitutes, staleTime: 5 * 60 * 1000 });
  const { data: rawSchemes = [], isLoading: sL } = useQuery({ queryKey: ["schemeDataRecords"], queryFn: listSchemeDataRecords, staleTime: 5 * 60 * 1000 });
  const { data: rawBeneficiaries = [], isLoading: bL } = useQuery({ queryKey: ["schemeBeneficiaryRecords"], queryFn: listSchemeBeneficiaryRecords, staleTime: 5 * 60 * 1000 });

  const isLoading = iL || sL || bL;

  const institutes = useMemo(() => filterInstitutesByScope(rawInstitutes, scope), [rawInstitutes, scope]);
  const schemes = useMemo(() => filterSchemesByScope(rawSchemes, scope), [rawSchemes, scope]);
  const beneficiaries = useMemo(() => filterBeneficiariesByScope(rawBeneficiaries, scope), [rawBeneficiaries, scope]);
  const schemeNames = useMemo(() => collectSchemeNames(schemes, beneficiaries), [schemes, beneficiaries]);

  const totals = useMemo(() => {
    const totalTarget = schemes.reduce((s, r) => s + Number(r.target || 0), 0);
    const totalAchievement = schemes.reduce((s, r) => s + Number(r.distributedUnits || 0), 0);
    const coverage = totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0;
    const approved = beneficiaries.filter((b) => ["Approved", "Distributed", "Completed"].includes(b.status)).length;
    const pending = beneficiaries.filter((b) => ["Registered", "Verification Pending"].includes(b.status)).length;
    return {
      activeInstitutes: institutes.filter((i) => i.status === "Active").length,
      totalBeneficiaries: beneficiaries.length,
      totalTarget,
      totalAchievement,
      coverage,
      approved,
      pending,
      uniqueSchemes: schemeNames.length,
    };
  }, [institutes, schemes, beneficiaries, schemeNames]);

  // Top 5 institute performance cards
  const instituteRows = useMemo(() => {
    return institutes
      .filter((i) => i.status === "Active")
      .map((inst) => {
        const iSchemes = schemes.filter((r) => norm(r.instituteName) === norm(inst.instituteName) || norm(r.village) === norm(inst.instituteName));
        const iBens = beneficiaries.filter((b) => norm(b.village) === norm(inst.instituteName));
        const target = iSchemes.reduce((s, r) => s + Number(r.target || 0), 0);
        const achievement = iSchemes.reduce((s, r) => s + Number(r.distributedUnits || 0), 0);
        const progress = target > 0 ? Math.round((achievement / target) * 100) : 0;
        return { name: inst.instituteName, block: inst.block, target, achievement, progress, beneficiaries: iBens.length };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [institutes, schemes, beneficiaries]);

  // Recent beneficiaries — last 5
  const recentBeneficiaries = useMemo(() => {
    return [...beneficiaries]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [beneficiaries]);

  // Scheme-wise summary
  const schemeRows = useMemo(() => {
    return schemeNames.map((name) => {
      const recs = schemes.filter((r) => norm(r.schemeName) === norm(name));
      const bens = beneficiaries.filter((b) => norm(b.schemeName) === norm(name));
      const target = recs.reduce((s, r) => s + Number(r.target || 0), 0);
      const achievement = recs.reduce((s, r) => s + Number(r.distributedUnits || 0), 0);
      const progress = target > 0 ? Math.round((achievement / target) * 100) : 0;
      return { name, target, achievement, progress, beneficiaries: bens.length };
    }).sort((a, b) => b.progress - a.progress);
  }, [schemeNames, schemes, beneficiaries]);

  const scopeLabel = getScopeLabel(scope);
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  const statusColor = (s: string) => {
    if (["Distributed", "Completed", "Approved"].includes(s)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (s === "Verified") return "border-sky-200 bg-sky-50 text-sky-700";
    if (s === "Rejected") return "border-red-200 bg-red-50 text-red-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-1 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-5 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-100">{today}</p>
            <h1 className="mt-1 text-2xl font-bold">Namaste, {user?.name?.split(" ")[0] ?? "Officer"} 👋</h1>
            <p className="mt-0.5 text-sm text-teal-100">{roleLabel} &nbsp;·&nbsp; {scopeLabel}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
            <Button onClick={() => navigate("/beneficiaries")} size="sm" className="bg-white text-teal-700 hover:bg-teal-50">
              <Users className="mr-1.5 h-4 w-4" /> Manage Beneficiaries
            </Button>
            <Button onClick={() => navigate("/institutes")} size="sm" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Building2 className="mr-1.5 h-4 w-4" /> Institutes
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active Institutes" value={isLoading ? "…" : totals.activeInstitutes.toLocaleString("en-IN")} hint="In your assigned area" icon={Building2} tone="primary" />
          <StatCard label="Total Beneficiaries" value={isLoading ? "…" : totals.totalBeneficiaries.toLocaleString("en-IN")} hint={`${totals.approved} approved · ${totals.pending} pending`} icon={Users} tone="amber" />
          <StatCard label="Scheme Target" value={isLoading ? "…" : totals.totalTarget.toLocaleString("en-IN")} hint={`${totals.uniqueSchemes} active schemes`} icon={Target} tone="blue" />
          <StatCard label="Achievement" value={isLoading ? "…" : `${totals.coverage}%`} hint={`${totals.totalAchievement.toLocaleString("en-IN")} units distributed`} icon={TrendingUp} />
        </div>

        {/* ── Coverage progress bar ── */}
        {!isLoading && totals.totalTarget > 0 ? (
          <Card className="border-teal-100 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Overall Physical Coverage</span>
                <span className={`text-sm font-bold ${totals.coverage >= 75 ? "text-emerald-700" : totals.coverage >= 50 ? "text-amber-700" : "text-red-600"}`}>{totals.coverage}%</span>
              </div>
              <Progress value={totals.coverage} className="h-3 rounded-full bg-slate-100" />
              <p className="mt-1.5 text-xs text-muted-foreground">{totals.totalAchievement.toLocaleString("en-IN")} of {totals.totalTarget.toLocaleString("en-IN")} units distributed</p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">

          {/* ── Scheme-wise Progress ── */}
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Scheme-wise Progress</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {isLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
              ) : schemeRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No scheme data for {scopeLabel}.</p>
              ) : (
                schemeRows.map((row) => (
                  <div key={row.name} className="rounded-xl border border-border/60 bg-slate-50/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">{row.name}</p>
                      <span className={`shrink-0 text-xs font-bold ${row.progress >= 75 ? "text-emerald-700" : row.progress >= 50 ? "text-amber-700" : "text-red-600"}`}>{row.progress}%</span>
                    </div>
                    <Progress value={row.progress} className="mt-2 h-2 bg-slate-200" />
                    <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
                      <span>Target: {row.target.toLocaleString("en-IN")}</span>
                      <span>Done: {row.achievement.toLocaleString("en-IN")}</span>
                      <span>Beneficiaries: {row.beneficiaries}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Institute Performance ── */}
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Institute Performance</CardTitle>
              <MapPinned className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {isLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
              ) : instituteRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No active institutes for {scopeLabel}.</p>
              ) : (
                instituteRows.map((row) => (
                  <div key={row.name} className="flex items-center gap-3 rounded-xl border border-border/60 bg-slate-50/60 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-slate-800">{row.name}</p>
                        <span className={`ml-2 shrink-0 text-xs font-bold ${row.progress >= 75 ? "text-emerald-700" : row.progress >= 50 ? "text-amber-700" : "text-slate-500"}`}>{row.progress}%</span>
                      </div>
                      <Progress value={row.progress} className="mt-1.5 h-1.5 bg-slate-200" />
                      <p className="mt-1 text-xs text-muted-foreground">{row.block} &nbsp;·&nbsp; {row.beneficiaries} beneficiaries</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Recent Beneficiaries ── */}
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Recent Beneficiaries</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/beneficiaries")} className="h-8 gap-1 text-xs text-teal-700 hover:text-teal-800">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
            ) : recentBeneficiaries.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">No beneficiaries yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Start by adding a new beneficiary.</p>
                </div>
                <Button size="sm" onClick={() => navigate("/beneficiaries")} className="bg-teal-700 hover:bg-teal-800">
                  <Users className="mr-1.5 h-4 w-4" /> Add Beneficiary
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {recentBeneficiaries.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white">
                      {b.beneficiaryName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{b.beneficiaryName}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.schemeName} &nbsp;·&nbsp; {b.village}</p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-xs ${statusColor(b.status)}`}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick Actions ── */}
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => navigate("/beneficiaries")} className="group flex items-center gap-3 rounded-xl border border-teal-100 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-100"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-slate-800">Beneficiary Mgmt</p><p className="text-xs text-muted-foreground">Add, verify, distribute</p></div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-teal-700" />
          </button>
          <button type="button" onClick={() => navigate("/institutes")} className="group flex items-center gap-3 rounded-xl border border-teal-100 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"><Building2 className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-slate-800">Institutes</p><p className="text-xs text-muted-foreground">View institute status</p></div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-emerald-700" />
          </button>
          <button type="button" onClick={() => navigate("/reports")} className="group flex items-center gap-3 rounded-xl border border-teal-100 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 group-hover:bg-sky-100"><FileCheck2 className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-slate-800">Reports</p><p className="text-xs text-muted-foreground">Export & analytics</p></div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-sky-700" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
