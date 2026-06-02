import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import {
  bulkUpsertSchemeDataRecords,
  createSchemeDataRecord,
  deleteSchemeDataRecord,
  listSchemeDataRecords,
  listSchemeBeneficiaryRecords,
  updateSchemeDataRecord,
} from "@/lib/dataService";
import type { SchemeBeneficiaryRecord, SchemeDataRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock3, Download, Eye, FileSpreadsheet, IndianRupee, Pencil, Plus, Search, Settings2, Target, Trash2, Upload, Users } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, ChevronUp, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

type SchemeForm = Omit<SchemeDataRecord, "id" | "createdAt" | "updatedAt" | "createdBy">;
type UploadSummary = { success: number; errors: string[] } | null;
type SchemeSortKey = keyof Pick<SchemeDataRecord, "financialYear" | "schemeName" | "block" | "village" | "target" | "approvedCases" | "distributedUnits" | "pendingCases" | "financialProgressAmount" | "physicalProgressPercentage">;
type SortDirection = "asc" | "desc";

const schemeNames = [
  "Bakra Distribution",
  "Sukar Unit Distribution",
  "Kukkut Unit Distribution",
  "Sand Distribution",
  "Nar Bakra Distribution",
  "Unnat Mada Vats Palan",
  "Chhattisgarh Kukkut Protsahan Yojana",
];
const financialYears = ["2025-26", "2024-25", "2023-24"];
const templateHeaders = ["Financial Year", "Scheme Name", "Block", "Village", "Target", "Approved Cases", "Distributed Units", "Pending Cases", "Financial Progress Amount", "Physical Progress Percentage", "Remarks"];

const SchemeBeneficiaryManagement = lazy(async () => {
  const module = await import("@/components/SchemeBeneficiaryManagement");
  return { default: module.SchemeBeneficiaryManagement };
});

const emptyForm: SchemeForm = {
  financialYear: financialYears[0],
  schemeName: schemeNames[0],
  block: "",
  village: "",
  target: 0,
  approvedCases: 0,
  distributedUnits: 0,
  pendingCases: 0,
  financialProgressAmount: 0,
  physicalProgressPercentage: 0,
  remarks: "",
};

const tablePageSize = 10;

const SchemesPage = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("scheme-management");
  const [financialYear, setFinancialYear] = useState("All Financial Years");
  const [scheme, setScheme] = useState("All Schemes");
  const [block, setBlock] = useState("All Blocks");
  const [village, setVillage] = useState("All Villages");
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: beneficiaryRecords = [], isLoading: beneficiariesLoading } = useQuery({
    queryKey: ["schemeBeneficiaryRecords"],
    queryFn: listSchemeBeneficiaryRecords,
    initialData: [] as SchemeBeneficiaryRecord[],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const canAdd = user?.role === "admin" || user?.role === "data_entry_operator" || user?.role === "block_officer" || user?.role === "field_officer";
  const canDelete = user?.role === "admin";
  const canEdit = (record: SchemeDataRecord) => {
    if (user?.role === "admin" || user?.role === "data_entry_operator") return true;
    if (user?.role !== "block_officer" && user?.role !== "field_officer") return false;
    return matchesBlock(user.region, record.block);
  };

  const options = useMemo(() => ({
    years: unique(records.map((item) => item.financialYear)),
    blocks: unique(records.map((item) => item.block)),
    villages: unique(records.filter((item) => block === "All Blocks" || item.block === block).map((item) => item.village)),
  }), [block, records]);

  useEffect(() => {
    setPage(1);
  }, [block, deferredSearch, financialYear, scheme, village]);

  const yearProgress = useMemo(() => {
    const latestYears = unique(records.map((item) => item.financialYear)).slice(0, 3);
    return latestYears.map((year, index) => {
      const yearRecords = records.filter((item) => item.financialYear === year);
      const yearBeneficiaries = beneficiaryRecords.filter((item) => isDateInFinancialYear(item.dateOfApproval || item.dateOfDistribution, year));
      const achievement = sumBeneficiaryUnits(yearBeneficiaries);
      const target = sum(yearRecords, "target");
      return {
        year,
        progress: target ? Math.round((achievement / target) * 100) : 0,
        delta: index === 0 ? null : Math.round(((achievement - sumBeneficiaryUnits(beneficiaryRecords.filter((item) => isDateInFinancialYear(item.dateOfApproval || item.dateOfDistribution, latestYears[index - 1])))) || 0) / Math.max(target || 1, 1) * 100),
      };
    });
  }, [beneficiaryRecords, records]);

  const filteredRecords = useMemo(() => records.filter((item) => (
    (financialYear === "All Financial Years" || item.financialYear === financialYear)
    && (scheme === "All Schemes" || item.schemeName === scheme)
    && (block === "All Blocks" || item.block === block)
    && (village === "All Villages" || item.village === village)
    && item.schemeName.toLowerCase().includes(deferredSearch.trim().toLowerCase())
  )), [block, deferredSearch, financialYear, records, scheme, village]);

  const filteredBeneficiaries = useMemo(() => beneficiaryRecords.filter((item) => (
    (financialYear === "All Financial Years" || isDateInFinancialYear(item.dateOfApproval || item.dateOfDistribution, financialYear))
    && (scheme === "All Schemes" || item.schemeName === scheme)
    && (block === "All Blocks" || item.block === block)
    && (village === "All Villages" || item.village === village)
  )), [beneficiaryRecords, block, financialYear, scheme, village]);

  const dashboardRecords = useMemo(() => filteredRecords.map((record) => {
    const linked = filteredBeneficiaries.filter((item) => item.schemeName === record.schemeName && item.block === record.block && item.village === record.village);
    const approvedCases = linked.filter((item) => !!item.dateOfApproval).length;
    const distributedUnits = sumBeneficiaryUnits(linked);
    return {
      ...record,
      approvedCases,
      distributedUnits,
      pendingCases: Math.max(record.target - approvedCases, 0),
      physicalProgressPercentage: record.target ? Math.round((distributedUnits / record.target) * 100) : 0,
    };
  }), [filteredBeneficiaries, filteredRecords]);

  const sortedRecords = useMemo(() => {
    return [...dashboardRecords].sort((left, right) => compareSchemeValues(left[sortKey], right[sortKey], sortDirection));
  }, [dashboardRecords, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / tablePageSize));
  const pageIndex = Math.min(page, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (pageIndex - 1) * tablePageSize;
    return sortedRecords.slice(start, start + tablePageSize);
  }, [pageIndex, sortedRecords]);

  const pageStart = sortedRecords.length ? (pageIndex - 1) * tablePageSize + 1 : 0;
  const pageEnd = Math.min(pageIndex * tablePageSize, sortedRecords.length);

  const chartRows = useMemo(() => schemeNames.map((name) => {
    const schemeRecords = dashboardRecords.filter((item) => item.schemeName === name);
    const schemeBeneficiaries = filteredBeneficiaries.filter((item) => item.schemeName === name);
    const target = sum(schemeRecords, "target");
    const achievement = sumBeneficiaryUnits(schemeBeneficiaries);
    return {
      name,
      shortName: shortenScheme(name),
      target,
      achievement,
      progress: target ? Math.round((achievement / target) * 100) : 0,
    };
  }).filter((item) => item.target || item.achievement), [dashboardRecords, filteredBeneficiaries]);

  const totals = useMemo(() => {
    const target = sum(dashboardRecords, "target");
    const achievement = sumBeneficiaryUnits(filteredBeneficiaries);
    return {
    target,
    achievement,
    pending: Math.max(target - achievement, 0),
    financial: sum(dashboardRecords, "financialProgressAmount"),
  };
  }, [dashboardRecords, filteredBeneficiaries]);

  const saveMutation = useMutation({
    mutationFn: (input: SchemeForm | SchemeDataRecord) => editingRecord
      ? updateSchemeDataRecord(input as SchemeDataRecord)
      : createSchemeDataRecord(input as SchemeForm),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schemeDataRecords"] });
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
      await queryClient.invalidateQueries({ queryKey: ["schemeDataRecords"] });
      toast({ title: "Scheme record deleted" });
    },
    onError: (mutationError) => toast({ title: "Unable to delete record", description: getErrorMessage(mutationError), variant: "destructive" }),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkUpsertSchemeDataRecords,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["schemeDataRecords"] });
      setUploadSummary({ success: result.saved, errors: [] });
      toast({ title: "Excel upload complete", description: `${result.saved} scheme records saved.` });
    },
    onError: (mutationError) => setUploadSummary({ success: 0, errors: [getErrorMessage(mutationError)] }),
  });

  const submitForm = async () => {
    setFormSubmitted(true);
    const formError = validateSchemeRecord(form);
    if (formError) {
      toast({ title: "Check scheme record", description: formError, variant: "destructive" });
      return;
    }
    const normalized = normalizeSchemeForm(form);
    await saveMutation.mutateAsync(editingRecord ? { ...editingRecord, ...normalized } : normalized);
  };

  const startAdd = () => {
    setEditingRecord(null);
    setFormSubmitted(false);
    setForm({ ...emptyForm, block: user?.role === "block_officer" || user?.role === "field_officer" ? user.region : "" });
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
      target: record.target,
      approvedCases: record.approvedCases,
      distributedUnits: record.distributedUnits,
      pendingCases: record.pendingCases,
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
      const parsed = rawRows.map((row) => normalizeSchemeForm(toSchemeRecord(row)));
      const errors = parsed.flatMap((item, index) => {
        const rowError = validateSchemeRecord(item);
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
      schemeName: schemeNames[0],
      block: "Dantewada",
      village: "Example Village",
      target: 100,
      approvedCases: 80,
      distributedUnits: 70,
      pendingCases: 20,
      financialProgressAmount: 250000,
      physicalProgressPercentage: 70,
      remarks: "Replace this example row",
    });
    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, [exampleRow.financialYear, exampleRow.schemeName, exampleRow.block, exampleRow.village, exampleRow.target, exampleRow.approvedCases, exampleRow.distributedUnits, exampleRow.pendingCases, exampleRow.financialProgressAmount, exampleRow.physicalProgressPercentage, exampleRow.remarks]]);
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
      head: [["Scheme", "Block", "Village", "Target", "Approved", "Distributed", "Pending", "Financial Amount", "Physical %"]],
      body: dashboardRecords.map((item) => [item.schemeName, item.block, item.village, item.target, item.approvedCases, item.distributedUnits, item.pendingCases, formatCurrency(item.financialProgressAmount), `${item.physicalProgressPercentage}%`]),
      headStyles: { fillColor: [21, 128, 61] },
    });
    doc.save("livestock-scheme-monitoring.pdf");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Livestock Scheme Monitoring" description="Comprehensive scheme management and beneficiary monitoring for district-level livestock distribution programs.">
          <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button variant="outline" onClick={() => void exportExcel()} className="h-11 w-full shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"><FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel</Button>
            <Button variant="outline" onClick={() => void exportPdf()} className="h-11 w-full shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
            <Button onClick={() => setManageOpen(true)} className="h-11 w-full shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"><Plus className="mr-2 h-4 w-4" /> New Scheme</Button>
          </div>
        </PageHeader>

        {error ? <Card className="border-red-200"><CardContent className="p-4 text-sm text-red-700">Unable to load scheme data: {getErrorMessage(error)}</CardContent></Card> : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-2 sm:flex sm:grid-cols-none">
            <TabsTrigger value="scheme-management" className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Target className="h-4 w-4" />
              Scheme Management
            </TabsTrigger>
            <TabsTrigger value="beneficiary-monitoring" className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              Beneficiary Monitoring
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SCHEME MANAGEMENT */}
          <TabsContent value="scheme-management" className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Target" value={totals.target.toLocaleString()} hint="Scheme beneficiary targets" icon={Target} />
              <StatCard label="Total Achievement" value={totals.achievement.toLocaleString()} hint="Distributed livestock units" icon={CheckCircle2} tone="blue" />
              <StatCard label="Pending Cases" value={totals.pending.toLocaleString()} hint="Cases awaiting completion" icon={Clock3} tone="amber" />
              <StatCard label="Financial Progress" value={formatCurrency(totals.financial)} hint="Recorded expenditure amount" icon={IndianRupee} tone="green" />
            </div>

              <Card className="overflow-hidden border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-background to-lime-50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      Scheme Filters & Search
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">Filter records instantly and keep the table focused.</p>
                  </div>
                  <Button size="sm" onClick={() => setManageOpen(true)} className="h-10 w-full shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"><Plus className="mr-2 h-4 w-4" /> New Scheme</Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <FilterSelect value={financialYear} onChange={setFinancialYear} allLabel="All Financial Years" options={options.years} />
                <FilterSelect value={scheme} onChange={setScheme} allLabel="All Schemes" options={schemeNames} />
                <FilterSelect value={block} onChange={(value) => { setBlock(value); setVillage("All Villages"); }} allLabel="All Blocks" options={options.blocks} />
                <FilterSelect value={village} onChange={setVillage} allLabel="All Villages" options={options.villages} />
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search scheme" className="h-11 rounded-xl bg-background pl-9" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Target vs Achievement Comparison</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {chartRows.length ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartRows} margin={{ top: 8, left: 0, right: 12, bottom: 14 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="shortName" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={58} />
                        <YAxis tick={{ fontSize: 11 }} width={42} />
                        <Tooltip content={<SchemeChartTooltip />} cursor={{ fill: "rgba(34, 197, 94, 0.08)" }} />
                        <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} iconType="circle" />
                        <Bar name="Target" dataKey="target" fill="#15803d" radius={[8, 8, 0, 0]} />
                        <Bar name="Achievement" dataKey="achievement" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyGraphic title="No scheme data available." description="Add a scheme record to view analytics." />
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Scheme-wise Physical Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {chartRows.length ? chartRows.map((item, index) => {
                    const trend = yearProgress[index];
                    return <div key={item.name} className="space-y-1.5 rounded-2xl border border-border/60 bg-background/60 p-3 transition-shadow duration-200 hover:shadow-sm"><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-foreground">{item.name}</span><span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">{item.progress}% {trend?.delta !== null && trend?.delta !== undefined ? (trend.delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />) : null}</span></div><Progress value={item.progress} className="h-2.5 bg-emerald-100" /></div>;
                  }) : <EmptyGraphic title="No scheme data available." description="Add a scheme record to view analytics." />}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-sm font-semibold">Scheme Records & Coverage</CardTitle>
                    <p className="text-xs text-muted-foreground">Showing {pageStart}–{pageEnd} of {sortedRecords.length} records</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border">
                      <SchemeRecordsTable
                      records={paginatedRecords}
                      isLoading={isLoading}
                      canDelete={canDelete}
                      canEdit={canEdit}
                      onView={setViewRecord}
                      onEdit={startEdit}
                      onDelete={(record) => {
                        if (window.confirm(`Delete ${record.schemeName} record for ${record.village}?`)) deleteMutation.mutate(record.id);
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
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">Showing {pageStart ? `${pageStart}–${pageEnd}` : "0"} of {sortedRecords.length} records</p>
                    <Pagination className="mx-0 w-full justify-start overflow-x-auto sm:w-auto sm:justify-end">
                      <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.max(1, current - 1)); }} className={pageIndex <= 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                        {paginationItems(pageIndex, totalPages).map((item, index) => item === "ellipsis" ? <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem> : <PaginationItem key={item}><PaginationLink href="#" isActive={pageIndex === item} onClick={(event) => { event.preventDefault(); setPage(item); }}><span>{item}</span></PaginationLink></PaginationItem>)}
                        <PaginationItem><PaginationNext href="#" onClick={(event) => { event.preventDefault(); setPage((current) => Math.min(totalPages, current + 1)); }} className={pageIndex >= totalPages ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: BENEFICIARY MONITORING */}
          <TabsContent value="beneficiary-monitoring" className="space-y-6">
            <Suspense fallback={<Card className="shadow-sm"><CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading beneficiary tools...</CardContent></Card>}>
              <SchemeBeneficiaryManagement records={beneficiaryRecords} schemes={schemeNames} user={user} isLoading={beneficiariesLoading} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>Scheme Data Management</DialogTitle><DialogDescription>Add individual scheme records or validate and upload an Excel workbook. Saved rows update the monitoring dashboard automatically.</DialogDescription></DialogHeader>
          <Tabs defaultValue="records">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="records">Data Entry</TabsTrigger><TabsTrigger value="upload">Bulk Upload</TabsTrigger></TabsList>
            <TabsContent value="records" className="space-y-4">
              <div className="flex flex-col items-stretch justify-between gap-3 rounded-md border p-3 sm:flex-row sm:items-center">
                <div><p className="text-sm font-medium">Scheme records</p><p className="text-xs text-muted-foreground">{canAdd ? "Create a new live scheme record." : "Your role has view-only access."}</p></div>
                {canAdd ? <Button onClick={startAdd} className="h-10 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Record</Button> : null}
              </div>
              <SchemeRecordsTable records={records} isLoading={isLoading} canDelete={canDelete} canEdit={canEdit} onView={setViewRecord} onEdit={startEdit} onDelete={(record) => {
                if (window.confirm(`Delete ${record.schemeName} record for ${record.village}?`)) deleteMutation.mutate(record.id);
              }} compact onSort={(key) => {
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
            <TabsContent value="upload" className="space-y-4">
              <div className="rounded-md border border-dashed p-5">
                <p className="text-sm font-medium">Upload Scheme Data Excel workbook</p>
                <p className="mt-1 text-xs text-muted-foreground">Download the template, complete its rows, then upload the `.xlsx` file. Every row is validated before saving.</p>
                <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                  <Button variant="outline" onClick={() => void downloadTemplate()} className="h-10 w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Download Excel Template</Button>
                  {canAdd ? <Label className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"><Upload className="mr-2 h-4 w-4" /> Upload Excel File<Input className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file); event.target.value = ""; }} /></Label> : null}
                </div>
              </div>
              {uploadSummary ? <UploadResult summary={uploadSummary} /> : null}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRecord ? "Edit Scheme Record" : "Add Scheme Record"}</DialogTitle><DialogDescription>Fields are saved directly to the SchemeData sheet.</DialogDescription></DialogHeader>
          <SchemeRecordForm form={form} setForm={setForm} blockLocked={user?.role === "block_officer" || user?.role === "field_officer"} submitted={formSubmitted} />
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
};

function SchemeRecordForm({ form, setForm, blockLocked, submitted }: { form: SchemeForm; setForm: React.Dispatch<React.SetStateAction<SchemeForm>>; blockLocked: boolean; submitted: boolean }) {
  const set = (key: keyof SchemeForm, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const errors = submitted ? validateSchemeRecord(form) : "";
  const fieldError = (field: keyof SchemeForm | "required") => submitted && errors ? errors : "";
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <FormField label="Financial Year" required error={fieldError("required")}><FilterSelect value={form.financialYear} onChange={(value) => set("financialYear", value)} options={financialYears} /></FormField>
    <FormField label="Scheme Name" required error={fieldError("required")}><FilterSelect value={form.schemeName} onChange={(value) => set("schemeName", value)} options={schemeNames} /></FormField>
    <FormField label="Block" required error={fieldError("required")}><Input value={form.block} disabled={blockLocked} onChange={(event) => set("block", event.target.value)} className="h-11 rounded-xl" /></FormField>
    <FormField label="Village" required error={fieldError("required")}><Input value={form.village} onChange={(event) => set("village", event.target.value)} className="h-11 rounded-xl" /></FormField>
    <FormField label="Target" required><NumberInput value={form.target} onChange={(value) => set("target", value)} /></FormField>
    <FormField label="Financial Amount" required><NumberInput value={form.financialProgressAmount} onChange={(value) => set("financialProgressAmount", value)} /></FormField>
    <FormField label="Approved Cases"><NumberInput value={form.approvedCases} onChange={(value) => set("approvedCases", value)} /></FormField>
    <FormField label="Distributed Units"><NumberInput value={form.distributedUnits} onChange={(value) => set("distributedUnits", value)} /></FormField>
    <FormField label="Pending Cases"><Input value={calculateSchemeProgress(form).pendingCases} readOnly className="h-11 rounded-xl bg-muted/40" /></FormField>
    <FormField label="Physical Progress Percentage"><Input value={calculateSchemeProgress(form).physicalProgressPercentage} readOnly className="h-11 rounded-xl bg-muted/40" /></FormField>
    <FormField label="Remarks" className="sm:col-span-2 lg:col-span-3"><Textarea value={form.remarks} onChange={(event) => set("remarks", event.target.value)} className="min-h-28 rounded-xl" /></FormField>
    {submitted && errors ? <p className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors}</p> : null}
  </div>;
}

function SchemeRecordsTable({ records, isLoading, canDelete, canEdit, onView, onEdit, onDelete, onSort, sortKey, sortDirection, compact = false }: { records: SchemeDataRecord[]; isLoading: boolean; canDelete: boolean; canEdit: (record: SchemeDataRecord) => boolean; onView: (record: SchemeDataRecord) => void; onEdit: (record: SchemeDataRecord) => void; onDelete: (record: SchemeDataRecord) => void; onSort: (key: SchemeSortKey) => void; sortKey: SchemeSortKey; sortDirection: SortDirection; compact?: boolean }) {
  const headers: Array<{ label: string; key: SchemeSortKey; className?: string }> = [
    { label: "Financial Year", key: "financialYear" },
    { label: "Scheme Name", key: "schemeName", className: "min-w-[220px]" },
    { label: "Block", key: "block" },
    { label: "Village", key: "village" },
    { label: "Target", key: "target" },
    { label: "Approved", key: "approvedCases" },
    { label: "Distributed", key: "distributedUnits" },
    { label: "Pending", key: "pendingCases" },
    { label: "Financial Amount", key: "financialProgressAmount" },
    { label: "Physical %", key: "physicalProgressPercentage" },
  ];

  const table = <div className="overflow-x-auto"><Table><TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"><TableRow>{headers.map((header) => <TableHead key={header.label} className={cn("whitespace-nowrap py-4 align-middle", header.className)}><button type="button" onClick={() => onSort(header.key)} className="inline-flex items-center gap-1.5 text-left font-semibold text-foreground transition-colors hover:text-emerald-700">{header.label}{sortKey === header.key ? sortDirection === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" /> : <ChevronUp className="h-4 w-4 opacity-25" />}</button></TableHead>)}<TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
    {records.map((record) => <TableRow key={record.id} className="transition-colors hover:bg-emerald-50/60"><TableCell className="py-4 font-medium">{record.financialYear}</TableCell><TableCell className="py-4 font-medium text-foreground">{record.schemeName}</TableCell><TableCell className="py-4">{record.block}</TableCell><TableCell className="py-4">{record.village}</TableCell><TableCell className="py-4">{record.target}</TableCell><TableCell className="py-4">{record.approvedCases}</TableCell><TableCell className="py-4">{record.distributedUnits}</TableCell><TableCell className="py-4">{record.pendingCases}</TableCell><TableCell className="py-4">{formatCurrency(record.financialProgressAmount)}</TableCell><TableCell className="py-4">{record.physicalProgressPercentage}%</TableCell><TableCell className="py-4"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="View record" aria-label={`View ${record.schemeName} record`} onClick={() => onView(record)} className="rounded-full"><Eye className="h-4 w-4" /></Button>{canEdit(record) ? <Button size="icon" variant="ghost" title="Edit record" aria-label={`Edit ${record.schemeName} record`} onClick={() => onEdit(record)} className="rounded-full"><Pencil className="h-4 w-4" /></Button> : null}{canDelete ? <Button size="icon" variant="ghost" title="Delete record" aria-label={`Delete ${record.schemeName} record`} onClick={() => onDelete(record)} className="rounded-full text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button> : null}</div></TableCell></TableRow>)}
    {!records.length ? <TableRow><TableCell colSpan={11}><EmptyMessage text={isLoading ? "Loading scheme data..." : "📋 No scheme records found.\n\nClick \"New Scheme\" to create your first scheme."} /></TableCell></TableRow> : null}
  </TableBody></Table></div>;
  return compact ? table : <Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-sm">Uploaded Scheme Records</CardTitle></CardHeader><CardContent>{table}</CardContent></Card>;
}

function FilterSelect({ value, onChange, options, allLabel }: { value: string; onChange: (value: string) => void; options: string[]; allLabel?: string }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="h-11 rounded-xl bg-background"><SelectValue /></SelectTrigger><SelectContent>{allLabel ? <SelectItem value={allLabel}>{allLabel}</SelectItem> : null}{options.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}
function FormField({ label, children, className = "", required = false, error }: { label: string; children: React.ReactNode; className?: string; required?: boolean; error?: string }) { return <div className={className}><Label className="flex items-center gap-1 text-sm font-medium">{label}{required ? <span className="text-red-500">*</span> : null}</Label><div className="mt-1">{children}</div>{error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}</div>; }
function NumberField({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max?: number }) { return <FormField label={label}><Input type="number" min={0} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11 rounded-xl" /></FormField>; }
function NumberInput({ value, onChange, max }: { value: number; onChange: (value: number) => void; max?: number }) { return <Input type="number" min={0} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11 rounded-xl" />; }
function EmptyMessage({ text }: { text: string }) { return <p className="whitespace-pre-line py-8 text-center text-sm text-muted-foreground">{text}</p>; }
function EmptyGraphic({ title, description }: { title: string; description: string }) { return <div className="flex h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center"><div className="mb-3 rounded-full bg-emerald-100 p-3 text-emerald-700"><Sparkles className="h-5 w-5" /></div><p className="text-sm font-semibold text-foreground">{title}</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p></div>; }
function SchemeChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) { if (!active || !payload?.length) return null; return <div className="rounded-2xl border bg-background px-3 py-2 shadow-lg"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="text-sm font-medium text-foreground">Target: {Number(payload[0]?.value || 0).toLocaleString()}</p><p className="text-sm font-medium text-foreground">Achievement: {Number(payload[1]?.value || 0).toLocaleString()}</p></div>; }
function UploadResult({ summary }: { summary: NonNullable<UploadSummary> }) { return <div className={`rounded-2xl border p-4 text-sm ${summary.errors.length ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><p className="font-semibold">{summary.errors.length ? "Upload validation failed" : "Upload successful"}</p><p className="mt-1">{summary.success} records saved. {summary.errors.length} errors found.</p>{summary.errors.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{summary.errors.slice(0, 12).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : null}</div>; }
function RecordDetails({ record }: { record: SchemeDataRecord }) { return <div className="grid gap-3 text-sm sm:grid-cols-2">{Object.entries(toExportRow(record)).map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1">{String(value || "-")}</p></div>)}</div>; }
function unique(items: string[]) { return Array.from(new Set(items.filter(Boolean))).sort(); }
function sum(records: SchemeDataRecord[], key: keyof SchemeDataRecord) { return records.reduce((total, item) => total + Number(item[key] || 0), 0); }
function sumBeneficiaryUnits(records: SchemeBeneficiaryRecord[]) { return records.reduce((total, item) => total + Number(item.unitsDistributed || 0), 0); }
function isDateInFinancialYear(value: string, financialYear: string) { const year = Number(financialYear.slice(0, 4)); const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return false; const start = new Date(year, 3, 1); const end = new Date(year + 1, 2, 31, 23, 59, 59); return date >= start && date <= end; }
function shortenScheme(name: string) { return name.replace(" Distribution", "").replace("Chhattisgarh ", "").replace(" Yojana", ""); }
function formatCurrency(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function getErrorMessage(error: unknown) { return error instanceof Error ? error.message : "Unexpected error"; }
function matchesBlock(region: string, block: string) { const own = String(region || "").toLowerCase(); const target = String(block || "").toLowerCase(); return !!own && !!target && (own.includes(target) || target.includes(own)); }
function compareSchemeValues(left: unknown, right: unknown, direction: SortDirection) {
  const leftValue = typeof left === "number" ? left : String(left ?? "").toLowerCase();
  const rightValue = typeof right === "number" ? right : String(right ?? "").toLowerCase();
  if (leftValue === rightValue) return 0;
  const comparison = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue));
  return direction === "asc" ? comparison : -comparison;
}
function paginationItems(page: number, totalPages: number) { if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1); const items: Array<number | "ellipsis"> = [1]; const start = Math.max(2, page - 1); const end = Math.min(totalPages - 1, page + 1); if (start > 2) items.push("ellipsis"); for (let index = start; index <= end; index += 1) items.push(index); if (end < totalPages - 1) items.push("ellipsis"); items.push(totalPages); return items; }
function validateSchemeRecord(record: SchemeForm | Partial<SchemeDataRecord>) {
  if (!record.financialYear || !record.schemeName || !record.block || !record.village) return "Financial year, scheme name, block and village are required.";
  const values = [record.target, record.approvedCases, record.distributedUnits, record.pendingCases, record.financialProgressAmount, record.physicalProgressPercentage];
  if (values.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) return "All numeric fields must contain non-negative numbers.";
  if (Number(record.physicalProgressPercentage) > 100) return "Physical progress percentage cannot exceed 100.";
  if (Number(record.approvedCases) > Number(record.target)) return "Approved cases cannot exceed target.";
  if (Number(record.distributedUnits) > Number(record.approvedCases)) return "Distributed units cannot exceed approved cases.";
  return "";
}
function calculateSchemeProgress(record: Pick<SchemeForm, "target" | "approvedCases" | "distributedUnits">) {
  const target = Number(record.target || 0);
  const approvedCases = Number(record.approvedCases || 0);
  const distributedUnits = Number(record.distributedUnits || 0);
  return {
    pendingCases: Math.max(approvedCases - distributedUnits, 0),
    physicalProgressPercentage: target ? Math.round((distributedUnits / target) * 100) : 0,
  };
}
function normalizeSchemeForm(record: SchemeForm): SchemeForm {
  const progress = calculateSchemeProgress(record);
  return {
    ...record,
    target: Math.max(0, Number(record.target || 0)),
    approvedCases: Math.max(0, Number(record.approvedCases || 0)),
    distributedUnits: Math.max(0, Number(record.distributedUnits || 0)),
    pendingCases: progress.pendingCases,
    financialProgressAmount: Math.max(0, Number(record.financialProgressAmount || 0)),
    physicalProgressPercentage: progress.physicalProgressPercentage,
  };
}
function normalizeHeader(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }
function toSchemeRecord(row: Record<string, unknown>): SchemeForm {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
  const text = (key: string) => String(normalized[normalizeHeader(key)] ?? "").trim();
  const number = (key: string) => Number(normalized[normalizeHeader(key)] ?? 0);
  return { financialYear: text("Financial Year"), schemeName: text("Scheme Name"), block: text("Block"), village: text("Village"), target: number("Target"), approvedCases: number("Approved Cases"), distributedUnits: number("Distributed Units"), pendingCases: number("Pending Cases"), financialProgressAmount: number("Financial Progress Amount"), physicalProgressPercentage: number("Physical Progress Percentage"), remarks: text("Remarks") };
}
function toExportRow(record: SchemeDataRecord) { return { "Financial Year": record.financialYear, "Scheme Name": record.schemeName, Block: record.block, Village: record.village, Target: record.target, "Approved Cases": record.approvedCases, "Distributed Units": record.distributedUnits, "Pending Cases": record.pendingCases, "Financial Progress Amount": record.financialProgressAmount, "Physical Progress Percentage": record.physicalProgressPercentage, Remarks: record.remarks }; }

export default SchemesPage;
