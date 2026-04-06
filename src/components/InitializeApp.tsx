import { useEffect } from 'react';
import { useCrm } from '@/contexts/CrmContext';

export function InitializeApp() {
  const crm = useCrm();

  useEffect(() => {
    // Tentar recuperar usuarioId do localStorage
    const usuarioId = localStorage.getItem('usuarioId');

    if (usuarioId && '_setUsuarioId' in crm) {
      // Ativar sincronização com o backend
      (crm as any)._setUsuarioId(usuarioId);
      console.log('✓ Sincronização com backend ativada para:', usuarioId);
    } else if (!usuarioId) {
      // Se não houver usuarioId, usar um padrão para testes
      // Em produção, isto virá do seu sistema de autenticação
      const defaultUserId = 'user-' + new Date().getTime();
      localStorage.setItem('usuarioId', defaultUserId);

      if ('_setUsuarioId' in crm) {
        (crm as any)._setUsuarioId(defaultUserId);
        console.log('✓ Usuário padrão criado e sincronização ativada:', defaultUserId);
      }
    }
  }, [crm]);

  return null;
}
