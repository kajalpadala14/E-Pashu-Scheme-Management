import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Prefetcher from "./lib/prefetch";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { useUser } from "@/contexts/useUser";
import { getDefaultRouteForRole, hasRouteAccess, type AppRouteKey } from "@/lib/rbac";
import PublicHomePage from "./pages/PublicHomePage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import SchemesPage from "./pages/SchemesPage.tsx";
import BeneficiariesPage from "./pages/BeneficiariesPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ManagementModulePage from "./pages/ManagementModulePage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RoleRoute({ route, children }: { route: AppRouteKey; children: React.ReactElement }) {
  const { sessionChecking, user } = useUser();
  if (sessionChecking) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Verifying login session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return hasRouteAccess(user.role, route) ? children : <NotFound />;
}

function HomeRoute() {
  return <PublicHomePage />;
}

const App = () => (
  <UserProvider>
    <QueryClientProvider client={queryClient}>
      <Prefetcher />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="/dashboard" element={<RoleRoute route="dashboard"><DashboardPage /></RoleRoute>} />
            <Route path="/schemes" element={<RoleRoute route="schemes"><SchemesPage /></RoleRoute>} />
            <Route path="/beneficiaries" element={<RoleRoute route="beneficiaries"><BeneficiariesPage /></RoleRoute>} />
            <Route path="/blocks" element={<RoleRoute route="blocks"><ManagementModulePage type="blocks" /></RoleRoute>} />
            <Route path="/institutes" element={<RoleRoute route="institutes"><ManagementModulePage type="institutes" /></RoleRoute>} />
            <Route path="/villages" element={<Navigate to="/institutes" replace />} />
            <Route path="/reports" element={<RoleRoute route="reports"><ManagementModulePage type="reports" /></RoleRoute>} />
            <Route path="/users" element={<RoleRoute route="users"><ManagementModulePage type="users" /></RoleRoute>} />
            <Route path="/settings" element={<RoleRoute route="settings"><ManagementModulePage type="settings" /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute route="profile"><ProfilePage /></RoleRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </UserProvider>
);

export default App;
