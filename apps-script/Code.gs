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
  HEALTH_STATUS: "HealthStatus",
  HEALTH_RECORDS: "HealthRecords",
  MONTHLY_ACTIVITY: "MonthlyActivity",
  USERS: "Users",
  PHOTO_EVIDENCE: "PhotoEvidence",
  DAILY_REPORTS: "DailyFieldReports",
  EMERGENCIES: "EmergencyReports",
  SCHEME_DATA: "SchemeData",
  SCHEME_BENEFICIARIES: "SchemeBeneficiaries"
};

// Default headers used when auto-creating sheets.
var DEFAULT_SHEET_HEADERS = {};
DEFAULT_SHEET_HEADERS[SHEETS.ANIMALS] = ["id","earTag","qrCode","taggingDate","dataEntryDate","sireId","damId","species","breed","gender","dob","age","ageMonths","color","weight","milkingStatus","pregnancyStatus","calvings","vaccinationStatus","diseaseStatus","treatmentHistory","photo","ownerName","owner","village","district","tehsil","block","gramPanchayat","status","notes","productionData"];
DEFAULT_SHEET_HEADERS[SHEETS.FARMERS] = ["id","name","mobile","phone","aadhaar","address","village","district","tehsil","block","gramPanchayat","animals","totalAnimals","loanStatus","insuranceStatus","governmentScheme","ownerType"];
DEFAULT_SHEET_HEADERS[SHEETS.LOCATIONS] = ["district","tehsil","block","gramPanchayat","village","status"];
DEFAULT_SHEET_HEADERS[SHEETS.VACCINATIONS] = ["id","animalId","vaccine","batchNumber","date","nextReminder","status","administeredBy","smsReminder","notes"];
DEFAULT_SHEET_HEADERS[SHEETS.PREGNANCY] = ["id","animalId","village","inseminationDate","expectedCalving","status","lastCheckDate","notes"];
DEFAULT_SHEET_HEADERS[SHEETS.BREEDING] = ["id","animalId","inseminationDate","expectedCalving","status","notes"];
DEFAULT_SHEET_HEADERS[SHEETS.ALERTS] = ["id","message","priority","type","time"];
DEFAULT_SHEET_HEADERS[SHEETS.REMINDERS] = ["id","village","recipient","channel","message","dueDate","status","sentAt"];
DEFAULT_SHEET_HEADERS[SHEETS.TASKS] = ["id","task","village","completed"];
// Extend TASKS headers to support officer, status and target columns used by UI
DEFAULT_SHEET_HEADERS[SHEETS.TASKS] = ["id","task","village","completed","officerId","status","target"];
DEFAULT_SHEET_HEADERS[SHEETS.FIELD_OFFICERS] = ["id","name","phone","village","role","assignedVillages","currentVillage","latitude","longitude","lastActive","visitStatus","gpsTracking","visitReports","attendance"];
DEFAULT_SHEET_HEADERS[SHEETS.SUPERVISOR_VERIFICATIONS] = ["id","officerName","village","district","tehsil","block","gramPanchayat","visitVerified","photoApproved","reportApproved","fakeVisitFlag"];
DEFAULT_SHEET_HEADERS[SHEETS.ACTIVITIES] = ["action","detail","time"];
DEFAULT_SHEET_HEADERS[SHEETS.TRENDS] = ["month","vaccinations"];
DEFAULT_SHEET_HEADERS[SHEETS.HEALTH_STATUS] = ["name","value","fill"];
DEFAULT_SHEET_HEADERS[SHEETS.HEALTH_RECORDS] = ["id","animalId","date","condition","diagnosis","symptoms","treatment","doctorName","medicine","recoveryStatus","isolationStatus","criticalAlert","notes","status","recordDate"];
DEFAULT_SHEET_HEADERS[SHEETS.MONTHLY_ACTIVITY] = ["month","registered","vaccinated","alerts"];
DEFAULT_SHEET_HEADERS[SHEETS.USERS] = ["id","name","email","role","region","active","createdAt","updatedAt"];
DEFAULT_SHEET_HEADERS[SHEETS.PHOTO_EVIDENCE] = ["id","animalId","tagId","officerName","district","tehsil","block","gramPanchayat","village","latitude","longitude","capturedAt","capturedDate","capturedTime","module","caption","photoUrl","driveFileId","driveFileUrl","fileName","verificationStatus","submittedAt"];
DEFAULT_SHEET_HEADERS[SHEETS.DAILY_REPORTS] = ["id","officerName","reportDate","villagesVisited","animalsVaccinated","diseaseCasesIdentified","pregnantAnimalsChecked","photosUploaded","notes","status","submittedAt"];
DEFAULT_SHEET_HEADERS[SHEETS.EMERGENCIES] = ["id","officerName","village","animalId","type","priority","reportedAt","status","summary","district","tehsil","block","gramPanchayat"];
DEFAULT_SHEET_HEADERS[SHEETS.SCHEME_DATA] = ["id","financialYear","schemeName","block","village","target","approvedCases","distributedUnits","pendingCases","financialProgressAmount","physicalProgressPercentage","remarks","createdAt","updatedAt","createdBy"];
DEFAULT_SHEET_HEADERS[SHEETS.SCHEME_BENEFICIARIES] = ["id","beneficiaryName","fatherHusbandName","mobileNumber","aadhaarNumber","rationCardNumber","bankAccountNumber","ifscCode","village","gramPanchayat","block","category","womenBeneficiary","pvtg","fraBeneficiary","schemeName","dateOfApproval","dateOfDistribution","unitsDistributed","distributionPhotoUrl","distributionPhotoFileId","remarks","createdAt","updatedAt","createdBy"];

// Primary spreadsheet ID. Update this only if you move data to another sheet.
var DEFAULT_SPREADSHEET_ID = "1yLqcwQDfhkB33TLxppcFlmYRIhvmxKqCBlm_jpDQVqI";
var DEFAULT_PHOTO_FOLDER_NAME = "e-pashu-photos";

var ROLE_ACTIONS = {
  admin: ["*"],
  veterinary_doctor: ["*"],
  departmental_officer: ["*"],
  deputy_director_vet: ["*"],
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
    "vaccinations.markDone",
    "vaccinations.updateStatus",
    "breeding.list",
    "pregnancy.list",
    "pregnancy.create",
    "pregnancy.updateStatus",
    "alerts.list",
    "healthRecords.list",
    "analytics.villageInsights",
    "reminders.list",
    "reminders.create",
    "reminders.send",
    "fieldOfficers.list",
    "tasks.list",
    "tasks.toggle",
    "photoEvidence.list",
    "photoEvidence.create",
    "dailyReports.list",
    "dailyReports.create",
    "emergencies.list",
    "emergencies.create",
    "reports.list",
    "users.lookupByEmail",
    "users.list",
    "schemeData.list",
    "schemeData.create",
    "schemeData.update",
    "schemeData.bulkUpsert"
    ,"schemeBeneficiaries.list"
    ,"schemeBeneficiaries.create"
    ,"schemeBeneficiaries.update"
    ,"schemeBeneficiaries.bulkUpsert"
  ],
  block_officer: ["locations.list", "schemeData.list", "schemeData.create", "schemeData.update", "schemeData.bulkUpsert", "schemeBeneficiaries.list", "schemeBeneficiaries.create", "schemeBeneficiaries.update", "schemeBeneficiaries.bulkUpsert", "users.lookupByEmail"],
  data_entry_operator: ["locations.list", "schemeData.list", "schemeData.create", "schemeData.update", "schemeData.bulkUpsert", "schemeBeneficiaries.list", "schemeBeneficiaries.create", "schemeBeneficiaries.update", "schemeBeneficiaries.bulkUpsert", "users.lookupByEmail"]
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    var action = String(body.action || "").trim().toLowerCase();
    var payload = body.payload || {};
    var requestMeta = payload._meta || {};

    if (payload._meta) {
      delete payload._meta;
    }

    assertActionAllowed_(action, requestMeta);

    // Ensure spreadsheet tabs and photo folder exist before handling actions.
    try {
      ensureProvisioning_();
    } catch (provErr) {
      // Non-fatal: continue and let individual handlers create sheets as needed.
      Logger.log("Provisioning error: " + provErr.message);
    }

    var data;
    switch (action) {
      case "dashboard.get":
        data = getDashboardData_();
        break;
      case "locations.list":
        data = listLocations_();
        break;
      case "locations.create":
        data = createLocation_(payload.input);
        break;
      case "locations.update":
        data = updateLocation_(payload.input);
        break;
      case "locations.delete":
        data = deleteLocation_(payload.id, payload.input);
        break;
      case "schemeData.list":
        data = listRows_(SHEETS.SCHEME_DATA);
        break;
      case "schemeData.create":
        data = createSchemeData_(payload.input, requestMeta);
        break;
      case "schemeData.update":
        data = updateSchemeData_(payload.input, requestMeta);
        break;
      case "schemeData.delete":
        data = deleteSchemeData_(payload.id, requestMeta);
        break;
      case "schemeData.bulkUpsert":
        data = bulkUpsertSchemeData_(payload.records, requestMeta);
        break;
      case "schemeBeneficiaries.list":
        data = listSchemeBeneficiaries_(requestMeta);
        break;
      case "schemeBeneficiaries.create":
        data = createSchemeBeneficiary_(payload.input, requestMeta);
        break;
      case "schemeBeneficiaries.update":
        data = updateSchemeBeneficiary_(payload.input, requestMeta);
        break;
      case "schemeBeneficiaries.delete":
        data = deleteSchemeBeneficiary_(payload.id, requestMeta);
        break;
      case "schemeBeneficiaries.bulkUpsert":
        data = bulkUpsertSchemeBeneficiaries_(payload.records, requestMeta);
        break;
      case "animals.list":
        data = listRows_(SHEETS.ANIMALS);
        break;
      case "animals.create":
        data = createAnimal_(payload.input);
        break;
      case "animals.delete":
        data = deleteRowById_(SHEETS.ANIMALS, payload.id);
        break;
      case "animals.profile":
        data = getAnimalProfile_(payload.id);
        break;
      case "farmers.list":
        data = listRows_(SHEETS.FARMERS);
        break;
      case "farmers.create":
        data = createFarmer_(payload.input);
        break;
      case "farmers.delete":
        data = deleteRowById_(SHEETS.FARMERS, payload.id);
        break;
      case "vaccinations.list":
        data = listRows_(SHEETS.VACCINATIONS);
        break;
      case "vaccinations.create":
        data = createVaccinationRecord_(payload.input);
        break;
      case "vaccinations.markDone":
        data = markVaccinationDone_(payload.animalId, payload.type);
        break;
      case "vaccinations.updateStatus":
        data = updateVaccinationStatus_(payload.animalId, payload.type, payload.status);
        break;
      case "breeding.list":
        data = listRows_(SHEETS.BREEDING);
        break;
      case "pregnancy.list":
        data = listRows_(SHEETS.PREGNANCY);
        break;
      case "pregnancy.create":
        data = createPregnancyRecord_(payload.input);
        break;
      case "pregnancy.updateStatus":
        data = updatePregnancyStatus_(payload.id, payload.status);
        break;
      case "alerts.list":
        data = getAlertsWithOutbreaks_();
        break;
      case "healthRecords.list":
        data = listRows_(SHEETS.HEALTH_RECORDS);
        break;
      case "healthRecords.create":
        data = createHealthRecord_(payload.input);
        break;
      case "analytics.villageInsights":
        data = getVillageInsights_(payload.fromDate, payload.toDate);
        break;
      case "reminders.list":
        data = getReminders_();
        break;
      case "reminders.create":
        data = createReminder_(payload.input);
        break;
      case "reminders.send":
        data = sendReminder_(payload.id);
        break;
      case "users.list":
        data = listUsers_();
        break;
      case "users.lookupByEmail":
        data = lookupUserByEmail_(payload.email);
        break;
      case "users.upsert":
        data = upsertUser_(payload.input);
        break;
      case "users.delete":
        data = deleteUserByEmail_(payload.email);
        break;
      case "photoEvidence.list":
        data = listRows_(SHEETS.PHOTO_EVIDENCE);
        break;
      case "photoEvidence.create":
        data = createPhotoEvidence_(payload.input);
        break;
      case "photo.fetch":
        data = fetchPhotoDataUrl_(payload.input);
        break;
      case "dailyReports.list":
        data = listRows_(SHEETS.DAILY_REPORTS);
        break;
      case "dailyReports.create":
        data = createDailyFieldReport_(payload.input);
        break;
      case "emergencies.list":
        data = listRows_(SHEETS.EMERGENCIES);
        break;
      case "emergencies.create":
        data = createEmergencyReport_(payload.input);
        break;
      case "tasks.list":
        data = listRows_(SHEETS.TASKS).map(function (row) {
          row.id = Number(row.id);
          row.completed = toBool_(row.completed);
          return row;
        });
        break;
      case "tasks.create":
        data = createTask_(payload.input);
        break;
      case "fieldOfficers.list":
        data = listRows_(SHEETS.FIELD_OFFICERS);
        break;
      case "supervisorVerifications.list":
        data = listRows_(SHEETS.SUPERVISOR_VERIFICATIONS);
        break;
      case "tasks.toggle":
        data = toggleTask_(payload.id);
        break;
      default:
        return jsonResponse_(false, null, "Unknown action: " + action);
    }

    return jsonResponse_(true, data, null);
  } catch (error) {
    return jsonResponse_(false, null, error.message || String(error));
  }
}

function getDashboardData_() {
  return {
    vaccinationTrends: listRows_(SHEETS.TRENDS),
    healthStatusData: listRows_(SHEETS.HEALTH_STATUS),
    monthlyActivity: listRows_(SHEETS.MONTHLY_ACTIVITY),
    activities: listRows_(SHEETS.ACTIVITIES)
  };
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

function ensureProvisioning_() {
  var spreadsheetId = getSpreadsheetId_();
  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set in Script Properties");
  }

  var ss = SpreadsheetApp.openById(spreadsheetId);
  Object.keys(DEFAULT_SHEET_HEADERS).forEach(function (sheetName) {
    var headers = DEFAULT_SHEET_HEADERS[sheetName] || ["id"];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      var s = ss.insertSheet(sheetName);
      s.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      ensureHeaders_(sheet, headers);
    }
  });

  var usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (usersSheet && usersSheet.getLastRow() < 2) {
    usersSheet.appendRow([
      "USR-ADMIN",
      "Dr. Asha Verma",
      "admin@epashu.gov",
      "admin",
      "State Control Room",
      true,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
  }

  // Ensure photo folder exists and is recorded.
  getOrCreatePhotoFolder_();
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

function getAnimalProfile_(id) {
  var animals = listRows_(SHEETS.ANIMALS);
  var animal = animals.find(function (item) {
    return item.id === id;
  });

  if (!animal) {
    throw new Error("Animal not found: " + id);
  }

  var vaccHistory = listRows_(SHEETS.VACCINATIONS).filter(function (item) {
    return item.animalId === id;
  });

  var breedingHistory = listRows_(SHEETS.BREEDING)
    .filter(function (item) {
      return item.animalId === id;
    })
    .map(function (item) {
      return {
        date: item.inseminationDate,
        type: "AI",
        status: item.status,
        expected: item.expectedCalving
      };
    });

  // Attempt to read historical health/disease records for the animal.
  var diseaseHistory = [];
  try {
    diseaseHistory = listRows_(SHEETS.HEALTH_RECORDS)
      .filter(function (item) {
        return item.animalId === id;
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
    ]
    ,
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
  var baseAlerts = listRows_(SHEETS.ALERTS).map(function (row, idx) {
    row.id = Number(row.id) || idx + 1;
    return row;
  });

  var outbreaks = detectOutbreakAlerts_();
  var reminderAlerts = buildReminderDueAlerts_();
  return baseAlerts.concat(outbreaks, reminderAlerts);
}

function buildReminderDueAlerts_() {
  var reminders = listRows_(SHEETS.REMINDERS);
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
  var animals = listRows_(SHEETS.ANIMALS);
  var farmers = listRows_(SHEETS.FARMERS);

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
  var vaccinations = listRows_(SHEETS.VACCINATIONS);
  var animals = listRows_(SHEETS.ANIMALS);
  var farmers = listRows_(SHEETS.FARMERS);

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
  return values.slice(1).map(function (row) {
    var item = {};
    headers.forEach(function (header, idx) {
      item[normalizeKey_(header)] = row[idx];
    });
    return item;
  });
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

function createSchemeData_(input, requestMeta) {
  var row = normalizeSchemeDataInput_(input);
  assertSchemeWriteAllowed_(requestMeta, row.block, false);
  row.id = input.id || ("SCH-" + new Date().getTime());
  row.createdAt = input.createdAt || new Date().toISOString();
  row.updatedAt = new Date().toISOString();
  row.createdBy = normalizeEmail_(requestMeta && requestMeta.email);
  upsertRowById_(SHEETS.SCHEME_DATA, row);
  return row;
}

function updateSchemeData_(input, requestMeta) {
  if (!input || !input.id) {
    throw new Error("Scheme record id is required");
  }

  var existing = listRows_(SHEETS.SCHEME_DATA).find(function (item) {
    return String(item.id) === String(input.id);
  });
  if (!existing) {
    throw new Error("Scheme record not found: " + input.id);
  }

  assertSchemeWriteAllowed_(requestMeta, existing.block, false);
  var row = normalizeSchemeDataInput_(input);
  assertSchemeWriteAllowed_(requestMeta, row.block, false);
  row.id = String(input.id);
  row.createdAt = existing.createdAt || input.createdAt || new Date().toISOString();
  row.updatedAt = new Date().toISOString();
  row.createdBy = existing.createdBy || normalizeEmail_(requestMeta && requestMeta.email);
  upsertRowById_(SHEETS.SCHEME_DATA, row);
  return row;
}

function deleteSchemeData_(id, requestMeta) {
  assertSchemeWriteAllowed_(requestMeta, "", true);
  return deleteRowById_(SHEETS.SCHEME_DATA, id);
}

function bulkUpsertSchemeData_(records, requestMeta) {
  if (!Array.isArray(records) || !records.length) {
    throw new Error("Upload contains no scheme records");
  }

  var rows = records.map(function (input) {
    var row = normalizeSchemeDataInput_(input);
    assertSchemeWriteAllowed_(requestMeta, row.block, false);
    return row;
  });

  var saved = rows.map(function (row, index) {
    row.id = row.id || ("SCH-" + new Date().getTime() + "-" + index);
    row.createdAt = row.createdAt || new Date().toISOString();
    row.updatedAt = new Date().toISOString();
    row.createdBy = row.createdBy || normalizeEmail_(requestMeta && requestMeta.email);
    upsertRowById_(SHEETS.SCHEME_DATA, row);
    return row;
  });

  return { saved: saved.length, records: saved };
}

function normalizeSchemeDataInput_(input) {
  if (!input || !input.financialYear || !input.schemeName || !input.block || !input.village) {
    throw new Error("Financial year, scheme name, block and village are required");
  }

  var row = {
    financialYear: String(input.financialYear).trim(),
    schemeName: String(input.schemeName).trim(),
    block: String(input.block).trim(),
    village: String(input.village).trim(),
    target: Number(input.target || 0),
    approvedCases: Number(input.approvedCases || 0),
    distributedUnits: Number(input.distributedUnits || 0),
    pendingCases: Number(input.pendingCases || 0),
    financialProgressAmount: Number(input.financialProgressAmount || 0),
    physicalProgressPercentage: Number(input.physicalProgressPercentage || 0),
    remarks: String(input.remarks || "").trim()
  };

  var numericKeys = ["target", "approvedCases", "distributedUnits", "pendingCases", "financialProgressAmount", "physicalProgressPercentage"];
  numericKeys.forEach(function (key) {
    if (!isFinite(row[key]) || row[key] < 0) {
      throw new Error(key + " must be a non-negative number");
    }
  });
  if (row.physicalProgressPercentage > 100) {
    throw new Error("Physical progress percentage cannot exceed 100");
  }
  if (row.approvedCases > row.target || row.distributedUnits > row.approvedCases) {
    throw new Error("Approved cases and distributed units cannot exceed their preceding totals");
  }

  return row;
}

function assertSchemeWriteAllowed_(requestMeta, block, isDelete) {
  var email = normalizeEmail_(requestMeta && requestMeta.email);
  var user = listUsers_().find(function (item) {
    return normalizeEmail_(item.email) === email;
  });
  if (!user || !toBool_(user.active)) {
    throw new Error("Active login session is required");
  }

  var role = normalizeRole_(user.role);
  if (role === "admin") {
    return;
  }
  if (isDelete) {
    throw new Error("Only district admin can delete scheme records");
  }
  if (role === "data_entry_operator") {
    return;
  }
  if (role === "block_officer" || role === "field_officer") {
    var region = String(user.region || "").trim().toLowerCase();
    var targetBlock = String(block || "").trim().toLowerCase();
    if (region && targetBlock && (region.indexOf(targetBlock) >= 0 || targetBlock.indexOf(region) >= 0)) {
      return;
    }
    throw new Error("Block officers can only update records for their assigned block");
  }

  throw new Error("This role has view-only access to scheme data");
}

function listSchemeBeneficiaries_(requestMeta) {
  var rows = listRows_(SHEETS.SCHEME_BENEFICIARIES);
  if (getRequesterRole_(requestMeta) === "admin") {
    return rows;
  }
  return rows.map(function (row) {
    row.aadhaarNumber = maskSensitive_(row.aadhaarNumber, 4);
    row.bankAccountNumber = maskSensitive_(row.bankAccountNumber, 4);
    return row;
  });
}

function createSchemeBeneficiary_(input, requestMeta) {
  var row = normalizeSchemeBeneficiaryInput_(input);
  assertSchemeWriteAllowed_(requestMeta, row.block, false);
  row.id = input.id || ("BEN-" + new Date().getTime());
  row.createdAt = input.createdAt || new Date().toISOString();
  row.updatedAt = new Date().toISOString();
  row.createdBy = normalizeEmail_(requestMeta && requestMeta.email);
  attachDistributionPhoto_(row, input);
  upsertRowById_(SHEETS.SCHEME_BENEFICIARIES, row);
  return maskSchemeBeneficiaryForRequester_(row, requestMeta);
}

function updateSchemeBeneficiary_(input, requestMeta) {
  if (!input || !input.id) {
    throw new Error("Beneficiary record id is required");
  }
  var existing = listRows_(SHEETS.SCHEME_BENEFICIARIES).find(function (item) {
    return String(item.id) === String(input.id);
  });
  if (!existing) {
    throw new Error("Beneficiary record not found: " + input.id);
  }

  assertSchemeWriteAllowed_(requestMeta, existing.block, false);
  var row = normalizeSchemeBeneficiaryInput_(input);
  assertSchemeWriteAllowed_(requestMeta, row.block, false);
  row.id = String(input.id);
  row.aadhaarNumber = isMasked_(row.aadhaarNumber) ? existing.aadhaarNumber : row.aadhaarNumber;
  row.bankAccountNumber = isMasked_(row.bankAccountNumber) ? existing.bankAccountNumber : row.bankAccountNumber;
  row.createdAt = existing.createdAt || input.createdAt || new Date().toISOString();
  row.updatedAt = new Date().toISOString();
  row.createdBy = existing.createdBy || normalizeEmail_(requestMeta && requestMeta.email);
  row.distributionPhotoUrl = existing.distributionPhotoUrl || "";
  row.distributionPhotoFileId = existing.distributionPhotoFileId || "";
  attachDistributionPhoto_(row, input);
  upsertRowById_(SHEETS.SCHEME_BENEFICIARIES, row);
  return maskSchemeBeneficiaryForRequester_(row, requestMeta);
}

function deleteSchemeBeneficiary_(id, requestMeta) {
  assertSchemeWriteAllowed_(requestMeta, "", true);
  return deleteRowById_(SHEETS.SCHEME_BENEFICIARIES, id);
}

function bulkUpsertSchemeBeneficiaries_(records, requestMeta) {
  if (!Array.isArray(records) || !records.length) {
    throw new Error("Upload contains no beneficiary records");
  }
  var saved = records.map(function (input, index) {
    var row = normalizeSchemeBeneficiaryInput_(input);
    assertSchemeWriteAllowed_(requestMeta, row.block, false);
    row.id = input.id || ("BEN-" + new Date().getTime() + "-" + index);
    row.createdAt = input.createdAt || new Date().toISOString();
    row.updatedAt = new Date().toISOString();
    row.createdBy = normalizeEmail_(requestMeta && requestMeta.email);
    row.distributionPhotoUrl = "";
    row.distributionPhotoFileId = "";
    upsertRowById_(SHEETS.SCHEME_BENEFICIARIES, row);
    return maskSchemeBeneficiaryForRequester_(row, requestMeta);
  });
  return { saved: saved.length, records: saved };
}

function normalizeSchemeBeneficiaryInput_(input) {
  if (!input || !input.beneficiaryName || !input.mobileNumber || !input.aadhaarNumber || !input.bankAccountNumber || !input.village || !input.block || !input.schemeName) {
    throw new Error("Beneficiary name, mobile, Aadhaar, bank account, village, block and scheme are required");
  }
  var row = {
    beneficiaryName: String(input.beneficiaryName).trim(),
    fatherHusbandName: String(input.fatherHusbandName || "").trim(),
    mobileNumber: String(input.mobileNumber).replace(/\D/g, ""),
    aadhaarNumber: String(input.aadhaarNumber).replace(/\s/g, ""),
    rationCardNumber: String(input.rationCardNumber || "").trim(),
    bankAccountNumber: String(input.bankAccountNumber).replace(/\s/g, ""),
    ifscCode: String(input.ifscCode || "").trim().toUpperCase(),
    village: String(input.village).trim(),
    gramPanchayat: String(input.gramPanchayat || "").trim(),
    block: String(input.block).trim(),
    category: String(input.category || "General").trim(),
    womenBeneficiary: String(input.womenBeneficiary || "No").trim(),
    pvtg: String(input.pvtg || "No").trim(),
    fraBeneficiary: String(input.fraBeneficiary || "No").trim(),
    schemeName: String(input.schemeName).trim(),
    dateOfApproval: String(input.dateOfApproval || "").trim(),
    dateOfDistribution: String(input.dateOfDistribution || "").trim(),
    unitsDistributed: Number(input.unitsDistributed || 0),
    remarks: String(input.remarks || "").trim()
  };
  if (!/^\d{10}$/.test(row.mobileNumber)) {
    throw new Error("Mobile number must contain 10 digits");
  }
  if (!isMasked_(row.aadhaarNumber) && !/^\d{12}$/.test(row.aadhaarNumber)) {
    throw new Error("Aadhaar number must contain 12 digits");
  }
  if (!isFinite(row.unitsDistributed) || row.unitsDistributed < 0) {
    throw new Error("Units distributed must be a non-negative number");
  }
  return row;
}

function attachDistributionPhoto_(row, input) {
  if (!input || !input.distributionPhotoDataUrl) {
    return;
  }
  var image = savePhotoToDrive_(input.distributionPhotoDataUrl, input.distributionPhotoFileName || ("beneficiary-distribution-" + new Date().getTime() + ".jpg"));
  row.distributionPhotoUrl = image.viewUrl || image.url;
  row.distributionPhotoFileId = image.id;
}

function maskSchemeBeneficiaryForRequester_(row, requestMeta) {
  if (getRequesterRole_(requestMeta) === "admin") {
    return row;
  }
  var copy = Object.assign({}, row);
  copy.aadhaarNumber = maskSensitive_(copy.aadhaarNumber, 4);
  copy.bankAccountNumber = maskSensitive_(copy.bankAccountNumber, 4);
  return copy;
}

function maskSensitive_(value, visibleDigits) {
  var raw = String(value || "");
  if (!raw || isMasked_(raw)) {
    return raw;
  }
  var visible = Math.max(0, Number(visibleDigits || 0));
  return new Array(Math.max(0, raw.length - visible) + 1).join("*") + raw.slice(-visible);
}

function isMasked_(value) {
  return String(value || "").indexOf("*") >= 0;
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

function listUsers_() {
  return listRows_(SHEETS.USERS).map(function (user) {
    user.active = toBool_(user.active);
    user.role = normalizeRole_(user.role);
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
    updatedAt: new Date().toISOString()
  };

  var sheet = getSheet_(SHEETS.USERS);
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

function assertActionAllowed_(action, requestMeta) {
  if (!action) {
    throw new Error("Action is required");
  }

  if (action === "users.lookupByEmail") {
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
  if (value === "veterinary" || value === "veterinary_doctor" || value === "veterinary doctor") {
    return "veterinary_doctor";
  }
  if (value === "departmental_officer" || value === "departmental officer") {
    return "departmental_officer";
  }
  if (value === "block_officer" || value === "block officer") {
    return "block_officer";
  }
  if (value === "data_entry" || value === "data_entry_operator" || value === "data entry operator") {
    return "data_entry_operator";
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

function deleteUserByEmail_(email) {
  var normalizedEmail = normalizeEmail_(email);
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  var sheet = getSheet_(SHEETS.USERS);
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    throw new Error("No users found");
  }

  var headers = values[0];
  var emailIdx = findColumnIndex_(headers, "email");
  for (var i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][emailIdx]) === normalizedEmail) {
      sheet.deleteRow(i + 1);
      return { email: normalizedEmail, deleted: true };
    }
  }

  throw new Error("User not found");
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
    target: input.target || 0
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
