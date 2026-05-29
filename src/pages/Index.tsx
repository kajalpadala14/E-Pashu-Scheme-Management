import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, AlertTriangle, BellRing, Bug as Cow, Landmark, MapPinned, Syringe, Users } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { allAdministrativeFilter, areaForRecord, matchesAdministrativeFilter, type AdministrativeFilter } from "@/lib/adminHierarchy";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// Note: use Apps Script-backed data via dataService; do not fall back to mock/demo data.
import {
  getDashboardData,
  listAlerts,
  listFarmerRecords,
  listLivestockAnimals,
  listLocations,
  listPregnancyRecords,
  listVaccinationRecords,
} from "@/lib/dataService";
import { FEATURES } from "@/lib/features";
import type { LocationRecord } from "@/lib/types";

const colors = ["#15803d", "#0369a1", "#ca8a04", "#7c3aed", "#dc2626", "#0f766e", "#475569"];
const knownSpecies = new Set(["Cattle", "Buffalo", "Sheep", "Goat", "Pig", "Hen", "Duck"]);

function speciesName(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") {
    return "Unspecified";
  }
  const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return knownSpecies.has(normalized) ? normalized : raw;
}

function isCriticalAnimal(item: { status?: string; diseaseStatus?: string }) {
  const status = String(item.status || "").trim().toLowerCase();
  const diseaseStatus = String(item.diseaseStatus || "").trim().toLowerCase();
  return status === "critical" || diseaseStatus === "confirmed" || diseaseStatus === "suspected";
}

function isPregnantAnimal(item: { pregnancyStatus?: string }) {
  const status = String(item.pregnancyStatus || "").trim().toLowerCase();
  return status === "pregnant" || status === "due soon";
}

type LocationArea = {
  district: string;
  tehsil: string;
  block: string;
  gramPanchayat: string;
  village: string;
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildLocationOptions(records: Array<Partial<LocationArea> & { village?: string }>) {
  const areas = records.map((record) => areaForRecord(record));

  return {
    districts: uniqueValues(areas.map((area) => area.district)),
    getTehsils: (district: string) => uniqueValues(areas.filter((area) => area.district === district).map((area) => area.tehsil)),
    getBlocks: (district: string, tehsil: string) => uniqueValues(areas.filter((area) => area.district === district && area.tehsil === tehsil).map((area) => area.block)),
    getGramPanchayats: (district: string, tehsil: string, block: string) => uniqueValues(areas.filter((area) => area.district === district && area.tehsil === tehsil && area.block === block).map((area) => area.gramPanchayat)),
    getVillages: (district: string, tehsil: string, block: string, gramPanchayat: string) => uniqueValues(areas.filter((area) => area.district === district && area.tehsil === tehsil && area.block === block && area.gramPanchayat === gramPanchayat).map((area) => area.village)),
  };
}

function SearchableDropdown({
  label,
  value,
  options,
  onSelect,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = value === "all" ? "All" : value || "All";

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full justify-between bg-background text-left font-normal"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}`} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onSelect("all");
                    setOpen(false);
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === "all" ? "opacity-100" : "opacity-0"}`} />
                  All
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                  >
                    <Check className={`mr-2 h-4 w-4 ${value === option ? "opacity-100" : "opacity-0"}`} />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const Dashboard = () => {
  const [areaFilter, setAreaFilter] = useState<AdministrativeFilter>(allAdministrativeFilter);
  const { data: dashboardData } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData, initialData: { vaccinationTrends: [], healthStatusData: [], monthlyActivity: [], activities: [] } });
  const { data: animals = [] } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] });
  const { data: farmers = [] } = useQuery({ queryKey: ["farmerRecords"], queryFn: listFarmerRecords, initialData: [] });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, initialData: [] as LocationRecord[] });
  const { data: vaccinations = [] } = useQuery({ queryKey: ["vaccinationRecords"], queryFn: listVaccinationRecords, initialData: [] });
  const { data: pregnancyRecords = [] } = useQuery({ queryKey: ["pregnancyRecords"], queryFn: listPregnancyRecords, initialData: [] });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts, initialData: [] });

  const locationOptions = useMemo(() => buildLocationOptions(locations), [locations]);
  const hasLocationData = locationOptions.districts.length > 0;
  const selectedArea = areaFilter.district === "all" ? null : areaFilter;

  const filteredAnimals = useMemo(() => animals.filter((item) => matchesAdministrativeFilter(item, areaFilter)), [animals, areaFilter]);
  const filteredFarmers = farmers.filter((item) => matchesAdministrativeFilter(item, areaFilter));
  const filteredAnimalIds = new Set(filteredAnimals.map((item) => item.id));
  const filteredVaccinations = vaccinations.filter((item) => filteredAnimalIds.has(item.animalId));
  const filteredPregnancyRecords = pregnancyRecords.filter((item) => filteredAnimalIds.has(item.animalId));
  const filteredVillageHealthRisk = useMemo(() => {
    const villages = Array.from(new Set(filteredAnimals.map((item) => areaForRecord(item).village)));
    return villages.map((village) => {
      const villageAnimals = filteredAnimals.filter((animal) => areaForRecord(animal).village === village);
      const villageVaccinations = filteredVaccinations.filter((vaccination) => villageAnimals.some((animal) => animal.id === vaccination.animalId));
      const criticalCount = villageAnimals.filter(isCriticalAnimal).length;
      const pregnantAnimalIds = new Set([
        ...villageAnimals.filter(isPregnantAnimal).map((animal) => animal.id),
        ...filteredPregnancyRecords
          .filter((record) => villageAnimals.some((animal) => animal.id === record.animalId) && (record.status === "Pregnant" || record.status === "Due Soon"))
          .map((record) => record.animalId),
      ]);
      const pregnantCount = pregnantAnimalIds.size;
      const coverage = villageVaccinations.length ? Math.round((villageVaccinations.filter((item) => item.status === "Done").length / villageVaccinations.length) * 100) : 0;

      return {
        village,
        risk: Math.min(100, criticalCount * 25 + Math.max(0, 40 - coverage)),
        coverage,
        pregnant: pregnantCount,
      };
    });
  }, [filteredAnimals, filteredVaccinations, filteredPregnancyRecords]);
  const speciesDistribution = Object.entries(
    filteredAnimals.reduce<Record<string, number>>((acc, item) => {
      const name = speciesName(item.species);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const vaccinated = filteredVaccinations.filter((item) => item.status === "Done").length;
  const critical = filteredAnimals.filter(isCriticalAnimal).length;
  const pregnant = new Set([
    ...filteredAnimals.filter(isPregnantAnimal).map((item) => item.id),
    ...filteredPregnancyRecords.filter((item) => item.status === "Pregnant" || item.status === "Due Soon").map((item) => item.animalId),
  ]).size;
  const coverage = Math.round((vaccinated / Math.max(filteredVaccinations.length, 1)) * 100);
  const activeLoans = filteredFarmers.filter((item) => item.loanStatus === "Active").length;
  const insuredFarmers = filteredFarmers.filter((item) => item.insuranceStatus === "Insured").length;
  const highAlerts = alerts.filter((item) => item.priority === "High").length;
  const vaccinationTrends = dashboardData?.vaccinationTrends?.length
    ? dashboardData.vaccinationTrends
    : Object.entries(vaccinations.reduce<Record<string, number>>((acc, item) => {
      const month = String(item.dueDate || "").slice(0, 7) || "No Date";
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})).map(([month, count]) => ({ month, vaccinations: count }));
  const activities = dashboardData?.activities?.length ? dashboardData.activities : [
    ...animals.slice(-3).map((item) => ({ action: "Animal Registered", detail: `${item.id} ${item.ownerName ? `owned by ${item.ownerName}` : "added"}`, time: item.dataEntryDate || "Sheet row" })),
    ...farmers.slice(-2).map((item) => ({ action: "Farmer Registered", detail: `${item.name} added with ${item.totalAnimals || 0} animals`, time: "Sheet row" })),
    ...vaccinations.slice(-2).map((item) => ({ action: "Vaccination Updated", detail: `${item.vaccineName || "Vaccine"} for ${item.animalId} is ${item.status}`, time: item.dueDate || "Sheet row" })),
  ].slice(0, 6);

  const speciesDistributionHasData = speciesDistribution.length > 0;
  const vaccinationTrendsHasData = vaccinationTrends.length > 0;
  const villageHealthRiskHasData = filteredVillageHealthRisk.length > 0;
  const pregnancyTrackingHasData = filteredPregnancyRecords.length > 0 || filteredVillageHealthRisk.some((item) => item.pregnant > 0);

  const setDistrict = (district: string) => {
    if (district === "all") {
      setAreaFilter(allAdministrativeFilter);
      return;
    }

    const tehsil = locationOptions.getTehsils(district)[0] || "";
    const block = locationOptions.getBlocks(district, tehsil)[0] || "";
    const gramPanchayat = locationOptions.getGramPanchayats(district, tehsil, block)[0] || "";
    const village = locationOptions.getVillages(district, tehsil, block, gramPanchayat)[0] || "";
    setAreaFilter({ district, tehsil, block, gramPanchayat, village });
  };

  const setTehsil = (tehsil: string) => {
    if (!selectedArea) {
      return;
    }

    const block = locationOptions.getBlocks(selectedArea.district, tehsil)[0] || "";
    const gramPanchayat = locationOptions.getGramPanchayats(selectedArea.district, tehsil, block)[0] || "";
    const village = locationOptions.getVillages(selectedArea.district, tehsil, block, gramPanchayat)[0] || "";
    setAreaFilter({ district: selectedArea.district, tehsil, block, gramPanchayat, village });
  };

  const setBlock = (block: string) => {
    if (!selectedArea) {
      return;
    }

    const gramPanchayat = locationOptions.getGramPanchayats(selectedArea.district, selectedArea.tehsil, block)[0] || "";
    const village = locationOptions.getVillages(selectedArea.district, selectedArea.tehsil, block, gramPanchayat)[0] || "";
    setAreaFilter({ ...selectedArea, block, gramPanchayat, village });
  };

  const setGramPanchayat = (gramPanchayat: string) => {
    if (!selectedArea) {
      return;
    }

    const village = locationOptions.getVillages(selectedArea.district, selectedArea.tehsil, selectedArea.block, gramPanchayat)[0] || gramPanchayat;
    setAreaFilter({ ...selectedArea, gramPanchayat, village });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Government Livestock Command Dashboard"
          description="Real-time departmental view of registered animals, farmer services, vaccination coverage, breeding, disease surveillance and field operations."
        >
          <Badge variant="outline" className="h-8 bg-card">{areaFilter.district === "all" ? "All Administrative Areas" : `${areaFilter.district} / ${areaFilter.block}`}</Badge>
          <Badge className="h-8 bg-primary">{FEATURES.ENABLE_LIVE_MONITORING ? "Live Monitoring" : "Monitoring Disabled"}</Badge>
        </PageHeader>

        {hasLocationData ? (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Location Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SearchableDropdown label="District" value={areaFilter.district} options={locationOptions.districts} onSelect={setDistrict} />
                <SearchableDropdown label="Tehsil" value={selectedArea?.tehsil || "all"} options={selectedArea ? locationOptions.getTehsils(selectedArea.district) : []} onSelect={setTehsil} disabled={!selectedArea} />
                <SearchableDropdown label="Block" value={selectedArea?.block || "all"} options={selectedArea ? locationOptions.getBlocks(selectedArea.district, selectedArea.tehsil) : []} onSelect={setBlock} disabled={!selectedArea} />
                <SearchableDropdown label="Gram Panchayat" value={selectedArea?.gramPanchayat || "all"} options={selectedArea ? locationOptions.getGramPanchayats(selectedArea.district, selectedArea.tehsil, selectedArea.block) : []} onSelect={setGramPanchayat} disabled={!selectedArea} />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <StatCard label="Total Animals" value={filteredAnimals.length} hint="Registered livestock" icon={Cow} />
          <StatCard label="Total Farmers" value={filteredFarmers.length} hint="Scheme-linked owners" icon={Users} tone="blue" />
          <StatCard label="Vaccinations" value={vaccinated} hint={`${coverage}% village coverage`} icon={Syringe} />
          <StatCard label="Critical Cases" value={critical} hint="Immediate attention" icon={AlertTriangle} tone="red" />
          <StatCard label="Coverage" value={`${coverage}%`} hint="Vaccination progress" icon={MapPinned} tone="blue" />
          <StatCard label="Active Loans" value={activeLoans} hint={`${insuredFarmers} insured owners`} icon={Landmark} tone="amber" />
          <StatCard label="Alerts" value={alerts.length} hint={`${highAlerts} high priority`} icon={BellRing} tone="red" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {speciesDistributionHasData ? (
            <Card className="xl:col-span-1 border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Species Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={speciesDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {speciesDistribution.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {speciesDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          ) : null}

          {vaccinationTrendsHasData ? (
          <Card className="xl:col-span-1 border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Vaccination Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vaccinationTrends}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={false} />
                  <Line type="monotone" dataKey="vaccinations" stroke="#15803d" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          ) : null}

          {villageHealthRiskHasData ? (
          <Card className="xl:col-span-1 border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Village Health Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredVillageHealthRisk}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="risk" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="coverage" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          ) : null}

          {pregnancyTrackingHasData ? (
          <Card className="xl:col-span-1 border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Pregnancy Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredVillageHealthRisk}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="pregnant" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Recent Department Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((item) => (
                <div key={`${item.action}-${item.time}`} className="flex items-start gap-3 rounded-md border bg-muted/30 p-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
