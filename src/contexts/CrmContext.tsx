import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useCrmData } from '@/hooks/useCrmData';
import { useCrmAPI } from '@/hooks/useCrmAPI';
import { Lead, Paciente } from '@/types/crm';

type CrmContextType = ReturnType<typeof useCrmData>;

const CrmContext = createContext<CrmContextType | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const data = useCrmData();
  const [usuarioId, setUsuarioId] = useState<string>('');
  const api = useCrmAPI(usuarioId);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para sincronizar com backend
  const syncWithBackend = async () => {
    if (!usuarioId) return;

    try {
      // Buscar dados do backend
      const [leads, pacientes, tarefas, atividades, anotacoes, funis] = await Promise.all([
        api.getLeads(),
        api.getPacientes(),
        api.getTarefas(),
        api.getAtividades(),
        api.getAnotacoes(),
        api.getFunis(),
      ]);

      // Atualizar estado local com dados do backend
      // Sempre sincronizar para garantir que todos os navegadores veem os mesmos dados
      if (leads && leads.length >= 0) {
        data.setLeads(leads);
      }
      if (pacientes && pacientes.length >= 0) {
        data.setPacientes(pacientes);
      }

      console.log('✓ Sincronização com backend completa', { leads: leads?.length, pacientes: pacientes?.length });
    } catch (err) {
      console.error('Erro ao sincronizar com backend:', err);
      // Continuar usando localStorage se o backend falhar
    }
  };

  // Sincronizar na inicialização e periodicamente
  useEffect(() => {
    if (!usuarioId) return;

    // Sincronizar imediatamente
    syncWithBackend();

    // Sincronizar a cada 5 segundos
    syncIntervalRef.current = setInterval(() => {
      syncWithBackend();
    }, 5000);

    // Também sincronizar quando a aba fica ativa (volta do background)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('✓ App em foco, sincronizando...');
        syncWithBackend();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [usuarioId, api]);

  // Expor função para definir usuarioId
  const contextWithApi = {
    ...data,
    _setUsuarioId: setUsuarioId,
    _api: api,
  };

  return <CrmContext.Provider value={contextWithApi}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within CrmProvider');
  return ctx;
}
