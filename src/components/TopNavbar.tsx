import { Bell, LogIn, LogOut, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAlerts } from "@/lib/dataService";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/useUser";
import { sessionRoleLabels } from "@/contexts/userSession";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function TopNavbar() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });
  const unreadCount = alerts.filter((item) => item.priority === "High").length;

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 border-b bg-card/95 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold">e-Pashu Digital Livestock Management System</h1>
          <p className="text-[11px] text-muted-foreground">Department of Animal Husbandry and Veterinary Services</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDark} title="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {
            toast({
              title: "Notifications",
              description: unreadCount
                ? `${unreadCount} high-priority alerts require attention.`
                : "No high-priority alerts right now.",
            });
          }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />}
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-10 rounded-full bg-emerald-700 px-4 text-white shadow-sm hover:bg-emerald-800">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span className="hidden max-w-[180px] flex-col items-start leading-tight sm:flex">
                  <span className="truncate text-sm font-semibold">{user.name}</span>
                  <span className="text-[11px] font-medium text-emerald-50/90">{sessionRoleLabels[user.role]}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {sessionRoleLabels[user.role]}{user.region ? ` · ${user.region}` : ""}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({ title: "Access level", description: `${sessionRoleLabels[user.role]} account${user.region ? ` in ${user.region}` : ""}.` });
                }}
              >
                Role / Access Information
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  toast({ title: "Logged out", description: "Your session has been closed." });
                  navigate("/");
                }}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="h-10 rounded-full bg-emerald-700 px-4 text-white shadow-sm hover:bg-emerald-800" onClick={() => navigate("/login")}>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
