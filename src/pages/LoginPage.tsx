import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { lookupUserByEmail } from "@/lib/dataService";
import { useUser } from "@/contexts/useUser";
import { getDefaultRouteForRole } from "@/lib/rbac";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");

  // Opening login should always require fresh credentials.
  useEffect(() => {
    setUser(null);
  }, [setUser]);

  const loginMutation = useMutation({
    mutationFn: lookupUserByEmail,
  });

  const handleLogin = async () => {
    try {
      const sessionUser = await loginMutation.mutateAsync(email);
      setUser(sessionUser);
      toast({ title: "Login successful", description: `Welcome ${sessionUser.name}` });
      navigate(getDefaultRouteForRole(sessionUser.role), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email not found in Users sheet";
      const looksLikeOldDeployment = message.toLowerCase().includes("unknown action") || message.toLowerCase().includes("users.lookupbyemail");
      toast({
        title: "Login failed",
        description: looksLikeOldDeployment
          ? "Apps Script deployment is old. Please redeploy Code.gs as Web App and try again."
          : message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.2),_transparent_34%),linear-gradient(135deg,_#ecfdf5_0%,_#f8fafc_45%,_#dcfce7_100%)] p-4">
      <Card className="w-full max-w-md overflow-hidden border-emerald-100 shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-teal-700 via-emerald-700 to-green-800" />
        <CardHeader>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg bg-emerald-700 p-1 shadow-sm">
              <img src="./dantewada-district.png" alt="Dantewada District Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl">Government Portal Login</CardTitle>
              <CardDescription>Role-based secure access for scheme management officials.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@department.gov"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              name="login-email-fresh"
            />
          </div>
          <Button className="w-full bg-emerald-700 hover:bg-emerald-800" onClick={handleLogin} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Checking access..." : "Login"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JWT-style session token, protected routes, RBAC, and inactivity auto logout are enabled for this portal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
