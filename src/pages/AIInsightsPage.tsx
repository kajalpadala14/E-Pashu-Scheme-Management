import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Biohazard, Hospital, ShieldAlert, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { createDiseaseTreatmentRecord, listDiseaseTreatmentRecords, listLivestockAnimals } from "@/lib/dataService";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const AIInsightsPage = () => {
  const queryClient = useQueryClient();
  const { data: diseaseRecords = [], error: diseaseError } = useQuery({
    queryKey: ["diseaseTreatmentRecords"],
    queryFn: listDiseaseTreatmentRecords,
    initialData: [],
  });
  const { data: animals = [], error: animalsError } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] });
  const backendAuthError = (diseaseError || animalsError) as unknown as Error | undefined;
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
    date: new Date().toISOString().slice(0, 10),
    diseaseName: "",
    symptoms: "",
    treatment: "",
    doctorName: "",
    medicine: "",
    recoveryStatus: "Under Treatment" as const,
    isolationStatus: "Not Required" as const,
    criticalAlert: false,
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: createDiseaseTreatmentRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["diseaseTreatmentRecords"] });
    },
  });

  const saveRecord = async () => {
    if (!form.animalId || !form.diseaseName) {
      toast({ title: "Missing details", description: "Animal and disease name are required.", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync(form);
      setOpen(false);
      toast({ title: "Successfully Added", description: "Disease/treatment record has been saved." });
    } catch (error) {
      toast({ title: "Disease save failed", description: error instanceof Error ? error.message : "Apps Script save error", variant: "destructive" });
    }
  };

  const critical = diseaseRecords.filter((item) => item.criticalAlert).length;
  const isolated = diseaseRecords.filter((item) => item.isolationStatus === "Isolated").length;
  const recovered = diseaseRecords.filter((item) => item.recoveryStatus === "Recovered").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Disease & Treatment Module" description="Clinical case register with symptoms, prescribed treatment, medicines, doctor attribution, isolation status and critical alerts.">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Disease Case</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader><DialogTitle>New Disease / Treatment Record</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Animal ID</Label>
                  <Input
                    value={form.animalId}
                    onChange={(e) => setForm((prev) => ({ ...prev, animalId: e.target.value.trim() }))}
                    placeholder="Type animal ID"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">Type the animal ID and save the disease case directly.</div>
                </div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} /></div>
                <div><Label>Disease Name</Label><Input value={form.diseaseName} onChange={(e) => setForm((prev) => ({ ...prev, diseaseName: e.target.value }))} /></div>
                <div><Label>Doctor</Label><Input value={form.doctorName} onChange={(e) => setForm((prev) => ({ ...prev, doctorName: e.target.value }))} /></div>
                <div><Label>Medicine</Label><Input value={form.medicine} onChange={(e) => setForm((prev) => ({ ...prev, medicine: e.target.value }))} /></div>
                <div>
                  <Label>Recovery</Label>
                  <Select value={form.recoveryStatus} onValueChange={(value) => setForm((prev) => ({ ...prev, recoveryStatus: value as typeof form.recoveryStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under Treatment">Under Treatment</SelectItem>
                      <SelectItem value="Recovered">Recovered</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Isolation</Label>
                  <Select value={form.isolationStatus} onValueChange={(value) => setForm((prev) => ({ ...prev, isolationStatus: value as typeof form.isolationStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Required">Not Required</SelectItem>
                      <SelectItem value="Isolated">Isolated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Label>Symptoms</Label><Input value={form.symptoms} onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))} /></div>
                <div className="md:col-span-2"><Label>Treatment</Label><Input value={form.treatment} onChange={(e) => setForm((prev) => ({ ...prev, treatment: e.target.value }))} /></div>
                <div className="md:col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} /></div>
              </div>
              <Button className="mt-4 w-full" onClick={saveRecord} disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Disease Record"}</Button>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Treatment Cases" value={diseaseRecords.length} hint="Open and historical" icon={Stethoscope} />
          <StatCard label="Critical Alerts" value={critical} hint="Escalated cases" icon={AlertTriangle} tone="red" />
          <StatCard label="Isolated" value={isolated} hint="Biosecurity active" icon={Biohazard} tone="amber" />
          <StatCard label="Recovered" value={recovered} hint="Closed cases" icon={Hospital} />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Disease Name</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Recovery</TableHead>
                    <TableHead>Isolation</TableHead>
                    <TableHead>Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diseaseRecords.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.animalId}<div className="text-xs text-muted-foreground">{item.date}</div></TableCell>
                      <TableCell>{item.diseaseName}</TableCell>
                      <TableCell className="min-w-56">{item.symptoms}</TableCell>
                      <TableCell className="min-w-56">{item.treatment}</TableCell>
                      <TableCell>{item.doctorName}</TableCell>
                      <TableCell>{item.medicine}</TableCell>
                      <TableCell><Badge variant={item.recoveryStatus === "Critical" ? "destructive" : "secondary"}>{item.recoveryStatus}</Badge></TableCell>
                      <TableCell>{item.isolationStatus}</TableCell>
                      <TableCell>{item.criticalAlert ? <ShieldAlert className="h-4 w-4 text-destructive" /> : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {!diseaseRecords.length && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                        No disease/treatment records found in HealthRecords sheet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIInsightsPage;
