import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';

/**
 * COMPONENTE CRÍTICO DE SEGURANÇA
 *
 * Responsabilidades:
 * 1. Detectar erros de autenticação na URL (otp_expired, access_denied, etc)
 * 2. Validar sessão do Supabase em TEMPO REAL
 * 3. Bloquear acesso sem sessão válida
 * 4. Redirecionar para login automaticamente
 *
 * EXECUTADO:
 * - Ao carregar a página (antes de qualquer renderização)
 * - Periodicamente para re-validar
 * - Quando houver mudança de rota
 */

export function SecurityValidator() {
  const navigate = useNavigate();

  useEffect(() => {
    const validateSecurity = async () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('[SecurityValidator] Iniciando validação de segurança');
      console.log('═══════════════════════════════════════════════════════');

      // ──────────────────────────────────────────────────────────────
      // 1. DETECTAR ERROS DE AUTENTICAÇÃO NA URL
      // ──────────────────────────────────────────────────────────────
      const hash = window.location.hash;
      const search = window.location.search;
      const fullUrl = `${search}${hash}`;

      console.log('[SecurityValidator] URL completa:', fullUrl);

      // Erros críticos que invalidam a sessão
      const errorPatterns = [
        { pattern: 'error=access_denied', name: 'ACCESS_DENIED', msg: 'Acesso negado' },
        { pattern: 'error_code=otp_expired', name: 'OTP_EXPIRED', msg: 'Link expirado' },
        { pattern: 'error=otp_expired', name: 'OTP_EXPIRED_ALT', msg: 'Link expirado' },
        { pattern: 'error=invalid_grant', name: 'INVALID_GRANT', msg: 'Token inválido' },
        { pattern: 'error=unauthorized', name: 'UNAUTHORIZED', msg: 'Não autorizado' },
        { pattern: 'error=invalid', name: 'INVALID', msg: 'Link inválido' },
      ];

      for (const { pattern, name, msg } of errorPatterns) {
        if (fullUrl.includes(pattern)) {
          console.error(`[SecurityValidator] ❌ ERRO DETECTADO: ${name}`);
          console.error(`[SecurityValidator] Mensagem: ${msg}`);
          console.error('[SecurityValidator] 🚨 Redirecionando para /login obrigatoriamente');

          // Limpar URL e redirecionar
          window.history.replaceState({}, document.title, '/login');
          navigate('/login', { replace: true });

          return; // PARAR AQUI
        }
      }

      // ──────────────────────────────────────────────────────────────
      // 2. VALIDAR SESSÃO DO SUPABASE
      // ──────────────────────────────────────────────────────────────
      console.log('[SecurityValidator] Validando sessão com Supabase...');

      try {
        // Chamar getSession() - OBRIGATÓRIO
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[SecurityValidator] ❌ Erro ao validar sessão:', sessionError);
          console.error('[SecurityValidator] 🚨 Redirecionando para /login (erro na sessão)');

          navigate('/login', { replace: true });
          return;
        }

        // ──────────────────────────────────────────────────────────────
        // 3. VERIFICAR SE SESSÃO EXISTE E É VÁLIDA
        // ──────────────────────────────────────────────────────────────
        if (!session) {
          console.warn('[SecurityValidator] ⚠️  NENHUMA SESSÃO ATIVA');

          // Se estamos em uma rota protegida, redirecionar
          const pathname = window.location.pathname;
          const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/auth/callback', '/auth/diagnosis'];
          const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

          if (!isPublicRoute) {
            console.error('[SecurityValidator] 🚨 Acesso a rota protegida SEM sessão!');
            console.error('[SecurityValidator] Redirecionando para /login obrigatoriamente');

            navigate('/login', { replace: true });
            return;
          }

          console.log('[SecurityValidator] ℹ️  Rota pública autorizada sem sessão:', pathname);
          return;
        }

        // ──────────────────────────────────────────────────────────────
        // 4. SESSÃO VÁLIDA - CONTINUAR NORMALMENTE
        // ──────────────────────────────────────────────────────────────
        console.log('[SecurityValidator] ✅ SESSÃO VÁLIDA');
        console.log('[SecurityValidator] Usuário:', session.user?.email);
        console.log('[SecurityValidator] User ID:', session.user?.id);
        console.log('[SecurityValidator] Expira em:', new Date(session.expires_at! * 1000).toLocaleString());
        console.log('[SecurityValidator] ✅ Sistema autorizado a continuar');

      } catch (err) {
        console.error('[SecurityValidator] ❌ ERRO INESPERADO:', err);
        console.error('[SecurityValidator] 🚨 Redirecionando para /login por segurança');

        navigate('/login', { replace: true });
      }

      console.log('═══════════════════════════════════════════════════════');
    };

    // Executar validação ao carregar
    validateSecurity();

    // ──────────────────────────────────────────────────────────────
    // 5. RE-VALIDAR PERIODICAMENTE (a cada 30 segundos)
    // ──────────────────────────────────────────────────────────────
    const interval = setInterval(() => {
      console.log('[SecurityValidator] Re-validando sessão...');
      validateSecurity();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [navigate]);

  // Não renderiza nada - apenas valida
  return null;
}
