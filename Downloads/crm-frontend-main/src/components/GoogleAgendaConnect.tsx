import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, Unlink } from 'lucide-react';

/**
 * COMPONENTE: Conectar Google Agenda
 *
 * Funcionalidades:
 * - Redirecionamento para Google OAuth
 * - Validação de conexão
 * - Desconexão
 * - Estados de carregamento
 */

interface GoogleAgendaConnectProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function GoogleAgendaConnect({
  isConnected = false,
  onConnect,
  onDisconnect,
}: GoogleAgendaConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[GoogleAgendaConnect] Iniciando OAuth do Google');

      // Configurações do Google OAuth
      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'CONFIGURE_SEU_CLIENT_ID';
      const redirectUri = 'http://localhost:5173/google-callback';
      const scope = 'https://www.googleapis.com/auth/calendar';

      // Construir URL de autenticação
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      console.log('[GoogleAgendaConnect] URL de autenticação:', authUrl.toString());
      console.log('[GoogleAgendaConnect] Redirecionando para Google...');

      // Redirecionar para Google
      window.location.href = authUrl.toString();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar';
      console.error('[GoogleAgendaConnect] ❌ Erro:', message);
      setError(message);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[GoogleAgendaConnect] Desconectando Google Agenda...');

      // Chamar backend para remover conexão
      const response = await fetch('/api/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar');
      }

      console.log('[GoogleAgendaConnect] ✅ Desconectado com sucesso');

      // Callback
      onDisconnect?.();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desconectar';
      console.error('[GoogleAgendaConnect] ❌ Erro:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  Conectado com sucesso
                </p>
                <p className="text-sm text-muted-foreground">
                  Sua agenda Google está sincronizada
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  Não conectado
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Conectar" para sincronizar sua agenda
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              'Conectar com Google'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <Unlink className="w-4 h-4 mr-2" />
                Desconectar
              </>
            )}
          </Button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        ℹ️ Ao conectar, você autoriza o CRM a acessar sua agenda Google para sincronização automática de consultas.
      </p>
    </div>
  );
}
