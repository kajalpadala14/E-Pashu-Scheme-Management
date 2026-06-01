import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import type { SessionUser } from "@/contexts/UserContext";
import { bulkUpsertSchemeBeneficiaryRecords, createSchemeBeneficiaryRecord, deleteSchemeBeneficiaryRecord, updateSchemeBeneficiaryRecord } from "@/lib/dataService";
import type { SchemeBeneficiaryRecord } from "@/lib/types";
import { Download, Eye, FileSpreadsheet, Pencil, Plus, Search, Trash2, Upload, Users } from "lucide-react";

type BeneficiaryForm = Omit<SchemeBeneficiaryRecord, "id" | "createdAt" | "updatedAt" | "createdBy" | "distributionPhotoUrl" | "distributionPhotoFileId"> & {
  distributionPhotoDataUrl?: string;
  distributionPhotoFileName?: string;
};
type UploadSummary = { saved: number; errors: string[] } | null;

const categories: SchemeBeneficiaryRecord["category"][] = ["General", "OBC", "SC", "ST"];
const yesNo: Array<"Yes" | "No"> = ["Yes", "No"];
const excelHeaders = ["Beneficiary Name", "Father/Husband Name", "Mobile Number", "Aadhaar Number", "Ration Card Number", "Bank Account Number", "IFSC Code", "Village", "Gram Panchayat", "Block", "Category", "Women Beneficiary", "PVTG", "FRA Beneficiary", "Scheme Name", "Date of Approval", "Date of Distribution", "Units Distributed", "Remarks"];

const emptyForm: BeneficiaryForm = {
  beneficiaryName: "", fatherHusbandName: "", mobileNumber: "", aadhaarNumber: "", rationCardNumber: "",
  bankAccountNumber: "", ifscCode: "", village: "", gramPanchayat: "", block: "", category: "General",
  womenBeneficiary: "No", pvtg: "No", fraBeneficiary: "No", schemeName: "", dateOfApproval: "",
  dateOfDistribution: "", unitsDistributed: 0, remarks: "",
};

export function SchemeBeneficiaryManagement({ records, schemes, user, isLoading }: { records: SchemeBeneficiaryRecord[]; schemes: string[]; user: SessionUser | null; isLoading: boolean }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [scheme, setScheme] = useState("All Schemes");
  const [village, setVillage] = useState("All Villages");
  const [block, setBlock] = useState("All Blocks");
  const [category, setCategory] = useState("All Categories");
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<SchemeBeneficiaryRecord | null>(null);
  const [editing, setEditing] = useState<SchemeBeneficiaryRecord | null>(null);
  const [form, setForm] = useState<BeneficiaryForm>({ ...emptyForm });
  const [uploadSummary, setUploadSummary] = useState<UploadSummary>(null);

  const canWrite = user?.role === "admin" || user?.role === "data_entry_operator" || user?.role === "block_officer" || user?.role === "field_officer";
  const canDelete = user?.role === "admin";
  const canEdit = (record: SchemeBeneficiaryRecord) => user?.role === "admin" || user?.role === "data_entry_operator" || ((user?.role === "block_officer" || user?.role === "field_officer") && matchesBlock(user.region, record.block));
  const filtered = useMemo(() => records.filter((item) => (
    (scheme === "All Schemes" || item.schemeName === scheme)
    && (village === "All Villages" || item.village === village)
    && (block === "All Blocks" || item.block === block)
    && (category === "All Categories" || item.category === category)
    && `${item.beneficiaryName} ${item.mobileNumber} ${item.village}`.toLowerCase().includes(search.toLowerCase())
  )), [block, category, records, scheme, search, village]);

  const analytics = useMemo(() => ({
    byScheme: schemes.map((name) => ({ name: shorten(name), beneficiaries: filtered.filter((item) => item.schemeName === name).length })).filter((item) => item.beneficiaries),
    byCategory: categories.map((name) => ({ name, beneficiaries: filtered.filter((item) => item.category === name).length })),
    women: filtered.filter((item) => item.womenBeneficiary === "Yes").length,
    scst: filtered.filter((item) => item.category === "SC" || item.category === "ST").length,
    pvtg: filtered.filter((item) => item.pvtg === "Yes").length,
    fra: filtered.filter((item) => item.fraBeneficiary === "Yes").length,
    timeline: timelineRows(filtered),
  }), [filtered, schemes]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["schemeBeneficiaryRecords"] });
  const saveMutation = useMutation({
    mutationFn: (input: BeneficiaryForm | (SchemeBeneficiaryRecord & BeneficiaryForm)) => editing ? updateSchemeBeneficiaryRecord(input as SchemeBeneficiaryRecord & BeneficiaryForm) : createSchemeBeneficiaryRecord(input as BeneficiaryForm),
    onSuccess: async () => { await refresh(); setFormOpen(false); setEditing(null); setForm({ ...emptyForm }); toast({ title: "Beneficiary saved", description: "Scheme analytics have been updated." }); },
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

  const add = () => { setEditing(null); setForm({ ...emptyForm, block: user?.role === "block_officer" || user?.role === "field_officer" ? user.region : "", schemeName: schemes[0] || "" }); setFormOpen(true); };
  const edit = (record: SchemeBeneficiaryRecord) => { setEditing(record); setForm({ ...record }); setFormOpen(true); };
  const save = async () => {
    const error = validate(form);
    if (error) return toast({ title: "Check beneficiary record", description: error, variant: "destructive" });
    await saveMutation.mutateAsync(editing ? { ...editing, ...form } : form);
  };
  const uploadExcel = async (file: File) => {
    setUploadSummary(null);
    if (!file.name.toLowerCase().endsWith(".xlsx")) return setUploadSummary({ saved: 0, errors: ["Upload an Excel .xlsx file."] });
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" }).map(parseExcelRow);
      const errors = rows.flatMap((item, index) => {
        const error = validate(item);
        if (error) return [`Row ${index + 2}: ${error}`];
        if ((user?.role === "block_officer" || user?.role === "field_officer") && !matchesBlock(user.region, item.block)) return [`Row ${index + 2}: block officers can only upload their assigned block.`];
        return [];
      });
      if (!rows.length) errors.push("The workbook does not contain data rows.");
      if (errors.length) return setUploadSummary({ saved: 0, errors });
      await bulkMutation.mutateAsync(rows);
    } catch (error) { setUploadSummary({ saved: 0, errors: [message(error)] }); }
  };
  const downloadTemplate = () => writeWorkbook("scheme-beneficiary-template.xlsx", [excelHeaders, ["Example Beneficiary", "Father Name", "9876543210", "123456789012", "RC-001", "1234567890", "SBIN0000001", "Example Village", "Example Panchayat", "Dantewada", "ST", "Yes", "No", "Yes", schemes[0] || "", "2026-05-01", "2026-05-15", 2, "Replace this example row"]]);
  const exportExcel = () => {
    const rows = filtered.map((item) => exportRow(item, user?.role === "admin"));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Beneficiaries"); XLSX.writeFile(workbook, "scheme-beneficiaries.xlsx");
  };

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h3 className="text-lg font-semibold">Beneficiary Management</h3><p className="text-sm text-muted-foreground">Individual scheme benefit distribution records and coverage analytics.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel</Button>{canWrite ? <Button onClick={add}><Plus className="mr-2 h-4 w-4" /> Add Beneficiary</Button> : null}</div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <MiniMetric label="Beneficiaries" value={filtered.length} />
      <MiniMetric label="Women" value={analytics.women} />
      <MiniMetric label="SC/ST Coverage" value={analytics.scst} />
      <MiniMetric label="PVTG Coverage" value={analytics.pvtg} />
      <MiniMetric label="FRA Coverage" value={analytics.fra} />
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <AnalyticsChart title="Beneficiary Count by Scheme" data={analytics.byScheme} />
      <AnalyticsChart title="Beneficiary Count by Category" data={analytics.byCategory} />
      <AnalyticsChart title="Distribution Timeline" data={analytics.timeline} />
    </div>

    <Card><CardHeader className="pb-3"><CardTitle className="text-sm">Beneficiary Filters</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Filter value={scheme} onChange={setScheme} all="All Schemes" options={schemes} />
      <Filter value={block} onChange={setBlock} all="All Blocks" options={unique(records.map((item) => item.block))} />
      <Filter value={village} onChange={setVillage} all="All Villages" options={unique(records.filter((item) => block === "All Blocks" || item.block === block).map((item) => item.village))} />
      <Filter value={category} onChange={setCategory} all="All Categories" options={categories} />
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search beneficiary" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    </CardContent></Card>

    {canWrite ? <Card><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">Bulk beneficiary import</p><p className="text-xs text-muted-foreground">Validate and save beneficiary records from an Excel workbook.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" /> Template</Button><Label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium"><Upload className="mr-2 h-4 w-4" /> Import Excel<Input className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadExcel(file); event.target.value = ""; }} /></Label></div></CardContent>{uploadSummary ? <CardContent className="pt-0"><UploadResult result={uploadSummary} /></CardContent> : null}</Card> : null}

    <BeneficiaryTable records={filtered} loading={isLoading} canEdit={canEdit} canDelete={canDelete} onView={setViewRecord} onEdit={edit} onDelete={(record) => { if (window.confirm(`Delete beneficiary ${record.beneficiaryName}?`)) deleteMutation.mutate(record.id); }} />

    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Edit Beneficiary" : "Add Beneficiary"}</DialogTitle><DialogDescription>Personal identity and bank details are stored securely and masked outside administrator detail views.</DialogDescription></DialogHeader><BeneficiaryFormFields form={form} setForm={setForm} schemes={schemes} lockBlock={user?.role === "block_officer" || user?.role === "field_officer"} /><Button onClick={save} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Beneficiary"}</Button></DialogContent></Dialog>
    <Dialog open={!!viewRecord} onOpenChange={(open) => { if (!open) setViewRecord(null); }}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Beneficiary Details</DialogTitle><DialogDescription>{user?.role === "admin" ? "Administrator detail view" : "Sensitive identifiers remain masked for your role."}</DialogDescription></DialogHeader>{viewRecord ? <Details record={viewRecord} admin={user?.role === "admin"} /> : null}</DialogContent></Dialog>
  </div>;
}

function BeneficiaryFormFields({ form, setForm, schemes, lockBlock }: { form: BeneficiaryForm; setForm: React.Dispatch<React.SetStateAction<BeneficiaryForm>>; schemes: string[]; lockBlock: boolean }) {
  const set = (key: keyof BeneficiaryForm, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Field label="Beneficiary Name"><Input value={form.beneficiaryName} onChange={(e) => set("beneficiaryName", e.target.value)} /></Field><Field label="Father/Husband Name"><Input value={form.fatherHusbandName} onChange={(e) => set("fatherHusbandName", e.target.value)} /></Field><Field label="Mobile Number"><Input inputMode="numeric" value={form.mobileNumber} onChange={(e) => set("mobileNumber", e.target.value)} /></Field>
    <Field label="Aadhaar Number"><Input value={form.aadhaarNumber} onChange={(e) => set("aadhaarNumber", e.target.value)} /></Field><Field label="Ration Card Number"><Input value={form.rationCardNumber} onChange={(e) => set("rationCardNumber", e.target.value)} /></Field><Field label="Bank Account Number"><Input value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} /></Field>
    <Field label="IFSC Code"><Input value={form.ifscCode} onChange={(e) => set("ifscCode", e.target.value)} /></Field><Field label="Village"><Input value={form.village} onChange={(e) => set("village", e.target.value)} /></Field><Field label="Gram Panchayat"><Input value={form.gramPanchayat} onChange={(e) => set("gramPanchayat", e.target.value)} /></Field>
    <Field label="Block"><Input disabled={lockBlock} value={form.block} onChange={(e) => set("block", e.target.value)} /></Field><Field label="Category"><Filter value={form.category} onChange={(value) => set("category", value)} options={categories} /></Field><Field label="Scheme Name"><Filter value={form.schemeName} onChange={(value) => set("schemeName", value)} options={schemes} /></Field>
    <Field label="Women Beneficiary"><Filter value={form.womenBeneficiary} onChange={(value) => set("womenBeneficiary", value)} options={yesNo} /></Field><Field label="PVTG"><Filter value={form.pvtg} onChange={(value) => set("pvtg", value)} options={yesNo} /></Field><Field label="FRA Beneficiary"><Filter value={form.fraBeneficiary} onChange={(value) => set("fraBeneficiary", value)} options={yesNo} /></Field>
    <Field label="Date of Approval"><Input type="date" value={form.dateOfApproval} onChange={(e) => set("dateOfApproval", e.target.value)} /></Field><Field label="Date of Distribution"><Input type="date" value={form.dateOfDistribution} onChange={(e) => set("dateOfDistribution", e.target.value)} /></Field><Field label="Units Distributed"><Input type="number" min={0} value={form.unitsDistributed} onChange={(e) => set("unitsDistributed", Number(e.target.value))} /></Field>
    <Field label="Distribution Photo"><Input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={async (event) => { const file = event.target.files?.[0]; if (file) { const distributionPhotoDataUrl = await fileToDataUrl(file); setForm((current) => ({ ...current, distributionPhotoDataUrl, distributionPhotoFileName: file.name })); } }} /></Field>
    <Field label="Remarks" className="sm:col-span-2"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} /></Field>
  </div>;
}

function BeneficiaryTable({ records, loading, canEdit, canDelete, onView, onEdit, onDelete }: { records: SchemeBeneficiaryRecord[]; loading: boolean; canEdit: (record: SchemeBeneficiaryRecord) => boolean; canDelete: boolean; onView: (record: SchemeBeneficiaryRecord) => void; onEdit: (record: SchemeBeneficiaryRecord) => void; onDelete: (record: SchemeBeneficiaryRecord) => void }) {
  return <Card><CardHeader><CardTitle className="text-sm">Beneficiary Records</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Mobile</TableHead><TableHead>Aadhaar</TableHead><TableHead>Bank Account</TableHead><TableHead>Village</TableHead><TableHead>Block</TableHead><TableHead>Category</TableHead><TableHead>Scheme</TableHead><TableHead>Units</TableHead><TableHead>Distribution Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
    {records.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.beneficiaryName}</TableCell><TableCell>{item.mobileNumber}</TableCell><TableCell>{mask(item.aadhaarNumber)}</TableCell><TableCell>{mask(item.bankAccountNumber)}</TableCell><TableCell>{item.village}</TableCell><TableCell>{item.block}</TableCell><TableCell><Badge variant="outline">{item.category}</Badge></TableCell><TableCell>{item.schemeName}</TableCell><TableCell>{item.unitsDistributed}</TableCell><TableCell>{item.dateOfDistribution || "-"}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => onView(item)}><Eye className="h-4 w-4" /></Button>{canEdit(item) ? <Button size="icon" variant="ghost" onClick={() => onEdit(item)}><Pencil className="h-4 w-4" /></Button> : null}{canDelete ? <Button size="icon" variant="ghost" onClick={() => onDelete(item)}><Trash2 className="h-4 w-4 text-red-600" /></Button> : null}</div></TableCell></TableRow>)}
    {!records.length ? <TableRow><TableCell colSpan={11} className="h-24 text-center text-muted-foreground">{loading ? "Loading beneficiaries..." : "No beneficiary records found."}</TableCell></TableRow> : null}
  </TableBody></Table></CardContent></Card>;
}

function MiniMetric({ label, value }: { label: string; value: number }) { return <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-full bg-emerald-50 p-2 text-emerald-700"><Users className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div></CardContent></Card>; }
function AnalyticsChart({ title, data }: { title: string; data: Array<{ name: string; beneficiaries: number }> }) { return <Card><CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={210}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="beneficiaries" name="Beneficiaries" fill="#15803d" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>; }
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <div className={className}><Label>{label}</Label><div className="mt-1">{children}</div></div>; }
function Filter({ value, onChange, options, all }: { value: string; onChange: (value: string) => void; options: readonly string[]; all?: string }) { return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{all ? <SelectItem value={all}>{all}</SelectItem> : null}{options.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>; }
function UploadResult({ result }: { result: NonNullable<UploadSummary> }) { return <div className={`rounded-md border p-3 text-sm ${result.errors.length ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><p className="font-medium">{result.errors.length ? "Import validation failed" : "Import successful"}</p><p>{result.saved} records saved. {result.errors.length} errors found.</p>{result.errors.length ? <ul className="mt-2 list-disc pl-5">{result.errors.slice(0, 10).map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul> : null}</div>; }
function Details({ record, admin }: { record: SchemeBeneficiaryRecord; admin: boolean }) { return <div className="grid gap-3 text-sm sm:grid-cols-2">{Object.entries(exportRow(record, admin)).map(([key, value]) => <div key={key}><p className="text-xs font-semibold uppercase text-muted-foreground">{key}</p><p className="mt-1">{String(value || "-")}</p></div>)}{record.distributionPhotoUrl ? <div><p className="text-xs font-semibold uppercase text-muted-foreground">Distribution Photo</p><a className="mt-1 inline-block text-primary underline" href={record.distributionPhotoUrl} target="_blank" rel="noreferrer">View uploaded photo</a></div> : null}</div>; }
function mask(value: string) { const text = String(value || ""); return text.includes("*") ? text : `${"*".repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`; }
function unique(values: string[]) { return Array.from(new Set(values.filter(Boolean))).sort(); }
function matchesBlock(region: string, block: string) { const own = String(region || "").toLowerCase(); const target = String(block || "").toLowerCase(); return !!own && !!target && (own.includes(target) || target.includes(own)); }
function shorten(value: string) { return value.replace(" Distribution", "").replace("Chhattisgarh ", "").replace(" Yojana", ""); }
function message(error: unknown) { return error instanceof Error ? error.message : "Unexpected error"; }
function validate(item: Partial<BeneficiaryForm>) { if (!item.beneficiaryName || !item.mobileNumber || !item.aadhaarNumber || !item.bankAccountNumber || !item.village || !item.block || !item.schemeName) return "Name, mobile, Aadhaar, bank account, village, block and scheme are required."; if (!/^\d{10}$/.test(String(item.mobileNumber))) return "Mobile number must contain 10 digits."; if (!String(item.aadhaarNumber).includes("*") && !/^\d{12}$/.test(String(item.aadhaarNumber))) return "Aadhaar number must contain 12 digits."; if (!Number.isFinite(Number(item.unitsDistributed)) || Number(item.unitsDistributed) < 0) return "Units distributed must be a non-negative number."; return ""; }
function fileToDataUrl(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = () => reject(new Error("Unable to read photo file")); reader.readAsDataURL(file); }); }
function writeWorkbook(fileName: string, rows: unknown[][]) { const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Beneficiaries"); XLSX.writeFile(workbook, fileName); }
function normalized(row: Record<string, unknown>) { return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value])); }
function parseExcelRow(row: Record<string, unknown>): BeneficiaryForm { const data = normalized(row); const text = (key: string) => String(data[key.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? "").trim(); return { beneficiaryName: text("Beneficiary Name"), fatherHusbandName: text("Father/Husband Name"), mobileNumber: text("Mobile Number"), aadhaarNumber: text("Aadhaar Number"), rationCardNumber: text("Ration Card Number"), bankAccountNumber: text("Bank Account Number"), ifscCode: text("IFSC Code"), village: text("Village"), gramPanchayat: text("Gram Panchayat"), block: text("Block"), category: text("Category") as BeneficiaryForm["category"], womenBeneficiary: text("Women Beneficiary") as BeneficiaryForm["womenBeneficiary"], pvtg: text("PVTG") as BeneficiaryForm["pvtg"], fraBeneficiary: text("FRA Beneficiary") as BeneficiaryForm["fraBeneficiary"], schemeName: text("Scheme Name"), dateOfApproval: text("Date of Approval"), dateOfDistribution: text("Date of Distribution"), unitsDistributed: Number(text("Units Distributed") || 0), remarks: text("Remarks") }; }
function exportRow(record: SchemeBeneficiaryRecord, admin = false) { return { "Beneficiary Name": record.beneficiaryName, "Father/Husband Name": record.fatherHusbandName, "Mobile Number": record.mobileNumber, "Aadhaar Number": admin ? record.aadhaarNumber : mask(record.aadhaarNumber), "Ration Card Number": record.rationCardNumber, "Bank Account Number": admin ? record.bankAccountNumber : mask(record.bankAccountNumber), "IFSC Code": record.ifscCode, Village: record.village, "Gram Panchayat": record.gramPanchayat, Block: record.block, Category: record.category, "Women Beneficiary": record.womenBeneficiary, PVTG: record.pvtg, "FRA Beneficiary": record.fraBeneficiary, "Scheme Name": record.schemeName, "Date of Approval": record.dateOfApproval, "Date of Distribution": record.dateOfDistribution, "Units Distributed": record.unitsDistributed, Remarks: record.remarks }; }
function timelineRows(records: SchemeBeneficiaryRecord[]) { const counts = records.reduce<Record<string, number>>((acc, item) => { const month = item.dateOfDistribution ? item.dateOfDistribution.slice(0, 7) : "Pending"; acc[month] = (acc[month] || 0) + 1; return acc; }, {}); return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([name, beneficiaries]) => ({ name, beneficiaries })); }
