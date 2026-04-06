import { useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://darksalmon-viper-304874.hostingersite.com';
const SYNC_INTERVAL = 8000; // 8 segundos
const SYNC_DEBOUNCE = 1000; // 1s debounce para evitar PUTs frequentes

const SYNC_KEYS = [
  'crm-pipelines',
  'crm-leads',
  'crm-pacientes',
  'crm-agendamentos',
  'crm-orcamentos',
  'crm-colunas-pacientes',
] as const;

// Substituir localStorage.setItem para interceptar mudanças
const originalSetItem = localStorage.setItem.bind(localStorage);
let syncTimeoutId: ReturnType<typeof setTimeout> | null = null;

function getLocalState(): Record<string, unknown> {
  const state: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try { state[key] = JSON.parse(raw); } catch { state[key] = raw; }
    }
  }
  return state;
}

async function pushToBackend() {
  const state = getLocalState();
  if (Object.keys(state).length === 0) return;
  try {
    console.log('[Sync] Enviando dados para backend...');
    const res = await fetch(`${API_URL}/api/crm-state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (res.ok) {
      console.log('[Sync] ✅ Dados enviados com sucesso');
    } else {
      console.error('[Sync] ❌ Erro na resposta:', res.status);
    }
  } catch (e) {
    console.error('[Sync] Erro ao enviar:', e);
  }
}

async function pullFromBackend(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_URL}/api/crm-state`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Interceptar setItem para fazer push imediato (com debounce)
function interceptSetItem() {
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem(key, value);

    // Se for uma das chaves de sync, dispara push com debounce
    if (SYNC_KEYS.includes(key as any)) {
      console.log(`[Sync] localStorage.setItem("${key}") — agendando push...`);
      if (syncTimeoutId) clearTimeout(syncTimeoutId);
      syncTimeoutId = setTimeout(() => {
        pushToBackend();
      }, SYNC_DEBOUNCE);
    }
  };
}

/**
 * Sincroniza localStorage com MySQL via PUT/GET no backend.
 *
 * ESTRATÉGIA:
 * 1. Intercepta localStorage.setItem() para fazer push imediato (com debounce de 1s)
 * 2. Polling a cada 8s como fallback para garantir sincronização
 * 3. Ao abrir página: puxa dados do servidor se estiver vazio localmente
 * 4. Ao ganhar foco: verifica se servidor tem dados mais novos
 */
export function useBackendSync() {
  const lastPushedRef = useRef<string>('');

  useEffect(() => {
    // Interceptar setItem para fazer push imediato
    interceptSetItem();

    let intervalId: ReturnType<typeof setInterval>;

    async function initialize() {
      const serverState = await pullFromBackend();

      const localLeadsRaw = localStorage.getItem('crm-leads');
      const localLeads = localLeadsRaw ? JSON.parse(localLeadsRaw) : [];
      const hasLocalData = Array.isArray(localLeads) && localLeads.length > 0;

      if (serverState && serverState['crm-leads']) {
        const serverLeads = serverState['crm-leads'] as unknown[];
        const hasServerData = Array.isArray(serverLeads) && serverLeads.length > 0;

        if (hasServerData && !hasLocalData) {
          // Servidor tem dados, local vazio → importa sem disparar setItem hook
          console.log('[Sync] Importando dados do servidor...');
          for (const key of SYNC_KEYS) {
            if (serverState[key]) originalSetItem(key, JSON.stringify(serverState[key]));
          }
          window.location.reload();
          return;
        }
      }

      // Envia dados locais imediatamente na inicialização
      if (hasLocalData) {
        console.log('[Sync] Push inicial de dados locais...');
        await pushToBackend();
        lastPushedRef.current = JSON.stringify(getLocalState());
      }

      // Polling: fallback para garantir sincronização mesmo se houver falhas
      intervalId = setInterval(async () => {
        const currentState = JSON.stringify(getLocalState());
        if (currentState !== lastPushedRef.current) {
          console.log('[Sync] Polling detectou mudança (fallback)');
          lastPushedRef.current = currentState;
          await pushToBackend();
        }
      }, SYNC_INTERVAL);
    }

    initialize();

    // Ao ganhar foco: verifica se outro browser salvou dados mais recentes
    const onFocus = async () => {
      const serverState = await pullFromBackend();
      if (!serverState) return;

      // Compara tamanho do JSON — servidor maior = tem mais dados
      const serverJson = JSON.stringify(serverState['crm-leads'] || []);
      const localJson = localStorage.getItem('crm-leads') || '[]';

      if (serverJson.length > localJson.length) {
        console.log('[Sync] Window ganhou foco, atualizando do servidor...');
        for (const key of SYNC_KEYS) {
          if (serverState[key]) originalSetItem(key, JSON.stringify(serverState[key]));
        }
        window.location.reload();
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      if (syncTimeoutId) clearTimeout(syncTimeoutId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
}
