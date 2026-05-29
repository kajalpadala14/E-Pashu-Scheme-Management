import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { FEATURES } from "@/lib/features";
import { getDefaultRouteForRole, hasRouteAccess, type AppRouteKey } from "@/lib/rbac";
import Index from "./pages/Index.tsx";
import AnimalsPage from "./pages/AnimalsPage.tsx";
import AnimalProfilePage from "./pages/AnimalProfilePage.tsx";
import FarmersPage from "./pages/FarmersPage.tsx";
import LocationMasterPage from "./pages/LocationMasterPage.tsx";
import VaccinationsPage from "./pages/VaccinationsPage.tsx";
import BreedingPage from "./pages/BreedingPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import FieldOfficersPage from "./pages/FieldOfficersPage.tsx";
import AIInsightsPage from "./pages/AIInsightsPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import SchemesPage from "./pages/SchemesPage.tsx";
import EmployeesPage from "./pages/EmployeesPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function RoleRoute({ route, children }: { route: AppRouteKey; children: React.ReactElement }) {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return hasRouteAccess(user.role, route) ? children : <NotFound />;
}

function HomeRoute() {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (FEATURES.ENABLE_DASHBOARD && hasRouteAccess(user.role, "dashboard")) {
    return <Index />;
  }

  const fallbackRoute = hasRouteAccess(user.role, "animals")
    ? "/animals"
    : hasRouteAccess(user.role, "reports")
      ? "/reports"
      : getDefaultRouteForRole(user.role);

  return <Navigate to={fallbackRoute} replace />;
}

const App = () => (
  <UserProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="/animals" element={<RoleRoute route="animals"><AnimalsPage /></RoleRoute>} />
            <Route path="/animals/:id" element={<RoleRoute route="animals"><AnimalProfilePage /></RoleRoute>} />
            <Route path="/farmers" element={<RoleRoute route="farmers"><FarmersPage /></RoleRoute>} />
            <Route path="/locations" element={<RoleRoute route="locations"><LocationMasterPage /></RoleRoute>} />
            <Route path="/vaccinations" element={<RoleRoute route="vaccinations"><VaccinationsPage /></RoleRoute>} />
            <Route path="/breeding" element={<RoleRoute route="breeding"><BreedingPage /></RoleRoute>} />
            <Route path="/alerts" element={<RoleRoute route="alerts"><AlertsPage /></RoleRoute>} />
            <Route path="/field-officers" element={FEATURES.ENABLE_LIVE_MONITORING ? <RoleRoute route="field_officers"><FieldOfficersPage /></RoleRoute> : <NotFound />} />
            <Route path="/employees" element={<RoleRoute route="employees"><EmployeesPage /></RoleRoute>} />
            <Route path="/ai-insights" element={<RoleRoute route="ai_insights"><AIInsightsPage /></RoleRoute>} />
            <Route path="/reports" element={<RoleRoute route="reports"><ReportsPage /></RoleRoute>} />
            <Route path="/schemes" element={<RoleRoute route="schemes"><SchemesPage /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute route="profile"><ProfilePage /></RoleRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </UserProvider>
);

export default App;
