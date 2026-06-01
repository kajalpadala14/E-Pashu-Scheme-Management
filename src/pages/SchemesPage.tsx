import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SchemeBeneficiaryManagement } from "@/components/SchemeBeneficiaryManagement";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock3, Download, Eye, FileSpreadsheet, IndianRupee, Pencil, Plus, Search, Settings2, Target, Trash2, Upload, Users } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type SchemeForm = Omit<SchemeDataRecord, "id" | "createdAt" | "updatedAt" | "createdBy">;
type UploadSummary = { success: number; errors: string[] } | null;

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
  const [uploadSummary, setUploadSummary] = useState<UploadSummary>(null);

  const { data: records = [], error, isLoading } = useQuery({
    queryKey: ["schemeDataRecords"],
    queryFn: listSchemeDataRecords,
    initialData: [] as SchemeDataRecord[],
  });
  const { data: beneficiaryRecords = [], isLoading: beneficiariesLoading } = useQuery({
    queryKey: ["schemeBeneficiaryRecords"],
    queryFn: listSchemeBeneficiaryRecords,
    initialData: [] as SchemeBeneficiaryRecord[],
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

  const filteredRecords = useMemo(() => records.filter((item) => (
    (financialYear === "All Financial Years" || item.financialYear === financialYear)
    && (scheme === "All Schemes" || item.schemeName === scheme)
    && (block === "All Blocks" || item.block === block)
    && (village === "All Villages" || item.village === village)
    && item.schemeName.toLowerCase().includes(search.trim().toLowerCase())
  )), [block, financialYear, records, scheme, search, village]);

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
    const formError = validateSchemeRecord(form);
    if (formError) {
      toast({ title: "Check scheme record", description: formError, variant: "destructive" });
      return;
    }
    await saveMutation.mutateAsync(editingRecord ? { ...editingRecord, ...form } : form);
  };

  const startAdd = () => {
    setEditingRecord(null);
    setForm({ ...emptyForm, block: user?.role === "block_officer" || user?.role === "field_officer" ? user.region : "" });
    setFormOpen(true);
  };

  const startEdit = (record: SchemeDataRecord) => {
    setEditingRecord(record);
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
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
      const parsed = rawRows.map(toSchemeRecord);
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

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, [financialYears[0], schemeNames[0], "Dantewada", "Example Village", 100, 80, 70, 20, 250000, 70, "Replace this example row"]]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scheme Data");
    XLSX.writeFile(workbook, "livestock-scheme-data-template.xlsx");
  };

  const exportExcel = () => {
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
          <Button variant="outline" onClick={exportPdf}><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
        </PageHeader>

        {error ? <Card className="border-red-200"><CardContent className="p-4 text-sm text-red-700">Unable to load scheme data: {getErrorMessage(error)}</CardContent></Card> : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full flex-col sm:flex-row gap-2 mb-6">
            <TabsTrigger value="scheme-management" className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 py-2">
              <Target className="h-4 w-4" />
              Scheme Management
            </TabsTrigger>
            <TabsTrigger value="beneficiary-monitoring" className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 py-2">
              <Users className="h-4 w-4" />
              Beneficiary Monitoring
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SCHEME MANAGEMENT */}
          <TabsContent value="scheme-management" className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Target" value={totals.target.toLocaleString()} hint="Scheme beneficiary targets" icon={Target} />
              <StatCard label="Total Achievement" value={totals.achievement.toLocaleString()} hint="Distributed livestock units" icon={CheckCircle2} tone="blue" />
              <StatCard label="Pending Cases" value={totals.pending.toLocaleString()} hint="Cases awaiting completion" icon={Clock3} tone="amber" />
              <StatCard label="Financial Progress" value={formatCurrency(totals.financial)} hint="Recorded expenditure amount" icon={IndianRupee} tone="green" />
            </div>

              <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Scheme Filters & Search</CardTitle>
                  <Button size="sm" onClick={() => setManageOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Scheme</Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <FilterSelect value={financialYear} onChange={setFinancialYear} allLabel="All Financial Years" options={options.years} />
                <FilterSelect value={scheme} onChange={setScheme} allLabel="All Schemes" options={schemeNames} />
                <FilterSelect value={block} onChange={(value) => { setBlock(value); setVillage("All Villages"); }} allLabel="All Blocks" options={options.blocks} />
                <FilterSelect value={village} onChange={setVillage} allLabel="All Villages" options={options.villages} />
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search scheme" className="pl-9" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">Target vs Achievement Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartRows} margin={{ left: -18, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="shortName" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={58} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "rgba(34, 197, 94, 0.12)" }} />
                      <Legend />
                      <Bar name="Target" dataKey="target" fill="#15803d" radius={[4, 4, 0, 0]} />
                      <Bar name="Achievement" dataKey="achievement" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Scheme-wise Physical Progress</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {chartRows.map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-medium text-green-900">{item.name}</span><span className="font-semibold text-blue-600">{item.progress}%</span></div><Progress value={item.progress} className="h-2.5 bg-green-100" /></div>)}
                  {!chartRows.length ? <EmptyMessage text="No schemes match the selected filters." /> : null}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Scheme Records & Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <SchemeRecordsTable records={dashboardRecords} isLoading={isLoading} canDelete={canDelete} canEdit={canEdit} onView={setViewRecord} onEdit={startEdit} onDelete={(record) => {
                      if (window.confirm(`Delete ${record.schemeName} record for ${record.village}?`)) deleteMutation.mutate(record.id);
                    }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: BENEFICIARY MONITORING */}
          <TabsContent value="beneficiary-monitoring" className="space-y-6">
            <SchemeBeneficiaryManagement records={beneficiaryRecords} schemes={schemeNames} user={user} isLoading={beneficiariesLoading} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>Scheme Data Management</DialogTitle><DialogDescription>Add individual scheme records or validate and upload an Excel workbook. Saved rows update the monitoring dashboard automatically.</DialogDescription></DialogHeader>
          <Tabs defaultValue="records">
            <TabsList><TabsTrigger value="records">Data Entry</TabsTrigger><TabsTrigger value="upload">Bulk Upload</TabsTrigger></TabsList>
            <TabsContent value="records" className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div><p className="text-sm font-medium">Scheme records</p><p className="text-xs text-muted-foreground">{canAdd ? "Create a new live scheme record." : "Your role has view-only access."}</p></div>
                {canAdd ? <Button onClick={startAdd}><Plus className="mr-2 h-4 w-4" /> Add Record</Button> : null}
              </div>
              <SchemeRecordsTable records={records} isLoading={isLoading} canDelete={canDelete} canEdit={canEdit} onView={setViewRecord} onEdit={startEdit} onDelete={(record) => {
                if (window.confirm(`Delete ${record.schemeName} record for ${record.village}?`)) deleteMutation.mutate(record.id);
              }} compact />
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <div className="rounded-md border border-dashed p-5">
                <p className="text-sm font-medium">Upload Scheme Data Excel workbook</p>
                <p className="mt-1 text-xs text-muted-foreground">Download the template, complete its rows, then upload the `.xlsx` file. Every row is validated before saving.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" /> Download Excel Template</Button>
                  {canAdd ? <Label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Upload className="mr-2 h-4 w-4" /> Upload Excel File<Input className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file); event.target.value = ""; }} /></Label> : null}
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
          <SchemeRecordForm form={form} setForm={setForm} blockLocked={user?.role === "block_officer" || user?.role === "field_officer"} />
          <Button onClick={submitForm} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Record"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewRecord} onOpenChange={(open) => { if (!open) setViewRecord(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Scheme Record Details</DialogTitle></DialogHeader>{viewRecord ? <RecordDetails record={viewRecord} /> : null}</DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

function SchemeRecordForm({ form, setForm, blockLocked }: { form: SchemeForm; setForm: React.Dispatch<React.SetStateAction<SchemeForm>>; blockLocked: boolean }) {
  const set = (key: keyof SchemeForm, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <FormField label="Financial Year"><FilterSelect value={form.financialYear} onChange={(value) => set("financialYear", value)} options={financialYears} /></FormField>
    <FormField label="Scheme Name"><FilterSelect value={form.schemeName} onChange={(value) => set("schemeName", value)} options={schemeNames} /></FormField>
    <FormField label="Block"><Input value={form.block} disabled={blockLocked} onChange={(event) => set("block", event.target.value)} /></FormField>
    <FormField label="Village"><Input value={form.village} onChange={(event) => set("village", event.target.value)} /></FormField>
    <NumberField label="Target" value={form.target} onChange={(value) => set("target", value)} />
    <NumberField label="Approved Cases" value={form.approvedCases} onChange={(value) => set("approvedCases", value)} />
    <NumberField label="Distributed Units" value={form.distributedUnits} onChange={(value) => set("distributedUnits", value)} />
    <NumberField label="Pending Cases" value={form.pendingCases} onChange={(value) => set("pendingCases", value)} />
    <NumberField label="Financial Progress Amount" value={form.financialProgressAmount} onChange={(value) => set("financialProgressAmount", value)} />
    <NumberField label="Physical Progress Percentage" value={form.physicalProgressPercentage} onChange={(value) => set("physicalProgressPercentage", value)} max={100} />
    <FormField label="Remarks" className="sm:col-span-2 lg:col-span-3"><Textarea value={form.remarks} onChange={(event) => set("remarks", event.target.value)} /></FormField>
  </div>;
}

function SchemeRecordsTable({ records, isLoading, canDelete, canEdit, onView, onEdit, onDelete, compact = false }: { records: SchemeDataRecord[]; isLoading: boolean; canDelete: boolean; canEdit: (record: SchemeDataRecord) => boolean; onView: (record: SchemeDataRecord) => void; onEdit: (record: SchemeDataRecord) => void; onDelete: (record: SchemeDataRecord) => void; compact?: boolean }) {
  const table = <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Financial Year</TableHead><TableHead className="min-w-[220px]">Scheme Name</TableHead><TableHead>Block</TableHead><TableHead>Village</TableHead><TableHead>Target</TableHead><TableHead>Approved</TableHead><TableHead>Distributed</TableHead><TableHead>Pending</TableHead><TableHead>Financial Amount</TableHead><TableHead>Physical %</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
    {records.map((record) => <TableRow key={record.id}><TableCell>{record.financialYear}</TableCell><TableCell className="font-medium">{record.schemeName}</TableCell><TableCell>{record.block}</TableCell><TableCell>{record.village}</TableCell><TableCell>{record.target}</TableCell><TableCell>{record.approvedCases}</TableCell><TableCell>{record.distributedUnits}</TableCell><TableCell>{record.pendingCases}</TableCell><TableCell>{formatCurrency(record.financialProgressAmount)}</TableCell><TableCell>{record.physicalProgressPercentage}%</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="View record" onClick={() => onView(record)}><Eye className="h-4 w-4" /></Button>{canEdit(record) ? <Button size="icon" variant="ghost" title="Edit record" onClick={() => onEdit(record)}><Pencil className="h-4 w-4" /></Button> : null}{canDelete ? <Button size="icon" variant="ghost" title="Delete record" onClick={() => onDelete(record)}><Trash2 className="h-4 w-4 text-red-600" /></Button> : null}</div></TableCell></TableRow>)}
    {!records.length ? <TableRow><TableCell colSpan={11}><EmptyMessage text={isLoading ? "Loading scheme data..." : "No uploaded scheme records found."} /></TableCell></TableRow> : null}
  </TableBody></Table></div>;
  return compact ? table : <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Uploaded Scheme Records</CardTitle></CardHeader><CardContent>{table}</CardContent></Card>;
}

function FilterSelect({ value, onChange, options, allLabel }: { value: string; onChange: (value: string) => void; options: string[]; allLabel?: string }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{allLabel ? <SelectItem value={allLabel}>{allLabel}</SelectItem> : null}{options.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}
function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <div className={className}><Label>{label}</Label><div className="mt-1">{children}</div></div>; }
function NumberField({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max?: number }) { return <FormField label={label}><Input type="number" min={0} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></FormField>; }
function EmptyMessage({ text }: { text: string }) { return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>; }
function UploadResult({ summary }: { summary: NonNullable<UploadSummary> }) { return <div className={`rounded-md border p-4 text-sm ${summary.errors.length ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><p className="font-semibold">{summary.errors.length ? "Upload validation failed" : "Upload successful"}</p><p className="mt-1">{summary.success} records saved. {summary.errors.length} errors found.</p>{summary.errors.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{summary.errors.slice(0, 12).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : null}</div>; }
function RecordDetails({ record }: { record: SchemeDataRecord }) { return <div className="grid gap-3 text-sm sm:grid-cols-2">{Object.entries(toExportRow(record)).map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1">{String(value || "-")}</p></div>)}</div>; }
function unique(items: string[]) { return Array.from(new Set(items.filter(Boolean))).sort(); }
function sum(records: SchemeDataRecord[], key: keyof SchemeDataRecord) { return records.reduce((total, item) => total + Number(item[key] || 0), 0); }
function sumBeneficiaryUnits(records: SchemeBeneficiaryRecord[]) { return records.reduce((total, item) => total + Number(item.unitsDistributed || 0), 0); }
function isDateInFinancialYear(value: string, financialYear: string) { const year = Number(financialYear.slice(0, 4)); const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return false; const start = new Date(year, 3, 1); const end = new Date(year + 1, 2, 31, 23, 59, 59); return date >= start && date <= end; }
function shortenScheme(name: string) { return name.replace(" Distribution", "").replace("Chhattisgarh ", "").replace(" Yojana", ""); }
function formatCurrency(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function getErrorMessage(error: unknown) { return error instanceof Error ? error.message : "Unexpected error"; }
function matchesBlock(region: string, block: string) { const own = String(region || "").toLowerCase(); const target = String(block || "").toLowerCase(); return !!own && !!target && (own.includes(target) || target.includes(own)); }
function validateSchemeRecord(record: SchemeForm | Partial<SchemeDataRecord>) {
  if (!record.financialYear || !record.schemeName || !record.block || !record.village) return "Financial year, scheme name, block and village are required.";
  const values = [record.target, record.approvedCases, record.distributedUnits, record.pendingCases, record.financialProgressAmount, record.physicalProgressPercentage];
  if (values.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) return "All numeric fields must contain non-negative numbers.";
  if (Number(record.physicalProgressPercentage) > 100) return "Physical progress percentage cannot exceed 100.";
  if (Number(record.approvedCases) > Number(record.target)) return "Approved cases cannot exceed target.";
  if (Number(record.distributedUnits) > Number(record.approvedCases)) return "Distributed units cannot exceed approved cases.";
  return "";
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
