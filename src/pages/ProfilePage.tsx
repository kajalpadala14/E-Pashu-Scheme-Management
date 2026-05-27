import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sessionRoleLabels, useUser, type UserRole } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { deleteUserByEmail, listUsers, upsertUser } from "@/lib/dataService";
import type { UserDirectoryRecord } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "@/lib/rbac";

const blankUser: Omit<UserDirectoryRecord, "createdAt" | "updatedAt"> = {
  id: "",
  name: "",
  email: "",
  role: "veterinary_doctor",
  region: "",
  active: true,
};

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();
  const [form, setForm] = useState(blankUser);
  const isAdmin = user?.role === "admin";

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    initialData: [] as UserDirectoryRecord[],
  });

  const saveMutation = useMutation({
    mutationFn: (input: Omit<UserDirectoryRecord, "createdAt" | "updatedAt">) => upsertUser(input, { actorRole: user?.role }),
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

  const visibleUsers = useMemo(() => users.filter((item) => item.role !== "data_entry_operator"), [users]);
  const activeUsers = useMemo(() => visibleUsers.filter((item) => item.active), [visibleUsers]);
  const currentUserRoleLabel = user ? sessionRoleLabels[user.role] : "";

  const saveUser = async () => {
    if (!form.name || !form.email || !form.role) {
      toast({ title: "Missing details", description: "Name, email, and role are required.", variant: "destructive" });
      return;
    }

    try {
      await saveMutation.mutateAsync({ ...form, role: normalizeRole(form.role) });
      setForm(blankUser);
      toast({ title: "Successfully Added", description: `${form.email} can now sign in.` });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save user access",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Profile</h2>
          <p className="text-muted-foreground text-sm">Account and access control</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid gap-2">
                <div>
                  <Label>Name</Label>
                  <Input value={user?.name || ""} onChange={(e) => user && setUser({ ...user, name: e.target.value })} disabled={!user} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} onChange={(e) => user && setUser({ ...user, email: e.target.value })} disabled={!user || !isAdmin} />
                </div>
                <div>
                  <Label>Role</Label>
                  {isAdmin ? (
                    <Select value={user?.role || "admin"} onValueChange={(v) => user && setUser({ ...user, role: normalizeRole(v) as UserRole })} disabled={!user}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="veterinary_doctor">Veterinary Doctor</SelectItem>
                        <SelectItem value="field_officer">Field Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={currentUserRoleLabel} disabled />
                  )}
                </div>
                <div>
                  <Label>Region</Label>
                  <Input value={user?.region || ""} onChange={(e) => user && setUser({ ...user, region: e.target.value })} disabled={!user} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => user && setUser({ ...user, role: user.role })} disabled={!user}>Save Profile</Button>
                  <Button variant="outline" onClick={() => { logout(); navigate("/login"); }} disabled={!user}>Logout</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Critical alerts</span><span>Enabled</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pregnancy reminders</span><span>Enabled</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Daily summary</span><span>Enabled</span></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Access Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin ? (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.toLowerCase() }))} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v) => setForm((prev) => ({ ...prev, role: normalizeRole(v) as UserRole }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="veterinary_doctor">Veterinary Doctor</SelectItem>
                        <SelectItem value="field_officer">Field Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Input value={form.region} onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={saveUser} disabled={saveMutation.isPending}>Save Access</Button>
                  <Button variant="outline" onClick={() => setForm(blankUser)}>Clear</Button>
                </div>

                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleUsers.map((item) => (
                        <TableRow key={item.email}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{sessionRoleLabels[item.role]}</TableCell>
                          <TableCell>{item.region}</TableCell>
                          <TableCell><Badge variant={item.active ? "secondary" : "outline"}>{item.active ? "Active" : "Inactive"}</Badge></TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setForm({ id: item.id, name: item.name, email: item.email, role: item.role, region: item.region, active: item.active })}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.email)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">Use this form to add a name, email, and role. That email can then sign in on the login page.</p>
                <p className="text-xs text-muted-foreground">Active users: {activeUsers.length}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Only admin can manage access. Current user: {user?.email || "not logged in"}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
