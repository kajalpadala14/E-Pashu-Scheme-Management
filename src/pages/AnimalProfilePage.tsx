import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ArrowLeft, Bell, Camera, Dna, FileText, IdCard, MapPin, Syringe, type LucideIcon } from "lucide-react";
import { getStoredPhotoEvidence } from "@/lib/fieldEvidenceStore";
import { getAnimalProfile, listPhotoEvidence, listAlerts } from "@/lib/dataService";
import { areaForRecord } from "@/lib/adminHierarchy";
import { useQuery } from "@tanstack/react-query";

const AnimalProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profileData } = useQuery({ queryKey: ["animalProfile", id], queryFn: () => getAnimalProfile(String(id)), enabled: Boolean(id) });
  const { data: photoEvidence = [] } = useQuery({ queryKey: ["photoEvidence"], queryFn: listPhotoEvidence });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });

  const animal = profileData?.animal ?? { id: String(id || ""), earTag: "", photo: "", ownerName: "", species: "Cattle", breed: "", gender: "Female", dob: "", age: 0, color: "", weight: 0, milkingStatus: "Not Applicable", pregnancyStatus: "Not Applicable", calvings: 0, vaccinationStatus: "Pending", diseaseStatus: "None", treatmentHistory: "", village: "", status: "Healthy", notes: "", productionData: "" };
  const area = areaForRecord(animal);
  const vaccHistory = profileData?.vaccHistory ?? [];
  const diseaseHistory = profileData?.diseaseHistory ?? [];
  const pregnancyHistory = profileData?.breedingHistory ?? [];
  const animalAlerts = alerts.filter((item) => item.message.includes(animal.id) || item.message.includes(animal.village));
  const allPhotoEvidence = useMemo(() => [...getStoredPhotoEvidence(), ...photoEvidence], [photoEvidence]);
  const visitEvidence = allPhotoEvidence
    .filter((item) => item.animalId === animal.id)
    .slice()
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Animal Full Profile" description="Complete veterinary record with ownership, Tag ID identity, health, breeding, treatment, alerts, production and geo-tagged visit evidence.">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/animals")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={() => navigate(`/vaccinations?animalId=${encodeURIComponent(animal.id)}#add`)}><Syringe className="mr-2 h-4 w-4" /> Add Vaccination</Button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <Card className="xl:col-span-1">
            <CardContent className="p-4">
              <img src={animal.photo} alt={animal.id} className="aspect-[4/3] w-full rounded-md object-cover" />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">{animal.id}</h3>
                  <p className="text-sm text-muted-foreground">{animal.earTag}</p>
                </div>
                <Badge variant={animal.status === "Critical" ? "destructive" : "secondary"}>{animal.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Species</p><p className="font-medium">{animal.species}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Breed</p><p className="font-medium">{animal.breed}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{animal.ownerName}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Village</p><p className="font-medium">{area.village}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Block</p><p className="font-medium">{area.block}</p></div>
                <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Gram Panchayat</p><p className="font-medium">{area.gramPanchayat}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="xl:col-span-3">
            <Tabs defaultValue="details">
              <TabsList className="mb-4 grid h-auto grid-cols-2 md:grid-cols-7">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
                <TabsTrigger value="disease">Disease</TabsTrigger>
                <TabsTrigger value="pregnancy">Pregnancy</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><IdCard className="h-4 w-4" /> Full Details</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {[
                      ["Tag ID", animal.earTag],
                      ["District", area.district],
                      ["Tehsil", area.tehsil],
                      ["Block", area.block],
                      ["Gram Panchayat", area.gramPanchayat],
                      ["Village", area.village],
                      ["Gender", animal.gender],
                      ["DOB / Age", `${animal.dob} / ${animal.age} years`],
                      ["Color", animal.color],
                      ["Weight", `${animal.weight} kg`],
                      ["Milking Status", animal.milkingStatus],
                      ["Pregnancy Status", animal.pregnancyStatus],
                      ["Number of Calvings", animal.calvings],
                      ["Disease Status", animal.diseaseStatus],
                      ["Production Data", animal.productionData],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vaccines">
                <RecordTable
                  icon={Syringe}
                  title="Vaccination Timeline"
                  headers={["Vaccine", "Batch", "Due Date", "Reminder", "Officer", "Status"]}
                  rows={vaccHistory.map((item) => [item.vaccineName, item.batchNumber, item.dueDate, item.nextReminder, item.vaccinatedBy, item.status])}
                />
              </TabsContent>

              <TabsContent value="disease">
                <RecordTable
                  icon={AlertTriangle}
                  title="Disease History"
                  headers={["Disease", "Symptoms", "Treatment", "Doctor", "Medicine", "Recovery"]}
                  rows={diseaseHistory.map((item) => [item.diseaseName, item.symptoms, item.treatment, item.doctorName, item.medicine, item.recoveryStatus])}
                  empty="No disease records for this animal."
                />
              </TabsContent>

              <TabsContent value="pregnancy">
                <RecordTable
                  icon={Dna}
                  title="Pregnancy History"
                  headers={["Insemination", "Pregnancy Check", "Expected Delivery", "Calf Count", "Calf Gender", "Lactation"]}
                  rows={pregnancyHistory.map((item) => [item.inseminationDate, item.pregnancyCheck, item.expectedDelivery, item.calfCount, item.calfGender, item.lactationStatus])}
                  empty="No pregnancy history for this animal."
                />
              </TabsContent>

              <TabsContent value="evidence">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Camera className="h-4 w-4" /> Photo Evidence Timeline</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visitEvidence.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 gap-3 rounded-md border p-3 md:grid-cols-[160px_1fr]">
                          <img src={item.photoUrl} alt={item.caption} className="aspect-[4/3] w-full rounded-md object-cover" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{item.module}</Badge>
                              <Badge variant={item.verificationStatus === "Flagged" ? "destructive" : "secondary"}>{item.verificationStatus}</Badge>
                            </div>
                            <p className="mt-2 text-sm font-medium">{item.capturedAt} - {item.caption}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.officerName} · {item.village} · {item.tagId}</p>
                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</p>
                          </div>
                        </div>
                      ))}
                      {!visitEvidence.length && <p className="text-sm text-muted-foreground">No geo-tagged visit evidence uploaded for this animal.</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4" /> Notes, Treatment and Production</CardTitle></CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border p-4"><p className="text-xs text-muted-foreground">Notes</p><p className="mt-2 text-sm">{animal.notes}</p></div>
                    <div className="rounded-md border p-4"><p className="text-xs text-muted-foreground">Treatment Records</p><p className="mt-2 text-sm">{animal.treatmentHistory}</p></div>
                    <div className="rounded-md border p-4"><p className="text-xs text-muted-foreground">Production Data</p><p className="mt-2 text-sm">{animal.productionData}</p></div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Bell className="h-4 w-4" /> Alerts</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {animalAlerts.map((item) => (
                      <div key={item.id} className="rounded-md border p-3">
                        <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>{item.priority}</Badge>
                        <p className="mt-2 text-sm font-medium">{item.message}</p>
                        <p className="text-xs text-muted-foreground">{item.type} · {item.time}</p>
                      </div>
                    ))}
                    {!animalAlerts.length && <p className="text-sm text-muted-foreground">No active alerts for this animal.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

function RecordTable({
  icon: Icon,
  title,
  headers,
  rows,
  empty = "No records found.",
}: {
  icon: LucideIcon;
  title: string;
  headers: string[];
  rows: Array<Array<string | number | boolean>>;
  empty?: string;
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4" /> {title}</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>{headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>{row.map((cell, cellIndex) => <TableCell key={cellIndex}>{String(cell)}</TableCell>)}</TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={headers.length} className="text-center text-muted-foreground">{empty}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AnimalProfilePage;
