import {
  LayoutDashboard,
  PawPrint,
  Users,
  Syringe,
  Dna,
  Bell,
  UserCheck,
  BarChart3,
  Stethoscope,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { sessionRoleLabels, useUser } from "@/contexts/UserContext";
import { FEATURES } from "@/lib/features";
import { hasRouteAccess, type AppRouteKey } from "@/lib/rbac";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, route: "dashboard" as AppRouteKey, enabled: FEATURES.ENABLE_DASHBOARD },
  { title: "Animals", url: "/animals", icon: PawPrint, route: "animals" as AppRouteKey, enabled: true },
  { title: "Farmers", url: "/farmers", icon: Users, route: "farmers" as AppRouteKey, enabled: true },
  { title: "Vaccinations", url: "/vaccinations", icon: Syringe, route: "vaccinations" as AppRouteKey, enabled: true },
  { title: "Disease Care", url: "/ai-insights", icon: Stethoscope, route: "ai_insights" as AppRouteKey, enabled: true },
  { title: "Breeding", url: "/breeding", icon: Dna, route: "breeding" as AppRouteKey, enabled: true },
];

const systemItems = [
  { title: "Alerts", url: "/alerts", icon: Bell, route: "alerts" as AppRouteKey, enabled: true },
  { title: "Field Officers", url: "/field-officers", icon: UserCheck, route: "field_officers" as AppRouteKey, enabled: FEATURES.ENABLE_LIVE_MONITORING },
  { title: "Reports", url: "/reports", icon: BarChart3, route: "reports" as AppRouteKey, enabled: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useUser();
  if (!user) {
    return null;
  }
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  const visible = <T extends { route: AppRouteKey; enabled: boolean }>(item: T) => item.enabled && hasRouteAccess(user.role, item.route);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-md bg-sidebar-primary p-1 flex items-center justify-center overflow-hidden">
            <img src="./dantewada-district.png" alt="Dantewada District Logo" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block font-semibold text-sm text-sidebar-foreground">e-Pashu</span>
              <span className="block truncate text-[11px] text-sidebar-foreground/70">{sessionRoleLabels[user.role]} · {user.region}</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.filter(visible).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.filter(visible).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
