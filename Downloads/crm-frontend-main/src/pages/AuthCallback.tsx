import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // ========== DEBUG GLOBAL ==========
        console.log('═══════════════════════════════════════');
        console.log('[AuthCallback] CALLBACK PAGE LOADED');
        console.log('═══════════════════════════════════════');
        console.log('PATH:', window.location.pathname);
        console.log('HASH:', window.location.hash);
        console.log('HREF:', window.location.href);
        console.log('─────────────────────────────────────');

        // Verificar sessão atual
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        console.log('[AuthCallback] Current Session:', {
          hasSession: !!session?.session,
          user: session?.session?.user?.email,
          error: sessionError?.message
        });
        console.log('─────────────────────────────────────');

        console.log('[AuthCallback] ========== INICIANDO CALLBACK ==========');

        // Obter hash da URL
        const hash = window.location.hash.substring(1);
        console.log('[AuthCallback] Hash recebido:', hash.substring(0, 100) + (hash.length > 100 ? '...' : ''));

        // Verificar se tem hash
        if (!hash) {
          console.warn('[AuthCallback] ❌ CRÍTICO: Nenhum hash na URL');
          console.warn('[AuthCallback] Isto significa que o email link foi clicado, mas não tem tokens');
          setError('Nenhum token encontrado. O link pode estar quebrado.');
          setIsProcessing(false);
          return;
        }

        // Parsear os parâmetros do hash
        const params = new URLSearchParams(hash);

        // Verificar erros primeiro
        const errorCode = params.get('error');
        const errorDescription = params.get('error_description');
        const type = params.get('type');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        console.log('[AuthCallback] ════ PARÂMETROS EXTRAÍDOS ════');
        console.log('[AuthCallback] error:', errorCode || 'nenhum');
        console.log('[AuthCallback] type:', type || 'nenhum (default será /dashboard)');
        console.log('[AuthCallback] access_token:', accessToken ? '✅ PRESENTE' : '❌ AUSENTE');
        console.log('[AuthCallback] refresh_token:', refreshToken ? '✅ PRESENTE' : '⚠️ AUSENTE');
        console.log('────────────────────────────────────');

        // Armazenar para debug display
        const debugStr = `
Hash presente: ✅
Error: ${errorCode || '❌ não'}
Type: ${type || '(padrão)'}
Access Token: ${accessToken ? '✅' : '❌'}
Refresh Token: ${refreshToken ? '✅' : '⚠️'}
        `.trim();
        setDebugInfo(debugStr);

        // ========== ERRO: Link expirado, inválido ou revogado ==========
        if (errorCode) {
          console.error('═══════════════════════════════════════');
          console.error('[AuthCallback] ❌❌❌ ERRO DETECTADO ❌❌❌');
          console.error('═══════════════════════════════════════');
          console.error('[AuthCallback] Código:', errorCode);
          console.error('[AuthCallback] Descrição:', errorDescription);
          console.error('─────────────────────────────────────');

          // Mapear erros comuns
          const errorMessages: Record<string, string> = {
            'invalid_grant': 'Link expirado ou inválido. Solicite novamente.',
            'access_denied': 'Acesso negado. Tente novamente.',
            'invalid_request': 'Requisição inválida. Solicite novamente.',
            'server_error': 'Erro no servidor. Tente novamente mais tarde.',
            'unsupported_response_type': 'Tipo de resposta não suportado.',
            'temporarily_unavailable': 'Serviço temporariamente indisponível.',
          };

          const message = errorMessages[errorCode] || errorDescription || 'Erro ao processar autenticação.';
          console.error('[AuthCallback] Mensagem para usuário:', message);
          console.error('[AuthCallback] AÇÃO: Vai mostrar erro + redirecionar para /login em 3s');
          console.error('═══════════════════════════════════════');

          setError(message);
          setIsProcessing(false);

          // Redirecionar após 3 segundos
          setTimeout(() => {
            console.log('[AuthCallback] ⏱️ REDIRECIONANDO para /login (timeout 3s)');
            navigate(`/login?error=${encodeURIComponent(message)}`);
          }, 3000);
          return;
        }

        // ========== VALIDAÇÃO: Verificar se tem tokens ==========
        if (!accessToken) {
          console.error('═══════════════════════════════════════');
          console.error('[AuthCallback] ❌ Access token AUSENTE');
          console.error('═══════════════════════════════════════');
          setError('Token de acesso não encontrado. Solicite novamente.');
          setIsProcessing(false);

          setTimeout(() => {
            navigate('/login?error=Tokens+inválidos');
          }, 3000);
          return;
        }

        console.log('[AuthCallback] ✅ Tokens validados com sucesso');

        // ========== CRIAR SESSÃO ==========
        console.log('[AuthCallback] 📝 Criando sessão com setSession()...');

        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (setSessionError) {
          console.error('═══════════════════════════════════════');
          console.error('[AuthCallback] ❌ Erro ao criar sessão:', setSessionError.message);
          console.error('═══════════════════════════════════════');
          setError('Erro ao autenticar. Tente novamente.');
          setIsProcessing(false);

          setTimeout(() => {
            navigate('/login?error=Erro+ao+autenticar');
          }, 3000);
          return;
        }

        console.log('[AuthCallback] ✅✅ Sessão criada com sucesso!');

        // Verificar que a sessão foi realmente criada
        const { data: newSession } = await supabase.auth.getSession();
        console.log('[AuthCallback] Verificação: Sessão agora é:', {
          hasSession: !!newSession?.session,
          user: newSession?.session?.user?.email
        });

        // ========== VERIFICAR TIPO DE AUTENTICAÇÃO ==========
        console.log('═══════════════════════════════════════');
        console.log('[AuthCallback] 🔍 DETECTANDO TIPO DE AUTENTICAÇÃO');
        console.log('[AuthCallback] Type recebido:', type || '(undefined - será tratado como login comum)');
        console.log('─────────────────────────────────────');

        if (type === 'recovery') {
          // Recovery link = usuário quer resetar senha
          console.log('[AuthCallback] 🔐🔐 TYPE=RECOVERY DETECTADO!');
          console.log('[AuthCallback] ➜ Redirecionando para /auth/reset-password');

          // Limpar hash da URL
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('[AuthCallback] ✅ Hash limpo da URL');

          // Aguardar um momento para garantir que a sessão foi salva
          await new Promise(resolve => setTimeout(resolve, 500));

          setIsProcessing(false);
          console.log('[AuthCallback] ➡️ NAVEGANDO para /auth/reset-password...');
          navigate('/auth/reset-password');
          return;
        }

        // Para magic link (signup) ou outros tipos = login bem-sucedido
        console.log('[AuthCallback] ✅✅ LOGIN bem-sucedido via magic link/OTP');
        console.log('[AuthCallback] ➜ Redirecionando para / (Dashboard)');

        // Limpar hash da URL
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('[AuthCallback] ✅ Hash limpo da URL');

        // Aguardar um momento para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsProcessing(false);
        console.log('[AuthCallback] ➡️ NAVEGANDO para / (Dashboard)...');
        console.log('═══════════════════════════════════════');
        navigate('/');

      } catch (err) {
        console.error('═══════════════════════════════════════');
        console.error('[AuthCallback] ❌❌ EXCEÇÃO NÃO ESPERADA');
        console.error('═══════════════════════════════════════');
        console.error('[AuthCallback] Erro:', err);
        if (err instanceof Error) {
          console.error('[AuthCallback] Message:', err.message);
          console.error('[AuthCallback] Stack:', err.stack);
        }
        console.error('═══════════════════════════════════════');

        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro inesperado: ${errorMsg}`);
        setIsProcessing(false);

        setTimeout(() => {
          navigate('/login?error=Erro+inesperado');
        }, 3000);
      }
    };

    // Debug: Log quando o componente monta
    console.log('[AuthCallback] Componente montado, iniciando handleAuthCallback');
    handleAuthCallback();
  }, [navigate]);

  // ========== RENDERIZAÇÃO ==========

  // Se houver erro = mostrar mensagem
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-2">Erro na Autenticação</h2>
                <p className="text-slate-400 text-sm mb-6">{error}</p>
                <p className="text-slate-500 text-xs">Redirecionando para login em instantes...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver processando = mostrar loading
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Validando Acesso...</h1>
            <p className="text-slate-400 text-sm mb-6">Por favor aguarde enquanto processamos sua autenticação.</p>

            <div className="mt-6 flex justify-center">
              <div className="w-48 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse"></div>
              </div>
            </div>

            {/* DEBUG INFO */}
            {debugInfo && (
              <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg text-left">
                <p className="text-xs font-mono text-slate-400 whitespace-pre-wrap">
                  {debugInfo}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-6">
              Abra o console (F12) para ver logs detalhados
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (não deveria chegar aqui)
  return null;
}
