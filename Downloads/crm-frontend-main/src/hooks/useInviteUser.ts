import { useState } from 'react';

interface InviteUserRequest {
  email: string;
  nome?: string;
  cargo?: string;
}

interface InviteUserResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  details?: string;
}

export function useInviteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inviteUser = async (data: InviteUserRequest): Promise<InviteUserResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log('🔥 AUTH CALL COM REDIRECT CALLBACK');
      console.log('═══════════════════════════════════════');
      console.log('[useInviteUser] Enviando convite...');
      console.log('[useInviteUser] Email:', data.email);
      console.log('[useInviteUser] Nome:', data.nome);
      console.log('[useInviteUser] Cargo:', data.cargo);
      console.log('[useInviteUser] Endpoint: POST /api/invite-user');
      console.log('═══════════════════════════════════════');

      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: InviteUserResponse = await response.json();

      if (!response.ok) {
        const errorMsg = result.details || result.error || 'Erro ao enviar convite';
        console.error('[useInviteUser] ❌ Erro:', errorMsg);
        setError(errorMsg);
        return null;
      }

      console.log('[useInviteUser] ✅ Convite enviado com sucesso!');
      console.log('[useInviteUser] User ID:', result.user?.id);
      console.log('[useInviteUser] Email:', result.user?.email);

      setSuccess(true);
      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useInviteUser] ❌ Erro inesperado:', errorMsg);
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    inviteUser,
    loading,
    error,
    success,
    reset,
  };
}
