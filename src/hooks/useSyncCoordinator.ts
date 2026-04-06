import { useEffect, useRef } from 'react';

/**
 * SYNC COORDINATOR - Evita flickering por conflitos de sincronização
 *
 * Problema: 3 sistemas sincronizando ao mesmo tempo causam race conditions
 * - useBackendSync (polling 8s)
 * - useGoogleSheetsSync (polling 15s)
 * - useCrmData (loads localStorage)
 *
 * Solução: Implementar debounce global para não atualizar UI enquanto sincroniza
 */

const RECONCILIATION_DEBOUNCE = 500; // 500ms para aguardar múltiplas mudanças
const MIN_SYNC_INTERVAL = 3000; // Mínimo 3s entre sincronizações

let lastSyncTime = 0;
let reconciliationTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;

export function useSyncCoordinator() {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Interceptar window.dispatchEvent para coordenar sincronizações
    // Quando um hook quer sincronizar, ele dispara um evento
    window.addEventListener('crm-sync-request', handleSyncRequest);

    return () => {
      window.removeEventListener('crm-sync-request', handleSyncRequest);
      if (reconciliationTimeoutId) clearTimeout(reconciliationTimeoutId);
    };
  }, []);
}

function handleSyncRequest() {
  // Debounce: aguarda 500ms para ver se há mais mudanças
  // Isso evita múltiplos re-renders causados por sincronizações rápidas
  if (reconciliationTimeoutId) {
    clearTimeout(reconciliationTimeoutId);
  }

  reconciliationTimeoutId = setTimeout(async () => {
    const now = Date.now();

    // Evitar sincronizações muito frequentes (mínimo 3s entre elas)
    if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
      console.log('[Coordinator] Sincronização ignorada (muito frequente)');
      return;
    }

    lastSyncTime = now;
    isSyncing = true;

    // Após sincronizar, aguardar um pouco antes de permitir outra
    setTimeout(() => {
      isSyncing = false;
    }, 1000);
  }, RECONCILIATION_DEBOUNCE);
}

// Função para verificar se estamos sincronizando
export function isCurrentlySyncing(): boolean {
  return isSyncing;
}
