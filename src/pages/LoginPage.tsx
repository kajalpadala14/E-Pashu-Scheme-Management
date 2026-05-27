import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { lookupUserByEmail } from "@/lib/dataService";
import { useUser } from "@/contexts/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [email, setEmail] = useState(user?.email || "admin@epashu.gov");

  const loginMutation = useMutation({
    mutationFn: lookupUserByEmail,
  });

  const handleLogin = async () => {
    try {
      const sessionUser = await loginMutation.mutateAsync(email);
      setUser(sessionUser);
      toast({ title: "Login successful", description: `Welcome ${sessionUser.name}` });
      navigate("/");
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg bg-emerald-600 p-1 shadow-sm">
              <img src="./dantewada-district.png" alt="Dantewada District Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl">e-Pashu Login</CardTitle>
              <CardDescription>Sign in with the email that admin added in the Users sheet.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@department.gov" />
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Checking access..." : "Login"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Admin can add or change access from Profile after signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
