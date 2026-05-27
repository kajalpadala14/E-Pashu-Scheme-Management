import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  allAdministrativeFilter,
  defaultAdministrativeArea,
  getBlocks,
  getDistricts,
  getGramPanchayats,
  getTehsils,
  getVillages,
  type AdministrativeArea,
  type AdministrativeFilter,
} from "@/lib/adminHierarchy";

type AreaValue = AdministrativeArea | AdministrativeFilter;

interface AdminAreaSelectProps {
  value: AreaValue;
  onChange: (value: AreaValue) => void;
  labelPrefix?: string;
  includeAll?: boolean;
  allowManualEntry?: boolean;
  className?: string;
  // optional overrides populated from sheet data
  districtOptions?: string[];
  tehsilOptions?: string[];
  blockOptions?: string[];
  gramPanchayatOptions?: string[];
  villageOptions?: string[];
}

export function AdminAreaSelect({
  value,
  onChange,
  labelPrefix = "",
  includeAll = false,
  allowManualEntry = false,
  className = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5",
  districtOptions = [],
  tehsilOptions = [],
  blockOptions = [],
  gramPanchayatOptions = [],
  villageOptions = [],
}: AdminAreaSelectProps) {
  const isAll = value.district === "all";
  const area = isAll ? defaultAdministrativeArea : (value as AdministrativeArea);
  const districtOptionsList = districtOptions && districtOptions.length ? districtOptions : getDistricts();
  const shouldUseManualEntry = allowManualEntry || districtOptionsList.length === 0;
  const tehsils = tehsilOptions && tehsilOptions.length ? tehsilOptions : getTehsils(area.district);
  const blocks = blockOptions && blockOptions.length ? blockOptions : getBlocks(area.district, area.tehsil);
  const gramPanchayats = gramPanchayatOptions && gramPanchayatOptions.length ? gramPanchayatOptions : getGramPanchayats(area.district, area.tehsil, area.block);
  const villages = villageOptions && villageOptions.length ? villageOptions : getVillages(area.district, area.tehsil, area.block, area.gramPanchayat);

  const setDistrict = (district: string) => {
    if (district === "all") {
      onChange(allAdministrativeFilter);
      return;
    }
    const tehsil = getTehsils(district)[0] || "";
    const block = getBlocks(district, tehsil)[0] || "";
    const gramPanchayat = getGramPanchayats(district, tehsil, block)[0] || "";
    const village = getVillages(district, tehsil, block, gramPanchayat)[0] || "";
    onChange({ district, tehsil, block, gramPanchayat, village });
  };

  const setTehsil = (tehsil: string) => {
    if (tehsil === "all") {
      onChange({ district: area.district, tehsil: "all", block: "all", gramPanchayat: "all", village: "all" });
      return;
    }
    const block = getBlocks(area.district, tehsil)[0] || "";
    const gramPanchayat = getGramPanchayats(area.district, tehsil, block)[0] || "";
    const village = getVillages(area.district, tehsil, block, gramPanchayat)[0] || "";
    onChange({ district: area.district, tehsil, block, gramPanchayat, village });
  };

  const setBlock = (block: string) => {
    if (block === "all") {
      onChange({ district: area.district, tehsil: value.tehsil, block: "all", gramPanchayat: "all", village: "all" });
      return;
    }
    const gramPanchayat = getGramPanchayats(area.district, area.tehsil, block)[0] || "";
    const village = getVillages(area.district, area.tehsil, block, gramPanchayat)[0] || "";
    onChange({ ...area, block, gramPanchayat, village });
  };

  const setGramPanchayat = (gramPanchayat: string) => {
    if (gramPanchayat === "all") {
      onChange({ district: area.district, tehsil: value.tehsil, block: value.block, gramPanchayat: "all", village: "all" });
      return;
    }
    const village = getVillages(area.district, area.tehsil, area.block, gramPanchayat)[0] || "";
    onChange({ ...area, gramPanchayat, village });
  };

  const prefix = labelPrefix ? `${labelPrefix} ` : "";

  return (
    <div className={className}>
      <div>
        <Label>{prefix}District</Label>
        {shouldUseManualEntry ? (
          <Input value={value.district} onChange={(event) => onChange({ ...value, district: event.target.value })} placeholder="Enter district" />
        ) : (
          <Select value={value.district} onValueChange={setDistrict}>
            <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>
              {includeAll && <SelectItem value="all">All Districts</SelectItem>}
              {districtOptionsList.map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label>{prefix}Tehsil</Label>
        {shouldUseManualEntry ? (
          <Input value={value.tehsil} onChange={(event) => onChange({ ...value, tehsil: event.target.value })} placeholder="Enter tehsil" />
        ) : (
          <Select value={value.tehsil} onValueChange={setTehsil} disabled={isAll}>
            <SelectTrigger><SelectValue placeholder="Select Tehsil" /></SelectTrigger>
            <SelectContent>
              {includeAll && <SelectItem value="all">All Tehsils</SelectItem>}
              {tehsils.map((tehsil) => <SelectItem key={tehsil} value={tehsil}>{tehsil}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label>{prefix}Block</Label>
        {shouldUseManualEntry ? (
          <Input value={value.block} onChange={(event) => onChange({ ...value, block: event.target.value })} placeholder="Enter block" />
        ) : (
          <Select value={value.block} onValueChange={setBlock} disabled={isAll}>
            <SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger>
            <SelectContent>
              {includeAll && <SelectItem value="all">All Blocks</SelectItem>}
              {blocks.map((block) => <SelectItem key={block} value={block}>{block}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label>{prefix}Gram Panchayat</Label>
        {shouldUseManualEntry ? (
          <Input value={value.gramPanchayat} onChange={(event) => onChange({ ...value, gramPanchayat: event.target.value })} placeholder="Enter gram panchayat" />
        ) : (
          <Select value={value.gramPanchayat} onValueChange={setGramPanchayat} disabled={isAll}>
            <SelectTrigger><SelectValue placeholder="Select Gram Panchayat" /></SelectTrigger>
            <SelectContent>
              {includeAll && <SelectItem value="all">All Gram Panchayats</SelectItem>}
              {gramPanchayats.map((panchayat) => <SelectItem key={panchayat} value={panchayat}>{panchayat}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label>{prefix}Village</Label>
        {shouldUseManualEntry ? (
          <Input value={value.village} onChange={(event) => onChange({ ...value, village: event.target.value })} placeholder="Enter village" />
        ) : (
          <Select value={value.village} onValueChange={(village) => onChange({ ...area, village })} disabled={isAll}>
            <SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger>
            <SelectContent>
              {includeAll && <SelectItem value="all">All Villages</SelectItem>}
              {villages.map((village) => <SelectItem key={village} value={village}>{village}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
