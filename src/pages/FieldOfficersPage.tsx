import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  Camera,
  ClipboardList,
  LocateFixed,
  Flag,
  Map,
  Search,
  Siren,
  Upload,
  UserCheck,
} from "lucide-react";
import { createDailyFieldReport, createEmergencyReport, createPhotoEvidence, listDailyFieldReports, listEmergencyReports, listFieldOfficers, listFieldOfficerTasks, listLivestockAnimals, listPhotoEvidence, listSupervisorVerifications } from "@/lib/dataService";
import { AdminAreaSelect } from "@/components/AdminAreaSelect";
import { areaForRecord, defaultAdministrativeArea, type AdministrativeArea, buildAdministrativeOptions } from "@/lib/adminHierarchy";
import type { EmergencyReport, FieldOfficerRecord, GeoTaggedPhotoEvidence, SupervisorVerification } from "@/lib/types";

const emergencyTypes: EmergencyReport["type"][] = [
  "Animal Death",
  "Disease Outbreak",
  "Emergency Treatment",
  "High-risk Village Alert",
];

const visitTypes: GeoTaggedPhotoEvidence["module"][] = [
  "Vaccination",
  "Treatment",
  "Pregnancy Check",
  "Disease Inspection",
  "Farmer Visit",
];

const fallbackOfficer: FieldOfficerRecord = {
  id: "",
  name: "Unknown Officer",
  assignedVillages: [],
  currentVillage: "Unknown",
  latitude: 0,
  longitude: 0,
  lastActive: "",
  visitStatus: "At Office",
  gpsTracking: "Offline",
  visitReports: 0,
  attendance: "Present",
};

const fallbackArea = defaultAdministrativeArea;

const FieldOfficersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedArea, setSelectedArea] = useState<AdministrativeArea>(fallbackArea);
  const [tagQuery, setTagQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [photoForm, setPhotoForm] = useState({
    animalId: "",
    district: fallbackArea.district,
    tehsil: fallbackArea.tehsil,
    block: fallbackArea.block,
    gramPanchayat: fallbackArea.gramPanchayat,
    village: fallbackArea.village,
    module: "Vaccination" as GeoTaggedPhotoEvidence["module"],
    caption: "",
    fileName: "",
    photoUrl: "",
    photoDataUrl: "",
    latitude: 0,
    longitude: 0,
  });
  const [dailyReport, setDailyReport] = useState({
    villagesVisited: fallbackArea.village,
    animalsChecked: "23",
    diseaseCasesIdentified: "0",
    notes: "",
  });
  const [emergencyForm, setEmergencyForm] = useState({
    type: "Disease Outbreak" as EmergencyReport["type"],
    animalId: "",
    ...fallbackArea,
    summary: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const { data: fieldOfficers = [] } = useQuery({
    queryKey: ["fieldOfficers"],
    queryFn: listFieldOfficers,
    initialData: [] as FieldOfficerRecord[],
  });
  const { data: fieldTasks = [] } = useQuery({
    queryKey: ["fieldTasks"],
    queryFn: listFieldOfficerTasks,
    initialData: [],
  });
  const { data: animals = [] } = useQuery({
    queryKey: ["livestockAnimals"],
    queryFn: listLivestockAnimals,
    initialData: [],
  });
  const { data: photoEvidence = [] } = useQuery({
    queryKey: ["photoEvidence"],
    queryFn: listPhotoEvidence,
    initialData: [] as GeoTaggedPhotoEvidence[],
  });
  const { data: emergencyReports = [] } = useQuery({
    queryKey: ["emergencyReports"],
    queryFn: listEmergencyReports,
    initialData: [] as EmergencyReport[],
  });
  const { data: dailyReports = [] } = useQuery({
    queryKey: ["dailyFieldReports"],
    queryFn: listDailyFieldReports,
    initialData: [],
  });
  const { data: supervisorVerifications = [] } = useQuery({
    queryKey: ["supervisorVerifications"],
    queryFn: listSupervisorVerifications,
    initialData: [] as SupervisorVerification[],
  });

  const areaOptions = useMemo(() => {
    return buildAdministrativeOptions([...(animals || []), ...(fieldOfficers || []), ...(photoEvidence || []), ...(fieldTasks || []), ...(emergencyReports || []), ...(dailyReports || [])]);
  }, [animals, fieldOfficers, photoEvidence, fieldTasks, emergencyReports, dailyReports]);

  const selectedOfficerRecord = useMemo(
    () => fieldOfficers.find((item) => item.name === selectedOfficer) || fieldOfficers[0] || fallbackOfficer,
    [fieldOfficers, selectedOfficer],
  );

  useEffect(() => {
    if (!selectedOfficer && fieldOfficers[0]) {
      setSelectedOfficer(fieldOfficers[0].name);
    }
  }, [fieldOfficers, selectedOfficer]);

  useEffect(() => {
    const firstAnimal = animals[0];
    if (!firstAnimal) {
      return;
    }

    setPhotoForm((prev) => {
      if (prev.animalId) {
        return prev;
      }

      const area = areaForRecord(firstAnimal);
      return {
        ...prev,
        animalId: firstAnimal.id,
        district: area.district,
        tehsil: area.tehsil,
        block: area.block,
        gramPanchayat: area.gramPanchayat,
        village: firstAnimal.village,
      };
    });

    setEmergencyForm((prev) => {
      if (prev.animalId) {
        return prev;
      }
      return {
        ...prev,
        animalId: firstAnimal.id,
        ...areaForRecord(firstAnimal),
        summary: prev.summary,
      };
    });
  }, [animals]);

  useEffect(() => {
    if (!selectedOfficerRecord) {
      return;
    }

    setPhotoForm((prev) => ({
      ...prev,
      latitude: selectedOfficerRecord.latitude,
      longitude: selectedOfficerRecord.longitude,
    }));
  }, [selectedOfficerRecord]);

  const uploadPhotoMutation = useMutation({
    mutationFn: createPhotoEvidence,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["photoEvidence"] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: createDailyFieldReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dailyFieldReports"] });
    },
  });

  const emergencyMutation = useMutation({
    mutationFn: createEmergencyReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["emergencyReports"] });
    },
  });

  const activeOfficers = fieldOfficers.filter((item) => item.attendance === "Present").length;
  const pendingTasks = fieldTasks.filter((item) => item.status !== "Completed").length;
  const emergencyAlerts = emergencyReports.filter((item) => item.status !== "Resolved").length;

  const matchesArea = (record: Partial<AdministrativeArea> & { village?: string }) => {
    const area = areaForRecord(record);
    if (selectedArea.district && area.district !== selectedArea.district) return false;
    if (selectedArea.tehsil && area.tehsil !== selectedArea.tehsil) return false;
    if (selectedArea.block && area.block !== selectedArea.block) return false;
    if (selectedArea.gramPanchayat && area.gramPanchayat !== selectedArea.gramPanchayat) return false;
    if (selectedArea.village && area.village !== selectedArea.village) return false;
    return true;
  };

  const fieldOfficersFiltered = fieldOfficers.filter((o) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    // match officer by assigned villages or current village
    if (selectedArea.village) {
      return o.assignedVillages.includes(selectedArea.village) || o.currentVillage === selectedArea.village || o.village === selectedArea.village;
    }
    return matchesArea(o);
  });

  const fieldTasksFiltered = fieldTasks.filter((t) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    return matchesArea(t);
  });

  const emergencyReportsFiltered = emergencyReports.filter((r) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    return matchesArea(r);
  });

  const photoEvidenceFiltered = photoEvidence.filter((p) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    return matchesArea(p);
  });

  const dailyReportsFiltered = dailyReports.filter((d) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    return matchesArea(d);
  });

  const searchAnimal = () => {
    const query = tagQuery.trim().toLowerCase();
    const animal = animals.find((item) => item.earTag.toLowerCase() === query || item.id.toLowerCase() === query);
    if (!animal) {
      toast({ title: "Animal not found", description: "Enter a valid Tag ID or Animal ID.", variant: "destructive" });
      return;
    }
    navigate(`/animals/${animal.id}`);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not available", description: "Browser location is unavailable. Village selection will be used as location proof." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPhotoForm((prev) => ({
          ...prev,
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        }));
        toast({ title: "Location captured", description: "Location saved in the background with this visit." });
      },
      () => {
        toast({ title: "Location permission not allowed", description: "Village selection and GPS Map Camera photo will be used as proof." });
      },
      { enableHighAccuracy: true, timeout: 4000 },
    );
  };

  const uploadPhotoEvidence = async () => {
    const animalId = photoForm.animalId.trim();
    const animal = animals.find((item) => item.id === animalId || item.earTag === animalId);
    if (!animalId || !photoForm.fileName || !photoForm.photoDataUrl) {
      toast({ title: "Photo evidence incomplete", description: "Enter Animal ID and choose/capture a photo.", variant: "destructive" });
      return;
    }

    try {
      setUploadProgress(75);
      const savedEvidence = await uploadPhotoMutation.mutateAsync({
        animalId,
        tagId: animal?.earTag || animalId,
        officerName: selectedOfficer.trim() || selectedOfficerRecord.name || "Field Officer",
        district: photoForm.district,
        tehsil: photoForm.tehsil,
        block: photoForm.block,
        gramPanchayat: photoForm.gramPanchayat,
        village: photoForm.village,
        latitude: photoForm.latitude,
        longitude: photoForm.longitude,
        capturedAt: new Date().toISOString(),
        module: photoForm.module,
        caption: photoForm.caption || `${photoForm.module} visit${photoForm.village ? ` at ${photoForm.village}` : ""}`,
        photoDataUrl: photoForm.photoDataUrl,
        fileName: photoForm.fileName,
      });

      setPhotoForm((prev) => ({ ...prev, caption: "", fileName: "", photoUrl: "", photoDataUrl: "" }));
      setUploadProgress(100);
      toast({ title: "GPS Map Camera photo uploaded", description: `${photoForm.module} proof saved for ${savedEvidence.animalId} in ${savedEvidence.village}.` });
    } catch (error) {
      toast({
        title: "Photo upload failed",
        description: error instanceof Error ? error.message : "Apps Script upload error",
        variant: "destructive",
      });
    } finally {
      window.setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const submitDailyReport = async () => {
    try {
      await reportMutation.mutateAsync({
        officerName: selectedOfficerRecord.name,
        reportDate: new Date().toISOString().slice(0, 10),
        villagesVisited: dailyReport.villagesVisited.split(",").map((item) => item.trim()).filter(Boolean),
        animalsVaccinated: Number(dailyReport.animalsChecked || 0),
        diseaseCasesIdentified: Number(dailyReport.diseaseCasesIdentified || 0),
        pregnantAnimalsChecked: 0,
        photosUploaded: photoEvidence.length,
        notes: dailyReport.notes,
        status: "Submitted",
      });

      toast({
        title: "Daily field report submitted",
        description: `${dailyReport.animalsChecked} animals checked in ${dailyReport.villagesVisited}.`,
      });
      setDailyReport((prev) => ({ ...prev, notes: "" }));
    } catch (error) {
      toast({
        title: "Report save failed",
        description: error instanceof Error ? error.message : "Apps Script save error",
        variant: "destructive",
      });
    }
  };

  const submitEmergency = async () => {
    const animal = animals.find((item) => item.id === emergencyForm.animalId);
    const area = areaForRecord(emergencyForm);
    const village = area.village || animal?.village || selectedOfficerRecord.currentVillage;
    try {
      const emergency = await emergencyMutation.mutateAsync({
        officerName: selectedOfficerRecord.name,
        district: area.district,
        tehsil: area.tehsil,
        block: area.block,
        gramPanchayat: area.gramPanchayat,
        village,
        animalId: emergencyForm.animalId,
        type: emergencyForm.type,
        priority: emergencyForm.type === "Animal Death" || emergencyForm.type === "Disease Outbreak" ? "High" : "Medium",
        reportedAt: new Date().toISOString(),
        status: "Open",
        summary: emergencyForm.summary || "Emergency field report submitted for supervisor action.",
      });
      toast({
        title: "Emergency report sent",
        description: `${emergency.type} reported for ${village}. Supervisor dashboard notified.`,
        variant: emergencyForm.type === "Disease Outbreak" || emergencyForm.type === "Animal Death" ? "destructive" : "default",
      });
      setEmergencyForm((prev) => ({ ...prev, summary: "" }));
    } catch (error) {
      toast({
        title: "Emergency save failed",
        description: error instanceof Error ? error.message : "Apps Script save error",
        variant: "destructive",
      });
    }
  };

  const villageMapUrl = (village: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(village)}`;

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image file"));
      reader.readAsDataURL(file);
    });

  const getEvidenceCoordinates = () =>
    new Promise<{ latitude: number; longitude: number }>((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: photoForm.latitude, longitude: photoForm.longitude });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        }),
        () => resolve({ latitude: photoForm.latitude, longitude: photoForm.longitude }),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    });

  const stampEvidenceDataUrl = (dataUrl: string, coordinates: { latitude: number; longitude: number }) =>
    new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1280;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Unable to process image"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const capturedAt = new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
        const locationLine = [
          photoForm.village,
          photoForm.gramPanchayat,
          photoForm.block,
          photoForm.district,
        ].filter(Boolean).join(", ");
        const gpsLine = coordinates.latitude && coordinates.longitude
          ? `GPS: ${coordinates.latitude}, ${coordinates.longitude}`
          : "GPS: not captured";
        const lines = [
          `${photoForm.module} | ${selectedOfficer.trim() || selectedOfficerRecord.name || "Field Officer"}`,
          capturedAt,
          locationLine || "Location not selected",
          gpsLine,
        ];

        const padding = Math.max(14, Math.round(width * 0.018));
        const lineHeight = Math.max(20, Math.round(width * 0.028));
        const fontSize = Math.max(14, Math.round(width * 0.022));
        const panelHeight = padding * 2 + lineHeight * lines.length;
        context.fillStyle = "rgba(0, 0, 0, 0.68)";
        context.fillRect(0, height - panelHeight, width, panelHeight);
        context.font = `600 ${fontSize}px Arial, sans-serif`;
        context.fillStyle = "#ffffff";
        lines.forEach((line, index) => {
          context.fillText(line, padding, height - panelHeight + padding + lineHeight * (index + 0.8));
        });
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.onerror = () => reject(new Error("Invalid image file"));
      image.src = dataUrl;
    });

  const processEvidenceFile = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid format", description: "Only jpg, jpeg and png are supported.", variant: "destructive" });
      setPhotoForm((prev) => ({ ...prev, fileName: "", photoUrl: "", photoDataUrl: "" }));
      setUploadProgress(0);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      setUploadProgress(20);
      const sourceData = await fileToDataUrl(file);
      setUploadProgress(45);
      const coordinates = await getEvidenceCoordinates();
      const stampedData = await stampEvidenceDataUrl(sourceData, coordinates);
      setUploadProgress(60);
      setPhotoForm((prev) => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        fileName: file.name,
        photoUrl: previewUrl,
        photoDataUrl: stampedData,
      }));
    } catch (error) {
      setPhotoForm((prev) => ({ ...prev, fileName: "", photoUrl: "", photoDataUrl: "" }));
      toast({
        title: "Photo processing failed",
        description: error instanceof Error ? error.message : "Unable to process this image",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="Field Officer Panel"
          description="Simple village-based field workflow for animal visits, GPS Map Camera proof, emergency reporting and supervisor review."
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatCard label="Active Officers" value={activeOfficers} hint="On duty now" icon={UserCheck} />
          <StatCard label="Pending Tasks" value={pendingTasks} hint="Needs field action" icon={ClipboardList} tone="amber" />
          <StatCard label="Emergency Alerts" value={emergencyAlerts} hint="Open reports" icon={AlertTriangle} tone="red" />
        </div>

        <div className="mt-3">
          <AdminAreaSelect
            value={selectedArea}
            onChange={(area) => setSelectedArea(area as AdministrativeArea)}
            className="max-w-md"
            includeAll
            districtOptions={areaOptions.districts}
            tehsilOptions={areaOptions.tehsils}
            blockOptions={areaOptions.blocks}
            gramPanchayatOptions={areaOptions.gramPanchayats}
            villageOptions={areaOptions.villages}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Field Tasks</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Village Location Overview</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {fieldOfficersFiltered.length ? fieldOfficersFiltered.map((officer) => (
                    <div key={officer.id} className="rounded-md border p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-tight">{officer.name}</p>
                          <Badge variant={officer.visitStatus === "Emergency Response" ? "destructive" : "secondary"}>{officer.visitStatus}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">District: {officer.district || areaForRecord({ village: officer.currentVillage }).district}</p>
                        <p className="text-xs text-muted-foreground">Tehsil: {officer.tehsil || areaForRecord({ village: officer.currentVillage }).tehsil}</p>
                        <p className="text-xs text-muted-foreground">Block: {officer.block || areaForRecord({ village: officer.currentVillage }).block}</p>
                        <p className="text-xs text-muted-foreground">Gram Panchayat: {officer.gramPanchayat || areaForRecord({ village: officer.currentVillage }).gramPanchayat}</p>
                        <p className="text-xs text-muted-foreground">Village: {officer.assignedVillages.join(", ") || officer.currentVillage}</p>
                        <p className="text-xs text-muted-foreground">Last active: {officer.lastActive}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(villageMapUrl(officer.currentVillage), "_blank", "noopener,noreferrer")}
                        >
                          <Map className="mr-2 h-4 w-4" /> View Map
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground xl:col-span-3">
                      No field officer rows found in Sheet yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Animal Search</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Label htmlFor="tag-search">Tag ID or Animal ID</Label>
                  <div className="flex gap-2">
                    <Input id="tag-search" placeholder="ET-RP-1042" value={tagQuery} onChange={(event) => setTagQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") searchAnimal(); }} />
                    <Button onClick={searchAnimal} aria-label="Search animal"><Search className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Animals are now loaded directly from Sheet rows.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">GPS Map Camera Photo Upload</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Officer Name</Label>
                      <Input list="field-officer-list" value={selectedOfficer} onChange={(event) => setSelectedOfficer(event.target.value)} placeholder="Enter officer name" />
                      <datalist id="field-officer-list">
                        {fieldOfficers.map((officer) => <option key={officer.id} value={officer.name} />)}
                      </datalist>
                    </div>
                    <div className="sm:col-span-2">
                      <AdminAreaSelect
                        value={areaForRecord(photoForm)}
                        onChange={(area) => setPhotoForm((prev) => ({ ...prev, ...(area as AdministrativeArea) }))}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                        districtOptions={areaOptions.districts}
                        tehsilOptions={areaOptions.tehsils}
                        blockOptions={areaOptions.blocks}
                        gramPanchayatOptions={areaOptions.gramPanchayats}
                        villageOptions={areaOptions.villages}
                        includeAll
                      />
                    </div>
                    <div>
                      <Label>Animal ID</Label>
                      <Input
                        list="field-animal-list"
                        value={photoForm.animalId}
                        onChange={(event) => setPhotoForm((prev) => ({ ...prev, animalId: event.target.value }))}
                        placeholder="Enter Animal ID or Tag ID"
                      />
                      <datalist id="field-animal-list">
                        {animals.flatMap((animal) => [
                          <option key={animal.id} value={animal.id}>{animal.earTag}</option>,
                          animal.earTag ? <option key={animal.earTag} value={animal.earTag}>{animal.id}</option> : null,
                        ])}
                      </datalist>
                    </div>
                    <div>
                      <Label>Visit Type</Label>
                      <Select value={photoForm.module} onValueChange={(value) => setPhotoForm((prev) => ({ ...prev, module: value as GeoTaggedPhotoEvidence["module"] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{visitTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <StepLabel step="1" label="Photo Evidence" />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <Label>Open Camera</Label>
                      <input
                        ref={cameraInputRef}
                        className="hidden"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) {
                            setPhotoForm((prev) => ({ ...prev, fileName: "", photoUrl: "", photoDataUrl: "" }));
                            setUploadProgress(0);
                            return;
                          }
                          await processEvidenceFile(file);
                        }}
                      />
                      <Button type="button" variant="outline" className="w-full" onClick={() => cameraInputRef.current?.click()}>
                        <Camera className="mr-2 h-4 w-4" /> Open Camera
                      </Button>
                    </div>
                    <div>
                      <Label>Upload Photo</Label>
                      <input
                        ref={uploadInputRef}
                        className="hidden"
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) {
                            setPhotoForm((prev) => ({ ...prev, fileName: "", photoUrl: "", photoDataUrl: "" }));
                            setUploadProgress(0);
                            return;
                          }
                          await processEvidenceFile(file);
                        }}
                      />
                      <Button type="button" variant="outline" className="w-full" onClick={() => uploadInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Photo
                      </Button>
                    </div>
                  </div>
                  {photoForm.fileName && <p className="text-xs text-muted-foreground">Selected: {photoForm.fileName}</p>}
                  {photoForm.photoDataUrl && <img src={photoForm.photoDataUrl} alt="Selected field evidence" className="aspect-[4/3] w-full rounded-md object-cover" />}
                  {uploadProgress > 0 && <Progress value={uploadProgress} />}

                  <StepLabel step="2" label="Add Short Note" />
                  <Textarea value={photoForm.caption} onChange={(event) => setPhotoForm((prev) => ({ ...prev, caption: event.target.value }))} placeholder="Vaccination done, treatment given, follow-up needed..." />

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button variant="outline" onClick={captureLocation}><LocateFixed className="mr-2 h-4 w-4" /> Capture Location</Button>
                    <Button variant="outline" onClick={() => window.open(villageMapUrl(photoForm.village), "_blank", "noopener,noreferrer")}><Map className="mr-2 h-4 w-4" /> View Map</Button>
                    <Button onClick={uploadPhotoEvidence} disabled={uploadPhotoMutation.isPending || !photoForm.photoDataUrl}><Camera className="mr-2 h-4 w-4" /> {uploadPhotoMutation.isPending ? "Uploading..." : "Submit Visit Proof"}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Work Progress Tracking</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Village</TableHead>
                          <TableHead>Officer</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fieldTasksFiltered.length ? fieldTasksFiltered.map((task) => {
                          const officer = fieldOfficers.find((item) => item.id === task.officerId);
                          const progress = Math.round((task.completed / task.target) * 100);
                          return (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell>{task.village}</TableCell>
                              <TableCell>{officer?.name || task.officerId}</TableCell>
                              <TableCell className="min-w-40">
                                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                                  <span>{task.completed}/{task.target}</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} />
                              </TableCell>
                              <TableCell><Badge variant={task.status === "Completed" ? "secondary" : task.status === "Verification Pending" ? "outline" : "destructive"}>{task.status}</Badge></TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No field task rows found in Sheet yet.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Emergency Reporting</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <AdminAreaSelect
                  value={areaForRecord(emergencyForm)}
                  onChange={(area) => setEmergencyForm((prev) => ({ ...prev, ...(area as AdministrativeArea) }))}
                  className="grid grid-cols-1 gap-3 md:grid-cols-5"
                  districtOptions={areaOptions.districts}
                  tehsilOptions={areaOptions.tehsils}
                  blockOptions={areaOptions.blocks}
                  gramPanchayatOptions={areaOptions.gramPanchayats}
                  villageOptions={areaOptions.villages}
                  includeAll
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_2fr_auto]">
                  <div>
                    <Label>Emergency Type</Label>
                    <Select value={emergencyForm.type} onValueChange={(value) => setEmergencyForm((prev) => ({ ...prev, type: value as EmergencyReport["type"] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{emergencyTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Animal ID</Label><Input value={emergencyForm.animalId} onChange={(event) => setEmergencyForm((prev) => ({ ...prev, animalId: event.target.value }))} /></div>
                  <div><Label>Short Description</Label><Input value={emergencyForm.summary} onChange={(event) => setEmergencyForm((prev) => ({ ...prev, summary: event.target.value }))} placeholder="Brief field note" /></div>
                  <div className="md:self-end"><Button className="w-full" onClick={submitEmergency} disabled={emergencyMutation.isPending}><Siren className="mr-2 h-4 w-4" /> {emergencyMutation.isPending ? "Submitting..." : "Submit"}</Button></div>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2 md:grid-cols-2 xl:grid-cols-3">
                  {emergencyReportsFiltered.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{item.type}</span>
                        <Badge variant={item.priority === "High" ? "destructive" : "outline"}>{item.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{areaForRecord(item).block} / {areaForRecord(item).gramPanchayat} / {item.village}</p>
                      <p className="text-xs text-muted-foreground">{item.animalId}</p>
                      <p className="mt-2 line-clamp-2 text-sm">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Daily Field Report</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Label>Villages Visited</Label><Input value={dailyReport.villagesVisited} onChange={(event) => setDailyReport((prev) => ({ ...prev, villagesVisited: event.target.value }))} /></div>
                  <div><Label>Animals Checked</Label><Input type="number" value={dailyReport.animalsChecked} onChange={(event) => setDailyReport((prev) => ({ ...prev, animalsChecked: event.target.value }))} /></div>
                  <div><Label>Disease Cases</Label><Input type="number" value={dailyReport.diseaseCasesIdentified} onChange={(event) => setDailyReport((prev) => ({ ...prev, diseaseCasesIdentified: event.target.value }))} /></div>
                  <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={dailyReport.notes} onChange={(event) => setDailyReport((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Medicine shortage, farmer unavailable, route issue..." /></div>
                  <Button className="sm:col-span-2" onClick={submitDailyReport} disabled={reportMutation.isPending}>{reportMutation.isPending ? "Submitting..." : "Submit Daily Report"}</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Supervisor Verification</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {supervisorVerifications.length ? supervisorVerifications.filter((s) => matchesArea(s)).map((item) => {
                    const status = getVerificationStatus(item);
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="min-w-0">
                          <p className="font-medium">{item.officerName}</p>
                          <p className="text-xs text-muted-foreground">{item.village}</p>
                        </div>
                        <Badge variant={status === "Flagged" ? "destructive" : status === "Needs Review" ? "outline" : "secondary"}>
                          {status === "Flagged" && <Flag className="mr-1 h-3 w-3" />}
                          {status}
                        </Badge>
                      </div>
                    );
                  }) : (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No supervisor verification rows found in Sheet yet.</div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Recent Daily Reports</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Officer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Villages</TableHead>
                      <TableHead>Vaccinated</TableHead>
                      <TableHead>Disease</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyReportsFiltered.slice(0, 5).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.officerName}</TableCell>
                        <TableCell>{report.reportDate}</TableCell>
                        <TableCell>{report.villagesVisited.join(", ")}</TableCell>
                        <TableCell>{report.animalsVaccinated}</TableCell>
                        <TableCell>{report.diseaseCasesIdentified}</TableCell>
                        <TableCell>{report.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <CardTitle className="text-sm">Photo Evidence</CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Photo evidence", description: `${photoEvidenceFiltered.length} total geo-tagged photos shown.` })}>View All</Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {photoEvidenceFiltered.length ? photoEvidenceFiltered.slice(0, 3).map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-md border">
                    <img src={item.photoUrl} alt={item.caption} className="aspect-[4/3] w-full object-cover" />
                    <div className="space-y-1 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={item.verificationStatus === "Flagged" ? "destructive" : "secondary"}>{item.verificationStatus}</Badge>
                        <span className="text-xs text-muted-foreground">{item.capturedAt}</span>
                      </div>
                      <p className="text-sm font-medium">{item.caption}</p>
                      <p className="text-xs text-muted-foreground">{item.officerName} · {item.village}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground sm:col-span-3">No photo evidence found in Sheet yet.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

function StepLabel({ step, label }: { step: string; label: string }) {
  return <div className="flex items-center gap-2 text-sm font-medium"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{step}</span><span>{label}</span></div>;
}

function getVerificationStatus(item: SupervisorVerification) {
  if (item.fakeVisitFlag) {
    return "Flagged";
  }
  if (item.visitVerified && item.photoApproved && item.reportApproved) {
    return "Verified";
  }
  return "Needs Review";
}

export default FieldOfficersPage;
