import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownUp, BarChart3, Building2, CalendarDays, ChevronLeft, ChevronRight, Download, Eye, FileSpreadsheet, FileText, Filter, IndianRupee, KeyRound, Landmark, Layers3, MapPinned, PieChart, Pencil, Plus, RefreshCw, RotateCcw, Search, ShieldCheck, Trash2, Upload, UserCheck, UserPlus, Users, UserX, Wifi } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/useUser";
import { getDashboardData, getPortalSettings, listInstitutes, listLocations, listSchemeBeneficiaryRecords, listSchemeDataRecords, listUsers, resetUserPassword, deleteUserByEmail, upsertPortalSettings, upsertUser } from "@/lib/dataService";
import { safeSelectOptions, safeSelectValue } from "@/lib/selectOptions";
import type { InstituteRecord, LocationRecord, PortalSettingsRecord, SchemeBeneficiaryRecord, SchemeDataRecord, UserDirectoryRecord } from "@/lib/types";
import { ROLE_OPTIONS, getRoleOptionLabel, type UserRole } from "@/lib/rbac";

type ModuleType = "blocks" | "institutes" | "reports" | "users" | "settings";

const moduleCopy: Record<ModuleType, { title: string; description: string; records: string[] }> = {
  blocks: {
    title: "Block Management",
    description: "Manage assigned block master data, officer ownership, and block-level scheme coverage.",
    records: ["Dantewada", "Geedam", "Kate Kalyan", "Kuwakonda"],
  },
  institutes: {
    title: "Institute Management",
    description: "Maintain institute master records for scheme allocation, block filters, and reporting.",
    records: ["VH Dantewada", "VH Geedam", "VH Kuakonda", "VH Katekalyan"],
  },
  reports: {
    title: "Reports & Analytics",
    description: "Generate public and administrative reports with Excel/PDF exports and analytics filters.",
    records: ["Scheme Progress Report", "Beneficiary Verification Report", "Financial Abstract", "Block Coverage Report"],
  },
  users: {
    title: "User Management",
    description: "Create user access, assign roles, manage session security, and deactivate accounts.",
    records: ["Admin", "District Officer", "Block Officer", "Data Entry Operator"],
  },
  settings: {
    title: "Settings",
    description: "Configure department profile, session policy, security controls, and portal preferences.",
    records: ["JWT Session Policy", "Auto Logout", "Theme", "Department Contact"],
  },
};

export default function ManagementModulePage({ type }: { type: ModuleType }) {
  const { roleLabel } = useUser();
  const copy = moduleCopy[type];

  if (type === "blocks") {
    return <BlockManagementPanel />;
  }

  if (type === "institutes") {
    return <InstituteManagementPanel />;
  }

  if (type === "reports") {
    return <ReportsAnalyticsPanel />;
  }

  if (type === "users") {
    return <UserManagementPanel />;
  }

  if (type === "settings") {
    return <SettingsPanel />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={copy.title} description={copy.description}>
          <div className="grid gap-2 sm:flex">
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Documents</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Add New</Button>
          </div>
        </PageHeader>

        <Card className="border-teal-100">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Current access: <span className="font-semibold text-foreground">{roleLabel}</span></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> PDF</Button>
              <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Excel</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="h-11 pl-9" placeholder={`Search ${copy.title.toLowerCase()}...`} />
              </div>
              <Button variant="outline" className="h-11"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {copy.records.map((record) => (
                    <TableRow key={record}>
                      <TableCell className="font-medium">{record}</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell>{roleLabel}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

type BlockRecord = {
  id: string;
  name: string;
  officer: string;
  tehsil: string;
  institutes: number;
  schemes: number;
  gramPanchayats: number;
  beneficiaries: number;
  target: number;
  achievement: number;
  progress: number;
  livestock: number;
  status: "Active" | "Review";
  updatedAt: string;
};

const defaultOperationalBlocks = ["Dantewada", "Geedam", "Kuakonda", "Katekalyan"];

function normalizeTextKey(value: string) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function canonicalBlockName(value: string) {
  const raw = String(value || "").trim();
  const key = normalizeTextKey(raw);
  if (key === "dantewada") return "Dantewada";
  if (key === "geedam") return "Geedam";
  if (key === "kuakonda" || key === "kuwakonda") return "Kuakonda";
  if (key === "katekalyan" || key === "katekalyanblock") return "Katekalyan";
  return raw;
}

function blockKey(value: string) {
  return normalizeTextKey(canonicalBlockName(value));
}

function instituteKey(value: string) {
  return normalizeTextKey(value);
}

function sameBlock(left: string, right: string) {
  return !!blockKey(left) && blockKey(left) === blockKey(right);
}

function sameInstitute(left: string, right: string) {
  return !!instituteKey(left) && instituteKey(left) === instituteKey(right);
}

function getRecordInstituteName(record: Pick<SchemeDataRecord, "instituteName" | "village"> | Pick<SchemeBeneficiaryRecord, "village">) {
  return String("instituteName" in record ? record.instituteName || record.village : record.village || "").trim();
}

function deriveInstitutesFromOperationalData(
  institutes: InstituteRecord[],
  schemeRecords: SchemeDataRecord[],
  beneficiaryRecords: SchemeBeneficiaryRecord[],
): InstituteRecord[] {
  const byKey = new Map<string, InstituteRecord>();
  const now = new Date().toISOString();

  institutes.forEach((item) => {
    const name = item.instituteName.trim();
    const block = canonicalBlockName(item.block);
    if (!name || !block) return;
    byKey.set(`${blockKey(block)}|${instituteKey(name)}`, { ...item, block });
  });

  const addDerived = (name: string, block: string, source: string) => {
    const instituteName = String(name || "").trim();
    const blockName = canonicalBlockName(block);
    if (!instituteName || !blockName) return;
    const key = `${blockKey(blockName)}|${instituteKey(instituteName)}`;
    if (byKey.has(key)) return;
    byKey.set(key, {
      id: `DER-${blockName}-${instituteName}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
      instituteName,
      block: blockName,
      instituteType: source,
      status: "Active",
      createdAt: now,
      updatedAt: now,
      createdBy: "derived",
    });
  };

  schemeRecords.forEach((record) => addDerived(getRecordInstituteName(record), record.block, "Derived from Scheme"));
  beneficiaryRecords.forEach((record) => addDerived(record.village, record.block, "Derived from Beneficiary"));

  return Array.from(byKey.values()).sort((left, right) =>
    left.block.localeCompare(right.block, "en-IN", { numeric: true }) || left.instituteName.localeCompare(right.instituteName, "en-IN", { numeric: true }),
  );
}

function buildBlockRecords(
  locations: LocationRecord[],
  institutes: InstituteRecord[],
  beneficiaryRecords: SchemeBeneficiaryRecord[],
  schemeRecords: SchemeDataRecord[],
): BlockRecord[] {
  const blocks = Array.from(new Set([
    ...defaultOperationalBlocks,
    ...schemeRecords.map((item) => canonicalBlockName(item.block)),
    ...beneficiaryRecords.map((item) => canonicalBlockName(item.block)),
    ...institutes.map((item) => canonicalBlockName(item.block)),
    ...locations.map((item) => canonicalBlockName(item.block)),
  ].map((value) => value.trim()).filter(Boolean)));

  return blocks.map((block) => {
    const blockInstitutes = institutes.filter((item) => sameBlock(item.block, block));
    const blockBeneficiaries = beneficiaryRecords.filter((item) => sameBlock(item.block, block));
    const blockSchemes = schemeRecords.filter((item) => sameBlock(item.block, block));
    const blockLocations = locations.filter((item) => sameBlock(item.block, block));
    const schemeNames = Array.from(new Set(blockSchemes.map((item) => item.schemeName.trim()).filter(Boolean)));
    const blockPanchayats = Array.from(new Set([
      ...blockLocations.map((item) => item.gramPanchayat),
      ...blockBeneficiaries.map((item) => item.gramPanchayat),
    ].map((value) => value.trim()).filter(Boolean)));
    const target = blockSchemes.reduce((sum, item) => sum + Number(item.target || 0), 0);
    const achievement = blockSchemes.reduce((sum, item) => sum + Number(item.distributedUnits || 0), 0);
    const lastUpdated = [
      ...blockInstitutes.map((item) => item.updatedAt),
      ...blockSchemes.map((item) => item.updatedAt),
      ...blockBeneficiaries.map((item) => item.updatedAt),
    ].filter(Boolean).sort().at(-1) || "Live";

    return {
      id: `BLK-${block.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
      name: block,
      officer: blockBeneficiaries.find((item) => item.createdBy)?.createdBy || "Assigned via Sheets",
      tehsil: blockLocations.find((item) => item.tehsil)?.tehsil || block,
      institutes: blockInstitutes.length,
      schemes: schemeNames.length,
      gramPanchayats: blockPanchayats.length,
      beneficiaries: blockBeneficiaries.length,
      target,
      achievement,
      progress: target ? Math.round((achievement / target) * 100) : 0,
      livestock: 0,
      status: blockSchemes.length || blockBeneficiaries.length || blockInstitutes.length ? "Active" : "Review",
      updatedAt: lastUpdated,
    };
  });
}

function BlockManagementPanel() {
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: institutes = [] } = useQuery({ queryKey: ["institutes"], queryFn: listInstitutes, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: beneficiaryRecords = [] } = useQuery({ queryKey: ["schemeBeneficiaryRecords"], queryFn: listSchemeBeneficiaryRecords, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: schemeRecords = [] } = useQuery({ queryKey: ["schemeDataRecords"], queryFn: listSchemeDataRecords, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const operationalInstitutes = useMemo(() => deriveInstitutesFromOperationalData(institutes, schemeRecords, beneficiaryRecords), [beneficiaryRecords, institutes, schemeRecords]);
  const blockRecords = useMemo(() => buildBlockRecords(locations, operationalInstitutes, beneficiaryRecords, schemeRecords), [beneficiaryRecords, locations, operationalInstitutes, schemeRecords]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return blockRecords;
    return blockRecords.filter((record) =>
      `${record.id} ${record.name} ${record.officer} ${record.tehsil} ${record.status}`.toLowerCase().includes(query),
    );
  }, [blockRecords, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalInstitutes = blockRecords.reduce((sum, record) => sum + record.institutes, 0);
  const totalSchemes = blockRecords.reduce((sum, record) => sum + record.schemes, 0);
  const totalBeneficiaries = blockRecords.reduce((sum, record) => sum + record.beneficiaries, 0);
  const lastUpdated = blockRecords[0]?.updatedAt ?? "Not updated";

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleExportPdf = () => {
    const exportData = blockRecords.map((rec) => ({
      "Block ID": rec.id,
      "Block Name": rec.name,
      "Officer Assigned": rec.officer,
      "Type/Tehsil": rec.tehsil,
      "Total Institutes": rec.institutes,
      "Total Schemes": rec.schemes,
      "Gram Panchayats": rec.gramPanchayats,
      "Total Beneficiaries": rec.beneficiaries,
      "Target": rec.target,
      "Achievement": rec.achievement,
      "Performance %": rec.progress,
      "Status": rec.status,
      "Last Updated": rec.updatedAt
    }));
    void exportRecordsToPdf(exportData, "Block Management Records");
  };

  const handleExportExcel = () => {
    const exportData = blockRecords.map((rec) => ({
      "Block ID": rec.id,
      "Block Name": rec.name,
      "Officer Assigned": rec.officer,
      "Type/Tehsil": rec.tehsil,
      "Total Institutes": rec.institutes,
      "Total Schemes": rec.schemes,
      "Gram Panchayats": rec.gramPanchayats,
      "Total Beneficiaries": rec.beneficiaries,
      "Target": rec.target,
      "Achievement": rec.achievement,
      "Performance %": rec.progress,
      "Status": rec.status,
      "Last Updated": rec.updatedAt
    }));
    void exportRecordsToXlsx(exportData, "block-management-records.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <PageHeader title="Block Management" description="District block administration, coverage statistics, and master record controls.">
          <Button variant="outline" className="h-10 border-teal-200 text-teal-700 hover:bg-teal-50" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" className="h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </PageHeader>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total Blocks" value={blockRecords.length.toString().padStart(2, "0")} detail="District administrative units" icon={Landmark} tone="teal" />
          <KpiCard title="Active Blocks" value={blockRecords.filter((record) => record.status === "Active").length.toString().padStart(2, "0")} detail="Operational and reporting" icon={Building2} tone="green" />
          <KpiCard title="Total Institutes" value={totalInstitutes.toLocaleString("en-IN")} detail="Mapped under blocks" icon={Building2} tone="teal" />
          <KpiCard title="Schemes / Beneficiaries" value={`${totalSchemes}/${totalBeneficiaries.toLocaleString("en-IN")}`} detail="Unique schemes and registrations" icon={Users} tone="green" />
        </div>

        <Card className="overflow-hidden border-teal-100 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">Block Master Records</CardTitle>
                <p className="mt-1 text-xs font-medium text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => onSearch(event.target.value)}
                  className="h-10 rounded-lg border-teal-100 bg-white pl-9"
                  placeholder="Search block, officer, tehsil..."
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="h-10 min-w-44 text-xs uppercase text-slate-600">Block</TableHead>
                    <TableHead className="h-10 text-xs uppercase text-slate-600">Institutes</TableHead>
                    <TableHead className="h-10 text-xs uppercase text-slate-600">Schemes</TableHead>
                    <TableHead className="h-10 text-xs uppercase text-slate-600">Beneficiaries</TableHead>
                    <TableHead className="h-10 text-xs uppercase text-slate-600">Performance</TableHead>
                    <TableHead className="h-10 text-xs uppercase text-slate-600">Status</TableHead>
                    <TableHead className="h-10 text-right text-xs uppercase text-slate-600">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRecords.length ? pageRecords.map((record) => (
                    <TableRow key={record.id} className="group transition-colors hover:bg-emerald-50/70">
                      <TableCell className="py-3">
                        <div className="font-semibold text-slate-900">{record.name}</div>
                        <div className="text-xs text-muted-foreground">{record.id} | {record.officer}</div>
                      </TableCell>
                      <TableCell className="py-3 font-medium">{record.institutes}</TableCell>
                      <TableCell className="py-3">{record.schemes}</TableCell>
                      <TableCell className="py-3">{record.beneficiaries.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex min-w-28 items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${record.progress >= 100 ? "bg-emerald-500" : record.progress >= 70 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(record.progress, 100)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{record.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={record.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" title={`View ${record.name}`} className="h-8 w-8 rounded-full text-teal-700 hover:bg-teal-100"><Eye className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <Search className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">No block records found</p>
                            <p className="mt-1 text-sm text-muted-foreground">Try a different search term or update the Blocks master sheet.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {pageRecords.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} blocks
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <span className="min-w-16 text-center text-xs font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" className="h-8" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ title, value, detail, icon: Icon, tone }: { title: string; value: string; detail: string; icon: typeof Landmark; tone: "teal" | "green" }) {
  const color = tone === "teal" ? "bg-teal-50 text-teal-700 ring-teal-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100";

  return (
    <Card className="border-teal-100 shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function SortableHead({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <TableHead className="h-10 whitespace-nowrap text-xs uppercase text-slate-600">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 font-semibold hover:text-teal-700">
        {label}
        <ArrowDownUp className={`h-3.5 w-3.5 ${active ? "text-teal-700" : "text-slate-400"}`} />
      </button>
    </TableHead>
  );
}

type InstituteSortKey = "instituteName" | "block" | "instituteType" | "status" | "updatedAt" | "schemeCount" | "beneficiaryCount" | "totalTarget" | "totalAchievement" | "achievementPercentage";
type InstitutePerformanceRecord = InstituteRecord & {
  schemeCount: number;
  beneficiaryCount: number;
  totalTarget: number;
  totalAchievement: number;
  achievementPercentage: number;
};

function getPerformanceColor(percent: number) {
  if (percent >= 100) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (percent >= 70) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function InstituteManagementPanel() {
  const { data: institutes = [], isLoading } = useQuery({ queryKey: ["institutes"], queryFn: listInstitutes, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: schemeRecords = [] } = useQuery({ queryKey: ["schemeDataRecords"], queryFn: listSchemeDataRecords, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: beneficiaryRecords = [] } = useQuery({ queryKey: ["schemeBeneficiaryRecords"], queryFn: listSchemeBeneficiaryRecords, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  
  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("All Blocks");
  const [status, setStatus] = useState("All Status");
  const [sortKey, setSortKey] = useState<InstituteSortKey>("instituteName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selectedDetailsInst, setSelectedDetailsInst] = useState<InstitutePerformanceRecord | null>(null);
  const pageSize = 8;

  const derivedInstitutes = useMemo(() => deriveInstitutesFromOperationalData(institutes, schemeRecords, beneficiaryRecords), [beneficiaryRecords, institutes, schemeRecords]);
  const blocks = useMemo(() => Array.from(new Set([...defaultOperationalBlocks, ...derivedInstitutes.map((item) => canonicalBlockName(item.block))].filter(Boolean))).sort((left, right) => left.localeCompare(right)), [derivedInstitutes]);

  const calculatedInstitutes = useMemo(() => {
    return derivedInstitutes.map((inst) => {
      const matchingSchemes = schemeRecords.filter((rec) => {
        if (rec.instituteId && inst.id && rec.instituteId === inst.id) return true;
        return sameBlock(rec.block, inst.block) && sameInstitute(rec.instituteName || rec.village, inst.instituteName);
      });
      const matchingBeneficiaries = beneficiaryRecords.filter((rec) => {
        return sameBlock(rec.block, inst.block) && sameInstitute(rec.village, inst.instituteName);
      });

      const schemeCount = new Set(matchingSchemes.map((s) => s.schemeName).filter(Boolean)).size;
      const beneficiaryCount = matchingBeneficiaries.length;
      const totalTarget = matchingSchemes.reduce((sum, s) => sum + s.target, 0);
      const totalAchievement = matchingSchemes.reduce((sum, s) => sum + s.distributedUnits, 0);
      const achievementPercentage = totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0;

      return {
        ...inst,
        schemeCount,
        beneficiaryCount,
        totalTarget,
        totalAchievement,
        achievementPercentage,
      };
    });
  }, [beneficiaryRecords, derivedInstitutes, schemeRecords]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return calculatedInstitutes
      .filter((item) => !query || `${item.instituteName} ${item.block} ${item.instituteType} ${item.status}`.toLowerCase().includes(query))
      .filter((item) => block === "All Blocks" || sameBlock(item.block, block))
      .filter((item) => status === "All Status" || item.status === status)
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        const result = String(valA || "").localeCompare(String(valB || ""), "en-IN", { numeric: true });
        return sortDirection === "asc" ? result : -result;
      });
  }, [block, calculatedInstitutes, search, sortDirection, sortKey, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const overallKPIs = useMemo(() => {
    const totalInsts = filtered.length;
    const filteredInstIds = new Set(filtered.map(i => i.id));
    const filteredInstKeys = new Set(filtered.map((item) => `${blockKey(item.block)}|${instituteKey(item.instituteName)}`));

    const matchingSchemes = schemeRecords.filter((rec) => {
      const recKey = `${blockKey(rec.block)}|${instituteKey(rec.instituteName || rec.village)}`;
      return (rec.instituteId && filteredInstIds.has(rec.instituteId)) || filteredInstKeys.has(recKey);
    });

    const totalTarget = matchingSchemes.reduce((sum, s) => sum + s.target, 0);
    const totalAchievement = matchingSchemes.reduce((sum, s) => sum + s.distributedUnits, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0;

    return {
      totalInsts,
      totalTarget,
      totalAchievement,
      overallPct
    };
  }, [filtered, schemeRecords]);

  const selectedInstSchemes = useMemo(() => {
    if (!selectedDetailsInst) return [];
    return schemeRecords.filter((rec) => {
      if (rec.instituteId && selectedDetailsInst.id && rec.instituteId === selectedDetailsInst.id) return true;
      return sameBlock(rec.block, selectedDetailsInst.block) && sameInstitute(rec.instituteName || rec.village, selectedDetailsInst.instituteName);
    });
  }, [selectedDetailsInst, schemeRecords]);

  const resetFilters = () => { setSearch(""); setBlock("All Blocks"); setStatus("All Status"); setPage(1); };
  const sortBy = (key: InstituteSortKey) => { setSortDirection((direction) => sortKey === key && direction === "asc" ? "desc" : "asc"); setSortKey(key); };

  const handleExportPdf = () => {
    const exportData = filtered.map((rec) => ({
      "Institute Name": rec.instituteName,
      "Block": rec.block,
      "Type": rec.instituteType || "-",
      "Total Schemes": rec.schemeCount,
      "Beneficiary Count": rec.beneficiaryCount,
      "Total Target": rec.totalTarget,
      "Achievement": rec.totalAchievement,
      "Achievement %": `${rec.achievementPercentage}%`,
      "Status": rec.status,
    }));
    void exportRecordsToPdf(exportData, "Institute Performance Records");
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((rec) => ({
      "Institute Name": rec.instituteName,
      "Block": rec.block,
      "Type": rec.instituteType || "-",
      "Total Schemes": rec.schemeCount,
      "Beneficiary Count": rec.beneficiaryCount,
      "Total Target": rec.totalTarget,
      "Achievement": rec.totalAchievement,
      "Achievement %": `${rec.achievementPercentage}%`,
      "Status": rec.status,
    }));
    void exportRecordsToXlsx(exportData, "institute-performance-records.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="border-b pb-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-teal-700">Institute Management</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">e-Pashu Digital Livestock Management System</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Institute Management</h2>
              <p className="mt-1 text-sm text-muted-foreground">View institute master data, auto-calculated targets, achievements, and performance indicators from Google Sheets.</p>
            </div>
            <div className="grid gap-2 sm:flex">
              <Button variant="outline" className="h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={handleExportPdf}><FileText className="mr-2 h-4 w-4" /> Export PDF</Button>
              <Button variant="outline" className="h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={handleExportExcel}><Download className="mr-2 h-4 w-4" /> Export Excel</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total Institutes" value={overallKPIs.totalInsts.toString().padStart(2, "0")} detail="Institutes in view" icon={Building2} tone="teal" />
          <KpiCard title="Total Target" value={overallKPIs.totalTarget.toLocaleString("en-IN")} detail="Cumulative target units" icon={Layers3} tone="green" />
          <KpiCard title="Beneficiaries" value={filtered.reduce((sum, item) => sum + item.beneficiaryCount, 0).toLocaleString("en-IN")} detail="Registered beneficiaries" icon={Landmark} tone="teal" />
          <KpiCard title="Overall Achievement %" value={`${overallKPIs.overallPct}%`} detail="Physical progress coverage" icon={MapPinned} tone="green" />
        </div>

        <Card className="border-teal-100 shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-10 rounded-lg border-teal-100 pl-9" placeholder="Search institute" />
              </div>
              <Select value={block} onValueChange={(value) => { setBlock(value); setPage(1); }}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Filter by Block" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Blocks">All Blocks</SelectItem>
                  {safeSelectOptions(blocks).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-10 border-slate-200" onClick={resetFilters}><RotateCcw className="mr-2 h-4 w-4" /> Reset Filters</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-teal-100 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <SortableHead label="Institute Name" active={sortKey === "instituteName"} onClick={() => sortBy("instituteName")} />
                    <SortableHead label="Block" active={sortKey === "block"} onClick={() => sortBy("block")} />
                    <SortableHead label="Type" active={sortKey === "instituteType"} onClick={() => sortBy("instituteType")} />
                    <SortableHead label="Schemes" active={sortKey === "schemeCount"} onClick={() => sortBy("schemeCount")} />
                    <SortableHead label="Beneficiaries" active={sortKey === "beneficiaryCount"} onClick={() => sortBy("beneficiaryCount")} />
                    <SortableHead label="Target" active={sortKey === "totalTarget"} onClick={() => sortBy("totalTarget")} />
                    <SortableHead label="Achievement" active={sortKey === "totalAchievement"} onClick={() => sortBy("totalAchievement")} />
                    <SortableHead label="Achievement %" active={sortKey === "achievementPercentage"} onClick={() => sortBy("achievementPercentage")} />
                    <SortableHead label="Status" active={sortKey === "status"} onClick={() => sortBy("status")} />
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRecords.map((record) => (
                    <TableRow key={record.id} className="transition-colors hover:bg-slate-50/50">
                      <TableCell className="py-3 font-semibold text-slate-900">{record.instituteName}</TableCell>
                      <TableCell className="py-3">{record.block}</TableCell>
                      <TableCell className="py-3">{record.instituteType || "-"}</TableCell>
                      <TableCell className="py-3 font-semibold text-slate-700">{record.schemeCount}</TableCell>
                      <TableCell className="py-3 font-semibold text-slate-700">{record.beneficiaryCount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="py-3">{record.totalTarget.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="py-3">{record.totalAchievement.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`font-bold ${getPerformanceColor(record.achievementPercentage)}`}>
                          {record.achievementPercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3"><Badge variant={record.status === "Active" ? "default" : "secondary"}>{record.status}</Badge></TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setSelectedDetailsInst(record)} title="View Performance Details" className="h-8 w-8 rounded-full text-teal-700 hover:bg-teal-50"><Eye className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!pageRecords.length ? <TableRow><TableCell colSpan={10} className="h-28 text-center text-muted-foreground">{isLoading ? "Loading institutes..." : "No institute records found."}</TableCell></TableRow> : null}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} institutes</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft className="mr-1 h-4 w-4" /> Previous</Button>
                <span className="min-w-16 text-center text-xs font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedDetailsInst} onOpenChange={(open) => { if (!open) setSelectedDetailsInst(null); }}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Institute Details</DialogTitle>
              <DialogDescription>Performance metrics and mapped schemes for {selectedDetailsInst?.instituteName}</DialogDescription>
            </DialogHeader>
            {selectedDetailsInst && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Institute Name</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedDetailsInst.instituteName}</p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Block</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedDetailsInst.block}</p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Type</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedDetailsInst.instituteType || "-"}</p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="text-xs uppercase text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <Badge variant={selectedDetailsInst.status === "Active" ? "default" : "secondary"}>
                        {selectedDetailsInst.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border bg-teal-50/50 p-4">
                    <p className="text-xs uppercase text-teal-800 font-semibold">Total Schemes</p>
                    <p className="mt-1 text-2xl font-black text-teal-700">{selectedDetailsInst.schemeCount}</p>
                  </div>
                  <div className="rounded-xl border bg-emerald-50/50 p-4">
                    <p className="text-xs uppercase text-emerald-800 font-semibold">Total Target</p>
                    <p className="mt-1 text-2xl font-black text-emerald-700">{selectedDetailsInst.totalTarget.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-xl border bg-teal-50/50 p-4">
                    <p className="text-xs uppercase text-teal-800 font-semibold">Beneficiaries</p>
                    <p className="mt-1 text-2xl font-black text-teal-700">{selectedDetailsInst.beneficiaryCount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className={`rounded-xl border p-4 ${selectedDetailsInst.achievementPercentage >= 100 ? 'bg-emerald-50' : selectedDetailsInst.achievementPercentage >= 70 ? 'bg-amber-50' : 'bg-rose-50'}`}>
                    <p className={`text-xs uppercase font-semibold ${selectedDetailsInst.achievementPercentage >= 100 ? 'text-emerald-800' : selectedDetailsInst.achievementPercentage >= 70 ? 'text-amber-800' : 'text-rose-800'}`}>Achievement %</p>
                    <p className={`mt-1 text-2xl font-black ${selectedDetailsInst.achievementPercentage >= 100 ? 'text-emerald-700' : selectedDetailsInst.achievementPercentage >= 70 ? 'text-amber-700' : 'text-rose-700'}`}>{selectedDetailsInst.achievementPercentage}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900">Mapped Schemes ({selectedInstSchemes.length})</h4>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="h-10 text-xs">Financial Year</TableHead>
                          <TableHead className="h-10 text-xs">Scheme Name</TableHead>
                          <TableHead className="h-10 text-xs">Target</TableHead>
                          <TableHead className="h-10 text-xs">Achievement (Distributed)</TableHead>
                          <TableHead className="h-10 text-xs">Achievement %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInstSchemes.map((s) => {
                          const pct = s.target > 0 ? Math.round((s.distributedUnits / s.target) * 100) : 0;
                          return (
                            <TableRow key={s.id}>
                              <TableCell className="py-2 text-xs">{s.financialYear}</TableCell>
                              <TableCell className="py-2 text-xs font-medium">{s.schemeName}</TableCell>
                              <TableCell className="py-2 text-xs">{s.target.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="py-2 text-xs">{s.distributedUnits.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="py-2 text-xs">
                                <Badge variant="outline" className={`font-bold ${getPerformanceColor(pct)}`}>
                                  {pct}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {!selectedInstSchemes.length && (
                          <TableRow>
                            <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                              No schemes mapped to this institute yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedDetailsInst(null)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

type ReportSummaryRecord = {
  id: string;
  financialYear: string;
  schemeName: string;
  block: string;
  instituteName: string;
  target: number;
  approved: number;
  distributed: number;
  pending: number;
  progress: number;
  financialAmount: number;
  beneficiaries: number;
  scCount: number;
  stCount: number;
  obcCount: number;
  generalCount: number;
  otherCount: number;
  updatedAt: string;
};

type ReportDisplayRow = {
  name: string;
  target: number;
  approved?: number;
  achievement: number;
  pending: number;
  progress: number;
  financialAmount: number;
  block?: string;
  detail?: string;
};

function displayInstituteName(record: Partial<SchemeDataRecord>) {
  return String(record.instituteName || record.village || "").trim();
}

function toReportExportRow(record: ReportSummaryRecord) {
  return {
    "Financial Year": record.financialYear,
    "Scheme Name": record.schemeName,
    "Block": record.block,
    "Institute Name": record.instituteName,
    "Target": record.target,
    "Approved Cases": record.approved,
    "Achievement (Distributed)": record.distributed,
    "Pending Cases": record.pending,
    "Physical Progress %": record.progress,
    "Financial Amount (INR)": record.financialAmount,
    "SC Count": record.scCount,
    "ST Count": record.stCount,
    "OBC Count": record.obcCount,
    "General Count": record.generalCount,
    "Other Count": record.otherCount,
    "Total Beneficiaries": record.beneficiaries,
  };
}

function buildReportSummaryRecords(schemeRecords: SchemeDataRecord[], beneficiaryRecords: SchemeBeneficiaryRecord[]): ReportSummaryRecord[] {
  const grouped = new Map<string, ReportSummaryRecord>();

  for (const record of schemeRecords) {
    const instituteName = displayInstituteName(record);
    const key = `${record.financialYear}|${record.schemeName}|${record.block}|${instituteName}`;
    const beneficiaries = beneficiaryRecords.filter((item) => item.schemeName === record.schemeName && item.block === record.block);
    const existing = grouped.get(key);
    const target = (existing?.target || 0) + record.target;
    const approved = (existing?.approved || 0) + record.approvedCases;
    const distributed = (existing?.distributed || 0) + record.distributedUnits;
    const pending = (existing?.pending || 0) + record.pendingCases;
    const financialAmount = (existing?.financialAmount || 0) + record.financialProgressAmount;
    const updatedAt = [existing?.updatedAt || "", record.updatedAt, ...beneficiaries.map((item) => item.updatedAt || item.createdAt || "")].filter(Boolean).sort().at(-1) || record.updatedAt;

    grouped.set(key, {
      id: existing?.id || `RPT-${String(grouped.size + 1).padStart(3, "0")}`,
      financialYear: record.financialYear,
      schemeName: record.schemeName,
      block: record.block,
      instituteName,
      target,
      approved,
      distributed,
      pending,
      progress: target ? Math.round((distributed / target) * 100) : 0,
      financialAmount,
      beneficiaries: beneficiaries.length,
      scCount: (existing?.scCount || 0) + record.scCount,
      stCount: (existing?.stCount || 0) + record.stCount,
      obcCount: (existing?.obcCount || 0) + record.obcCount,
      generalCount: (existing?.generalCount || 0) + record.generalCount,
      otherCount: (existing?.otherCount || 0) + record.otherCount,
      updatedAt,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

const quickReports = [
  { title: "Scheme Progress Report", detail: "Physical and financial progress by scheme.", icon: BarChart3 },
  { title: "Beneficiary Summary Report", detail: "Beneficiary enrollment and distribution summary.", icon: Users },
  { title: "Financial Abstract Report", detail: "Sanctioned and utilized financial amount.", icon: IndianRupee },
  { title: "Distribution Report", detail: "Distributed units, pending cases, and gaps.", icon: Layers3 },
  { title: "Block-wise Coverage Report", detail: "Coverage comparison across administrative blocks.", icon: MapPinned },
];

const chartColors = ["#0f766e", "#15803d", "#0d9488", "#22c55e", "#14b8a6"];

function ReportsAnalyticsPanel() {
  const { data: schemeRecords = [] } = useQuery({ queryKey: ["schemeDataRecords"], queryFn: listSchemeDataRecords, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: beneficiaryRecords = [] } = useQuery({ queryKey: ["schemeBeneficiaryRecords"], queryFn: listSchemeBeneficiaryRecords, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: institutesList = [] } = useQuery({ queryKey: ["institutes"], queryFn: listInstitutes, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });

  const [financialYear, setFinancialYear] = useState("All Years");
  const [schemeName, setSchemeName] = useState("All Schemes");
  const [block, setBlock] = useState("All Blocks");
  const [instituteName, setInstituteName] = useState("All Institutes");
  const [status, setStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  type ReportViewType = "district" | "block" | "institute" | "scheme" | "target-vs-achievement" | "achievement-percentage" | "top-performing" | "low-performing";
  const [reportView, setReportView] = useState<ReportViewType>("institute");

  const reportSummaryRecords = useMemo(() => buildReportSummaryRecords(schemeRecords, beneficiaryRecords), [beneficiaryRecords, schemeRecords]);
  const financialYears = useMemo(() => Array.from(new Set(reportSummaryRecords.map((record) => record.financialYear))), [reportSummaryRecords]);
  const schemes = useMemo(() => Array.from(new Set(reportSummaryRecords.map((record) => record.schemeName))), [reportSummaryRecords]);
  const blocks = useMemo(() => Array.from(new Set(locations.map((record) => record.block).filter(Boolean))).sort((left, right) => left.localeCompare(right)), [locations]);
  const institutes = useMemo(() => Array.from(new Set(institutesList.filter((record) => block === "All Blocks" || record.block === block).map((record) => record.instituteName).filter(Boolean))).sort((left, right) => left.localeCompare(right)), [block, institutesList]);

  const filteredRecords = useMemo(() => reportSummaryRecords.filter((record) => {
    const matchingInst = institutesList.find(i => i.instituteName.trim().toLowerCase() === record.instituteName.trim().toLowerCase());
    const instStatus = matchingInst?.status || "Active";

    const recordDate = new Date(record.updatedAt).getTime();
    const afterFrom = fromDate ? recordDate >= new Date(fromDate).getTime() : true;
    const beforeTo = toDate ? recordDate <= new Date(toDate).getTime() : true;
    return (financialYear === "All Years" || record.financialYear === financialYear)
      && (schemeName === "All Schemes" || record.schemeName === schemeName)
      && (block === "All Blocks" || record.block === block)
      && (instituteName === "All Institutes" || record.instituteName === instituteName)
      && (status === "All Status" || instStatus === status)
      && afterFrom
      && beforeTo;
  }), [block, financialYear, fromDate, instituteName, schemeName, toDate, status, institutesList, reportSummaryRecords]);

  const totals = useMemo(() => ({
    schemes: new Set(filteredRecords.map((record) => record.schemeName)).size,
    beneficiaries: filteredRecords.reduce((sum, record) => sum + record.beneficiaries, 0),
    approved: filteredRecords.reduce((sum, record) => sum + record.approved, 0),
    distributed: filteredRecords.reduce((sum, record) => sum + record.distributed, 0),
    pending: filteredRecords.reduce((sum, record) => sum + record.pending, 0),
    financialAmount: filteredRecords.reduce((sum, record) => sum + record.financialAmount, 0),
    casteTotal: filteredRecords.reduce((sum, record) => sum + record.scCount + record.stCount + record.obcCount + record.generalCount + record.otherCount, 0),
  }), [filteredRecords]);

  const reportsKPIs = useMemo(() => {
    const totalTarget = filteredRecords.reduce((sum, r) => sum + r.target, 0);
    const totalAchievement = totals.distributed;
    const overallPct = totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0;
    const totalInsts = new Set(filteredRecords.map((record) => record.instituteName).filter(Boolean)).size;

    return {
      totalTarget,
      totalAchievement,
      overallPct,
      totalInsts
    };
  }, [filteredRecords, totals.distributed]);

  const districtRows = useMemo(() => {
    const totalTarget = filteredRecords.reduce((sum, r) => sum + r.target, 0);
    const totalApproved = filteredRecords.reduce((sum, r) => sum + r.approved, 0);
    const totalAchievement = filteredRecords.reduce((sum, r) => sum + r.distributed, 0);
    const totalPending = filteredRecords.reduce((sum, r) => sum + r.pending, 0);
    const progress = totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0;
    const financialAmount = filteredRecords.reduce((sum, r) => sum + r.financialAmount, 0);

    return [{
      name: "Dantewada District",
      target: totalTarget,
      approved: totalApproved,
      achievement: totalAchievement,
      pending: totalPending,
      progress,
      financialAmount
    }];
  }, [filteredRecords]);

  const blockRows = useMemo(() => {
    const groups = new Map<string, Omit<ReportDisplayRow, "progress">>();
    for (const r of filteredRecords) {
      const existing = groups.get(r.block) ?? {
        name: r.block,
        target: 0,
        approved: 0,
        achievement: 0,
        pending: 0,
        financialAmount: 0
      };
      existing.target += r.target;
      existing.approved += r.approved;
      existing.achievement += r.distributed;
      existing.pending += r.pending;
      existing.financialAmount += r.financialAmount;
      groups.set(r.block, existing);
    }
    return Array.from(groups.values()).map((g): ReportDisplayRow => ({
      ...g,
      progress: g.target > 0 ? Math.round((g.achievement / g.target) * 100) : 0
    }));
  }, [filteredRecords]);

  const instituteRows = useMemo(() => {
    const groups = new Map<string, Omit<ReportDisplayRow, "progress">>();
    for (const r of filteredRecords) {
      const existing = groups.get(r.instituteName) ?? {
        name: r.instituteName,
        block: r.block,
        target: 0,
        approved: 0,
        achievement: 0,
        pending: 0,
        financialAmount: 0
      };
      existing.target += r.target;
      existing.approved += r.approved;
      existing.achievement += r.distributed;
      existing.pending += r.pending;
      existing.financialAmount += r.financialAmount;
      groups.set(r.instituteName, existing);
    }
    return Array.from(groups.values()).map((g): ReportDisplayRow => ({
      ...g,
      progress: g.target > 0 ? Math.round((g.achievement / g.target) * 100) : 0
    }));
  }, [filteredRecords]);

  const schemeRows = useMemo(() => {
    const groups = new Map<string, Omit<ReportDisplayRow, "progress">>();
    for (const r of filteredRecords) {
      const existing = groups.get(r.schemeName) ?? {
        name: r.schemeName,
        target: 0,
        approved: 0,
        achievement: 0,
        pending: 0,
        financialAmount: 0
      };
      existing.target += r.target;
      existing.approved += r.approved;
      existing.achievement += r.distributed;
      existing.pending += r.pending;
      existing.financialAmount += r.financialAmount;
      groups.set(r.schemeName, existing);
    }
    return Array.from(groups.values()).map((g): ReportDisplayRow => ({
      ...g,
      progress: g.target > 0 ? Math.round((g.achievement / g.target) * 100) : 0
    }));
  }, [filteredRecords]);

  const targetVsAchievementRows = useMemo(() => {
    return filteredRecords.map((r) => ({
      name: `${r.schemeName} (${r.financialYear})`,
      detail: r.instituteName,
      block: r.block,
      target: r.target,
      achievement: r.distributed,
      pending: r.pending,
      progress: r.progress,
      financialAmount: r.financialAmount
    }));
  }, [filteredRecords]);

  const achievementPercentageRows = useMemo(() => {
    return [...instituteRows].sort((a, b) => b.progress - a.progress);
  }, [instituteRows]);

  const topPerformingRows = useMemo(() => {
    return [...instituteRows].sort((a, b) => b.progress - a.progress);
  }, [instituteRows]);

  const lowPerformingRows = useMemo(() => {
    return [...instituteRows].sort((a, b) => a.progress - b.progress);
  }, [instituteRows]);

  const currentReportRows = useMemo(() => {
    switch (reportView) {
      case "district":
        return districtRows;
      case "block":
        return blockRows;
      case "scheme":
        return schemeRows;
      case "target-vs-achievement":
        return targetVsAchievementRows;
      case "achievement-percentage":
        return achievementPercentageRows;
      case "top-performing":
        return topPerformingRows;
      case "low-performing":
        return lowPerformingRows;
      case "institute":
      default:
        return instituteRows;
    }
  }, [reportView, districtRows, blockRows, schemeRows, targetVsAchievementRows, achievementPercentageRows, topPerformingRows, lowPerformingRows, instituteRows]);

  const viewQuickReport = (title: string) => {
    const viewByTitle: Record<string, ReportViewType> = {
      "Scheme Progress Report": "scheme",
      "Beneficiary Summary Report": "institute",
      "Financial Abstract Report": "institute",
      "Distribution Report": "target-vs-achievement",
      "Block-wise Coverage Report": "block",
    };
    setReportView(viewByTitle[title] || "institute");
    window.setTimeout(() => {
      document.getElementById("summary-report-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const casteData = useMemo(() => [
    { name: "SC", value: filteredRecords.reduce((sum, record) => sum + record.scCount, 0) },
    { name: "ST", value: filteredRecords.reduce((sum, record) => sum + record.stCount, 0) },
    { name: "OBC", value: filteredRecords.reduce((sum, record) => sum + record.obcCount, 0) },
    { name: "General", value: filteredRecords.reduce((sum, record) => sum + record.generalCount, 0) },
    { name: "Other", value: filteredRecords.reduce((sum, record) => sum + record.otherCount, 0) },
  ].filter((item) => item.value > 0), [filteredRecords]);

  const statusData = useMemo(() => [
    { name: "Approved", value: totals.approved },
    { name: "Distributed", value: totals.distributed },
    { name: "Pending", value: totals.pending },
  ], [totals]);

  const resetFilters = () => {
    setFinancialYear("All Years");
    setSchemeName("All Schemes");
    setBlock("All Blocks");
    setInstituteName("All Institutes");
    setStatus("All Status");
    setFromDate("");
    setToDate("");
  };

  const exportCurrentReportPdf = () => {
    const headers = [
      reportView === "district" ? "District" :
      reportView === "block" ? "Block" :
      reportView === "scheme" ? "Scheme Name" :
      reportView === "target-vs-achievement" ? "Scheme / Target Details" :
      "Institute Name"
    ];
    if (["institute", "target-vs-achievement", "achievement-percentage", "top-performing", "low-performing"].includes(reportView)) {
      headers.push("Block");
    }
    if (reportView === "target-vs-achievement") {
      headers.push("Institute");
    }
    headers.push("Target", "Achievement", "Pending", "Achievement %", "Financial Amount");

    const exportData = currentReportRows.map((r) => {
      const row: Record<string, string | number> = {};
      const key = headers[0];
      row[key] = r.name;
      if (headers.includes("Block")) {
        row["Block"] = r.block || "-";
      }
      if (headers.includes("Institute")) {
        row["Institute"] = r.detail || "-";
      }
      row["Target"] = r.target;
      row["Achievement"] = r.achievement;
      row["Pending"] = r.pending;
      row["Achievement %"] = `${r.progress}%`;
      row["Financial Amount (INR)"] = r.financialAmount;
      return row;
    });

    const titleMap: Record<string, string> = {
      district: "District-wise Summary Report",
      block: "Block-wise Summary Report",
      institute: "Institute-wise Summary Report",
      scheme: "Scheme-wise Summary Report",
      "target-vs-achievement": "Target vs Achievement Report",
      "achievement-percentage": "Achievement Percentage Report",
      "top-performing": "Top Performing Institutes Report",
      "low-performing": "Low Performing Institutes Report",
    };

    void exportRecordsToPdf(exportData, titleMap[reportView]);
  };

  const exportCurrentReportExcel = () => {
    const headers = [
      reportView === "district" ? "District" :
      reportView === "block" ? "Block" :
      reportView === "scheme" ? "Scheme Name" :
      reportView === "target-vs-achievement" ? "Scheme / Target Details" :
      "Institute Name"
    ];
    if (["institute", "target-vs-achievement", "achievement-percentage", "top-performing", "low-performing"].includes(reportView)) {
      headers.push("Block");
    }
    if (reportView === "target-vs-achievement") {
      headers.push("Institute");
    }
    headers.push("Target", "Achievement", "Pending", "Achievement %", "Financial Amount");

    const exportData = currentReportRows.map((r) => {
      const row: Record<string, string | number> = {};
      const key = headers[0];
      row[key] = r.name;
      if (headers.includes("Block")) {
        row["Block"] = r.block || "-";
      }
      if (headers.includes("Institute")) {
        row["Institute"] = r.detail || "-";
      }
      row["Target"] = r.target;
      row["Achievement"] = r.achievement;
      row["Pending"] = r.pending;
      row["Achievement %"] = `${r.progress}%`;
      row["Financial Amount (INR)"] = r.financialAmount;
      return row;
    });

    const fileNames: Record<string, string> = {
      district: "district-wise-summary.xlsx",
      block: "block-wise-summary.xlsx",
      institute: "institute-wise-summary.xlsx",
      scheme: "scheme-wise-summary.xlsx",
      "target-vs-achievement": "target-vs-achievement-report.xlsx",
      "achievement-percentage": "achievement-percentage-report.xlsx",
      "top-performing": "top-performing-institutes.xlsx",
      "low-performing": "low-performing-institutes.xlsx",
    };

    void exportRecordsToXlsx(exportData, fileNames[reportView]);
  };

  const hasData = filteredRecords.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="border-b pb-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-teal-700">Reports & Analytics</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">e-Pashu Digital Livestock Management System</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Reports & Analytics</h2>
              <p className="mt-1 text-sm text-muted-foreground">Monitor livestock schemes, targets, achievements, and physical progress percentages.</p>
            </div>
            <Badge variant="outline" className="w-fit border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-700">
              District analytics dashboard
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard title="Total Institutes" value={reportsKPIs.totalInsts.toString().padStart(2, "0")} detail="Institutes in view" icon={Building2} tone="teal" />
          <KpiCard title="Total Target" value={reportsKPIs.totalTarget.toLocaleString("en-IN")} detail="Cumulative target units" icon={Layers3} tone="green" />
          <KpiCard title="Total Beneficiary" value={reportsKPIs.totalAchievement.toLocaleString("en-IN")} detail="Units achieved" icon={Landmark} tone="teal" />
          <KpiCard title="Overall Achievement %" value={`${reportsKPIs.overallPct}%`} detail="Physical progress" icon={MapPinned} tone="green" />
          <KpiCard title="Pending Cases" value={totals.pending.toLocaleString("en-IN")} detail="Awaiting distribution" icon={CalendarDays} tone="teal" />
          <KpiCard title="Financial Amount" value={formatCurrency(totals.financialAmount)} detail="Total utilization" icon={IndianRupee} tone="green" />
        </div>

        <Card className="border-teal-100 shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-3 lg:grid-cols-[130px_1.2fr_140px_1.2fr_130px_130px_130px_auto]">
              <Select value={financialYear} onValueChange={setFinancialYear}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Financial Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Years">All Years</SelectItem>
                  {safeSelectOptions(financialYears).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={schemeName} onValueChange={setSchemeName}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Scheme Name" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Schemes">All Schemes</SelectItem>
                  {safeSelectOptions(schemes).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={block} onValueChange={(value) => { setBlock(value); setInstituteName("All Institutes"); }}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Block" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Blocks">All Blocks</SelectItem>
                  {safeSelectOptions(blocks).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={instituteName} onValueChange={setInstituteName}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Institute" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Institutes">All Institutes</SelectItem>
                  {safeSelectOptions(institutes).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 rounded-lg border-teal-100" aria-label="From date" />
              <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 rounded-lg border-teal-100" aria-label="To date" />
              <Button variant="outline" className="h-10 border-slate-200" onClick={resetFilters}><RotateCcw className="mr-2 h-4 w-4" /> Reset Filters</Button>
            </div>
          </CardContent>
        </Card>

        {hasData ? (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              <AnalyticsChartCard title="Scheme-wise Progress Chart" subtitle="Target and achievement by scheme.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={filteredRecords}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="schemeName" tick={{ fontSize: 11 }} interval={0} height={70} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                    <Bar dataKey="target" name="Target" fill="#0f766e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="distributed" name="Achievement" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsChartCard>

              <AnalyticsChartCard title="Institute Coverage Chart" subtitle="Beneficiary count by institute.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={filteredRecords}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="instituteName" tick={{ fontSize: 11 }} interval={0} height={70} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                    <Bar dataKey="beneficiaries" name="Beneficiaries" fill="#15803d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsChartCard>

              <AnalyticsChartCard title="Financial Utilization Chart" subtitle="Financial amount by institute.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={filteredRecords}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="instituteName" tick={{ fontSize: 11 }} interval={0} height={70} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${Number(value) / 100000}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="financialAmount" name="Financial Amount" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsChartCard>

              <AnalyticsChartCard title="Caste-wise Beneficiary Distribution" subtitle="SC, ST, OBC, General, and Other counts.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={casteData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                    <Bar dataKey="value" name="Beneficiaries" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AnalyticsChartCard>

              <AnalyticsChartCard title="Distribution Status Chart" subtitle="Approved, distributed, and pending case mix.">
                <ResponsiveContainer width="100%" height={260}>
                  <RechartsPieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                      {statusData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </AnalyticsChartCard>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {quickReports.map((report) => <QuickReportCard key={report.title} {...report} onView={() => viewQuickReport(report.title)} onPdf={() => void exportRecordsToPdf(filteredRecords.map(toReportExportRow), report.title)} onXlsx={() => void exportRecordsToXlsx(filteredRecords.map(toReportExportRow), `${slug(report.title)}.xlsx`)} />)}
            </div>

            <Card id="summary-report-table" className="scroll-mt-24 overflow-hidden border-teal-100 shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-900">Summary Report Table</CardTitle>
                    <p className="text-xs font-medium text-muted-foreground">Dynamic overview calculations based on current selection.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Report Type:</span>
                      <Select value={reportView} onValueChange={(val) => setReportView(val as ReportViewType)}>
                        <SelectTrigger className="h-9 w-52 rounded-lg border-teal-100 bg-white text-xs">
                          <SelectValue placeholder="Select Report Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="district">District-wise Summary</SelectItem>
                          <SelectItem value="block">Block-wise Summary</SelectItem>
                          <SelectItem value="institute">Institute-wise Summary</SelectItem>
                          <SelectItem value="scheme">Scheme-wise Summary</SelectItem>
                          <SelectItem value="target-vs-achievement">Target vs Achievement Report</SelectItem>
                          <SelectItem value="achievement-percentage">Achievement Percentage Report</SelectItem>
                          <SelectItem value="top-performing">Top Performing Institutes</SelectItem>
                          <SelectItem value="low-performing">Low Performing Institutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-9 border-teal-200 text-teal-700 hover:bg-teal-50 text-xs" onClick={exportCurrentReportPdf}><FileText className="mr-1 h-3.5 w-3.5" /> PDF</Button>
                      <Button variant="outline" size="sm" className="h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs" onClick={exportCurrentReportExcel}><Download className="mr-1 h-3.5 w-3.5" /> Excel</Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="h-10 min-w-56 text-xs uppercase text-slate-600">
                          {reportView === "district" ? "District" :
                           reportView === "block" ? "Block Name" :
                           reportView === "scheme" ? "Scheme Name" :
                           reportView === "target-vs-achievement" ? "Scheme / Target Details" :
                           "Institute Name"}
                        </TableHead>
                        {["institute", "target-vs-achievement", "achievement-percentage", "top-performing", "low-performing"].includes(reportView) && (
                          <TableHead className="h-10 text-xs uppercase text-slate-600">Block</TableHead>
                        )}
                        {reportView === "target-vs-achievement" && (
                          <TableHead className="h-10 text-xs uppercase text-slate-600">Institute</TableHead>
                        )}
                        <TableHead className="h-10 text-xs uppercase text-slate-600">Target</TableHead>
                        <TableHead className="h-10 text-xs uppercase text-slate-600">Achievement</TableHead>
                        <TableHead className="h-10 text-xs uppercase text-slate-600">Pending</TableHead>
                        <TableHead className="h-10 text-xs uppercase text-slate-600">Achievement %</TableHead>
                        <TableHead className="h-10 text-xs uppercase text-slate-600">Financial Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentReportRows.map((record, index) => (
                        <TableRow key={index} className="transition-colors hover:bg-emerald-50/70">
                          <TableCell className="py-3 font-semibold text-slate-900">
                            {record.name}
                          </TableCell>
                          {["institute", "target-vs-achievement", "achievement-percentage", "top-performing", "low-performing"].includes(reportView) && (
                            <TableCell className="py-3">{record.block || "-"}</TableCell>
                          )}
                          {reportView === "target-vs-achievement" && (
                            <TableCell className="py-3 font-medium">{record.detail || "-"}</TableCell>
                          )}
                          <TableCell className="py-3">{record.target.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="py-3">{record.achievement.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="py-3">{record.pending.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="py-3">
                            <div className="flex min-w-32 items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${record.progress >= 100 ? 'bg-emerald-500' : record.progress >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(record.progress, 100)}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${record.progress >= 100 ? 'text-emerald-700' : record.progress >= 70 ? 'text-amber-700' : 'text-rose-700'}`}>{record.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 font-medium">{formatCurrency(record.financialAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-teal-100 shadow-sm">
            <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <PieChart className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No Analytics Data Available</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">No scheme records match the selected filters. Reset filters or choose a wider reporting period to view analytics.</p>
              <Button className="mt-4 h-10 bg-teal-700 hover:bg-teal-800" onClick={resetFilters}><RotateCcw className="mr-2 h-4 w-4" /> Reset Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function AnalyticsChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="border-teal-100 shadow-sm">
      <CardHeader className="px-4 py-4">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="px-3 pb-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function QuickReportCard({ title, detail, icon: Icon, onView, onPdf, onXlsx }: { title: string; detail: string; icon: typeof FileText; onView: () => void; onPdf: () => void; onXlsx: () => void }) {
  return (
    <Card className="border-teal-100 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/30">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold leading-snug text-slate-900">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Button variant="outline" size="sm" className="h-8 justify-start border-teal-200 text-teal-700 hover:bg-teal-50" onClick={onView}><Eye className="mr-2 h-4 w-4" /> View Report</Button>
          <Button variant="outline" size="sm" className="h-8 justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => void onPdf()}><FileText className="mr-2 h-4 w-4" /> Download PDF</Button>
          <Button variant="outline" size="sm" className="h-8 justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => void onXlsx()}><FileSpreadsheet className="mr-2 h-4 w-4" /> Download Excel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function exportRecordsToXlsx(records: Array<Record<string, unknown>>, fileName: string) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  XLSX.writeFile(workbook, fileName);
}

async function exportRecordsToPdf(records: Array<Record<string, unknown>>, title: string) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape" });
  const headers = records.length ? Object.keys(records[0]) : ["No data"];
  const body = records.length
    ? records.map((record) => headers.map((key) => String(record[key] ?? "")))
    : [["No data"]];

  doc.setFontSize(14);
  doc.text(title, 14, 12);
  autoTable(doc, {
    head: [headers],
    body,
    startY: 18,
    styles: { fontSize: 8 },
  });
  doc.save(`${slug(title)}.pdf`);
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type AdminUserStatus = "Active" | "Inactive";
type AdminUserRole = "Admin" | "District Officer" | "Block Officer" | "Data Entry Operator" | "Field Officer" | "Veterinary Doctor" | "Departmental Officer" | "Deputy Director (Vet)";

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  role: AdminUserRole;
  assignedBlock: string;
  status: AdminUserStatus;
  online: boolean;
  lastLogin: string;
  loginCount: number;
};

const userRoles: AdminUserRole[] = ["Admin", "District Officer", "Block Officer", "Data Entry Operator"];
const userStatuses: AdminUserStatus[] = ["Active", "Inactive"];

function toAdminUserRecord(user: UserDirectoryRecord): AdminUserRecord {
  const roleLabel = getRoleOptionLabel(user.role as UserRole) as AdminUserRole;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: "",
    designation: roleLabel,
    role: roleLabel,
    assignedBlock: user.region || "All Blocks",
    status: user.active ? "Active" : "Inactive",
    online: false,
    lastLogin: user.updatedAt || user.createdAt || "Live",
    loginCount: 0,
  };
}

function UserManagementPanel() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: listUsers, staleTime: 2 * 60 * 1000, refetchOnWindowFocus: true });
  const { data: institutes = [] } = useQuery({ queryKey: ["institutes"], queryFn: listInstitutes, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: true });
  const adminUsers = useMemo(() => users.map(toAdminUserRecord), [users]);
  const [nameSearch, setNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const userBlocks = useMemo(() => ["All Blocks", ...Array.from(new Set(institutes.map((item) => item.block).filter(Boolean)))], [institutes]);

  const saveMutation = useMutation({
    mutationFn: upsertUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setDialogOpen(false);
      setEditingUser(null);
      toast({ title: "User saved", description: "The user record was synced to Google Sheets." });
    },
    onError: (error) => toast({ title: "Unable to save user", description: error instanceof Error ? error.message : "Unexpected error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (user: AdminUserRecord) => deleteUserByEmail(user.email, { actorRole: "admin", id: user.id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deleted", description: "The user record was removed from Google Sheets." });
    },
    onError: (error) => toast({ title: "Unable to delete user", description: error instanceof Error ? error.message : "Unexpected error", variant: "destructive" }),
    onSettled: () => setDeletingUserId(null),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => resetUserPassword(email, { actorRole: "admin" }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Password reset", description: `Temporary password for ${result.email}: ${result.temporaryPassword}` });
    },
    onError: (error) => toast({ title: "Unable to reset password", description: error instanceof Error ? error.message : "Unexpected error", variant: "destructive" }),
  });

  const filteredUsers = useMemo(() => adminUsers.filter((user) => {
    return (!nameSearch.trim() || user.name.toLowerCase().includes(nameSearch.trim().toLowerCase()))
      && (!emailSearch.trim() || user.email.toLowerCase().includes(emailSearch.trim().toLowerCase()))
      && (role === "All Roles" || user.role === role)
      && (status === "All Status" || user.status === status);
  }), [adminUsers, emailSearch, nameSearch, role, status]);

  const latestLogin = adminUsers.reduce((latest, user) => latest || user.lastLogin, "");
  const activeUsers = adminUsers.filter((user) => user.status === "Active").length;
  const inactiveUsers = adminUsers.filter((user) => user.status === "Inactive").length;
  const onlineUsers = adminUsers.filter((user) => user.online).length;

  const resetFilters = () => {
    setNameSearch("");
    setEmailSearch("");
    setRole("All Roles");
    setStatus("All Status");
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="border-b pb-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <span>Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-teal-700">User Management</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">e-Pashu Digital Livestock Management System</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">User Management</h2>
              <p className="mt-1 text-sm text-muted-foreground">Create users, assign roles, manage access, and monitor login activity.</p>
            </div>
            <div className="grid gap-2 sm:flex">
              <AddUserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialUser={editingUser}
                onSave={async (input) => {
                  if (saveMutation.isPending) return;
                  const email = String(input.email || "").trim().toLowerCase();
                  const duplicate = users.some((existing) => existing.id !== input.id && existing.email.trim().toLowerCase() === email);
                  if (duplicate) {
                    toast({ title: "User already exists", description: "A user with this email is already present. Edit that user instead.", variant: "destructive" });
                    return;
                  }
                  await saveMutation.mutateAsync(input);
                }}
                isSaving={saveMutation.isPending}
                blocks={userBlocks}
                onCreate={openCreateDialog}
              />
              <Button variant="outline" className="h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => void exportRecordsToXlsx(filteredUsers, "user-directory.xlsx")}><Download className="mr-2 h-4 w-4" /> Export Users</Button>
              <Button
                variant="outline"
                className="h-10 border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => {
                  const targetUser = editingUser || filteredUsers[0];
                  if (!targetUser) {
                    toast({ title: "No user selected", description: "Select a user row first.", variant: "destructive" });
                    return;
                  }
                  void resetPasswordMutation.mutateAsync(targetUser.email);
                }}
              ><KeyRound className="mr-2 h-4 w-4" /> Reset Password</Button>
              <Button variant="outline" className="h-10 border-slate-200"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total Users" value={adminUsers.length.toString().padStart(2, "0")} detail="Registered portal users" icon={Users} tone="teal" />
          <KpiCard title="Active Users" value={activeUsers.toString().padStart(2, "0")} detail="Enabled accounts" icon={UserCheck} tone="green" />
          <KpiCard title="Inactive Users" value={inactiveUsers.toString().padStart(2, "0")} detail="Temporarily disabled" icon={UserX} tone="teal" />
          <KpiCard title="Online Users" value={onlineUsers.toString().padStart(2, "0")} detail="Current active sessions" icon={Wifi} tone="green" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-4">
              <CardTitle className="text-lg text-slate-900">User Directory</CardTitle>
              <p className="text-xs font-medium text-muted-foreground">Role-based access control for district and block administration.</p>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_190px_170px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={nameSearch} onChange={(event) => setNameSearch(event.target.value)} className="h-10 rounded-lg border-teal-100 pl-9" placeholder="Search by Name" />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={emailSearch} onChange={(event) => setEmailSearch(event.target.value)} className="h-10 rounded-lg border-teal-100 pl-9" placeholder="Search by Email" />
                </div>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Roles">All Roles</SelectItem>
                    {safeSelectOptions(userRoles).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 rounded-lg border-teal-100"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    {safeSelectOptions(userStatuses).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-10 border-slate-200" onClick={resetFilters}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-teal-100">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="h-10 min-w-56 text-xs uppercase text-slate-600">User Name</TableHead>
                      <TableHead className="h-10 min-w-56 text-xs uppercase text-slate-600">Email</TableHead>
                      <TableHead className="h-10 text-xs uppercase text-slate-600">Mobile Number</TableHead>
                      <TableHead className="h-10 text-xs uppercase text-slate-600">Role</TableHead>
                      <TableHead className="h-10 text-xs uppercase text-slate-600">Assigned Block</TableHead>
                      <TableHead className="h-10 text-xs uppercase text-slate-600">Status</TableHead>
                      <TableHead className="h-10 text-xs uppercase text-slate-600">Last Login</TableHead>
                      <TableHead className="h-10 text-right text-xs uppercase text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="transition-colors hover:bg-emerald-50/70">
                        <TableCell className="py-3">
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.designation}</div>
                        </TableCell>
                        <TableCell className="py-3 text-sm">{user.email}</TableCell>
                        <TableCell className="py-3">{user.mobile || "—"}</TableCell>
                        <TableCell className="py-3"><Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">{user.role}</Badge></TableCell>
                        <TableCell className="py-3">{user.assignedBlock}</TableCell>
                        <TableCell className="py-3"><UserStatusBadge status={user.status} /></TableCell>
                        <TableCell className="py-3 text-sm">{user.lastLogin}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" title={`View ${user.name}`} className="h-8 w-8 rounded-full text-teal-700 hover:bg-teal-100" onClick={() => { setEditingUser(user); setDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" title={`Edit ${user.name}`} className="h-8 w-8 rounded-full text-slate-700 hover:bg-slate-100" onClick={() => { setEditingUser(user); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" title={`Reset password for ${user.name}`} disabled={resetPasswordMutation.isPending} className="h-8 w-8 rounded-full text-emerald-700 hover:bg-emerald-50" onClick={() => void resetPasswordMutation.mutateAsync(user.email)}><KeyRound className="h-4 w-4" /></Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title={user.status === "Active" ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                              disabled={saveMutation.isPending}
                              className={user.status === "Active" ? "h-8 w-8 rounded-full text-amber-700 hover:bg-amber-50" : "h-8 w-8 rounded-full text-emerald-700 hover:bg-emerald-50"}
                              onClick={async () => {
                                if (saveMutation.isPending) return;
                                await saveMutation.mutateAsync({
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  role: ROLE_OPTIONS.find((option) => option.label === user.role)?.value || "field_officer",
                                  region: user.assignedBlock === "All Blocks" ? "" : user.assignedBlock,
                                  active: user.status !== "Active",
                                });
                              }}
                            >
                              {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title={`Delete ${user.name}`}
                              disabled={deleteMutation.isPending || deletingUserId === user.id}
                              className="h-8 w-8 rounded-full text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (deleteMutation.isPending || deletingUserId) return;
                                if (!window.confirm(`Delete user ${user.name}?`)) return;
                                setDeletingUserId(user.id);
                                deleteMutation.mutate(user);
                              }}
                            ><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900"><ShieldCheck className="h-5 w-5 text-teal-700" /> Security & Login Activity</CardTitle>
              <p className="text-xs font-medium text-muted-foreground">Account status and authentication monitoring.</p>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <SecurityMetric label="Last Login Time" value={latestLogin} />
              <SecurityMetric label="Account Status" value={`${activeUsers} active / ${inactiveUsers} inactive`} />
              <SecurityMetric label="Password Reset Option" value="Available for admin users" />
              <SecurityMetric label="Login Activity Tracking" value={`${adminUsers.reduce((sum, user) => sum + user.loginCount, 0)} tracked sessions`} />
              <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-3">
                <p className="text-sm font-semibold text-slate-900">Permission Control</p>
                <p className="mt-1 text-xs text-muted-foreground">Role and assigned block determine dashboard access, scheme entry permissions, and reporting visibility.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AddUserDialog({
  open,
  onOpenChange,
  initialUser,
  onSave,
  isSaving,
  blocks,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUser: AdminUserRecord | null;
  onSave: (input: Omit<UserDirectoryRecord, "createdAt" | "updatedAt"> & Partial<Pick<UserDirectoryRecord, "createdAt" | "updatedAt">>) => Promise<unknown>;
  isSaving: boolean;
  blocks: string[];
  onCreate: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    role: ROLE_OPTIONS.find((option) => option.label === initialUser?.role)?.value || ROLE_OPTIONS[0].value,
    region: initialUser?.assignedBlock && initialUser.assignedBlock !== "All Blocks" ? initialUser.assignedBlock : "",
    active: initialUser?.status !== "Inactive",
  });

  useEffect(() => {
    setSubmitting(false);
    setForm({
      name: initialUser?.name || "",
      email: initialUser?.email || "",
      role: ROLE_OPTIONS.find((option) => option.label === initialUser?.role)?.value || ROLE_OPTIONS[0].value,
      region: initialUser?.assignedBlock && initialUser.assignedBlock !== "All Blocks" ? initialUser.assignedBlock : "",
      active: initialUser?.status !== "Inactive",
    });
  }, [initialUser, open]);

  const submit = async () => {
    if (submitting || isSaving) return;
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name || !email || !form.role) {
      toast({ title: "Check user details", description: "Name, email and role are required.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Check user details", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        id: initialUser?.id,
        name,
        email,
        role: form.role,
        region: form.region,
        active: form.active,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button className="h-10 bg-teal-700 hover:bg-teal-800" disabled={isSaving || submitting} onClick={onCreate}><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialUser ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>Create a role-based account for district, block, or data-entry access.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormInput label="Full Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} placeholder="Enter full name" />
          <FormInput label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="user@epashu.gov" />
          <FormSelect label="Role" value={form.role} options={ROLE_OPTIONS.map((item) => item.label)} onChange={(value) => setForm((current) => ({ ...current, role: ROLE_OPTIONS.find((item) => item.label === value)?.value || current.role }))} />
          <FormSelect label="Assigned Block" value={form.region || "All Blocks"} options={blocks} onChange={(value) => setForm((current) => ({ ...current, region: value === "All Blocks" ? "" : value }))} />
          <FormInput label="Username" value={form.email.split("@")[0] || ""} onChange={() => {}} placeholder="username" />
          <FormSelect label="Status" value={form.active ? "Active" : "Inactive"} options={["Active", "Inactive"]} onChange={(value) => setForm((current) => ({ ...current, active: value === "Active" }))} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isSaving || submitting} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-teal-700 hover:bg-teal-800" disabled={isSaving || submitting} onClick={submit}>{isSaving || submitting ? "Saving..." : initialUser ? "Update User" : "Create User"}</Button>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FormInput({ label, placeholder = "", type = "text", value, onChange }: { label: string; placeholder?: string; type?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <Input type={type} placeholder={placeholder} className="h-10 rounded-lg" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FormSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const safeOptions = safeSelectOptions(options);
  const selectedValue = safeSelectValue(value, safeOptions, safeOptions[0] || "No options");
  return (
    <label className="space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <Select value={selectedValue} onValueChange={onChange}>
        <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
        <SelectContent>
          {safeOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  return (
    <Badge variant="outline" className={status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
      {status}
    </Badge>
  );
}

function SecurityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SettingsPanel() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["portalSettings"], queryFn: getPortalSettings, staleTime: 2 * 60 * 1000, refetchOnWindowFocus: true });
  const [form, setForm] = useState<PortalSettingsRecord>({
    id: "public-home",
    heroTitle: settings?.heroTitle || "",
    heroSubtitle: settings?.heroSubtitle || "",
    overviewLabel: settings?.overviewLabel || "",
    reportOne: settings?.reportOne || "",
    reportTwo: settings?.reportTwo || "",
    reportThree: settings?.reportThree || "",
  });

  const saveMutation = useMutation({
    mutationFn: upsertPortalSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portalSettings"] });
      toast({ title: "Saved", description: "Public page settings have been updated." });
    },
    onError: (error) => toast({ title: "Unable to save settings", description: error instanceof Error ? error.message : "Unexpected error", variant: "destructive" }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Settings" description="Update the public home page copy and report labels shown before login." />
        <Card className="border-teal-100 shadow-sm">
          <CardContent className="grid gap-4 p-4 md:grid-cols-2">
            <FormInput label="Public Title" value={form.heroTitle} onChange={(value) => setForm((current) => ({ ...current, heroTitle: value }))} placeholder="Public title" />
            <FormInput label="Overview Label" value={form.overviewLabel} onChange={(value) => setForm((current) => ({ ...current, overviewLabel: value }))} placeholder="Dashboard Overview" />
            <FormInput label="Public Subtitle" value={form.heroSubtitle} onChange={(value) => setForm((current) => ({ ...current, heroSubtitle: value }))} placeholder="Landing page description" />
            <FormInput label="Public Report 1" value={form.reportOne} onChange={(value) => setForm((current) => ({ ...current, reportOne: value }))} placeholder="Report title" />
            <FormInput label="Public Report 2" value={form.reportTwo} onChange={(value) => setForm((current) => ({ ...current, reportTwo: value }))} placeholder="Report title" />
            <FormInput label="Public Report 3" value={form.reportThree} onChange={(value) => setForm((current) => ({ ...current, reportThree: value }))} placeholder="Report title" />
          </CardContent>
          <CardContent className="flex justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={() => setForm({
              id: "public-home",
              heroTitle: settings?.heroTitle || "",
              heroSubtitle: settings?.heroSubtitle || "",
              overviewLabel: settings?.overviewLabel || "",
              reportOne: settings?.reportOne || "",
              reportTwo: settings?.reportTwo || "",
              reportThree: settings?.reportThree || "",
            })}>Reset</Button>
            <Button className="bg-teal-700 hover:bg-teal-800" onClick={() => saveMutation.mutate(form)}>Save Public Page Settings</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
