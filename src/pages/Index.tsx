import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminAreaSelect } from "@/components/AdminAreaSelect";
import { allAdministrativeFilter, areaForRecord, matchesAdministrativeFilter, type AdministrativeFilter } from "@/lib/adminHierarchy";
import { AlertTriangle, BellRing, Bug as Cow, Landmark, MapPinned, ShieldCheck, Stethoscope, Syringe, Users } from "lucide-react";
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
  listPregnancyRecords,
  listVaccinationRecords,
  listFieldOfficerTasks,
  toggleFieldOfficerTask,
  listFieldOfficers,
} from "@/lib/dataService";
import FieldTasksCard from "@/components/FieldTasksCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FEATURES } from "@/lib/features";

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

const Dashboard = () => {
  const [areaFilter, setAreaFilter] = useState<AdministrativeFilter>(allAdministrativeFilter);
  const { data: dashboardData } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData, initialData: { vaccinationTrends: [], healthStatusData: [], monthlyActivity: [], activities: [] } });
  const { data: animals = [] } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] });
  const { data: farmers = [] } = useQuery({ queryKey: ["farmerRecords"], queryFn: listFarmerRecords, initialData: [] });
  const { data: officers = [] } = useQuery({ queryKey: ["fieldOfficers"], queryFn: listFieldOfficers, initialData: [] });
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const { data: vaccinations = [] } = useQuery({ queryKey: ["vaccinationRecords"], queryFn: listVaccinationRecords, initialData: [] });
  const { data: pregnancyRecords = [] } = useQuery({ queryKey: ["pregnancyRecords"], queryFn: listPregnancyRecords, initialData: [] });
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts, initialData: [] });
  const { data: fieldTasks = [] } = useQuery({ queryKey: ["fieldTasks"], queryFn: listFieldOfficerTasks, initialData: [] });

  const queryClient = useQueryClient();
  const toggleTaskMutation = useMutation({
    mutationFn: (id: number) => toggleFieldOfficerTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldTasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

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

        <Card>
          <CardHeader><CardTitle className="text-sm">Dashboard Filters</CardTitle></CardHeader>
          <CardContent>
            <AdminAreaSelect
              value={areaFilter}
              onChange={(area) => setAreaFilter(area as AdministrativeFilter)}
              includeAll
              districtOptions={[...new Set(animals.map((a) => a.district).filter(Boolean))]}
              tehsilOptions={[...new Set(animals.map((a) => a.tehsil).filter(Boolean))]}
              blockOptions={[...new Set(animals.map((a) => a.block).filter(Boolean))]}
              gramPanchayatOptions={[...new Set(animals.map((a) => a.gramPanchayat).filter(Boolean))]}
              villageOptions={[...new Set(animals.map((a) => a.village).filter(Boolean))]}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <StatCard label="Total Animals" value={filteredAnimals.length} hint="Registered livestock" icon={Cow} />
          <StatCard label="Total Farmers" value={filteredFarmers.length} hint="Scheme-linked owners" icon={Users} tone="blue" />
          <StatCard label="Vaccinated" value={vaccinated} hint={`${coverage}% village coverage`} icon={Syringe} />
          <StatCard label="Critical" value={critical} hint="Immediate attention" icon={AlertTriangle} tone="red" />
          <StatCard label="Pregnant" value={pregnant} hint="Breeding watchlist" icon={ShieldCheck} tone="amber" />
          <StatCard label="Coverage" value={`${coverage}%`} hint="Vaccination progress" icon={MapPinned} tone="blue" />
          <StatCard label="Active Loans" value={activeLoans} hint={`${insuredFarmers} insured owners`} icon={Landmark} tone="amber" />
          <StatCard label="AI Alerts" value={highAlerts} hint="High priority alerts" icon={BellRing} tone="red" />
        </div>
        
        <FieldTasksCard
          tasks={selectedOfficerId ? fieldTasks.filter((t) => {
            const officer = officers.find((o) => o.id === selectedOfficerId);
            if (!officer) return true;
            const villages = officer.assignedVillages || [];
            return !villages.length || villages.includes(t.village);
          }) : fieldTasks}
          onToggle={(id) => toggleTaskMutation.mutate(id)}
          controls={(
            <div className="min-w-[220px]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Officer</label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={selectedOfficerId} onChange={(e) => setSelectedOfficerId(e.target.value)}>
                <option value="">All Officers</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <Card className="xl:col-span-1">
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

          <Card className="xl:col-span-1">
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

          <Card className="xl:col-span-1">
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

          <Card className="xl:col-span-1">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Disease Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>{item.priority}</Badge>
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-medium leading-5">{item.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.type} · {item.time}</p>
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
