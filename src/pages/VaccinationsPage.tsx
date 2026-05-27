import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, FileDown, MessageSquare, ShieldCheck, Syringe, Timer, TriangleAlert } from "lucide-react";
import type { VaccinationRecord } from "@/lib/types";
import type { ReminderItem } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { createLivestockAnimal, createReminder, createVaccinationRecord, listLivestockAnimals, listReminders, listVaccinationRecords, sendReminder, updateVaccinationRecordStatus } from "@/lib/dataService";
import { formatDisplayDate } from "@/lib/date";
import { buildWhatsAppShareUrl } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type AnimalOption = {
  id: string;
  earTag: string;
  ownerName: string;
  village: string;
};

function AnimalSearchSelect({
  animals,
  value,
  onChange,
}: {
  animals: AnimalOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedAnimal = animals.find((animal) => animal.id === value || animal.earTag === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <span className="truncate">
            {selectedAnimal
              ? `${selectedAnimal.id}${selectedAnimal.earTag ? ` — ${selectedAnimal.earTag}` : ""}`
              : value || "Search animal ID or tag"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search animal ID, tag, owner or village" />
          <CommandList>
            <CommandEmpty>No animal found.</CommandEmpty>
            <CommandGroup>
              {animals.map((animal) => {
                const label = `${animal.id}${animal.earTag ? ` — ${animal.earTag}` : ""}`;
                const selected = animal.id === value || animal.earTag === value;
                return (
                  <CommandItem
                    key={animal.id}
                    value={`${animal.id} ${animal.earTag} ${animal.ownerName} ${animal.village}`}
                    onSelect={() => {
                      onChange(animal.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span>{label}</span>
                      <span className="text-xs text-muted-foreground">
                        {animal.ownerName || "—"} {animal.village ? `· ${animal.village}` : ""}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const VaccinationsPage = () => {
  const queryClient = useQueryClient();
  const { data: records = [], error: recordsError } = useQuery({ queryKey: ["vaccinationRecords"], queryFn: listVaccinationRecords, initialData: [] as VaccinationRecord[] });
  const { data: animals = [], error: animalsError } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] });
  const { data: reminders = [] } = useQuery({ queryKey: ["reminders"], queryFn: listReminders, initialData: [] as ReminderItem[] });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<VaccinationRecord, "id">>({
    animalId: "",
    vaccineName: "",
    batchNumber: "",
    dueDate: new Date().toISOString().slice(0, 10),
    nextReminder: new Date().toISOString().slice(0, 10),
    vaccinatedBy: "",
    status: "Pending",
    smsReminder: true,
  });
  const updateMutation = useMutation({
    mutationFn: ({ animalId, vaccineName, status }: { animalId: string; vaccineName: string; status: VaccinationRecord["status"] }) =>
      updateVaccinationRecordStatus(animalId, vaccineName, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
    },
  });
  const createMutation = useMutation({
    mutationFn: createVaccinationRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
    },
  });
  const reminderMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
  const sendReminderMutation = useMutation({
    mutationFn: sendReminder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
  const pending = records.filter((item) => item.status === "Pending").length;
  const done = records.filter((item) => item.status === "Done").length;
  const overdue = records.filter((item) => item.status === "Overdue").length;

  const updateStatus = async (item: VaccinationRecord, status: VaccinationRecord["status"]) => {
    try {
      await updateMutation.mutateAsync({ animalId: item.animalId, vaccineName: item.vaccineName, status });
      toast({ title: "Vaccination status updated" });
    } catch (error) {
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Apps Script update error",
        variant: "destructive",
      });
    }
  };

  const saveRecord = async () => {
    if (!form.animalId || !form.vaccineName) {
      toast({ title: "Missing vaccination details", description: "Animal ID and vaccine name are required.", variant: "destructive" });
      return;
    }

    try {
      const normalizedAnimalId = form.animalId.trim();
      const existingAnimal = animals.find((animal: any) => animal.id === normalizedAnimalId || animal.earTag === normalizedAnimalId || animal.tagId === normalizedAnimalId);
      const resolvedAnimalId = existingAnimal?.id || normalizedAnimalId;

      if (!existingAnimal) {
        await createLivestockAnimal({
          id: resolvedAnimalId,
          earTag: resolvedAnimalId,
          qrCode: "",
          taggingDate: "",
          dataEntryDate: new Date().toISOString().slice(0, 10),
          sireId: "",
          damId: "",
          species: "Cattle",
          breed: "Unknown",
          gender: "Female",
          dob: "",
          age: 0,
          ageMonths: 0,
          color: "",
          weight: 0,
          milkingStatus: "Not Applicable",
          pregnancyStatus: "Not Applicable",
          calvings: 0,
          vaccinationStatus: "Pending",
          diseaseStatus: "None",
          treatmentHistory: "",
          photo: "",
          ownerName: "",
          village: "Unknown",
          status: "Healthy",
          notes: "Auto-created from vaccination entry",
          productionData: "",
        });
        await queryClient.invalidateQueries({ queryKey: ["livestockAnimals"] });
        toast({ title: "Animal created", description: `${resolvedAnimalId} was not found, so a new animal record was added.` });
      }

      await createMutation.mutateAsync({ ...form, animalId: resolvedAnimalId });
      setForm({
        animalId: "",
        vaccineName: "",
        batchNumber: "",
        dueDate: new Date().toISOString().slice(0, 10),
        nextReminder: new Date().toISOString().slice(0, 10),
        vaccinatedBy: "",
        status: "Pending",
        smsReminder: true,
      });
      setOpen(false);
      toast({ title: "Successfully Added", description: "Vaccination record has been saved." });
    } catch (error) {
      toast({ title: "Vaccination save failed", description: error instanceof Error ? error.message : "Apps Script save error", variant: "destructive" });
    }
  };

  // If backend requires login, surface a friendly prompt to clear session and go to login
  const backendAuthError = (animalsError || recordsError) as unknown as Error | undefined;
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

  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const prefAnimal = params.get("animalId") || params.get("tag") || "";
      const autoOpen = params.get("open") === "1" || location.hash === "#add";
      if (prefAnimal) {
        setForm((prev) => ({ ...prev, animalId: prefAnimal }));
      }
      if (autoOpen && prefAnimal) {
        setOpen(true);
      }
    } catch (e) {
      // ignore
    }
  }, [location.search, location.hash]);

  // When animal is selected/prefilled, auto-fill some fields from the animal record
  useEffect(() => {
    if (!form.animalId) return;
    const selected = animals.find((a: any) => a.id === form.animalId || a.earTag === form.animalId || a.tagId === form.animalId);
    if (selected) {
      // keep existing vaccineName if user already entered one
      setForm((prev) => ({
        ...prev,
        animalId: selected.id,
      }));
    }

    // Prefill with last vaccination for this animal if available
    const history = records.filter((r) => r.animalId === form.animalId).slice().sort((a, b) => (a.dueDate || "") > (b.dueDate || "") ? -1 : 1);
    if (history.length) {
      const last = history[0];
      setForm((prev) => ({
        ...prev,
        vaccineName: prev.vaccineName || last.vaccineName || prev.vaccineName,
        nextReminder: prev.nextReminder || last.nextReminder || prev.nextReminder,
        batchNumber: prev.batchNumber || last.batchNumber || prev.batchNumber,
      }));
    }
  }, [form.animalId, animals, records]);

  const sendWhatsAppReminders = () => {
    const overdueCount = pending + overdue;
    if (!overdueCount) {
      toast({ title: "No reminders", description: "There are no pending or overdue vaccination reminders." });
      return;
    }

    const previewMessage = `e-Pashu vaccination reminder: ${overdueCount} records are pending or overdue. Please update the vaccination status.`;
    const url = buildWhatsAppShareUrl(previewMessage);
    // This opens the WhatsApp share composer. For direct recipient delivery, wire a WhatsApp gateway/provider.
    window.open(url, "_blank", "noopener,noreferrer");
    toast({ title: "WhatsApp composer opened", description: "Use the generated reminder text for the recipient list." });
  };

  const syncSmsQueue = async () => {
    const pendingSmsRecords = records.filter((item) => item.smsReminder && item.status !== "Done");
    if (!pendingSmsRecords.length) {
      toast({ title: "No SMS reminders", description: "No pending vaccination reminders are marked for SMS." });
      return;
    }

    const existingKeys = new Set(reminders.map((item) => `${item.recipient}|${item.message}`));
    let createdCount = 0;

    for (const record of pendingSmsRecords) {
      const animal = animals.find((item) => item.id === record.animalId);
      const recipient = animal?.ownerName || animal?.earTag || record.animalId;
      const village = animal?.village || "Unknown";
      const message = `Vaccination due: ${record.vaccineName} for ${animal?.earTag || record.animalId}. Please update status.`;
      const key = `${recipient}|${message}`;

      if (existingKeys.has(key)) {
        continue;
      }

      await reminderMutation.mutateAsync({ village, recipient, channel: "SMS", message, dueDate: record.nextReminder || record.dueDate });
      existingKeys.add(key);
      createdCount += 1;
    }

    toast({ title: "SMS queue synced", description: `${createdCount} reminder${createdCount === 1 ? "" : "s"} added to the queue.` });
  };

  const sendQueuedReminder = async (item: ReminderItem) => {
    try {
      await sendReminderMutation.mutateAsync(item.id);
      toast({ title: "Reminder sent", description: `${item.recipient} marked as sent.` });
    } catch (error) {
      toast({ title: "Reminder send failed", description: error instanceof Error ? error.message : "Apps Script send error", variant: "destructive" });
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("e-Pashu Vaccination Register", 14, 14);
    autoTable(doc, {
      startY: 22,
      head: [["Animal", "Vaccine", "Batch", "Due Date", "Next Reminder", "Vaccinated By", "Status", "SMS"]],
      body: records.map((item) => [item.animalId, item.vaccineName, item.batchNumber, formatDisplayDate(item.dueDate), formatDisplayDate(item.nextReminder), item.vaccinatedBy, item.status, item.smsReminder ? "Yes" : "No"]),
      headStyles: { fillColor: [21, 128, 61] },
    });
    doc.save("e-pashu-vaccination-register.pdf");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Vaccination Module" description="Monitor vaccine due dates, reminders, batch traceability, officer attribution and SMS outreach.">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Vaccination</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader><DialogTitle>New Vaccination Record</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Animal ID</Label>
                  <AnimalSearchSelect
                    animals={animals.map((animal: any) => ({
                      id: String(animal.id || ""),
                      earTag: String(animal.earTag || ""),
                      ownerName: String(animal.ownerName || ""),
                      village: String(animal.village || ""),
                    }))}
                    value={form.animalId}
                    onChange={(value) => setForm((prev) => ({ ...prev, animalId: value.trim() }))}
                  />
                  <div className="mt-1 text-xs text-muted-foreground">Search and select an animal, or type the ID directly.</div>
                </div>
                {form.animalId && (
                  <div className="md:col-span-2">
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{form.animalId}</div>
                            <div className="text-xs text-muted-foreground">{(animals.find((a) => a.id === form.animalId)?.earTag) || ""}</div>
                          </div>
                          <div className="text-sm">
                            <div><strong>Owner:</strong> {(animals.find((a) => a.id === form.animalId)?.ownerName) || "—"}</div>
                            <div><strong>Village:</strong> {(animals.find((a) => a.id === form.animalId)?.village) || "—"}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div><Label>Vaccine Name</Label><Input value={form.vaccineName} onChange={(e) => setForm((prev) => ({ ...prev, vaccineName: e.target.value }))} /></div>
                <div><Label>Batch Number</Label><Input value={form.batchNumber} onChange={(e) => setForm((prev) => ({ ...prev, batchNumber: e.target.value }))} /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} /></div>
                <div><Label>Next Reminder</Label><Input type="date" value={form.nextReminder} onChange={(e) => setForm((prev) => ({ ...prev, nextReminder: e.target.value }))} /></div>
                <div>
                  <Label>Vaccinated By <span className="text-xs text-muted-foreground">(required)</span></Label>
                  <Input value={form.vaccinatedBy} placeholder="Enter vaccinator name" onChange={(e) => setForm((prev) => ({ ...prev, vaccinatedBy: e.target.value }))} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as VaccinationRecord["status"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>SMS Reminder</Label>
                  <Select value={form.smsReminder ? "true" : "false"} onValueChange={(value) => setForm((prev) => ({ ...prev, smsReminder: value === "true" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="mt-4 w-full" onClick={saveRecord} disabled={createMutation.isPending || !form.vaccinatedBy}>{createMutation.isPending ? "Saving..." : "Save Vaccination"}</Button>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={sendWhatsAppReminders}><MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Reminder</Button>
          <Button onClick={exportPdf}><FileDown className="mr-2 h-4 w-4" /> Export PDF</Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Total Records" value={records.length} hint="Active vaccination rows" icon={Syringe} />
          <StatCard label="Done" value={done} hint="Completed doses" icon={ShieldCheck} />
          <StatCard label="Pending" value={pending} hint="Upcoming schedule" icon={Timer} tone="amber" />
          <StatCard label="Overdue" value={overdue} hint="Escalate today" icon={TriangleAlert} tone="red" />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal ID</TableHead>
                    <TableHead>Vaccine Name</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Next Reminder</TableHead>
                    <TableHead>Vaccinated By</TableHead>
                    <TableHead>SMS</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium"><Link to={`/animals/${item.animalId}`}>{item.animalId}</Link></TableCell>
                      <TableCell>{item.vaccineName}</TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{formatDisplayDate(item.dueDate)}</TableCell>
                      <TableCell>{formatDisplayDate(item.nextReminder)}</TableCell>
                      <TableCell>{item.vaccinatedBy}</TableCell>
                      <TableCell><Badge variant={item.smsReminder ? "secondary" : "outline"}>{item.smsReminder ? "Enabled" : "Off"}</Badge></TableCell>
                      <TableCell>
                        <Select value={item.status} onValueChange={(value) => updateStatus(item, value as VaccinationRecord["status"])}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* quick action removed: using dropdown only */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">SMS Reminder Queue</h3>
                <p className="text-xs text-muted-foreground">Sync pending vaccination reminders into the reminders sheet and mark them sent from here.</p>
              </div>
              <Button variant="outline" onClick={syncSmsQueue} disabled={reminderMutation.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" /> {reminderMutation.isPending ? "Syncing..." : "Sync SMS Queue"}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Village</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.village}</TableCell>
                      <TableCell>{item.recipient}</TableCell>
                      <TableCell>{item.channel}</TableCell>
                      <TableCell className="min-w-80">{item.message}</TableCell>
                      <TableCell>{formatDisplayDate(item.dueDate)}</TableCell>
                      <TableCell><Badge variant={item.status === "Sent" ? "secondary" : "outline"}>{item.status}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" disabled={item.status === "Sent" || sendReminderMutation.isPending} onClick={() => sendQueuedReminder(item)}>
                          Send
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!reminders.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                        No reminders queued yet.
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

export default VaccinationsPage;
