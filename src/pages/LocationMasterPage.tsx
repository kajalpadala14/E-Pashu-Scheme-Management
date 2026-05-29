import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPinned, Plus, Search, Trash2, PencilLine, Layers3 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import type { LocationRecord } from "@/lib/types";
import { createLocation, deleteLocation, listLocations, updateLocation } from "@/lib/dataService";

const blankLocation: LocationRecord = {
  id: "",
  district: "",
  tehsil: "",
  block: "",
  gramPanchayat: "",
  village: "",
  status: "Active",
};

const LocationMasterPage = () => {
  const queryClient = useQueryClient();
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, initialData: [] as LocationRecord[] });
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LocationRecord>(blankLocation);

  const saveMutation = useMutation({
    mutationFn: async (input: LocationRecord) => {
      if (input.id) {
        return updateLocation(input);
      }
      const { id: _id, ...payload } = input;
      return createLocation(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (input: LocationRecord) => deleteLocation(input.id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const districts = useMemo(() => Array.from(new Set(locations.map((item) => item.district).filter(Boolean))).sort(), [locations]);
  const statuses = useMemo(() => Array.from(new Set(locations.map((item) => item.status || "Active"))).sort(), [locations]);

  const filtered = useMemo(() => locations.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = [item.district, item.tehsil, item.block, item.gramPanchayat, item.village, item.status]
      .some((value) => value.toLowerCase().includes(query));
    const matchesDistrict = districtFilter === "All" || item.district === districtFilter;
    const matchesStatus = statusFilter === "All" || (item.status || "Active") === statusFilter;
    return matchesSearch && matchesDistrict && matchesStatus;
  }), [locations, search, districtFilter, statusFilter]);

  const stats = {
    districts: districts.length,
    blocks: new Set(locations.map((item) => `${item.district}|${item.tehsil}|${item.block}`)).size,
    panchayats: new Set(locations.map((item) => `${item.district}|${item.tehsil}|${item.block}|${item.gramPanchayat}`)).size,
    villages: locations.length,
  };

  const resetForm = () => setForm(blankLocation);

  const handleEdit = (item: LocationRecord) => {
    setForm(item);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.district || !form.tehsil || !form.block || !form.gramPanchayat || !form.village) {
      toast({ title: "Missing location details", description: "District, tehsil, block, panchayat and village are required.", variant: "destructive" });
      return;
    }

    try {
      await saveMutation.mutateAsync(form);
      toast({ title: form.id ? "Location updated" : "Location added", description: `${form.village} saved in the central master.` });
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Location save failed",
        description: error instanceof Error ? error.message : "Apps Script save error",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: LocationRecord) => {
    try {
      await deleteMutation.mutateAsync(item);
      toast({ title: "Location deleted", description: `${item.village} removed from the master.` });
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
        <PageHeader title="Location Master" description="Central sheet-backed source for district, tehsil, block, Gram Panchayat and village dropdowns across the app.">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(blankLocation)}>
                <Plus className="mr-2 h-4 w-4" /> Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit Location" : "Add Location"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>District</Label>
                  <Input value={form.district} onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))} placeholder="District" />
                </div>
                <div>
                  <Label>Tehsil</Label>
                  <Input value={form.tehsil} onChange={(event) => setForm((prev) => ({ ...prev, tehsil: event.target.value }))} placeholder="Tehsil" />
                </div>
                <div>
                  <Label>Block</Label>
                  <Input value={form.block} onChange={(event) => setForm((prev) => ({ ...prev, block: event.target.value }))} placeholder="Block" />
                </div>
                <div>
                  <Label>Gram Panchayat</Label>
                  <Input value={form.gramPanchayat} onChange={(event) => setForm((prev) => ({ ...prev, gramPanchayat: event.target.value }))} placeholder="Gram Panchayat" />
                </div>
                <div className="md:col-span-2">
                  <Label>Village</Label>
                  <Input value={form.village} onChange={(event) => setForm((prev) => ({ ...prev, village: event.target.value }))} placeholder="Village" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status || "Active"} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Location"}
              </Button>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Districts" value={stats.districts} hint="Central master coverage" icon={MapPinned} />
          <StatCard label="Blocks" value={stats.blocks} hint="Sub-district units" icon={Layers3} tone="blue" />
          <StatCard label="Panchayats" value={stats.panchayats} hint="Village clusters" icon={MapPinned} tone="amber" />
          <StatCard label="Villages" value={stats.villages} hint="Dropdown rows" icon={Layers3} tone="green" />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search district, block, panchayat or village..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-full lg:w-56">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Districts</SelectItem>
                  {districts.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>District</TableHead>
                    <TableHead>Tehsil</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Gram Panchayat</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.district}</TableCell>
                      <TableCell>{item.tehsil}</TableCell>
                      <TableCell>{item.block}</TableCell>
                      <TableCell>{item.gramPanchayat}</TableCell>
                      <TableCell>{item.village}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status || "Active"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} disabled={deleteMutation.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 grid gap-3 md:hidden">
              {filtered.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{item.village}</div>
                        <div className="text-sm text-muted-foreground">{item.gramPanchayat} · {item.block}</div>
                      </div>
                      <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status || "Active"}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-muted-foreground">District</p><p className="font-medium">{item.district}</p></div>
                      <div><p className="text-muted-foreground">Tehsil</p><p className="font-medium">{item.tehsil}</p></div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item)} disabled={deleteMutation.isPending}>Delete</Button>
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

export default LocationMasterPage;
