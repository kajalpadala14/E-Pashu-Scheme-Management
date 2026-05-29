import { Bell, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listAlerts } from "@/lib/dataService";
import { toast } from "@/components/ui/use-toast";

export function TopNavbar() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
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
      </div>
    </header>
  );
}
