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
import { safeSelectOptions } from "@/lib/selectOptions";

type AreaValue = AdministrativeArea | AdministrativeFilter;

interface AdminAreaSelectProps {
  value: AreaValue;
  onChange: (value: AreaValue) => void;
  labelPrefix?: string;
  includeAll?: boolean;
  allowManualEntry?: boolean;
  hideVillage?: boolean;
  className?: string;
  inlineLabels?: boolean;
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
  hideVillage = false,
  className = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5",
  inlineLabels = false,
  districtOptions = [],
  tehsilOptions = [],
  blockOptions = [],
  gramPanchayatOptions = [],
  villageOptions = [],
}: AdminAreaSelectProps) {
  const isAll = value.district === "all";
  const area = isAll ? defaultAdministrativeArea : (value as AdministrativeArea);
  const districtOptionsList = safeSelectOptions(districtOptions && districtOptions.length ? districtOptions : getDistricts());
  const shouldUseManualEntry = allowManualEntry || districtOptionsList.length === 0;
  const tehsils = safeSelectOptions(tehsilOptions && tehsilOptions.length ? tehsilOptions : getTehsils(area.district));
  const blocks = safeSelectOptions(blockOptions && blockOptions.length ? blockOptions : getBlocks(area.district, area.tehsil));
  const gramPanchayats = safeSelectOptions(gramPanchayatOptions && gramPanchayatOptions.length ? gramPanchayatOptions : getGramPanchayats(area.district, area.tehsil, area.block));
  const villages = safeSelectOptions(villageOptions && villageOptions.length ? villageOptions : getVillages(area.district, area.tehsil, area.block, area.gramPanchayat));
  const resolveVillage = (district: string, tehsil: string, block: string, gramPanchayat: string) => {
    const nextVillages = safeSelectOptions(villageOptions && villageOptions.length ? villageOptions : getVillages(district, tehsil, block, gramPanchayat));
    return nextVillages[0] || gramPanchayat || "";
  };

  const setDistrict = (district: string) => {
    if (district === "all") {
      onChange(allAdministrativeFilter);
      return;
    }
    const tehsil = getTehsils(district)[0] || "";
    const block = getBlocks(district, tehsil)[0] || "";
    const gramPanchayat = getGramPanchayats(district, tehsil, block)[0] || "";
    const village = resolveVillage(district, tehsil, block, gramPanchayat);
    onChange({ district, tehsil, block, gramPanchayat, village });
  };

  const setTehsil = (tehsil: string) => {
    if (tehsil === "all") {
      onChange({ district: area.district, tehsil: "all", block: "all", gramPanchayat: "all", village: "all" });
      return;
    }
    const block = getBlocks(area.district, tehsil)[0] || "";
    const gramPanchayat = getGramPanchayats(area.district, tehsil, block)[0] || "";
    const village = resolveVillage(area.district, tehsil, block, gramPanchayat);
    onChange({ district: area.district, tehsil, block, gramPanchayat, village });
  };

  const setBlock = (block: string) => {
    if (block === "all") {
      onChange({ district: area.district, tehsil: value.tehsil, block: "all", gramPanchayat: "all", village: "all" });
      return;
    }
    const gramPanchayat = getGramPanchayats(area.district, area.tehsil, block)[0] || "";
    const village = resolveVillage(area.district, area.tehsil, block, gramPanchayat);
    onChange({ ...area, block, gramPanchayat, village });
  };

  const setGramPanchayat = (gramPanchayat: string) => {
    if (gramPanchayat === "all") {
      onChange({ district: area.district, tehsil: value.tehsil, block: value.block, gramPanchayat: "all", village: "all" });
      return;
    }
    const village = resolveVillage(area.district, area.tehsil, area.block, gramPanchayat);
    onChange({ ...area, gramPanchayat, village });
  };

  const prefix = labelPrefix ? `${labelPrefix} ` : "";

  return (
    <div className={className}>
      <div className={inlineLabels ? "flex items-center gap-3" : undefined}>
        <Label className={inlineLabels ? "w-36" : undefined}>{prefix}District</Label>
        <div className={inlineLabels ? "flex-1" : undefined}>
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
      </div>
      <div className={inlineLabels ? "flex items-center gap-3" : undefined}>
        <Label className={inlineLabels ? "w-36" : undefined}>{prefix}Tehsil</Label>
        <div className={inlineLabels ? "flex-1" : undefined}>
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
      </div>
      <div className={inlineLabels ? "flex items-center gap-3" : undefined}>
        <Label className={inlineLabels ? "w-36" : undefined}>{prefix}Block</Label>
        <div className={inlineLabels ? "flex-1" : undefined}>
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
      </div>
      <div className={inlineLabels ? "flex items-center gap-3" : undefined}>
        <Label className={inlineLabels ? "w-36" : undefined}>{prefix}Gram Panchayat</Label>
        <div className={inlineLabels ? "flex-1" : undefined}>
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
      </div>
      {!hideVillage && (
        <div className={inlineLabels ? "flex items-center gap-3" : undefined}>
          <Label className={inlineLabels ? "w-36" : undefined}>{prefix}Village</Label>
          <div className={inlineLabels ? "flex-1" : undefined}>
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
      )}
    </div>
  );
}
