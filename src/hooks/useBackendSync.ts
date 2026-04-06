import { useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://darksalmon-viper-304874.hostingersite.com';
const SYNC_INTERVAL = 20000; // 20 segundos (aumentado de 8 para evitar race conditions com Google Sheets)
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
      const localState = getLocalState();
      const hasLocalData = Object.keys(localState).length > 0;

      if (hasLocalData) {
        // Se há dados locais, fazer push inicial
        console.log('[Sync] Push inicial de dados locais...');
        await pushToBackend();
        lastPushedRef.current = JSON.stringify(localState);
      } else {
        // Se localStorage está vazio, PUXAR do backend!
        console.log('[Sync] localStorage vazio, puxando dados do backend...');
        const backendState = await pullFromBackend();
        if (backendState && Object.keys(backendState).length > 0) {
          console.log('[Sync] ✅ Dados carregados do backend para localStorage');
          // Restaurar dados do backend para localStorage
          for (const [key, value] of Object.entries(backendState)) {
            try {
              localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
              console.error(`[Sync] Erro ao salvar ${key} em localStorage:`, e);
            }
          }
          lastPushedRef.current = JSON.stringify(backendState);
          // Forçar reload da página para que dados apareçam na UI
          window.location.reload();
          return;
        } else {
          console.log('[Sync] Backend também vazio, usando dados padrão');
        }
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

    // Ao ganhar foco: fazer push dos dados locais como precaução
    const onFocus = async () => {
      console.log('[Sync] Window ganhou foco, sincronizando dados locais...');
      await pushToBackend();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      if (syncTimeoutId) clearTimeout(syncTimeoutId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
}
