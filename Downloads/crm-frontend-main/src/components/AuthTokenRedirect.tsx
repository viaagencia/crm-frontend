import { useEffect } from 'react';

/**
 * COMPONENTE: Detecta token de autenticação na URL e redireciona
 *
 * - Executado no carregamento da página
 * - Verifica se há access_token no hash
 * - Redireciona para /reset-password mantendo o hash
 *
 * IMPORTANTE:
 * - Deve ser renderizado ANTES de qualquer outra lógica de navegação
 * - Usar no início do App para interceptar redirects do Supabase
 */

export function AuthTokenRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    console.log('═══════════════════════════════════════════════════════');
    console.log('[AuthTokenRedirect] Verificando autenticação na URL');
    console.log('[AuthTokenRedirect] Pathname:', pathname);
    console.log('[AuthTokenRedirect] Hash:', hash);
    console.log('═══════════════════════════════════════════════════════');

    // Se já está em /reset-password, não fazer nada
    if (pathname === '/reset-password') {
      console.log('[AuthTokenRedirect] ✅ Já está em /reset-password, ignorando');
      return;
    }

    // Detectar token de autenticação
    if (hash.includes('access_token')) {
      console.log('[AuthTokenRedirect] 🎯 Token detectado!');

      // Verificar tipo de autenticação
      const type = hash.includes('type=invite') ? 'INVITE' :
                   hash.includes('type=recovery') ? 'RECOVERY' :
                   'UNKNOWN';

      console.log('[AuthTokenRedirect] Tipo de autenticação:', type);
      console.log('[AuthTokenRedirect] ➡️  Redirecionando para /reset-password...');

      // Redirecionar para /reset-password com o hash preservado
      // Usar window.location.href para garantir que o hash seja mantido
      window.location.href = `/reset-password${hash}`;
    } else {
      console.log('[AuthTokenRedirect] ℹ️  Nenhum token de autenticação detectado');
    }
  }, []);

  // Este componente apenas executa efeito, não renderiza nada
  return null;
}
