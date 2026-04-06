import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/contexts/CrmContext";
import { useGoogleSheetsSync } from "@/hooks/useGoogleSheetsSync";
import { useBackendSync } from "@/hooks/useBackendSync";
import { usePhoneBasedSync } from "@/hooks/usePhoneBasedSync";
import { usePeriodicPhoneSync } from "@/hooks/usePeriodicPhoneSync";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const crm = useCrm();
  const { syncNow, isSyncing } = useGoogleSheetsSync();
  useBackendSync(); // Sincroniza com MySQL para persistência entre navegadores
  usePhoneBasedSync(); // Carrega tarefas/atividades/anotações baseado no telefone do lead
  usePeriodicPhoneSync({ interval: 5 * 60 * 1000 }); // Sincroniza a cada 5 minutos

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-4 justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-lg font-bold text-primary tracking-tight">Via clinic</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={syncNow}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Atualizar Leads
            </Button>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}