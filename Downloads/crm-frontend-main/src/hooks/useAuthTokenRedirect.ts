import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HOOK: Detecta token de autenticação na URL e redireciona para /reset-password
 *
 * CONTEXTO:
 * - Usuários criados manualmente no painel Supabase recebem convite por email
 * - O Supabase redireciona para a Site URL (http://localhost:5173) com token no hash
 * - Este hook detecta o token e redireciona para /reset-password mantendo o hash
 *
 * CASOS:
 * 1. Invite: http://localhost:5173/#access_token=... → /reset-password#access_token=...
 * 2. Recovery: http://localhost:5173/#access_token=... → /reset-password#access_token=...
 *
 * RESULTADO:
 * - ResetPasswordPage pode validar a sessão e mostrar o formulário de senha
 */

export function useAuthTokenRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    console.log('[useAuthTokenRedirect] Hash atual:', hash);

    // Detectar se contém access_token (Supabase envia como #access_token=...)
    if (hash.includes('access_token')) {
      console.log('[useAuthTokenRedirect] ✅ Token detectado na URL');
      console.log('[useAuthTokenRedirect] Tipo:', hash.includes('type=invite') ? 'INVITE' : 'RECOVERY');
      console.log('[useAuthTokenRedirect] Redirecionando para /reset-password...');

      // Redirecionar para /reset-password mantendo o hash
      // O hash será preservado automaticamente pelo navigate com replace
      window.location.href = `/reset-password${hash}`;
    } else {
      console.log('[useAuthTokenRedirect] Nenhum token detectado');
    }
  }, []); // Executar apenas uma vez ao montar
}
