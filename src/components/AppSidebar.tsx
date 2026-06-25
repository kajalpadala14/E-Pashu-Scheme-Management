import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShoppingBag,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useUser } from "@/contexts/useUser";
import { sessionRoleLabels } from "@/contexts/userSession";
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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, route: "dashboard" as AppRouteKey, enabled: true },
  { title: "Scheme Management", url: "/schemes", icon: ShoppingBag, route: "schemes" as AppRouteKey, enabled: true },
  { title: "Beneficiary Management", url: "/beneficiaries", icon: Users, route: "beneficiaries" as AppRouteKey, enabled: true },
  { title: "Block Management", url: "/blocks", icon: Building2, route: "blocks" as AppRouteKey, enabled: true },
  { title: "Institute Management", url: "/institutes", icon: MapPinned, route: "institutes" as AppRouteKey, enabled: true },
  { title: "Reports & Analytics", url: "/reports", icon: BarChart3, route: "reports" as AppRouteKey, enabled: true },
];

const systemItems = [
  { title: "User Management", url: "/users", icon: UserCog, route: "users" as AppRouteKey, enabled: true },
  { title: "Settings", url: "/settings", icon: Settings, route: "settings" as AppRouteKey, enabled: true },
  { title: "Profile", url: "/profile", icon: FileText, route: "profile" as AppRouteKey, enabled: true },
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
              <span className="block truncate text-[11px] text-sidebar-foreground/70">{sessionRoleLabels[user.role]} / {user.region}</span>
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
