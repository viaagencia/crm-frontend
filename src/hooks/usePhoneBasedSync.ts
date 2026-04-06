/**
 * PHONE-BASED SYNC HOOK
 *
 * Sincroniza tarefas, atividades e anotações baseado no número de telefone.
 * Isso permite que dados persistam mesmo quando leads são reimportados da Google Sheets.
 */

import { useEffect, useCallback } from 'react';
import { useCrm } from '@/contexts/CrmContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://darksalmon-viper-304874.hostingersite.com';

interface TarefaAPI {
  id: string;
  titulo: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  dataHora?: string;
  criadoEm: string;
}

interface AtividadeAPI {
  id: string;
  tipo: 'ligacao' | 'mensagem';
  status: string;
  observacao?: string;
  criadoEm: string;
}

interface AnotacaoAPI {
  id: string;
  texto: string;
  criadoEm: string;
}

export function usePhoneBasedSync() {
  const crm = useCrm();

  // Buscar tarefas/atividades/anotações do backend usando telefone
  const loadDataForContact = useCallback(async (telefone: string) => {
    if (!telefone) return { tarefas: [], atividades: [], anotacoes: [] };

    try {
      const cleanPhone = telefone.replace(/\D/g, '');

      // Buscar dados em paralelo
      const [tarefasRes, atividadesRes, anotacoesRes] = await Promise.all([
        fetch(`${API_URL}/api/tarefas-by-phone/${cleanPhone}`),
        fetch(`${API_URL}/api/atividades-by-phone/${cleanPhone}`),
        fetch(`${API_URL}/api/anotacoes-by-phone/${cleanPhone}`),
      ]);

      const tarefas = tarefasRes.ok ? await tarefasRes.json() : [];
      const atividades = atividadesRes.ok ? await atividadesRes.json() : [];
      const anotacoes = anotacoesRes.ok ? await anotacoesRes.json() : [];

      return { tarefas, atividades, anotacoes };
    } catch (error) {
      console.error('[PhoneBasedSync] Erro ao buscar dados:', error);
      return { tarefas: [], atividades: [], anotacoes: [] };
    }
  }, []);

  // Quando um lead é carregado, buscar todas as suas tarefas/atividades por telefone
  // e atualizar o lead com esses dados
  const enrichLeadWithPhoneData = useCallback(async (leadId: string) => {
    const lead = crm.leads.find(l => l.id === leadId);
    if (!lead) return;

    const { tarefas, atividades, anotacoes } = await loadDataForContact(lead.telefone);

    // Atualizar o lead com os dados buscados do backend
    if (tarefas.length > 0 || atividades.length > 0 || anotacoes.length > 0) {
      crm.updateLead(leadId, {
        tarefas: tarefas as any,
        atividades: atividades as any,
        anotacoes: anotacoes as any,
      });
    }
  }, [crm, loadDataForContact]);

  // Quando um paciente é carregado, fazer o mesmo
  const enrichPacienteWithPhoneData = useCallback(async (pacienteId: string) => {
    const paciente = crm.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;

    const { tarefas, atividades, anotacoes } = await loadDataForContact(paciente.telefone);

    if (tarefas.length > 0 || atividades.length > 0 || anotacoes.length > 0) {
      crm.updatePaciente(pacienteId, {
        tarefas: tarefas as any,
        atividades: atividades as any,
        anotacoes: anotacoes as any,
      });
    }
  }, [crm, loadDataForContact]);

  // Ao montar o hook, enriquecer TODOS os leads e pacientes com dados do backend
  useEffect(() => {
    const enrichAll = async () => {
      // Enriquecer todos os leads em paralelo
      for (const lead of crm.leads) {
        await enrichLeadWithPhoneData(lead.id);
      }

      // Enriquecer todos os pacientes em paralelo
      for (const paciente of crm.pacientes) {
        await enrichPacienteWithPhoneData(paciente.id);
      }
    };

    enrichAll();
  }, [crm.leads.length, crm.pacientes.length, enrichLeadWithPhoneData, enrichPacienteWithPhoneData]);

  return {
    loadDataForContact,
    enrichLeadWithPhoneData,
    enrichPacienteWithPhoneData,
  };
}
