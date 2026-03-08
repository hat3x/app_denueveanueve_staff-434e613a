import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { StaffRouteGuard } from "@/components/staff/StaffRouteGuard";
import { AppShell } from "@/components/staff/AppShell";

import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import VerifyCustomer from "./pages/VerifyCustomer";
import SelectService from "./pages/SelectService";
import ConfirmVisit from "./pages/ConfirmVisit";
import VisitResult from "./pages/VisitResult";
import History from "./pages/History";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes */}
            <Route element={<StaffRouteGuard><AppShell /></StaffRouteGuard>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/verify-customer" element={<VerifyCustomer />} />
              <Route path="/select-service" element={<SelectService />} />
              <Route path="/confirm-visit" element={<ConfirmVisit />} />
              <Route path="/visit-result" element={<VisitResult />} />
              <Route path="/history" element={<History />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
