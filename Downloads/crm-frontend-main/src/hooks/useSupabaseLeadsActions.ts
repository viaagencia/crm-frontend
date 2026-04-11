import supabase from '@/lib/supabase';
import { Lead } from '@/types/crm';

/**
 * Funções para CRUD de leads no Supabase
 * Substituem enviarLeadParaSheets, atualizarEtapaNaSheets, apagarLeadDaSheets
 */

/**
 * Criar um novo lead no Supabase
 * @param nome Nome do lead
 * @param telefone Número de telefone
 * @param origem Origem do lead
 * @param pipelineId ID do pipeline/funil
 * @param stageId ID da etapa/coluna
 * @param userId ID do usuário logado
 * @returns Lead criado ou null em caso de erro
 */
export async function createLeadInSupabase(
  nome: string,
  telefone: string,
  origem: string,
  pipelineId: string,
  stageId: string,
  userId: string
): Promise<Lead | null> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: nome,
        telefone: telefone.replace(/\D/g, ''),
        origem: origem,
        pipeline_id: pipelineId,
        stage_id: stageId,
        user_id: userId,
        created_at: now,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[createLeadInSupabase] Erro:', error);
      throw error;
    }

    console.log('[createLeadInSupabase] ✅ Lead criado:', data?.id);

    return {
      id: data.id,
      nome: data.name,
      telefone: data.telefone,
      email: data.email || '',
      origem: data.origem,
      pipelineId: data.pipeline_id,
      colunaId: data.stage_id,
      criadoEm: data.created_at,
    } as Lead;
  } catch (err) {
    console.error('[createLeadInSupabase] Erro ao criar lead:', err);
    return null;
  }
}

/**
 * Atualizar informações de um lead
 * @param id ID do lead
 * @param updates Objeto com campos a atualizar
 * @returns Lead atualizado ou null em caso de erro
 */
export async function updateLeadInSupabase(
  id: string,
  updates: Partial<{
    name: string;
    telefone: string;
    email: string;
    origem: string;
    pipeline_id: string;
    stage_id: string;
  }>
): Promise<Lead | null> {
  try {
    // Normalizar nome de campos do frontend para Supabase
    const supabaseUpdates: Record<string, any> = {};

    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.telefone !== undefined) supabaseUpdates.telefone = updates.telefone.replace(/\D/g, '');
    if (updates.email !== undefined) supabaseUpdates.email = updates.email;
    if (updates.origem !== undefined) supabaseUpdates.origem = updates.origem;
    if (updates.pipeline_id !== undefined) supabaseUpdates.pipeline_id = updates.pipeline_id;
    if (updates.stage_id !== undefined) supabaseUpdates.stage_id = updates.stage_id;

    const { data, error } = await supabase
      .from('leads')
      .update(supabaseUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[updateLeadInSupabase] Erro:', error);
      throw error;
    }

    console.log('[updateLeadInSupabase] ✅ Lead atualizado:', id);

    return {
      id: data.id,
      nome: data.name,
      telefone: data.telefone,
      email: data.email || '',
      origem: data.origem,
      pipelineId: data.pipeline_id,
      colunaId: data.stage_id,
      criadoEm: data.created_at,
    } as Lead;
  } catch (err) {
    console.error('[updateLeadInSupabase] Erro ao atualizar lead:', err);
    return null;
  }
}

/**
 * Atualizar apenas a etapa/coluna de um lead
 * Equivalente a atualizarEtapaNaSheets
 * @param id ID do lead
 * @param stageId ID da nova etapa/coluna
 * @returns Lead atualizado ou null em caso de erro
 */
export async function updateLeadStageInSupabase(
  id: string,
  stageId: string
): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ stage_id: stageId })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[updateLeadStageInSupabase] Erro:', error);
      throw error;
    }

    console.log('[updateLeadStageInSupabase] ✅ Etapa do lead atualizada:', id);

    return {
      id: data.id,
      nome: data.name,
      telefone: data.telefone,
      email: data.email || '',
      origem: data.origem,
      pipelineId: data.pipeline_id,
      colunaId: data.stage_id,
      criadoEm: data.created_at,
    } as Lead;
  } catch (err) {
    console.error('[updateLeadStageInSupabase] Erro ao atualizar etapa:', err);
    return null;
  }
}

/**
 * Atualizar apenas o pipeline de um lead
 * Usado quando converte lead para paciente ou muda de funil
 * @param id ID do lead
 * @param pipelineId ID do novo pipeline
 * @param stageId ID da etapa no novo pipeline (opcional)
 * @returns Lead atualizado ou null em caso de erro
 */
export async function updateLeadPipelineInSupabase(
  id: string,
  pipelineId: string,
  stageId?: string
): Promise<Lead | null> {
  try {
    const updates: Record<string, any> = { pipeline_id: pipelineId };
    if (stageId) updates.stage_id = stageId;

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[updateLeadPipelineInSupabase] Erro:', error);
      throw error;
    }

    console.log('[updateLeadPipelineInSupabase] ✅ Pipeline do lead atualizado:', id);

    return {
      id: data.id,
      nome: data.name,
      telefone: data.telefone,
      email: data.email || '',
      origem: data.origem,
      pipelineId: data.pipeline_id,
      colunaId: data.stage_id,
      criadoEm: data.created_at,
    } as Lead;
  } catch (err) {
    console.error('[updateLeadPipelineInSupabase] Erro ao atualizar pipeline:', err);
    return null;
  }
}

/**
 * Deletar um lead do Supabase
 * Equivalente a apagarLeadDaSheets
 * @param id ID do lead a deletar
 * @returns true se deletado com sucesso, false caso contrário
 */
export async function deleteLeadFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteLeadFromSupabase] Erro:', error);
      throw error;
    }

    console.log('[deleteLeadFromSupabase] ✅ Lead deletado:', id);
    return true;
  } catch (err) {
    console.error('[deleteLeadFromSupabase] Erro ao deletar lead:', err);
    return false;
  }
}

/**
 * Buscar um lead específico pelo ID
 * @param id ID do lead
 * @returns Lead encontrado ou null
 */
export async function getLeadFromSupabase(id: string): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getLeadFromSupabase] Erro:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.name,
      telefone: data.telefone,
      email: data.email || '',
      origem: data.origem,
      pipelineId: data.pipeline_id,
      colunaId: data.stage_id,
      criadoEm: data.created_at,
    } as Lead;
  } catch (err) {
    console.error('[getLeadFromSupabase] Erro ao buscar lead:', err);
    return null;
  }
}

/**
 * Buscar leads de um usuário específico
 * @param userId ID do usuário
 * @returns Array de leads do usuário
 */
export async function getLeadsByUserIdFromSupabase(userId: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getLeadsByUserIdFromSupabase] Erro:', error);
      return [];
    }

    return (data || []).map(lead => ({
      id: lead.id,
      nome: lead.name,
      telefone: lead.telefone,
      email: lead.email || '',
      origem: lead.origem,
      pipelineId: lead.pipeline_id,
      colunaId: lead.stage_id,
      criadoEm: lead.created_at,
    } as Lead));
  } catch (err) {
    console.error('[getLeadsByUserIdFromSupabase] Erro ao buscar leads:', err);
    return [];
  }
}
