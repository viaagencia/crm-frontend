/**
 * useSupabaseSync
 *
 * Sincronização com Supabase — complementar ao Google Sheets.
 * - Usa pipeline fixo: 'pipeline-padrao'
 * - SEMPRE usa 'nome' (nunca 'name')
 * - Espelha leads e pacientes para Supabase
 * - Sincroniza movimentações no kanban
 */

import { useEffect, useRef } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import supabase from '@/lib/supabase';

// ─── Constantes globais ──────────────────────────────────────────────────────
const PIPELINE_ID = 'pipeline-padrao';
const PACIENTES_PIPELINE_ID = 'pacientes';

// ─── Criar/Atualizar Lead no Supabase ────────────────────────────────────────

export async function upsertLeadNoSupabase(lead: {
  telefone: string;
  nome: string;
  email?: string;
  origem?: string;
  stage_id?: string;
  pipeline_id?: string;
  user_id?: string;
}) {
  const telefone = lead.telefone.replace(/\D/g, '');
  if (!telefone) return;

  try {
    // Se não tiver user_id, tentar obter da sessão
    let userId = lead.user_id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      console.warn('[Supabase] Nenhum usuário autenticado, abortando upsert');
      return;
    }

    const { error } = await supabase.from('leads').upsert(
      {
        telefone,
        nome: lead.nome || '',
        email: lead.email || '',
        origem: lead.origem || '',
        pipeline_id: lead.pipeline_id || PIPELINE_ID,
        stage_id: lead.stage_id || 'novo-lead',
        user_id: userId,
      },
      { onConflict: 'telefone,user_id' }
    );

    if (error) {
      console.log('[Supabase] Erro ao upsert lead:', error);
    }
  } catch (e) {
    console.log('[Supabase] Erro:', e);
  }
}

// ─── Mover Lead entre Stages (Drag & Drop) ───────────────────────────────────

export async function moverStageNoSupabase(telefone: string, stageId: string) {
  const clean = telefone.replace(/\D/g, '');
  if (!clean || !stageId) return;

  try {
    const { error } = await supabase
      .from('leads')
      .update({ stage_id: stageId })
      .eq('telefone', clean);

    if (error) {
      console.log('[Supabase] Erro ao mover stage:', error);
    }
  } catch (e) {
    console.log('[Supabase] Erro:', e);
  }
}

// ─── Deletar Lead ────────────────────────────────────────────────────────────

export async function deletarDoSupabase(telefone: string) {
  const clean = telefone.replace(/\D/g, '');
  if (!clean) return;

  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('telefone', clean);

    if (error) {
      console.log('[Supabase] Erro ao deletar:', error);
    }
  } catch (e) {
    console.log('[Supabase] Erro:', e);
  }
}

// ─── Carregar Stages do Pipeline ─────────────────────────────────────────────

export async function carregarStages(pipelineId: string = PIPELINE_ID) {
  try {
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('ordem');

    if (error) {
      console.log('[Supabase] Erro ao carregar stages:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.log('[Supabase] Erro:', e);
    return [];
  }
}

// ─── Carregar Leads do Pipeline ─────────────────────────────────────────────

export async function carregarLeads(pipelineId: string = PIPELINE_ID) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('pipeline_id', pipelineId);

    if (error) {
      console.log('[Supabase] Erro ao carregar leads:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.log('[Supabase] Erro:', e);
    return [];
  }
}

// ─── Hook de Sincronização ──────────────────────────────────────────────────

export function useSupabaseSync() {
  const crm = useCrm();

  const leadsHashRef = useRef('');
  const pacientesHashRef = useRef('');
  const leadsDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pacientesDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync leads → Supabase (debounced 2s) ─────────────────────────────────
  useEffect(() => {
    const hash = crm.leads
      .map(l => `${l.telefone}:${l.colunaId}:${l.nome}`)
      .join('|');

    if (hash === leadsHashRef.current) return;
    leadsHashRef.current = hash;

    if (leadsDebRef.current) clearTimeout(leadsDebRef.current);
    leadsDebRef.current = setTimeout(async () => {
      if (crm.leads.length === 0) return;

      for (const lead of crm.leads) {
        await upsertLeadNoSupabase({
          telefone: lead.telefone,
          nome: lead.nome,
          email: lead.email,
          origem: lead.origem,
          stage_id: lead.colunaId,
        });
      }
    }, 2000);
  }, [crm.leads]);

  // ── Sync pacientes → Supabase (debounced 2s) ────────────────────────────
  useEffect(() => {
    const hash = crm.pacientes
      .map(p => `${p.telefone}:${p.colunaId}:${p.nome}`)
      .join('|');

    if (hash === pacientesHashRef.current) return;
    pacientesHashRef.current = hash;

    if (pacientesDebRef.current) clearTimeout(pacientesDebRef.current);
    pacientesDebRef.current = setTimeout(async () => {
      if (crm.pacientes.length === 0) return;

      for (const paciente of crm.pacientes) {
        await upsertLeadNoSupabase({
          telefone: paciente.telefone,
          nome: paciente.nome,
          email: paciente.email,
          origem: (paciente as any).origem,
          stage_id: paciente.colunaId,
        });
      }
    }, 2000);
  }, [crm.pacientes]);

  return { moverStageNoSupabase, deletarDoSupabase, upsertLeadNoSupabase };
}
