import type { AdministrativeArea } from "@/lib/adminHierarchy";

export type AnimalStatus = "Healthy" | "Critical" | "Treatment" | "Dead" | "Sold";
export type Species = "Cattle" | "Buffalo" | "Sheep" | "Goat" | "Pig" | "Hen" | "Duck";

export interface LivestockAnimal extends Partial<AdministrativeArea> {
  id: string;
  earTag: string;
  qrCode: string;
  species: Species;
  breed: string;
  gender: "Female" | "Male";
  dob: string;
  age: number;
  color: string;
  weight: number;
  milkingStatus: "Milking" | "Dry" | "Not Applicable";
  pregnancyStatus: "Pregnant" | "Open" | "Due Soon" | "Not Applicable";
  calvings: number;
  vaccinationStatus: "Done" | "Pending" | "Overdue";
  diseaseStatus: "None" | "Suspected" | "Confirmed" | "Recovered";
  treatmentHistory: string;
  photo: string;
  ownerName: string;
  village: string;
  status: AnimalStatus;
  notes: string;
  productionData: string;
}

export interface FarmerRecord extends Partial<AdministrativeArea> {
  id: string;
  name: string;
  mobile: string;
  aadhaar: string;
  address: string;
  village: string;
  totalAnimals: number;
  loanStatus: "No Loan" | "Applied" | "Active" | "Closed";
  insuranceStatus: "Insured" | "Not Insured" | "Claim Filed";
  governmentScheme: string;
  ownerType: "Individual" | "SHG" | "Dairy Cooperative" | "Institution";
}

export interface VaccinationRecord {
  id: string;
  animalId: string;
  vaccineName: string;
  batchNumber: string;
  dueDate: string;
  nextReminder: string;
  vaccinatedBy: string;
  status: "Pending" | "Done" | "Overdue";
  smsReminder: boolean;
}

export interface DiseaseRecord {
  id: string;
  animalId: string;
  diseaseName: string;
  symptoms: string;
  treatment: string;
  doctorName: string;
  medicine: string;
  recoveryStatus: "Under Treatment" | "Recovered" | "Critical";
  isolationStatus: "Isolated" | "Not Required";
  criticalAlert: boolean;
  date: string;
}

export interface PregnancyRecordMock {
  id: string;
  animalId: string;
  inseminationDate: string;
  pregnancyCheck: string;
  expectedDelivery: string;
  calfCount: number;
  calfGender: "Female" | "Male" | "Unknown";
  lactationStatus: "Early" | "Peak" | "Late" | "Dry";
  status: "Inseminated" | "Pregnant" | "Due Soon" | "Delivered";
}

export interface FieldOfficerRecord extends Partial<AdministrativeArea> {
  id: string;
  name: string;
  assignedVillages: string[];
  currentVillage: string;
  latitude: number;
  longitude: number;
  lastActive: string;
  visitStatus: "On Visit" | "Travelling" | "At Office" | "Emergency Response";
  gpsTracking: "Live" | "Offline";
  visitReports: number;
  attendance: "Present" | "On Leave";
}

export type FieldTaskStatus = "Pending" | "In Progress" | "Completed" | "Verification Pending";

export interface FieldTaskProgress {
  id: string;
  officerId: string;
  title: string;
  village: string;
  district?: string;
  tehsil?: string;
  block?: string;
  gramPanchayat?: string;
  status: FieldTaskStatus;
  completed: number;
  target: number;
  module: "Vaccination" | "Disease" | "Pregnancy" | "Farmer Visit";
}

export interface GeoTaggedPhotoEvidence extends Partial<AdministrativeArea> {
  id: string;
  animalId: string;
  tagId: string;
  officerName: string;
  village: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  module: "Animal Profile" | "Vaccination" | "Treatment" | "Pregnancy Check" | "Disease Inspection" | "Disease Report" | "Pregnancy Visit" | "Farmer Visit";
  caption: string;
  photoUrl: string;
  verificationStatus: "Approved" | "Pending" | "Flagged";
}

export interface DailyFieldReport {
  id: string;
  officerName: string;
  date: string;
  villagesVisited: string[];
  animalsVaccinated: number;
  diseaseCasesIdentified: number;
  pregnantAnimalsChecked: number;
  photosUploaded: number;
  notes: string;
  status: "Submitted" | "Draft" | "Verification Pending";
}

export interface SupervisorVerification {
  id: string;
  officerName: string;
  village: string;
  district?: string;
  tehsil?: string;
  block?: string;
  gramPanchayat?: string;
  visitVerified: boolean;
  photoApproved: boolean;
  reportApproved: boolean;
  fakeVisitFlag: boolean;
}

export interface EmergencyReport extends Partial<AdministrativeArea> {
  id: string;
  officerName: string;
  village: string;
  animalId: string;
  type: "Animal Death" | "Disease Outbreak" | "Emergency Treatment" | "High-risk Village Alert";
  priority: "High" | "Medium";
  reportedAt: string;
  status: "Open" | "Assigned" | "Resolved";
  summary: string;
}

export const animals: LivestockAnimal[] = [
  {
    id: "ANM-001",
    earTag: "ET-RP-1042",
    qrCode: "QR-ANM-001",
    species: "Cattle",
    breed: "Gir",
    gender: "Female",
    dob: "2021-02-14",
    age: 5,
    color: "Reddish Brown",
    weight: 418,
    milkingStatus: "Milking",
    pregnancyStatus: "Pregnant",
    calvings: 2,
    vaccinationStatus: "Done",
    diseaseStatus: "None",
    treatmentHistory: "Routine mineral supplementation",
    photo: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
    ownerName: "Rajesh Kumar",
    village: "Rampur",
    status: "Healthy",
    notes: "High yielding animal under cooperative milk route.",
    productionData: "11.8 L/day average milk yield",
  },
  {
    id: "ANM-007",
    earTag: "ET-RP-1117",
    qrCode: "QR-ANM-007",
    species: "Cattle",
    breed: "Sahiwal",
    gender: "Male",
    dob: "2022-04-10",
    age: 4,
    color: "Red Brown",
    weight: 465,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Done",
    diseaseStatus: "None",
    treatmentHistory: "Routine deworming complete",
    photo: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
    ownerName: "Rajesh Kumar",
    village: "Rampur",
    status: "Healthy",
    notes: "Breeding bull under village livestock register.",
    productionData: "Breeding fitness checked",
  },
  {
    id: "ANM-002",
    earTag: "ET-LP-2208",
    qrCode: "QR-ANM-002",
    species: "Buffalo",
    breed: "Murrah",
    gender: "Female",
    dob: "2020-09-02",
    age: 6,
    color: "Black",
    weight: 502,
    milkingStatus: "Dry",
    pregnancyStatus: "Due Soon",
    calvings: 3,
    vaccinationStatus: "Pending",
    diseaseStatus: "None",
    treatmentHistory: "Deworming completed",
    photo: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80",
    ownerName: "Sita Devi",
    village: "Lakshmipur",
    status: "Healthy",
    notes: "Delivery kit assigned to field officer.",
    productionData: "Dry period, expected lactation next month",
  },
  {
    id: "ANM-008",
    earTag: "ET-LP-2244",
    qrCode: "QR-ANM-008",
    species: "Buffalo",
    breed: "Murrah",
    gender: "Male",
    dob: "2021-08-12",
    age: 5,
    color: "Black",
    weight: 560,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Pending",
    diseaseStatus: "None",
    treatmentHistory: "Mineral mixture advised",
    photo: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80",
    ownerName: "Sita Devi",
    village: "Lakshmipur",
    status: "Healthy",
    notes: "Male buffalo registered for insurance verification.",
    productionData: "Work fitness pending",
  },
  {
    id: "ANM-003",
    earTag: "ET-KN-8831",
    qrCode: "QR-ANM-003",
    species: "Goat",
    breed: "Jamunapari",
    gender: "Female",
    dob: "2023-01-12",
    age: 3,
    color: "White",
    weight: 46,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Open",
    calvings: 1,
    vaccinationStatus: "Overdue",
    diseaseStatus: "Suspected",
    treatmentHistory: "Fever observation, antibiotic course started",
    photo: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80",
    ownerName: "Mohan Singh",
    village: "Krishnanagar",
    status: "Critical",
    notes: "Isolation recommended until follow-up visit.",
    productionData: "Body condition score 2.5/5",
  },
  {
    id: "ANM-009",
    earTag: "ET-KN-8899",
    qrCode: "QR-ANM-009",
    species: "Goat",
    breed: "Barbari",
    gender: "Male",
    dob: "2024-02-15",
    age: 2,
    color: "White Brown",
    weight: 38,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Overdue",
    diseaseStatus: "Suspected",
    treatmentHistory: "Fever observation started",
    photo: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80",
    ownerName: "Mohan Singh",
    village: "Krishnanagar",
    status: "Treatment",
    notes: "Male goat kept under disease watch.",
    productionData: "Body condition score 3/5",
  },
  {
    id: "ANM-004",
    earTag: "ET-GP-4460",
    qrCode: "QR-ANM-004",
    species: "Sheep",
    breed: "Marwari",
    gender: "Female",
    dob: "2022-11-20",
    age: 4,
    color: "Brown",
    weight: 39,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Pregnant",
    calvings: 1,
    vaccinationStatus: "Done",
    diseaseStatus: "Recovered",
    treatmentHistory: "Recovered from foot rot",
    photo: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=800&q=80",
    ownerName: "Priya Sharma",
    village: "Govindpur",
    status: "Treatment",
    notes: "Dressing required every alternate day.",
    productionData: "Wool grading completed",
  },
  {
    id: "ANM-010",
    earTag: "ET-GP-4491",
    qrCode: "QR-ANM-010",
    species: "Sheep",
    breed: "Marwari",
    gender: "Male",
    dob: "2023-05-11",
    age: 3,
    color: "Brown White",
    weight: 44,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Done",
    diseaseStatus: "Recovered",
    treatmentHistory: "Recovered from hoof infection",
    photo: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=800&q=80",
    ownerName: "Priya Sharma",
    village: "Govindpur",
    status: "Healthy",
    notes: "Ram registered for flock health tracking.",
    productionData: "Wool grading pending",
  },
  {
    id: "ANM-005",
    earTag: "ET-RP-5109",
    qrCode: "QR-ANM-005",
    species: "Hen",
    breed: "Kadaknath",
    gender: "Female",
    dob: "2025-03-18",
    age: 1,
    color: "Black",
    weight: 2,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Pending",
    diseaseStatus: "None",
    treatmentHistory: "No treatment record",
    photo: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
    ownerName: "Amit Patel",
    village: "Rampur",
    status: "Healthy",
    notes: "Backyard poultry cluster enrolled.",
    productionData: "5 eggs/week",
  },
  {
    id: "ANM-011",
    earTag: "ET-RP-5110",
    qrCode: "QR-ANM-011",
    species: "Hen",
    breed: "Kadaknath",
    gender: "Male",
    dob: "2025-02-02",
    age: 1,
    color: "Black",
    weight: 3,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Pending",
    diseaseStatus: "None",
    treatmentHistory: "No treatment record",
    photo: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
    ownerName: "Amit Patel",
    village: "Rampur",
    status: "Healthy",
    notes: "Rooster registered under poultry unit.",
    productionData: "Breeding bird",
  },
  {
    id: "ANM-006",
    earTag: "ET-BP-6022",
    qrCode: "QR-ANM-006",
    species: "Pig",
    breed: "Large White Yorkshire",
    gender: "Male",
    dob: "2018-07-09",
    age: 8,
    color: "White",
    weight: 145,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Done",
    diseaseStatus: "None",
    treatmentHistory: "Annual health check complete",
    photo: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
    ownerName: "Kavita Devi",
    village: "Bhavanipur",
    status: "Healthy",
    notes: "Male pig registered under livelihood unit.",
    productionData: "Growth monitoring active",
  },
  {
    id: "ANM-012",
    earTag: "ET-BP-6033",
    qrCode: "QR-ANM-012",
    species: "Pig",
    breed: "Ghungroo",
    gender: "Female",
    dob: "2023-09-22",
    age: 3,
    color: "Black",
    weight: 118,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Open",
    calvings: 1,
    vaccinationStatus: "Done",
    diseaseStatus: "None",
    treatmentHistory: "Deworming complete",
    photo: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80",
    ownerName: "Kavita Devi",
    village: "Bhavanipur",
    status: "Healthy",
    notes: "Female pig registered for breeding follow-up.",
    productionData: "Litter history recorded",
  },
  {
    id: "ANM-013",
    earTag: "ET-GP-7201",
    qrCode: "QR-ANM-013",
    species: "Duck",
    breed: "Khaki Campbell",
    gender: "Female",
    dob: "2025-01-16",
    age: 1,
    color: "Khaki",
    weight: 2,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Pending",
    diseaseStatus: "None",
    treatmentHistory: "No treatment record",
    photo: "https://images.unsplash.com/photo-1563409236302-fc8bbf124e3c?auto=format&fit=crop&w=800&q=80",
    ownerName: "Priya Sharma",
    village: "Govindpur",
    status: "Healthy",
    notes: "Layer duck registered under backyard poultry.",
    productionData: "Egg production started",
  },
  {
    id: "ANM-014",
    earTag: "ET-GP-7202",
    qrCode: "QR-ANM-014",
    species: "Duck",
    breed: "Indian Runner",
    gender: "Male",
    dob: "2025-01-16",
    age: 1,
    color: "White",
    weight: 3,
    milkingStatus: "Not Applicable",
    pregnancyStatus: "Not Applicable",
    calvings: 0,
    vaccinationStatus: "Pending",
    diseaseStatus: "None",
    treatmentHistory: "No treatment record",
    photo: "https://images.unsplash.com/photo-1563409236302-fc8bbf124e3c?auto=format&fit=crop&w=800&q=80",
    ownerName: "Priya Sharma",
    village: "Govindpur",
    status: "Healthy",
    notes: "Drake registered for flock tracking.",
    productionData: "Breeding bird",
  },
];

export const farmers: FarmerRecord[] = [
  { id: "FMR-001", name: "Rajesh Kumar", mobile: "+91 98765 43210", aadhaar: "XXXX-XXXX-4120", address: "Ward 3, Rampur", village: "Rampur", totalAnimals: 12, loanStatus: "Active", insuranceStatus: "Insured", governmentScheme: "Rashtriya Gokul Mission", ownerType: "Dairy Cooperative" },
  { id: "FMR-002", name: "Sita Devi", mobile: "+91 87654 32109", aadhaar: "XXXX-XXXX-8054", address: "Near Panchayat Bhawan", village: "Lakshmipur", totalAnimals: 8, loanStatus: "No Loan", insuranceStatus: "Insured", governmentScheme: "Livestock Insurance Scheme", ownerType: "Individual" },
  { id: "FMR-003", name: "Mohan Singh", mobile: "+91 76543 21098", aadhaar: "XXXX-XXXX-2211", address: "Krishnanagar Tola", village: "Krishnanagar", totalAnimals: 15, loanStatus: "Applied", insuranceStatus: "Claim Filed", governmentScheme: "NLM Entrepreneurship", ownerType: "Individual" },
  { id: "FMR-004", name: "Priya Sharma", mobile: "+91 65432 10987", aadhaar: "XXXX-XXXX-6188", address: "Govindpur Dairy Lane", village: "Govindpur", totalAnimals: 6, loanStatus: "Closed", insuranceStatus: "Not Insured", governmentScheme: "State Dairy Support", ownerType: "SHG" },
  { id: "FMR-005", name: "Amit Patel", mobile: "+91 54321 09876", aadhaar: "XXXX-XXXX-7193", address: "Rampur East", village: "Rampur", totalAnimals: 20, loanStatus: "Active", insuranceStatus: "Insured", governmentScheme: "Poultry Development", ownerType: "Institution" },
];

export const vaccinations: VaccinationRecord[] = [
  { id: "VAC-001", animalId: "ANM-001", vaccineName: "FMD Vaccine", batchNumber: "FMD-26-114", dueDate: "2026-05-28", nextReminder: "2026-05-25", vaccinatedBy: "Dr. Neha Verma", status: "Done", smsReminder: true },
  { id: "VAC-002", animalId: "ANM-002", vaccineName: "HS Vaccine", batchNumber: "HSV-26-088", dueDate: "2026-05-30", nextReminder: "2026-05-27", vaccinatedBy: "Dr. R. Singh", status: "Pending", smsReminder: true },
  { id: "VAC-003", animalId: "ANM-003", vaccineName: "PPR Vaccine", batchNumber: "PPR-26-040", dueDate: "2026-05-10", nextReminder: "2026-05-09", vaccinatedBy: "Field Unit 2", status: "Overdue", smsReminder: true },
  { id: "VAC-004", animalId: "ANM-004", vaccineName: "ET Vaccine", batchNumber: "ETV-26-202", dueDate: "2026-06-02", nextReminder: "2026-05-31", vaccinatedBy: "Dr. Neha Verma", status: "Done", smsReminder: false },
  { id: "VAC-005", animalId: "ANM-005", vaccineName: "Ranikhet", batchNumber: "RDV-26-117", dueDate: "2026-05-24", nextReminder: "2026-05-22", vaccinatedBy: "Poultry Extension Team", status: "Pending", smsReminder: true },
];

export const diseaseRecords: DiseaseRecord[] = [
  { id: "DIS-001", animalId: "ANM-003", diseaseName: "Suspected PPR", symptoms: "Fever, nasal discharge, weakness", treatment: "Isolation, fluids, antibiotic cover", doctorName: "Dr. R. Singh", medicine: "Oxytetracycline, ORS", recoveryStatus: "Critical", isolationStatus: "Isolated", criticalAlert: true, date: "2026-05-21" },
  { id: "DIS-002", animalId: "ANM-004", diseaseName: "Foot Rot", symptoms: "Lameness, hoof lesion", treatment: "Hoof cleaning and dressing", doctorName: "Dr. Neha Verma", medicine: "Povidone iodine, analgesic", recoveryStatus: "Under Treatment", isolationStatus: "Not Required", criticalAlert: false, date: "2026-05-18" },
  { id: "DIS-003", animalId: "ANM-001", diseaseName: "Mineral Deficiency", symptoms: "Reduced yield", treatment: "Mineral mixture", doctorName: "Dr. Farhan Ali", medicine: "Chelated minerals", recoveryStatus: "Recovered", isolationStatus: "Not Required", criticalAlert: false, date: "2026-04-29" },
];

export const pregnancyRecords: PregnancyRecordMock[] = [
  { id: "PRG-001", animalId: "ANM-001", inseminationDate: "2025-12-12", pregnancyCheck: "Positive", expectedDelivery: "2026-09-18", calfCount: 1, calfGender: "Unknown", lactationStatus: "Peak", status: "Pregnant" },
  { id: "PRG-002", animalId: "ANM-002", inseminationDate: "2025-08-22", pregnancyCheck: "Positive", expectedDelivery: "2026-05-29", calfCount: 1, calfGender: "Unknown", lactationStatus: "Dry", status: "Due Soon" },
  { id: "PRG-003", animalId: "ANM-004", inseminationDate: "2026-01-18", pregnancyCheck: "Positive", expectedDelivery: "2026-10-24", calfCount: 2, calfGender: "Unknown", lactationStatus: "Late", status: "Pregnant" },
];

export const alerts = [
  { id: 1, message: "PPR-like symptoms detected in Krishnanagar goat cluster", priority: "High", type: "Disease Outbreak", time: "32 min ago" },
  { id: 2, message: "Ranikhet vaccination due today for Rampur poultry unit", priority: "Medium", type: "Vaccine Due", time: "1 hour ago" },
  { id: 3, message: "Buffalo ANM-002 expected delivery within 7 days", priority: "Medium", type: "Pregnancy Due", time: "3 hours ago" },
  { id: 4, message: "Critical animal ANM-003 requires second visit", priority: "High", type: "Critical Health", time: "5 hours ago" },
  { id: 5, message: "WhatsApp reminder queue ready for 18 farmers", priority: "Low", type: "Notifications", time: "Yesterday" },
];

export const fieldOfficers: FieldOfficerRecord[] = [
  { id: "FO-01", name: "Anil Kumar", assignedVillages: ["Rampur", "Lakshmipur"], currentVillage: "Rampur", latitude: 26.8467, longitude: 80.9462, lastActive: "5 min ago", visitStatus: "On Visit", gpsTracking: "Live", visitReports: 6, attendance: "Present" },
  { id: "FO-02", name: "Meena Joshi", assignedVillages: ["Krishnanagar"], currentVillage: "Krishnanagar", latitude: 26.9124, longitude: 81.0341, lastActive: "12 min ago", visitStatus: "Emergency Response", gpsTracking: "Live", visitReports: 4, attendance: "Present" },
  { id: "FO-03", name: "Rafiq Ansari", assignedVillages: ["Govindpur", "Bhavanipur"], currentVillage: "Govindpur", latitude: 26.7811, longitude: 80.8845, lastActive: "38 min ago", visitStatus: "Travelling", gpsTracking: "Live", visitReports: 3, attendance: "Present" },
];

export const fieldTasks: FieldTaskProgress[] = [
  { id: "FT-001", officerId: "FO-01", title: "Vaccination Camp", village: "Rampur", status: "In Progress", completed: 23, target: 40, module: "Vaccination" },
  { id: "FT-002", officerId: "FO-02", title: "Disease Surveillance", village: "Krishnanagar", status: "Verification Pending", completed: 8, target: 8, module: "Disease" },
  { id: "FT-003", officerId: "FO-03", title: "Pregnancy Follow-up", village: "Govindpur", status: "Pending", completed: 0, target: 12, module: "Pregnancy" },
  { id: "FT-004", officerId: "FO-01", title: "Farmer Household Visits", village: "Lakshmipur", status: "Completed", completed: 16, target: 16, module: "Farmer Visit" },
];

export const photoEvidence: GeoTaggedPhotoEvidence[] = [
  { id: "PE-001", animalId: "ANM-001", tagId: "ET-RP-1042", officerName: "Anil Kumar", village: "Rampur", latitude: 26.8469, longitude: 80.9465, capturedAt: "15 May 2026, 10:18 AM", module: "Vaccination", caption: "Vaccination photo after FMD dose", photoUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80", verificationStatus: "Approved" },
  { id: "PE-002", animalId: "ANM-004", tagId: "ET-GP-4460", officerName: "Rafiq Ansari", village: "Govindpur", latitude: 26.7811, longitude: 80.8845, capturedAt: "18 May 2026, 02:42 PM", module: "Disease Report", caption: "Treatment visit for hoof dressing", photoUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80", verificationStatus: "Pending" },
  { id: "PE-003", animalId: "ANM-003", tagId: "ET-KN-8831", officerName: "Meena Joshi", village: "Krishnanagar", latitude: 26.9124, longitude: 81.0341, capturedAt: "21 May 2026, 04:05 PM", module: "Disease Report", caption: "Isolation evidence for suspected PPR", photoUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80", verificationStatus: "Flagged" },
  { id: "PE-004", animalId: "ANM-002", tagId: "ET-LP-2208", officerName: "Anil Kumar", village: "Lakshmipur", latitude: 26.8562, longitude: 80.9928, capturedAt: "25 May 2026, 09:30 AM", module: "Pregnancy Visit", caption: "Recovery and pre-calving check", photoUrl: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80", verificationStatus: "Approved" },
];

export const dailyFieldReports: DailyFieldReport[] = [
  { id: "DFR-001", officerName: "Anil Kumar", date: "2026-05-22", villagesVisited: ["Rampur", "Lakshmipur"], animalsVaccinated: 23, diseaseCasesIdentified: 0, pregnantAnimalsChecked: 4, photosUploaded: 7, notes: "Rampur camp completed partially. Remaining households scheduled tomorrow.", status: "Submitted" },
  { id: "DFR-002", officerName: "Meena Joshi", date: "2026-05-22", villagesVisited: ["Krishnanagar"], animalsVaccinated: 4, diseaseCasesIdentified: 2, pregnantAnimalsChecked: 1, photosUploaded: 5, notes: "Suspected PPR cluster isolated. Supervisor verification requested.", status: "Verification Pending" },
  { id: "DFR-003", officerName: "Rafiq Ansari", date: "2026-05-22", villagesVisited: ["Govindpur"], animalsVaccinated: 9, diseaseCasesIdentified: 1, pregnantAnimalsChecked: 6, photosUploaded: 4, notes: "Pregnancy follow-up pending for two farmers due to absence.", status: "Draft" },
];

export const supervisorVerifications: SupervisorVerification[] = [
  { id: "SV-001", officerName: "Anil Kumar", village: "Rampur", visitVerified: true, photoApproved: true, reportApproved: true, fakeVisitFlag: false },
  { id: "SV-002", officerName: "Meena Joshi", village: "Krishnanagar", visitVerified: true, photoApproved: false, reportApproved: false, fakeVisitFlag: true },
  { id: "SV-003", officerName: "Rafiq Ansari", village: "Govindpur", visitVerified: false, photoApproved: false, reportApproved: false, fakeVisitFlag: false },
];

export const emergencyReports: EmergencyReport[] = [
  { id: "ER-001", officerName: "Meena Joshi", village: "Krishnanagar", animalId: "ANM-003", type: "Disease Outbreak", priority: "High", reportedAt: "22 May 2026, 11:20 AM", status: "Assigned", summary: "Two goats with fever and nasal discharge in same hamlet." },
  { id: "ER-002", officerName: "Rafiq Ansari", village: "Govindpur", animalId: "ANM-004", type: "Emergency Treatment", priority: "Medium", reportedAt: "22 May 2026, 02:10 PM", status: "Open", summary: "Foot lesion needs dressing material and follow-up." },
];

export const vaccinationTrends = [
  { month: "Dec", vaccinations: 84 },
  { month: "Jan", vaccinations: 112 },
  { month: "Feb", vaccinations: 98 },
  { month: "Mar", vaccinations: 141 },
  { month: "Apr", vaccinations: 126 },
  { month: "May", vaccinations: 158 },
];

export const villageHealthRisk = [
  { village: "Rampur", risk: 22, coverage: 86, pregnant: 7 },
  { village: "Lakshmipur", risk: 18, coverage: 78, pregnant: 5 },
  { village: "Krishnanagar", risk: 64, coverage: 52, pregnant: 2 },
  { village: "Govindpur", risk: 31, coverage: 74, pregnant: 4 },
  { village: "Bhavanipur", risk: 16, coverage: 91, pregnant: 1 },
];

export const activities = [
  { action: "Vaccination Updated", detail: "ANM-001 marked Done for FMD", time: "20 min ago" },
  { action: "Disease Alert", detail: "Critical PPR watch opened in Krishnanagar", time: "32 min ago" },
  { action: "Farmer Registered", detail: "Amit Patel added under Poultry Development", time: "1 hour ago" },
  { action: "Field Visit Verified", detail: "6 geo-tagged reports uploaded from Rampur", time: "2 hours ago" },
  { action: "Pregnancy Due", detail: "ANM-002 moved to delivery watchlist", time: "3 hours ago" },
];
