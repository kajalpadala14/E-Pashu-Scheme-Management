import type { LocationRecord, SchemeBeneficiaryRecord, SchemeDataRecord } from "@/lib/types";

function normalizeSchemeToken(value: string) {
  return value.trim().toLowerCase();
}

function normalizeContext(value: string) {
  return normalizeSchemeToken(value).replace(/[^a-z0-9]+/g, "");
}

function normalizeBlockLabel(value: string) {
  const token = normalizeContext(value);
  if (!token) {
    return "";
  }

  if (token === "kuakonda" || token === "kuwakonda") return "Kuakonda";
  if (token === "katekalyan" || token === "katekalyanblock") return "Katekalyan";
  if (token === "chhindgarh" || token === "chhindgarhblock") return "Chhindgarh";
  if (token === "geedam") return "Geedam";
  if (token === "dantewada") return "Dantewada";

  return value.trim();
}

function sameBlock(left: string, right: string) {
  const leftBlock = normalizeContext(normalizeBlockLabel(left));
  const rightBlock = normalizeContext(normalizeBlockLabel(right));
  return !!leftBlock && !!rightBlock && leftBlock === rightBlock;
}

function matchesInstituteContext(record: SchemeDataRecord, beneficiary: SchemeBeneficiaryRecord) {
  const recordContext = normalizeContext(record.instituteName || record.village || record.block);
  const beneficiaryContext = normalizeContext(beneficiary.village || beneficiary.gramPanchayat || beneficiary.block);
  return !!recordContext && !!beneficiaryContext && (recordContext === beneficiaryContext || beneficiaryContext.includes(recordContext) || recordContext.includes(beneficiaryContext));
}

function matchesSchemeRecord(record: SchemeDataRecord, beneficiary: SchemeBeneficiaryRecord) {
  const sameScheme = normalizeSchemeToken(record.schemeName) === normalizeSchemeToken(beneficiary.schemeName);
  if (!sameScheme) {
    return false;
  }

  if (sameBlock(record.block, beneficiary.block)) {
    return true;
  }

  return matchesInstituteContext(record, beneficiary);
}

function getSchemeInstituteName(record: SchemeDataRecord) {
  return String(record.instituteName || record.village || "").trim();
}

function getBeneficiaryInstituteName(record: SchemeBeneficiaryRecord) {
  return String(record.village || record.gramPanchayat || "").trim();
}

function collectActiveInstituteKeys(
  schemeRecords: SchemeDataRecord[],
  beneficiaryRecords: SchemeBeneficiaryRecord[],
  institutes: Array<{ instituteName?: string; status?: string; block?: string }>,
) {
  const keys = new Set<string>();

  institutes
    .filter((item) => String(item.status || "Active") !== "Inactive")
    .forEach((item) => {
      const block = normalizeBlockLabel(String(item.block || ""));
      const instituteName = String(item.instituteName || "").trim();
      if (block && instituteName) {
        keys.add(`${normalizeContext(block)}|${normalizeContext(instituteName)}`);
      }
    });

  schemeRecords.forEach((record) => {
    const block = normalizeBlockLabel(record.block);
    const instituteName = getSchemeInstituteName(record);
    if (block && instituteName) {
      keys.add(`${normalizeContext(block)}|${normalizeContext(instituteName)}`);
    }
  });

  beneficiaryRecords.forEach((record) => {
    const block = normalizeBlockLabel(record.block);
    const instituteName = getBeneficiaryInstituteName(record);
    if (block && instituteName) {
      keys.add(`${normalizeContext(block)}|${normalizeContext(instituteName)}`);
    }
  });

  return keys;
}

export function collectSchemeNames(...sources: Array<Array<{ schemeName?: string }>>) {
  const names = new Set<string>();

  for (const source of sources) {
    for (const record of source) {
      const schemeName = String(record.schemeName || "").trim();
      if (schemeName) {
        names.add(schemeName);
      }
    }
  }

  return Array.from(names).sort((left, right) => left.localeCompare(right));
}

export function linkSchemeRecords(schemeRecords: SchemeDataRecord[], beneficiaryRecords: SchemeBeneficiaryRecord[]) {
  return schemeRecords.map((record) => {
    const linkedBeneficiaries = beneficiaryRecords.filter((item) => matchesSchemeRecord(record, item));
    const approvedCasesComputed = linkedBeneficiaries.filter((item) => !!item.dateOfApproval).length;
    const distributedUnitsComputed = linkedBeneficiaries.reduce((sum, item) => sum + Number(item.unitsDistributed || 0), 0);
    const totalBeneficiariesComputed = linkedBeneficiaries.length;

    const approvedCases = Math.max(Number(record.approvedCases || 0), approvedCasesComputed);
    const distributedUnits = Math.max(Number(record.distributedUnits || 0), distributedUnitsComputed);
    const totalBeneficiaries = totalBeneficiariesComputed;

    const pendingCases = Number(record.pendingCases || 0) || Math.max(approvedCases - distributedUnits, 0);

    return {
      ...record,
      approvedCases,
      distributedUnits,
      pendingCases,
      totalBeneficiaries,
      physicalProgressPercentage: record.target ? Math.round((distributedUnits / record.target) * 100) : 0,
    };
  });
}

export function buildSchemeSummaryTotals(
  schemeRecords: SchemeDataRecord[],
  beneficiaryRecords: SchemeBeneficiaryRecord[],
  institutes: Array<{ instituteName?: string; status?: string; block?: string }> = [],
  _locations: LocationRecord[] = [],
) {
  const linkedRecords = linkSchemeRecords(schemeRecords, beneficiaryRecords);
  const recordBlocks = new Set(
    [
      ...linkedRecords.map((item) => item.block),
      ...beneficiaryRecords.map((item) => item.block),
      ...institutes.map((item) => String(item.block || "")),
      ..._locations.map((item) => item.block),
    ]
      .map((item) => normalizeBlockLabel(String(item || "")))
      .filter(Boolean),
  );
  const activeBlocks = recordBlocks.size;
  const activeInstitutes = collectActiveInstituteKeys(schemeRecords, beneficiaryRecords, institutes).size;

  return {
    totalSchemeRecords: schemeRecords.length,
    totalSchemes: new Set(linkedRecords.map((item) => item.schemeName).filter(Boolean)).size,
    totalBeneficiaries: beneficiaryRecords.length,
    activeBlocks,
    activeInstitutes,
    target: linkedRecords.reduce((sum, item) => sum + item.target, 0),
    approvedCases: linkedRecords.reduce((sum, item) => sum + item.approvedCases, 0),
    distributedUnits: linkedRecords.reduce((sum, item) => sum + item.distributedUnits, 0),
    pendingCases: linkedRecords.reduce((sum, item) => sum + item.pendingCases, 0),
    linkedRecords,
  };
}
