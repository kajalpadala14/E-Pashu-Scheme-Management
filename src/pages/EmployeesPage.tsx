import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";

type EmployeeRole = "Admin" | "Block Level User" | "GP User" | "Department Officer" | "Read Only Viewer";

type EmployeeStatus = "Active" | "Inactive";

type Employee = {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  department: string;
  role: EmployeeRole;
  status: EmployeeStatus;
};

const departmentOptions = ["Block A", "Block B", "GP 1", "GP 2", "Animal Husbandry"];
const roleOptions: EmployeeRole[] = ["Admin", "Block Level User", "GP User", "Department Officer", "Read Only Viewer"];

const initialEmployee: Employee = {
  id: "",
  name: "",
  designation: "",
  mobile: "",
  department: "",
  role: "Block Level User",
  status: "Active",
};

const sampleEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Anita Singh",
    designation: "District Manager",
    mobile: "9876543210",
    department: "Block A",
    role: "Admin",
    status: "Active",
  },
  {
    id: "EMP-002",
    name: "Ramesh Patel",
    designation: "Field Officer",
    mobile: "9123456780",
    department: "GP 1",
    role: "GP User",
    status: "Active",
  },
  {
    id: "EMP-003",
    name: "Sunita Devi",
    designation: "Data Coordinator",
    mobile: "9012345678",
    department: "Block B",
    role: "Department Officer",
    status: "Inactive",
  },
];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Employee>({ ...initialEmployee });
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [auditLog, setAuditLog] = useState<{ id: string; timestamp: string; action: string; details: string }[]>([]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.designation.toLowerCase().includes(query) ||
        employee.mobile.includes(query) ||
        employee.department.toLowerCase().includes(query);
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, departmentFilter]);

  const activeCount = useMemo(() => employees.filter((employee) => employee.status === "Active").length, [employees]);
  const inactiveCount = useMemo(() => employees.filter((employee) => employee.status === "Inactive").length, [employees]);

  const resetForm = () => setForm({ ...initialEmployee });

  const openEditor = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setForm(employee);
    } else {
      resetForm();
      setEditingEmployee(null);
    }
    setOpen(true);
  };

  const logAction = (action: string, details: string) => {
    setAuditLog((current) => [
      {
        id: `LOG-${String(current.length + 1).padStart(3, "0")}`,
        timestamp: new Date().toLocaleString(),
        action,
        details,
      },
      ...current,
    ]);
  };




  const saveEmployee = () => {
    if (!form.name.trim() || !form.designation.trim() || !form.mobile.trim() || !form.department.trim()) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }

    if (editingEmployee) {
      setEmployees((current) => current.map((employee) => (employee.id === editingEmployee.id ? { ...form, id: editingEmployee.id } : employee)));
      toast({ title: "Employee updated", description: `${form.name} details have been saved.` });
      logAction("Edit", `Updated employee ${form.name}.`);
    } else {
      setEmployees((current) => [
        ...current,
        { ...form, id: `EMP-${String(current.length + 1).padStart(3, "0")}` },
      ]);
      toast({ title: "Employee added", description: `${form.name} has been added to the employee list.` });
      logAction("Create", `Added employee ${form.name}.`);
    }

    setOpen(false);
    setEditingEmployee(null);
    resetForm();
  };

  const removeInactiveEmployees = () => {
    const removedCount = employees.filter((employee) => employee.status === "Inactive").length;
    setEmployees((current) => current.filter((employee) => employee.status !== "Inactive"));
    toast({ title: "Inactive employees removed", description: "All inactive staff have been cleared." });
    if (removedCount) {
      logAction("Cleanup", `Removed ${removedCount} inactive employee(s).`);
    }
  };

  const deleteEmployee = (id: string) => {
    setEmployees((current) => current.filter((employee) => employee.id !== id));
    toast({ title: "Employee removed", description: "Employee record has been deleted." });
    logAction("Delete", `Removed employee ${id}.`);
  };

  const updateEmployeeStatus = (id: string, status: EmployeeStatus) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id ? { ...employee, status } : employee,
      ),
    );
    logAction("Status Update", `Set status for ${id} to ${status}.`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Employee Management" description="Add and manage employees without backend edits." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{employees.length}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{activeCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inactive</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{inactiveCount}</CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Search employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, role, mobile, department" />
              </div>
            </div>
            <div>
              <Label>Filter by department</Label>
              <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((department) => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-end gap-2">
            <Button variant="secondary" onClick={removeInactiveEmployees}>Remove Inactive</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Input value={form.designation} onChange={(event) => setForm((prev) => ({ ...prev, designation: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input inputMode="numeric" value={form.mobile} onChange={(event) => setForm((prev) => ({ ...prev, mobile: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Department / Block / GP</Label>
                    <Select value={form.department} onValueChange={(value) => setForm((prev) => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((department) => (
                          <SelectItem key={department} value={department}>{department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Role / Access</Label>
                    <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value as EmployeeRole }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as EmployeeStatus }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => { resetForm(); setEditingEmployee(null); setOpen(false); }}>Cancel</Button>
                  <Button onClick={saveEmployee}>{editingEmployee ? "Save Employee" : "Create Employee"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.mobile}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Select value={employee.status} onValueChange={(value) => updateEmployeeStatus(employee.id, value as EmployeeStatus)}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditor(employee)}>
                        <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteEmployee(employee.id)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Update Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {auditLog.length ? (
                auditLog.slice(0, 6).map((log) => (
                  <div key={log.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{log.timestamp}</span>
                      <Badge variant="outline">{log.action}</Badge>
                    </div>
                    <p className="mt-2">{log.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No update logs yet. Actions will appear here as you add, edit, or clean up employee records.</p>
              )}
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
