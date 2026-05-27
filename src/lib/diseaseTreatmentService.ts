import { listDiseaseTreatmentRecords } from "@/lib/dataService";
import type { DiseaseTreatmentRecord } from "@/lib/types";

export interface DiseaseRecordInput {
  animalId: string;
  diseaseName: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medicine: string;
  followUpDate?: string;
  notes?: string;
}

// Placeholder service for future CRUD integration with dedicated disease/treatment tables.
// Current source of truth: HealthRecords sheet via healthRecords.list action.
export async function listDiseaseRecords(): Promise<DiseaseTreatmentRecord[]> {
  return listDiseaseTreatmentRecords();
}

// TODO: wire create/update endpoints after HealthRecords write flow is finalized with domain team.
export async function createDiseaseRecordPlaceholder(_input: DiseaseRecordInput): Promise<never> {
  throw new Error("Pending backend API: healthRecords.create");
}
