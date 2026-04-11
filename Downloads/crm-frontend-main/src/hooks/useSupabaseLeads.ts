import { useEffect, useCallback, useRef, useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/lib/supabase';

/**
 * Hook para sincronizar leads do Supabase em tempo real
 * - Busca leads inicialmente
 * - Subscreve a mudanças via postgres_changes
 * - Atualiza CRM context automaticamente
 * - Filtra por user_id do usuário logado
 */
export function useSupabaseLeads() {
  const crm = useCrm();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const loadedRef = useRef(false);

  /**
   * Remover leads duplicados (caso existam no CRM)
   * Mantém apenas o primeiro de cada ID
   */
  const deduplicateLeads = useCallback(() => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const lead of crm.leads) {
      if (seen.has(lead.id)) {
        duplicates.push(lead.id);
      } else {
        seen.add(lead.id);
      }
    }

    if (duplicates.length > 0) {
      console.warn('[useSupabaseLeads] ⚠️ Removendo leads duplicados:', duplicates);
      for (const leadId of duplicates) {
        crm.deleteLead(leadId);
      }
    }
  }, [crm]);

  /**
   * Buscar leads do Supabase
   * Filtra por user_id do usuário logado
   */
  const loadLeads = useCallback(async () => {
    if (!user?.id) {
      console.log('[useSupabaseLeads] Usuário não autenticado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('[useSupabaseLeads] Erro ao buscar leads:', fetchError);
        setError(fetchError.message);
        return;
      }

      console.log(`[useSupabaseLeads] ✅ Carregados ${data?.length || 0} leads`);

      if (!data || data.length === 0) {
        console.log('[useSupabaseLeads] Nenhum lead encontrado');
        return;
      }

      // Sincronizar com CRM context
      for (const lead of data) {
        const existingLead = crm.leads.find(l => l.id === lead.id);

        if (!existingLead) {
          // Lead novo - adicionar ao CRM
          console.log(`[useSupabaseLeads] Adicionando lead: id=${lead.id}, name="${lead.name}", pipeline="${lead.pipeline_id}", stage="${lead.stage_id}"`);
          crm.addLead({
            id: lead.id,
            nome: lead.name || lead.nome || '', // Suporta ambos "name" (n8n) e "nome"
            telefone: lead.telefone || '',
            email: lead.email || '',
            origem: lead.origem || '',
            pipelineId: lead.pipeline_id || '',
            colunaId: lead.stage_id || '',
            criadoEm: lead.created_at || new Date().toISOString(),
          });
        } else {
          // Lead existente - atualizar se houver mudanças
          const updates: Record<string, any> = {};
          if (existingLead.nome !== lead.name) updates.nome = lead.name;
          if (existingLead.telefone !== lead.telefone) updates.telefone = lead.telefone;
          if (existingLead.email !== lead.email) updates.email = lead.email;
          if (existingLead.origem !== lead.origem) updates.origem = lead.origem;
          if (existingLead.pipelineId !== lead.pipeline_id) updates.pipelineId = lead.pipeline_id;
          if (existingLead.colunaId !== lead.stage_id) updates.colunaId = lead.stage_id;

          if (Object.keys(updates).length > 0) {
            crm.updateLead(lead.id, updates);
          }
        }
      }

      // Remover leads que não estão mais em Supabase
      const supabaseIds = new Set(data.map(l => l.id));
      for (const lead of [...crm.leads]) {
        if (!supabaseIds.has(lead.id)) {
          console.log(`[useSupabaseLeads] Removendo lead que foi deletado: ${lead.nome}`);
          crm.deleteLead(lead.id);
        }
      }
    } catch (err) {
      console.error('[useSupabaseLeads] Erro ao carregar leads:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, crm]);

  /**
   * Subscrever a mudanças em tempo real
   * Listening para INSERT, UPDATE, DELETE na tabela leads
   */
  const subscribeToChanges = useCallback(() => {
    if (!user?.id) {
      console.log('[useSupabaseLeads] Não é possível subscrever sem usuário autenticado');
      return;
    }

    // Limpar subscription anterior se existir
    if (subscriptionRef.current) {
      console.log('[useSupabaseLeads] Removendo subscription anterior');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('[useSupabaseLeads] 📡 Criando subscription para realtime...');

    const channel = supabase
      .channel(`leads-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('[useSupabaseLeads] 🆕 Novo lead inserido:', payload.new);
          const lead = payload.new;

          // 🔒 Verificação dupla contra duplicação
          const existingLead = crm.leads.find(l => l.id === lead.id);
          if (!existingLead) {
            // ✅ Preservar dados exatos do Supabase, sem fallbacks ruins
            crm.addLead({
              id: lead.id,
              nome: lead.name || lead.nome || '', // Suporta ambos "name" e "nome", sem fallback "Lead importado"
              telefone: lead.telefone || '',
              email: lead.email || '',
              origem: lead.origem || '',
              pipelineId: lead.pipeline_id || '', // Sem fallback hardcoded
              colunaId: lead.stage_id || '', // Sem fallback hardcoded
              criadoEm: lead.created_at || new Date().toISOString(),
            });
          } else {
            console.log('[useSupabaseLeads] Lead já existe, ignorando duplicação:', lead.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('[useSupabaseLeads] ✏️ Lead atualizado:', payload.new);
          const lead = payload.new;
          const existingLead = crm.leads.find(l => l.id === lead.id);

          if (existingLead) {
            // ✅ Atualizar apenas campos que mudaram
            const updates: Record<string, any> = {};
            if (lead.name && existingLead.nome !== lead.name) updates.nome = lead.name;
            if (lead.telefone && existingLead.telefone !== lead.telefone) updates.telefone = lead.telefone;
            if (lead.email && existingLead.email !== lead.email) updates.email = lead.email;
            if (lead.origem && existingLead.origem !== lead.origem) updates.origem = lead.origem;
            if (lead.pipeline_id && existingLead.pipelineId !== lead.pipeline_id) updates.pipelineId = lead.pipeline_id;
            if (lead.stage_id && existingLead.colunaId !== lead.stage_id) updates.colunaId = lead.stage_id;

            if (Object.keys(updates).length > 0) {
              crm.updateLead(lead.id, updates);
            } else {
              console.log('[useSupabaseLeads] Nenhuma alteração detectada para:', lead.id);
            }
          } else {
            console.log('[useSupabaseLeads] Lead não encontrado para atualização:', lead.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('[useSupabaseLeads] ❌ Lead deletado:', payload.old?.id);
          const lead = payload.old;
          const existingLead = crm.leads.find(l => l.id === lead.id);

          if (existingLead) {
            crm.deleteLead(lead.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useSupabaseLeads] ✅ Subscription ativa - aguardando mudanças em tempo real');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useSupabaseLeads] ❌ Erro na subscription');
          setError('Erro ao conectar a realtime');
        } else if (status === 'CLOSED') {
          console.log('[useSupabaseLeads] Subscription fechada');
        }
      });

    subscriptionRef.current = channel;
  }, [user?.id, crm]);

  /**
   * Efeito: carregar dados inicialmente e subscrever a mudanças
   */
  useEffect(() => {
    if (!user?.id) {
      console.log('[useSupabaseLeads] Aguardando autenticação do usuário');
      return;
    }

    // Carregar dados apenas uma vez
    if (!loadedRef.current) {
      console.log('[useSupabaseLeads] Carregando dados iniciais...');
      loadLeads().then(() => {
        // 🧹 Remover qualquer duplicata que possa ter sido criada
        deduplicateLeads();
        loadedRef.current = true;
        // Subscrever após carregar dados
        subscribeToChanges();
      });
    }

    // Cleanup: remover subscription ao desmontar
    return () => {
      if (subscriptionRef.current) {
        console.log('[useSupabaseLeads] Removendo subscription (unmount)');
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [user?.id, loadLeads, subscribeToChanges, deduplicateLeads]);

  return { isLoading, error };
}
