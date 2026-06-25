export type HealthStatus = "Healthy" | "Due" | "Critical";
export type VaccinationStatus = "Done" | "Pending" | "Overdue";
export type Priority = "High" | "Medium" | "Low";

export interface Animal {
  id: string;
  breed: string;
  age: number;
  owner: string;
  status: HealthStatus;
}

export interface Farmer {
  name: string;
  phone: string;
  village: string;
  animals: number;
}

export interface Vaccination {
  animalId: string;
  type: string;
  date: string;
  status: VaccinationStatus;
}

export interface BreedingRecord {
  animalId: string;
  inseminationDate: string;
  expectedCalving: string;
  status: string;
  id?: string;
  notes?: string;
}

export interface AlertItem {
  id: number;
  message: string;
  priority: Priority;
  type: string;
  time: string;
}

export interface DiseaseTreatmentRecord {
  id: string;
  animalId: string;
  date: string;
  diseaseName: string;
  symptoms: string;
  treatment: string;
  doctorName: string;
  medicine: string;
  recoveryStatus: "Critical" | "Under Treatment" | "Recovered";
  isolationStatus: "Isolated" | "Not Required";
  criticalAlert: boolean;
  notes: string;
}

export interface Activity {
  action: string;
  detail: string;
  time: string;
}

export interface FieldOfficerTask {
  id: number;
  task: string;
  village: string;
  completed: boolean;
  dueDate?: string;
  date?: string;
  officerId?: string;
  status?: string;
  target?: number;
}

export interface VaccinationTrend {
  month: string;
  vaccinations: number;
}

export interface HealthStatusSlice {
  name: string;
  value: number;
  fill: string;
}

export interface MonthlyActivity {
  month: string;
  registered: number;
  vaccinated: number;
  alerts: number;
}

export interface DashboardData {
  vaccinationTrends: VaccinationTrend[];
  healthStatusData: HealthStatusSlice[];
  monthlyActivity: MonthlyActivity[];
  activities: Activity[];
}

export interface AnimalProfileData {
  animal: Animal;
  vaccHistory: Vaccination[];
  breedingHistory: Array<{
    date: string;
    type: string;
    status: string;
    expected: string;
  }>;
  reminders: Array<{
    text: string;
    date: string;
  }>;
  diseaseHistory?: Array<{
    date: string;
    condition: string;
    notes: string;
    status: string;
  }>;
}

export interface PregnancyRecord {
  id: string;
  animalId: string;
  village: string;
  inseminationDate: string;
  expectedCalving: string;
  status: "Inseminated" | "Pregnant" | "Due Soon" | "Delivered";
  lastCheckDate: string;
  notes: string;
}

export interface VillageInsight {
  village: string;
  totalAnimals: number;
  criticalAnimals: number;
  pendingVaccinations: number;
  pregnantAnimals: number;
  vaccinationCoverage: number;
}

export interface LocationRecord {
  id: string;
  district: string;
  tehsil: string;
  block: string;
  gramPanchayat: string;
  village: string;
  status: string;
}

export interface InstituteRecord {
  id: string;
  instituteName: string;
  block: string;
  instituteType: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SchemeDataRecord {
  id: string;
  financialYear: string;
  schemeName: string;
  schemeLevel: "National" | "State" | "District";
  block: string;
  village: string;
  instituteId: string;
  instituteName: string;
  target: number;
  approvedCases: number;
  distributedUnits: number;
  pendingCases: number;
  scCount: number;
  stCount: number;
  obcCount: number;
  generalCount: number;
  otherCount: number;
  totalBeneficiaries: number;
  financialProgressAmount: number;
  physicalProgressPercentage: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SchemeBeneficiaryRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  fatherHusbandName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  rationCardNumber: string;
  gender: "Male" | "Female" | "Other";
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  village: string;
  gramPanchayat: string;
  block: string;
  category: "General" | "OBC" | "SC" | "ST";
  womenBeneficiary: "Yes" | "No";
  pvtg: "Yes" | "No";
  fraBeneficiary: "Yes" | "No";
  schemeName: string;
  status: "Registered" | "Verification Pending" | "Verified" | "Approved" | "Rejected" | "Distributed" | "Completed";
  verificationDate: string;
  verificationOfficer: string;
  verificationRemarks: string;
  dateOfApproval: string;
  dateOfDistribution: string;
  unitsDistributed: number;
  distributionPhotoUrl: string;
  distributionPhotoFileId: string;
  distributionRemarks: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ReminderItem {
  id: string;
  village: string;
  recipient: string;
  channel: "SMS" | "WhatsApp" | "Call";
  message: string;
  dueDate: string;
  status: "Pending" | "Sent";
  sentAt: string;
}

export interface FieldOfficerRecord {
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
  district?: string;
  tehsil?: string;
  block?: string;
  gramPanchayat?: string;
  village?: string;
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

export interface GeoTaggedPhotoEvidence {
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
  district?: string;
  tehsil?: string;
  block?: string;
  gramPanchayat?: string;
  driveFileId?: string;
  driveFileUrl?: string;
  fileName?: string;
  capturedDate?: string;
  capturedTime?: string;
  submittedAt?: string;
}

export interface DailyFieldReport {
  id: string;
  officerName: string;
  reportDate: string;
  villagesVisited: string[];
  animalsVaccinated: number;
  diseaseCasesIdentified: number;
  pregnantAnimalsChecked: number;
  photosUploaded: number;
  notes: string;
  status: "Submitted" | "Draft" | "Verification Pending";
  submittedAt?: string;
}

export interface EmergencyReport {
  id: string;
  officerName: string;
  village: string;
  animalId: string;
  type: "Animal Death" | "Disease Outbreak" | "Emergency Treatment" | "High-risk Village Alert";
  priority: "High" | "Medium";
  reportedAt: string;
  status: "Open" | "Assigned" | "Resolved";
  summary: string;
  district?: string;
  tehsil?: string;
  block?: string;
  gramPanchayat?: string;
}

export interface UserDirectoryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "district_officer" | "veterinary_doctor" | "field_officer" | "block_officer" | "data_entry_operator" | "departmental_officer" | "deputy_director_vet";
  region: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backwards-compatible detailed record types used across pages
export interface PortalSettingsRecord {
  id?: string;
  heroTitle: string;
  heroSubtitle: string;
  overviewLabel: string;
  reportOne: string;
  reportTwo: string;
  reportThree: string;
  updatedAt?: string;
  updatedBy?: string;
}
export interface LivestockAnimal extends Partial<Record<string, unknown>> {
  id: string;
  earTag: string;
  qrCode: string;
  taggingDate?: string;
  dataEntryDate?: string;
  sireId?: string;
  damId?: string;
  species: string;
  breed: string;
  gender: "Female" | "Male";
  dob: string;
  age: number;
  ageMonths?: number;
  color: string;
  weight: number;
  milkingStatus: string;
  pregnancyStatus: string;
  calvings: number;
  vaccinationStatus: string;
  diseaseStatus: string;
  treatmentHistory: string;
  photo: string;
  ownerName: string;
  village: string;
  status: string;
  notes: string;
  productionData: string;
}

export interface FarmerRecord extends Partial<Record<string, unknown>> {
  id: string;
  name: string;
  mobile: string;
  aadhaar?: string;
  accountNumber?: string;
  rationCard?: string;
  address?: string;
  village?: string;
  totalAnimals?: number;
  loanStatus?: string;
  insuranceStatus?: string;
  governmentScheme?: string;
  ownerType?: string;
}

export interface VaccinationRecord {
  id: string;
  animalId: string;
  vaccineName: string;
  batchNumber: string;
  dueDate: string;
  nextReminder: string;
  vaccinatedBy: string;
  status: string;
  smsReminder: boolean;
}

export interface SupervisorVerification {
  id: string;
  officerName: string;
  village: string;
  visitVerified: boolean;
  photoApproved: boolean;
  reportApproved: boolean;
  fakeVisitFlag: boolean;
}

export type CampStatus = "Completed" | "Planned" | "Cancelled";
export type CampType = "Awareness" | "Castration" | "Vaccination" | "Treatment";

export interface AwarenessCamp {
  id: string;
  campDate: string;
  location: string;
  village: string;
  resourcePerson: string;
  topicCovered: string;
  participantsCount: number;
  documentsUrl: string[];
  photosUrl: string[];
  status: CampStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CastrationCamp {
  id: string;
  campDate: string;
  location: string;
  village: string;
  animalsCount: number;
  animalType: string;
  veterinaryOfficer: string;
  remarks: string;
  status: CampStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationCamp {
  id: string;
  campDate: string;
  location: string;
  vaccineName: string;
  animalType: string;
  numberVaccinated: number;
  village: string;
  veterinaryOfficer: string;
  status: CampStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentCamp {
  id: string;
  campDate: string;
  location: string;
  village: string;
  animalsTreated: number;
  animalsDewormed: number;
  diseaseDetails: string;
  medicinesUsed: string[];
  veterinaryOfficer: string;
  status: CampStatus;
  createdAt: string;
  updatedAt: string;
}
