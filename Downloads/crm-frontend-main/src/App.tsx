import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { CrmProvider } from "@/contexts/CrmContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthTokenRedirect } from "@/components/AuthTokenRedirect";
import { SecurityValidator } from "@/components/SecurityValidator";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import PacientesPage from "./pages/PacientesPage";
import AgendamentosPage from "./pages/AgendamentosPage";
import OrcamentosPage from "./pages/OrcamentosPage";
import EquipePage from "./pages/EquipePage";
import ReativacaoPage from "./pages/ReativacaoPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import TarefasPage from "./pages/TarefasPage";
import AuthDiagnosis from "./pages/AuthDiagnosis.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProfilePage from "./pages/ProfilePage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SecurityValidator />
        <AuthTokenRedirect />
        <AuthProvider>
          <Routes>
            {/* Páginas de Autenticação (sem proteção) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/diagnosis" element={<AuthDiagnosis />} />
            <Route path="/google-callback" element={<GoogleCallbackPage />} />

            {/* Rotas Protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <CrmProvider>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/leads" element={<LeadsPage />} />
                        <Route path="/leads/:pipelineId" element={<LeadsPage />} />
                        <Route path="/pacientes" element={<PacientesPage />} />
                        <Route path="/agendamentos" element={<AgendamentosPage />} />
                        <Route path="/orcamentos" element={<OrcamentosPage />} />
                        <Route path="/tarefas" element={<TarefasPage />} />
                        <Route path="/equipe" element={<EquipePage />} />
                        <Route path="/reativacao" element={<ReativacaoPage />} />
                        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                        <Route path="/perfil" element={<ProfilePage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </CrmProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
