import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileSpreadsheet, Map, PieChart, ShieldCheck, Syringe } from "lucide-react";
import { AdminAreaSelect } from "@/components/AdminAreaSelect";
import { allAdministrativeFilter, areaForRecord, buildAdministrativeOptions, matchesAdministrativeFilter, type AdministrativeFilter } from "@/lib/adminHierarchy";
import { useQuery } from "@tanstack/react-query";
import {
  listDiseaseTreatmentRecords,
  listFarmerRecords,
  listLivestockAnimals,
  listDailyFieldReports,
  listEmergencyReports,
  listFieldOfficerTasks,
  listLocations,
  listPhotoEvidence,
  listPregnancyRecords,
  listVaccinationRecords,
  listSupervisorVerifications,
} from "@/lib/dataService";
import type { LocationRecord } from "@/lib/types";
import { useUser } from "@/contexts/UserContext";
import { hasFullAccessRole, matchesUserRegion } from "@/lib/rbac";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsPage = () => {
  const { user } = useUser();
  const isFieldOfficer = user?.role === "field_officer";
  const isAdmin = hasFullAccessRole(user?.role);
  const isRegionalUser = !!user?.role && !hasFullAccessRole(user.role) && user.role === "veterinary_doctor";
  const [areaFilter, setAreaFilter] = useState<AdministrativeFilter>(allAdministrativeFilter);
  const { data: animals = [] } = useQuery({ queryKey: ["livestockAnimals"], queryFn: listLivestockAnimals, initialData: [] });
  const { data: farmers = [] } = useQuery({ queryKey: ["farmerRecords"], queryFn: listFarmerRecords, initialData: [] });
  const { data: diseaseRecords = [] } = useQuery({ queryKey: ["diseaseTreatmentRecords"], queryFn: listDiseaseTreatmentRecords, initialData: [] });
  const { data: dailyFieldReports = [] } = useQuery({ queryKey: ["dailyFieldReports"], queryFn: listDailyFieldReports, initialData: [] });
  const { data: emergencyReports = [] } = useQuery({ queryKey: ["emergencies"], queryFn: listEmergencyReports, initialData: [] });
  const { data: fieldTasks = [] } = useQuery({ queryKey: ["fieldTasks"], queryFn: listFieldOfficerTasks, initialData: [] });
  const { data: photoEvidence = [] } = useQuery({ queryKey: ["photoEvidence"], queryFn: listPhotoEvidence, initialData: [] });
  const { data: pregnancyRecords = [] } = useQuery({ queryKey: ["pregnancyRecords"], queryFn: listPregnancyRecords, initialData: [] });
  const { data: vaccinations = [] } = useQuery({ queryKey: ["vaccinationRecords"], queryFn: listVaccinationRecords, initialData: [] });
  const { data: supervisorVerifications = [] } = useQuery({ queryKey: ["supervisorVerifications"], queryFn: listSupervisorVerifications, initialData: [] });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: listLocations, initialData: [] as LocationRecord[] });
  const adminOptions = useMemo(() => buildAdministrativeOptions(locations), [locations]);

  const officerVillageSet = useMemo(() => {
    if (!isFieldOfficer || !user?.name) {
      return new Set<string>();
    }

    const ownVillages = dailyFieldReports
      .filter((report) => report.officerName === user.name)
      .flatMap((report) => report.villagesVisited)
      .map((village) => village.trim())
      .filter(Boolean);
    return new Set(ownVillages);
  }, [dailyFieldReports, isFieldOfficer, user?.name]);

  const filteredAnimals = useMemo(() => animals.filter((item) => {
    const area = areaForRecord(item);

    if (isAdmin) {
      return matchesAdministrativeFilter(item, areaFilter);
    }

    if (isRegionalUser && user?.region && !matchesUserRegion(user.region, area)) {
      return false;
    }

    if (isFieldOfficer && officerVillageSet.size > 0 && !officerVillageSet.has(area.village)) {
      return false;
    }

    return matchesAdministrativeFilter(item, areaFilter);
  }), [animals, areaFilter, isAdmin, isRegionalUser, isFieldOfficer, user?.region, officerVillageSet]);
  const filteredAnimalIds = new Set(filteredAnimals.map((item) => item.id));
  const filteredVaccinations = vaccinations.filter((item) => filteredAnimalIds.has(item.animalId));
  const filteredVillageRisk = useMemo(() => {
    const villages = Array.from(new Set(filteredAnimals.map((item) => areaForRecord(item).village)));
    return villages.map((village) => {
      const villageAnimals = filteredAnimals.filter((animal) => areaForRecord(animal).village === village);
      const vaccinated = filteredVaccinations.filter((vaccination) => {
        const animal = filteredAnimals.find((item) => item.id === vaccination.animalId);
        return animal ? areaForRecord(animal).village === village && vaccination.status === "Done" : false;
      }).length;
      const total = villageAnimals.length || 1;
      const critical = villageAnimals.filter((animal) => animal.status === "Critical").length;
      return {
        village,
        coverage: Math.round((vaccinated / total) * 100),
        risk: Math.min(100, critical * 30 + Math.max(0, 50 - Math.round((vaccinated / total) * 100))),
        pregnant: pregnancyRecords.filter((record) => villageAnimals.some((animal) => animal.id === record.animalId)).length,
      };
    });
  }, [filteredAnimals, pregnancyRecords, filteredVaccinations]);
  const filteredDiseaseRecords = diseaseRecords.filter((item) => filteredAnimalIds.has(item.animalId));
  const filteredPregnancyRecords = pregnancyRecords.filter((item) => filteredAnimalIds.has(item.animalId));
  const filteredPhotoEvidence = photoEvidence.filter((item) => {
    if (isFieldOfficer && user?.name && item.officerName !== user.name) {
      return false;
    }
    if (isRegionalUser && user?.region && !matchesUserRegion(user.region, areaForRecord(item))) {
      return false;
    }
    return matchesAdministrativeFilter(item, areaFilter);
  });
  const filteredFieldTasks = fieldTasks.filter((item) => matchesAdministrativeFilter(item, areaFilter));
  const filteredEmergencies = emergencyReports.filter((item) => {
    if (isFieldOfficer && user?.name && item.officerName !== user.name) {
      return false;
    }
    if (isRegionalUser && user?.region && !matchesUserRegion(user.region, areaForRecord(item))) {
      return false;
    }
    return matchesAdministrativeFilter(item, areaFilter);
  });
  const visibleDailyReports = dailyFieldReports.filter((item) => {
    if (isFieldOfficer && user?.name && item.officerName !== user.name) {
      return false;
    }
    if (isRegionalUser && user?.region) {
      const firstVillage = item.villagesVisited[0] || "";
      if (!matchesUserRegion(user.region, areaForRecord({ village: firstVillage }))) {
        return false;
      }
    }
    return true;
  });

  const speciesRows = Object.entries(filteredAnimals.reduce<Record<string, number>>((acc, item) => {
    const species = normalizeSpeciesLabel(item.species);
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {})).map(([species, count]) => ({ species, count }));

  const tehsilRows = groupByArea(filteredAnimals, "tehsil");
  const blockVaccinationRows = groupByArea(filteredAnimals, "block").map((row) => ({
    ...row,
    vaccinated: filteredVaccinations.filter((vaccination) => {
      const animal = filteredAnimals.find((item) => item.id === vaccination.animalId);
      return animal ? areaForRecord(animal).block === row.name && vaccination.status === "Done" : false;
    }).length,
  }));
  const panchayatDiseaseRows = groupByArea(filteredAnimals, "gramPanchayat").map((row) => ({
    ...row,
    diseaseCases: filteredDiseaseRecords.filter((record) => {
      const animal = filteredAnimals.find((item) => item.id === record.animalId);
      return animal && areaForRecord(animal).gramPanchayat === row.name;
    }).length,
  }));
  const villageRows = groupByArea(filteredAnimals, "village");

  const exportCsv = (filename: string) => {
    const rows = [
      ["District", "Tehsil", "Block", "Gram Panchayat", "Village", "Animals", "Vaccinated", "Disease Cases", "Pregnant"],
      ...villageRows.map((row) => {
        const area = areaForRecord(filteredAnimals.find((animal) => areaForRecord(animal).village === row.name) || { village: row.name });
        return [
          area.district,
          area.tehsil,
          area.block,
          area.gramPanchayat,
          area.village,
          row.animals,
          filteredAnimals.filter((animal) => areaForRecord(animal).village === row.name && animal.vaccinationStatus === "Done").length,
          filteredDiseaseRecords.filter((record) => areaForRecord(filteredAnimals.find((animal) => animal.id === record.animalId) || {}).village === row.name).length,
          filteredPregnancyRecords.filter((record) => areaForRecord(filteredAnimals.find((animal) => animal.id === record.animalId) || {}).village === row.name).length,
        ];
      }),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("e-Pashu Administrative Area Coverage Report", 14, 14);
    autoTable(doc, {
      startY: 22,
      head: [["Tehsil", "Block", "Gram Panchayat", "Village", "Animals", "Vaccinated", "Disease Cases"]],
      body: villageRows.map((row) => {
        const area = areaForRecord(filteredAnimals.find((animal) => areaForRecord(animal).village === row.name) || { village: row.name });
        return [area.tehsil, area.block, area.gramPanchayat, area.village, row.animals, filteredAnimals.filter((animal) => areaForRecord(animal).village === row.name && animal.vaccinationStatus === "Done").length, filteredDiseaseRecords.filter((record) => areaForRecord(filteredAnimals.find((animal) => animal.id === record.animalId) || {}).village === row.name).length];
      }),
      headStyles: { fillColor: [21, 128, 61] },
    });
    doc.save("e-pashu-administrative-area-report.pdf");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Reports & Analytics" description="Village-wise reports, species reports, vaccination coverage, disease outbreak analytics and export tools.">
          <Button variant="outline" onClick={() => exportCsv("e-pashu-village-report.csv")}><Download className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" onClick={() => exportCsv("e-pashu-village-report.xls")}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button onClick={exportPdf}><Download className="mr-2 h-4 w-4" /> PDF</Button>
        </PageHeader>

        <Card>
          <CardHeader><CardTitle className="text-sm">Dashboard Filters</CardTitle></CardHeader>
          <CardContent>
            <AdminAreaSelect
              value={areaFilter}
              onChange={(area) => setAreaFilter(area as AdministrativeFilter)}
              includeAll
              hideVillage
              districtOptions={adminOptions.districts}
              tehsilOptions={adminOptions.tehsils}
              blockOptions={adminOptions.blocks}
              gramPanchayatOptions={adminOptions.gramPanchayats}
              villageOptions={adminOptions.villages}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Village Reports" value={villageRows.length} hint="Filtered villages" icon={Map} />
          <StatCard label="Species Reports" value={speciesRows.length} hint="Species categories" icon={PieChart} tone="blue" />
          <StatCard label="Coverage" value={`${Math.round((filteredVaccinations.filter((item) => item.status === "Done").length / Math.max(filteredVaccinations.length, 1)) * 100)}%`} hint="Filtered vaccination" icon={Syringe} />
          <StatCard label="Outbreak Cases" value={filteredDiseaseRecords.filter((d) => d.criticalAlert).length} hint="Critical disease signals" icon={Download} tone="red" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard label="Field Reports" value={visibleDailyReports.length} hint="Submitted and draft reports" icon={FileSpreadsheet} tone="blue" />
          <StatCard label="Photo Evidence" value={filteredPhotoEvidence.length} hint="Filtered uploads" icon={Map} />
          <StatCard label="Pending Field Tasks" value={filteredFieldTasks.filter((task) => task.status !== "Completed").length} hint="Officer workflow queue" icon={Download} tone="amber" />
          <StatCard label="Verified Visits" value={supervisorVerifications.filter((item) => item.visitVerified).length} hint="Supervisor approved" icon={ShieldCheck} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm">Vaccination Coverage</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={filteredVillageRisk}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip cursor={false} />
                  <Bar dataKey="coverage" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Disease Outbreak Analytics</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={filteredVillageRisk}>
                  <XAxis dataKey="village" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip cursor={false} />
                  <Line type="monotone" dataKey="risk" stroke="#dc2626" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Species Report</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Species</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
                <TableBody>{speciesRows.map((row) => <TableRow key={row.species}><TableCell>{row.species}</TableCell><TableCell>{row.count}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Administrative Area Reports</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportTable title="Tehsil-wise Animal Statistics" rows={tehsilRows} valueLabel="Animals" />
            <ReportTable title="Block-wise Vaccination Reports" rows={blockVaccinationRows.map((row) => ({ name: row.name, animals: row.vaccinated }))} valueLabel="Vaccinated" />
            <ReportTable title="Panchayat-wise Disease Reports" rows={panchayatDiseaseRows.map((row) => ({ name: row.name, animals: row.diseaseCases }))} valueLabel="Disease Cases" />
            <ReportTable title="Village-wise Livestock Reports" rows={villageRows} valueLabel="Animals" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Village-wise Analytics</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead>Gram Panchayat</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Animals</TableHead>
                  <TableHead>Vaccination Coverage</TableHead>
                  <TableHead>Health Risk</TableHead>
                  <TableHead>Pregnant Animals</TableHead>
                  <TableHead>Disease Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVillageRisk.map((row) => (
                  <TableRow key={row.village}>
                    <TableCell>{areaForRecord(filteredAnimals.find((animal) => areaForRecord(animal).village === row.village) || { village: row.village }).block}</TableCell>
                    <TableCell>{areaForRecord(filteredAnimals.find((animal) => areaForRecord(animal).village === row.village) || { village: row.village }).gramPanchayat}</TableCell>
                    <TableCell className="font-medium">{row.village}</TableCell>
                    <TableCell>{filteredAnimals.filter((a) => areaForRecord(a).village === row.village).length}</TableCell>
                    <TableCell>{row.coverage}%</TableCell>
                    <TableCell>{row.risk}%</TableCell>
                    <TableCell>{filteredPregnancyRecords.filter((p) => areaForRecord(filteredAnimals.find((a) => a.id === p.animalId) || { village: row.village }).village === row.village).length}</TableCell>
                    <TableCell>{filteredDiseaseRecords.filter((d) => areaForRecord(filteredAnimals.find((a) => a.id === d.animalId) || { village: row.village }).village === row.village).length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Field Officer Daily Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Villages Visited</TableHead>
                    <TableHead>Vaccinated</TableHead>
                    <TableHead>Disease Cases</TableHead>
                    <TableHead>Pregnancy Checks</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDailyReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.officerName}</TableCell>
                      <TableCell>{report.reportDate}</TableCell>
                      <TableCell>{report.villagesVisited.join(", ")}</TableCell>
                      <TableCell>{report.animalsVaccinated}</TableCell>
                      <TableCell>{report.diseaseCasesIdentified}</TableCell>
                      <TableCell>{report.pregnantAnimalsChecked}</TableCell>
                      <TableCell>{report.photosUploaded}</TableCell>
                      <TableCell>{report.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Emergency reports open today: {filteredEmergencies.filter((item) => item.status !== "Resolved").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

function groupByArea(items: typeof animals, key: "tehsil" | "block" | "gramPanchayat" | "village") {
  return Object.entries(items.reduce<Record<string, number>>((acc, item) => {
    const area = areaForRecord(item);
    acc[area[key]] = (acc[area[key]] || 0) + 1;
    return acc;
  }, {})).map(([name, animals]) => ({ name, animals }));
}

function ReportTable({ title, rows, valueLabel }: { title: string; rows: Array<{ name: string; animals: number }>; valueLabel: string }) {
  return (
    <div className="rounded-md border">
      <div className="border-b px-3 py-2 text-sm font-medium">{title}</div>
      <Table>
        <TableHeader><TableRow><TableHead>Area</TableHead><TableHead>{valueLabel}</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((row) => <TableRow key={`${title}-${row.name}`}><TableCell>{row.name}</TableCell><TableCell>{row.animals}</TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  );
}

function normalizeSpeciesLabel(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "undefined" || raw.toLowerCase() === "null") {
    return "Unspecified";
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export default ReportsPage;
