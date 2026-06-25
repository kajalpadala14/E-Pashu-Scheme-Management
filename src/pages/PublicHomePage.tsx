import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Building2, FileText, Lock, Mail, MapPin, Phone, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { BlockPerformanceLeaderboard } from "@/components/BlockPerformanceLeaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/useUser";
import { getDefaultRouteForRole } from "@/lib/rbac";
import { DEFAULT_LANDING_PAGE_DATA, getLandingPageData } from "@/lib/dataService";
import { buildSchemeSummaryTotals, collectSchemeNames, linkSchemeRecords } from "@/lib/schemeAnalytics";
import type { DantewadaMapBlockMetric } from "@/lib/dantewadaDistrictMap";

const lockedModules = ["Scheme Management", "Beneficiary Management", "User Management", "Settings"];

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function matchesBlockName(value: string, blockName: string) {
  const normalized = normalizeToken(value);
  const aliases: Record<string, string[]> = {
    Dantewada: ["dantewada"],
    Geedam: ["geedam"],
    Kuwakonda: ["kuwakonda", "kuakonda"],
    Katekalyan: ["katekalyan", "katekalyan block"],
    Chhindgarh: ["chhindgarh", "chhindgarh block"],
  };

  return (aliases[blockName] || [blockName]).some((alias) => normalized === normalizeToken(alias));
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function progressToneClass(progress: number) {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 70) return "bg-amber-500";
  return "bg-rose-500";
}

export default function PublicHomePage() {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedBlockName, setSelectedBlockName] = useState("Dantewada");
  const [hoveredBlockName, setHoveredBlockName] = useState<string | null>(null);

  const { data: landingData, isFetching } = useQuery({
    queryKey: ["landingPageData"],
    queryFn: getLandingPageData,
    placeholderData: DEFAULT_LANDING_PAGE_DATA,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const schemeRecords = landingData?.schemeRecords || [];
  const beneficiaryRecords = landingData?.beneficiaryRecords || [];
  const institutes = landingData?.institutes || [];
  const locations = landingData?.locations || [];
  const portalSettings = landingData?.portalSettings;

  const linkedSchemeRecords = useMemo(() => linkSchemeRecords(schemeRecords, beneficiaryRecords), [beneficiaryRecords, schemeRecords]);
  const liveTotals = useMemo(() => buildSchemeSummaryTotals(schemeRecords, beneficiaryRecords, institutes, locations), [beneficiaryRecords, institutes, locations, schemeRecords]);
  const schemeNames = useMemo(() => {
    const names = collectSchemeNames(schemeRecords, beneficiaryRecords);
    return names.length ? names : ["Scheme Progress Summary"];
  }, [beneficiaryRecords, schemeRecords]);

  const schemeStats = useMemo(() => {
    const activeSchemes = liveTotals.totalSchemes;
    const targetUnits = liveTotals.target;
    const progress = targetUnits ? Math.round((liveTotals.distributedUnits / targetUnits) * 100) : 0;

    return [
      { label: "Active Schemes", value: String(activeSchemes).padStart(2, "0"), detail: "Live scheme rows" },
      { label: "Total Beneficiary", value: formatNumber(liveTotals.totalBeneficiaries), detail: "Linked from beneficiary rows" },
      { label: "Blocks Covered", value: String(liveTotals.activeBlocks).padStart(2, "0"), detail: "Block master sheet" },
      { label: "Progress", value: `${progress}%`, detail: `${formatNumber(liveTotals.approvedCases)} approved cases` },
    ];
  }, [liveTotals.activeBlocks, liveTotals.approvedCases, liveTotals.distributedUnits, liveTotals.target, liveTotals.totalBeneficiaries, liveTotals.totalSchemes]);

  const beneficiaryChartData = useMemo(() => {
    const totalBeneficiaries = liveTotals.totalBeneficiaries;
    const approved = beneficiaryRecords.filter((item) => item.dateOfApproval).length;
    const achievement = beneficiaryRecords.filter((item) => item.dateOfDistribution).length;
    const pending = Math.max(totalBeneficiaries - achievement, 0);

    return [
      { name: "Approved", value: approved, color: "#047857" },
      { name: "Achievement", value: achievement, color: "#0f766e" },
      { name: "Pending", value: pending, color: "#f59e0b" },
    ];
  }, [beneficiaryRecords, liveTotals.totalBeneficiaries]);

  const schemeFlowCards = useMemo(() => {
    const grouped = new Map<string, { schemeName: string; target: number; approvedCases: number; distributedUnits: number; pendingCases: number }>();

    for (const record of linkedSchemeRecords) {
      const schemeName = record.schemeName.trim();
      if (!schemeName) continue;

      const key = normalizeToken(schemeName);
      const existing = grouped.get(key) ?? { schemeName, target: 0, approvedCases: 0, distributedUnits: 0, pendingCases: 0 };
      existing.target += record.target;
      existing.approvedCases += record.approvedCases;
      existing.distributedUnits += record.distributedUnits;
      existing.pendingCases += record.pendingCases;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values())
      .filter((record) => record.target > 0 || record.approvedCases > 0 || record.distributedUnits > 0 || record.pendingCases > 0)
      .map((record) => ({ ...record, progress: record.target ? Math.round((record.distributedUnits / record.target) * 100) : 0 }))
      .sort((left, right) => right.progress - left.progress || right.target - left.target);
  }, [linkedSchemeRecords]);

  const blockMetrics = useMemo(() => {
    const recordBlocks = [
      ...schemeRecords.map((item) => item.block),
    ];
    const blockNames = Array.from(new Set(recordBlocks.map((value) => value.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));

    return blockNames.map((blockName) => {
      const blockSchemeRecords = linkedSchemeRecords.filter((record) => matchesBlockName(record.block, blockName));
      const blockBeneficiaryRecords = beneficiaryRecords.filter((record) => matchesBlockName(record.block, blockName));
      const targetUnits = blockSchemeRecords.reduce((sum, record) => sum + record.target, 0);
      const approvedCases = blockSchemeRecords.reduce((sum, record) => sum + record.approvedCases, 0);
      const distributedUnits = blockSchemeRecords.reduce((sum, record) => sum + record.distributedUnits, 0);
      const pendingCases = blockSchemeRecords.reduce((sum, record) => sum + record.pendingCases, 0) || Math.max(targetUnits - distributedUnits, 0);
      const progress = targetUnits ? Math.round((distributedUnits / targetUnits) * 100) : 0;

      return {
        blockName,
        targetUnits,
        approvedCases,
        distributedUnits,
        pendingCases,
        progress,
        activeSchemes: new Set(blockSchemeRecords.map((record) => record.schemeName).filter(Boolean)).size,
        villageCount: new Set([...blockSchemeRecords.map((record) => record.instituteName || record.village), ...blockBeneficiaryRecords.map((record) => record.village)].map((value) => value.trim()).filter(Boolean)).size,
        beneficiaryCount: blockBeneficiaryRecords.length,
        womenBeneficiaries: blockBeneficiaryRecords.filter((record) => String(record.womenBeneficiary).toLowerCase() === "yes").length,
        fraBeneficiaries: blockBeneficiaryRecords.filter((record) => String(record.fraBeneficiary).toLowerCase() === "yes").length,
        pvtgBeneficiaries: blockBeneficiaryRecords.filter((record) => String(record.pvtg).toLowerCase() === "yes").length,
      } satisfies DantewadaMapBlockMetric;
    });
  }, [beneficiaryRecords, linkedSchemeRecords, schemeRecords]);

  const selectedReportSummary = useMemo(() => {
    if (!selectedReport) return null;

    const blocksCovered = new Set(blockMetrics.map((item) => item.blockName)).size;
    const targetUnits = liveTotals.target || 0;
    const achievedUnits = liveTotals.distributedUnits || 0;
    const approvedCases = liveTotals.approvedCases || 0;

    const reportMap: Record<string, { title: string; description: string; metrics: Array<{ label: string; value: string }> }> = {
      [portalSettings?.reportOne || "Annual Livestock Scheme Progress Summary"]: {
        title: portalSettings?.reportOne || "Annual Livestock Scheme Progress Summary",
        description: "Live scheme progress summary based on the current scheme data sheet.",
        metrics: [
          { label: "Active Schemes", value: String(liveTotals.totalSchemes).padStart(2, "0") },
          { label: "Target Units", value: formatNumber(targetUnits) },
          { label: "Achieved Units", value: formatNumber(achievedUnits) },
          { label: "Approved Cases", value: formatNumber(approvedCases) },
        ],
      },
      [portalSettings?.reportTwo || "Block-wise Beneficiary Coverage Report"]: {
        title: portalSettings?.reportTwo || "Block-wise Beneficiary Coverage Report",
        description: "Coverage summary across public blocks using beneficiary and location data.",
        metrics: [
          { label: "Blocks Covered", value: String(blocksCovered).padStart(2, "0") },
          { label: "Linked Beneficiaries", value: formatNumber(liveTotals.totalBeneficiaries) },
          { label: "Active Institutes", value: formatNumber(liveTotals.activeInstitutes) },
          { label: "Pending Cases", value: formatNumber(liveTotals.pendingCases) },
        ],
      },
      [portalSettings?.reportThree || "Physical and Financial Achievement Abstract"]: {
        title: portalSettings?.reportThree || "Physical and Financial Achievement Abstract",
        description: "Combined physical progress overview for public monitoring.",
        metrics: [
          { label: "Physical Progress", value: `${targetUnits ? Math.round((achievedUnits / targetUnits) * 100) : 0}%` },
          { label: "Achieved Units", value: formatNumber(achievedUnits) },
          { label: "Target Units", value: formatNumber(targetUnits) },
          { label: "Scheme Rows", value: formatNumber(schemeRecords.length) },
        ],
      },
    };

    return reportMap[selectedReport] ?? {
      title: selectedReport,
      description: "Public preview generated from the live dashboard data currently loaded on this page.",
      metrics: [],
    };
  }, [beneficiaryRecords, blockMetrics, liveTotals.activeInstitutes, liveTotals.approvedCases, liveTotals.distributedUnits, liveTotals.pendingCases, liveTotals.target, liveTotals.totalBeneficiaries, liveTotals.totalSchemes, portalSettings?.reportOne, portalSettings?.reportThree, portalSettings?.reportTwo, schemeRecords.length, selectedReport]);

  const schemeChartRows = useMemo(() => schemeFlowCards.slice(0, 6).map((scheme) => ({ name: scheme.schemeName, target: scheme.target, achievement: scheme.distributedUnits, progress: scheme.progress })), [schemeFlowCards]);

  const landingTitle = portalSettings?.heroTitle || "Public portal settings are empty";
  const landingSubtitle = portalSettings?.heroSubtitle || "Populate the PortalSettings sheet to control this content from Google Sheets.";
  const overviewLabel = portalSettings?.overviewLabel || "Dashboard Overview";
  const publicReports = [portalSettings?.reportOne, portalSettings?.reportTwo, portalSettings?.reportThree].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_34%),linear-gradient(180deg,_#f8fffb_0%,_#edf7f0_100%)]">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-emerald-700 p-1 shadow-sm">
              <img src="./dantewada-district.png" alt="Department logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Government of Chhattisgarh</p>
              <h1 className="text-base font-bold text-slate-900 sm:text-xl">Department of Animal Husbandry and Veterinary Services</h1>
            </div>
          </div>
          {user ? (
            <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
              <Link to={getDefaultRouteForRole(user.role)}>Open Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-800 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              {isFetching ? "Updating public dashboard" : "Public dashboard view"}
            </div>
            <div>
              <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{landingTitle}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{landingSubtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Button asChild size="lg" className="bg-teal-700 hover:bg-teal-800">
                  <Link to={getDefaultRouteForRole(user.role)}>Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-teal-700 hover:bg-teal-800">
                  <Link to="/login">Login to Management Portal</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" type="button" onClick={() => document.getElementById("public-reports")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                View Public Reports
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-emerald-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />{overviewLabel}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              {schemeStats.map((item) => (
                <div key={item.label} className="rounded-2xl border bg-emerald-50/50 p-4">
                  <p className="text-sm text-slate-600">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-800">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <Card className="overflow-hidden border-emerald-100 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Scheme Flow Timeline</CardTitle>
                  <p className="mt-1 text-sm text-emerald-50/90">Live target, approval, distribution, and progress from the scheme sheet.</p>
                </div>
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">Auto scrolling</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {schemeFlowCards.length ? (
                <div className="marquee">
                  <div className="marquee-track">
                    {[schemeFlowCards, schemeFlowCards].map((group, groupIndex) => (
                      <div key={groupIndex} className="marquee-group" aria-hidden={groupIndex === 1}>
                        {group.map((scheme) => (
                          <article key={`${scheme.schemeName}-${groupIndex}`} className="marquee-card">
                            <div className="h-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">Active Scheme</p>
                                  <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-900">{scheme.schemeName}</h3>
                                </div>
                                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{scheme.progress}%</div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                                <div className="rounded-2xl bg-slate-50 px-3 py-2"><p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Target</p><p className="mt-1 text-base font-semibold text-slate-900">{formatNumber(scheme.target)}</p></div>
                                <div className="rounded-2xl bg-slate-50 px-3 py-2"><p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Approved</p><p className="mt-1 text-base font-semibold text-slate-900">{formatNumber(scheme.approvedCases)}</p></div>
                                <div className="rounded-2xl bg-slate-50 px-3 py-2"><p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Achievement</p><p className="mt-1 text-base font-semibold text-slate-900">{formatNumber(scheme.distributedUnits)}</p></div>
                                <div className="rounded-2xl bg-slate-50 px-3 py-2"><p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Progress</p><p className="mt-1 text-base font-semibold text-slate-900">{scheme.progress}%</p></div>
                              </div>

                              <div className="mt-4">
                                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                  <span>Target → Approved → Achievement</span>
                                  <span>{formatNumber(scheme.distributedUnits)} / {formatNumber(scheme.target)}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                  <div className={`h-full rounded-full ${progressToneClass(scheme.progress)}`} style={{ width: `${Math.min(scheme.progress, 100)}%` }} />
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-sm text-slate-500">No active scheme records are available yet.</div>
              )}
            </CardContent>
          </Card>

          <BlockPerformanceLeaderboard
            blockMetrics={blockMetrics}
            selectedBlockName={selectedBlockName}
            hoveredBlockName={hoveredBlockName}
            isMobile={isMobile}
            onHoverBlock={setHoveredBlockName}
            onSelectBlock={setSelectedBlockName}
          />

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden border-emerald-100 shadow-lg">
              <CardHeader className="border-b bg-slate-50/80">
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-teal-700" />Beneficiary Statistics</CardTitle>
                <p className="text-sm text-slate-500">Pie chart plus live category cards from the beneficiary sheet.</p>
              </CardHeader>
              <CardContent className="grid gap-5 p-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border bg-white p-4 shadow-sm">
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={beneficiaryChartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
                          {beneficiaryChartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                  {[
                    { name: "Total Beneficiaries", value: liveTotals.totalBeneficiaries, color: "#14532d" },
                    { name: "Women Beneficiaries", value: beneficiaryRecords.filter((item) => String(item.womenBeneficiary).toLowerCase() === "yes").length, color: "#0f766e" },
                    { name: "PVTG Beneficiaries", value: beneficiaryRecords.filter((item) => String(item.pvtg).toLowerCase() === "yes").length, color: "#166534" },
                    { name: "FRA Beneficiaries", value: beneficiaryRecords.filter((item) => String(item.fraBeneficiary).toLowerCase() === "yes").length, color: "#854d0e" },
                  ].map((item) => (
                    <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.name}</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(item.value)}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: "100%", backgroundColor: item.color }} /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-emerald-100 shadow-lg">
              <CardHeader className="border-b bg-slate-50/80">
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-teal-700" />Scheme Snapshot Graph</CardTitle>
                <p className="text-sm text-slate-500">Counts for the top scheme rows, using the same linked totals as the cards.</p>
              </CardHeader>
              <CardContent className="h-[420px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schemeFlowCards.slice(0, 6).map((scheme) => ({ name: scheme.schemeName, target: scheme.target, achievement: scheme.distributedUnits }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={72} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Bar dataKey="target" fill="#a7f3d0" name="Target" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="achievement" fill="#0f766e" name="Achievement" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card id="public-reports">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Public Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(publicReports.length ? publicReports : schemeNames).map((report) => (
                <div key={report} className="flex items-center justify-between rounded-xl border bg-white p-3">
                  <span className="text-sm font-medium">{report}</span>
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedReport(report)}>View</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protected Modules</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {lockedModules.map((module) => (
                <div key={module} className="relative overflow-hidden rounded-2xl border bg-slate-50 p-5">
                  <div className="pointer-events-none absolute inset-0 bg-white/45 backdrop-blur-[2px]" />
                  <div className="relative flex items-center gap-3">
                    <Lock className="h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="font-semibold">{module}</p>
                      <p className="text-xs text-muted-foreground">Login required</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> About Department</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-slate-600">
              The department manages livestock development, beneficiary-oriented schemes, field implementation, and district-level monitoring. The portal supports transparent progress visibility for citizens while keeping operational data entry secured for authorized officials.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-700" /> District Veterinary Office, Dantewada</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-700" /> 07856-000000</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-700" /> support@epashu.gov.in</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-700" /> Public facilitation hours: 10:30 AM to 5:30 PM</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={!!selectedReport} onOpenChange={(open) => { if (!open) setSelectedReport(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReportSummary?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">{selectedReportSummary?.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedReportSummary?.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" type="button" onClick={() => setSelectedReport(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
