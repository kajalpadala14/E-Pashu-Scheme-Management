import { Bell, ChevronDown, Moon, Search, ShieldCheck, Sun, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listAlerts, listUsers } from "@/lib/dataService";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { sessionRoleLabels, useUser } from "@/contexts/UserContext";

export function TopNavbar() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const unreadCount = alerts.filter((item) => item.priority === "High").length;
  const isAdmin = user?.role === "admin";
  const visibleSessionUsers = isAdmin
    ? users.filter((item) => item.active && item.role !== "data_entry_operator")
    : user
      ? [user]
      : [];

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
        {/* Search bar removed per request */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden md:inline-flex gap-2">
              <ShieldCheck className="h-4 w-4" />
              {user ? `${sessionRoleLabels[user.role]} · ${user.name}` : "Login"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {visibleSessionUsers.map((sessionUser) => (
              <DropdownMenuItem key={sessionUser.email} onClick={() => isAdmin && setUser(sessionUser)}>
                {sessionUser.name} · {sessionRoleLabels[sessionUser.role]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => navigate("/profile")}>{isAdmin ? "Manage Access" : "Profile"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" onClick={toggleDark} title="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {
            navigate("/alerts");
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title={user ? `${user.name} · ${sessionRoleLabels[user.role]}` : "Login"}>
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
