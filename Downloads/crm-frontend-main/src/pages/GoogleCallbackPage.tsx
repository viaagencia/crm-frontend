import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/lib/supabase';

/**
 * PÁGINA: Google OAuth Callback
 *
 * Fluxo:
 * 1. Usuário clica em "Conectar com Google Agenda"
 * 2. Redireciona para Google OAuth
 * 3. Google redireciona de volta com "code" na URL
 * 4. Esta página captura o "code"
 * 5. Envia o code para o backend trocar por tokens
 * 6. Backend salva tokens no Supabase
 * 7. Redireciona para /configuracoes
 */

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('[GoogleCallback] Processando callback do Google');
        console.log('═══════════════════════════════════════════════════════');

        // ──────────────────────────────────────────────────────────────
        // 1. Capturar "code" da URL
        // ──────────────────────────────────────────────────────────────
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        console.log('[GoogleCallback] Code:', code ? '✅ Recebido' : '❌ Não recebido');
        console.log('[GoogleCallback] Error:', error || 'Nenhum');
        console.log('[GoogleCallback] State:', state || 'Nenhum');

        // Verificar se há erro
        if (error) {
          console.error('[GoogleCallback] ❌ Erro do Google:', error);
          setStatus('error');
          setMessage(`Erro: ${error}`);
          return;
        }

        // Verificar se tem code
        if (!code) {
          console.error('[GoogleCallback] ❌ Nenhum code recebido');
          setStatus('error');
          setMessage('Nenhum código recebido do Google');
          return;
        }

        console.log('[GoogleCallback] ✅ Code capturado com sucesso');

        // ──────────────────────────────────────────────────────────────
        // 2. Enviar code para o backend trocar por tokens
        // ──────────────────────────────────────────────────────────────

        console.log('[GoogleCallback] Obtendo token de autenticação...');

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Usuário não autenticado');
        }

        console.log('[GoogleCallback] Enviando code para backend...');

        const response = await fetch('/api/google/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        });

        console.log('[GoogleCallback] Resposta do backend:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao trocar token');
        }

        const data = await response.json();
        console.log('[GoogleCallback] ✅ Token recebido do backend');
        console.log('[GoogleCallback] Resposta:', data);

        // ──────────────────────────────────────────────────────────────
        // 3. Exibir sucesso
        // ──────────────────────────────────────────────────────────────

        setStatus('success');
        setMessage('Google Agenda conectado com sucesso! Redirecionando...');

        console.log('[GoogleCallback] ✅ Sucesso! Redirecionando para /configuracoes');
        console.log('═══════════════════════════════════════════════════════');

        // Redirecionar para configurações após 2 segundos
        setTimeout(() => {
          navigate('/configuracoes', { replace: true });
        }, 2000);

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('[GoogleCallback] ❌ Erro:', message);
        setStatus('error');
        setMessage(message);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Status: Carregando */}
        {status === 'loading' && (
          <div className="bg-card rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Conectando...</h1>
            <p className="text-slate-400">Por favor aguarde enquanto processamos sua conexão com o Google Calendar</p>
          </div>
        )}

        {/* Status: Sucesso */}
        {status === 'success' && (
          <div className="bg-card rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full border-2 border-green-500/30">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sucesso!</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <p className="text-sm text-slate-500">Redirecionando para configurações...</p>
          </div>
        )}

        {/* Status: Erro */}
        {status === 'error' && (
          <div className="bg-card rounded-lg shadow-xl p-8 border border-slate-700">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full border-2 border-red-500/30">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Erro</h1>
            <p className="text-slate-400 mb-6 text-center">{message}</p>
            <Button
              onClick={() => navigate('/configuracoes', { replace: true })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Voltar para Configurações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
