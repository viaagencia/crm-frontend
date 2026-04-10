import { useState, useEffect } from 'react';
import { Lead, Paciente, Coluna, Pipeline, Agendamento, Orcamento, PIPELINE_PADRAO, COLUNAS_PACIENTES_PADRAO } from '@/types/crm';
import supabase from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Helper para obter usuário logado ─────────────────────────────────────
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('[CRM] Erro ao obter usuário:', error);
    return null;
  }
  console.log('[CRM] Usuário atual:', user.id);
  return user;
}

// ─── Criar Pipeline Padrão para Novo Usuário ──────────────────────────────
async function createDefaultPipelineForUser(userId: string) {
  try {
    console.log('[CRM] Verificando se usuário já tem pipelines...');

    // 1. Verificar se já existe pipeline para este usuário
    const { data: existingPipelines, error: checkError } = await supabase
      .from('pipelines')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('[CRM] Erro ao verificar pipelines:', checkError);
      return false;
    }

    // Se já existe pipeline, não criar novamente
    if (existingPipelines && existingPipelines.length > 0) {
      console.log('[CRM] Usuário já possui pipelines');
      return true;
    }

    console.log('[CRM] Criando pipeline padrão para novo usuário...');

    // 2. Criar pipeline padrão
    const { data: newPipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert([{
        id: 'pipeline-padrao',
        nome: 'Funil Principal',
        user_id: userId,
      }])
      .select()
      .single();

    if (pipelineError) {
      console.error('[CRM] Erro ao criar pipeline:', pipelineError);
      return false;
    }

    console.log('[CRM] ✅ Pipeline criado:', newPipeline);

    // 3. Criar stages padrão
    const defaultStages = [
      { id: crypto.randomUUID(), nome: 'Novo Lead', pipeline_id: 'pipeline-padrao', ordem: 0, user_id: userId },
      { id: crypto.randomUUID(), nome: 'Contato', pipeline_id: 'pipeline-padrao', ordem: 1, user_id: userId },
      { id: crypto.randomUUID(), nome: 'Proposta', pipeline_id: 'pipeline-padrao', ordem: 2, user_id: userId },
      { id: crypto.randomUUID(), nome: 'Fechamento', pipeline_id: 'pipeline-padrao', ordem: 3, user_id: userId },
    ];

    const { error: stagesError } = await supabase
      .from('stages')
      .insert(defaultStages);

    if (stagesError) {
      console.error('[CRM] Erro ao criar stages:', stagesError);
      return false;
    }

    console.log('[CRM] ✅ Stages padrão criados:', defaultStages.length);
    return true;
  } catch (err) {
    console.error('[CRM] Erro ao criar pipeline padrão:', err);
    return false;
  }
}

// Função auxiliar para persistir em localStorage (fallback apenas)
function persistToLocalStorage(key: 'crm-leads' | 'crm-pacientes' | 'crm-agendamentos' | 'crm-orcamentos', data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper to load from localStorage (fallback)
function loadFromLocalStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function useCrmData() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([PIPELINE_PADRAO]);
  const [colunasPacientes, setColunasPacientes] = useState<Coluna[]>(COLUNAS_PACIENTES_PADRAO);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>(() => loadFromLocalStorage('crm-pacientes', []));
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => loadFromLocalStorage('crm-agendamentos', []));
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => loadFromLocalStorage('crm-orcamentos', []));

  // Carregar pipelines, colunas pacientes e leads do Supabase ao montar
  useEffect(() => {
    const initCRM = async () => {
      // 1. Garantir que o pipeline padrão existe
      const user = await getCurrentUser();
      if (user) {
        await createDefaultPipelineForUser(user.id);
      }

      // 2. Carregar dados
      loadPipelinesFromSupabase();
      loadColunasPacientesFromSupabase();
      loadLeadsFromSupabase();
    };

    initCRM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Carregar Pipelines do Supabase ──────────────────────────────────────
  const loadPipelinesFromSupabase = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('[Supabase] Usuário não autenticado, usando pipeline padrão');
        setPipelines([PIPELINE_PADRAO]);
        return;
      }

      // 1. Carregar pipelines do usuário
      const { data: pipelinesData, error: pipelinesError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('user_id', user.id)
        .order('id');

      if (pipelinesError) {
        console.log('[Supabase] Erro ao carregar pipelines:', pipelinesError);
        setPipelines([PIPELINE_PADRAO]);
        return;
      }

      if (!pipelinesData || pipelinesData.length === 0) {
        // Se vazio, usar pipeline padrão
        console.log('[Supabase] Nenhum pipeline encontrado para o usuário, usando padrão');
        setPipelines([PIPELINE_PADRAO]);
        return;
      }

      // 2. Para cada pipeline, carregar seus stages
      const pipelinesComStages = await Promise.all(
        pipelinesData.map(async (p: any) => {
          const { data: stages, error: stagesError } = await supabase
            .from('stages')
            .select('*')
            .eq('pipeline_id', p.id)
            .eq('user_id', user.id)
            .order('ordem');

          if (stagesError) {
            console.log('[Supabase] Erro ao carregar stages:', stagesError);
            return { ...p, colunas: [] };
          }

          return {
            id: p.id,
            nome: p.nome,
            colunas: (stages || []).map((s: any) => ({
              id: s.id,
              nome: s.nome,
              ordem: s.ordem,
              tipo: 'vendas',
            })),
            criadoEm: p.created_at || new Date().toISOString(),
          };
        })
      );

      console.log('[Supabase] ✅ Pipelines carregados:', pipelinesComStages.length);
      setPipelines(pipelinesComStages);
    } catch (err) {
      console.log('[Supabase] Erro ao carregar pipelines:', err);
      setPipelines([PIPELINE_PADRAO]);
    }
  };

  // ─── Carregar Colunas de Pacientes do Supabase ──────────────────────────
  const loadColunasPacientesFromSupabase = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('[Supabase] Usuário não autenticado');
        setColunasPacientes(COLUNAS_PACIENTES_PADRAO);
        return;
      }

      const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', 'pacientes')
        .eq('user_id', user.id)
        .order('ordem');

      if (stagesError) {
        console.log('[Supabase] Erro ao carregar colunas pacientes:', stagesError);
        return;
      }

      if (!stages || stages.length === 0) {
        console.log('[Supabase] Nenhuma coluna de pacientes encontrada, criando padrão');

        // Criar as colunas padrão de pacientes no Supabase
        const defaultColunas = COLUNAS_PACIENTES_PADRAO.map(col => ({
          id: col.id,
          nome: col.nome,
          pipeline_id: 'pacientes',
          ordem: col.ordem,
          user_id: user.id,
        }));

        const { error: insertError } = await supabase
          .from('stages')
          .insert(defaultColunas);

        if (insertError) {
          console.log('[Supabase] Erro ao criar colunas padrão de pacientes:', insertError);
        } else {
          console.log('[Supabase] ✅ Colunas padrão de pacientes criadas');
        }

        setColunasPacientes(COLUNAS_PACIENTES_PADRAO);
        return;
      }

      const colunas = stages.map((s: any) => ({
        id: s.id,
        nome: s.nome,
        ordem: s.ordem,
        tipo: 'pacientes',
      }));

      console.log('[Supabase] ✅ Colunas de pacientes carregadas:', colunas.length);
      setColunasPacientes(colunas);
    } catch (err) {
      console.log('[Supabase] Erro ao carregar colunas pacientes:', err);
      setColunasPacientes(COLUNAS_PACIENTES_PADRAO);
    }
  };

  // ─── Carregar Leads do Supabase ──────────────────────────────────────────
  const loadLeadsFromSupabase = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('[Supabase] Usuário não autenticado');
        setLeads([]);
        return;
      }

      console.log('[Supabase] Carregando leads do usuário:', user.id);

      // 1. Carregar leads do usuário onde pipeline_id != 'pacientes'
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .neq('pipeline_id', 'pacientes');

      if (leadsError) {
        console.error('[Supabase] Erro ao carregar leads:', leadsError);
        setLeads([]);
        return;
      }

      if (!leadsData || leadsData.length === 0) {
        console.log('[Supabase] Nenhum lead encontrado para o usuário');
        setLeads([]);
        return;
      }

      // 2. Transformar dados do Supabase para formato do app
      const leadsFormatados: Lead[] = leadsData.map((lead: any) => ({
        id: lead.id,
        nome: lead.nome || '',
        telefone: lead.telefone || '',
        email: lead.email || '',
        origem: lead.origem || '',
        pipelineId: lead.pipeline_id || 'pipeline-padrao',
        colunaId: lead.stage_id || 'novo-lead',
        criadoEm: lead.created_at || new Date().toISOString(),
        tarefas: [],
        anotacoes: [],
        agendamentos: [],
        orcamentos: [],
        atividades: [],
      }));

      console.log('[Supabase] ✅ Leads carregados:', leadsFormatados.length);
      setLeads(leadsFormatados);
    } catch (err) {
      console.error('[Supabase] Erro ao carregar leads:', err);
      setLeads([]);
    }
  };

  // ─── Adicionar Pipeline ──────────────────────────────────────────────────
  const addPipeline = async (nome: string) => {
    const user = await getCurrentUser();
    if (!user) {
      console.error('[Pipeline] Usuário não autenticado');
      return null;
    }

    if (pipelines.length >= 3) return null;

    try {
      // 1. Inserir pipeline no Supabase com user_id
      const { data: newPipelineData, error: insertError } = await supabase
        .from('pipelines')
        .insert([{ id: crypto.randomUUID(), nome, user_id: user.id }])
        .select();

      if (insertError) {
        console.log('[Supabase] Erro ao criar pipeline:', insertError);
        return null;
      }

      if (!newPipelineData || newPipelineData.length === 0) {
        console.log('[Supabase] Nenhum dado retornado ao criar pipeline');
        return null;
      }

      const newPipeline = newPipelineData[0];
      console.log('[Supabase] ✅ Pipeline criado:', newPipeline);

      // 2. Criar stages padrão com user_id
      const defaultStages = [
        { id: crypto.randomUUID(), nome: 'Lead', pipeline_id: newPipeline.id, ordem: 0, user_id: user.id },
        { id: crypto.randomUUID(), nome: 'Contato', pipeline_id: newPipeline.id, ordem: 1, user_id: user.id },
        { id: crypto.randomUUID(), nome: 'Fechamento', pipeline_id: newPipeline.id, ordem: 2, user_id: user.id },
      ];

      const { error: stagesError } = await supabase
        .from('stages')
        .insert(defaultStages);

      if (stagesError) {
        console.log('[Supabase] Erro ao criar stages:', stagesError);
      } else {
        console.log('[Supabase] ✅ Stages criados:', defaultStages.length);
      }

      // 3. Atualizar estado local
      const newPipelineObj: Pipeline = {
        id: newPipeline.id,
        nome: newPipeline.nome,
        colunas: defaultStages.map(s => ({
          id: s.id,
          nome: s.nome,
          ordem: s.ordem,
          tipo: 'vendas',
        })),
        criadoEm: newPipeline.created_at || new Date().toISOString(),
      };

      const newPipelines = [...pipelines, newPipelineObj];
      setPipelines(newPipelines);

      return newPipelineObj;
    } catch (err) {
      console.error('[Supabase] Erro ao adicionar pipeline:', err);
    }

    return null;
  };

  // ─── Deletar Stage Individual ────────────────────────────────────────────
  const deleteStage = async (stageId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Stage] Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', stageId)
        .eq('user_id', user.id);

      if (error) {
        console.log('[Supabase] Erro ao deletar stage:', error);
      } else {
        console.log('[Supabase] ✅ Stage deletado:', stageId);
      }
    } catch (err) {
      console.error('[Supabase] Erro ao deletar stage:', err);
    }
  };

  // ─── Atualizar Pipeline (colunas/stages) ─────────────────────────────────
  const updatePipeline = async (id: string, updates: Partial<Pipeline>) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Pipeline] Usuário não autenticado');
        return;
      }

      // 1. Atualizar o pipeline em si (nome)
      if (updates.nome) {
        const { error: updateError } = await supabase
          .from('pipelines')
          .update({ nome: updates.nome })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) {
          console.log('[Supabase] Erro ao atualizar pipeline:', updateError);
        } else {
          console.log('[Supabase] ✅ Pipeline atualizado');
        }
      }

      // 2. Se colunas foram atualizadas, sincronizar stages
      if (updates.colunas) {
        // Encontrar o pipeline atual para comparar e deletar colunas removidas
        const oldPipeline = pipelines.find(p => p.id === id);

        if (oldPipeline) {
          const oldColIds = new Set(oldPipeline.colunas.map(c => c.id));
          const newColIds = new Set(updates.colunas.map(c => c.id));

          // Deletar stages que foram removidos
          for (const colId of oldColIds) {
            if (!newColIds.has(colId)) {
              await deleteStage(colId);
            }
          }
        }

        // Upsert cada stage que permanece com user_id
        for (const coluna of updates.colunas) {
          const { error: upsertError } = await supabase
            .from('stages')
            .upsert({
              id: coluna.id,
              nome: coluna.nome,
              pipeline_id: id,
              ordem: coluna.ordem,
              user_id: user.id,
            }, { onConflict: 'id' });

          if (upsertError) {
            console.log('[Supabase] Erro ao atualizar stage:', upsertError);
          }
        }
        console.log('[Supabase] ✅ Stages sincronizados:', updates.colunas.length);
      }

      // 3. Atualizar estado local
      const newPipelines = pipelines.map(x => x.id === id ? { ...x, ...updates } : x);
      setPipelines(newPipelines);
    } catch (err) {
      console.error('[Supabase] Erro ao atualizar pipeline:', err);
    }
  };

  // ─── Deletar Pipeline ────────────────────────────────────────────────────
  const deletePipeline = async (id: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Pipeline] Usuário não autenticado');
        return;
      }

      // 1. Deletar stages relacionados
      const { error: stagesDeleteError } = await supabase
        .from('stages')
        .delete()
        .eq('pipeline_id', id)
        .eq('user_id', user.id);

      if (stagesDeleteError) {
        console.log('[Supabase] Erro ao deletar stages:', stagesDeleteError);
      } else {
        console.log('[Supabase] ✅ Stages deletados');
      }

      // 2. Deletar pipeline
      const { error: pipelineDeleteError } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (pipelineDeleteError) {
        console.log('[Supabase] Erro ao deletar pipeline:', pipelineDeleteError);
        return;
      }

      console.log('[Supabase] ✅ Pipeline deletado');

      // 3. Atualizar estado local
      const newPipelines = pipelines.filter(x => x.id !== id);
      setPipelines(newPipelines);
    } catch (err) {
      console.error('[Supabase] Erro ao deletar pipeline:', err);
    }
  };

  // ─── Gerenciar Colunas de Pacientes (com persistência em Supabase) ──────
  const updateColunasPacientes = async (newColunas: Coluna[]) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Pacientes] Usuário não autenticado');
        return;
      }

      // 1. Encontrar as colunas que foram removidas
      const oldColIds = new Set(colunasPacientes.map(c => c.id));
      const newColIds = new Set(newColunas.map(c => c.id));

      // Deletar colunas que foram removidas
      for (const colId of oldColIds) {
        if (!newColIds.has(colId)) {
          const { error } = await supabase
            .from('stages')
            .delete()
            .eq('id', colId)
            .eq('user_id', user.id);

          if (error) {
            console.log('[Supabase] Erro ao deletar coluna paciente:', error);
          } else {
            console.log('[Supabase] ✅ Coluna paciente deletada:', colId);
          }
        }
      }

      // 2. Upsert todas as colunas que permanecem com user_id
      for (const coluna of newColunas) {
        const { error: upsertError } = await supabase
          .from('stages')
          .upsert({
            id: coluna.id,
            nome: coluna.nome,
            pipeline_id: 'pacientes',
            ordem: coluna.ordem,
            user_id: user.id,
          }, { onConflict: 'id' });

        if (upsertError) {
          console.log('[Supabase] Erro ao atualizar coluna paciente:', upsertError);
        }
      }

      console.log('[Supabase] ✅ Colunas pacientes sincronizadas:', newColunas.length);
      setColunasPacientes(newColunas);
    } catch (err) {
      console.error('[Supabase] Erro ao atualizar colunas pacientes:', err);
    }
  };

  // ─── Leads (com Supabase) ────────────────────────────────────────────────
  const addLead = async (lead: any) => {
    // Obter usuário logado
    const user = await getCurrentUser();
    if (!user) {
      console.error('[Lead] Usuário não autenticado');
      return null;
    }

    // Validação básica
    if (!lead.nome || !lead.nome.trim()) {
      console.log('[Lead] Nome é obrigatório');
      return null;
    }

    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      tarefas: [],
      anotacoes: [],
      agendamentos: [],
      orcamentos: [],
      atividades: [],
    };

    try {
      // Normalizar telefone (remover caracteres especiais)
      const telefoneLimpo = (newLead.telefone || '').replace(/\D/g, '');

      console.log('[Supabase] Tentando salvar lead para usuário:', user.id);

      // 1. Salvar no Supabase com user_id
      const { data, error: upsertError } = await supabase
        .from('leads')
        .upsert(
          {
            id: newLead.id,
            nome: newLead.nome,
            telefone: telefoneLimpo || null,
            origem: newLead.origem || '',
            pipeline_id: newLead.pipelineId || 'pipeline-padrao',
            stage_id: newLead.colunaId || 'novo-lead',
            user_id: user.id,
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('[Supabase] Erro ao adicionar lead:', upsertError);
        return null;
      }

      console.log('[Supabase] ✅ Lead salvo com sucesso');

      // 2. Atualizar estado local
      const newLeads = [...leads, newLead];
      setLeads(newLeads);

      return newLead;
    } catch (err) {
      console.error('[Supabase] Erro ao adicionar lead:', err);
      return null;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Lead] Usuário não autenticado');
        return;
      }

      const lead = leads.find(l => l.id === id);
      if (!lead) {
        console.log('[Supabase] Lead não encontrado:', id);
        return;
      }

      console.log('[Supabase] Atualizando lead:', id);

      // 1. Atualizar no Supabase (verificar user_id para segurança)
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          nome: updates.nome || lead.nome,
          origem: updates.origem || lead.origem,
          pipeline_id: updates.pipelineId || lead.pipelineId,
          stage_id: updates.colunaId || lead.colunaId,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[Supabase] Erro ao atualizar lead:', updateError);
      } else {
        console.log('[Supabase] ✅ Lead atualizado');
      }

      // 2. Atualizar estado local
      const newLeads = leads.map(l => l.id === id ? { ...l, ...updates } : l);
      setLeads(newLeads);
    } catch (err) {
      console.error('[Supabase] Erro ao atualizar lead:', err);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Lead] Usuário não autenticado');
        return;
      }

      const lead = leads.find(l => l.id === id);
      if (!lead) {
        console.log('[Supabase] Lead não encontrado:', id);
        return;
      }

      console.log('[Supabase] Deletando lead:', id);

      // 1. Deletar do Supabase (verificar user_id para segurança)
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('[Supabase] Erro ao deletar lead:', deleteError);
      } else {
        console.log('[Supabase] ✅ Lead deletado');
      }

      // 2. Atualizar estado local
      const newLeads = leads.filter(l => l.id !== id);
      setLeads(newLeads);
    } catch (err) {
      console.error('[Supabase] Erro ao deletar lead:', err);
    }
  };

  // ─── Pacientes ───────────────────────────────────────────────────────────
  const convertLeadToPaciente = async (leadId: string, colunaId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('[Lead] Usuário não autenticado');
        return;
      }

      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      console.log('[Supabase] Convertendo lead para paciente:', leadId);

      // 1. Atualizar no Supabase: marcar como paciente (mover para pipeline 'pacientes')
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          pipeline_id: 'pacientes',
          stage_id: colunaId || 'em-tratamento',
        })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[Supabase] Erro ao converter lead para paciente:', updateError);
        return;
      }

      console.log('[Supabase] ✅ Lead convertido para paciente');

      // 2. Criar paciente local
      const paciente: Paciente = {
        id: crypto.randomUUID(),
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        leadOriginalId: lead.id,
        colunaId,
        criadoEm: new Date().toISOString(),
        tarefas: [],
        anotacoes: [],
        agendamentos: [],
        orcamentos: [],
        atividades: [],
      };

      // 3. Atualizar estado: remover lead e adicionar paciente
      const newLeads = leads.filter(l => l.id !== leadId);
      setLeads(newLeads);

      const newPacientes = [...pacientes, paciente];
      setPacientes(newPacientes);
      persistToLocalStorage('crm-pacientes', newPacientes);

      return paciente;
    } catch (err) {
      console.error('[Supabase] Erro ao converter lead para paciente:', err);
    }
  };

  const addPaciente = (paciente: any) => {
    const newPaciente: Paciente = {
      ...paciente,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      tarefas: [],
      anotacoes: [],
      agendamentos: [],
      orcamentos: [],
      atividades: [],
    };
    const newPacientes = [...pacientes, newPaciente];
    setPacientes(newPacientes);
    persistToLocalStorage('crm-pacientes', newPacientes);
    return newPaciente;
  };

  const updatePaciente = (id: string, updates: Partial<Paciente>) => {
    const newPacientes = pacientes.map(x => x.id === id ? { ...x, ...updates } : x);
    setPacientes(newPacientes);
    persistToLocalStorage('crm-pacientes', newPacientes);
  };

  const deletePaciente = (id: string) => {
    const newPacientes = pacientes.filter(x => x.id !== id);
    setPacientes(newPacientes);
    persistToLocalStorage('crm-pacientes', newPacientes);
  };

  const convertPacienteToLead = (pacienteId: string, pipelineId: string, colunaId: string) => {
    const paciente = pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;

    const newLead: Lead = {
      id: crypto.randomUUID(),
      nome: paciente.nome,
      telefone: paciente.telefone,
      email: paciente.email,
      origem: (paciente as any).origem || '',
      pipelineId,
      colunaId,
      criadoEm: new Date().toISOString(),
      tarefas: [],
      anotacoes: [],
      agendamentos: [],
      orcamentos: [],
      atividades: [],
    };

    const newLeads = [...leads, newLead];
    setLeads(newLeads);
    persistToLocalStorage('crm-leads', newLeads);
    deletePaciente(pacienteId);
    return newLead;
  };

  // ─── Agendamentos ───────────────────────────────────────────────────────
  const addAgendamento = (ag: any) => {
    const newAg: Agendamento = { ...ag, id: crypto.randomUUID() };
    const newAgendamentos = [...agendamentos, newAg];
    setAgendamentos(newAgendamentos);
    persistToLocalStorage('crm-agendamentos', newAgendamentos);
    return newAg;
  };

  const updateAgendamento = (id: string, updates: Partial<Agendamento>) => {
    const newAgendamentos = agendamentos.map(a => a.id === id ? { ...a, ...updates } : a);
    setAgendamentos(newAgendamentos);
    persistToLocalStorage('crm-agendamentos', newAgendamentos);
  };

  // ─── Orçamentos ─────────────────────────────────────────────────────────
  const addOrcamento = (orc: any) => {
    const newOrc: Orcamento = { ...orc, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    const newOrcamentos = [...orcamentos, newOrc];
    setOrcamentos(newOrcamentos);
    persistToLocalStorage('crm-orcamentos', newOrcamentos);
    return newOrc;
  };

  const updateOrcamento = (id: string, updates: Partial<Orcamento>) => {
    const newOrcamentos = orcamentos.map(o => o.id === id ? { ...o, ...updates } : o);
    setOrcamentos(newOrcamentos);
    persistToLocalStorage('crm-orcamentos', newOrcamentos);
  };

  return {
    pipelines, setPipelines, addPipeline, updatePipeline, deletePipeline,
    colunasPacientes, setColunasPacientes, updateColunasPacientes,
    leads, setLeads, addLead, updateLead, deleteLead, convertLeadToPaciente,
    pacientes, setPacientes, addPaciente, updatePaciente, deletePaciente, convertPacienteToLead,
    agendamentos, setAgendamentos, addAgendamento, updateAgendamento,
    orcamentos, setOrcamentos, addOrcamento, updateOrcamento,
  };
}
