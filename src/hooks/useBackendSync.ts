import { useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://darksalmon-viper-304874.hostingersite.com';
const SYNC_INTERVAL = 8000; // 8 segundos

const SYNC_KEYS = [
  'crm-pipelines',
  'crm-leads',
  'crm-pacientes',
  'crm-agendamentos',
  'crm-orcamentos',
  'crm-colunas-pacientes',
] as const;

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
    await fetch(`${API_URL}/api/crm-state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch (e) {
    console.error('[Sync] Erro push:', e);
  }
}

async function pullFromBackend(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_URL}/api/crm-state`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

/**
 * Sincroniza localStorage com MySQL a cada 8s via PUT/GET no backend.
 * Push quando detecta mudança; pull ao focar janela para pegar dados de outro browser.
 */
export function useBackendSync() {
  const lastPushedRef = useRef<string>('');

  useEffect(() => {
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
          // Servidor tem dados, local vazio → importa
          for (const key of SYNC_KEYS) {
            if (serverState[key]) localStorage.setItem(key, JSON.stringify(serverState[key]));
          }
          window.location.reload();
          return;
        }
      }

      // Envia dados locais imediatamente
      if (hasLocalData) {
        await pushToBackend();
        lastPushedRef.current = JSON.stringify(getLocalState());
      }

      // Polling: push sempre que localStorage mudar
      intervalId = setInterval(async () => {
        const currentState = JSON.stringify(getLocalState());
        if (currentState !== lastPushedRef.current) {
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
        for (const key of SYNC_KEYS) {
          if (serverState[key]) localStorage.setItem(key, JSON.stringify(serverState[key]));
        }
        window.location.reload();
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
}
