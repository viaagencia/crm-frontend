import { useEffect, useCallback, useRef } from 'react';
import { useCrm } from '@/contexts/CrmContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://darksalmon-viper-304874.hostingersite.com';
const SYNC_INTERVAL = 10000; // 10 segundos

// Chaves do localStorage que queremos sincronizar
const SYNC_KEYS = [
  'crm-pipelines',
  'crm-leads',
  'crm-pacientes',
  'crm-agendamentos',
  'crm-orcamentos',
  'crm-colunas-pacientes',
] as const;

/**
 * Hook que sincroniza o localStorage do CRM com o backend MySQL.
 *
 * Estratégia:
 * 1. Na carga inicial, busca o estado do MySQL
 * 2. Se MySQL tem dados e localStorage está vazio, importa do MySQL
 * 3. Se localStorage tem dados, envia para MySQL (localStorage = fonte da verdade)
 * 4. Periodicamente faz push do localStorage para o MySQL
 * 5. Periodicamente faz pull do MySQL para detectar mudanças de outros navegadores
 */
export function useBackendSync() {
  const crm = useCrm();
  const lastSyncHash = useRef<string>('');
  const isFirstLoad = useRef(true);
  const isSyncing = useRef(false);

  // Gera um hash simples do estado atual do localStorage
  const getLocalStateHash = useCallback(() => {
    const parts: string[] = [];
    for (const key of SYNC_KEYS) {
      const val = localStorage.getItem(key);
      if (val) parts.push(val);
    }
    return parts.join('|').length.toString() + '-' + parts.join('|').slice(0, 100);
  }, []);

  // Coleta todo o estado do localStorage
  const getLocalState = useCallback(() => {
    const state: Record<string, unknown> = {};
    for (const key of SYNC_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          state[key] = JSON.parse(raw);
        } catch {
          state[key] = raw;
        }
      }
    }
    return state;
  }, []);

  // Push: envia localStorage para MySQL
  const pushToBackend = useCallback(async () => {
    try {
      const state = getLocalState();
      if (Object.keys(state).length === 0) return;

      await fetch(`${API_URL}/api/crm-state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      console.log('[Sync] Push para MySQL OK');
    } catch (e) {
      console.error('[Sync] Erro no push:', e);
    }
  }, [getLocalState]);

  // Pull: busca estado do MySQL e aplica no localStorage se houver dados novos
  const pullFromBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/crm-state`);
      if (!res.ok) return null;
      const serverState = await res.json();
      return serverState;
    } catch (e) {
      console.error('[Sync] Erro no pull:', e);
      return null;
    }
  }, []);

  // Aplica estado do servidor no localStorage e atualiza o React state
  const applyServerState = useCallback((serverState: Record<string, unknown>) => {
    if (!serverState || Object.keys(serverState).length === 0) return false;

    let changed = false;
    for (const key of SYNC_KEYS) {
      if (serverState[key]) {
        const serverJson = JSON.stringify(serverState[key]);
        const localJson = localStorage.getItem(key);
        if (serverJson !== localJson) {
          localStorage.setItem(key, serverJson);
          changed = true;
        }
      }
    }

    if (changed) {
      // Recarrega a página para que o React pegue os novos valores do localStorage
      // Isso é simples e garante consistência
      window.location.reload();
    }

    return changed;
  }, []);

  // Sync principal
  const sync = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;

        // Na primeira carga: verifica se há dados no MySQL
        const serverState = await pullFromBackend();

        // Verifica se o localStorage está "vazio" (sem leads)
        const localLeads = localStorage.getItem('crm-leads');
        const hasLocalData = localLeads && JSON.parse(localLeads).length > 0;

        if (serverState && serverState['crm-leads']) {
          const serverLeads = serverState['crm-leads'];
          const hasServerData = Array.isArray(serverLeads) && serverLeads.length > 0;

          if (hasServerData && !hasLocalData) {
            // MySQL tem dados, localStorage está vazio → importa do MySQL
            console.log('[Sync] Importando dados do MySQL para localStorage');
            applyServerState(serverState);
            return;
          }
        }

        // localStorage tem dados → envia para MySQL
        if (hasLocalData) {
          console.log('[Sync] Enviando dados locais para MySQL');
          await pushToBackend();
        }
      } else {
        // Syncs subsequentes: push local → MySQL
        const currentHash = getLocalStateHash();
        if (currentHash !== lastSyncHash.current) {
          lastSyncHash.current = currentHash;
          await pushToBackend();
        }
      }
    } catch (e) {
      console.error('[Sync] Erro geral:', e);
    } finally {
      isSyncing.current = false;
    }
  }, [pullFromBackend, pushToBackend, applyServerState, getLocalStateHash]);

  useEffect(() => {
    // Sync inicial
    sync();

    // Sync periódico
    const interval = setInterval(sync, SYNC_INTERVAL);

    // Sync quando a janela ganha foco (usuário volta de outro navegador)
    const onFocus = () => {
      pullFromBackend().then(serverState => {
        if (serverState) {
          const localLeads = localStorage.getItem('crm-leads');
          const serverLeadsStr = JSON.stringify(serverState['crm-leads'] || []);
          if (localLeads !== serverLeadsStr && serverState['crm-leads']) {
            applyServerState(serverState);
          }
        }
      });
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [sync, pullFromBackend, applyServerState]);

  return { syncNow: sync };
}
