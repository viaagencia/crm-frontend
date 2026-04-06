import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { CrmProvider } from "@/contexts/CrmContext";
import { InitializeApp } from "@/components/InitializeApp";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import PacientesPage from "./pages/PacientesPage";
import AgendamentosPage from "./pages/AgendamentosPage";
import OrcamentosPage from "./pages/OrcamentosPage";
import EquipePage from "./pages/EquipePage";
import ReativacaoPage from "./pages/ReativacaoPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import TarefasPage from "./pages/TarefasPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CrmProvider>
          <InitializeApp />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </CrmProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
