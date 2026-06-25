var SHEETS = {
  ANIMALS: "Animals",
  FARMERS: "Farmers",
  LOCATIONS: "Locations",
  VACCINATIONS: "Vaccinations",
  BREEDING: "Breeding",
  PREGNANCY: "Pregnancy",
  ALERTS: "Alerts",
  REMINDERS: "Reminders",
  TASKS: "Tasks",
  FIELD_OFFICERS: "FieldOfficers",
  SUPERVISOR_VERIFICATIONS: "SupervisorVerifications",
  ACTIVITIES: "Activities",
  TRENDS: "VaccinationTrends",
  VACCINATION_TRENDS: "VaccinationTrends",
  HEALTH_STATUS: "HealthStatus",
  HEALTH_RECORDS: "HealthRecords",
  MONTHLY_ACTIVITY: "MonthlyActivity",
  USERS: "Users",
  INSTITUTES: "Institutes",
  SCHEME_DATA: "SchemeData",
  SCHEME_BENEFICIARIES: "SchemeBeneficiaries",
  PORTAL_SETTINGS: "PortalSettings",
  AUDIT_LOGS: "AuditLogs",
  PHOTO_EVIDENCE: "PhotoEvidence",
  DAILY_REPORTS: "DailyFieldReports",
  EMERGENCIES: "EmergencyReports"
};

var DEFAULT_SHEET_HEADERS = {};
DEFAULT_SHEET_HEADERS[SHEETS.ANIMALS] = ["id", "earTag", "qrCode", "taggingDate", "dataEntryDate", "sireId", "damId", "species", "breed", "gender", "dob", "age", "ageMonths", "color", "weight", "milkingStatus", "pregnancyStatus", "calvings", "vaccinationStatus", "diseaseStatus", "treatmentHistory", "photo", "ownerName", "owner", "village", "district", "tehsil", "block", "gramPanchayat", "status", "notes", "productionData"];
DEFAULT_SHEET_HEADERS[SHEETS.FARMERS] = ["id", "name", "mobile", "phone", "aadhaar", "address", "village", "district", "tehsil", "block", "gramPanchayat", "animals", "totalAnimals", "loanStatus", "insuranceStatus", "governmentScheme", "ownerType"];
DEFAULT_SHEET_HEADERS[SHEETS.LOCATIONS] = ["district", "tehsil", "block", "gramPanchayat", "village", "status"];
DEFAULT_SHEET_HEADERS[SHEETS.VACCINATIONS] = ["id", "animalId", "vaccine", "batchNumber", "date", "nextReminder", "status", "administeredBy", "smsReminder", "notes"];
DEFAULT_SHEET_HEADERS[SHEETS.BREEDING] = ["id", "animalId", "inseminationDate", "expectedCalving", "status", "notes"];
DEFAULT_SHEET_HEADERS[SHEETS.PREGNANCY] = ["id", "animalId", "village", "inseminationDate", "expectedCalving", "status", "lastCheckDate", "notes"];
DEFAULT_SHEET_HEADERS[SHEETS.ALERTS] = ["id", "message", "priority", "type", "time"];
DEFAULT_SHEET_HEADERS[SHEETS.REMINDERS] = ["id", "village", "recipient", "channel", "message", "dueDate", "status", "sentAt"];
DEFAULT_SHEET_HEADERS[SHEETS.TASKS] = ["id", "task", "village", "completed", "officerId", "status", "target", "date", "dueDate"];
DEFAULT_SHEET_HEADERS[SHEETS.FIELD_OFFICERS] = ["id", "name", "phone", "village", "role", "assignedVillages", "currentVillage", "latitude", "longitude", "lastActive", "visitStatus", "gpsTracking", "visitReports", "attendance"];
DEFAULT_SHEET_HEADERS[SHEETS.SUPERVISOR_VERIFICATIONS] = ["id", "officerName", "village", "district", "tehsil", "block", "gramPanchayat", "visitVerified", "photoApproved", "reportApproved", "fakeVisitFlag"];
DEFAULT_SHEET_HEADERS[SHEETS.ACTIVITIES] = ["action", "detail", "time"];
DEFAULT_SHEET_HEADERS[SHEETS.TRENDS] = ["month", "vaccinations"];
DEFAULT_SHEET_HEADERS[SHEETS.HEALTH_STATUS] = ["name", "value", "fill"];
DEFAULT_SHEET_HEADERS[SHEETS.HEALTH_RECORDS] = ["id", "animalId", "date", "condition", "diagnosis", "symptoms", "treatment", "doctorName", "medicine", "recoveryStatus", "isolationStatus", "criticalAlert", "notes", "status", "recordDate"];
DEFAULT_SHEET_HEADERS[SHEETS.MONTHLY_ACTIVITY] = ["month", "registered", "vaccinated", "alerts"];
DEFAULT_SHEET_HEADERS[SHEETS.USERS] = ["id", "name", "email", "role", "region", "active", "createdAt", "updatedAt", "resetRequired", "passwordResetAt", "temporaryPassword"];
DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES] = ["id", "instituteName", "block", "instituteType", "status", "createdAt", "updatedAt", "createdBy"];
DEFAULT_SHEET_HEADERS[SHEETS.SCHEME_DATA] = ["id", "financialYear", "schemeName", "block", "village", "instituteId", "instituteName", "target", "approvedCases", "distributedUnits", "pendingCases", "scCount", "stCount", "obcCount", "generalCount", "otherCount", "totalBeneficiaries", "financialProgressAmount", "physicalProgressPercentage", "remarks", "createdAt", "updatedAt", "createdBy"];
DEFAULT_SHEET_HEADERS[SHEETS.SCHEME_BENEFICIARIES] = ["id", "beneficiaryId", "beneficiaryName", "fatherHusbandName", "mobileNumber", "aadhaarNumber", "rationCardNumber", "gender", "accountHolderName", "bankName", "bankAccountNumber", "ifscCode", "village", "gramPanchayat", "block", "category", "womenBeneficiary", "pvtg", "fraBeneficiary", "schemeName", "status", "verificationDate", "verificationOfficer", "verificationRemarks", "dateOfApproval", "dateOfDistribution", "unitsDistributed", "distributionPhotoUrl", "distributionPhotoFileId", "distributionRemarks", "remarks", "createdAt", "updatedAt", "createdBy"];
DEFAULT_SHEET_HEADERS[SHEETS.PORTAL_SETTINGS] = ["id", "heroTitle", "heroSubtitle", "overviewLabel", "reportOne", "reportTwo", "reportThree", "updatedAt", "updatedBy"];
DEFAULT_SHEET_HEADERS[SHEETS.AUDIT_LOGS] = ["id", "module", "action", "recordId", "timestamp", "details"];
DEFAULT_SHEET_HEADERS[SHEETS.PHOTO_EVIDENCE] = ["id", "animalId", "tagId", "officerName", "district", "tehsil", "block", "gramPanchayat", "village", "latitude", "longitude", "capturedAt", "capturedDate", "capturedTime", "module", "caption", "photoUrl", "driveFileId", "driveFileUrl", "fileName", "verificationStatus", "submittedAt"];
DEFAULT_SHEET_HEADERS[SHEETS.DAILY_REPORTS] = ["id", "officerName", "reportDate", "villagesVisited", "animalsVaccinated", "diseaseCasesIdentified", "pregnantAnimalsChecked", "photosUploaded", "notes", "status", "submittedAt"];
DEFAULT_SHEET_HEADERS[SHEETS.EMERGENCIES] = ["id", "officerName", "village", "animalId", "type", "priority", "reportedAt", "status", "summary", "district", "tehsil", "block", "gramPanchayat"];

var DEFAULT_SPREADSHEET_ID = "1yLqcwQDfhkB33TLxppcFlmYRIhvmxKqCBlm_jpDQVqI";
var DEFAULT_PHOTO_FOLDER_NAME = "e-pashu-photos";

var ROLE_ACTIONS = {
  admin: ["*"],
  veterinary_doctor: ["*"],
  departmental_officer: ["*"],
  deputy_director_vet: ["*"],
  district_officer: ["*"],
  field_officer: [
    "dashboard.get",
    "locations.list",
    "animals.list",
    "animals.create",
    "animals.delete",
    "animals.profile",
    "farmers.list",
    "farmers.create",
    "farmers.delete",
    "vaccinations.list",
    "vaccinations.create",
    "vaccinations.markDone",
    "vaccinations.updateStatus",
    "breeding.list",
    "pregnancy.list",
    "pregnancy.create",
    "pregnancy.updateStatus",
    "alerts.list",
    "healthRecords.list",
    "healthRecords.create",
    "analytics.villageInsights",
    "reminders.list",
    "reminders.create",
    "reminders.send",
    "institutes.list",
    "schemeData.list",
    "schemeData.create",
    "schemeData.update",
    "schemeData.delete",
    "schemeData.bulkUpsert",
    "schemeBeneficiaries.list",
    "schemeBeneficiaries.create",
    "schemeBeneficiaries.update",
    "schemeBeneficiaries.delete",
    "schemeBeneficiaries.bulkUpsert",
    "photoEvidence.list",
    "photoEvidence.create",
    "dailyReports.list",
    "dailyReports.create",
    "emergencies.list",
    "emergencies.create",
    "tasks.list",
    "tasks.create",
    "tasks.toggle",
    "fieldOfficers.list",
    "supervisorVerifications.list",
    "reports.list",
    "users.lookupByEmail",
    "users.list"
  ]
};
ROLE_ACTIONS.block_officer = ROLE_ACTIONS.field_officer;
ROLE_ACTIONS.data_entry_operator = ROLE_ACTIONS.field_officer;

function getAnimalProfile_(id) {
  if (!id) {
    throw new Error("Animal id is required");
  }

  var animals = listRows_(SHEETS.ANIMALS);
  var animal = animals.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!animal) {
    throw new Error("Animal not found");
  }

  var vaccHistory = [];
  try {
    vaccHistory = listRows_(SHEETS.VACCINATIONS)
      .filter(function (item) {
        return String(item.animalId) === String(id);
      })
      .map(function (item) {
        return {
          date: item.date || item.recordDate || "",
          type: item.vaccine || item.vaccineName || "",
          status: item.status || ""
        };
      });
  } catch (e) {
    vaccHistory = [];
  }

  var breedingHistory = [];
  try {
    breedingHistory = listRows_(SHEETS.BREEDING)
      .filter(function (item) {
        return String(item.animalId) === String(id);
      })
      .map(function (item) {
        return {
          date: item.inseminationDate || item.date || "",
          type: "Breeding",
          status: item.status || "",
          expected: item.expectedCalving || item.expected || ""
        };
      });
  } catch (e) {
    breedingHistory = [];
  }

  var diseaseHistory = [];
  try {
    diseaseHistory = listRows_(SHEETS.HEALTH_RECORDS)
      .filter(function (item) {
        return String(item.animalId) === String(id);
      })
      .map(function (item) {
        return {
          date: item.date || item.recordDate || "",
          condition: item.condition || item.diagnosis || "",
          notes: item.notes || "",
          status: item.status || ""
        };
      });
  } catch (e) {
    // Missing sheet or other errors — fall back to empty history.
    diseaseHistory = [];
  }

  return {
    animal: animal,
    vaccHistory: vaccHistory,
    breedingHistory: breedingHistory,
    reminders: [
      { text: "FMD booster due", date: "2026-06-15" },
      { text: "Annual health check", date: "2026-04-20" }
    ],
    diseaseHistory: diseaseHistory
  };
}

function createFarmer_(input) {
  if (!input || !input.name) {
    throw new Error("Invalid farmer input");
  }

  var normalizedPhone = normalizeIndianMobile_(input.phone || input.mobile);
  if (!isValidIndianMobile_(normalizedPhone)) {
    throw new Error("Invalid Indian mobile number");
  }

  upsertRowById_(SHEETS.FARMERS, {
    id: input.id || ("FMR-" + new Date().getTime()),
    name: input.name,
    mobile: "+91" + normalizedPhone,
    phone: "+91" + normalizedPhone,
    aadhaar: input.aadhaar || "",
    address: input.address || "",
    village: input.village || "",
    district: input.district || "",
    tehsil: input.tehsil || "",
    block: input.block || "",
    gramPanchayat: input.gramPanchayat || "",
    animals: Number(input.animals || input.totalAnimals || 0),
    totalAnimals: Number(input.totalAnimals || input.animals || 0),
    loanStatus: input.loanStatus || "No Loan",
    insuranceStatus: input.insuranceStatus || "Not Insured",
    governmentScheme: input.governmentScheme || "",
    ownerType: input.ownerType || "Individual"
  });

  return {
    id: input.id || ("FMR-" + new Date().getTime()),
    name: input.name,
    phone: "+91" + normalizedPhone,
    village: input.village,
    animals: Number(input.animals || 0)
  };
}

function createAnimal_(input) {
  if (!input || !input.id) {
    throw new Error("Invalid animal input");
  }

  upsertRowById_(SHEETS.ANIMALS, {
    id: input.id,
    earTag: input.earTag || "",
    qrCode: input.qrCode || "",
    taggingDate: input.taggingDate || "",
    dataEntryDate: input.dataEntryDate || formatDate_(new Date()),
    sireId: input.sireId || "",
    damId: input.damId || "",
    species: input.species || "",
    breed: input.breed || "",
    gender: input.gender || "Female",
    dob: input.dob || "",
    age: Number(input.age || 0),
    ageMonths: Number(input.ageMonths || 0),
    color: input.color || "",
    weight: Number(input.weight || 0),
    milkingStatus: input.milkingStatus || "Not Applicable",
    pregnancyStatus: input.pregnancyStatus || "Not Applicable",
    calvings: Number(input.calvings || 0),
    vaccinationStatus: input.vaccinationStatus || "Pending",
    diseaseStatus: input.diseaseStatus || "None",
    treatmentHistory: input.treatmentHistory || "",
    photo: input.photo || "",
    ownerName: input.ownerName || input.owner || "",
    owner: input.ownerName || input.owner || "",
    village: input.village || "",
    district: input.district || "",
    tehsil: input.tehsil || "",
    block: input.block || "",
    gramPanchayat: input.gramPanchayat || "",
    status: input.status || "Healthy",
    notes: input.notes || "",
    productionData: input.productionData || ""
  });

  return input;
}

function createPregnancyRecord_(input) {
  if (!input || !input.animalId) {
    throw new Error("Invalid pregnancy input");
  }

  var id = "PRG-" + new Date().getTime();
  var row = {
    id: id,
    animalId: input.animalId,
    village: input.village || "Unknown",
    inseminationDate: input.inseminationDate || "",
    expectedCalving: input.expectedCalving || "",
    status: input.status || "Inseminated",
    lastCheckDate: input.lastCheckDate || "",
    notes: input.notes || ""
  };

  appendRow_(SHEETS.PREGNANCY, row);
  return row;
}

function createVaccinationRecord_(input) {
  if (!input || !input.animalId || !input.vaccineName) {
    throw new Error("Invalid vaccination input");
  }

  var row = {
    id: input.id || ("VAC-" + new Date().getTime()),
    animalId: input.animalId,
    vaccine: input.vaccineName,
    batchNumber: input.batchNumber || "",
    date: input.dueDate || input.date || formatDate_(new Date()),
    nextReminder: input.nextReminder || input.dueDate || input.date || "",
    status: input.status || "Pending",
    administeredBy: input.vaccinatedBy || input.administeredBy || "",
    smsReminder: toBool_(input.smsReminder),
    notes: input.notes || ""
  };

  appendRow_(SHEETS.VACCINATIONS, row);
  return row;
}

function createHealthRecord_(input) {
  if (!input || !input.animalId || !input.diseaseName) {
    throw new Error("Invalid health record input");
  }

  var row = {
    id: input.id || ("DIS-" + new Date().getTime()),
    animalId: input.animalId,
    date: input.date || formatDate_(new Date()),
    condition: input.diseaseName,
    diagnosis: input.diagnosis || input.diseaseName,
    symptoms: input.symptoms || "",
    treatment: input.treatment || "",
    doctorName: input.doctorName || "",
    medicine: input.medicine || "",
    recoveryStatus: input.recoveryStatus || "Under Treatment",
    isolationStatus: input.isolationStatus || "Not Required",
    criticalAlert: input.criticalAlert === true || String(input.recoveryStatus || "").toLowerCase() === "critical",
    notes: input.notes || "",
    status: input.recoveryStatus || "Under Treatment",
    recordDate: input.date || formatDate_(new Date())
  };

  var sheet = getSheet_(SHEETS.HEALTH_RECORDS);
  ensureHeaders_(sheet, Object.keys(row));
  appendRow_(SHEETS.HEALTH_RECORDS, row);

  if (String(input.recoveryStatus || "").toLowerCase() === "critical") {
    updateAnimalStatus_(input.animalId, "Critical");
  } else if (String(input.recoveryStatus || "").toLowerCase() === "recovered") {
    updateAnimalStatus_(input.animalId, "Healthy");
  }

  return row;
}

function updateAnimalStatus_(animalId, newStatus) {
  if (!animalId || !newStatus) {
    return;
  }

  var sheet = getSheet_(SHEETS.ANIMALS);
  if (!sheet) {
    return;
  }

  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return;
  }

  var headers = data[0];
  var idIndex = findColumnIndex_(headers, "id");
  var statusIndex = findColumnIndex_(headers, "status");
  if (idIndex < 0 || statusIndex < 0) {
    return;
  }

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(animalId)) {
      sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
      return;
    }
  }
}

function updatePregnancyStatus_(id, status) {
  if (!id || !status) {
    throw new Error("Missing id or status");
  }

  var sheet = getSheet_(SHEETS.PREGNANCY);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No pregnancy records found");
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var statusIdx = findColumnIndex_(headers, "status");
  var checkIdx = findColumnIndex_(headers, "lastCheckDate");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(status);
      if (checkIdx >= 0) {
        sheet.getRange(i + 1, checkIdx + 1).setValue(formatDate_(new Date()));
      }

      var updated = values[i];
      return {
        id: String(updated[idIdx]),
        animalId: String(updated[findColumnIndex_(headers, "animalId")]),
        village: String(updated[findColumnIndex_(headers, "village")]),
        inseminationDate: String(updated[findColumnIndex_(headers, "inseminationDate")]),
        expectedCalving: String(updated[findColumnIndex_(headers, "expectedCalving")]),
        status: status,
        lastCheckDate: formatDate_(new Date()),
        notes: String(updated[findColumnIndex_(headers, "notes")])
      };
    }
  }

  throw new Error("Pregnancy record not found");
}

function getAlertsWithOutbreaks_() {
  var baseAlerts = listRowsCached_(SHEETS.ALERTS).map(function (row, idx) {
    row.id = Number(row.id) || idx + 1;
    return row;
  });

  var outbreaks = detectOutbreakAlerts_();
  var reminderAlerts = buildReminderDueAlerts_();
  return baseAlerts.concat(outbreaks, reminderAlerts);
}

function buildReminderDueAlerts_() {
  var reminders = listRowsCached_(SHEETS.REMINDERS);
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  return reminders
    .filter(function (item) {
      var status = String(item.status || "").toLowerCase();
      if (status === "sent") {
        return false;
      }

      var due = toDateOnly_(item.dueDate);
      if (!due) {
        return false;
      }

      return due <= today;
    })
    .slice(0, 25)
    .map(function (item, idx) {
      return {
        id: 9500 + idx + 1,
        message: "Reminder due for " + String(item.recipient || "user") + " in " + String(item.village || "Unknown") + ": " + String(item.message || "Pending reminder"),
        priority: "Medium",
        type: "Notifications",
        time: "Reminder queue"
      };
    });
}

function detectOutbreakAlerts_() {
  var animals = listRowsCached_(SHEETS.ANIMALS);
  var farmers = listRowsCached_(SHEETS.FARMERS);

  var farmerVillageMap = {};
  farmers.forEach(function (f) {
    farmerVillageMap[normalizePersonKey_(f.name)] = normalizeVillage_(f.village);
  });

  var criticalByVillage = {};
  animals.forEach(function (a) {
    if (String(a.status) !== "Critical") {
      return;
    }
    var village = farmerVillageMap[normalizePersonKey_(a.owner)] || "Unknown";
    criticalByVillage[village] = (criticalByVillage[village] || 0) + 1;
  });

  var alerts = [];
  var index = 0;
  Object.keys(criticalByVillage).forEach(function (village) {
    var count = criticalByVillage[village];
    if (count >= 2) {
      index += 1;
      alerts.push({
        id: 9000 + index,
        message: "Possible disease cluster in " + village + ": " + count + " critical animals",
        priority: count >= 3 ? "High" : "Medium",
        type: "AI Alert",
        time: "Auto-detected"
      });
    }
  });

  return alerts;
}

function getVillageInsights_(fromDate, toDate) {
  var animals = listRows_(SHEETS.ANIMALS);
  var farmers = listRows_(SHEETS.FARMERS);
  var vaccinations = listRows_(SHEETS.VACCINATIONS);
  var pregnancy = listRows_(SHEETS.PREGNANCY);

  var farmerVillageMap = {};
  farmers.forEach(function (f) {
    var farmerKey = normalizePersonKey_(f.name);
    if (!farmerKey) {
      return;
    }
    farmerVillageMap[farmerKey] = normalizeVillage_(f.village);
  });

  var insightMap = {};

  function resolveVillageFromAnimal_(animal) {
    if (!animal) {
      return "";
    }

    var ownerVillage = farmerVillageMap[normalizePersonKey_(animal.owner)];
    if (ownerVillage && ownerVillage !== "Unknown") {
      return ownerVillage;
    }

    // Backward-compatible fallback in case Animals sheet includes village in some setups.
    var directVillage = normalizeVillage_(animal.village);
    if (directVillage && directVillage !== "Unknown") {
      return directVillage;
    }

    return "";
  }

  function ensureVillage_(village) {
    if (!insightMap[village]) {
      insightMap[village] = {
        village: village,
        totalAnimals: 0,
        criticalAnimals: 0,
        pendingVaccinations: 0,
        pregnantAnimals: 0,
        vaccinationCoverage: 0,
        _vaxDone: 0,
        _vaxTotal: 0
      };
    }
    return insightMap[village];
  }

  var animalVillageMap = {};
  animals.forEach(function (a) {
    var animalId = String(a.id || "").trim();
    if (!animalId) {
      return;
    }

    var village = resolveVillageFromAnimal_(a);
    if (!village) {
      return;
    }

    animalVillageMap[animalId] = village;

    var node = ensureVillage_(village);
    node.totalAnimals += 1;
    if (String(a.status) === "Critical") {
      node.criticalAnimals += 1;
    }
  });

  vaccinations.forEach(function (v) {
    var animalId = String(v.animalId || "").trim();
    if (!animalId || !animalVillageMap[animalId]) {
      return;
    }

    if (!isWithinDateRange_(v.date, fromDate, toDate)) {
      return;
    }

    var village = animalVillageMap[animalId];
    var node = ensureVillage_(village);
    node._vaxTotal += 1;
    if (String(v.status) === "Done") {
      node._vaxDone += 1;
    } else {
      node.pendingVaccinations += 1;
    }
  });

  pregnancy.forEach(function (p) {
    if (!isWithinDateRange_(p.inseminationDate || p.lastCheckDate, fromDate, toDate)) {
      return;
    }

    var villageFromRow = normalizeVillage_(p.village);
    var villageFromAnimal = animalVillageMap[String(p.animalId || "").trim()] || "";
    var village = villageFromRow !== "Unknown" ? villageFromRow : villageFromAnimal;
    if (!village) {
      return;
    }

    var node = ensureVillage_(village);
    var status = String(p.status || "");
    if (status === "Pregnant" || status === "Due Soon") {
      node.pregnantAnimals += 1;
    }
  });

  return Object.keys(insightMap)
    .sort()
    .map(function (village) {
    var node = insightMap[village];
    var coverage = node._vaxTotal ? Math.round((node._vaxDone / node._vaxTotal) * 100) : 0;
    node.vaccinationCoverage = Math.max(0, Math.min(100, coverage));
    delete node._vaxDone;
    delete node._vaxTotal;
    return node;
    });
}

function getReminders_() {
  var manual = listRows_(SHEETS.REMINDERS);
  var auto = buildAutoVaccinationReminders_();
  return manual.concat(auto);
}

function buildAutoVaccinationReminders_() {
  var vaccinations = listRowsCached_(SHEETS.VACCINATIONS);
  var animals = listRowsCached_(SHEETS.ANIMALS);
  var farmers = listRowsCached_(SHEETS.FARMERS);

  var animalOwnerMap = {};
  animals.forEach(function (a) {
    animalOwnerMap[String(a.id)] = String(a.owner || "").trim();
  });

  var farmerVillageMap = {};
  farmers.forEach(function (f) {
    farmerVillageMap[normalizePersonKey_(f.name)] = normalizeVillage_(f.village);
  });

  return vaccinations
    .filter(function (v) {
      return String(v.status) !== "Done";
    })
    .slice(0, 50)
    .map(function (v, idx) {
      var recipient = animalOwnerMap[String(v.animalId)] || "Farmer";
      var village = farmerVillageMap[normalizePersonKey_(recipient)] || "Unknown";
      return {
        id: "AUTO-" + (idx + 1),
        village: village,
        recipient: recipient,
        channel: "SMS",
        message: "Vaccination due: " + String(v.type) + " for " + String(v.animalId),
        dueDate: String(v.date || ""),
        status: "Pending",
        sentAt: ""
      };
    });
}

function createReminder_(input) {
  if (!input || !input.recipient || !input.message) {
    throw new Error("Invalid reminder input");
  }

  var row = {
    id: "REM-" + new Date().getTime(),
    village: input.village || "Unknown",
    recipient: input.recipient,
    channel: input.channel || "SMS",
    message: input.message,
    dueDate: input.dueDate || "",
    status: "Pending",
    sentAt: ""
  };

  appendRow_(SHEETS.REMINDERS, row);
  return row;
}

function sendReminder_(id) {
  var sheet = getSheet_(SHEETS.REMINDERS);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No reminders found");
  }

  var headers = values[0];
  var idIdx = headers.indexOf("id");
  var statusIdx = headers.indexOf("status");
  var sentAtIdx = headers.indexOf("sentAt");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      var sentAt = new Date().toISOString();
      if (statusIdx >= 0) {
        sheet.getRange(i + 1, statusIdx + 1).setValue("Sent");
      }
      if (sentAtIdx >= 0) {
        sheet.getRange(i + 1, sentAtIdx + 1).setValue(sentAt);
      }

      return {
        id: String(values[i][idIdx]),
        village: String(values[i][headers.indexOf("village")]),
        recipient: String(values[i][headers.indexOf("recipient")]),
        channel: String(values[i][headers.indexOf("channel")]),
        message: String(values[i][headers.indexOf("message")]),
        dueDate: String(values[i][headers.indexOf("dueDate")]),
        status: "Sent",
        sentAt: sentAt
      };
    }
  }

  throw new Error("Reminder not found");
}

function markVaccinationDone_(animalId, type) {
  return updateVaccinationStatus_(animalId, type, "Done");
}

function updateVaccinationStatus_(animalId, type, status) {
  var nextStatus = String(status || "").trim();
  if (nextStatus !== "Done" && nextStatus !== "Pending" && nextStatus !== "Overdue") {
    throw new Error("Invalid vaccination status");
  }

  var sheet = getSheet_(SHEETS.VACCINATIONS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var animalIdIdx = findColumnIndex_(headers, "animalId");
  var typeIdx = -1;
  try {
    typeIdx = findColumnIndex_(headers, "type");
  } catch (e) {
    // ignore
  }
  if (typeIdx < 0) {
    try {
      typeIdx = findColumnIndex_(headers, "vaccine");
    } catch (e) {
      // ignore
    }
  }
  if (typeIdx < 0) {
    try {
      typeIdx = findColumnIndex_(headers, "vaccineName");
    } catch (e) {
      // ignore
    }
  }
  if (typeIdx < 0) {
    throw new Error("Missing required column: type or vaccine");
  }
  var statusIdx = findColumnIndex_(headers, "status");

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][animalIdIdx]) === String(animalId) && String(values[i][typeIdx]) === String(type)) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(nextStatus);
      return {
        animalId: animalId,
        type: type,
        date: values[i][findColumnIndex_(headers, "date")],
        status: nextStatus
      };
    }
  }

  throw new Error("Vaccination record not found");
}

function toggleTask_(id) {
  var sheet = getSheet_(SHEETS.TASKS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var completedIdx = findColumnIndex_(headers, "completed");

  for (var i = 1; i < values.length; i++) {
    if (Number(values[i][idIdx]) === Number(id)) {
      var next = !toBool_(values[i][completedIdx]);
      sheet.getRange(i + 1, completedIdx + 1).setValue(next);
      return {
        id: Number(values[i][idIdx]),
        task: values[i][findColumnIndex_(headers, "task")],
        village: values[i][findColumnIndex_(headers, "village")],
        completed: next
      };
    }
  }

  throw new Error("Task not found");
}

function listRows_(sheetName) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0];
  return values.slice(1).filter(function (row) {
    return row.some(function (cell) {
      return String(cell || "").trim() !== "";
    });
  }).map(function (row) {
    var item = {};
    headers.forEach(function (header, idx) {
      item[normalizeKey_(header)] = row[idx];
    });
    return item;
  });
}

function listRowsCached_(sheetName) {
  return listRows_(sheetName);
}

function listSchemeDataRows_() {
  return listRows_(SHEETS.SCHEME_DATA).filter(isUsefulSchemeDataRow_);
}

function isUsefulSchemeDataRow_(row) {
  if (!row) {
    return false;
  }

  var schemeName = String(row.schemeName || row.scheme || row.nameOfScheme || row.schemeTitle || "").trim();
  var financialYear = String(row.financialYear || row.year || "").trim();
  var block = String(row.block || row.blockName || "").trim();
  var institute = String(row.instituteName || row.institute || row.village || "").trim();

  return !!(schemeName && financialYear && block && institute);
}

function listLocations_() {
  var sheet = getSheet_(SHEETS.LOCATIONS);
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0];
  return values.slice(1).map(function (row, idx) {
    var item = { id: String(idx + 2) };
    headers.forEach(function (header, colIdx) {
      item[normalizeKey_(header)] = row[colIdx];
    });
    item.status = item.status || "Active";
    return item;
  });
}

function createLocation_(input) {
  if (!input || !input.district || !input.tehsil || !input.block || !input.gramPanchayat || !input.village) {
    throw new Error("Invalid location input");
  }

  var row = {
    district: String(input.district || "").trim(),
    tehsil: String(input.tehsil || "").trim(),
    block: String(input.block || "").trim(),
    gramPanchayat: String(input.gramPanchayat || "").trim(),
    village: String(input.village || "").trim(),
    status: String(input.status || "Active").trim() || "Active"
  };

  appendRowWithHeaders_(SHEETS.LOCATIONS, DEFAULT_SHEET_HEADERS[SHEETS.LOCATIONS], row);
  return { id: String(getSheet_(SHEETS.LOCATIONS).getLastRow()), district: row.district, tehsil: row.tehsil, block: row.block, gramPanchayat: row.gramPanchayat, village: row.village, status: row.status };
}

function updateLocation_(input) {
  if (!input) {
    throw new Error("Invalid location input");
  }

  var sheet = getSheet_(SHEETS.LOCATIONS);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No locations found");
  }

  var targetRow = findLocationRow_(values, input);
  if (targetRow === -1) {
    throw new Error("Location not found");
  }

  var headers = values[0];
  var row = {
    district: String(input.district || values[targetRow - 1][findColumnIndex_(headers, "district")]).trim(),
    tehsil: String(input.tehsil || values[targetRow - 1][findColumnIndex_(headers, "tehsil")]).trim(),
    block: String(input.block || values[targetRow - 1][findColumnIndex_(headers, "block")]).trim(),
    gramPanchayat: String(input.gramPanchayat || values[targetRow - 1][findColumnIndex_(headers, "gramPanchayat")]).trim(),
    village: String(input.village || values[targetRow - 1][findColumnIndex_(headers, "village")]).trim(),
    status: String(input.status || values[targetRow - 1][findColumnIndex_(headers, "status")] || "Active").trim() || "Active"
  };

  sheet.getRange(targetRow, 1, 1, DEFAULT_SHEET_HEADERS[SHEETS.LOCATIONS].length).setValues([[row.district, row.tehsil, row.block, row.gramPanchayat, row.village, row.status]]);
  return { id: String(targetRow), district: row.district, tehsil: row.tehsil, block: row.block, gramPanchayat: row.gramPanchayat, village: row.village, status: row.status };
}

function deleteLocation_(id, input) {
  var sheet = getSheet_(SHEETS.LOCATIONS);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No locations found");
  }

  var targetRow = Number(id || (input && input.id) || 0);
  if (!targetRow || targetRow < 2) {
    targetRow = findLocationRow_(values, input);
  }

  if (!targetRow || targetRow < 2) {
    throw new Error("Location not found");
  }

  sheet.deleteRow(targetRow);
  return { id: String(targetRow), deleted: true };
}

function listInstitutes_() {
  var sheet = getOrCreateSheet_(SHEETS.INSTITUTES, DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES]);
  ensureHeaders_(sheet, DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES]);

  var existing = normalizeInstituteRowsForRead_(listRows_(SHEETS.INSTITUTES));
  var derived = deriveInstitutesFromOperationalData_();
  return mergeInstituteRows_(existing, derived);
}

function normalizeInstituteRowsForRead_(rows) {
  return (rows || []).map(function (row, index) {
    var instituteName = String(row.instituteName || row.name || row.institute || row.village || "").trim();
    var block = canonicalBlockName_(row.block || row.blockName || "");
    if (!instituteName || !block) {
      return null;
    }
    return {
      id: String(row.id || ("INS-" + (index + 1))),
      instituteName: instituteName,
      block: block,
      instituteType: String(row.instituteType || row.type || "").trim(),
      status: String(row.status || "Active").trim() === "Inactive" ? "Inactive" : "Active",
      createdAt: String(row.createdAt || ""),
      updatedAt: String(row.updatedAt || ""),
      createdBy: String(row.createdBy || "")
    };
  }).filter(function (row) {
    return !!row;
  });
}

function mergeInstituteRows_(existing, derived) {
  var byKey = {};
  var output = [];

  function put(row) {
    if (!row) {
      return;
    }
    var instituteName = String(row.instituteName || "").trim();
    var block = canonicalBlockName_(row.block || "");
    if (!instituteName || !block) {
      return;
    }
    var key = normalizeEntityKey_(block) + "|" + normalizeEntityKey_(instituteName);
    if (byKey[key]) {
      return;
    }
    byKey[key] = true;
    output.push(Object.assign({}, row, { instituteName: instituteName, block: block }));
  }

  (existing || []).forEach(put);
  (derived || []).forEach(put);

  return output.sort(function (left, right) {
    return String(left.block).localeCompare(String(right.block)) || String(left.instituteName).localeCompare(String(right.instituteName));
  });
}

function normalizeEntityKey_(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function canonicalBlockName_(value) {
  var raw = String(value || "").trim();
  var key = normalizeEntityKey_(raw);
  if (key === "dantewada") return "Dantewada";
  if (key === "geedam") return "Geedam";
  if (key === "kuakonda" || key === "kuwakonda") return "Kuakonda";
  if (key === "katekalyan" || key === "katekalyanblock" || key === "katekalyan") return "Katekalyan";
  return raw;
}

function deriveInstitutesFromOperationalData_() {
  var now = new Date().toISOString();
  var byKey = {};

  function addInstitute(name, block, type) {
    var instituteName = String(name || "").trim();
    var blockName = canonicalBlockName_(block);
    if (!instituteName || !blockName) {
      return;
    }
    var key = normalizeEntityKey_(blockName) + "|" + normalizeEntityKey_(instituteName);
    if (byKey[key]) {
      return;
    }
    byKey[key] = {
      id: ("DER-" + blockName + "-" + instituteName).toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
      instituteName: instituteName,
      block: blockName,
      instituteType: type,
      status: "Active",
      createdAt: now,
      updatedAt: now,
      createdBy: "derived"
    };
  }

  try {
    listRows_(SHEETS.SCHEME_DATA).forEach(function (row) {
      addInstitute(row.instituteName || row.village || row.institute, row.block, "Derived from Scheme");
    });
  } catch (e) {
    // Ignore missing operational sheet and try beneficiary rows.
  }

  try {
    listRows_(SHEETS.SCHEME_BENEFICIARIES).forEach(function (row) {
      addInstitute(row.village || row.instituteName || row.institute, row.block, "Derived from Beneficiary");
    });
  } catch (e) {
    // Ignore missing operational sheet.
  }

  return Object.keys(byKey).sort().map(function (key) {
    return byKey[key];
  });
}

function createInstitute_(input, requestMeta) {
  var row = normalizeInstitute_(input || {}, null, requestMeta);
  appendRowWithHeaders_(SHEETS.INSTITUTES, DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES], row);
  return row;
}

function updateInstitute_(input, requestMeta) {
  if (!input || !input.id) {
    throw new Error("Invalid institute input");
  }
  var existing = findRowById_(SHEETS.INSTITUTES, input.id);
  if (!existing) {
    throw new Error("Institute not found");
  }
  var row = normalizeInstitute_(input, existing, requestMeta);
  row.id = String(existing.id || input.id);
  row.createdAt = existing.createdAt || row.createdAt;
  row.createdBy = existing.createdBy || row.createdBy;
  row.updatedAt = new Date().toISOString();
  upsertRowById_(SHEETS.INSTITUTES, row);
  return row;
}

function normalizeInstitute_(input, existing, requestMeta) {
  var name = String(input.instituteName || input.name || (existing && existing.instituteName) || "").trim();
  var block = String(input.block || (existing && existing.block) || "").trim();
  if (!name || !block) {
    throw new Error("Institute name and block are required");
  }
  var status = String(input.status || (existing && existing.status) || "Active").trim();
  return {
    id: String(input.id || (existing && existing.id) || ("INS-" + new Date().getTime())),
    instituteName: name,
    block: block,
    instituteType: String(input.instituteType || (existing && existing.instituteType) || "").trim(),
    status: status === "Inactive" ? "Inactive" : "Active",
    createdAt: String(input.createdAt || (existing && existing.createdAt) || new Date().toISOString()),
    updatedAt: String(input.updatedAt || new Date().toISOString()),
    createdBy: String(input.createdBy || (existing && existing.createdBy) || (requestMeta && requestMeta.email) || "")
  };
}

function seedInstitutesIfEmpty_() {
  var props = PropertiesService.getScriptProperties();
  var seededFlag = props.getProperty("INSTITUTES_SEEDED");

  // If we've already seeded once, do not seed again even if sheet is empty.
  if (seededFlag === "true") {
    return;
  }

  var sheet = getOrCreateSheet_(SHEETS.INSTITUTES, DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES]);
  ensureHeaders_(sheet, DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES]);

  // Only seed when sheet has no data rows beyond headers.
  if (sheet.getLastRow() > 1) {
    // Mark as seeded to avoid future automatic reseed attempts.
    props.setProperty("INSTITUTES_SEEDED", "true");
    return;
  }

  var now = new Date().toISOString();
  var rows = defaultInstitutes_().map(function (item, index) {
    return {
      id: "INS-DNT-" + String(index + 1).padStart(3, "0"),
      instituteName: item.name,
      block: item.block,
      instituteType: item.type,
      status: "Active",
      createdAt: now,
      updatedAt: now,
      createdBy: "system"
    };
  });
  rows.forEach(function (row) {
    appendRowWithHeaders_(SHEETS.INSTITUTES, DEFAULT_SHEET_HEADERS[SHEETS.INSTITUTES], row);
  });

  // Record that seeding has been completed so it won't run again automatically.
  props.setProperty("INSTITUTES_SEEDED", "true");
}

function defaultInstitutes_() {
  return [
    { block: "Dantewada", name: "VH Dantewada", type: "VH" },
    { block: "Dantewada", name: "OLD Bhanshi", type: "OLD" },
    { block: "Dantewada", name: "OLD Bacheli", type: "OLD" },
    { block: "Dantewada", name: "OLD Pondum", type: "OLD" },
    { block: "Dantewada", name: "OLD Metapal", type: "OLD" },
    { block: "Dantewada", name: "AIC Bacheli", type: "AIC" },
    { block: "Dantewada", name: "AISC Dantewada", type: "AISC" },
    { block: "Dantewada", name: "AISC Bhansi", type: "AISC" },
    { block: "Dantewada", name: "AISC Chitaloor", type: "AISC" },
    { block: "Dantewada", name: "AISC Nakulnar", type: "AISC" },
    { block: "Dantewada", name: "AISC Kirandul", type: "AISC" },
    { block: "Geedam", name: "VH Geedam", type: "VH" },
    { block: "Geedam", name: "OLD Karli", type: "OLD" },
    { block: "Geedam", name: "OLD Faraspal", type: "OLD" },
    { block: "Geedam", name: "VH Barsoor", type: "VH" },
    { block: "Geedam", name: "OLD Ronje", type: "OLD" },
    { block: "Geedam", name: "OLD Chhindnaar", type: "OLD" },
    { block: "Geedam", name: "VH Bade Tumnar", type: "VH" },
    { block: "Kuakonda", name: "VH Kirandul", type: "VH" },
    { block: "Kuakonda", name: "VH Kuakonda", type: "VH" },
    { block: "Kuakonda", name: "VH Palnaar", type: "VH" },
    { block: "Katekalyan", name: "VH Katekalyan", type: "VH" },
    { block: "Katekalyan", name: "OLD Bade Gudra", type: "OLD" },
    { block: "Katekalyan", name: "OLD Dhanikarka", type: "OLD" }
  ];
}

function findLocationRow_(values, input) {
  if (!values || values.length < 2 || !input) {
    return -1;
  }

  var headers = values[0];
  var districtIdx = findColumnIndex_(headers, "district");
  var tehsilIdx = findColumnIndex_(headers, "tehsil");
  var blockIdx = findColumnIndex_(headers, "block");
  var gramIdx = findColumnIndex_(headers, "gramPanchayat");
  var villageIdx = findColumnIndex_(headers, "village");

  for (var i = 1; i < values.length; i++) {
    if (
      String(values[i][districtIdx]) === String(input.district || "") &&
      String(values[i][tehsilIdx]) === String(input.tehsil || "") &&
      String(values[i][blockIdx]) === String(input.block || "") &&
      String(values[i][gramIdx]) === String(input.gramPanchayat || "") &&
      String(values[i][villageIdx]) === String(input.village || "")
    ) {
      return i + 1;
    }
  }

  return -1;
}

function appendRow_(sheetName, data) {
  var sheet = getSheet_(sheetName);
  var headers = sheet.getDataRange().getValues()[0];
  var row = headers.map(function (header) {
    var normalized = normalizeKey_(header);
    return data[normalized] !== undefined ? data[normalized] : "";
  });
  sheet.appendRow(row);
}

function upsertRowById_(sheetName, data) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values && values.length ? values[0] : [];
  if (!headers.length) {
    throw new Error("Missing headers for sheet: " + sheetName);
  }

  ensureHeaders_(sheet, Object.keys(data));
  values = sheet.getDataRange().getValues();
  headers = values[0];

  var idIdx = findColumnIndex_(headers, "id");
  var targetRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(data.id)) {
      targetRow = i + 1;
      break;
    }
  }

  var row = headers.map(function (header) {
    var normalized = normalizeKey_(header);
    return data[normalized] !== undefined ? data[normalized] : "";
  });

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function deleteRowById_(sheetName, id) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No rows found in sheet: " + sheetName);
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { id: String(id), deleted: true };
    }
  }

  throw new Error("Row not found: " + id);
}

function findRowById_(sheetName, id) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return null;
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      return rowFromValues_(headers, values[i]);
    }
  }
  return null;
}

function appendRowWithHeaders_(sheetName, headers, data) {
  var sheet = getOrCreateSheet_(sheetName, headers);
  ensureHeaders_(sheet, headers);
  var sheetHeaders = sheet.getDataRange().getValues()[0];
  var row = sheetHeaders.map(function (header) {
    var normalized = normalizeKey_(header);
    return data[normalized] !== undefined ? data[normalized] : "";
  });
  sheet.appendRow(row);
}

function createSchemeDataRecord_(input, requestMeta) {
  var row = normalizeSchemeDataRecord_(input || {}, null, requestMeta);
  appendRowWithHeaders_(SHEETS.SCHEME_DATA, DEFAULT_SHEET_HEADERS[SHEETS.SCHEME_DATA], row);
  return row;
}

function updateSchemeDataRecord_(input, requestMeta) {
  if (!input || !input.id) {
    throw new Error("Invalid scheme data input");
  }

  var sheet = getSheet_(SHEETS.SCHEME_DATA);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("Scheme record not found");
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var existing = null;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(input.id)) {
      existing = rowFromValues_(headers, values[i]);
      break;
    }
  }

  if (!existing) {
    throw new Error("Scheme record not found");
  }

  var row = normalizeSchemeDataRecord_(input, existing, requestMeta);
  row.id = String(existing.id || input.id);
  row.createdAt = existing.createdAt || row.createdAt;
  row.createdBy = existing.createdBy || row.createdBy;
  row.updatedAt = new Date().toISOString();
  upsertRowById_(SHEETS.SCHEME_DATA, row);
  return row;
}

function bulkUpsertSchemeDataRecords_(records, requestMeta) {
  var list = Array.isArray(records) ? records : [];
  if (!list.length) {
    throw new Error("Upload contains no scheme records");
  }

  var saved = 0;
  var resultRows = [];
  list.forEach(function (item) {
    var row = upsertSchemeDataByNaturalKey_(item, requestMeta);
    resultRows.push(row);
    saved += 1;
  });

  return { saved: saved, records: resultRows };
}

function createSchemeBeneficiaryRecord_(input, requestMeta) {
  var row = normalizeSchemeBeneficiaryRecord_(input || {}, null, requestMeta);
  appendRowWithHeaders_(SHEETS.SCHEME_BENEFICIARIES, DEFAULT_SHEET_HEADERS[SHEETS.SCHEME_BENEFICIARIES], row);
  return row;
}

function updateSchemeBeneficiaryRecord_(input, requestMeta) {
  if (!input || !input.id) {
    throw new Error("Invalid beneficiary input");
  }

  var sheet = getSheet_(SHEETS.SCHEME_BENEFICIARIES);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("Beneficiary record not found");
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var existing = null;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(input.id)) {
      existing = rowFromValues_(headers, values[i]);
      break;
    }
  }

  if (!existing) {
    throw new Error("Beneficiary record not found");
  }

  var row = normalizeSchemeBeneficiaryRecord_(input, existing, requestMeta);
  row.id = String(existing.id || input.id);
  row.createdAt = existing.createdAt || row.createdAt;
  row.createdBy = existing.createdBy || row.createdBy;
  row.updatedAt = new Date().toISOString();
  upsertRowById_(SHEETS.SCHEME_BENEFICIARIES, row);
  return row;
}

function bulkUpsertSchemeBeneficiaryRecords_(records, requestMeta) {
  var list = Array.isArray(records) ? records : [];
  if (!list.length) {
    throw new Error("Upload contains no beneficiary records");
  }

  var saved = 0;
  var resultRows = [];
  list.forEach(function (item) {
    var row = upsertSchemeBeneficiaryByNaturalKey_(item, requestMeta);
    resultRows.push(row);
    saved += 1;
  });

  return { saved: saved, records: resultRows };
}

function upsertSchemeDataByNaturalKey_(input, requestMeta) {
  var sheet = getSheet_(SHEETS.SCHEME_DATA);
  var values = sheet.getDataRange().getValues();
  var existing = findSchemeDataRecord_(values, input);
  var row = normalizeSchemeDataRecord_(input || {}, existing, requestMeta);

  if (existing) {
    row.id = String(existing.id || row.id);
    row.createdAt = existing.createdAt || row.createdAt;
    row.createdBy = existing.createdBy || row.createdBy;
    row.updatedAt = new Date().toISOString();
  }

  upsertRowById_(SHEETS.SCHEME_DATA, row);
  return row;
}

function upsertSchemeBeneficiaryByNaturalKey_(input, requestMeta) {
  var sheet = getSheet_(SHEETS.SCHEME_BENEFICIARIES);
  var values = sheet.getDataRange().getValues();
  var existing = findSchemeBeneficiaryRecord_(values, input);
  var row = normalizeSchemeBeneficiaryRecord_(input || {}, existing, requestMeta);

  if (existing) {
    row.id = String(existing.id || row.id);
    row.createdAt = existing.createdAt || row.createdAt;
    row.createdBy = existing.createdBy || row.createdBy;
    row.updatedAt = new Date().toISOString();
  }

  upsertRowById_(SHEETS.SCHEME_BENEFICIARIES, row);
  return row;
}

function normalizeSchemeDataRecord_(input, existing, requestMeta) {
  var financialYear = String(input.financialYear || (existing && existing.financialYear) || "").trim();
  var schemeName = String(input.schemeName || (existing && existing.schemeName) || "").trim();
  var block = String(input.block || (existing && existing.block) || "").trim();
  var village = String(input.village || input.instituteName || (existing && existing.village) || (existing && existing.instituteName) || "").trim();
  var instituteName = String(input.instituteName || input.village || (existing && existing.instituteName) || (existing && existing.village) || "").trim();

  if (!financialYear || !schemeName || !block || !instituteName) {
    throw new Error("Financial year, scheme name, block, and institute name are required");
  }

  var effectiveTarget = toNonNegativeNumber_(input.target !== undefined ? input.target : (existing && existing.target) || 0, "Target must be a non-negative number");
  var effectiveApproved = toNonNegativeNumber_(input.approvedCases !== undefined ? input.approvedCases : input.achievement !== undefined ? input.achievement : (existing && existing.approvedCases) || 0, "Approved cases must be a non-negative number");
  var effectiveDistributed = toNonNegativeNumber_(input.distributedUnits !== undefined ? input.distributedUnits : input.achievement !== undefined ? input.achievement : (existing && existing.distributedUnits) || 0, "Distributed units must be a non-negative number");
  var scCount = toNonNegativeNumber_(input.scCount !== undefined ? input.scCount : (existing && existing.scCount) || 0, "SC count must be a non-negative number");
  var stCount = toNonNegativeNumber_(input.stCount !== undefined ? input.stCount : (existing && existing.stCount) || 0, "ST count must be a non-negative number");
  var obcCount = toNonNegativeNumber_(input.obcCount !== undefined ? input.obcCount : (existing && existing.obcCount) || 0, "OBC count must be a non-negative number");
  var generalCount = toNonNegativeNumber_(input.generalCount !== undefined ? input.generalCount : (existing && existing.generalCount) || 0, "General count must be a non-negative number");
  var otherCount = toNonNegativeNumber_(input.otherCount !== undefined ? input.otherCount : (existing && existing.otherCount) || 0, "Other count must be a non-negative number");
  var totalBeneficiaries = scCount + stCount + obcCount + generalCount + otherCount;
  if (effectiveTarget < effectiveApproved) {
    throw new Error("Target must be greater than or equal to achievement");
  }
  if (effectiveApproved < effectiveDistributed) {
    throw new Error("Achievement values are inconsistent");
  }

  var calculatedPending = Math.max(effectiveApproved - effectiveDistributed, 0);
  var calculatedPhysical = calculatePhysicalProgress_(effectiveTarget, effectiveDistributed);

  if (input.pendingCases !== undefined && toNonNegativeNumber_(input.pendingCases, "Pending cases must be a non-negative number") !== calculatedPending) {
    throw new Error("Pending cases must equal approved cases minus distributed units");
  }
  if (input.physicalProgressPercentage !== undefined && toNonNegativeNumber_(input.physicalProgressPercentage, "Physical progress percentage must be a non-negative number") !== calculatedPhysical) {
    throw new Error("Physical progress percentage must equal distributed units divided by target");
  }

  return {
    id: String(input.id || (existing && existing.id) || ("SCH-" + new Date().getTime())),
    financialYear: financialYear,
    schemeName: schemeName,
    block: block,
    village: village,
    instituteId: String(input.instituteId || (existing && existing.instituteId) || "").trim(),
    instituteName: instituteName,
    target: effectiveTarget,
    approvedCases: effectiveApproved,
    distributedUnits: effectiveDistributed,
    pendingCases: calculatedPending,
    scCount: scCount,
    stCount: stCount,
    obcCount: obcCount,
    generalCount: generalCount,
    otherCount: otherCount,
    totalBeneficiaries: totalBeneficiaries,
    financialProgressAmount: toNonNegativeNumber_(input.financialProgressAmount !== undefined ? input.financialProgressAmount : (existing && existing.financialProgressAmount) || 0, "Financial progress amount must be a non-negative number"),
    physicalProgressPercentage: calculatedPhysical,
    remarks: String(input.remarks || (existing && existing.remarks) || ""),
    createdAt: String(input.createdAt || (existing && existing.createdAt) || new Date().toISOString()),
    updatedAt: String(input.updatedAt || new Date().toISOString()),
    createdBy: String(input.createdBy || (existing && existing.createdBy) || (requestMeta && requestMeta.email) || "")
  };
}

function toNonNegativeNumber_(value, errorMessage) {
  var number = Number(value);
  if (!isFinite(number) || number < 0) {
    throw new Error(errorMessage || "Expected a non-negative number");
  }
  return number;
}

function calculatePhysicalProgress_(target, distributedUnits) {
  var safeTarget = Number(target || 0);
  if (!safeTarget) {
    return 0;
  }
  return Math.round((Number(distributedUnits || 0) / safeTarget) * 100);
}

function normalizeSchemeBeneficiaryRecord_(input, existing, requestMeta) {
  var photo = resolveDistributionPhoto_(input, existing);
  var rowId = String(input.id || (existing && existing.id) || ("BEN-" + new Date().getTime()));
  var status = normalizeBeneficiaryStatus_(input.status || (existing && existing.status) || "Registered");
  var nowDate = formatDate_(new Date());
  var verificationDate = String(input.verificationDate || (existing && existing.verificationDate) || "").trim();
  var approvalDate = String(input.dateOfApproval || (existing && existing.dateOfApproval) || "").trim();
  var distributionDate = String(input.dateOfDistribution || (existing && existing.dateOfDistribution) || "").trim();
  var unitsDistributed = toNonNegativeNumber_(input.unitsDistributed !== undefined ? input.unitsDistributed : (existing && existing.unitsDistributed) || 0, "Distribution quantity must be a non-negative number");

  if ((status === "Verified" || status === "Approved" || status === "Distributed" || status === "Completed") && !verificationDate) {
    verificationDate = nowDate;
  }
  if ((status === "Approved" || status === "Distributed" || status === "Completed") && !approvalDate) {
    approvalDate = nowDate;
  }
  if ((status === "Distributed" || status === "Completed") && !distributionDate) {
    distributionDate = nowDate;
  }

  return {
    id: rowId,
    beneficiaryId: String(input.beneficiaryId || (existing && existing.beneficiaryId) || makeBeneficiaryDisplayId_()),
    beneficiaryName: String(input.beneficiaryName || (existing && existing.beneficiaryName) || "").trim(),
    fatherHusbandName: String(input.fatherHusbandName || (existing && existing.fatherHusbandName) || "").trim(),
    mobileNumber: String(input.mobileNumber || (existing && existing.mobileNumber) || "").trim(),
    aadhaarNumber: String(input.aadhaarNumber || (existing && existing.aadhaarNumber) || "").trim(),
    rationCardNumber: String(input.rationCardNumber !== undefined ? input.rationCardNumber : (existing && existing.rationCardNumber) || "").trim(),
    gender: normalizeGender_(input.gender || (existing && existing.gender) || "Female"),
    accountHolderName: String(input.accountHolderName || (existing && existing.accountHolderName) || input.beneficiaryName || (existing && existing.beneficiaryName) || "").trim(),
    bankName: String(input.bankName !== undefined ? input.bankName : (existing && existing.bankName) || "").trim(),
    bankAccountNumber: String(input.bankAccountNumber !== undefined ? input.bankAccountNumber : (existing && existing.bankAccountNumber) || "").trim(),
    ifscCode: String(input.ifscCode !== undefined ? input.ifscCode : (existing && existing.ifscCode) || "").trim(),
    village: String(input.village || (existing && existing.village) || "").trim(),
    gramPanchayat: String(input.gramPanchayat || (existing && existing.gramPanchayat) || "").trim(),
    block: String(input.block || (existing && existing.block) || "").trim(),
    category: normalizeBeneficiaryCategory_(input.category || (existing && existing.category) || "General"),
    womenBeneficiary: normalizeYesNo_(input.womenBeneficiary || (existing && existing.womenBeneficiary) || "No"),
    pvtg: normalizeYesNo_(input.pvtg || (existing && existing.pvtg) || "No"),
    fraBeneficiary: normalizeYesNo_(input.fraBeneficiary || (existing && existing.fraBeneficiary) || "No"),
    schemeName: String(input.schemeName || (existing && existing.schemeName) || "").trim(),
    status: status,
    verificationDate: verificationDate,
    verificationOfficer: String(input.verificationOfficer || (existing && existing.verificationOfficer) || "").trim(),
    verificationRemarks: String(input.verificationRemarks || (existing && existing.verificationRemarks) || ""),
    dateOfApproval: approvalDate,
    dateOfDistribution: distributionDate,
    unitsDistributed: unitsDistributed,
    distributionPhotoUrl: photo.url,
    distributionPhotoFileId: photo.fileId,
    distributionRemarks: String(input.distributionRemarks || (existing && existing.distributionRemarks) || ""),
    remarks: String(input.remarks || (existing && existing.remarks) || ""),
    createdAt: String(input.createdAt || (existing && existing.createdAt) || new Date().toISOString()),
    updatedAt: String(input.updatedAt || new Date().toISOString()),
    createdBy: String(input.createdBy || (existing && existing.createdBy) || (requestMeta && requestMeta.email) || "")
  };
}

function makeBeneficiaryDisplayId_() {
  return "DNT-BEN-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMddHHmmss");
}

function normalizeGender_(value) {
  var gender = String(value || "Female").trim();
  if (gender === "Male" || gender === "Other") {
    return gender;
  }
  return "Female";
}

function normalizeBeneficiaryStatus_(value) {
  var status = String(value || "Registered").trim();
  var allowed = ["Registered", "Verification Pending", "Verified", "Approved", "Rejected", "Distributed", "Completed"];
  return allowed.indexOf(status) >= 0 ? status : "Registered";
}

function resolveDistributionPhoto_(input, existing) {
  if (input && input.distributionPhotoDataUrl) {
    var image = savePhotoToDrive_(input.distributionPhotoDataUrl, input.distributionPhotoFileName || ("scheme-beneficiary-" + new Date().getTime() + ".jpg"));
    return { url: image.viewUrl || image.url, fileId: image.id };
  }

  if (existing) {
    return {
      url: String(existing.distributionPhotoUrl || ""),
      fileId: String(existing.distributionPhotoFileId || "")
    };
  }

  return { url: "", fileId: "" };
}

function normalizeBeneficiaryCategory_(value) {
  var category = String(value || "General").trim();
  if (category === "OBC" || category === "SC" || category === "ST") {
    return category;
  }
  return "General";
}

function normalizeYesNo_(value) {
  return String(value || "No").trim().toLowerCase() === "yes" ? "Yes" : "No";
}

function findSchemeDataRecord_(values, input) {
  if (!values || values.length < 2 || !input) {
    return null;
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var targetId = String(input.id || "");
  var key = makeSchemeDataKey_(input);

  for (var i = 1; i < values.length; i++) {
    var candidate = rowFromValues_(headers, values[i]);
    if (targetId && String(values[i][idIdx]) === targetId) {
      return candidate;
    }
    if (makeSchemeDataKey_(candidate) === key) {
      return candidate;
    }
  }

  return null;
}

function findSchemeBeneficiaryRecord_(values, input) {
  if (!values || values.length < 2 || !input) {
    return null;
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var targetId = String(input.id || "");
  var key = makeSchemeBeneficiaryKey_(input);

  for (var i = 1; i < values.length; i++) {
    var candidate = rowFromValues_(headers, values[i]);
    if (targetId && String(values[i][idIdx]) === targetId) {
      return candidate;
    }
    if (makeSchemeBeneficiaryKey_(candidate) === key) {
      return candidate;
    }
  }

  return null;
}

function makeSchemeDataKey_(input) {
  var institute = input && (input.instituteName || input.village);
  return [input && input.financialYear, input && input.schemeName, input && input.block, institute].map(function (value) {
    return String(value || "").trim().toLowerCase();
  }).join("|");
}

function makeSchemeBeneficiaryKey_(input) {
  return [input && input.mobileNumber, input && input.aadhaarNumber, input && input.schemeName, input && input.village, input && input.block].map(function (value) {
    return String(value || "").trim().toLowerCase();
  }).join("|");
}

function rowFromValues_(headers, values) {
  var row = {};
  headers.forEach(function (header, idx) {
    row[normalizeKey_(header)] = values[idx];
  });
  return row;
}

function listUsers_() {
  ensureUserColumns_();
  return listRows_(SHEETS.USERS).map(function (user) {
    user.active = toBool_(user.active);
    user.role = normalizeRole_(user.role);
    user.resetRequired = toBool_(user.resetRequired);
    return user;
  });
}

function lookupUserByEmail_(email) {
  var normalizedEmail = normalizeEmail_(email);
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  var users = listUsers_();
  var user = users.find(function (item) {
    return normalizeEmail_(item.email) === normalizedEmail;
  });

  if (!user) {
    throw new Error("No access found for this email");
  }

  if (!toBool_(user.active)) {
    throw new Error("This user is inactive");
  }

  return user;
}

function upsertUser_(input) {
  if (!input || !input.email || !input.name || !input.role) {
    throw new Error("Invalid user input");
  }

  var email = normalizeEmail_(input.email);
  var row = {
    id: input.id || ("USR-" + new Date().getTime()),
    name: input.name,
    email: email,
    role: normalizeRole_(input.role),
    region: input.region || "",
    active: input.active === undefined ? true : toBool_(input.active),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resetRequired: input.resetRequired === undefined ? false : toBool_(input.resetRequired),
    passwordResetAt: input.passwordResetAt || "",
    temporaryPassword: input.temporaryPassword || ""
  };

  var sheet = getSheet_(SHEETS.USERS);
  ensureUserColumns_(sheet);
  var values = sheet.getDataRange().getValues();
  var headers = values && values.length ? values[0] : [];
  var idIdx = findColumnIndex_(headers, "id");
  var emailIdx = findColumnIndex_(headers, "email");
  var targetRow = -1;

  for (var i = 1; i < values.length; i++) {
    var existingEmail = normalizeEmail_(values[i][emailIdx]);
    if (existingEmail === email || String(values[i][idIdx]) === String(row.id)) {
      targetRow = i + 1;
      row.id = String(values[i][idIdx]) || row.id;
      row.createdAt = String(values[i][findColumnIndex_(headers, "createdAt")]) || row.createdAt;
      break;
    }
  }

  appendOrUpdateUserRow_(sheet, headers, row, targetRow);
  return row;
}

function resetUserPassword_(email, input, requestMeta) {
  var normalizedEmail = normalizeEmail_(email || (input && input.email));
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  var sheet = getSheet_(SHEETS.USERS);
  ensureUserColumns_(sheet);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No users found");
  }

  var headers = values[0];
  var emailIdx = findColumnIndex_(headers, "email");
  var targetRow = -1;
  var existing = null;

  for (var i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][emailIdx]) === normalizedEmail) {
      targetRow = i + 1;
      existing = rowFromValues_(headers, values[i]);
      break;
    }
  }

  if (!existing) {
    throw new Error("User not found");
  }

  var temporaryPassword = makeTemporaryPassword_();
  var now = new Date().toISOString();
  var row = {
    id: String(existing.id || (input && input.id) || ("USR-" + new Date().getTime())),
    name: String(existing.name || ""),
    email: normalizedEmail,
    role: normalizeRole_(existing.role),
    region: String(existing.region || ""),
    active: toBool_(existing.active),
    createdAt: String(existing.createdAt || now),
    updatedAt: now,
    resetRequired: true,
    passwordResetAt: now,
    temporaryPassword: temporaryPassword
  };

  appendOrUpdateUserRow_(sheet, headers, row, targetRow);
  return {
    email: normalizedEmail,
    resetRequired: true,
    passwordResetAt: now,
    temporaryPassword: temporaryPassword
  };
}

function assertActionAllowed_(action, requestMeta) {
  if (!action) {
    throw new Error("Action is required");
  }

  if (action === "users.lookupByEmail") {
    return;
  }

  if (action === "portalSettings.get") {
    return;
  }
  // Allow public dashboard reads so the public home page can display live counts without login
  if (action === "dashboard.get") {
    return;
  }
  // Allow read-only scheme/location/institutes analytics publicly for the landing page
  if (
    action === "schemeData.list" ||
    action === "schemeBeneficiaries.list" ||
    action === "locations.list" ||
    action === "analytics.villageInsights" ||
    action === "institutes.list" ||
    action === "public.getLandingData"
  ) {
    return;
  }

  var normalizedRole = getRequesterRole_(requestMeta);
  var allowedActions = ROLE_ACTIONS[normalizedRole] || [];
  if (allowedActions.indexOf("*") >= 0) {
    return;
  }

  if (allowedActions.indexOf(action) === -1) {
    throw new Error("Permission denied for action: " + action + " (role: " + normalizedRole + ")");
  }
}

  function getPortalSettings_() {
    var sheet = getOrCreateSheet_(SHEETS.PORTAL_SETTINGS, DEFAULT_SHEET_HEADERS[SHEETS.PORTAL_SETTINGS]);
    var values = sheet.getDataRange().getValues();
    var defaults = {
      id: "public-home",
      heroTitle: "",
      heroSubtitle: "",
      overviewLabel: "",
      reportOne: "",
      reportTwo: "",
      reportThree: "",
      updatedAt: "",
      updatedBy: ""
    };

    if (!values || values.length < 2) {
      return defaults;
    }

    var headers = values[0];
    var row = values[1];
    var item = {};
    headers.forEach(function (header, idx) {
      item[normalizeKey_(header)] = row[idx];
    });

    return {
      id: String(item.id || defaults.id),
      heroTitle: String(item.heroTitle || defaults.heroTitle),
      heroSubtitle: String(item.heroSubtitle || defaults.heroSubtitle),
      overviewLabel: String(item.overviewLabel || defaults.overviewLabel),
      reportOne: String(item.reportOne || defaults.reportOne),
      reportTwo: String(item.reportTwo || defaults.reportTwo),
      reportThree: String(item.reportThree || defaults.reportThree),
      updatedAt: String(item.updatedAt || defaults.updatedAt),
      updatedBy: String(item.updatedBy || defaults.updatedBy)
    };
  }

  function upsertPortalSettings_(input, requestMeta) {
    if (!input) {
      throw new Error("Invalid portal settings input");
    }

    var row = {
      id: String(input.id || "public-home"),
      heroTitle: String(input.heroTitle || "").trim(),
      heroSubtitle: String(input.heroSubtitle || "").trim(),
      overviewLabel: String(input.overviewLabel || "").trim(),
      reportOne: String(input.reportOne || "").trim(),
      reportTwo: String(input.reportTwo || "").trim(),
      reportThree: String(input.reportThree || "").trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: String((requestMeta && requestMeta.email) || "").trim().toLowerCase()
    };

    var sheet = getOrCreateSheet_(SHEETS.PORTAL_SETTINGS, DEFAULT_SHEET_HEADERS[SHEETS.PORTAL_SETTINGS]);
    sheet.getRange(2, 1, 1, DEFAULT_SHEET_HEADERS[SHEETS.PORTAL_SETTINGS].length).setValues([[row.id, row.heroTitle, row.heroSubtitle, row.overviewLabel, row.reportOne, row.reportTwo, row.reportThree, row.updatedAt, row.updatedBy]]);
    return row;
  }

function getRequesterRole_(requestMeta) {
  var email = normalizeEmail_(requestMeta && requestMeta.email);
  if (!email) {
    throw new Error("Login session is required");
  }

  var users = listUsers_();
  var user = users.find(function (item) {
    return normalizeEmail_(item.email) === email;
  });

  if (!user) {
    throw new Error("No access found for this email");
  }

  if (!toBool_(user.active)) {
    throw new Error("This user is inactive");
  }

  return normalizeRole_(user.role);
}

function normalizeRole_(role) {
  var value = String(role || "field_officer").toLowerCase().trim();
  if (value === "admin") {
    return "admin";
  }
  if (value === "district_officer" || value === "district officer") {
    return "district_officer";
  }
  if (value === "block_officer" || value === "block officer") {
    return "block_officer";
  }
  if (value === "data_entry" || value === "data_entry_operator" || value === "data entry operator") {
    return "data_entry_operator";
  }
  if (value === "veterinary" || value === "veterinary_doctor" || value === "veterinary doctor") {
    return "veterinary_doctor";
  }
  if (value === "departmental_officer" || value === "departmental officer") {
    return "departmental_officer";
  }
  if (value === "deputy_director_vet" || value === "deputy director vet") {
    return "deputy_director_vet";
  }
  if (value === "field_officer" || value === "field officer") {
    return "field_officer";
  }
  return "field_officer";
}

function appendOrUpdateUserRow_(sheet, headers, row, targetRow) {
  var dataRow = headers.map(function (header) {
    var normalized = normalizeKey_(header);
    if (normalized === "active") {
      return row.active ? true : false;
    }
    return row[normalized] !== undefined ? row[normalized] : "";
  });

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, dataRow.length).setValues([dataRow]);
  } else {
    sheet.appendRow(dataRow);
  }
}

function ensureUserColumns_() {
  var sheet = getSheet_(SHEETS.USERS);
  var targetHeaders = ["id", "name", "email", "role", "region", "active", "createdAt", "updatedAt", "resetRequired", "passwordResetAt", "temporaryPassword"];
  var values = sheet.getDataRange().getValues();
  var currentHeaders = values && values.length ? values[0].map(function (header) { return String(header || ""); }) : [];

  if (!currentHeaders.length) {
    sheet.getRange(1, 1, 1, targetHeaders.length).setValues([targetHeaders]);
    return;
  }

  var updated = false;
  targetHeaders.forEach(function (header) {
    if (currentHeaders.indexOf(header) === -1) {
      currentHeaders.push(header);
      updated = true;
    }
  });

  if (updated) {
    sheet.getRange(1, 1, 1, currentHeaders.length).setValues([currentHeaders]);
  }
}

function makeTemporaryPassword_() {
  return Utilities.getUuid().split("-")[0] + "@" + Utilities.getUuid().split("-")[1];
}

function deleteUser_(input) {
  var id = String((input && input.id) || "").trim();
  var email = (input && input.email) || input;
  var normalizedEmail = normalizeEmail_(email);
  if (!id && !normalizedEmail) {
    throw new Error("User id or email is required");
  }

  var sheet = getSheet_(SHEETS.USERS);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No users found");
  }

  var headers = values[0];
  var idIdx = findColumnIndex_(headers, "id");
  var emailIdx = findColumnIndex_(headers, "email");
  for (var i = 1; i < values.length; i++) {
    var rowId = String(values[i][idIdx] || "").trim();
    var rowEmail = normalizeEmail_(values[i][emailIdx]);
    if ((id && rowId === id) || (!id && rowEmail === normalizedEmail)) {
      sheet.deleteRow(i + 1);
      return { id: rowId, email: rowEmail, deleted: true };
    }
  }

  throw new Error("User not found");
}

function deleteUserByEmail_(email) {
  return deleteUser_({ email: email });
}

function createPhotoEvidence_(input) {
  if (!input || !input.animalId || !input.officerName || !input.photoDataUrl) {
    throw new Error("Invalid photo evidence input");
  }

  var capturedAt = input.capturedAt || new Date().toISOString();
  var image = savePhotoToDrive_(input.photoDataUrl, input.fileName || ("photo-" + new Date().getTime() + ".jpg"));
  var row = {
    id: input.id || ("PE-" + new Date().getTime()),
    animalId: input.animalId,
    tagId: input.tagId || "",
    officerName: input.officerName,
    district: input.district || "",
    tehsil: input.tehsil || "",
    block: input.block || "",
    gramPanchayat: input.gramPanchayat || "",
    village: input.village || "",
    latitude: Number(input.latitude || 0),
    longitude: Number(input.longitude || 0),
    capturedAt: capturedAt,
    capturedDate: formatDate_(new Date(capturedAt)),
    capturedTime: Utilities.formatDate(new Date(capturedAt), Session.getScriptTimeZone(), "HH:mm:ss"),
    module: input.module || "Vaccination",
    caption: input.caption || "",
    photoUrl: image.viewUrl || image.url,
    driveFileId: image.id,
    driveFileUrl: image.viewUrl || image.url,
    fileName: image.name,
    verificationStatus: input.verificationStatus || "Pending",
    submittedAt: new Date().toISOString()
  };

  appendRowWithHeaders_(SHEETS.PHOTO_EVIDENCE, [
    "id",
    "animalId",
    "tagId",
    "officerName",
    "district",
    "tehsil",
    "block",
    "gramPanchayat",
    "village",
    "latitude",
    "longitude",
    "capturedAt",
    "capturedDate",
    "capturedTime",
    "module",
    "caption",
    "photoUrl",
    "driveFileId",
    "driveFileUrl",
    "fileName",
    "verificationStatus",
    "submittedAt"
  ], row);

  return row;
}

function createTask_(input) {
  if (!input || !input.task) {
    throw new Error('Invalid task input');
  }

  var id = input.id || ('TSK-' + new Date().getTime());
  var row = {
    id: id,
    task: input.task || '',
    village: input.village || '',
    completed: input.completed ? 'true' : 'false',
    officerId: input.officerId || '',
    status: input.status || 'Open',
    target: input.target || 0,
    date: input.date || '',
    dueDate: input.dueDate || ''
  };

  appendRowWithHeaders_(SHEETS.TASKS, DEFAULT_SHEET_HEADERS[SHEETS.TASKS], row);
  return row;
}

function fetchPhotoDataUrl_(input) {
  if (!input || !input.id) {
    throw new Error('Missing file id');
  }
  var fileId = input.id;
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var mime = blob.getContentType() || 'image/jpeg';
    var base64 = Utilities.base64Encode(blob.getBytes());
    return 'data:' + mime + ';base64,' + base64;
  } catch (e) {
    throw new Error('Unable to read file from Drive: ' + (e && e.message));
  }
}

function createDailyFieldReport_(input) {
  if (!input || !input.officerName || !input.villagesVisited) {
    throw new Error("Invalid daily report input");
  }

  var row = {
    id: input.id || ("DFR-" + new Date().getTime()),
    officerName: input.officerName,
    reportDate: input.reportDate || formatDate_(new Date()),
    villagesVisited: Array.isArray(input.villagesVisited) ? input.villagesVisited.join(", ") : String(input.villagesVisited || ""),
    animalsVaccinated: Number(input.animalsVaccinated || 0),
    diseaseCasesIdentified: Number(input.diseaseCasesIdentified || 0),
    pregnantAnimalsChecked: Number(input.pregnantAnimalsChecked || 0),
    photosUploaded: Number(input.photosUploaded || 0),
    notes: input.notes || "",
    status: input.status || "Submitted",
    submittedAt: new Date().toISOString()
  };

  appendRowWithHeaders_(SHEETS.DAILY_REPORTS, [
    "id",
    "officerName",
    "reportDate",
    "villagesVisited",
    "animalsVaccinated",
    "diseaseCasesIdentified",
    "pregnantAnimalsChecked",
    "photosUploaded",
    "notes",
    "status",
    "submittedAt"
  ], row);

  return row;
}

function createEmergencyReport_(input) {
  if (!input || !input.officerName || !input.village || !input.type) {
    throw new Error("Invalid emergency report input");
  }

  var row = {
    id: input.id || ("ER-" + new Date().getTime()),
    officerName: input.officerName,
    village: input.village,
    animalId: input.animalId || "",
    type: input.type,
    priority: input.priority || "Medium",
    reportedAt: input.reportedAt || new Date().toISOString(),
    status: input.status || "Open",
    summary: input.summary || "",
    district: input.district || "",
    tehsil: input.tehsil || "",
    block: input.block || "",
    gramPanchayat: input.gramPanchayat || ""
  };

  appendRowWithHeaders_(SHEETS.EMERGENCIES, [
    "id",
    "officerName",
    "village",
    "animalId",
    "type",
    "priority",
    "reportedAt",
    "status",
    "summary",
    "district",
    "tehsil",
    "block",
    "gramPanchayat"
  ], row);

  return row;
}

function savePhotoToDrive_(dataUrl, fileName) {
  var match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid photo payload");
  }

  var mimeType = match[1];
  var base64 = match[2];
  var bytes = Utilities.base64Decode(base64);
  var blob = Utilities.newBlob(bytes, mimeType, fileName);
  var folder = getOrCreatePhotoFolder_();
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var viewUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
  return {
    id: file.getId(),
    url: file.getUrl(),
    viewUrl: viewUrl,
    name: file.getName()
  };
}

function getSheet_(sheetName) {
  var spreadsheetId = getSpreadsheetId_();

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in Script Properties");
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    var headers = DEFAULT_SHEET_HEADERS[sheetName] || ["id"];
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }

  // Ensure expected headers exist where we have definitions.
  var desired = DEFAULT_SHEET_HEADERS[sheetName];
  if (desired && desired.length) {
    ensureHeaders_(sheet, desired);
  }

  return sheet;
}

function getSpreadsheetId_() {
  var props = PropertiesService.getScriptProperties();
  var configured = props.getProperty("SPREADSHEET_ID");
  if (configured) {
    return configured;
  }

  try {
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSpreadsheet) {
      props.setProperty("SPREADSHEET_ID", activeSpreadsheet.getId());
      return activeSpreadsheet.getId();
    }
  } catch (e) {
    // Ignore and fall through to the default id below.
  }

  return DEFAULT_SPREADSHEET_ID;
}

function getOrCreateSheet_(sheetName, headers) {
  var spreadsheetId = getSpreadsheetId_();

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in Script Properties");
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function ensureHeaders_(sheet, desiredHeaders) {
  if (!desiredHeaders || !desiredHeaders.length) {
    return;
  }

  var values = sheet.getDataRange().getValues();
  var existing = values && values.length ? values[0].map(function (header) {
    return normalizeKey_(header);
  }) : [];
  var missing = desiredHeaders.filter(function (header) {
    return existing.indexOf(normalizeKey_(header)) === -1;
  });

  if (!missing.length) {
    return;
  }

  var startColumn = sheet.getLastColumn() + 1;
  sheet.getRange(1, startColumn, 1, missing.length).setValues([missing]);
}

function getOrCreatePhotoFolder_() {
  var folderId = PropertiesService.getScriptProperties().getProperty("PHOTO_FOLDER_ID");
  if (folderId) {
    return DriveApp.getFolderById(folderId);
  }

  var folderName = PropertiesService.getScriptProperties().getProperty("PHOTO_FOLDER_NAME") || DEFAULT_PHOTO_FOLDER_NAME;
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  PropertiesService.getScriptProperties().setProperty("PHOTO_FOLDER_ID", folder.getId());
  return folder;
}

function toBool_(value) {
  if (typeof value === "boolean") {
    return value;
  }
  return String(value).toLowerCase() === "true";
}

function normalizeKey_(header) {
  var raw = String(header || "").trim();
  if (!raw) {
    return "";
  }

  if (raw === raw.toUpperCase()) {
    return raw.toLowerCase();
  }

  if (raw.indexOf(" ") >= 0 || raw.indexOf("_") >= 0 || raw.indexOf("-") >= 0) {
    var parts = raw
      .replace(/[_-]+/g, " ")
      .split(/\s+/)
      .filter(function (part) {
        return part;
      })
      .map(function (part) {
        return part.toLowerCase();
      });

    return parts
      .map(function (part, idx) {
        if (idx === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join("");
  }

  return raw.charAt(0).toLowerCase() + raw.slice(1);
}

function findColumnIndex_(headers, key) {
  var normalizedKey = normalizeKey_(key);
  for (var i = 0; i < headers.length; i++) {
    if (normalizeKey_(headers[i]) === normalizedKey) {
      return i;
    }
  }
  throw new Error("Missing required column: " + key);
}

function formatDate_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function normalizePersonKey_(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeVillage_(value) {
  var text = String(value || "").trim();
  if (!text) {
    return "Unknown";
  }

  return text
    .toLowerCase()
    .split(/\s+/)
    .map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function normalizeIndianMobile_(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.indexOf("91") === 0) {
    return digits.slice(2);
  }
  return digits;
}

function isValidIndianMobile_(value) {
  return /^\d{10}$/.test(String(value || ""));
}

function toDateOnly_(value) {
  var text = String(value || "").trim();
  if (!text) {
    return null;
  }

  var match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }

  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  var dt = new Date(year, month - 1, day);
  if (isNaN(dt.getTime())) {
    return null;
  }

  dt.setHours(0, 0, 0, 0);
  return dt;
}

function isWithinDateRange_(value, fromDate, toDate) {
  var rowDate = toDateOnly_(value);
  if (!rowDate) {
    return !fromDate && !toDate;
  }

  var from = toDateOnly_(fromDate);
  var to = toDateOnly_(toDate);
  if (from && rowDate < from) {
    return false;
  }
  if (to && rowDate > to) {
    return false;
  }
  return true;
}

function jsonResponse_(success, data, error) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, data: data, error: error }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonResponse_(true, {
    app: "e-Pashu Dashboard API",
    status: "connected",
    timestamp: new Date().toISOString()
  }, null);
}

function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var action = String(body.action || "");
    var payload = body.payload || {};
    var requestMeta = payload._meta || {};

    assertActionAllowed_(action, requestMeta);

    var data = handleAction_(action, payload, requestMeta);
    return jsonResponse_(true, data, null);
  } catch (error) {
    return jsonResponse_(false, null, String(error && error.message ? error.message : error));
  }
}

function handleAction_(action, payload, requestMeta) {
  payload = payload || {};

  if (action === "public.getLandingData") {
    return getLandingData_();
  }

  if (action === "dashboard.get") {
    return getDashboardData_();
  }

  if (action === "portalSettings.get") {
    return getPortalSettings_();
  }

  if (action === "users.lookupByEmail") {
    return lookupUserByEmail_(payload.email);
  }

  if (action === "users.list") {
    return listUsers_();
  }

  if (action === "users.upsert") {
    return upsertUser_(payload.input || payload);
  }

  if (action === "users.resetPassword") {
    return resetUserPassword_(payload.email, payload.input || payload, requestMeta);
  }

  if (action === "users.delete") {
    return deleteUser_(payload);
  }

  if (action === "institutes.list") {
    return listInstitutes_();
  }

  if (action === "institutes.create") {
    return createInstitute_(payload.input || payload, requestMeta);
  }

  if (action === "institutes.update") {
    return updateInstitute_(payload.input || payload, requestMeta);
  }

  if (action === "institutes.delete") {
    return deleteRowById_(SHEETS.INSTITUTES, payload.id);
  }

  if (action === "schemeData.list") {
    return listSchemeDataRows_();
  }

  if (action === "schemeData.create") {
    return createSchemeDataRecord_(payload.input || payload, requestMeta);
  }

  if (action === "schemeData.update") {
    return updateSchemeDataRecord_(payload.input || payload, requestMeta);
  }

  if (action === "schemeData.bulkUpsert") {
    return bulkUpsertSchemeDataRecords_(payload.records || [], requestMeta);
  }

  if (action === "schemeData.delete") {
    return deleteRowById_(SHEETS.SCHEME_DATA, payload.id);
  }

  if (action === "schemeBeneficiaries.list") {
    return listRows_(SHEETS.SCHEME_BENEFICIARIES);
  }

  if (action === "schemeBeneficiaries.create") {
    return createSchemeBeneficiaryRecord_(payload.input || payload, requestMeta);
  }

  if (action === "schemeBeneficiaries.update") {
    return updateSchemeBeneficiaryRecord_(payload.input || payload, requestMeta);
  }

  if (action === "schemeBeneficiaries.bulkUpsert") {
    return bulkUpsertSchemeBeneficiaryRecords_(payload.records || [], requestMeta);
  }

  if (action === "schemeBeneficiaries.delete") {
    return deleteRowById_(SHEETS.SCHEME_BENEFICIARIES, payload.id);
  }

  if (action === "locations.list") {
    return listLocations_();
  }

  if (action === "locations.create") {
    return createLocation_(payload.input || payload);
  }

  if (action === "locations.update") {
    return updateLocation_(payload.input || payload);
  }

  if (action === "locations.delete") {
    return deleteLocation_(payload.id, payload.input || payload);
  }

  if (action === "analytics.villageInsights") {
    return getVillageInsights_(payload.fromDate, payload.toDate);
  }

  if (action === "alerts.list") {
    return getAlertsWithOutbreaks_();
  }

  if (action === "healthRecords.list") {
    return listRows_(SHEETS.HEALTH_RECORDS);
  }

  if (action === "healthRecords.create") {
    return createHealthRecord_(payload.input || payload);
  }

  if (action === "reminders.list") {
    return getReminders_();
  }

  if (action === "reminders.create") {
    return createReminder_(payload.input || payload);
  }

  if (action === "reminders.send") {
    return sendReminder_(payload.id);
  }

  if (action === "vaccinations.list") {
    return listRows_(SHEETS.VACCINATIONS);
  }

  if (action === "vaccinations.create") {
    return createVaccinationRecord_(payload.input || payload);
  }

  if (action === "vaccinations.updateStatus") {
    return updateVaccinationStatus_(payload.animalId, payload.type, payload.status);
  }

  if (action === "vaccinations.markDone") {
    return markVaccinationDone_(payload.animalId, payload.type);
  }

  if (action === "farmers.list") {
    return listRows_(SHEETS.FARMERS);
  }

  if (action === "farmers.create") {
    return createFarmer_(payload.input || payload);
  }

  if (action === "farmers.delete") {
    return deleteRowById_(SHEETS.FARMERS, payload.id);
  }

  if (action === "animals.list") {
    return listRows_(SHEETS.ANIMALS);
  }

  if (action === "animals.create") {
    return createAnimal_(payload.input || payload);
  }

  if (action === "animals.delete") {
    return deleteRowById_(SHEETS.ANIMALS, payload.id);
  }

  if (action === "animals.profile") {
    return getAnimalProfile_(payload.id);
  }

  if (action === "breeding.list") {
    return listRows_(SHEETS.BREEDING);
  }

  if (action === "pregnancy.list") {
    return listRows_(SHEETS.PREGNANCY);
  }

  if (action === "pregnancy.create") {
    return createPregnancyRecord_(payload.input || payload);
  }

  if (action === "pregnancy.updateStatus") {
    return updatePregnancyStatus_(payload.id, payload.status);
  }

  if (action === "tasks.list") {
    return listRows_(SHEETS.TASKS).map(function (row) {
      row.id = Number(row.id);
      row.completed = toBool_(row.completed);
      return row;
    });
  }

  if (action === "tasks.create") {
    return createTask_(payload.input || payload);
  }

  if (action === "tasks.toggle") {
    return toggleTask_(payload.id);
  }

  if (action === "fieldOfficers.list") {
    return listRows_(SHEETS.FIELD_OFFICERS);
  }

  if (action === "supervisorVerifications.list") {
    return listRows_(SHEETS.SUPERVISOR_VERIFICATIONS);
  }

  if (action === "photoEvidence.list") {
    return listRows_(SHEETS.PHOTO_EVIDENCE);
  }

  if (action === "photoEvidence.create") {
    return createPhotoEvidence_(payload.input || payload);
  }

  if (action === "photo.fetch") {
    return fetchPhotoDataUrl_(payload.input || payload);
  }

  if (action === "dailyReports.list") {
    return listRows_(SHEETS.DAILY_REPORTS);
  }

  if (action === "dailyReports.create") {
    return createDailyFieldReport_(payload.input || payload);
  }

  if (action === "emergencies.list") {
    return listRows_(SHEETS.EMERGENCIES);
  }

  if (action === "emergencies.create") {
    return createEmergencyReport_(payload.input || payload);
  }

  if (action === "portalSettings.upsert") {
    return upsertPortalSettings_(payload.input || payload, requestMeta);
  }

  throw new Error("Unsupported action: " + action);
}

function getDashboardData_() {
  var vaccinationTrendSheet = SHEETS.VACCINATION_TRENDS || "VaccinationTrends";
  var healthStatusSheet = SHEETS.HEALTH_STATUS || "HealthStatus";
  var monthlyActivitySheet = SHEETS.MONTHLY_ACTIVITY || "MonthlyActivity";
  var activitiesSheet = SHEETS.ACTIVITIES || "Activities";

  return {
    vaccinationTrends: listRows_(vaccinationTrendSheet),
    healthStatusData: listRows_(healthStatusSheet),
    monthlyActivity: listRows_(monthlyActivitySheet),
    activities: listRows_(activitiesSheet)
  };
}

function getLandingData_() {
  var villageInsights = getVillageInsights_(null, null);
  return {
    dashboardData: getDashboardData_(),
    schemeRecords: listSchemeDataRows_(),
    beneficiaryRecords: listRows_(SHEETS.SCHEME_BENEFICIARIES),
    institutes: listInstitutes_(),
    locations: listLocations_(),
    villageInsights: villageInsights,
    portalSettings: getPortalSettings_()
  };
}
