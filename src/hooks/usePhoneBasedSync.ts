/**
 * PHONE-BASED SYNC HOOK
 *
 * Sincroniza tarefas, atividades e anotações baseado no número de telefone.
 * CRÍTICO: Sempre que um lead/paciente com aquele número de telefone aparece no CRM,
 * ele AUTOMATICAMENTE carrega todas as tarefas, atividades e anotações do banco de dados.
 *
 * Isso permite que dados persistam mesmo quando leads são reimportados da Google Sheets.
 */

import { useEffect, useCallback, useRef } from 'react';
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
  // Manter track global de quais telefones já foram sincronizados
  // para evitar re-syncs desnecessários
  const syncedPhonesRef = useRef<Set<string>>(new Set());

  // Buscar tarefas/atividades/anotações do backend usando telefone
  const loadDataForContact = useCallback(async (telefone: string) => {
    if (!telefone) return { tarefas: [], atividades: [], anotacoes: [] };

    try {
      const cleanPhone = telefone.replace(/\D/g, '');
      console.log(`[PhoneBasedSync] Buscando dados para telefone: ${cleanPhone}`);

      // Buscar dados em paralelo
      const [tarefasRes, atividadesRes, anotacoesRes] = await Promise.all([
        fetch(`${API_URL}/api/tarefas-by-phone/${cleanPhone}`),
        fetch(`${API_URL}/api/atividades-by-phone/${cleanPhone}`),
        fetch(`${API_URL}/api/anotacoes-by-phone/${cleanPhone}`),
      ]);

      const tarefas = tarefasRes.ok ? await tarefasRes.json() : [];
      const atividades = atividadesRes.ok ? await atividadesRes.json() : [];
      const anotacoes = anotacoesRes.ok ? await anotacoesRes.json() : [];

      console.log(`[PhoneBasedSync] ✅ Encontrou ${tarefas.length} tarefas, ${atividades.length} atividades, ${anotacoes.length} anotações`);

      return { tarefas, atividades, anotacoes };
    } catch (error) {
      console.error('[PhoneBasedSync] Erro ao buscar dados:', error);
      return { tarefas: [], atividades: [], anotacoes: [] };
    }
  }, []);

  // Sincronizar um lead específico: busca dados por telefone e SEMPRE atualiza
  const syncLeadByPhone = useCallback(async (leadId: string) => {
    const lead = crm.leads.find(l => l.id === leadId);
    if (!lead || !lead.telefone) return;

    const cleanPhone = lead.telefone.replace(/\D/g, '');

    // Se já sincronizou este telefone NESTA SESSÃO, não sincroniza novamente
    if (syncedPhonesRef.current.has(cleanPhone)) {
      console.log(`[PhoneBasedSync] Lead ${leadId} com telefone ${cleanPhone} já sincronizado nesta sessão`);
      return;
    }

    console.log(`[PhoneBasedSync] 🔄 Sincronizando lead ${leadId} com telefone ${cleanPhone}...`);
    const { tarefas, atividades, anotacoes } = await loadDataForContact(lead.telefone);

    // SEMPRE atualizar, mesmo que esteja vazio (garante que sincronizou)
    crm.updateLead(leadId, {
      tarefas: tarefas as any,
      atividades: atividades as any,
      anotacoes: anotacoes as any,
    });

    syncedPhonesRef.current.add(cleanPhone);
  }, [crm, loadDataForContact]);

  // Sincronizar um paciente específico: busca dados por telefone e SEMPRE atualiza
  const syncPacienteByPhone = useCallback(async (pacienteId: string) => {
    const paciente = crm.pacientes.find(p => p.id === pacienteId);
    if (!paciente || !paciente.telefone) return;

    const cleanPhone = paciente.telefone.replace(/\D/g, '');

    if (syncedPhonesRef.current.has(cleanPhone)) {
      console.log(`[PhoneBasedSync] Paciente ${pacienteId} com telefone ${cleanPhone} já sincronizado nesta sessão`);
      return;
    }

    console.log(`[PhoneBasedSync] 🔄 Sincronizando paciente ${pacienteId} com telefone ${cleanPhone}...`);
    const { tarefas, atividades, anotacoes } = await loadDataForContact(paciente.telefone);

    crm.updatePaciente(pacienteId, {
      tarefas: tarefas as any,
      atividades: atividades as any,
      anotacoes: anotacoes as any,
    });

    syncedPhonesRef.current.add(cleanPhone);
  }, [crm, loadDataForContact]);

  // Sincronizar TODOS os leads e pacientes
  const syncAll = useCallback(async () => {
    console.log('[PhoneBasedSync] 🌍 Sincronizando TODOS os leads e pacientes...');

    // Sincronizar todos os leads
    const leadPromises = crm.leads.map(lead => syncLeadByPhone(lead.id));
    await Promise.all(leadPromises);

    // Sincronizar todos os pacientes
    const pacientePromises = crm.pacientes.map(p => syncPacienteByPhone(p.id));
    await Promise.all(pacientePromises);

    console.log('[PhoneBasedSync] ✅ Sincronização completa! Telefones únicos sincronizados:', syncedPhonesRef.current.size);
  }, [crm.leads, crm.pacientes, syncLeadByPhone, syncPacienteByPhone]);

  // CRITICAL: Sincronizar quando o componente monta (primeiro carregamento)
  useEffect(() => {
    console.log('[PhoneBasedSync] 🚀 Hook montado, sincronizando dados do backend...');
    // Limpar o cache de telefones sincronizados ao montar
    // (garante que qualquer dado local seja sincronizado)
    syncedPhonesRef.current.clear();
    syncAll();
  }, []); // Roda UMA VEZ ao montar

  // CRITICAL: Sincronizar quando NOVOS leads/pacientes são adicionados
  // (mudança no tamanho da lista significa que alguma coisa foi adicionada)
  // Rastrear leads anteriores para detectar mudanças de telefone
  const prevLeadsRef = useRef<Map<string, string>>(new Map()); // leadId -> telefone

  useEffect(() => {
    // Detectar novos leads E mudanças de telefone
    for (const lead of crm.leads) {
      const prevPhone = prevLeadsRef.current.get(lead.id);
      const currentPhone = lead.telefone?.replace(/\D/g, '') || '';

      if (!prevLeadsRef.current.has(lead.id)) {
        // Lead NOVO
        console.log(`[PhoneBasedSync] 🆕 Novo lead detectado, sincronizando: ${lead.id}`);
        syncLeadByPhone(lead.id);
      } else if (prevPhone !== currentPhone && prevPhone) {
        // TELEFONE MUDOU - limpar cache do telefone antigo para forçar re-sync
        console.log(`[PhoneBasedSync] 📱 Telefone mudou de ${prevPhone} para ${currentPhone}, limpando cache`);
        syncedPhonesRef.current.delete(prevPhone);
        syncLeadByPhone(lead.id);
      }

      // Atualizar mapa de leads
      prevLeadsRef.current.set(lead.id, currentPhone);
    }

    // Remover leads que foram deletados
    for (const [leadId] of prevLeadsRef.current) {
      if (!crm.leads.find(l => l.id === leadId)) {
        prevLeadsRef.current.delete(leadId);
      }
    }
  }, [crm.leads, syncLeadByPhone]); // Roda quando leads QUALQUER mudança

  // Rastrear pacientes anteriores para detectar mudanças de telefone
  const prevPacientesRef = useRef<Map<string, string>>(new Map()); // pacienteId -> telefone

  useEffect(() => {
    // Detectar novos pacientes E mudanças de telefone
    for (const paciente of crm.pacientes) {
      const prevPhone = prevPacientesRef.current.get(paciente.id);
      const currentPhone = paciente.telefone?.replace(/\D/g, '') || '';

      if (!prevPacientesRef.current.has(paciente.id)) {
        // Paciente NOVO
        console.log(`[PhoneBasedSync] 🆕 Novo paciente detectado, sincronizando: ${paciente.id}`);
        syncPacienteByPhone(paciente.id);
      } else if (prevPhone !== currentPhone && prevPhone) {
        // TELEFONE MUDOU - limpar cache do telefone antigo para forçar re-sync
        console.log(`[PhoneBasedSync] 📱 Telefone do paciente mudou de ${prevPhone} para ${currentPhone}, limpando cache`);
        syncedPhonesRef.current.delete(prevPhone);
        syncPacienteByPhone(paciente.id);
      }

      // Atualizar mapa de pacientes
      prevPacientesRef.current.set(paciente.id, currentPhone);
    }

    // Remover pacientes que foram deletados
    for (const [pacienteId] of prevPacientesRef.current) {
      if (!crm.pacientes.find(p => p.id === pacienteId)) {
        prevPacientesRef.current.delete(pacienteId);
      }
    }
  }, [crm.pacientes, syncPacienteByPhone]); // Roda quando pacientes QUALQUER mudança

  return {
    loadDataForContact,
    syncLeadByPhone,
    syncPacienteByPhone,
    syncAll,
  };
}
