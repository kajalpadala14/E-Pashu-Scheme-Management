import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { FarmerRecord } from "@/lib/types";
import { Landmark, MapPinned, Phone, Plus, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { AdminAreaSelect } from "@/components/AdminAreaSelect";
import { allAdministrativeFilter, areaForRecord, buildAdministrativeOptions, defaultAdministrativeArea, matchesAdministrativeFilter, type AdministrativeArea, type AdministrativeFilter } from "@/lib/adminHierarchy";
import { createFarmerRecord, listFarmerRecords, listLocations } from "@/lib/dataService";
import type { LocationRecord } from "@/lib/types";
import { isValidIndianMobile, sanitizeIndianMobileInput } from "@/lib/phone";
import { buildWhatsAppUrl } from "@/lib/phone";

const blank: FarmerRecord = {
  id: "",
  name: "",
  mobile: "",
  aadhaar: "",
  address: "",
  district: defaultAdministrativeArea.district,
  tehsil: defaultAdministrativeArea.tehsil,
  block: defaultAdministrativeArea.block,
  gramPanchayat: defaultAdministrativeArea.gramPanchayat,
  accountNumber: "",
  rationCard: "",
  village: "",
  totalAnimals: 0,
  loanStatus: "No Loan",
  insuranceStatus: "Not Insured",
  governmentScheme: "",
  ownerType: "Individual",
};

const FarmersPage = () => {
  const queryClient = useQueryClient();
  const { data: records = [] } = useQuery({ queryKey: ["farmerRecords"], queryFn: listFarmerRecords, initialData: [] as FarmerRecord[] });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, initialData: [] as LocationRecord[] });
  const [search, setSearch] = useState("");
  const [loanFilter, setLoanFilter] = useState("All");
  const [insuranceFilter, setInsuranceFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState<AdministrativeFilter>(allAdministrativeFilter);
  const [form, setForm] = useState<FarmerRecord>(blank);
  const [open, setOpen] = useState(false);

  const saveMutation = useMutation({
    mutationFn: createFarmerRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["farmerRecords"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: createFarmerRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["farmerRecords"] });
    },
  });

  const filtered = useMemo(() => records.filter((item) =>
    [item.id, item.name, item.mobile, item.accountNumber, item.rationCard, areaForRecord(item).district, areaForRecord(item).tehsil, areaForRecord(item).block, areaForRecord(item).gramPanchayat, item.governmentScheme, item.ownerType]
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
      && matchesAdministrativeFilter(item, areaFilter)
      && (loanFilter === "All" || item.loanStatus === loanFilter)
      && (insuranceFilter === "All" || item.insuranceStatus === insuranceFilter),
  ), [records, search, areaFilter, loanFilter, insuranceFilter]);
  const adminOptions = useMemo(() => buildAdministrativeOptions(locations), [locations]);
  const totalAnimals = useMemo(() => records.reduce((sum, item) => sum + item.totalAnimals, 0), [records]);
  const insuredCount = useMemo(() => records.filter((item) => item.insuranceStatus === "Insured").length, [records]);
  const activeLoanCount = useMemo(() => records.filter((item) => item.loanStatus === "Active").length, [records]);

  const locationSummary = (item: FarmerRecord) => {
    const area = areaForRecord(item);
    return [area.gramPanchayat, area.block, area.tehsil].filter(Boolean).join(" / ");
  };

  const save = async () => {
    if (saveMutation.isPending) {
      return;
    }

    if (!form.id || !form.name || !form.mobile || !form.district || !form.tehsil || !form.block || !form.gramPanchayat || !form.village) {
      toast({ title: "Missing farmer details", variant: "destructive" });
      return;
    }

    if (!isValidIndianMobile(form.mobile)) {
      toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    try {
      await saveMutation.mutateAsync(form);
      setOpen(false);
      setForm(blank);
      toast({ title: "Successfully Added", description: "Farmer record has been saved to Sheet." });
    } catch (error) {
      toast({
        title: "Farmer save failed",
        description: error instanceof Error ? error.message : "Apps Script save error",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Farmer Management" description="Farmer registry with Aadhaar masking, livestock count, schemes, insurance, credit and owner type.">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm({ ...blank, id: `FMR-${String(records.length + 1).padStart(3, "0")}` })}><Plus className="mr-2 h-4 w-4" /> Add Farmer</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader><DialogTitle>Register Farmer</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><Label>Farmer ID</Label><Input value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} /></div>
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Mobile</Label><Input inputMode="numeric" maxLength={10} value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: sanitizeIndianMobileInput(e.target.value) }))} /></div>
                <div><Label>Aadhaar</Label><Input value={form.aadhaar} onChange={(e) => setForm((p) => ({ ...p, aadhaar: e.target.value }))} /></div>
                <div><Label>Account Number</Label><Input value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} /></div>
                <div><Label>Ration Card</Label><Input value={form.rationCard} onChange={(e) => setForm((p) => ({ ...p, rationCard: e.target.value }))} /></div>
                <div className="md:col-span-3">
                  <div className="mb-2 text-sm font-medium">Owner Administrative Area</div>
                    <AdminAreaSelect
                      value={areaForRecord(form)}
                      onChange={(area) => setForm((p) => ({ ...p, ...(area as AdministrativeArea) }))}
                      labelPrefix="Owner"
                      allowManualEntry={adminOptions.districts.length === 0}
                      hideVillage
                      districtOptions={adminOptions.districts}
                      tehsilOptions={adminOptions.tehsils}
                      blockOptions={adminOptions.blocks}
                      gramPanchayatOptions={adminOptions.gramPanchayats}
                      villageOptions={adminOptions.villages}
                    />
                </div>
                <div><Label>Total Animals</Label><Input type="number" value={form.totalAnimals} onChange={(e) => setForm((p) => ({ ...p, totalAnimals: Number(e.target.value) }))} /></div>
                <div><Label>Loan Status</Label><Select value={form.loanStatus} onValueChange={(v) => setForm((p) => ({ ...p, loanStatus: v as FarmerRecord["loanStatus"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="No Loan">No Loan</SelectItem><SelectItem value="Applied">Applied</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
                <div><Label>Insurance Status</Label><Select value={form.insuranceStatus} onValueChange={(v) => setForm((p) => ({ ...p, insuranceStatus: v as FarmerRecord["insuranceStatus"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Insured">Insured</SelectItem><SelectItem value="Not Insured">Not Insured</SelectItem><SelectItem value="Claim Filed">Claim Filed</SelectItem></SelectContent></Select></div>
                <div><Label>Owner Type</Label><Select value={form.ownerType} onValueChange={(v) => setForm((p) => ({ ...p, ownerType: v as FarmerRecord["ownerType"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="SHG">SHG</SelectItem><SelectItem value="Dairy Cooperative">Dairy Cooperative</SelectItem><SelectItem value="Institution">Institution</SelectItem></SelectContent></Select></div>
                <div className="md:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
                <div><Label>Government Scheme</Label><Input value={form.governmentScheme} onChange={(e) => setForm((p) => ({ ...p, governmentScheme: e.target.value }))} /></div>
              </div>
              <Button className="mt-4 w-full" onClick={save} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Farmer"}</Button>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Farmers" value={records.length} hint="Registered owners" icon={Users} />
          <StatCard label="Insured" value={insuredCount} hint="Covered livestock owners" icon={ShieldCheck} />
          <StatCard label="Active Loans" value={activeLoanCount} hint="Credit support" icon={Landmark} tone="blue" />
          <StatCard label="Animals" value={totalAnimals} hint="Farmer declared" icon={MapPinned} tone="amber" />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-6 p-4 md:p-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Search Farmers</p>
                <p className="text-xs text-muted-foreground">Search by name, mobile, Aadhaar, account, ration card, scheme, or location.</p>
              </div>
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-11 pl-9" placeholder="Search Farmer Name / Mobile / Aadhaar" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border-border/60 bg-muted/20 shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Location Filters</p>
                    <p className="text-xs text-muted-foreground">Use the live Locations sheet for district hierarchy.</p>
                  </div>
                  <AdminAreaSelect
                    value={areaFilter}
                    onChange={(area) => setAreaFilter(area as AdministrativeFilter)}
                    includeAll
                    hideVillage
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    districtOptions={adminOptions.districts}
                    tehsilOptions={adminOptions.tehsils}
                    blockOptions={adminOptions.blocks}
                    gramPanchayatOptions={adminOptions.gramPanchayats}
                    villageOptions={adminOptions.villages}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-muted/20 shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Additional Filters</p>
                    <p className="text-xs text-muted-foreground">Loan and insurance filters work together with location and search.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-3">
                      <Label className="text-xs font-medium text-muted-foreground">Loan Status</Label>
                      <Select value={loanFilter} onValueChange={setLoanFilter}>
                        <SelectTrigger className="h-11"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="No Loan">No Loan</SelectItem>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-3">
                      <Label className="text-xs font-medium text-muted-foreground">Insurance Status</Label>
                      <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                        <SelectTrigger className="h-11"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Insured">Insured</SelectItem>
                          <SelectItem value="Not Insured">Not Insured</SelectItem>
                          <SelectItem value="Claim Filed">Claim Filed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Animals</TableHead>
                    <TableHead>Insurance Status</TableHead>
                    <TableHead>Loan Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
                      <TableCell>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.id} · {item.ownerType}</div>
                      </TableCell>
                      <TableCell>{item.mobile}</TableCell>
                      <TableCell>
                        <div className="font-medium">{areaForRecord(item).gramPanchayat || "-"}</div>
                        <div className="text-xs text-muted-foreground">{locationSummary(item)}</div>
                      </TableCell>
                      <TableCell>{item.totalAnimals}</TableCell>
                      <TableCell>
                        <Badge variant={item.insuranceStatus === "Insured" ? "secondary" : "outline"} className={item.insuranceStatus === "Insured" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
                          {item.insuranceStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={item.loanStatus} onValueChange={async (v) => {
                          try {
                            await updateMutation.mutateAsync({ ...item, loanStatus: v as FarmerRecord["loanStatus"] });
                            toast({ title: "Loan status updated" });
                          } catch (error) {
                            toast({ title: "Update failed", description: error instanceof Error ? error.message : "Apps Script update error", variant: "destructive" });
                          }
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No Loan">No Loan</SelectItem>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { window.location.href = `tel:${item.mobile.replaceAll(" ", "")}`; }}>
                            <Phone className="mr-1 h-3.5 w-3.5" /> Call
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = buildWhatsAppUrl(item.mobile, `Hello ${item.name}, this is e-Pashu. Please review your livestock record and pending updates.`);
                              if (!url) {
                                toast({ title: "Invalid mobile number", description: "WhatsApp link could not be generated.", variant: "destructive" });
                                return;
                              }
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                          >
                            WhatsApp
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {filtered.map((item) => (
                <Card key={item.id} className="border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-base font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.mobile}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">{item.ownerType}</div>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">{item.gramPanchayat || "-"}</p>
                        <p className="text-xs text-muted-foreground">{locationSummary(item)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Animals</p>
                        <p className="font-medium text-foreground">{item.totalAnimals}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Insurance Status</p>
                        <Badge variant={item.insuranceStatus === "Insured" ? "secondary" : "outline"} className={item.insuranceStatus === "Insured" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
                          {item.insuranceStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Loan Status</p>
                        <Select value={item.loanStatus} onValueChange={async (v) => {
                          try {
                            await updateMutation.mutateAsync({ ...item, loanStatus: v as FarmerRecord["loanStatus"] });
                            toast({ title: "Loan status updated" });
                          } catch (error) {
                            toast({ title: "Update failed", description: error instanceof Error ? error.message : "Apps Script update error", variant: "destructive" });
                          }
                        }}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No Loan">No Loan</SelectItem>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline" onClick={() => { window.location.href = `tel:${item.mobile.replaceAll(" ", "")}`; }}>
                        <Phone className="mr-1 h-3.5 w-3.5" /> Call
                      </Button>
                      <Button
                        className="flex-1"
                        variant="ghost"
                        onClick={() => {
                          const url = buildWhatsAppUrl(item.mobile, `Hello ${item.name}, this is e-Pashu. Please review your livestock record and pending updates.`);
                          if (!url) {
                            toast({ title: "Invalid mobile number", description: "WhatsApp link could not be generated.", variant: "destructive" });
                            return;
                          }
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmersPage;
