import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Edit3, Plus, Route, Search, ShieldCheck, Stethoscope, Trash2, UserCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { deleteUserByEmail, listUsers, upsertUser } from "@/lib/dataService";
import { ROLE_OPTIONS, normalizeRole, type UserRole } from "@/lib/rbac";
import type { UserDirectoryRecord } from "@/lib/types";
import { sessionRoleLabels, useUser } from "@/contexts/UserContext";

type RoleFilterValue = "all" | UserRole;
type StatusFilterValue = "all" | "active" | "inactive";

const blankUser: Omit<UserDirectoryRecord, "createdAt" | "updatedAt"> = {
  id: "",
  name: "",
  email: "",
  role: "veterinary_doctor",
  region: "",
  active: true,
};

const roleFilterOptions: Array<{ value: RoleFilterValue; label: string }> = [
  { value: "all", label: "All Roles" },
  ...ROLE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

const statusFilterOptions: Array<{ value: StatusFilterValue; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EmployeesPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDirectoryRecord | null>(null);
  const [form, setForm] = useState(blankUser);
  const [formError, setFormError] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    initialData: [] as UserDirectoryRecord[],
  });

  const saveMutation = useMutation({
    mutationFn: (input: Omit<UserDirectoryRecord, "createdAt" | "updatedAt"> & Partial<Pick<UserDirectoryRecord, "createdAt" | "updatedAt">>) =>
      upsertUser(input, { actorRole: user?.role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (email: string) => deleteUserByEmail(email, { actorRole: user?.role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const summary = useMemo(() => {
    return users.reduce(
      (accumulator, item) => {
        accumulator.total += 1;
        if (item.active) {
          accumulator.active += 1;
        }
        if (item.role === "field_officer") {
          accumulator.fieldOfficers += 1;
        }
        if (item.role === "veterinary_doctor") {
          accumulator.veterinaryDoctors += 1;
        }
        if (item.role === "departmental_officer") {
          accumulator.departmentalOfficers += 1;
        }
        if (item.role === "deputy_director_vet") {
          accumulator.deputyDirectors += 1;
        }
        return accumulator;
      },
      {
        total: 0,
        active: 0,
        fieldOfficers: 0,
        veterinaryDoctors: 0,
        departmentalOfficers: 0,
        deputyDirectors: 0,
      },
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((item) => {
      const matchesSearch =
        !query ||
        [item.name, item.email, item.region, sessionRoleLabels[item.role], item.active ? "active" : "inactive"]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? item.active : !item.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  const requireEditAccess = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to add, edit, or remove employees." });
      navigate("/login");
      return false;
    }

    return true;
  };

  const openEditor = (record?: UserDirectoryRecord) => {
    if (!requireEditAccess()) {
      return;
    }

    setFormError("");
    if (record) {
      setEditingUser(record);
      setForm({
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role,
        region: record.region,
        active: record.active,
      });
    } else {
      setEditingUser(null);
      setForm(blankUser);
    }
    setDialogOpen(true);
  };

  const closeEditor = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setForm(blankUser);
    setFormError("");
  };

  const submitEmployee = async () => {
    if (!requireEditAccess()) {
      return;
    }

    const missingFields = [
      !form.name.trim() ? "Name" : "",
      !form.email.trim() ? "Email" : "",
      !form.role ? "Role" : "",
    ].filter(Boolean);

    if (missingFields.length) {
      const message = `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required.`;
      setFormError(message);
      toast({ title: "Missing details", description: message, variant: "destructive" });
      return;
      }

    try {
      await saveMutation.mutateAsync({
        ...form,
        id: form.id || `USR-${Date.now()}`,
        email: form.email.trim().toLowerCase(),
        role: normalizeRole(form.role),
        createdAt: editingUser?.createdAt,
        updatedAt: editingUser?.updatedAt,
      });
      toast({ title: editingUser ? "Employee updated" : "Employee added", description: `${form.name} has been saved to the sheet.` });
      closeEditor();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save employee",
        variant: "destructive",
      });
    }
  };

  const removeEmployee = async (record: UserDirectoryRecord) => {
    if (!requireEditAccess()) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(record.email);
      toast({ title: "Employee removed", description: `${record.name} was removed from the sheet.` });
    } catch (error) {
      toast({
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Could not remove employee",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const updateForm = <K extends keyof typeof blankUser>(key: K, value: (typeof blankUser)[K]) => {
    setFormError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Employee Directory"
          description="Real-time employee data from the Users sheet with centralized roles, filtering, and responsive management tools."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Total Employees", value: summary.total, icon: Users, iconClass: "bg-slate-100 text-slate-700" },
            { label: "Active Employees", value: summary.active, icon: UserCheck, iconClass: "bg-emerald-100 text-emerald-700" },
            { label: "Field Officers", value: summary.fieldOfficers, icon: Route, iconClass: "bg-sky-100 text-sky-700" },
            { label: "Veterinary Doctors", value: summary.veterinaryDoctors, icon: Stethoscope, iconClass: "bg-indigo-100 text-indigo-700" },
            { label: "Departmental Officers", value: summary.departmentalOfficers, icon: Building2, iconClass: "bg-amber-100 text-amber-700" },
            { label: "Deputy Directors", value: summary.deputyDirectors, icon: ShieldCheck, iconClass: "bg-rose-100 text-rose-700" },
          ].map((card) => (
            <Card key={card.label} className="group overflow-hidden border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-end justify-between gap-4 p-5">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border border-border/60 shadow-sm transition-transform duration-200 group-hover:scale-105 ${card.iconClass}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
              <div className="space-y-2">
                <Label>Search Employee</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, email, role, region, or status"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>All Roles</Label>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilterValue)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleFilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>All Status</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
                  Reset Filters
                </Button>
                <Dialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    if (open) {
                      if (!requireEditAccess()) {
                        return;
                      }
                      setDialogOpen(true);
                      return;
                    }
                    closeEditor();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => openEditor()} className="w-full lg:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="space-y-2">
                      <DialogTitle>{editingUser ? "Edit Employee" : "Add Employee"}</DialogTitle>
                      <p className="text-sm text-muted-foreground">Manage access data stored in the Users sheet.</p>
                    </DialogHeader>

                    {formError ? (
                      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {formError}
                      </div>
                    ) : null}

                    <div className="space-y-6">
                      <section className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Personal Information</p>
                          <p className="text-xs text-muted-foreground">Name, email, and role are required.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                              value={form.name}
                              onChange={(event) => updateForm("name", event.target.value)}
                              placeholder="Employee name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                              value={form.email}
                              onChange={(event) => updateForm("email", event.target.value)}
                              placeholder="employee@epashu.gov"
                            />
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Assignment Details</p>
                          <p className="text-xs text-muted-foreground">Role and status control access and visibility.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Role *</Label>
                            <Select value={form.role} onValueChange={(value) => updateForm("role", normalizeRole(value))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Region</Label>
                            <Input
                              value={form.region}
                              onChange={(event) => updateForm("region", event.target.value)}
                              placeholder="Optional"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label>Status *</Label>
                            <Select
                              value={form.active ? "active" : "inactive"}
                              onValueChange={(value) => updateForm("active", value === "active")}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </section>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={closeEditor}>
                          Cancel
                        </Button>
                        <Button onClick={submitEmployee}>{editingUser ? "Save Employee" : "Create Employee"}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base font-semibold">Employee Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <div className="rounded-full border border-dashed border-muted-foreground/30 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
                  No Employees Found
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">Add your first employee to get started.</p>
                  <p className="text-sm text-muted-foreground">Create access records directly from the Users sheet.</p>
                </div>
                <Button onClick={() => openEditor()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <div className="rounded-full border border-dashed border-muted-foreground/30 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
                  No Matching Employees
                </div>
                <p className="max-w-md text-sm text-muted-foreground">Try a different name, role, or status filter.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="py-4">Employee Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((record) => (
                        <TableRow key={record.email} className="transition-colors hover:bg-muted/40">
                          <TableCell className="font-medium text-foreground">{record.name}</TableCell>
                          <TableCell className="text-muted-foreground">{record.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border/70 bg-background text-foreground">
                              {sessionRoleLabels[record.role]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{record.region || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                record.active
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                              }
                              variant="outline"
                            >
                              {record.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditor(record)}>
                                <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeEmployee(record)}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 p-4 md:hidden">
                  {filteredUsers.map((record) => (
                    <Card key={record.email} className="border-border/60 shadow-sm">
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-base font-semibold text-foreground">{record.name}</p>
                            <p className="text-sm text-muted-foreground">{sessionRoleLabels[record.role]}</p>
                          </div>
                          <Badge
                            className={
                              record.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            }
                            variant="outline"
                          >
                            {record.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                            <p className="break-all font-medium text-foreground">{record.email}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Region</p>
                            <p className="font-medium text-foreground">{record.region || "-"}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" variant="outline" onClick={() => openEditor(record)}>
                            <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button className="flex-1" variant="ghost" onClick={() => removeEmployee(record)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
