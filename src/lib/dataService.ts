import type {
  AlertItem,
  Animal,
  AnimalProfileData,
  BreedingRecord,
  DailyFieldReport,
  DashboardData,
  DiseaseTreatmentRecord,
  Farmer,
  FieldOfficerTask,
  LocationRecord,
  EmergencyReport,
  GeoTaggedPhotoEvidence,
  PregnancyRecord,
  ReminderItem,
  SchemeBeneficiaryRecord,
  SchemeDataRecord,
  UserDirectoryRecord,
  Vaccination,
  VillageInsight,
} from "@/lib/types";
import type { FarmerRecord, FieldOfficerRecord, LivestockAnimal, SupervisorVerification, VaccinationRecord } from "@/lib/types";
import { isValidIndianMobile, toDialableIndianMobile } from "@/lib/phone";
import { normalizeRole } from "@/lib/rbac";

const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL as string | undefined;
const USER_STORAGE_KEY = "e-pashu-session-user";

function getRequestMeta(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const session = JSON.parse(raw) as { role?: string; email?: string };
    return {
      role: normalizeRole(session.role),
      email: String(session.email || "").trim().toLowerCase(),
    };
  } catch {
    return {};
  }
}


const HEALTH_COLOR_MAP: Record<string, string> = {
  healthy: "hsl(152, 60%, 40%)",
  due: "hsl(45, 90%, 50%)",
  sick: "hsl(45, 90%, 50%)",
  critical: "hsl(0, 72%, 51%)",
};

async function callAppsScript<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  if (!GAS_WEB_APP_URL) {
    throw new Error("Apps Script URL not configured");
  }

  const requestPayload: Record<string, unknown> = {
    ...(payload || {}),
    _meta: getRequestMeta(),
  };

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, payload: requestPayload }),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const result = (await response.json()) as { success: boolean; data?: T; error?: string };
    if (!result.success) {
      throw new Error(result.error || "Unknown Apps Script error");
    }

    return result.data as T;
  } catch (error) {
    console.error("Apps Script API error", { action, error });
    throw error;
  }
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function normalizeAnimalStatus(value: unknown): Animal["status"] {
  const status = String(value ?? "").trim();
  if (status === "Due" || status === "Critical") {
    return status;
  }
  return "Healthy";
}

function normalizeAnimals(input: unknown): Animal[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `ANM-${idx + 1}`),
      breed: String(row.breed ?? "Unknown"),
      age: toNumber(row.age),
      owner: String(row.owner ?? "Unknown"),
      status: normalizeAnimalStatus(row.status),
    };
  });
}

function normalizeLivestockAnimals(input: unknown): LivestockAnimal[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `ANM-${idx + 1}`),
      earTag: String(row.earTag ?? ""),
      qrCode: String(row.qrCode ?? ""),
      taggingDate: String(row.taggingDate ?? ""),
      dataEntryDate: String(row.dataEntryDate ?? ""),
      sireId: String(row.sireId ?? ""),
      damId: String(row.damId ?? ""),
      species: String(row.species ?? "Cattle") as LivestockAnimal["species"],
      breed: String(row.breed ?? "Unknown"),
      gender: String(row.gender ?? "Female") as LivestockAnimal["gender"],
      dob: String(row.dob ?? ""),
      age: toNumber(row.age),
      ageMonths: toNumber(row.ageMonths),
      color: String(row.color ?? ""),
      weight: toNumber(row.weight),
      milkingStatus: String(row.milkingStatus ?? "Not Applicable") as LivestockAnimal["milkingStatus"],
      pregnancyStatus: String(row.pregnancyStatus ?? "Not Applicable") as LivestockAnimal["pregnancyStatus"],
      calvings: toNumber(row.calvings),
      vaccinationStatus: String(row.vaccinationStatus ?? "Pending") as LivestockAnimal["vaccinationStatus"],
      diseaseStatus: String(row.diseaseStatus ?? "None") as LivestockAnimal["diseaseStatus"],
      treatmentHistory: String(row.treatmentHistory ?? ""),
      photo: String(row.photo ?? ""),
      ownerName: String(row.ownerName ?? row.owner ?? ""),
      village: String(row.village ?? row.Village ?? row.VILLAGE ?? row.villageName ?? "Unknown"),
      district: String(row.district ?? row.District ?? row.DISTRICT ?? row.region ?? ""),
      tehsil: String(row.tehsil ?? row.Tehsil ?? row.TEHSIL ?? ""),
      block: String(row.block ?? row.Block ?? row.BLOCK ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? row.gramPanchayatName ?? row.GramPanchayat ?? row.GRAMPANCHAYAT ?? ""),
      status: String(row.status ?? "Healthy") as LivestockAnimal["status"],
      notes: String(row.notes ?? ""),
      productionData: String(row.productionData ?? ""),
    };
  });
}

function normalizeFarmerRecords(input: unknown): FarmerRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `FMR-${idx + 1}`),
      name: String(row.name ?? ""),
      mobile: String(row.mobile ?? row.phone ?? ""),
      aadhaar: String(row.aadhaar ?? ""),
      accountNumber: String(row.accountNumber ?? ""),
      rationCard: String(row.rationCard ?? ""),
      address: String(row.address ?? ""),
      village: String(row.village ?? "Unknown"),
      totalAnimals: toNumber(row.totalAnimals ?? row.animals),
      loanStatus: String(row.loanStatus ?? "No Loan") as FarmerRecord["loanStatus"],
      insuranceStatus: String(row.insuranceStatus ?? "Not Insured") as FarmerRecord["insuranceStatus"],
      governmentScheme: String(row.governmentScheme ?? ""),
      ownerType: String(row.ownerType ?? "Individual") as FarmerRecord["ownerType"],
      district: String(row.district ?? ""),
      tehsil: String(row.tehsil ?? ""),
      block: String(row.block ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
    };
  });
}

function normalizeVaccinationRecords(input: unknown): VaccinationRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `VAC-${idx + 1}`),
      animalId: String(row.animalId ?? row.tag ?? row.animal_tag ?? row.earTag ?? row.tagId ?? ""),
      vaccineName: String(row.vaccineName ?? row.vaccine ?? row.type ?? ""),
      batchNumber: String(row.batchNumber ?? row.batch ?? ""),
      dueDate: String(row.dueDate ?? row.date ?? ""),
      nextReminder: String(row.nextReminder ?? row.reminderDate ?? ""),
      vaccinatedBy: String(row.vaccinatedBy ?? row.administeredBy ?? ""),
      status: String(row.status ?? "Pending") as VaccinationRecord["status"],
      smsReminder: String(row.smsReminder ?? "false").toLowerCase() === "true",
    };
  });
}

function normalizeBreedingRecords(input: unknown): BreedingRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `BRD-${idx + 1}`),
      animalId: String(row.animalId ?? ""),
      inseminationDate: String(row.inseminationDate ?? row.date ?? ""),
      expectedCalving: String(row.expectedCalving ?? row.expected ?? ""),
      status: String(row.status ?? "Inseminated"),
      notes: String(row.notes ?? ""),
    };
  });
}

function normalizeAlerts(input: unknown): AlertItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const priority = String(row.priority ?? "Medium");
    return {
      id: toNumber(row.id) || idx + 1,
      message: String(row.message ?? "No message"),
      priority: priority === "High" || priority === "Low" ? priority : "Medium",
      type: String(row.type ?? "System"),
      time: String(row.time ?? "Just now"),
    };
  });
}

function normalizeDiseaseTreatmentRecords(input: unknown): DiseaseTreatmentRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const recoveryStatus = String(row.recoveryStatus ?? row.status ?? "Under Treatment");
    return {
      id: String(row.id ?? `DIS-${idx + 1}`),
      animalId: String(row.animalId ?? ""),
      date: String(row.date ?? row.recordDate ?? ""),
      diseaseName: String(row.diseaseName ?? row.condition ?? row.diagnosis ?? "Unknown"),
      symptoms: String(row.symptoms ?? row.notes ?? ""),
      treatment: String(row.treatment ?? ""),
      doctorName: String(row.doctorName ?? "Veterinary Team"),
      medicine: String(row.medicine ?? ""),
      recoveryStatus: recoveryStatus === "Critical" || recoveryStatus === "Recovered" ? recoveryStatus : "Under Treatment",
      isolationStatus: String(row.isolationStatus ?? "Not Required") === "Isolated" ? "Isolated" : "Not Required",
      criticalAlert: String(row.criticalAlert ?? "false").toLowerCase() === "true" || recoveryStatus === "Critical",
      notes: String(row.notes ?? ""),
    };
  });
}

function normalizeLocations(input: unknown): LocationRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? String(idx + 2)),
      district: String(row.district ?? ""),
      tehsil: String(row.tehsil ?? ""),
      block: String(row.block ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
      village: String(row.village ?? ""),
      status: String(row.status ?? "Active"),
    };
  });
}

function normalizeSchemeDataRecords(input: unknown): SchemeDataRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `SCH-${idx + 1}`),
      financialYear: String(row.financialYear ?? ""),
      schemeName: String(row.schemeName ?? ""),
      block: String(row.block ?? ""),
      village: String(row.village ?? ""),
      target: toNumber(row.target),
      approvedCases: toNumber(row.approvedCases),
      distributedUnits: toNumber(row.distributedUnits),
      pendingCases: toNumber(row.pendingCases),
      financialProgressAmount: toNumber(row.financialProgressAmount),
      physicalProgressPercentage: toNumber(row.physicalProgressPercentage),
      remarks: String(row.remarks ?? ""),
      createdAt: String(row.createdAt ?? ""),
      updatedAt: String(row.updatedAt ?? ""),
      createdBy: String(row.createdBy ?? ""),
    };
  });
}

function normalizeSchemeBeneficiaryRecords(input: unknown): SchemeBeneficiaryRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `BEN-${idx + 1}`),
      beneficiaryName: String(row.beneficiaryName ?? ""),
      fatherHusbandName: String(row.fatherHusbandName ?? ""),
      mobileNumber: String(row.mobileNumber ?? ""),
      aadhaarNumber: String(row.aadhaarNumber ?? ""),
      rationCardNumber: String(row.rationCardNumber ?? ""),
      bankAccountNumber: String(row.bankAccountNumber ?? ""),
      ifscCode: String(row.ifscCode ?? ""),
      village: String(row.village ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
      block: String(row.block ?? ""),
      category: String(row.category ?? "General") as SchemeBeneficiaryRecord["category"],
      womenBeneficiary: String(row.womenBeneficiary ?? "No") as SchemeBeneficiaryRecord["womenBeneficiary"],
      pvtg: String(row.pvtg ?? "No") as SchemeBeneficiaryRecord["pvtg"],
      fraBeneficiary: String(row.fraBeneficiary ?? "No") as SchemeBeneficiaryRecord["fraBeneficiary"],
      schemeName: String(row.schemeName ?? ""),
      dateOfApproval: String(row.dateOfApproval ?? ""),
      dateOfDistribution: String(row.dateOfDistribution ?? ""),
      unitsDistributed: toNumber(row.unitsDistributed),
      distributionPhotoUrl: String(row.distributionPhotoUrl ?? ""),
      distributionPhotoFileId: String(row.distributionPhotoFileId ?? ""),
      remarks: String(row.remarks ?? ""),
      createdAt: String(row.createdAt ?? ""),
      updatedAt: String(row.updatedAt ?? ""),
      createdBy: String(row.createdBy ?? ""),
    };
  });
}

function normalizePregnancyRecords(input: unknown): PregnancyRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const status = String(row.status ?? "Inseminated");
    return {
      id: String(row.id ?? `PRG-${idx + 1}`),
      animalId: String(row.animalId ?? ""),
      village: String(row.village ?? "Unknown"),
      inseminationDate: String(row.inseminationDate ?? ""),
      expectedCalving: String(row.expectedCalving ?? ""),
      status:
        status === "Pregnant" || status === "Due Soon" || status === "Delivered"
          ? status
          : "Inseminated",
      lastCheckDate: String(row.lastCheckDate ?? ""),
      notes: String(row.notes ?? ""),
    };
  });
}

function breedingRecordToPregnancyRecord(record: BreedingRecord, idx: number): PregnancyRecord {
  return {
    id: record.id || `BRD-${idx + 1}`,
    animalId: record.animalId,
    village: "Unknown",
    inseminationDate: record.inseminationDate,
    expectedCalving: record.expectedCalving,
    status: record.status === "Pregnant" || record.status === "Due Soon" || record.status === "Delivered" ? record.status : "Inseminated",
    lastCheckDate: "",
    notes: record.notes || "",
  };
}

function normalizeVillageInsights(input: unknown): VillageInsight[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      village: String(row.village ?? "Unknown"),
      totalAnimals: toNumber(row.totalAnimals),
      criticalAnimals: toNumber(row.criticalAnimals),
      pendingVaccinations: toNumber(row.pendingVaccinations),
      pregnantAnimals: toNumber(row.pregnantAnimals),
      vaccinationCoverage: toNumber(row.vaccinationCoverage),
    };
  });
}

function normalizeFarmers(input: unknown): Farmer[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const phone = String(row.phone ?? "");
    const normalizedPhone = toDialableIndianMobile(phone) || phone;

    return {
      name: String(row.name ?? ""),
      phone: normalizedPhone,
      village: String(row.village ?? "Unknown"),
      animals: toNumber(row.animals),
    };
  });
}

function normalizeReminders(input: unknown): ReminderItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const channel = String(row.channel ?? "SMS");
    const status = String(row.status ?? "Pending");
    return {
      id: String(row.id ?? `REM-${idx + 1}`),
      village: String(row.village ?? "Unknown"),
      recipient: String(row.recipient ?? ""),
      channel: channel === "WhatsApp" || channel === "Call" ? channel : "SMS",
      message: String(row.message ?? ""),
      dueDate: String(row.dueDate ?? ""),
      status: status === "Sent" ? "Sent" : "Pending",
      sentAt: String(row.sentAt ?? ""),
    };
  });
}

function normalizePhotoEvidence(input: unknown): GeoTaggedPhotoEvidence[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `PE-${idx + 1}`),
      animalId: String(row.animalId ?? ""),
      tagId: String(row.tagId ?? ""),
      officerName: String(row.officerName ?? row.capturedBy ?? ""),
      village: String(row.village ?? "Unknown"),
      latitude: toNumber(row.latitude ?? row.lat),
      longitude: toNumber(row.longitude ?? row.lng),
      capturedAt: String(row.capturedAt ?? ""),
      module: String(row.module ?? "Vaccination") as GeoTaggedPhotoEvidence["module"],
      caption: String(row.caption ?? ""),
      photoUrl: String(row.photoUrl ?? row.driveFileUrl ?? ""),
      verificationStatus: String(row.verificationStatus ?? "Pending") as GeoTaggedPhotoEvidence["verificationStatus"],
      district: String(row.district ?? ""),
      tehsil: String(row.tehsil ?? ""),
      block: String(row.block ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
      driveFileId: String(row.driveFileId ?? ""),
      driveFileUrl: String(row.driveFileUrl ?? ""),
      fileName: String(row.fileName ?? ""),
      capturedDate: String(row.capturedDate ?? ""),
      capturedTime: String(row.capturedTime ?? ""),
      submittedAt: String(row.submittedAt ?? ""),
    };
  });
}

function normalizeDailyReports(input: unknown): DailyFieldReport[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const villagesVisited = String(row.villagesVisited ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    return {
      id: String(row.id ?? `DFR-${idx + 1}`),
      officerName: String(row.officerName ?? ""),
      reportDate: String(row.reportDate ?? ""),
      villagesVisited,
      animalsVaccinated: toNumber(row.animalsVaccinated),
      diseaseCasesIdentified: toNumber(row.diseaseCasesIdentified),
      pregnantAnimalsChecked: toNumber(row.pregnantAnimalsChecked),
      photosUploaded: toNumber(row.photosUploaded),
      notes: String(row.notes ?? ""),
      status: String(row.status ?? "Submitted") as DailyFieldReport["status"],
      submittedAt: String(row.submittedAt ?? ""),
    };
  });
}

function normalizeEmergencyReports(input: unknown): EmergencyReport[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `ER-${idx + 1}`),
      officerName: String(row.officerName ?? ""),
      village: String(row.village ?? "Unknown"),
      animalId: String(row.animalId ?? ""),
      type: String(row.type ?? "Disease Outbreak") as EmergencyReport["type"],
      priority: String(row.priority ?? "Medium") as EmergencyReport["priority"],
      reportedAt: String(row.reportedAt ?? ""),
      status: String(row.status ?? "Open") as EmergencyReport["status"],
      summary: String(row.summary ?? ""),
      district: String(row.district ?? ""),
      tehsil: String(row.tehsil ?? ""),
      block: String(row.block ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
    };
  });
}

function normalizeUsers(input: unknown): UserDirectoryRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `USR-${idx + 1}`),
      name: String(row.name ?? ""),
      email: String(row.email ?? "").trim().toLowerCase(),
      role: normalizeRole(row.role),
      region: String(row.region ?? ""),
      active: String(row.active ?? "true").toLowerCase() === "true",
      createdAt: String(row.createdAt ?? ""),
      updatedAt: String(row.updatedAt ?? ""),
    };
  });
}

function normalizeFieldOfficers(input: unknown): FieldOfficerRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const assignedVillages = String(row.assignedVillages ?? row.villages ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    return {
      id: String(row.id ?? `FO-${idx + 1}`),
      name: String(row.name ?? ""),
      assignedVillages,
      currentVillage: String(row.currentVillage ?? assignedVillages[0] ?? "Unknown"),
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      lastActive: String(row.lastActive ?? ""),
      visitStatus: String(row.visitStatus ?? "At Office") as FieldOfficerRecord["visitStatus"],
      gpsTracking: String(row.gpsTracking ?? "Offline") as FieldOfficerRecord["gpsTracking"],
      visitReports: toNumber(row.visitReports),
      attendance: String(row.attendance ?? "Present") as FieldOfficerRecord["attendance"],
      district: String(row.district ?? ""),
      tehsil: String(row.tehsil ?? ""),
      block: String(row.block ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
      village: String(row.village ?? currentVillageFallback(assignedVillages, row.currentVillage)),
    };
  });
}

function normalizeSupervisorVerifications(input: unknown): SupervisorVerification[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item, idx) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `SV-${idx + 1}`),
      officerName: String(row.officerName ?? ""),
      village: String(row.village ?? "Unknown"),
      district: String(row.district ?? ""),
      tehsil: String(row.tehsil ?? ""),
      block: String(row.block ?? ""),
      gramPanchayat: String(row.gramPanchayat ?? ""),
      visitVerified: String(row.visitVerified ?? "false").toLowerCase() === "true",
      photoApproved: String(row.photoApproved ?? "false").toLowerCase() === "true",
      reportApproved: String(row.reportApproved ?? "false").toLowerCase() === "true",
      fakeVisitFlag: String(row.fakeVisitFlag ?? "false").toLowerCase() === "true",
    };
  });
}

function currentVillageFallback(assignedVillages: string[], currentVillage: unknown) {
  const village = String(currentVillage ?? "").trim();
  return village || assignedVillages[0] || "Unknown";
}

function normalizeDashboardData(input: DashboardData): DashboardData {
  return {
    vaccinationTrends: (input.vaccinationTrends || []).map((item) => ({
      month: String(item.month ?? ""),
      vaccinations: toNumber(item.vaccinations),
    })),
    healthStatusData: (input.healthStatusData || []).map((item) => {
      const name = String(item.name ?? "Unknown");
      const normalizedKey = name.trim().toLowerCase();
      const fallbackFill = HEALTH_COLOR_MAP[normalizedKey] || "hsl(215, 16%, 47%)";
      const fill = typeof item.fill === "string" ? item.fill : fallbackFill;

      return {
        name,
        value: toNumber(item.value),
        fill,
      };
    }),
    monthlyActivity: (input.monthlyActivity || []).map((item) => ({
      month: String(item.month ?? ""),
      registered: toNumber(item.registered),
      vaccinated: toNumber(item.vaccinated),
      alerts: toNumber(item.alerts),
    })),
    activities: (input.activities || []).map((item) => ({
      action: String(item.action ?? ""),
      detail: String(item.detail ?? ""),
      time: String(item.time ?? ""),
    })),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const raw = await callAppsScript<DashboardData>("dashboard.get");
  return normalizeDashboardData(raw);
}

export async function listAnimals(): Promise<Animal[]> {
  const raw = await callAppsScript<unknown>("animals.list");
  return normalizeAnimals(raw);
}

export async function createAnimal(input: Animal): Promise<Animal> {
  return callAppsScript<Animal>("animals.create", { input });
}

export async function listLivestockAnimals(): Promise<LivestockAnimal[]> {
  const raw = await callAppsScript<unknown>("animals.list");
  return normalizeLivestockAnimals(raw);
}

export async function createLivestockAnimal(input: LivestockAnimal): Promise<LivestockAnimal> {
  const raw = await callAppsScript<unknown>("animals.create", { input });
  return normalizeLivestockAnimals([raw])[0] || input;
}

export async function deleteLivestockAnimal(id: string): Promise<{ id: string; deleted: boolean }> {
  return callAppsScript<{ id: string; deleted: boolean }>("animals.delete", { id });
}

export async function getAnimalProfile(id: string): Promise<AnimalProfileData> {
  return callAppsScript<AnimalProfileData>("animals.profile", { id });
}

export async function listFarmers(): Promise<Farmer[]> {
  const raw = await callAppsScript<unknown>("farmers.list");
  return normalizeFarmers(raw);
}

export async function listFarmerRecords(): Promise<FarmerRecord[]> {
  const raw = await callAppsScript<unknown>("farmers.list");
  return normalizeFarmerRecords(raw);
}

export async function createFarmer(input: Farmer): Promise<Farmer> {
  if (!isValidIndianMobile(input.phone)) {
    throw new Error("Invalid Indian mobile number");
  }

  const payload = { ...input, phone: toDialableIndianMobile(input.phone) };
  const raw = await callAppsScript<unknown>("farmers.create", { input: payload });
  return normalizeFarmers([raw])[0];
}

export async function createFarmerRecord(input: FarmerRecord): Promise<FarmerRecord> {
  if (!isValidIndianMobile(input.mobile)) {
    throw new Error("Invalid Indian mobile number");
  }

  const normalizedInput = {
    ...input,
    mobile: toDialableIndianMobile(input.mobile),
  };

  const raw = await callAppsScript<unknown>("farmers.create", { input: normalizedInput });
  return normalizeFarmerRecords([raw])[0] || input;
}

export async function deleteFarmerRecord(id: string): Promise<{ id: string; deleted: boolean }> {
  return callAppsScript<{ id: string; deleted: boolean }>("farmers.delete", { id });
}

export async function listVaccinations(): Promise<Vaccination[]> {
  const raw = await callAppsScript<unknown>("vaccinations.list");
  return normalizeVaccinationRecords(raw).map((item) => ({
    animalId: item.animalId,
    type: item.vaccineName,
    date: item.dueDate,
    status: item.status as Vaccination["status"],
  }));
}

export async function listVaccinationRecords(): Promise<VaccinationRecord[]> {
  const raw = await callAppsScript<unknown>("vaccinations.list");
  return normalizeVaccinationRecords(raw);
}

export async function markVaccinationDone(animalId: string, type: string): Promise<Vaccination> {
  return callAppsScript<Vaccination>("vaccinations.markDone", { animalId, type });
}

export async function updateVaccinationStatus(
  animalId: string,
  type: string,
  status: Vaccination["status"],
): Promise<Vaccination> {
  return callAppsScript<Vaccination>("vaccinations.updateStatus", { animalId, type, status });
}

export async function updateVaccinationRecordStatus(
  animalId: string,
  vaccineName: string,
  status: VaccinationRecord["status"],
): Promise<VaccinationRecord> {
  const raw = await callAppsScript<unknown>("vaccinations.updateStatus", { animalId, type: vaccineName, status });
  return normalizeVaccinationRecords([raw])[0] || {
    id: `${animalId}-${vaccineName}`,
    animalId,
    vaccineName,
    batchNumber: "",
    dueDate: "",
    nextReminder: "",
    vaccinatedBy: "",
    status,
    smsReminder: false,
  };
}

export async function createVaccinationRecord(input: Omit<VaccinationRecord, "id">): Promise<VaccinationRecord> {
  const raw = await callAppsScript<unknown>("vaccinations.create", { input });
  return normalizeVaccinationRecords([raw])[0] || {
    id: `${input.animalId}-${input.vaccineName}`,
    animalId: input.animalId,
    vaccineName: input.vaccineName,
    batchNumber: input.batchNumber,
    dueDate: input.dueDate,
    nextReminder: input.nextReminder,
    vaccinatedBy: input.vaccinatedBy,
    status: input.status,
    smsReminder: input.smsReminder,
  };
}

export async function listBreedingRecords(): Promise<BreedingRecord[]> {
  const raw = await callAppsScript<unknown>("breeding.list");
  return normalizeBreedingRecords(raw);
}

export async function listLocations(): Promise<LocationRecord[]> {
  const raw = await callAppsScript<unknown>("locations.list");
  return normalizeLocations(raw);
}

export async function createLocation(input: Omit<LocationRecord, "id">): Promise<LocationRecord> {
  const raw = await callAppsScript<unknown>("locations.create", { input });
  return normalizeLocations([raw])[0] || { id: String(Date.now()), ...input };
}

export async function updateLocation(input: LocationRecord): Promise<LocationRecord> {
  const raw = await callAppsScript<unknown>("locations.update", { input });
  return normalizeLocations([raw])[0] || input;
}

export async function deleteLocation(id: string, input?: Partial<LocationRecord>): Promise<{ id: string; deleted: boolean }> {
  return callAppsScript<{ id: string; deleted: boolean }>("locations.delete", { id, input });
}

export async function listSchemeDataRecords(): Promise<SchemeDataRecord[]> {
  const raw = await callAppsScript<unknown>("schemeData.list");
  return normalizeSchemeDataRecords(raw);
}

export async function createSchemeDataRecord(input: Omit<SchemeDataRecord, "id" | "createdAt" | "updatedAt" | "createdBy">): Promise<SchemeDataRecord> {
  const raw = await callAppsScript<unknown>("schemeData.create", { input });
  return normalizeSchemeDataRecords([raw])[0];
}

export async function updateSchemeDataRecord(input: SchemeDataRecord): Promise<SchemeDataRecord> {
  const raw = await callAppsScript<unknown>("schemeData.update", { input });
  return normalizeSchemeDataRecords([raw])[0];
}

export async function deleteSchemeDataRecord(id: string): Promise<{ id: string; deleted: boolean }> {
  return callAppsScript<{ id: string; deleted: boolean }>("schemeData.delete", { id });
}

export async function bulkUpsertSchemeDataRecords(records: Array<Partial<SchemeDataRecord>>): Promise<{ saved: number; records: SchemeDataRecord[] }> {
  const raw = await callAppsScript<{ saved: number; records: unknown }>("schemeData.bulkUpsert", { records });
  return { saved: Number(raw.saved || 0), records: normalizeSchemeDataRecords(raw.records) };
}

export async function listSchemeBeneficiaryRecords(): Promise<SchemeBeneficiaryRecord[]> {
  const raw = await callAppsScript<unknown>("schemeBeneficiaries.list");
  return normalizeSchemeBeneficiaryRecords(raw);
}

export async function createSchemeBeneficiaryRecord(input: Omit<SchemeBeneficiaryRecord, "id" | "createdAt" | "updatedAt" | "createdBy" | "distributionPhotoUrl" | "distributionPhotoFileId"> & { distributionPhotoDataUrl?: string; distributionPhotoFileName?: string }): Promise<SchemeBeneficiaryRecord> {
  const raw = await callAppsScript<unknown>("schemeBeneficiaries.create", { input });
  return normalizeSchemeBeneficiaryRecords([raw])[0];
}

export async function updateSchemeBeneficiaryRecord(input: SchemeBeneficiaryRecord & { distributionPhotoDataUrl?: string; distributionPhotoFileName?: string }): Promise<SchemeBeneficiaryRecord> {
  const raw = await callAppsScript<unknown>("schemeBeneficiaries.update", { input });
  return normalizeSchemeBeneficiaryRecords([raw])[0];
}

export async function deleteSchemeBeneficiaryRecord(id: string): Promise<{ id: string; deleted: boolean }> {
  return callAppsScript<{ id: string; deleted: boolean }>("schemeBeneficiaries.delete", { id });
}

export async function bulkUpsertSchemeBeneficiaryRecords(records: Array<Partial<SchemeBeneficiaryRecord>>): Promise<{ saved: number; records: SchemeBeneficiaryRecord[] }> {
  const raw = await callAppsScript<{ saved: number; records: unknown }>("schemeBeneficiaries.bulkUpsert", { records });
  return { saved: Number(raw.saved || 0), records: normalizeSchemeBeneficiaryRecords(raw.records) };
}

export async function listAlerts(): Promise<AlertItem[]> {
  const raw = await callAppsScript<unknown>("alerts.list");
  return normalizeAlerts(raw);
}

export async function listDiseaseTreatmentRecords(): Promise<DiseaseTreatmentRecord[]> {
  const raw = await callAppsScript<unknown>("healthRecords.list");
  return normalizeDiseaseTreatmentRecords(raw);
}

export async function createDiseaseTreatmentRecord(input: Omit<DiseaseTreatmentRecord, "id">): Promise<DiseaseTreatmentRecord> {
  const raw = await callAppsScript<unknown>("healthRecords.create", { input });
  return normalizeDiseaseTreatmentRecords([raw])[0] || {
    id: `${input.animalId}-${input.date}`,
    animalId: input.animalId,
    date: input.date,
    diseaseName: input.diseaseName,
    symptoms: input.symptoms,
    treatment: input.treatment,
    doctorName: input.doctorName,
    medicine: input.medicine,
    recoveryStatus: input.recoveryStatus,
    isolationStatus: input.isolationStatus,
    criticalAlert: input.criticalAlert,
    notes: input.notes,
  };
}

export async function listFieldOfficerTasks(): Promise<FieldOfficerTask[]> {
  return callAppsScript<FieldOfficerTask[]>("tasks.list");
}

export async function createFieldTask(input: { task: string; village?: string; officerId?: string; status?: string; target?: number; completed?: boolean }) {
  const raw = await callAppsScript<unknown>("tasks.create", { input });
  return normalizeFieldOfficerTask(raw);
}

export async function fetchPhotoDataUrl(driveFileId: string): Promise<string> {
  if (!driveFileId) throw new Error('driveFileId required');
  const data = await callAppsScript<string>('photo.fetch', { input: { id: driveFileId } });
  return data;
}

function normalizeFieldOfficerTask(input: unknown): FieldOfficerTask {
  const row = (input || {}) as Record<string, unknown>;
  const rawCompleted = row.completed ?? 0;
  const completedNumber = typeof rawCompleted === "number" ? Number(rawCompleted) : (String(rawCompleted).toLowerCase() === "true" ? 1 : Number(rawCompleted) || 0);
  return {
    id: Number(row.id || 0),
    task: String(row.task || row.title || ""),
    village: String(row.village || ""),
    // completed stored as count when available, otherwise boolean -> convert to 1/0
    completed: completedNumber,
    officerId: String(row.officerId || ""),
    status: String(row.status || "Open"),
    target: Number(row.target || 0),
  };
}

export async function listFieldOfficers(): Promise<FieldOfficerRecord[]> {
  const [officerRaw, usersRaw] = await Promise.all([
    callAppsScript<unknown>("fieldOfficers.list"),
    callAppsScript<unknown>("users.list").catch(() => [] as unknown),
  ]);

  const officers = normalizeFieldOfficers(officerRaw);
  const users = normalizeUsers(usersRaw).filter((item) => item.role === "field_officer" && item.active);

  if (!users.length) {
    return officers;
  }

  const byName = new Map(officers.map((item) => [item.name.toLowerCase(), item]));
  users.forEach((user) => {
    const key = user.name.toLowerCase();
    if (!byName.has(key)) {
      officers.push({
        id: user.id,
        name: user.name,
        assignedVillages: [],
        currentVillage: "Unknown",
        latitude: 0,
        longitude: 0,
        lastActive: "",
        visitStatus: "At Office",
        gpsTracking: "Offline",
        visitReports: 0,
        attendance: "Present",
        village: "Unknown",
      });
    }
  });

  return officers;
}

export async function listSupervisorVerifications(): Promise<SupervisorVerification[]> {
  const raw = await callAppsScript<unknown>("supervisorVerifications.list");
  return normalizeSupervisorVerifications(raw);
}

export async function toggleFieldOfficerTask(id: number): Promise<FieldOfficerTask> {
  return callAppsScript<FieldOfficerTask>("tasks.toggle", { id });
}

export async function listPregnancyRecords(): Promise<PregnancyRecord[]> {
  const [pregnancyRaw, breedingRaw] = await Promise.all([
    callAppsScript<unknown>("pregnancy.list"),
    callAppsScript<unknown>("breeding.list").catch(() => [] as unknown),
  ]);

  const merged = [...normalizePregnancyRecords(pregnancyRaw), ...normalizeBreedingRecords(breedingRaw).map(breedingRecordToPregnancyRecord)];
  const seen = new Set<string>();

  return merged.filter((record) => {
    const key = `${record.animalId}|${record.inseminationDate}|${record.expectedCalving}|${record.status}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function createPregnancyRecord(input: Omit<PregnancyRecord, "id">): Promise<PregnancyRecord> {
  const raw = await callAppsScript<unknown>("pregnancy.create", { input });
  return normalizePregnancyRecords([raw])[0];
}

export async function updatePregnancyStatus(id: string, status: PregnancyRecord["status"]): Promise<PregnancyRecord> {
  const raw = await callAppsScript<unknown>("pregnancy.updateStatus", { id, status });
  return normalizePregnancyRecords([raw])[0];
}

export async function listVillageInsights(params?: { fromDate?: string; toDate?: string }): Promise<VillageInsight[]> {
  const raw = await callAppsScript<unknown>("analytics.villageInsights", {
    fromDate: params?.fromDate || "",
    toDate: params?.toDate || "",
  });
  return normalizeVillageInsights(raw);
}

export async function listReminders(): Promise<ReminderItem[]> {
  const raw = await callAppsScript<unknown>("reminders.list");
  return normalizeReminders(raw);
}

export async function listUsers(): Promise<UserDirectoryRecord[]> {
  const raw = await callAppsScript<unknown>("users.list");
  return normalizeUsers(raw);
}

export async function lookupUserByEmail(email: string): Promise<UserDirectoryRecord> {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const raw = await callAppsScript<unknown>("users.lookupByEmail", { email: normalizedEmail });
  return normalizeUsers([raw])[0];
}

export async function upsertUser(
  input: Omit<UserDirectoryRecord, "createdAt" | "updatedAt"> & Partial<Pick<UserDirectoryRecord, "createdAt" | "updatedAt">>,
  options?: { actorRole?: string },
): Promise<UserDirectoryRecord> {
  const raw = await callAppsScript<unknown>("users.upsert", { input, actorRole: options?.actorRole });
  return normalizeUsers([raw])[0];
}

export async function deleteUserByEmail(email: string, options?: { actorRole?: string }): Promise<{ email: string; deleted: boolean }> {
  return callAppsScript<{ email: string; deleted: boolean }>("users.delete", { email, actorRole: options?.actorRole });
}

export async function createReminder(input: Omit<ReminderItem, "id" | "status" | "sentAt">): Promise<ReminderItem> {
  const raw = await callAppsScript<unknown>("reminders.create", { input });
  return normalizeReminders([raw])[0];
}

export async function sendReminder(id: string): Promise<ReminderItem> {
  const raw = await callAppsScript<unknown>("reminders.send", { id });
  return normalizeReminders([raw])[0];
}

export async function listPhotoEvidence(): Promise<GeoTaggedPhotoEvidence[]> {
  const raw = await callAppsScript<unknown>("photoEvidence.list");
  return normalizePhotoEvidence(raw);
}

export async function createPhotoEvidence(input: Omit<GeoTaggedPhotoEvidence, "id" | "photoUrl" | "verificationStatus"> & {
  photoDataUrl: string;
  fileName: string;
}): Promise<GeoTaggedPhotoEvidence> {
  const raw = await callAppsScript<unknown>("photoEvidence.create", { input });
  return normalizePhotoEvidence([raw])[0];
}

export async function listDailyFieldReports(): Promise<DailyFieldReport[]> {
  const raw = await callAppsScript<unknown>("dailyReports.list");
  return normalizeDailyReports(raw);
}

export async function createDailyFieldReport(input: Omit<DailyFieldReport, "id" | "submittedAt">): Promise<DailyFieldReport> {
  const raw = await callAppsScript<unknown>("dailyReports.create", { input });
  return normalizeDailyReports([raw])[0];
}

export async function listEmergencyReports(): Promise<EmergencyReport[]> {
  const raw = await callAppsScript<unknown>("emergencies.list");
  return normalizeEmergencyReports(raw);
}

export async function createEmergencyReport(input: Omit<EmergencyReport, "id">): Promise<EmergencyReport> {
  const raw = await callAppsScript<unknown>("emergencies.create", { input });
  return normalizeEmergencyReports([raw])[0];
}
