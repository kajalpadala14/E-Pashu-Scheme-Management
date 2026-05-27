import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Baby, CalendarDays, Dna, ShieldCheck } from "lucide-react";
import { createPregnancyRecord, listLivestockAnimals, listPregnancyRecords } from "@/lib/dataService";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const BreedingPage = () => {
  const queryClient = useQueryClient();
  const { data: pregnancyRecords = [], error: pregnancyError } = useQuery({ queryKey: ["pregnancyRecords"], queryFn: listPregnancyRecords, initialData: [] });
  const { data: animals = [], error: animalsError } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] });
  const backendAuthError = (pregnancyError || animalsError) as unknown as Error | undefined;
  const location = useLocation();

  if (backendAuthError && String(backendAuthError.message).toLowerCase().includes("login session")) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Login Required</h3>
              <p className="mb-4 text-sm text-muted-foreground">The backend requires you to sign in before loading animals and saving records.</p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => {
                    try {
                      window.localStorage.removeItem("e-pashu-session-user");
                    } catch {}
                    window.location.href = window.location.origin + window.location.pathname + "#/login";
                  }}
                >
                  Go to Login
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animalId: "",
    village: "",
    inseminationDate: new Date().toISOString().slice(0, 10),
    expectedCalving: new Date().toISOString().slice(0, 10),
    status: "Inseminated" as const,
    lastCheckDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: createPregnancyRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pregnancyRecords"] });
    },
  });

  const saveRecord = async () => {
    if (!form.animalId) {
      toast({ title: "Missing details", description: "Animal ID is required.", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync(form);
      setOpen(false);
      toast({ title: "Successfully Added", description: "Pregnancy record has been saved." });
    } catch (error) {
      toast({ title: "Pregnancy save failed", description: error instanceof Error ? error.message : "Apps Script save error", variant: "destructive" });
    }
  };

  const pregnant = pregnancyRecords.filter((item) => item.status === "Pregnant").length;
  const dueSoon = pregnancyRecords.filter((item) => item.status === "Due Soon").length;
  const calves = pregnancyRecords.filter((item) => item.status === "Delivered").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Pregnancy & Breeding Module" description="Insemination date, pregnancy tracking, expected calving, check history and status updates." >
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Pregnancy Record</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader><DialogTitle>New Pregnancy Record</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Animal ID</Label>
                  <Input
                    value={form.animalId}
                    onChange={(e) => setForm((prev) => ({ ...prev, animalId: e.target.value.trim() }))}
                    placeholder="Type animal ID"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">Type the animal ID and it will save directly to the sheet.</div>
                </div>
                <div><Label>Village</Label><Input value={form.village} onChange={(e) => setForm((prev) => ({ ...prev, village: e.target.value }))} /></div>
                <div><Label>Insemination Date</Label><Input type="date" value={form.inseminationDate} onChange={(e) => setForm((prev) => ({ ...prev, inseminationDate: e.target.value }))} /></div>
                <div><Label>Expected Calving</Label><Input type="date" value={form.expectedCalving} onChange={(e) => setForm((prev) => ({ ...prev, expectedCalving: e.target.value }))} /></div>
                <div><Label>Last Check Date</Label><Input type="date" value={form.lastCheckDate} onChange={(e) => setForm((prev) => ({ ...prev, lastCheckDate: e.target.value }))} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as typeof form.status }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inseminated">Inseminated</SelectItem>
                      <SelectItem value="Pregnant">Pregnant</SelectItem>
                      <SelectItem value="Due Soon">Due Soon</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} /></div>
              </div>
              <Button className="mt-4 w-full" onClick={saveRecord} disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Pregnancy"}</Button>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Breeding Records" value={pregnancyRecords.length} hint="Tracked pregnancies" icon={Dna} />
          <StatCard label="Pregnant" value={pregnant} hint="Confirmed cases" icon={ShieldCheck} />
          <StatCard label="Due Soon" value={dueSoon} hint="Delivery watch" icon={CalendarDays} tone="amber" />
          <StatCard label="Expected Calves" value={calves} hint="Projected births" icon={Baby} tone="blue" />
        </div>

        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Insemination Date</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead>Expected Calving</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pregnancyRecords.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.animalId}</TableCell>
                    <TableCell>{item.inseminationDate}</TableCell>
                      <TableCell>{item.lastCheckDate}</TableCell>
                      <TableCell>{item.expectedCalving}</TableCell>
                      <TableCell>{item.village}</TableCell>
                      <TableCell>{item.notes}</TableCell>
                    <TableCell><Badge variant={item.status === "Due Soon" ? "destructive" : "secondary"}>{item.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BreedingPage;
