export interface AdministrativeArea {
  district: string;
  tehsil: string;
  block: string;
  gramPanchayat: string;
  village: string;
}

export interface AdministrativeOptions {
  districts: string[];
  tehsils: string[];
  blocks: string[];
  gramPanchayats: string[];
  villages: string[];
}

export type AdministrativeFilter = AdministrativeArea | {
  district: "all";
  tehsil: "all";
  block: "all";
  gramPanchayat: "all";
  village: "all";
};

export const administrativeHierarchy = [];

export const defaultAdministrativeArea: AdministrativeArea = {
  district: "",
  tehsil: "",
  block: "",
  gramPanchayat: "",
  village: "",
};

export const allAdministrativeFilter: AdministrativeFilter = {
  district: "all",
  tehsil: "all",
  block: "all",
  gramPanchayat: "all",
  village: "all",
};

export function getDistricts() {
  return administrativeHierarchy.map((item) => item.district);
}

export function getTehsils(district: string) {
  return administrativeHierarchy.find((item) => item.district === district)?.tehsils.map((item) => item.tehsil) || [];
}

export function getBlocks(district: string, tehsil: string) {
  return administrativeHierarchy
    .find((item) => item.district === district)
    ?.tehsils.find((item) => item.tehsil === tehsil)
    ?.blocks.map((item) => item.block) || [];
}

export function getGramPanchayats(district: string, tehsil: string, block: string) {
  return administrativeHierarchy
    .find((item) => item.district === district)
    ?.tehsils.find((item) => item.tehsil === tehsil)
    ?.blocks.find((item) => item.block === block)
    ?.gramPanchayats.map((item) => item.gramPanchayat) || [];
}

export function getVillages(district: string, tehsil: string, block: string, gramPanchayat: string) {
  return administrativeHierarchy
    .find((item) => item.district === district)
    ?.tehsils.find((item) => item.tehsil === tehsil)
    ?.blocks.find((item) => item.block === block)
    ?.gramPanchayats.find((item) => item.gramPanchayat === gramPanchayat)
    ?.villages || [];
}

export function getAllVillages() {
  return administrativeHierarchy.flatMap((district) =>
    district.tehsils.flatMap((tehsil) =>
      tehsil.blocks.flatMap((block) =>
        block.gramPanchayats.flatMap((panchayat) => panchayat.villages),
      ),
    ),
  );
}

export function areaForVillage(village: string): AdministrativeArea {
  for (const district of administrativeHierarchy) {
    for (const tehsil of district.tehsils) {
      for (const block of tehsil.blocks) {
        for (const gramPanchayat of block.gramPanchayats) {
          if (gramPanchayat.villages.includes(village)) {
            return {
              district: district.district,
              tehsil: tehsil.tehsil,
              block: block.block,
              gramPanchayat: gramPanchayat.gramPanchayat,
              village,
            };
          }
        }
      }
    }
  }
  return { ...defaultAdministrativeArea, village };
}

export function areaForRecord(record: Partial<AdministrativeArea> & { village?: string }): AdministrativeArea {
  const mappedArea = record.village ? areaForVillage(record.village) : defaultAdministrativeArea;
  return {
    district: record.district ?? mappedArea.district,
    tehsil: record.tehsil ?? mappedArea.tehsil,
    block: record.block ?? mappedArea.block,
    gramPanchayat: record.gramPanchayat ?? mappedArea.gramPanchayat,
    village: record.village ?? mappedArea.village,
  };
}

export function buildAdministrativeOptions(records: Array<Partial<AdministrativeArea> & { village?: string }>): AdministrativeOptions {
  const districts = new Set<string>();
  const tehsils = new Set<string>();
  const blocks = new Set<string>();
  const gramPanchayats = new Set<string>();
  const villages = new Set<string>();

  records.forEach((record) => {
    const area = areaForRecord(record);
    if (area.district) districts.add(area.district);
    if (area.tehsil) tehsils.add(area.tehsil);
    if (area.block) blocks.add(area.block);
    if (area.gramPanchayat) gramPanchayats.add(area.gramPanchayat);
    if (area.village) villages.add(area.village);
  });

  return {
    districts: Array.from(districts),
    tehsils: Array.from(tehsils),
    blocks: Array.from(blocks),
    gramPanchayats: Array.from(gramPanchayats),
    villages: Array.from(villages),
  };
}

export function matchesAdministrativeFilter(record: Partial<AdministrativeArea> & { village?: string }, filter: AdministrativeFilter) {
  if (filter.district === "all") return true;
  const area = areaForRecord(record);
  return area.district === filter.district
    && area.tehsil === filter.tehsil
    && area.block === filter.block
    && area.gramPanchayat === filter.gramPanchayat
    && area.village === filter.village;
}
