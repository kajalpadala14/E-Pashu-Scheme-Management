import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LocateFixed,
  Map,
  Loader2,
  RotateCcw,
  Trash2,
  Siren,
  UserCheck,
} from "lucide-react";
import { createDailyFieldReport, createEmergencyReport, createPhotoEvidence, listDailyFieldReports, listEmergencyReports, listFieldOfficers, listFieldOfficerTasks, listLivestockAnimals, listLocations, listPhotoEvidence, listSupervisorVerifications, fetchPhotoDataUrl, listUsers } from "@/lib/dataService";
import { AdminAreaSelect } from "@/components/AdminAreaSelect";
import { areaForRecord, defaultAdministrativeArea, type AdministrativeArea, buildAdministrativeOptions } from "@/lib/adminHierarchy";
import type { EmergencyReport, FieldOfficerRecord, GeoTaggedPhotoEvidence, LocationRecord, SupervisorVerification } from "@/lib/types";

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
  const [activeTab, setActiveTab] = useState("tasks");
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedArea, setSelectedArea] = useState<AdministrativeArea>(fallbackArea);
  const [tagQuery, setTagQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);
  const [evidenceOfficerFilter, setEvidenceOfficerFilter] = useState("");
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const { data: fieldOfficers = [] } = useQuery({
    queryKey: ["fieldOfficers"],
    queryFn: listFieldOfficers,
    initialData: [] as FieldOfficerRecord[],
  });
  const { data: users = [], isLoading: usersLoading, isFetching: usersFetching } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    initialData: [] as any[],
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
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: listLocations,
    initialData: [] as LocationRecord[],
  });

  const areaOptions = useMemo(() => {
    return buildAdministrativeOptions(locations);
  }, [locations]);

  const activeFieldOfficers = useMemo(() => fieldOfficers.filter((item) => item.attendance === "Present"), [fieldOfficers]);
  const visibleOfficers = activeFieldOfficers.length ? activeFieldOfficers : fieldOfficers;
  // Show all officers in dropdown and selection lists (don't hide by area)
  const allOfficers = fieldOfficers;
  const fieldOfficerUsers = useMemo(
    () => users.filter((item) => String(item.role || "").toLowerCase() === "field_officer"),
    [users],
  );
  const officerDropdownLoading = usersLoading || usersFetching;
  const officerDropdownEmpty = !officerDropdownLoading && fieldOfficerUsers.length === 0;
  const recentEvidence = useMemo(() => {
    return [...photoEvidence]
      .sort((left, right) => new Date(right.capturedAt || right.submittedAt || 0).getTime() - new Date(left.capturedAt || left.submittedAt || 0).getTime())
      .slice(0, 5);
  }, [photoEvidence]);
  const todayUploads = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return photoEvidence.filter((item) => String(item.capturedAt || item.submittedAt || "").slice(0, 10) === today).length;
  }, [photoEvidence]);
  const selectedOfficerRecord = useMemo(
    () => allOfficers.find((item) => item.name === selectedOfficer) || fallbackOfficer,
    [selectedOfficer, allOfficers],
  );

  useEffect(() => {
    if (!fieldOfficerUsers.length) {
      setSelectedOfficer("");
    }
  }, [fieldOfficerUsers.length]);

  useEffect(() => {
    if (!cameraOpen) {
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
      return;
    }

    if (cameraStreamRef.current && cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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

  // Active officers count should reflect active users with role field_officer from Employees/Users sheet
  const activeOfficers = users.filter((u: any) => String(u.role) === "field_officer" && u.active).length || activeFieldOfficers.length;
  const matchesArea = (record: Partial<AdministrativeArea> & { village?: string }) => {
    const area = areaForRecord(record);
    if (selectedArea.district && area.district !== selectedArea.district) return false;
    if (selectedArea.tehsil && area.tehsil !== selectedArea.tehsil) return false;
    if (selectedArea.block && area.block !== selectedArea.block) return false;
    if (selectedArea.gramPanchayat && area.gramPanchayat !== selectedArea.gramPanchayat) return false;
    if (selectedArea.village && area.village !== selectedArea.village) return false;
    return true;
  };

  const fieldOfficersFiltered = visibleOfficers.filter((o) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    // match officer by assigned villages or current village
    if (selectedArea.village) {
      return o.assignedVillages.includes(selectedArea.village) || o.currentVillage === selectedArea.village || o.village === selectedArea.village;
    }
    return matchesArea(o);
  });

  const preparePhotoForTask = (task: any) => {
    const officer = fieldOfficers.find((o) => o.id === task.officerId);
    if (officer) setSelectedOfficer(officer.name);
    setPhotoForm((prev) => ({
      ...prev,
      village: task.village || prev.village,
      district: task.district || prev.district,
      tehsil: task.tehsil || prev.tehsil,
      block: task.block || prev.block,
      gramPanchayat: task.gramPanchayat || prev.gramPanchayat,
      module: (task.task as GeoTaggedPhotoEvidence["module"]) || prev.module,
    }));
    startCamera();
  };

  function EvidenceImage({ item, className }: { item: any; className?: string }) {
    const [candidates, setCandidates] = useState<string[]>([]);
    const [idx, setIdx] = useState(0);
    const [loadingProxy, setLoadingProxy] = useState(false);

    useEffect(() => {
      if (!item) return;
      const list: string[] = [];
      if (item.photoDataUrl) list.push(item.photoDataUrl);
      if (item.photoUrl) list.push(item.photoUrl);
      if (item.driveFileUrl) list.push(item.driveFileUrl);
      if (item.driveFileId) {
        list.push(`https://drive.google.com/uc?export=view&id=${item.driveFileId}`);
        list.push(`https://drive.google.com/uc?export=download&id=${item.driveFileId}`);
        list.push(`https://drive.google.com/file/d/${item.driveFileId}/preview`);
      }

      // If a Drive file id exists, always fetch the proxy base64 and prefer it.
      if (item.driveFileId) {
        (async () => {
          try {
            setLoadingProxy(true);
            const dataUrl = await fetchPhotoDataUrl(item.driveFileId);
            // Prefer proxy dataUrl first, fallback to other candidates
            setCandidates([dataUrl, ...list.filter((s) => s !== dataUrl)]);
            setIdx(0);
          } catch (e) {
            // If proxy fails, fall back to the candidate list
            setCandidates(list);
            setIdx(0);
          } finally {
            setLoadingProxy(false);
          }
        })();
      } else {
        setCandidates(list);
        setIdx(0);
        setLoadingProxy(false);
      }
    }, [item]);

    if (!item) return <div className={`h-12 w-16 rounded bg-gray-50 flex items-center justify-center text-xs text-gray-400 ${className || ""}`}>No image</div>;
    const src = candidates[idx];
    if (!src) return <div className={`rounded bg-gray-50 flex items-center justify-center text-xs text-gray-400 ${className || ""}`}>No image</div>;
    return (
      <img
        src={src}
        alt={item.caption || "evidence"}
        className={`${className || ""} rounded object-cover`}
        onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i + 1))}
      />
    );
  }

  const emergencyReportsFiltered = emergencyReports.filter((r) => {
    if (!selectedArea || Object.values(selectedArea).every((v) => !v)) return true;
    return matchesArea(r);
  });

  // Filter evidence by selected officer name (if provided), otherwise show all.
  const photoEvidenceFiltered = photoEvidence.filter((p) => {
    if (!evidenceOfficerFilter) return true;
    return String(p.officerName || "").toLowerCase().includes(String(evidenceOfficerFilter || "").toLowerCase());
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

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError("Camera permission was denied.");
    }
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraOpen(false);
  };

  const captureCameraPhoto = async () => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast({ title: "Camera not ready", description: "Open the camera and wait for the preview.", variant: "destructive" });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      toast({ title: "Camera capture failed", description: "Unable to process the frame.", variant: "destructive" });
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const coordinates = await getEvidenceCoordinates();
    const stampedData = await stampEvidenceDataUrl(rawDataUrl, coordinates);

    setPhotoForm((prev) => ({
      ...prev,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      fileName: `${prev.module.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.jpg`,
      photoUrl: rawDataUrl,
      photoDataUrl: stampedData,
    }));
    setUploadProgress(60);
    stopCamera();
  };

  

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image file"));
      reader.readAsDataURL(file);
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

  const removeCapturedPhoto = () => {
    setPhotoForm((prev) => ({
      ...prev,
      fileName: "",
      photoUrl: "",
      photoDataUrl: "",
    }));
    setUploadProgress(0);
    stopCamera();
  };

  const retakeCapturedPhoto = async () => {
    removeCapturedPhoto();
    await startCamera();
  };

  const validateWizardStep = (step: number) => {
    if (!selectedOfficer.trim()) {
      return false;
    }

    if (step === 0) {
      return Boolean(photoForm.district && photoForm.tehsil && photoForm.block && photoForm.gramPanchayat && photoForm.village);
    }

    if (step === 1) {
      return Boolean(photoForm.animalId && photoForm.module);
    }

    if (step === 2) {
      return Boolean(photoForm.photoDataUrl);
    }

    if (step === 3) {
      return Boolean(photoForm.caption.trim());
    }

    return true;
  };

  const goToNextWizardStep = () => {
    if (!validateWizardStep(wizardStep)) {
      toast({
        title: "Complete this step",
        description:
          !selectedOfficer.trim()
            ? "Please select a Field Officer."
            : wizardStep === 0
            ? "Fill the location details before continuing."
            : wizardStep === 1
              ? "Select animal and visit type first."
              : wizardStep === 2
                ? "Capture or upload a photo before moving on."
                : "Add a short note before reviewing.",
        variant: "destructive",
      });
      return;
    }

    setWizardStep((current) => Math.min(current + 1, 4));
  };

  const goToPreviousWizardStep = () => {
    setWizardStep((current) => Math.max(current - 1, 0));
  };

  const submitPhotoEvidence = async () => {
    const animalId = photoForm.animalId.trim();
    const animal = animals.find((item) => item.id === animalId || item.earTag === animalId);
    const caption = photoForm.caption.trim();
    const officerName = selectedOfficer.trim();

    if (!officerName) {
      toast({
        title: "Photo evidence incomplete",
        description: "Please select a Field Officer.",
        variant: "destructive",
      });
      return;
    }

    if (!animalId || !photoForm.photoDataUrl || !caption) {
      toast({
        title: "Photo evidence incomplete",
        description: !caption
          ? "Add a short note before submitting."
          : "Capture a photo before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadProgress(75);
      const savedEvidence = await uploadPhotoMutation.mutateAsync({
        animalId,
        tagId: animal?.earTag || animalId,
        officerName,
        district: photoForm.district,
        tehsil: photoForm.tehsil,
        block: photoForm.block,
        gramPanchayat: photoForm.gramPanchayat,
        village: photoForm.village,
        latitude: photoForm.latitude,
        longitude: photoForm.longitude,
        capturedAt: new Date().toISOString(),
        module: photoForm.module,
        caption,
        photoDataUrl: photoForm.photoDataUrl,
        fileName: photoForm.fileName,
      });

      setPhotoForm((prev) => ({ ...prev, caption: "", fileName: "", photoUrl: "", photoDataUrl: "" }));
      setUploadProgress(100);
      setWizardStep(0);
      stopCamera();
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
          `${photoForm.module} | ${selectedOfficer.trim() || "Field Officer"}`,
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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="Field Officer Panel"
          description="Simple village-based field workflow for animal visits, GPS Map Camera proof, emergency reporting and supervisor review."
        />

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
          <StatCard label="Active Officers" value={activeOfficers} hint="On duty now" icon={UserCheck} />
          <StatCard label="Today's Uploads" value={todayUploads} hint="Saved today" icon={Camera} />
        </div>

        {/* Area selector removed per request — no top-level area filtering */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max justify-start">
              <TabsTrigger value="tasks">Field Tasks</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <CardHeader className="space-y-3 border-b bg-slate-50/80 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900">Field Officer Wizard</CardTitle>
                      <p className="text-xs text-slate-500">Step-by-step capture flow for village evidence collection.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Field Officer</div>
                      {selectedOfficer.trim() ? <span className="text-xs font-medium text-emerald-700">Selected</span> : null}
                    </div>

                    <Popover open={officerDropdownOpen} onOpenChange={setOfficerDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={officerDropdownOpen}
                          className="h-11 w-full justify-between border-slate-200 bg-slate-50 text-left font-normal text-slate-900"
                          disabled={officerDropdownLoading || officerDropdownEmpty}
                        >
                          <span className="truncate">
                            {officerDropdownLoading
                              ? "Loading Field Officers..."
                              : officerDropdownEmpty
                                ? "No Field Officers Found"
                                : selectedOfficer.trim() || "Select Field Officer"}
                          </span>
                          {officerDropdownLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search field officers..." />
                          <CommandList>
                            <CommandEmpty>
                              {officerDropdownLoading ? "Loading Field Officers..." : "No Field Officers Found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {fieldOfficerUsers.map((officer) => (
                                <CommandItem
                                  key={officer.email || officer.id || officer.name}
                                  value={officer.name}
                                  onSelect={(value) => {
                                    setSelectedOfficer(value);
                                    setOfficerDropdownOpen(false);
                                  }}
                                >
                                  <CheckCircle2 className={`mr-2 h-4 w-4 ${selectedOfficer === officer.name ? "opacity-100" : "opacity-0"}`} />
                                  <span>{officer.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <p className="mt-2 text-xs text-slate-500">This officer name is saved with every evidence record and sheet row.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                    {[
                      "Location",
                      "Animal",
                      "Photo",
                      "Notes",
                      "Submit",
                    ].map((label, index) => {
                      const isComplete = index < wizardStep;
                      const isCurrent = index === wizardStep;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setWizardStep(index)}
                          className={`flex min-h-16 flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition ${
                            isCurrent
                              ? "border-primary bg-primary text-white shadow-sm"
                              : isComplete
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                            {isComplete ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                          </span>
                          <span className="text-[11px] font-medium leading-tight">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-4 sm:p-6">
                  {wizardStep === 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Step 1: Location Details</Label>
                        <p className="text-xs text-slate-500">Select the exact field area before capturing evidence.</p>
                      </div>
                      <AdminAreaSelect
                        value={areaForRecord(photoForm)}
                        onChange={(area) => setPhotoForm((prev) => ({ ...prev, ...(area as AdministrativeArea) }))}
                        className="space-y-3"
                        districtOptions={areaOptions.districts}
                        tehsilOptions={areaOptions.tehsils}
                        blockOptions={areaOptions.blocks}
                        gramPanchayatOptions={areaOptions.gramPanchayats}
                        villageOptions={areaOptions.villages}
                        hideVillage
                        includeAll
                      />
                    </div>
                  ) : null}

                  {wizardStep === 1 ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Step 2: Animal Details</Label>
                        <p className="text-xs text-slate-500">Choose the animal and visit module.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Animal ID *</Label>
                          <Input
                            list="field-animal-list"
                            value={photoForm.animalId}
                            onChange={(event) => setPhotoForm((prev) => ({ ...prev, animalId: event.target.value }))}
                            placeholder="Enter Animal ID or Tag ID"
                            className="h-11"
                          />
                          <datalist id="field-animal-list">
                            {animals.flatMap((animal) => [
                              <option key={animal.id} value={animal.id}>{animal.earTag}</option>,
                              animal.earTag ? <option key={animal.earTag} value={animal.earTag}>{animal.id}</option> : null,
                            ])}
                          </datalist>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Visit Type *</Label>
                          <Select value={photoForm.module} onValueChange={(value) => setPhotoForm((prev) => ({ ...prev, module: value as GeoTaggedPhotoEvidence["module"] }))}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select visit type" /></SelectTrigger>
                            <SelectContent>{visitTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {wizardStep === 2 ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Step 3: Evidence Capture</Label>
                        <p className="text-xs text-slate-500">Capture a clear photo or upload one, then review it before saving.</p>
                      </div>

                      <div className="overflow-hidden rounded-2xl border bg-slate-950 shadow-sm">
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-white">
                          <div className="text-sm font-medium">Camera Preview</div>
                          <div className="text-xs text-white/70">Village proof</div>
                        </div>
                        {photoForm.photoDataUrl ? (
                          <img src={photoForm.photoDataUrl} alt="Captured evidence preview" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="flex aspect-[4/3] w-full items-center justify-center bg-black/70 text-center text-sm text-white/70">
                            Camera preview appears here
                          </div>
                        )}
                      </div>

                      {cameraError ? <p className="text-xs text-destructive">{cameraError}</p> : null}

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button type="button" variant="outline" className="h-12 w-full justify-start" onClick={captureCameraPhoto} disabled={!cameraOpen}>
                          <Camera className="mr-2 h-4 w-4" /> Capture Photo
                        </Button>
                        <div>
                          <input ref={uploadInputRef} className="hidden" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await processEvidenceFile(file); }} />
                          <Button type="button" variant="outline" className="h-12 w-full justify-start" onClick={() => uploadInputRef.current?.click()}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Upload Photo
                          </Button>
                        </div>
                        <Button type="button" variant="secondary" className="h-12 w-full justify-start" onClick={retakeCapturedPhoto} disabled={!photoForm.photoDataUrl && !cameraOpen}>
                          <RotateCcw className="mr-2 h-4 w-4" /> Retake
                        </Button>
                        <Button type="button" variant="ghost" className="h-12 w-full justify-start" onClick={removeCapturedPhoto} disabled={!photoForm.photoDataUrl && !cameraOpen}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </div>

                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        {photoForm.photoDataUrl ? (
                          <div className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" /> Photo Captured
                          </div>
                        ) : (
                          <div>Capture or upload a photo to unlock the next step.</div>
                        )}
                      </div>

                      {photoForm.fileName ? <p className="text-xs text-slate-500">Selected: {photoForm.fileName}</p> : null}
                      {uploadProgress > 0 ? <Progress value={uploadProgress} /> : null}
                    </div>
                  ) : null}

                  {wizardStep === 3 ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Step 4: Notes *</Label>
                        <p className="text-xs text-slate-500">Write one short line like vaccination done or treatment given.</p>
                      </div>
                      <Textarea
                        value={photoForm.caption}
                        onChange={(event) => setPhotoForm((prev) => ({ ...prev, caption: event.target.value }))}
                        placeholder="1 vaccination done, treatment given, follow-up needed..."
                        required
                        className="min-h-28"
                      />
                    </div>
                  ) : null}

                  {wizardStep === 4 ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Step 5: Review & Submit</Label>
                        <p className="text-xs text-slate-500">Check the summary below before sending to the sheet.</p>
                      </div>

                      <div className="rounded-2xl border bg-slate-50 p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Officer</span><span className="font-medium text-slate-900">{selectedOfficer.trim() || "Select Field Officer"}</span></div>
                            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Location</span><span className="font-medium text-slate-900">{[photoForm.village, photoForm.gramPanchayat, photoForm.block, photoForm.tehsil, photoForm.district].filter(Boolean).join(" • ") || "-"}</span></div>
                            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Animal</span><span className="font-medium text-slate-900">{photoForm.animalId || "-"}</span></div>
                            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Module</span><span className="font-medium text-slate-900">{photoForm.module}</span></div>
                            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Note</span><span className="font-medium text-slate-900">{photoForm.caption || "-"}</span></div>
                          </div>
                          <div className="overflow-hidden rounded-xl border bg-white">
                            {photoForm.photoDataUrl ? (
                              <img src={photoForm.photoDataUrl} alt="Review preview" className="h-36 w-36 object-cover md:h-40 md:w-40" />
                            ) : (
                              <div className="flex h-36 w-36 items-center justify-center text-xs text-slate-400 md:h-40 md:w-40">No photo</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-500">
                      Step {wizardStep + 1} of 5
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" className="h-11 sm:min-w-28" onClick={goToPreviousWizardStep} disabled={wizardStep === 0}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      {wizardStep < 4 ? (
                        <Button className="h-11 sm:min-w-28" onClick={goToNextWizardStep}>
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="h-11 sm:min-w-40" onClick={submitPhotoEvidence} disabled={uploadPhotoMutation.isPending || !photoForm.photoDataUrl}>
                          <Camera className="mr-2 h-4 w-4" /> {uploadPhotoMutation.isPending ? "Uploading..." : "Submit Visit Proof"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-slate-50/80 pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">Recent Evidence</CardTitle>
                    <p className="text-xs text-slate-500">Last 5 saved rows from the sheet.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("evidence")}>View All Records</Button>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-5">
                  {recentEvidence.length ? recentEvidence.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="shrink-0">
                        {item.driveFileId || item.photoDataUrl || item.photoUrl ? (
                          <EvidenceImage item={item} className="h-16 w-16 rounded-xl" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400">No photo</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">{item.animalId || item.tagId || "Unknown Animal"}</div>
                            <div className="text-[11px] text-slate-500">{item.capturedAt ? new Date(item.capturedAt).toLocaleString("en-IN") : ""}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600">{item.village || "-"}</div>
                        <div className="text-xs font-medium text-slate-800">{item.module || "-"}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No saved evidence yet. Capture a photo to create the first sheet row.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          

          <TabsContent value="evidence">
            <div className="mb-3 flex items-center gap-2">
              <Input
                name="evidence-officer-filter"
                autoComplete="off"
                value={evidenceOfficerFilter}
                onChange={(e) => setEvidenceOfficerFilter(e.target.value)}
                placeholder="Filter evidence by officer name (leave blank for all)"
              />
              <Button variant="ghost" onClick={() => setEvidenceOfficerFilter("")}>Clear</Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <CardTitle className="text-sm">Photo Evidence</CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Photo evidence", description: `${photoEvidenceFiltered.length} total geo-tagged photos shown.` })}>View All</Button>
              </CardHeader>
              <CardContent className="grid max-h-[520px] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-3">
                {photoEvidenceFiltered.length ? photoEvidenceFiltered.map((item) => {
                  const driveViewer = item.driveFileId ? `https://drive.google.com/uc?export=view&id=${item.driveFileId}` : null;
                  const src = driveViewer || item.photoDataUrl || item.photoUrl || item.driveFileUrl;
                  return (
                  <div key={item.id} className="overflow-hidden rounded-md border">
                    {src ? (
                      <EvidenceImage item={item} className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No image available</div>
                    )}
                    <div className="space-y-1 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{item.capturedAt ? new Date(item.capturedAt).toLocaleString("en-IN") : ""}</span>
                      </div>
                      <p className="text-sm font-medium">{item.caption}</p>
                      <p className="text-xs text-muted-foreground">{item.officerName} · {item.village}</p>
                      {item.driveFileUrl ? (
                        <a href={item.driveFileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary">Open file</a>
                      ) : null}
                    </div>
                  </div>
                )}) : (
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
