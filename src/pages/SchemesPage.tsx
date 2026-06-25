import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  IndianRupee,
  Layers3,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/useUser";
import {
  bulkUpsertSchemeDataRecords,
  createSchemeDataRecord,
  deleteSchemeDataRecord,
  listInstitutes,
  listSchemeBeneficiaryRecords,
  listSchemeDataRecords,
  updateSchemeDataRecord,
} from "@/lib/dataService";
import { collectSchemeNames, linkSchemeRecords } from "@/lib/schemeAnalytics";
import { safeSelectOptions, safeSelectValue } from "@/lib/selectOptions";
import type { InstituteRecord, SchemeBeneficiaryRecord, SchemeDataRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type SchemeForm = Omit<SchemeDataRecord, "id" | "createdAt" | "updatedAt" | "createdBy">;
type UploadSummary = { success: number; errors: string[] } | null;
type SchemeSortKey = keyof Pick<SchemeDataRecord, "financialYear" | "schemeName" | "block" | "instituteName" | "target" | "distributedUnits" | "totalBeneficiaries" | "physicalProgressPercentage">;
type SortDirection = "asc" | "desc";

const financialYears = ["2025-26", "2024-25", "2023-24"];
const schemeBlocks = ["Dantewada", "Kuakonda", "Katekalyan", "Geedam"];
const templateHeaders = ["Financial Year", "Scheme Name", "Institute Name", "Block", "Target", "Achievement", "SC Count", "ST Count", "OBC Count", "General Count", "Other Count", "Total Beneficiaries", "Physical Progress Percentage", "Remarks"];
const tablePageSize = 10;

const emptyForm: SchemeForm = {
  financialYear: financialYears[0],
  schemeName: "",
  block: "",
  village: "",
  instituteId: "",
  instituteName: "",
  target: 0,
  approvedCases: 0,
  distributedUnits: 0,
  pendingCases: 0,
  scCount: 0,
  stCount: 0,
  obcCount: 0,
  generalCount: 0,
  otherCount: 0,
  totalBeneficiaries: 0,
  financialProgressAmount: 0,
  physicalProgressPercentage: 0,
  remarks: "",
};

export default function SchemesPage() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [financialYear, setFinancialYear] = useState("All Financial Years");
  const [scheme, setScheme] = useState("All Schemes");
  const [block, setBlock] = useState("All Blocks");
  const [institute, setInstitute] = useState("All Institutes");
  const [search, setSearch] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<SchemeDataRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<SchemeDataRecord | null>(null);
  const [form, setForm] = useState<SchemeForm>({ ...emptyForm });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary>(null);
  const [sortKey, setSortKey] = useState<SchemeSortKey>("financialYear");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);

  const { data: records = [], error, isLoading } = useQuery({
    queryKey: ["schemeDataRecords"],
    queryFn: listSchemeDataRecords,
    initialData: [] as SchemeDataRecord[],
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: beneficiaryRecords = [] } = useQuery({
    queryKey: ["schemeBeneficiaryRecords"],
    queryFn: listSchemeBeneficiaryRecords,
    initialData: [] as SchemeBeneficiaryRecord[],
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: institutes = [] } = useQuery({
    queryKey: ["institutes"],
    queryFn: listInstitutes,
    initialData: [] as InstituteRecord[],
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const schemeNames = useMemo(() => collectSchemeNames(records, beneficiaryRecords), [beneficiaryRecords, records]);

  const canAdd = Boolean(user);
  const canDelete = Boolean(user);
  const canEdit = () => Boolean(user);

  const options = useMemo(() => ({
    years: unique(records.map((item) => item.financialYear)),
    blocks: unique([...schemeBlocks, ...records.map((item) => item.block), ...institutes.map((item) => item.block)]),
    institutes: unique([
      ...records.filter((item) => block === "All Blocks" || item.block === block).map((item) => displayInstituteName(item)),
      ...institutes.filter((item) => block === "All Blocks" || item.block === block).map((item) => item.instituteName),
    ]),
  }), [block, institutes, records]);

  useEffect(() => {
    setPage(1);
  }, [block, deferredSearch, financialYear, institute, scheme]);

  const filteredRecords = useMemo(() => records.filter((item) => (
    (financialYear === "All Financial Years" || item.financialYear === financialYear)
    && (scheme === "All Schemes" || item.schemeName === scheme)
    && (block === "All Blocks" || item.block === block)
    && (institute === "All Institutes" || displayInstituteName(item) === institute)
    && `${item.schemeName} ${item.block} ${displayInstituteName(item)} ${item.financialYear}`.toLowerCase().includes(deferredSearch.trim().toLowerCase())
  )), [block, deferredSearch, financialYear, institute, records, scheme]);

  const filteredBeneficiaries = useMemo(() => beneficiaryRecords.filter((item) => (
    (financialYear === "All Financial Years" || isDateInFinancialYear(item.dateOfApproval || item.dateOfDistribution, financialYear))
    && (scheme === "All Schemes" || item.schemeName === scheme)
    && (block === "All Blocks" || item.block === block)
  )), [beneficiaryRecords, block, financialYear, scheme]);

  const dashboardRecords = useMemo(() => linkSchemeRecords(filteredRecords, filteredBeneficiaries), [filteredBeneficiaries, filteredRecords]);

  const sortedRecords = useMemo(() => [...dashboardRecords].sort((left, right) => compareSchemeValues(left[sortKey], right[sortKey], sortDirection)), [dashboardRecords, sortDirection, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / tablePageSize));
  const pageIndex = Math.min(page, totalPages);
  const paginatedRecords = useMemo(() => sortedRecords.slice((pageIndex - 1) * tablePageSize, pageIndex * tablePageSize), [pageIndex, sortedRecords]);
  const pageStart = sortedRecords.length ? (pageIndex - 1) * tablePageSize + 1 : 0;
  const pageEnd = Math.min(pageIndex * tablePageSize, sortedRecords.length);

  const chartRows = useMemo(() => schemeNames.map((name) => {
    const schemeRecords = dashboardRecords.filter((item) => item.schemeName === name);
    const schemeBeneficiaries = filteredBeneficiaries.filter((item) => item.schemeName === name);
    const target = sum(schemeRecords, "target");
    const achievement = sumBeneficiaryUnits(schemeBeneficiaries) || sum(schemeRecords, "distributedUnits");
    return {
      name,
      shortName: shortenScheme(name),
      target,
      achievement,
      progress: target ? Math.round((achievement / target) * 100) : 0,
    };
  }).filter((item) => item.target || item.achievement), [dashboardRecords, filteredBeneficiaries, schemeNames]);

  const casteRows = useMemo(() => [
    { name: "SC", count: sum(dashboardRecords, "scCount") },
    { name: "ST", count: sum(dashboardRecords, "stCount") },
    { name: "OBC", count: sum(dashboardRecords, "obcCount") },
    { name: "General", count: sum(dashboardRecords, "generalCount") },
    { name: "Other", count: sum(dashboardRecords, "otherCount") },
  ].filter((item) => item.count > 0), [dashboardRecords]);

  const totals = useMemo(() => {
    const target = sum(dashboardRecords, "target");
    const achievement = sum(dashboardRecords, "distributedUnits");
    return {
      target,
      achievement,
      financial: sum(dashboardRecords, "financialProgressAmount"),
      totalSchemes: unique(dashboardRecords.map((item) => item.schemeName)).length,
      totalBeneficiaries: filteredBeneficiaries.length,
      coverage: target ? Math.round((achievement / target) * 100) : 0,
    };
  }, [dashboardRecords, filteredBeneficiaries.length]);

  const hasRecords = dashboardRecords.length > 0;
  const hasAnalytics = hasRecords && chartRows.length > 0;
  const lastUpdated = useMemo(() => {
    const timestamps = [...records.map((item) => item.updatedAt), ...beneficiaryRecords.map((item) => item.updatedAt)]
      .map((value) => new Date(value).getTime())
      .filter((value) => Number.isFinite(value));
    if (!timestamps.length) return "Not updated yet";
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(Math.max(...timestamps)));
  }, [beneficiaryRecords, records]);

  const refreshLiveData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["schemeDataRecords"] }),
      queryClient.invalidateQueries({ queryKey: ["schemeBeneficiaryRecords"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] }),
      queryClient.invalidateQueries({ queryKey: ["landingPageData"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (input: SchemeForm | SchemeDataRecord) => editingRecord
      ? updateSchemeDataRecord(input as SchemeDataRecord)
      : createSchemeDataRecord(input as SchemeForm),
    onSuccess: async () => {
      await refreshLiveData();
      setFormOpen(false);
      setEditingRecord(null);
      setForm({ ...emptyForm });
      toast({ title: "Scheme record saved", description: "Dashboard analytics have been refreshed." });
    },
    onError: (mutationError) => toast({ title: "Unable to save record", description: getErrorMessage(mutationError), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchemeDataRecord,
    onSuccess: async () => {
      await refreshLiveData();
      toast({ title: "Scheme record deleted" });
    },
    onError: (mutationError) => toast({ title: "Unable to delete record", description: getErrorMessage(mutationError), variant: "destructive" }),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkUpsertSchemeDataRecords,
    onSuccess: async (result) => {
      await refreshLiveData();
      setUploadSummary({ success: result.saved, errors: [] });
      toast({ title: "Excel upload complete", description: `${result.saved} scheme records saved.` });
    },
    onError: (mutationError) => setUploadSummary({ success: 0, errors: [getErrorMessage(mutationError)] }),
  });

  const submitForm = async () => {
    setFormSubmitted(true);
    const formWithInstitute = applyInstituteToSchemeForm(form, institutes, user?.role, user?.region);
    const formError = validateSchemeRecord(formWithInstitute, records, editingRecord?.id);
    if (formError) {
      toast({ title: "Check scheme record", description: formError, variant: "destructive" });
      return;
    }
    const normalized = normalizeSchemeForm(formWithInstitute);
    await saveMutation.mutateAsync(editingRecord ? { ...editingRecord, ...normalized } : normalized);
  };

  const startAdd = () => {
    setEditingRecord(null);
    setFormSubmitted(false);
    setForm(applyInstituteToSchemeForm({ ...emptyForm }, institutes, user?.role, user?.region));
    setFormOpen(true);
  };

  const startEdit = (record: SchemeDataRecord) => {
    setEditingRecord(record);
    setFormSubmitted(false);
    setForm({
      financialYear: record.financialYear,
      schemeName: record.schemeName,
      block: record.block,
      village: record.village,
      instituteId: record.instituteId,
      instituteName: displayInstituteName(record),
      target: record.target,
      approvedCases: record.approvedCases,
      distributedUnits: record.distributedUnits,
      pendingCases: record.pendingCases,
      scCount: record.scCount,
      stCount: record.stCount,
      obcCount: record.obcCount,
      generalCount: record.generalCount,
      otherCount: record.otherCount,
      totalBeneficiaries: record.totalBeneficiaries,
      financialProgressAmount: record.financialProgressAmount,
      physicalProgressPercentage: record.physicalProgressPercentage,
      remarks: record.remarks,
    });
    setFormOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploadSummary(null);
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setUploadSummary({ success: 0, errors: ["Upload an Excel .xlsx file."] });
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
      const parsed = rawRows.map((row) => normalizeSchemeForm(applyInstituteToSchemeForm(toSchemeRecord(row), institutes, user?.role, user?.region)));
      const errors = parsed.flatMap((item, index) => {
        const rowError = validateSchemeRecord(item, records);
        if (rowError) return [`Row ${index + 2}: ${rowError}`];
        if ((user?.role === "block_officer" || user?.role === "field_officer") && !matchesBlock(user.region, item.block)) {
          return [`Row ${index + 2}: block officers can only upload records for their assigned block.`];
        }
        return [];
      });

      if (!parsed.length) errors.push("The workbook does not contain any data rows.");
      if (errors.length) {
        setUploadSummary({ success: 0, errors });
        return;
      }
      await bulkMutation.mutateAsync(parsed);
    } catch (uploadError) {
      setUploadSummary({ success: 0, errors: [getErrorMessage(uploadError)] });
    }
  };

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const exampleRow = normalizeSchemeForm({
      financialYear: financialYears[0],
      schemeName: schemeNames[0] || "Scheme Name",
      instituteId: "",
      instituteName: "VH Dantewada",
      block: "Dantewada",
      village: "VH Dantewada",
      target: 100,
      distributedUnits: 70,
      approvedCases: 70,
      pendingCases: 30,
      scCount: 10,
      stCount: 35,
      obcCount: 15,
      generalCount: 8,
      otherCount: 2,
      totalBeneficiaries: 70,
      financialProgressAmount: 0,
      physicalProgressPercentage: 0,
      remarks: "Replace this example row",
    });
    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, [exampleRow.financialYear, exampleRow.schemeName, exampleRow.instituteName, exampleRow.block, exampleRow.target, exampleRow.distributedUnits, exampleRow.scCount, exampleRow.stCount, exampleRow.obcCount, exampleRow.generalCount, exampleRow.otherCount, exampleRow.totalBeneficiaries, exampleRow.physicalProgressPercentage, exampleRow.remarks]]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scheme Data");
    XLSX.writeFile(workbook, "livestock-scheme-data-template.xlsx");
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(dashboardRecords.map(toExportRow));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scheme Data");
    XLSX.writeFile(workbook, "livestock-scheme-monitoring.xlsx");
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Livestock Scheme Monitoring Report", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Scheme", "Block", "Institute", "Target", "Achievement", "SC", "ST", "OBC", "General", "Other", "Total"]],
      body: dashboardRecords.map((item) => [item.schemeName, item.block, displayInstituteName(item), item.target, item.distributedUnits, item.scCount, item.stCount, item.obcCount, item.generalCount, item.otherCount, item.totalBeneficiaries]),
      headStyles: { fillColor: [15, 118, 110] },
    });
    doc.save("livestock-scheme-monitoring.pdf");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Management</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-emerald-700">Livestock Scheme Monitoring</span>
        </div>

        <PageHeader title="Livestock Scheme Monitoring" description="Clean district view for scheme progress, beneficiary coverage, and record management.">
          <div className="grid w-full gap-2 sm:flex sm:w-auto">
            <Button variant="outline" onClick={() => void exportExcel()} className="h-10 w-full sm:w-auto"><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
            <Button variant="outline" onClick={() => void exportPdf()} className="h-10 w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> PDF</Button>
            {canAdd ? <Button onClick={startAdd} className="h-10 w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Scheme</Button> : null}
          </div>
        </PageHeader>

        {error ? <Card className="border-red-200"><CardContent className="p-4 text-sm text-red-700">Unable to load scheme data: {getErrorMessage(error)}</CardContent></Card> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <CompactKpi label="Total Schemes" value={totals.totalSchemes.toLocaleString()} hint="Unique active schemes" icon={Layers3} />
          <CompactKpi label="Total Beneficiaries" value={totals.totalBeneficiaries.toLocaleString()} hint="Beneficiary records" icon={Users} tone="blue" />
          <CompactKpi label="Coverage" value={`${totals.coverage}%`} hint={`${totals.achievement.toLocaleString()} of ${totals.target.toLocaleString()} units`} icon={CheckCircle2} tone="green" />
          <CompactKpi label="Financial Progress" value={formatCurrency(totals.financial)} hint="Recorded expenditure" icon={IndianRupee} tone="green" />
          <CompactKpi label="Last Updated" value={lastUpdated} hint="Latest saved record" icon={CalendarClock} tone="slate" />
        </div>

        <Card className="sticky top-16 z-20 border-emerald-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1.2fr_auto]">
            <FilterSelect value={financialYear} onChange={setFinancialYear} allLabel="All Financial Years" options={options.years} />
            <FilterSelect value={scheme} onChange={setScheme} allLabel="All Schemes" options={schemeNames} />
            <FilterSelect value={block} onChange={(value) => { setBlock(value); setInstitute("All Institutes"); }} allLabel="All Blocks" options={options.blocks} />
            <FilterSelect value={institute} onChange={setInstitute} allLabel="All Institutes" options={options.institutes} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="h-10 rounded-lg bg-background pl-9" />
            </div>
            <Button variant="outline" onClick={() => setManageOpen(true)} className="h-10 whitespace-nowrap">
              <Settings2 className="mr-2 h-4 w-4" /> Manage
            </Button>
          </CardContent>
        </Card>

        {hasAnalytics ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Target vs Achievement</CardTitle>
              </CardHeader>
              <CardContent className="h-72 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRows} margin={{ top: 8, left: -12, right: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="shortName" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} width={42} />
                    <Tooltip content={<SchemeChartTooltip />} cursor={{ fill: "rgba(20, 184, 166, 0.08)" }} />
                    <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} iconType="circle" />
                    <Bar name="Target" dataKey="target" fill="#0f766e" radius={[6, 6, 0, 0]} />
                    <Bar name="Achievement" dataKey="achievement" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Physical Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {chartRows.slice(0, 6).map((item) => <div key={item.name} className="space-y-1.5 rounded-xl border border-border/60 bg-background p-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{item.name}</span><span className="font-semibold text-emerald-700">{item.progress}%</span></div><Progress value={item.progress} className="h-2 bg-emerald-100" /></div>)}
              </CardContent>
            </Card>
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Caste-wise Beneficiary Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-72 pt-2">
                {casteRows.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={casteRows} margin={{ top: 8, left: -12, right: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} width={42} />
                      <Tooltip formatter={(value) => Number(value).toLocaleString("en-IN")} />
                      <Bar name="Beneficiaries" dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No caste-wise counts available yet.</div>}
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-emerald-50 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold">Scheme Records</CardTitle>
              <p className="text-xs text-muted-foreground">Showing {pageStart ? `${pageStart}-${pageEnd}` : "0"} of {sortedRecords.length} records</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {hasRecords ? (
              <>
                <SchemeRecordsTable
                  records={paginatedRecords}
                  isLoading={isLoading}
                  canDelete={canDelete}
                  canEdit={canEdit}
                  onView={setViewRecord}
                  onEdit={startEdit}
                  onDelete={(record) => {
                    if (window.confirm(`Delete ${record.schemeName} record for ${displayInstituteName(record)}?`)) deleteMutation.mutate(record.id);
                  }}
                  onSort={(key) => {
                    setSortKey((currentKey) => {
                      if (currentKey === key) {
                        setSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc");
                        return currentKey;
                      }
                      setSortDirection("asc");
                      return key;
                    });
                    setPage(1);
                  }}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                />
                <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">Showing {pageStart ? `${pageStart}-${pageEnd}` : "0"} of {sortedRecords.length} records</p>
                  <Pagination className="mx-0 w-full justify-start sm:w-auto sm:justify-end">
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.max(1, current - 1)); }} className={pageIndex <= 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                      {paginationItems(pageIndex, totalPages).map((item, index) => item === "ellipsis" ? <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem> : <PaginationItem key={item}><PaginationLink href="#" isActive={pageIndex === item} onClick={(event) => { event.preventDefault(); setPage(item); }}><span>{item}</span></PaginationLink></PaginationItem>)}
                      <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.min(totalPages, current + 1)); }} className={pageIndex >= totalPages ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            ) : (
              <EmptyDashboardState canAdd={canAdd} onAdd={startAdd} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>Scheme Tools</DialogTitle><DialogDescription>Add records, download the template, or upload validated Excel data.</DialogDescription></DialogHeader>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="upload">Bulk Upload</TabsTrigger><TabsTrigger value="records">Records</TabsTrigger></TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div className="rounded-xl border border-dashed p-5">
                <p className="text-sm font-medium">Upload Scheme Data Excel workbook</p>
                <p className="mt-1 text-xs text-muted-foreground">Download the template, complete its rows, then upload the .xlsx file. Every row is validated before saving.</p>
                <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                  <Button variant="outline" onClick={() => void downloadTemplate()} className="h-10 w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Download Template</Button>
                  {canAdd ? <Label className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"><Upload className="mr-2 h-4 w-4" /> Upload File<Input className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file); event.target.value = ""; }} /></Label> : null}
                </div>
              </div>
              {uploadSummary ? <UploadResult summary={uploadSummary} /> : null}
            </TabsContent>
            <TabsContent value="records" className="space-y-4">
              <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:items-center">
                <div><p className="text-sm font-medium">Scheme records</p><p className="text-xs text-muted-foreground">{canAdd ? "Create a new live scheme record." : "Your role has view-only access."}</p></div>
                {canAdd ? <Button onClick={startAdd} className="h-10 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Record</Button> : null}
              </div>
              <SchemeRecordsTable records={records} isLoading={isLoading} canDelete={canDelete} canEdit={canEdit} onView={setViewRecord} onEdit={startEdit} onDelete={(record) => {
                if (window.confirm(`Delete ${record.schemeName} record for ${displayInstituteName(record)}?`)) deleteMutation.mutate(record.id);
              }} onSort={(key) => {
                setSortKey((currentKey) => {
                  if (currentKey === key) {
                    setSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc");
                    return currentKey;
                  }
                  setSortDirection("asc");
                  return key;
                });
                setPage(1);
              }} sortKey={sortKey} sortDirection={sortDirection} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRecord ? "Edit Scheme Record" : "Add Scheme"}</DialogTitle><DialogDescription>Fields are saved directly to the Schemes sheet.</DialogDescription></DialogHeader>
          <SchemeRecordForm form={form} setForm={setForm} institutes={institutes} schemeNames={schemeNames} submitted={formSubmitted} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="h-10 w-full sm:w-auto">Cancel</Button>
            <Button onClick={submitForm} disabled={saveMutation.isPending} className="h-10 w-full sm:min-w-36 sm:w-auto">{saveMutation.isPending ? "Saving..." : "Save Scheme"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewRecord} onOpenChange={(open) => { if (!open) setViewRecord(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Scheme Record Details</DialogTitle></DialogHeader>{viewRecord ? <RecordDetails record={viewRecord} /> : null}</DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function CompactKpi({ label, value, hint, icon: Icon, tone = "primary" }: { label: string; value: string | number; hint: string; icon: typeof Layers3; tone?: "primary" | "blue" | "green" | "slate" }) {
  const tones = {
    primary: "bg-teal-50 text-teal-700",
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <Card className="border-emerald-100 shadow-sm"><CardContent className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 truncate text-xl font-bold tracking-tight">{value}</p><p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p></div><div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}><Icon className="h-5 w-5" /></div></CardContent></Card>;
}

function SchemeRecordForm({ form, setForm, institutes, schemeNames, submitted }: { form: SchemeForm; setForm: React.Dispatch<React.SetStateAction<SchemeForm>>; institutes: InstituteRecord[]; schemeNames: string[]; submitted: boolean }) {
  const set = (key: keyof SchemeForm, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const activeInstitutes = institutes.filter((item) => item.status === "Active");
  const blockOptions = unique([...schemeBlocks, ...activeInstitutes.map((item) => item.block)]);
  const selectedBlockInstitutes = form.block ? activeInstitutes.filter((item) => item.block === form.block) : activeInstitutes;
  const instituteOptions = selectedBlockInstitutes.map((item) => item.instituteName);
  const total = casteTotal(form);
  const setBlock = (blockName: string) => {
    setForm((current) => {
      const selectedInstitute = activeInstitutes.find((item) => item.instituteName === current.instituteName);
      const keepInstitute = selectedInstitute?.block === blockName;
      return {
        ...current,
        block: blockName,
        instituteId: keepInstitute ? current.instituteId : "",
        instituteName: keepInstitute ? current.instituteName : "",
        village: keepInstitute ? current.village : "",
      };
    });
  };
  const setInstitute = (name: string) => {
    const selected = activeInstitutes.find((item) => item.instituteName === name);
    setForm((current) => ({ ...current, instituteId: selected?.id || "", instituteName: name, village: name, block: selected?.block || current.block }));
  };
  const errors = submitted ? validateSchemeRecord(form) : "";
  const fieldError = submitted && errors ? errors : "";
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <FormField label="Financial Year" required error={fieldError}><FilterSelect value={form.financialYear} onChange={(value) => set("financialYear", value)} options={financialYears} /></FormField>
    <FormField label="Scheme Name" required error={fieldError}><Input value={form.schemeName} onChange={(event) => set("schemeName", event.target.value)} list="scheme-name-options" className="h-10 rounded-lg" /><datalist id="scheme-name-options">{schemeNames.map((name) => <option key={name} value={name} />)}</datalist></FormField>
    <FormField label="Block" error={fieldError}>
      <FilterSelect value={form.block} onChange={setBlock} options={blockOptions} />
    </FormField>
    <FormField label="Institute Name" error={fieldError}>
      {instituteOptions.length ? (
        <FilterSelect value={form.instituteName || displayInstituteName(form)} onChange={setInstitute} options={instituteOptions} />
      ) : (
        <Input value={form.instituteName || displayInstituteName(form)} onChange={(event) => setInstitute(event.target.value)} placeholder="Enter institute name" className="h-10 rounded-lg" />
      )}
    </FormField>
    <FormField label="Target" required><NumberInput value={form.target} onChange={(value) => set("target", value)} /></FormField>
    <FormField label="Achievement"><NumberInput value={form.distributedUnits} onChange={(value) => { set("distributedUnits", value); set("approvedCases", value); }} /></FormField>
    <FormField label="SC Count"><NumberInput value={form.scCount} onChange={(value) => set("scCount", value)} /></FormField>
    <FormField label="ST Count"><NumberInput value={form.stCount} onChange={(value) => set("stCount", value)} /></FormField>
    <FormField label="OBC Count"><NumberInput value={form.obcCount} onChange={(value) => set("obcCount", value)} /></FormField>
    <FormField label="General Count"><NumberInput value={form.generalCount} onChange={(value) => set("generalCount", value)} /></FormField>
    <FormField label="Other Count"><NumberInput value={form.otherCount} onChange={(value) => set("otherCount", value)} /></FormField>
    <FormField label="Total Beneficiaries"><Input value={total} disabled className="h-10 rounded-lg" /></FormField>
    <FormField label="Remarks" className="sm:col-span-2 lg:col-span-3"><Textarea value={form.remarks} onChange={(event) => set("remarks", event.target.value)} className="min-h-24 rounded-lg" /></FormField>
    {submitted && errors ? <p className="sm:col-span-2 lg:col-span-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors}</p> : null}
  </div>;
}

function SchemeRecordsTable({ records, isLoading, canDelete, canEdit, onView, onEdit, onDelete, onSort, sortKey, sortDirection }: { records: SchemeDataRecord[]; isLoading: boolean; canDelete: boolean; canEdit: (record: SchemeDataRecord) => boolean; onView: (record: SchemeDataRecord) => void; onEdit: (record: SchemeDataRecord) => void; onDelete: (record: SchemeDataRecord) => void; onSort: (key: SchemeSortKey) => void; sortKey: SchemeSortKey; sortDirection: SortDirection }) {
  const headers: Array<{ label: string; key: SchemeSortKey; className?: string }> = [
    { label: "Scheme", key: "schemeName", className: "min-w-[210px]" },
    { label: "Block", key: "block" },
    { label: "Institute", key: "instituteName" },
    { label: "Target", key: "target" },
    { label: "Achievement", key: "distributedUnits" },
    { label: "Beneficiaries", key: "totalBeneficiaries" },
    { label: "Coverage", key: "physicalProgressPercentage" },
  ];

  return <Table><TableHeader><TableRow>{headers.map((header) => <TableHead key={header.label} className={cn("whitespace-nowrap py-3", header.className)}><button type="button" onClick={() => onSort(header.key)} className="inline-flex items-center gap-1 text-left font-semibold hover:text-emerald-700">{header.label}{sortKey === header.key ? sortDirection === "asc" ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" /> : null}</button></TableHead>)}<TableHead className="py-3 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
    {records.map((record) => <TableRow key={record.id} className="hover:bg-emerald-50/60"><TableCell className="py-3 font-medium"><div>{record.schemeName}</div><div className="text-xs text-muted-foreground">{record.financialYear}</div></TableCell><TableCell className="py-3">{record.block}</TableCell><TableCell className="py-3">{displayInstituteName(record)}</TableCell><TableCell className="py-3">{record.target}</TableCell><TableCell className="py-3">{record.distributedUnits}</TableCell><TableCell className="py-3">{record.totalBeneficiaries}</TableCell><TableCell className="py-3"><div className="flex min-w-24 items-center gap-2"><Progress value={record.physicalProgressPercentage} className="h-2" /><span className="text-xs font-semibold text-emerald-700">{record.physicalProgressPercentage}%</span></div></TableCell><TableCell className="py-3"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="View record" onClick={() => onView(record)} className="rounded-full"><Eye className="h-4 w-4" /></Button>{canEdit(record) ? <Button size="icon" variant="ghost" title="Edit record" onClick={() => onEdit(record)} className="rounded-full"><Pencil className="h-4 w-4" /></Button> : null}{canDelete ? <Button size="icon" variant="ghost" title="Delete record" onClick={() => onDelete(record)} className="rounded-full text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button> : null}</div></TableCell></TableRow>)}
    {!records.length && isLoading ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Loading scheme data...</TableCell></TableRow> : null}
  </TableBody></Table>;
}

function EmptyDashboardState({ canAdd, onAdd }: { canAdd: boolean; onAdd: () => void }) {
  return <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center"><div className="relative mb-5 h-28 w-36"><div className="absolute bottom-0 left-3 h-20 w-28 rounded-2xl border bg-emerald-50 shadow-sm" /><div className="absolute left-8 top-4 h-16 w-24 rounded-2xl border bg-white shadow-sm" /><div className="absolute right-4 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700"><Sparkles className="h-5 w-5" /></div></div><p className="text-base font-semibold">No scheme records found</p><p className="mt-2 max-w-md text-sm text-muted-foreground">Charts are hidden until scheme records are available. Add a new scheme or upload an Excel workbook to start monitoring coverage.</p>{canAdd ? <Button onClick={onAdd} className="mt-5 bg-emerald-700 hover:bg-emerald-800"><Plus className="mr-2 h-4 w-4" /> Add First Scheme</Button> : null}</div>;
}

function FilterSelect({ value, onChange, options, allLabel }: { value: string; onChange: (value: string) => void; options: string[]; allLabel?: string }) {
  const safeOptions = safeSelectOptions(options);
  const fallback = allLabel || safeOptions[0] || "No options";
  const selectedValue = safeSelectValue(value, safeOptions, fallback);
  return <Select value={selectedValue} onValueChange={onChange}><SelectTrigger className="h-10 rounded-lg bg-background"><SelectValue /></SelectTrigger><SelectContent>{allLabel ? <SelectItem value={allLabel}>{allLabel}</SelectItem> : null}{safeOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}
function FormField({ label, children, className = "", required = false, error }: { label: string; children: React.ReactNode; className?: string; required?: boolean; error?: string }) { return <div className={className}><Label className="flex items-center gap-1 text-sm font-medium">{label}{required ? <span className="text-red-500">*</span> : null}</Label><div className="mt-1">{children}</div>{error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}</div>; }
function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) { return <Input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 rounded-lg" />; }
function SchemeChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) { if (!active || !payload?.length) return null; return <div className="rounded-xl border bg-background px-3 py-2 shadow-lg"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="text-sm font-medium">Target: {Number(payload[0]?.value || 0).toLocaleString()}</p><p className="text-sm font-medium">Achievement: {Number(payload[1]?.value || 0).toLocaleString()}</p></div>; }
function UploadResult({ summary }: { summary: NonNullable<UploadSummary> }) { return <div className={`rounded-xl border p-4 text-sm ${summary.errors.length ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><p className="font-semibold">{summary.errors.length ? "Upload validation failed" : "Upload successful"}</p><p className="mt-1">{summary.success} records saved. {summary.errors.length} errors found.</p>{summary.errors.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{summary.errors.slice(0, 12).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : null}</div>; }
function RecordDetails({ record }: { record: SchemeDataRecord }) { return <div className="grid gap-3 text-sm sm:grid-cols-2">{Object.entries(toExportRow(record)).map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1">{String(value || "-")}</p></div>)}</div>; }
function unique(items: string[]) { return Array.from(new Set(items.filter(Boolean))).sort(); }
function sum(records: SchemeDataRecord[], key: keyof SchemeDataRecord) { return records.reduce((total, item) => total + Number(item[key] || 0), 0); }
function sumBeneficiaryUnits(records: SchemeBeneficiaryRecord[]) { return records.reduce((total, item) => total + Number(item.unitsDistributed || 0), 0); }
function isDateInFinancialYear(value: string, financialYear: string) { const year = Number(financialYear.slice(0, 4)); const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return false; const start = new Date(year, 3, 1); const end = new Date(year + 1, 2, 31, 23, 59, 59); return date >= start && date <= end; }
function shortenScheme(name: string) { return name.replace(" Distribution", "").replace("Chhattisgarh ", "").replace(" Yojana", ""); }
function formatCurrency(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function getErrorMessage(error: unknown) { return error instanceof Error ? error.message : "Unexpected error"; }
function matchesBlock(region: string, block: string) { const own = String(region || "").toLowerCase(); const target = String(block || "").toLowerCase(); return !!own && !!target && (own.includes(target) || target.includes(own)); }
function compareSchemeValues(left: unknown, right: unknown, direction: SortDirection) { const leftValue = typeof left === "number" ? left : String(left ?? "").toLowerCase(); const rightValue = typeof right === "number" ? right : String(right ?? "").toLowerCase(); if (leftValue === rightValue) return 0; const comparison = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue)); return direction === "asc" ? comparison : -comparison; }
function paginationItems(page: number, totalPages: number) { if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1); const items: Array<number | "ellipsis"> = [1]; const start = Math.max(2, page - 1); const end = Math.min(totalPages - 1, page + 1); if (start > 2) items.push("ellipsis"); for (let index = start; index <= end; index += 1) items.push(index); if (end < totalPages - 1) items.push("ellipsis"); items.push(totalPages); return items; }
function validateSchemeRecord(record: SchemeForm | Partial<SchemeDataRecord>, existingRecords: SchemeDataRecord[] = [], currentId?: string) { if (!record.financialYear || !record.schemeName) return "Financial year and scheme name are required."; const duplicate = existingRecords.some((item) => item.id !== currentId && item.financialYear.trim().toLowerCase() === String(record.financialYear).trim().toLowerCase() && item.schemeName.trim().toLowerCase() === String(record.schemeName).trim().toLowerCase() && item.block.trim().toLowerCase() === String(record.block || "").trim().toLowerCase() && displayInstituteName(item).toLowerCase() === displayInstituteName(record).toLowerCase()); if (duplicate) return "A scheme record for this financial year, scheme, block, and institute already exists."; const values = [record.target, record.approvedCases, record.distributedUnits, record.pendingCases, record.scCount, record.stCount, record.obcCount, record.generalCount, record.otherCount, record.totalBeneficiaries, record.financialProgressAmount, record.physicalProgressPercentage]; if (values.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) return "All numeric fields must contain non-negative numbers."; if (Number(record.distributedUnits) > Number(record.target)) return "Achievement cannot exceed target."; return ""; }
function applyInstituteToSchemeForm(record: SchemeForm, institutes: InstituteRecord[], role?: string, region?: string): SchemeForm { const active = institutes.filter((item) => item.status === "Active"); const currentName = displayInstituteName(record); const selected = currentName ? active.find((item) => item.instituteName === currentName) : active.find((item) => role === "block_officer" || role === "field_officer" ? matchesBlock(String(region || ""), item.block) : true); const instituteName = currentName || selected?.instituteName || ""; const block = selected?.block || record.block || (role === "block_officer" || role === "field_officer" ? String(region || "").trim() : ""); return { ...record, instituteId: selected?.id || record.instituteId || "", instituteName, village: instituteName || record.village, block }; }
function calculateSchemeProgress(record: Pick<SchemeForm, "target" | "approvedCases" | "distributedUnits">) { const target = Number(record.target || 0); const approvedCases = Number(record.approvedCases || 0); const distributedUnits = Number(record.distributedUnits || 0); return { pendingCases: Math.max(approvedCases - distributedUnits, 0), physicalProgressPercentage: target ? Math.round((distributedUnits / target) * 100) : 0 }; }
function normalizeSchemeForm(record: SchemeForm): SchemeForm { const totalBeneficiaries = casteTotal(record); const distributedUnits = Math.max(0, Number(record.distributedUnits || 0)); const normalized = { ...record, instituteName: displayInstituteName(record), village: displayInstituteName(record), target: Math.max(0, Number(record.target || 0)), approvedCases: distributedUnits, distributedUnits, scCount: Math.max(0, Number(record.scCount || 0)), stCount: Math.max(0, Number(record.stCount || 0)), obcCount: Math.max(0, Number(record.obcCount || 0)), generalCount: Math.max(0, Number(record.generalCount || 0)), otherCount: Math.max(0, Number(record.otherCount || 0)), totalBeneficiaries, financialProgressAmount: Math.max(0, Number(record.financialProgressAmount || 0)) }; const progress = calculateSchemeProgress(normalized); return { ...normalized, pendingCases: 0, physicalProgressPercentage: progress.physicalProgressPercentage }; }
function normalizeHeader(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }
function toSchemeRecord(row: Record<string, unknown>): SchemeForm { const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])); const text = (key: string) => String(normalized[normalizeHeader(key)] ?? "").trim(); const number = (key: string) => Number(normalized[normalizeHeader(key)] ?? 0); const instituteName = text("Institute Name") || text("Village"); const achievement = number("Achievement") || number("Distributed Units"); return { financialYear: text("Financial Year"), schemeName: text("Scheme Name"), block: text("Block"), village: instituteName, instituteId: text("Institute ID"), instituteName, target: number("Target"), approvedCases: achievement, distributedUnits: achievement, pendingCases: number("Pending Cases"), scCount: number("SC Count"), stCount: number("ST Count"), obcCount: number("OBC Count"), generalCount: number("General Count"), otherCount: number("Other Count"), totalBeneficiaries: number("Total Beneficiaries"), financialProgressAmount: number("Financial Progress Amount"), physicalProgressPercentage: number("Physical Progress Percentage"), remarks: text("Remarks") }; }
function toExportRow(record: SchemeDataRecord) { return { "Financial Year": record.financialYear, "Scheme Name": record.schemeName, Block: record.block, "Institute Name": displayInstituteName(record), Target: record.target, Achievement: record.distributedUnits, "SC Count": record.scCount, "ST Count": record.stCount, "OBC Count": record.obcCount, "General Count": record.generalCount, "Other Count": record.otherCount, "Total Beneficiaries": record.totalBeneficiaries, "Physical Progress Percentage": record.physicalProgressPercentage, Remarks: record.remarks }; }
function displayInstituteName(record: Partial<SchemeDataRecord> | Partial<SchemeForm>) { return String(record.instituteName || record.village || "").trim(); }
function casteTotal(record: Partial<Pick<SchemeDataRecord, "scCount" | "stCount" | "obcCount" | "generalCount" | "otherCount">>) { return Number(record.scCount || 0) + Number(record.stCount || 0) + Number(record.obcCount || 0) + Number(record.generalCount || 0) + Number(record.otherCount || 0); }
