import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, IdCard, Plus, Search, Trash2 } from "lucide-react";
import type { LivestockAnimal } from "@/lib/types";
type Species = "Cattle" | "Buffalo" | "Sheep" | "Goat" | "Pig" | "Hen" | "Duck";
type AnimalStatus = "Healthy" | "Critical" | "Treatment" | "Dead" | "Sold";
import { toast } from "@/components/ui/use-toast";
import { AdminAreaSelect } from "@/components/AdminAreaSelect";
import { allAdministrativeFilter, areaForRecord, buildAdministrativeOptions, defaultAdministrativeArea, matchesAdministrativeFilter, type AdministrativeArea, type AdministrativeFilter } from "@/lib/adminHierarchy";
import { createLivestockAnimal, deleteLivestockAnimal, listLivestockAnimals, listLocations } from "@/lib/dataService";
import type { LocationRecord } from "@/lib/types";

const species: Species[] = ["Cattle", "Buffalo", "Sheep", "Goat", "Pig", "Hen", "Duck"];
const statuses: AnimalStatus[] = ["Healthy", "Critical", "Treatment", "Dead", "Sold"];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const emptyAnimal: LivestockAnimal = {
  id: "",
  earTag: "",
  qrCode: "",
  taggingDate: "",
  dataEntryDate: new Date().toISOString().slice(0, 10),
  sireId: "",
  damId: "",
  species: "Cattle",
  breed: "",
  gender: "Female",
  dob: "",
  age: 0,
  ageMonths: 0,
  color: "",
  weight: 0,
  milkingStatus: "Milking",
  pregnancyStatus: "Open",
  calvings: 0,
  vaccinationStatus: "Pending",
  diseaseStatus: "None",
  treatmentHistory: "",
  photo: "",
  ownerName: "",
  district: defaultAdministrativeArea.district,
  tehsil: defaultAdministrativeArea.tehsil,
  block: defaultAdministrativeArea.block,
  gramPanchayat: defaultAdministrativeArea.gramPanchayat,
  village: "",
  status: "Healthy",
  notes: "",
  productionData: "",
};

const AnimalsPage = () => {
  const queryClient = useQueryClient();
  const { data: records = [] } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] as LivestockAnimal[] });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, initialData: [] as LocationRecord[] });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState<AdministrativeFilter>(allAdministrativeFilter);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LivestockAnimal>(emptyAnimal);
  const navigate = useNavigate();

  const saveMutation = useMutation({
    mutationFn: createLivestockAnimal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["livestockAnimals"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: createLivestockAnimal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["livestockAnimals"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLivestockAnimal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["livestockAnimals"] });
    },
  });

  const filtered = useMemo(() => records.filter((item) => {
    const query = search.toLowerCase();
    const area = areaForRecord(item);
    const matchSearch = [item.id, item.earTag, item.ownerName, area.district, area.tehsil, area.block, area.gramPanchayat, item.species, item.breed]
      .some((value) => value.toLowerCase().includes(query));
    const matchFilter = filter === "all" || item.status === filter || item.species === filter;
    return matchSearch && matchFilter && matchesAdministrativeFilter(item, areaFilter);
  }), [records, search, filter, areaFilter]);
  const adminOptions = useMemo(() => buildAdministrativeOptions(locations), [locations]);

  const formatAge = (item: LivestockAnimal) => {
    const months = Number(item.ageMonths ?? (item.age !== undefined ? item.age * 12 : 0)) || 0;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return `${years} years - ${rem} months`;
  };

  const saveAnimal = async () => {
    if (saveMutation.isPending) {
      return;
    }

    if (!form.id || !form.breed || !form.ownerName || !form.district || !form.tehsil || !form.block || !form.gramPanchayat || !form.village) {
      toast({ title: "Missing details", description: "Animal ID, breed, owner and administrative location are required.", variant: "destructive" });
      return;
    }

    if (form.taggingDate && !dateRegex.test(form.taggingDate)) {
      toast({ title: "Invalid tagging date", description: "Use valid date format for Tagging Date.", variant: "destructive" });
      return;
    }

    if (form.dataEntryDate && !dateRegex.test(form.dataEntryDate)) {
      toast({ title: "Invalid data entry date", description: "Use valid date format for Data Entry Date.", variant: "destructive" });
      return;
    }

    if (form.ageMonths !== undefined && Number(form.ageMonths) < 0) {
      toast({ title: "Invalid age in months", description: "Age in months cannot be negative.", variant: "destructive" });
      return;
    }

    if (form.sireId && form.sireId.trim().length < 2) {
      toast({ title: "Invalid Sire ID", description: "Sire ID must be at least 2 characters.", variant: "destructive" });
      return;
    }

    if (form.damId && form.damId.trim().length < 2) {
      toast({ title: "Invalid Dam ID", description: "Dam ID must be at least 2 characters.", variant: "destructive" });
      return;
    }

    const payload = { ...form, qrCode: form.qrCode || `TAG-${form.earTag || form.id}` };
    try {
      await saveMutation.mutateAsync(payload);
      setOpen(false);
      setForm(emptyAnimal);
      toast({ title: "Successfully Added", description: "Animal record has been saved to Sheet." });
    } catch (error) {
      toast({
        title: "Animal save failed",
        description: error instanceof Error ? error.message : "Apps Script save error",
        variant: "destructive",
      });
    }
  };

  const editAnimal = (animal: LivestockAnimal) => {
    setForm(animal);
    setOpen(true);
  };

  const deleteAnimal = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Animal deleted", description: `${id} removed from the register.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Apps Script delete error",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Animal Management" description="Full livestock CRUD registry with Tag ID, owner, health, breeding, production and treatment data.">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm({ ...emptyAnimal, id: `ANM-${String(records.length + 1).padStart(3, "0")}` })}>
                <Plus className="mr-2 h-4 w-4" /> Register Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader><DialogTitle>Animal Registration / Edit</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><Label>Animal ID</Label><Input value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} /></div>
                <div><Label>Ear Tag Number</Label><Input value={form.earTag} onChange={(e) => setForm((p) => ({ ...p, earTag: e.target.value }))} /></div>
                <div><Label>Tag Reference</Label><Input value={form.qrCode} onChange={(e) => setForm((p) => ({ ...p, qrCode: e.target.value }))} /></div>
                <div><Label>Tagging Date</Label><Input type="date" value={form.taggingDate || ""} onChange={(e) => setForm((p) => ({ ...p, taggingDate: e.target.value }))} /></div>
                <div><Label>Data Entry Date</Label><Input type="date" value={form.dataEntryDate || ""} onChange={(e) => setForm((p) => ({ ...p, dataEntryDate: e.target.value }))} /></div>
                <div><Label>Sire ID</Label><Input value={form.sireId || ""} onChange={(e) => setForm((p) => ({ ...p, sireId: e.target.value }))} /></div>
                <div><Label>Dam ID</Label><Input value={form.damId || ""} onChange={(e) => setForm((p) => ({ ...p, damId: e.target.value }))} /></div>
                <div><Label>Species</Label><Select value={form.species} onValueChange={(v) => setForm((p) => ({ ...p, species: v as Species }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{species.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Breed</Label><Input value={form.breed} onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))} /></div>
                <div><Label>Gender</Label><Select value={form.gender} onValueChange={(v) => setForm((p) => ({ ...p, gender: v as LivestockAnimal["gender"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem></SelectContent></Select></div>
                <div><Label>DOB</Label><Input type="date" value={form.dob} onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))} /></div>
                <div><Label>Age (Years)</Label><Input type="number" min={0} value={form.age || ""} onChange={(e) => {
                  const years = Number(e.target.value || 0);
                  setForm((p) => ({ ...p, age: years, ageMonths: years * 12 }));
                }} /></div>
                <div><Label>Age (Total Months)</Label><Input type="number" min={0} value={form.ageMonths || ""} onChange={(e) => {
                  const months = Number(e.target.value || 0);
                  setForm((p) => ({ ...p, ageMonths: months, age: Math.floor(months / 12) }));
                }} /></div>
                <div><Label>Weight KG</Label><Input type="number" value={form.weight || ""} onChange={(e) => setForm((p) => ({ ...p, weight: Number(e.target.value) }))} /></div>
                <div><Label>Color</Label><Input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} /></div>
                <div><Label>Owner Name</Label><Input value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} /></div>
                <div className="md:col-span-3">
                  <div className="mb-2 text-sm font-medium">Animal Location Mapping</div>
                  <AdminAreaSelect
                    value={areaForRecord(form)}
                    onChange={(area) => setForm((p) => ({ ...p, ...(area as AdministrativeArea) }))}
                    allowManualEntry={adminOptions.districts.length === 0}
                    hideVillage
                    districtOptions={adminOptions.districts}
                    tehsilOptions={adminOptions.tehsils}
                    blockOptions={adminOptions.blocks}
                    gramPanchayatOptions={adminOptions.gramPanchayats}
                    villageOptions={adminOptions.villages}
                  />
                </div>
                <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as AnimalStatus }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Milking Status</Label><Select value={form.milkingStatus} onValueChange={(v) => setForm((p) => ({ ...p, milkingStatus: v as LivestockAnimal["milkingStatus"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Milking">Milking</SelectItem><SelectItem value="Dry">Dry</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select></div>
                <div><Label>Pregnancy Status</Label><Select value={form.pregnancyStatus} onValueChange={(v) => setForm((p) => ({ ...p, pregnancyStatus: v as LivestockAnimal["pregnancyStatus"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pregnant">Pregnant</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="Due Soon">Due Soon</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select></div>
                <div><Label>No. of Calvings</Label><Input type="number" value={form.calvings} onChange={(e) => setForm((p) => ({ ...p, calvings: Number(e.target.value) }))} /></div>
                <div><Label>Vaccination Status</Label><Select value={form.vaccinationStatus} onValueChange={(v) => setForm((p) => ({ ...p, vaccinationStatus: v as LivestockAnimal["vaccinationStatus"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Done">Done</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent></Select></div>
                <div><Label>Disease Status</Label><Select value={form.diseaseStatus} onValueChange={(v) => setForm((p) => ({ ...p, diseaseStatus: v as LivestockAnimal["diseaseStatus"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="Suspected">Suspected</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Recovered">Recovered</SelectItem></SelectContent></Select></div>
                <div className="md:col-span-3"><Label>Animal Photo URL</Label><Input value={form.photo} onChange={(e) => setForm((p) => ({ ...p, photo: e.target.value }))} /></div>
                <div className="md:col-span-3"><Label>Treatment History</Label><Textarea value={form.treatmentHistory} onChange={(e) => setForm((p) => ({ ...p, treatmentHistory: e.target.value }))} /></div>
                <div className="md:col-span-3"><Label>Production Data</Label><Input value={form.productionData} onChange={(e) => setForm((p) => ({ ...p, productionData: e.target.value }))} /></div>
                <div className="md:col-span-3"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
              </div>
              <Button onClick={saveAnimal} className="mt-4 w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Animal Record"}</Button>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Registered" value={records.length} hint="Animals in system" icon={IdCard} />
          <StatCard label="Critical" value={records.filter((a) => a.status === "Critical").length} hint="Veterinary attention" icon={Trash2} tone="red" />
          <StatCard label="Pregnant" value={records.filter((a) => a.pregnancyStatus === "Pregnant" || a.pregnancyStatus === "Due Soon").length} hint="Breeding watch" icon={Eye} tone="amber" />
          <StatCard label="Villages" value={new Set(records.map((a) => a.village)).size} hint="Coverage area" icon={Search} tone="blue" />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by ID, tag, owner, block, panchayat..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full lg:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  {species.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4 rounded-md border bg-muted/20 p-3">
              <AdminAreaSelect
                value={areaFilter}
                onChange={(area) => setAreaFilter(area as AdministrativeFilter)}
                includeAll
                hideVillage
                districtOptions={adminOptions.districts}
                tehsilOptions={adminOptions.tehsils}
                blockOptions={adminOptions.blocks}
                gramPanchayatOptions={adminOptions.gramPanchayats}
                villageOptions={adminOptions.villages}
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Species / Breed</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Administrative Area</TableHead>
                    <TableHead>Vaccination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.id}</div>
                        <div className="text-xs text-muted-foreground">Tag ID: {item.earTag}</div>
                      </TableCell>
                      <TableCell>{formatAge(item)}</TableCell>
                      <TableCell>{item.species}<div className="text-xs text-muted-foreground">{item.breed}, {item.gender}</div></TableCell>
                      <TableCell>{item.ownerName}</TableCell>
                      <TableCell>
                        <div>{areaForRecord(item).gramPanchayat}</div>
                        <div className="text-xs text-muted-foreground">{areaForRecord(item).district} / {areaForRecord(item).tehsil} / {areaForRecord(item).block}</div>
                      </TableCell>
                      <TableCell>
                        <Select value={["Done","Pending","Overdue"].includes(item.vaccinationStatus) ? item.vaccinationStatus : ""} onValueChange={async (v) => {
                          try {
                            await updateMutation.mutateAsync({ ...item, vaccinationStatus: v as any });
                            toast({ title: "Vaccination status updated" });
                          } catch (error) {
                            toast({ title: "Update failed", description: error instanceof Error ? error.message : "Apps Script update error", variant: "destructive" });
                          }
                        }}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        {!["Done","Pending","Overdue"].includes(item.vaccinationStatus) && item.vaccinationStatus && (
                          <div className="text-xs text-muted-foreground mt-1">{item.vaccinationStatus}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={statuses.includes(item.status) ? item.status : ""} onValueChange={async (v) => {
                          try {
                            await updateMutation.mutateAsync({ ...item, status: v as AnimalStatus });
                            toast({ title: "Status updated" });
                          } catch (error) {
                            toast({ title: "Update failed", description: error instanceof Error ? error.message : "Apps Script update error", variant: "destructive" });
                          }
                        }}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {!statuses.includes(item.status) && item.status && (
                          <div className="text-xs text-muted-foreground mt-1">{item.status}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/animals/${item.id}`)} title="View full profile"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => editAnimal(item)} title="Edit"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteAnimal(item.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Tip: use <Link className="font-medium text-primary" to="/reports">Reports</Link> for PDF, Excel-ready CSV and village-wise analytics exports.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnimalsPage;
