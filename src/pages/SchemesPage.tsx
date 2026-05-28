import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { Download, FileText, FileUpload, ShieldCheck, ShoppingBag, UserPlus } from "lucide-react";

type SchemeStatus = "Pending" | "Approved" | "Rejected";

type SchemeBeneficiary = {
  id: string;
  institution: string;
  scheme: string;
  name: string;
  mobile: string;
  aadhaar: string;
  village: string;
  category: "SC" | "ST" | "OBC" | "GEN";
  gender: "Male" | "Female" | "Other";
  animalType: string;
  quantity: number;
  breed: string;
  totalCost: number;
  subsidyAmount: number;
  beneficiaryContribution: number;
  officerName: string;
  inspectionDate: string;
  status: SchemeStatus;
  aadhaarFileName: string;
  photoFileName: string;
  passbookFileName: string;
};

type RecentBeneficiaryRow = {
  id: number;
  institution: string;
  backyardPoultry: number;
  piggeryUnit: number;
  maleGoatDistribution: number;
  bullDistribution: number;
  femaleCalfRearing: number;
  poultryPromotionScheme: number;
};

const schemeOptions = [
  "Goat Scheme",
  "Pig Scheme",
  "Poultry Scheme",
  "Bull Distribution",
  "Female Calf Scheme",
];
const animalOptions = ["Goat", "Pig", "Poultry", "Bull", "Female Calf"];
const categoryOptions: SchemeBeneficiary["category"][] = ["SC", "ST", "OBC", "GEN"];
const genderOptions: SchemeBeneficiary["gender"][] = ["Male", "Female", "Other"];
const statusOptions: SchemeStatus[] = ["Pending", "Approved", "Rejected"];
const statusFilterOptions: Array<"All" | SchemeStatus> = ["All", "Pending", "Approved", "Rejected"];

const initialBeneficiary: SchemeBeneficiary = {
  id: "",
  institution: "",
  scheme: schemeOptions[0],
  name: "",
  mobile: "",
  aadhaar: "",
  village: "",
  category: "GEN",
  gender: "Male",
  animalType: animalOptions[0],
  quantity: 1,
  breed: "",
  totalCost: 0,
  subsidyAmount: 0,
  beneficiaryContribution: 0,
  officerName: "",
  inspectionDate: "",
  status: "Pending",
  aadhaarFileName: "",
  photoFileName: "",
  passbookFileName: "",
};

const sampleBeneficiaries: SchemeBeneficiary[] = [
  {
    id: "BEN-001",
    institution: "पशु चिकित्सालय दन्तेवाड़ा",
    scheme: "Goat Scheme",
    name: "Radha Bai",
    mobile: "9876543210",
    aadhaar: "1234-5678-9012",
    village: "Chitrakonda",
    category: "OBC",
    gender: "Female",
    animalType: "Goat",
    quantity: 4,
    breed: "Local",
    totalCost: 56000,
    subsidyAmount: 42000,
    beneficiaryContribution: 14000,
    officerName: "Suresh Kumar",
    inspectionDate: "2026-05-15",
    status: "Approved",
    aadhaarFileName: "radha-aadhaar.pdf",
    photoFileName: "radha-photo.jpg",
    passbookFileName: "radha-passbook.pdf",
  },
  {
    id: "BEN-002",
    institution: "कृपकेन्द्र बचेली",
    scheme: "Poultry Scheme",
    name: "Ravi Nayak",
    mobile: "9123456780",
    aadhaar: "2345-6789-0123",
    village: "Bandagaon",
    category: "SC",
    gender: "Male",
    animalType: "Poultry",
    quantity: 20,
    breed: "Layer",
    totalCost: 42000,
    subsidyAmount: 31500,
    beneficiaryContribution: 10500,
    officerName: "Meena Devi",
    inspectionDate: "2026-05-18",
    status: "Pending",
    aadhaarFileName: "ravi-aadhaar.pdf",
    photoFileName: "ravi-photo.jpg",
    passbookFileName: "ravi-passbook.pdf",
  },
];

const recentBeneficiaries: RecentBeneficiaryRow[] = [
  { id: 1, institution: "पशु चिकित्सालय दन्तेवाड़ा", backyardPoultry: 80, piggeryUnit: 4, maleGoatDistribution: 4, bullDistribution: 2, femaleCalfRearing: 4, poultryPromotionScheme: 1 },
  { id: 2, institution: "कृपकेन्द्र बचेली", backyardPoultry: 70, piggeryUnit: 2, maleGoatDistribution: 4, bullDistribution: 0, femaleCalfRearing: 5, poultryPromotionScheme: 0 },
  { id: 3, institution: "पशु चिकित्सालय गीदम", backyardPoultry: 95, piggeryUnit: 6, maleGoatDistribution: 4, bullDistribution: 2, femaleCalfRearing: 3, poultryPromotionScheme: 2 },
  { id: 4, institution: "पशु चिकित्सालय बारसूर", backyardPoultry: 85, piggeryUnit: 2, maleGoatDistribution: 4, bullDistribution: 0, femaleCalfRearing: 3, poultryPromotionScheme: 0 },
  { id: 5, institution: "पशु चिकित्सालय बड़ेगुडुमार", backyardPoultry: 70, piggeryUnit: 2, maleGoatDistribution: 2, bullDistribution: 0, femaleCalfRearing: 2, poultryPromotionScheme: 0 },
];

const SchemesPage = () => {
  const [beneficiaries, setBeneficiaries] = useState<SchemeBeneficiary[]>(sampleBeneficiaries);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SchemeBeneficiary>({ ...initialBeneficiary });
  const [statusFilter, setStatusFilter] = useState<"All" | SchemeStatus>("Pending");

  const filteredBeneficiaries = useMemo(
    () => (statusFilter === "All" ? beneficiaries : beneficiaries.filter((item) => item.status === statusFilter)),
    [beneficiaries, statusFilter],
  );

  const totalTarget = useMemo(() => beneficiaries.length * 12 + 20, [beneficiaries]);
  const completed = useMemo(() => beneficiaries.filter((item) => item.status === "Approved").length, [beneficiaries]);
  const pending = useMemo(() => beneficiaries.filter((item) => item.status === "Pending").length, [beneficiaries]);
  const schemeCounts = useMemo(
    () => schemeOptions.map((scheme) => ({ scheme, count: beneficiaries.filter((item) => item.scheme === scheme).length })),
    [beneficiaries],
  );

  const saveBeneficiary = () => {
    if (!form.institution || !form.name || !form.mobile || !form.aadhaar || !form.village) {
      toast({ title: "Complete all beneficiary details", variant: "destructive" });
      return;
    }

    setBeneficiaries((current) => [
      ...current,
      { ...form, id: `BEN-${String(current.length + 1).padStart(3, "0")}` },
    ]);
    setOpen(false);
    setForm({ ...initialBeneficiary });
    toast({ title: "Beneficiary added", description: "New scheme beneficiary has been saved." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Scheme Management" description="Manage scheme beneficiaries, subsidy verification and export-ready reports.">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary"><UserPlus className="mr-2 h-4 w-4" /> Add Beneficiary</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Scheme Beneficiary</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Scheme</Label>
                  <Select value={form.scheme} onValueChange={(value) => setForm((prev) => ({ ...prev, scheme: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{schemeOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Institution Name</Label>
                  <Input value={form.institution} onChange={(event) => setForm((prev) => ({ ...prev, institution: event.target.value }))} />
                </div>
                <div>
                  <Label>Beneficiary Name</Label>
                  <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <Input inputMode="numeric" maxLength={10} value={form.mobile} onChange={(event) => setForm((prev) => ({ ...prev, mobile: event.target.value }))} />
                </div>
                <div>
                  <Label>Aadhaar Number</Label>
                  <Input value={form.aadhaar} onChange={(event) => setForm((prev) => ({ ...prev, aadhaar: event.target.value }))} />
                </div>
                <div>
                  <Label>Village</Label>
                  <Input value={form.village} onChange={(event) => setForm((prev) => ({ ...prev, village: event.target.value }))} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value as SchemeBeneficiary["category"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categoryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value as SchemeBeneficiary["gender"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{genderOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Animal Type</Label>
                  <Select value={form.animalType} onValueChange={(value) => setForm((prev) => ({ ...prev, animalType: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{animalOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" min={1} value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))} />
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input value={form.breed} onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))} />
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <Input type="number" min={0} value={form.totalCost} onChange={(event) => setForm((prev) => ({ ...prev, totalCost: Number(event.target.value) }))} />
                </div>
                <div>
                  <Label>Subsidy Amount</Label>
                  <Input type="number" min={0} value={form.subsidyAmount} onChange={(event) => setForm((prev) => ({ ...prev, subsidyAmount: Number(event.target.value) }))} />
                </div>
                <div>
                  <Label>Beneficiary Contribution</Label>
                  <Input type="number" min={0} value={form.beneficiaryContribution} onChange={(event) => setForm((prev) => ({ ...prev, beneficiaryContribution: Number(event.target.value) }))} />
                </div>
                <div>
                  <Label>Officer Name</Label>
                  <Input value={form.officerName} onChange={(event) => setForm((prev) => ({ ...prev, officerName: event.target.value }))} />
                </div>
                <div>
                  <Label>Inspection Date</Label>
                  <Input type="date" value={form.inspectionDate} onChange={(event) => setForm((prev) => ({ ...prev, inspectionDate: event.target.value }))} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as SchemeStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statusOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aadhaar Document</Label>
                  <Input type="file" onChange={(event) => setForm((prev) => ({ ...prev, aadhaarFileName: event.target.files?.[0]?.name || "" }))} />
                </div>
                <div>
                  <Label>Photo</Label>
                  <Input type="file" onChange={(event) => setForm((prev) => ({ ...prev, photoFileName: event.target.files?.[0]?.name || "" }))} />
                </div>
                <div>
                  <Label>Bank Passbook</Label>
                  <Input type="file" onChange={(event) => setForm((prev) => ({ ...prev, passbookFileName: event.target.files?.[0]?.name || "" }))} />
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={saveBeneficiary}>Save Beneficiary</Button>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="list">Scheme List</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card><CardHeader><CardTitle>Total Target</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{totalTarget}</CardContent></Card>
              <Card><CardHeader><CardTitle>Completed</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{completed}</CardContent></Card>
              <Card><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{pending}</CardContent></Card>
              <Card><CardHeader><CardTitle>Beneficiary Count</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{beneficiaries.length}</CardContent></Card>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {schemeCounts.map((item) => (
                <Card key={item.scheme}>
                  <CardHeader>
                    <CardTitle>{item.scheme}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">{item.count}</CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {schemeOptions.map((scheme) => (
                <Card key={scheme} className="border">
                  <CardHeader>
                    <CardTitle>{scheme}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-sm text-muted-foreground">Beneficiaries</div>
                    <div className="text-2xl font-semibold">{beneficiaries.filter((item) => item.scheme === scheme).length}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Beneficiaries</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No.</TableHead>
                      <TableHead>Institution Name</TableHead>
                      <TableHead>Backyard Poultry Distribution</TableHead>
                      <TableHead>Piggery Unit</TableHead>
                      <TableHead>Male Goat Distribution</TableHead>
                      <TableHead>Bull Distribution</TableHead>
                      <TableHead>Female Calf Rearing</TableHead>
                      <TableHead>Poultry Promotion Scheme</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBeneficiaries.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.institution}</TableCell>
                        <TableCell>{row.backyardPoultry}</TableCell>
                        <TableCell>{row.piggeryUnit}</TableCell>
                        <TableCell>{row.maleGoatDistribution}</TableCell>
                        <TableCell>{row.bullDistribution}</TableCell>
                        <TableCell>{row.femaleCalfRearing}</TableCell>
                        <TableCell>{row.poultryPromotionScheme}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Officer Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 pb-4">
                  <Label htmlFor="status-filter" className="whitespace-nowrap">Status</Label>
                  <Select id="status-filter" value={statusFilter} onValueChange={(value) => setStatusFilter(value as "All" | SchemeStatus)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusFilterOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Institution</TableHead>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Officer</TableHead>
                        <TableHead>Inspection Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBeneficiaries.map((beneficiary) => (
                        <TableRow key={beneficiary.id}>
                          <TableCell>{beneficiary.institution || "-"}</TableCell>
                          <TableCell>{beneficiary.name}</TableCell>
                          <TableCell>{beneficiary.officerName || "Not Assigned"}</TableCell>
                          <TableCell>{beneficiary.inspectionDate || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={beneficiary.status === "Approved" ? "secondary" : beneficiary.status === "Rejected" ? "destructive" : "outline"}>{beneficiary.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => toast({ title: "Download PDF", description: "PDF export is not connected yet.", action: <ToastAction altText="Dismiss">OK</ToastAction> })}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button variant="secondary" onClick={() => toast({ title: "Download Excel", description: "Excel export is not connected yet.", action: <ToastAction altText="Dismiss">OK</ToastAction> })}>
                <FileText className="mr-2 h-4 w-4" /> Download Excel
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Scheme Reports</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scheme</TableHead>
                      <TableHead>Beneficiaries</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schemeCounts.map((item) => {
                      const approvedCount = beneficiaries.filter((beneficiary) => beneficiary.scheme === item.scheme && beneficiary.status === "Approved").length;
                      const pendingCount = beneficiaries.filter((beneficiary) => beneficiary.scheme === item.scheme && beneficiary.status === "Pending").length;
                      return (
                        <TableRow key={item.scheme}>
                          <TableCell>{item.scheme}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{approvedCount}</TableCell>
                          <TableCell>{pendingCount}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SchemesPage;
