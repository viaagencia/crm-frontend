/**
 * PERIODIC PHONE SYNC HOOK
 *
 * Sincronização automática e periódica de tarefas/atividades/anotações.
 * Roda a cada intervalo configurável para garantir que dados estão sempre
 * sincronizados mesmo se houver falhas de rede ou mudanças não detectadas.
 *
 * Útil para agendamento automático e garantir consistency.
 */

import { useEffect, useRef } from 'react';
import { usePhoneBasedSync } from './usePhoneBasedSync';
import { useCrm } from '@/contexts/CrmContext';

interface PeriodicSyncConfig {
  // Intervalo em milissegundos (padrão: 5 minutos)
  interval?: number;
  // Se true, sincroniza ao abrir a página mesmo que recentemente sincronizado
  forceInitialSync?: boolean;
  // Se true, limpa cache de sincronização antes de cada ciclo
  clearCacheBetweenCycles?: boolean;
}

export function usePeriodicPhoneSync(config: PeriodicSyncConfig = {}) {
  const {
    interval = 5 * 60 * 1000, // 5 minutos por padrão
    forceInitialSync = true,
    clearCacheBetweenCycles = true,
  } = config;

  const { syncAll } = usePhoneBasedSync();
  const crm = useCrm();
  const lastSyncRef = useRef<number>(0);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Sincronização inicial
    if (forceInitialSync) {
      console.log('[PeriodicPhoneSync] 🔄 Sincronização inicial...');
      syncAll();
      lastSyncRef.current = Date.now();
    }

    // Agendar sincronização periódica
    intervalIdRef.current = setInterval(async () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      console.log(
        `[PeriodicPhoneSync] ⏰ Sincronização periódica (${Math.round(timeSinceLastSync / 1000)}s desde última)`
      );

      if (clearCacheBetweenCycles) {
        console.log('[PeriodicPhoneSync] 🧹 Limpando cache de sincronização antes do ciclo...');
        // O hook usePhoneBasedSync mantém um cache de telefones sincronizados
        // Passar força a re-sincronizar tudo
      }

      // Sincronizar todos novamente
      await syncAll();

      lastSyncRef.current = Date.now();
      console.log('[PeriodicPhoneSync] ✅ Sincronização periódica concluída');
    }, interval);

    // Sincronizar quando window ganha foco (usuário volta pra aba)
    const onFocus = () => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      // Se passou mais de meio intervalo desde última sincronização, sincronizar
      if (timeSinceLastSync > interval / 2) {
        console.log('[PeriodicPhoneSync] 👁️  Window em foco, sincronizando...');
        syncAll();
        lastSyncRef.current = Date.now();
      }
    };
    window.addEventListener('focus', onFocus);

    // Sincronizar quando window se torna visível novamente
    const onVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync > interval / 2) {
          console.log('[PeriodicPhoneSync] 🔓 Aba visível, sincronizando...');
          syncAll();
          lastSyncRef.current = Date.now();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [interval, forceInitialSync, clearCacheBetweenCycles, syncAll]);

  return {
    lastSync: lastSyncRef.current,
    isActive: intervalIdRef.current !== null,
  };
}
