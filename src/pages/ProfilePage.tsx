import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/useUser";
import { sessionRoleLabels } from "@/contexts/userSession";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, LogOut, User, Mail, Phone, MapPin, Shield } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password changed successfully",
    });
    setPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentUserRoleLabel = sessionRoleLabels[user.role];
  const lastLoginTime = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold">My Profile</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Information Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Your personal account details</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">Full Name</Label>
                  <Input value={user.name} disabled className="mt-1 bg-gray-50" />
                </div>
                <div>
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">Email Address</Label>
                  <Input value={user.email} disabled className="mt-1 bg-gray-50" />
                </div>
                <div>
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">Mobile Number</Label>
                  <Input placeholder="Not set" disabled className="mt-1 bg-gray-50" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">Designation/Role</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-sm px-3 py-1.5">
                      {currentUserRoleLabel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">Region/District</Label>
                  <Input value={user.region || "Not assigned"} disabled className="mt-1 bg-gray-50" />
                </div>
                <div>
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">Account Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage your account security</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Login */}
              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Last Login</Label>
                <div className="p-3 bg-gray-50 rounded-md text-sm">{lastLoginTime}</div>
              </div>

              {/* Change Password */}
              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Password</Label>
                <Button
                  onClick={() => setPasswordDialogOpen(true)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
              <p className="font-medium">Security Tip:</p>
              <p>Use a strong password with a mix of letters, numbers, and special characters.</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Logout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 mb-4">Sign out from your account</p>
            <Button onClick={handleLogout} variant="destructive" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout from Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and set a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProfilePage;
