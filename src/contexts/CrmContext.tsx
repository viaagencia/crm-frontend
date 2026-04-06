import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCrmData } from '@/hooks/useCrmData';
import { useCrmAPI } from '@/hooks/useCrmAPI';
import { Lead, Paciente } from '@/types/crm';

type CrmContextType = ReturnType<typeof useCrmData>;

const CrmContext = createContext<CrmContextType | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const data = useCrmData();
  const [usuarioId, setUsuarioId] = useState<string>('');
  const api = useCrmAPI(usuarioId);

  // Sincronizar com o backend quando o usuarioId estiver disponível
  useEffect(() => {
    if (!usuarioId) return;

    const syncWithBackend = async () => {
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
        if (leads.length > 0 || data.leads.length === 0) {
          data.setLeads(leads);
        }
        if (pacientes.length > 0 || data.pacientes.length === 0) {
          data.setPacientes(pacientes);
        }

        console.log('✓ Dados sincronizados com o backend');
      } catch (err) {
        console.error('Erro ao sincronizar com backend:', err);
        // Continuar usando localStorage se o backend falhar
      }
    };

    syncWithBackend();
  }, [usuarioId, api]);

  // Expor função para definir usuarioId (será chamada após login)
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
