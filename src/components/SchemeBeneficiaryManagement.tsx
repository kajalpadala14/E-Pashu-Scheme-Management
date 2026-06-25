import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, ChevronLeft, ChevronRight, ChevronDown, Download, Eye, FileSpreadsheet, FileText, PackageCheck, Pencil, Plus, Search, ShieldCheck, Trash2, Upload, UserX, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { SessionUser } from "@/contexts/userSession";
import { bulkUpsertSchemeBeneficiaryRecords, createSchemeBeneficiaryRecord, deleteSchemeBeneficiaryRecord, updateSchemeBeneficiaryRecord, listInstitutes } from "@/lib/dataService";
import { safeSelectOptions, safeSelectValue } from "@/lib/selectOptions";
import type { InstituteRecord, SchemeBeneficiaryRecord } from "@/lib/types";
import { getUserDataScope, matchesBlockScope } from "@/lib/data-scope";

type BeneficiaryForm = Omit<SchemeBeneficiaryRecord, "id" | "createdAt" | "updatedAt" | "createdBy" | "distributionPhotoUrl" | "distributionPhotoFileId"> & {
  distributionPhotoDataUrl?: string;
  distributionPhotoFileName?: string;
};
type UploadSummary = { saved: number; errors: string[] } | null;
type ReportKind = "Beneficiary List" | "Scheme-wise Report" | "Category-wise Report" | "Institute-wise Report" | "Distribution Report";

const categories: SchemeBeneficiaryRecord["category"][] = ["General", "OBC", "SC", "ST"];
const genders: SchemeBeneficiaryRecord["gender"][] = ["Female", "Male", "Other"];
const statuses: SchemeBeneficiaryRecord["status"][] = ["Registered", "Verification Pending", "Verified", "Approved", "Rejected", "Distributed", "Completed"];
const yesNo: Array<"Yes" | "No"> = ["Yes", "No"];
const pageSize = 10;
const chartColors = ["#0f766e", "#15803d", "#0d9488", "#2563eb", "#f59e0b", "#dc2626", "#64748b"];
const excelHeaders = ["Beneficiary ID", "Full Name", "Mobile Number", "Aadhaar Number", "Gender", "Category", "Institute", "Gram Panchayat", "Block", "Scheme", "Account Holder Name", "Bank Name", "Account Number", "IFSC Code", "Status", "Verification Date", "Verification Officer", "Verification Remarks", "Approval Date", "Distribution Date", "Quantity", "Distribution Remarks", "Remarks"];
const reportKinds: ReportKind[] = ["Beneficiary List", "Scheme-wise Report", "Category-wise Report", "Institute-wise Report", "Distribution Report"];

const emptyForm: BeneficiaryForm = {
  beneficiaryId: "",
  beneficiaryName: "",
  fatherHusbandName: "",
  mobileNumber: "",
  aadhaarNumber: "",
  rationCardNumber: "",
  gender: "Female",
  accountHolderName: "",
  bankName: "",
  bankAccountNumber: "",
  ifscCode: "",
  village: "",
  gramPanchayat: "",
  block: "",
  category: "General",
  womenBeneficiary: "No",
  pvtg: "No",
  fraBeneficiary: "No",
  schemeName: "",
  status: "Registered",
  verificationDate: "",
  verificationOfficer: "",
  verificationRemarks: "",
  dateOfApproval: "",
  dateOfDistribution: "",
  unitsDistributed: 0,
  distributionRemarks: "",
  remarks: "",
};

export function SchemeBeneficiaryManagement({ records, schemes, user, isLoading }: { records: SchemeBeneficiaryRecord[]; schemes: string[]; user: SessionUser | null; isLoading: boolean }) {
  const queryClient = useQueryClient();
  const scope = getUserDataScope(user);
  const { data: institutes = [] } = useQuery({
    queryKey: ["institutes"],
    queryFn: listInstitutes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const [search, setSearch] = useState("");
  const [scheme, setScheme] = useState("All Schemes");
  const [village, setVillage] = useState("All Institutes");
  const [block, setBlock] = useState("All Blocks");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<SchemeBeneficiaryRecord | null>(null);
  const [editing, setEditing] = useState<SchemeBeneficiaryRecord | null>(null);
  const [form, setForm] = useState<BeneficiaryForm>({ ...emptyForm });
  const [uploadSummary, setUploadSummary] = useState<UploadSummary>(null);
  const deferredSearch = useDeferredValue(search);

  const canWrite = Boolean(user);
  const canApprove = Boolean(user);
  const canDelete = Boolean(user && ["admin", "district_officer", "data_entry_operator", "departmental_officer", "deputy_director_vet"].includes(user.role));
  const canEdit = (record: SchemeBeneficiaryRecord) => canApprove || user?.role === "data_entry_operator" || (scope.type !== "district" && matchesBlockScope(scope, record.block));

  const activeInstitutes = useMemo(() => institutes.filter((item) => item.status === "Active"), [institutes]);
  const blocks = useMemo(() => unique([...activeInstitutes.map((item) => item.block), ...records.map((item) => item.block)]), [activeInstitutes, records]);
  const villages = useMemo(() => unique([
    ...activeInstitutes.filter((item) => block === "All Blocks" || item.block === block).map((item) => item.instituteName),
    ...records.filter((item) => block === "All Blocks" || item.block === block).map((item) => item.village),
  ]), [activeInstitutes, block, records]);
  const filtered = useMemo(() => records.filter((item) => {
    const haystack = `${item.beneficiaryId} ${item.beneficiaryName} ${item.mobileNumber} ${item.aadhaarNumber} ${item.village} ${item.schemeName} ${item.status}`.toLowerCase();
    return (scheme === "All Schemes" || item.schemeName === scheme)
      && (village === "All Institutes" || item.village === village)
      && (block === "All Blocks" || item.block === block)
      && (category === "All Categories" || item.category === category)
      && (status === "All Status" || item.status === status)
      && haystack.includes(deferredSearch.trim().toLowerCase());
  }), [block, category, deferredSearch, records, scheme, status, village]);

  useEffect(() => setPage(1), [block, category, deferredSearch, scheme, status, village]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const analytics = useMemo(() => buildAnalytics(filtered), [filtered]);
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["schemeBeneficiaryRecords"] }),
      queryClient.invalidateQueries({ queryKey: ["schemeDataRecords"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] }),
      queryClient.invalidateQueries({ queryKey: ["landingPageData"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (input: BeneficiaryForm | (SchemeBeneficiaryRecord & BeneficiaryForm)) => editing ? updateSchemeBeneficiaryRecord(input as SchemeBeneficiaryRecord & BeneficiaryForm) : createSchemeBeneficiaryRecord(input as BeneficiaryForm),
    onSuccess: async () => {
      await refresh();
      setFormOpen(false);
      setEditing(null);
      setForm({ ...emptyForm });
      toast({ title: "Beneficiary saved", description: "Application workflow and reports are updated." });
    },
    onError: (error) => toast({ title: "Unable to save beneficiary", description: message(error), variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSchemeBeneficiaryRecord,
    onSuccess: async () => { await refresh(); toast({ title: "Beneficiary deleted" }); },
    onError: (error) => toast({ title: "Unable to delete beneficiary", description: message(error), variant: "destructive" }),
  });
  const bulkMutation = useMutation({
    mutationFn: bulkUpsertSchemeBeneficiaryRecords,
    onSuccess: async (result) => { await refresh(); setUploadSummary({ saved: result.saved, errors: [] }); },
    onError: (error) => setUploadSummary({ saved: 0, errors: [message(error)] }),
  });

  const add = () => {
    setEditing(null);
    const defaultInstitute = activeInstitutes.find((item) => scope.type !== "district" ? matchesBlockScope(scope, item.block) : true);
    setForm({
      ...emptyForm,
      village: defaultInstitute?.instituteName || "",
      block: defaultInstitute?.block || (scope.type !== "district" ? (scope.block ?? "") : ""),
      schemeName: schemes[0] || "",
    });
    setFormOpen(true);
  };
  const edit = (record: SchemeBeneficiaryRecord) => {
    setEditing(record);
    setForm({ ...record, accountHolderName: record.accountHolderName || record.beneficiaryName, distributionRemarks: record.distributionRemarks || "" });
    setFormOpen(true);
  };
  const save = async () => {
    const normalizedForm = normalizeBeneficiaryForm(form);
    const error = validate(normalizedForm, records, editing?.id);
    if (error) return toast({ title: "Check beneficiary record", description: error, variant: "destructive" });
    await saveMutation.mutateAsync(editing ? { ...editing, ...normalizedForm } : normalizedForm);
  };
  const resetFilters = () => {
    setSearch("");
    setScheme("All Schemes");
    setVillage("All Institutes");
    setBlock("All Blocks");
    setCategory("All Categories");
    setStatus("All Status");
  };
  const uploadExcel = async (file: File) => {
    setUploadSummary(null);
    if (!file.name.toLowerCase().endsWith(".xlsx")) return setUploadSummary({ saved: 0, errors: ["Upload an Excel .xlsx file."] });
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" }).map((row) => parseExcelRow(row, schemes[0] || ""));
      const errors = rows.flatMap((item, index) => {
        const error = validate(item, records);
        if (error) return [`Row ${index + 2}: ${error}`];
        if (scope.type !== "district" && !matchesBlockScope(scope, item.block)) return [`Row ${index + 2}: you can only upload beneficiaries for your assigned block.`];
        return [];
      });
      if (!rows.length) errors.push("The workbook does not contain data rows.");
      if (errors.length) return setUploadSummary({ saved: 0, errors });
      await bulkMutation.mutateAsync(rows);
    } catch (error) {
      setUploadSummary({ saved: 0, errors: [message(error)] });
    }
  };
  const downloadTemplate = () => writeWorkbook("beneficiary-registration-template.xlsx", [excelHeaders, ["", "Example Beneficiary", "9876543210", "123456789012", "Female", "ST", "Barsur", "Barsur", "Dantewada", schemes[0] || "Goat Distribution Scheme", "Example Beneficiary", "State Bank of India", "1234567890", "SBIN0000001", "Registered", "", "", "", "", "", 0, "", "Replace this row"]]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Beneficiary Management Module</h3>
          <p className="text-sm text-muted-foreground">Registration, verification, approval, distribution, and completion workflow.</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={() => exportExcel(filtered, "Beneficiary List")} className="h-10"><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button variant="outline" onClick={() => exportPdf(filtered, "Beneficiary List")} className="h-10"><Download className="mr-2 h-4 w-4" /> PDF</Button>
          {canWrite ? <Button onClick={add} className="h-10 bg-teal-700 hover:bg-teal-800"><Plus className="mr-2 h-4 w-4" /> Add Beneficiary</Button> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Beneficiaries" value={analytics.total} icon={Users} tone="teal" />
        <MetricCard label="Pending Verification" value={analytics.pendingVerification} icon={ShieldCheck} tone="amber" />
        <MetricCard label="Approved" value={analytics.approved} icon={BadgeCheck} tone="green" />
        <MetricCard label="Rejected" value={analytics.rejected} icon={UserX} tone="red" />
        <MetricCard label="Distributed" value={analytics.distributed} icon={PackageCheck} tone="blue" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Scheme-wise Statistics">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.byScheme}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="beneficiaries" fill="#0f766e" name="Beneficiaries" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Application Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={analytics.byStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {analytics.byStatus.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="border-teal-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="h-10 pl-9" placeholder="Name, mobile, Aadhaar, institute" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <FilterSelect value={scheme} onChange={setScheme} all="All Schemes" options={schemes} />
          <FilterSelect value={block} onChange={(value) => { setBlock(value); setVillage("All Institutes"); }} all="All Blocks" options={blocks} />
          <FilterSelect value={village} onChange={setVillage} all="All Institutes" options={villages} />
          <FilterSelect value={category} onChange={setCategory} all="All Categories" options={categories} />
          <FilterSelect value={status} onChange={setStatus} all="All Status" options={statuses} />
          <Button variant="outline" onClick={resetFilters} className="h-10">Reset</Button>
        </CardContent>
      </Card>

      {canWrite ? (
        <Card className="border-teal-100 shadow-sm">
          <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">Bulk beneficiary import</p>
              <p className="text-xs text-muted-foreground">Use the template to import beneficiary, bank, verification, and distribution data.</p>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button variant="outline" onClick={downloadTemplate} className="h-10"><Download className="mr-2 h-4 w-4" /> Template</Button>
              <Label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium">
                <Upload className="mr-2 h-4 w-4" /> Import Excel
                <Input className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadExcel(file); event.target.value = ""; }} />
              </Label>
            </div>
          </CardContent>
          {uploadSummary ? <CardContent className="pt-0"><UploadResult result={uploadSummary} /></CardContent> : null}
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {reportKinds.map((kind) => <ReportCard key={kind} title={kind} records={filtered} />)}
      </div>

      <BeneficiaryTable
        records={pageRecords}
        loading={isLoading}
        canEdit={canEdit}
        canDelete={canDelete}
        isDeleting={deleteMutation.isPending}
        onView={setViewRecord}
        onEdit={edit}
        onDelete={(record) => { if (window.confirm(`Delete beneficiary ${record.beneficiaryName}?`)) deleteMutation.mutate(record.id); }}
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-white px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} beneficiaries</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft className="mr-1 h-4 w-4" /> Previous</Button>
          <span className="min-w-16 text-center text-xs font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Beneficiary" : "Add Beneficiary"}</DialogTitle>
            <DialogDescription>Beneficiary ID is generated automatically and the record is saved directly to the Beneficiaries sheet.</DialogDescription>
          </DialogHeader>
          <BeneficiaryFormFields form={form} setForm={setForm} schemes={schemes} lockBlock={scope.type !== "district"} lockInstitute={scope.type === "institute"} scopeBlock={scope.block} canApprove={canApprove} institutes={institutes} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="h-10" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saveMutation.isPending} className="h-10 bg-teal-700 hover:bg-teal-800">{saveMutation.isPending ? "Saving..." : "Save Beneficiary"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewRecord} onOpenChange={(open) => { if (!open) setViewRecord(null); }}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Beneficiary Details</DialogTitle>
            <DialogDescription>{user?.role === "admin" ? "Administrator detail view" : "Sensitive identifiers remain masked for your role."}</DialogDescription>
          </DialogHeader>
          {viewRecord ? <Details record={viewRecord} admin={user?.role === "admin"} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BeneficiaryFormFields({ form, setForm, schemes, lockBlock, lockInstitute, scopeBlock, canApprove, institutes }: { form: BeneficiaryForm; setForm: React.Dispatch<React.SetStateAction<BeneficiaryForm>>; schemes: string[]; lockBlock: boolean; lockInstitute: boolean; scopeBlock?: string; canApprove: boolean; institutes: InstituteRecord[] }) {
  const set = (key: keyof BeneficiaryForm, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const activeInstitutesForForm = institutes.filter((item) => {
    if (item.status !== "Active") return false;
    if (lockBlock && scopeBlock) {
      const own = scopeBlock.trim().toLowerCase();
      const target = item.block.trim().toLowerCase();
      return own && target && (own.includes(target) || target.includes(own));
    }
    return true;
  });
  return (
    <div className="space-y-5">
      <SectionTitle title="Registration Details" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Beneficiary ID"><Input value={form.beneficiaryId || "Auto Generated"} disabled /></Field>
        <Field label="Full Name"><Input value={form.beneficiaryName} onChange={(e) => set("beneficiaryName", e.target.value)} /></Field>
        <Field label="Mobile Number"><Input inputMode="numeric" value={form.mobileNumber} onChange={(e) => set("mobileNumber", onlyDigits(e.target.value, 10))} /></Field>
        <Field label="Aadhaar Number"><Input inputMode="numeric" value={form.aadhaarNumber} onChange={(e) => set("aadhaarNumber", onlyDigits(e.target.value, 12))} /></Field>
        <Field label="Gender"><FilterSelect value={form.gender} onChange={(value) => set("gender", value)} options={genders} /></Field>
        <Field label="Category"><FilterSelect value={form.category} onChange={(value) => set("category", value)} options={categories} /></Field>
        <Field label="Institute Name">
          <FilterSelect
            value={form.village}
            onChange={(value) => {
              const selected = institutes.find((item) => item.instituteName === value);
              setForm((current) => ({
                ...current,
                village: value,
                block: selected?.block || current.block
              }));
            }}
            options={institutes.filter((item) => item.status === "Active" && (!lockBlock || matchesBlockScope({ type: "block", block: form.block }, item.block))).map((item) => item.instituteName)}
          />
        </Field>
        <Field label="Gram Panchayat"><Input value={form.gramPanchayat} onChange={(e) => set("gramPanchayat", e.target.value)} /></Field>
        <Field label="Block"><Input disabled value={form.block} onChange={(e) => set("block", e.target.value)} /></Field>
        <Field label="Scheme"><SchemeCombobox value={form.schemeName} onChange={(value) => set("schemeName", value)} schemes={schemes} /></Field>
        <Field label="Father/Husband Name"><Input value={form.fatherHusbandName} onChange={(e) => set("fatherHusbandName", e.target.value)} /></Field>
        <Field label="Ration Card Number (Optional)"><Input value={form.rationCardNumber} onChange={(e) => set("rationCardNumber", e.target.value)} /></Field>
      </div>

      <SectionTitle title="Bank Details (Optional)" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Account Holder Name"><Input value={form.accountHolderName} onChange={(e) => set("accountHolderName", e.target.value)} /></Field>
        <Field label="Bank Name"><Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} /></Field>
        <Field label="Account Number"><Input inputMode="numeric" value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", onlyDigits(e.target.value, 18))} /></Field>
        <Field label="IFSC Code"><Input value={form.ifscCode} onChange={(e) => set("ifscCode", e.target.value.toUpperCase())} /></Field>
      </div>

      <SectionTitle title="Application & Verification" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Application Status"><FilterSelect value={form.status} onChange={(value) => set("status", value)} options={statuses} /></Field>
        <Field label="Verification Date"><Input type="date" value={form.verificationDate} onChange={(e) => set("verificationDate", e.target.value)} /></Field>
        <Field label="Verification Officer"><Input disabled={!canApprove} value={form.verificationOfficer} onChange={(e) => set("verificationOfficer", e.target.value)} /></Field>
        <Field label="Approval Date"><Input type="date" disabled={!canApprove} value={form.dateOfApproval} onChange={(e) => set("dateOfApproval", e.target.value)} /></Field>
        <Field label="Verification Remarks" className="sm:col-span-2"><Textarea value={form.verificationRemarks} onChange={(e) => set("verificationRemarks", e.target.value)} /></Field>
        <Field label="General Remarks" className="sm:col-span-2"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} /></Field>
      </div>

      <SectionTitle title="Distribution" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Distribution Date"><Input type="date" value={form.dateOfDistribution} onChange={(e) => set("dateOfDistribution", e.target.value)} /></Field>
        <Field label="Scheme Name"><Input value={form.schemeName} disabled /></Field>
        <Field label="Quantity"><Input type="number" min={0} value={form.unitsDistributed} onChange={(e) => set("unitsDistributed", Number(e.target.value))} /></Field>
        <Field label="Distribution Photo Upload (Optional)"><Input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={async (event) => { const file = event.target.files?.[0]; if (file) { const distributionPhotoDataUrl = await fileToDataUrl(file); setForm((current) => ({ ...current, distributionPhotoDataUrl, distributionPhotoFileName: file.name })); } }} /></Field>
        <Field label="Distribution Remarks" className="sm:col-span-2"><Textarea value={form.distributionRemarks} onChange={(e) => set("distributionRemarks", e.target.value)} /></Field>
        <Field label="Women Beneficiary"><FilterSelect value={form.womenBeneficiary} onChange={(value) => set("womenBeneficiary", value)} options={yesNo} /></Field>
        <Field label="PVTG"><FilterSelect value={form.pvtg} onChange={(value) => set("pvtg", value)} options={yesNo} /></Field>
        <Field label="FRA Beneficiary"><FilterSelect value={form.fraBeneficiary} onChange={(value) => set("fraBeneficiary", value)} options={yesNo} /></Field>
      </div>
    </div>
  );
}

function BeneficiaryTable({ records, loading, canEdit, canDelete, isDeleting, onView, onEdit, onDelete }: { records: SchemeBeneficiaryRecord[]; loading: boolean; canEdit: (record: SchemeBeneficiaryRecord) => boolean; canDelete: boolean; isDeleting: boolean; onView: (record: SchemeBeneficiaryRecord) => void; onEdit: (record: SchemeBeneficiaryRecord) => void; onDelete: (record: SchemeBeneficiaryRecord) => void }) {
  return (
    <Card className="overflow-hidden border-teal-100 shadow-sm">
      <CardHeader className="border-b bg-slate-50/70 px-4 py-3"><CardTitle className="text-sm">Beneficiary Records</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white">
                <TableHead className="min-w-52">Beneficiary</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Aadhaar</TableHead>
                <TableHead>Institute</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Distribution Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((item) => (
                <TableRow key={item.id} className="hover:bg-emerald-50/60">
                  <TableCell>
                    <div className="font-medium text-slate-900">{item.beneficiaryName}</div>
                    <div className="text-xs text-muted-foreground">{item.beneficiaryId || item.id} | {item.category}</div>
                  </TableCell>
                  <TableCell>{item.mobileNumber}</TableCell>
                  <TableCell>{mask(item.aadhaarNumber)}</TableCell>
                  <TableCell>{item.village}<div className="text-xs text-muted-foreground">{item.block}</div></TableCell>
                  <TableCell className="min-w-48">{item.schemeName}</TableCell>
                  <TableCell><StatusPill status={item.status} /></TableCell>
                  <TableCell>{item.unitsDistributed}</TableCell>
                  <TableCell>{item.dateOfDistribution || "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="View beneficiary" aria-label={`View ${item.beneficiaryName}`} onClick={() => onView(item)}><Eye className="h-4 w-4" /></Button>
                      {canEdit(item) ? <Button size="icon" variant="ghost" title="Edit beneficiary" aria-label={`Edit ${item.beneficiaryName}`} onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button> : null}
                      {canDelete ? <Button size="icon" variant="ghost" title="Delete beneficiary" aria-label={`Delete ${item.beneficiaryName}`} disabled={isDeleting} onClick={() => onDelete(item)}><Trash2 className="h-4 w-4 text-red-600" /></Button> : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!records.length ? <TableRow><TableCell colSpan={9} className="h-28 text-center text-muted-foreground">{loading ? "Loading beneficiaries..." : "No beneficiary records found."}</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: LucideIcon; tone: "teal" | "green" | "red" | "blue" | "amber" }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return <Card className="border-teal-100 shadow-sm"><CardContent className="flex items-center gap-3 p-4"><div className={`rounded-lg p-2 ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold text-slate-950">{value.toLocaleString("en-IN")}</p></div></CardContent></Card>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="border-teal-100 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}

function ReportCard({ title, records }: { title: ReportKind; records: SchemeBeneficiaryRecord[] }) {
  return (
    <Card className="border-teal-100 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><FileText className="h-4 w-4" /></div>
          <div><p className="font-medium leading-snug">{title}</p><p className="text-xs text-muted-foreground">{records.length.toLocaleString("en-IN")} records in current view</p></div>
        </div>
        <div className="grid gap-2">
          <Button variant="outline" size="sm" className="justify-start" onClick={() => exportPdf(records, title)}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="outline" size="sm" className="justify-start" onClick={() => exportExcel(records, title)}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: SchemeBeneficiaryRecord["status"] }) {
  const colors: Record<SchemeBeneficiaryRecord["status"], string> = {
    Registered: "border-slate-200 bg-slate-50 text-slate-700",
    "Verification Pending": "border-amber-200 bg-amber-50 text-amber-700",
    Verified: "border-sky-200 bg-sky-50 text-sky-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
    Distributed: "border-blue-200 bg-blue-50 text-blue-700",
    Completed: "border-teal-200 bg-teal-50 text-teal-700",
  };
  return <Badge variant="outline" className={colors[status]}>{status}</Badge>;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label><div className="mt-1">{children}</div></div>;
}

function SectionTitle({ title }: { title: string }) {
  return <div className="border-b pb-2 text-sm font-semibold text-slate-900">{title}</div>;
}

function SchemeCombobox({ value, onChange, schemes }: { value: string; onChange: (value: string) => void; schemes: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schemes;
    return schemes.filter((name) => name.toLowerCase().includes(q));
  }, [query, schemes]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Select scheme"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              className="flex h-10 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search scheme..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const match = filtered[0];
                  if (match) select(match);
                  else if (query.trim()) select(query.trim());
                }
                if (e.key === "Escape") { setOpen(false); setQuery(""); }
              }}
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length ? (
              filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => select(name)}
                  className={`flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${value === name ? "bg-accent font-medium" : ""}`}
                >
                  {name}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {schemes.length === 0 ? "No schemes in Scheme Management yet." : "No matching scheme found."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options, all }: { value: string; onChange: (value: string) => void; options: readonly string[]; all?: string }) {
  const safeOptions = safeSelectOptions(options);
  const fallback = all || safeOptions[0] || "No options";
  const selectedValue = safeSelectValue(value, safeOptions, fallback);
  return <Select value={selectedValue} onValueChange={onChange}><SelectTrigger className="h-10"><SelectValue /></SelectTrigger><SelectContent>{all ? <SelectItem value={all}>{all}</SelectItem> : null}{safeOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}

function UploadResult({ result }: { result: NonNullable<UploadSummary> }) {
  return <div className={`rounded-md border p-3 text-sm ${result.errors.length ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><p className="font-medium">{result.errors.length ? "Import validation failed" : "Import successful"}</p><p>{result.saved} records saved. {result.errors.length} errors found.</p>{result.errors.length ? <ul className="mt-2 list-disc pl-5">{result.errors.slice(0, 10).map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul> : null}</div>;
}

function Details({ record, admin }: { record: SchemeBeneficiaryRecord; admin: boolean }) {
  return <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{Object.entries(exportRow(record, admin)).map(([key, value]) => <div key={key}><p className="text-xs font-semibold uppercase text-muted-foreground">{key}</p><p className="mt-1 break-words">{String(value || "-")}</p></div>)}{record.distributionPhotoUrl ? <div><p className="text-xs font-semibold uppercase text-muted-foreground">Distribution Photo</p><a className="mt-1 inline-block text-primary underline" href={record.distributionPhotoUrl} target="_blank" rel="noreferrer">View uploaded photo</a></div> : null}</div>;
}

function buildAnalytics(records: SchemeBeneficiaryRecord[]) {
  return {
    total: records.length,
    pendingVerification: records.filter((item) => item.status === "Verification Pending" || item.status === "Registered").length,
    approved: records.filter((item) => item.status === "Approved").length,
    rejected: records.filter((item) => item.status === "Rejected").length,
    distributed: records.filter((item) => item.status === "Distributed" || item.status === "Completed").length,
    byScheme: groupCount(records, "schemeName").map((item) => ({ name: shorten(item.name), beneficiaries: item.value })),
    byStatus: statuses.map((name) => ({ name, value: records.filter((item) => item.status === name).length })).filter((item) => item.value),
  };
}

function groupCount(records: SchemeBeneficiaryRecord[], key: keyof SchemeBeneficiaryRecord) {
  const counts = records.reduce<Record<string, number>>((acc, item) => {
    const name = String(item[key] || "Not Provided");
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({ name, value }));
}

function exportExcel(records: SchemeBeneficiaryRecord[], report: ReportKind) {
  const worksheet = XLSX.utils.json_to_sheet(records.map((item) => exportRow(item, true)));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, report.slice(0, 31));
  XLSX.writeFile(workbook, `${slug(report)}.xlsx`);
}

function exportPdf(records: SchemeBeneficiaryRecord[], report: ReportKind) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text(report, 14, 14);
  autoTable(doc, {
    startY: 20,
    head: [["ID", "Name", "Mobile", "Institute", "Scheme", "Status", "Quantity", "Distribution Date"]],
    body: records.map((item) => [item.beneficiaryId || item.id, item.beneficiaryName, item.mobileNumber, item.village, item.schemeName, item.status, item.unitsDistributed, item.dateOfDistribution || "-"]),
    headStyles: { fillColor: [15, 118, 110] },
    styles: { fontSize: 8 },
  });
  doc.save(`${slug(report)}.pdf`);
}

function exportRow(record: SchemeBeneficiaryRecord, admin = false) {
  return {
    "Beneficiary ID": record.beneficiaryId || record.id,
    "Full Name": record.beneficiaryName,
    "Mobile Number": record.mobileNumber,
    "Aadhaar Number": admin ? record.aadhaarNumber : mask(record.aadhaarNumber),
    Gender: record.gender,
    Category: record.category,
    Institute: record.village,
    "Gram Panchayat": record.gramPanchayat,
    Block: record.block,
    Scheme: record.schemeName,
    "Account Holder Name": record.accountHolderName,
    "Bank Name": record.bankName,
    "Account Number": admin ? record.bankAccountNumber : mask(record.bankAccountNumber),
    "IFSC Code": record.ifscCode,
    Status: record.status,
    "Verification Date": record.verificationDate,
    "Verification Officer": record.verificationOfficer,
    "Verification Remarks": record.verificationRemarks,
    "Approval Date": record.dateOfApproval,
    "Distribution Date": record.dateOfDistribution,
    Quantity: record.unitsDistributed,
    "Distribution Remarks": record.distributionRemarks,
    Remarks: record.remarks,
  };
}

function parseExcelRow(row: Record<string, unknown>, fallbackScheme: string): BeneficiaryForm {
  const data = normalized(row);
  const text = (key: string) => String(data[key.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? "").trim();
  return {
    ...emptyForm,
    beneficiaryId: text("Beneficiary ID"),
    beneficiaryName: text("Full Name") || text("Beneficiary Name"),
    mobileNumber: text("Mobile Number"),
    aadhaarNumber: text("Aadhaar Number"),
    gender: normalizeChoice(text("Gender"), genders, "Female"),
    category: normalizeChoice(text("Category"), categories, "General"),
    village: text("Village"),
    gramPanchayat: text("Gram Panchayat"),
    block: text("Block"),
    schemeName: text("Scheme") || text("Scheme Name") || fallbackScheme,
    accountHolderName: text("Account Holder Name"),
    bankName: text("Bank Name"),
    bankAccountNumber: text("Account Number"),
    ifscCode: text("IFSC Code").toUpperCase(),
    status: normalizeChoice(text("Status"), statuses, "Registered"),
    verificationDate: text("Verification Date"),
    verificationOfficer: text("Verification Officer"),
    verificationRemarks: text("Verification Remarks"),
    dateOfApproval: text("Approval Date"),
    dateOfDistribution: text("Distribution Date"),
    unitsDistributed: Number(text("Quantity") || 0),
    distributionRemarks: text("Distribution Remarks"),
    remarks: text("Remarks"),
  };
}

function validate(item: Partial<BeneficiaryForm>, existingRecords: SchemeBeneficiaryRecord[] = [], currentId?: string) {
  const mobile = normalizeMobileNumber(item.mobileNumber);
  const aadhaar = String(item.aadhaarNumber || "").replace(/\D/g, "");
  const bankAccountNumber = normalizeBankAccountNumber(item.bankAccountNumber);
  if (!item.beneficiaryName || !mobile || !item.aadhaarNumber || !item.village || !item.gramPanchayat || !item.block || !item.schemeName) return "Full name, mobile, Aadhaar, institute, gram panchayat, block and scheme are required.";
  if (!/^\d{10}$/.test(mobile)) return "Mobile number must contain 10 digits.";
  if (!String(item.aadhaarNumber).includes("*") && !/^\d{12}$/.test(aadhaar)) return "Aadhaar number must contain 12 digits.";
  const duplicate = existingRecords.some((record) => record.id !== currentId && (
    (!!aadhaar && !String(record.aadhaarNumber).includes("*") && String(record.aadhaarNumber).replace(/\D/g, "") === aadhaar)
    || (!!mobile && normalizeMobileNumber(record.mobileNumber) === mobile && record.schemeName.trim().toLowerCase() === String(item.schemeName).trim().toLowerCase())
  ));
  if (duplicate) return "A beneficiary with this Aadhaar, or this mobile number for the selected scheme, already exists.";
  if (bankAccountNumber && !/^\d{6,18}$/.test(bankAccountNumber)) return "Bank account number must contain 6 to 18 digits.";
  if (item.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(item.ifscCode))) return "IFSC code format is invalid.";
  if (!Number.isFinite(Number(item.unitsDistributed)) || Number(item.unitsDistributed) < 0) return "Quantity must be a non-negative number.";
  return "";
}

function normalizeBeneficiaryForm(form: BeneficiaryForm): BeneficiaryForm {
  return {
    ...form,
    mobileNumber: normalizeMobileNumber(form.mobileNumber),
    aadhaarNumber: String(form.aadhaarNumber || "").includes("*") ? form.aadhaarNumber : String(form.aadhaarNumber || "").replace(/\D/g, ""),
    bankAccountNumber: normalizeBankAccountNumber(form.bankAccountNumber),
    ifscCode: String(form.ifscCode || "").trim().toUpperCase(),
  };
}

function normalizeMobileNumber(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(-10) : digits;
}

function normalizeBankAccountNumber(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function mask(value: string) {
  const text = String(value || "");
  return text.includes("*") ? text : `${"*".repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function shorten(value: string) {
  return value.replace(" Distribution Scheme", "").replace(" Promotion Scheme", "").replace(" Scheme", "");
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

function onlyDigits(value: string, max: number) {
  return value.replace(/\\D/g, "").slice(0, max);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read photo file"));
    reader.readAsDataURL(file);
  });
}

function writeWorkbook(fileName: string, rows: unknown[][]) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Beneficiaries");
  XLSX.writeFile(workbook, fileName);
}

function normalized(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value]));
}

function normalizeChoice<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
