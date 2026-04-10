import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

/**
 * HOOK: Gerencia dados do perfil do usuário
 *
 * Funções:
 * - Carregar dados do usuário
 * - Atualizar nome e telefone
 * - Atualizar senha
 * - Fazer logout
 */

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ─── Carregar dados do usuário ───
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('[useUserProfile] Carregando dados do usuário...');

        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !authUser) {
          console.error('[useUserProfile] Erro ao carregar usuário:', userError);
          setUser(null);
          setLoading(false);
          return;
        }

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name,
          phone: authUser.user_metadata?.phone,
        });

        console.log('[useUserProfile] ✅ Usuário carregado:', authUser.email);
      } catch (err) {
        console.error('[useUserProfile] Erro ao carregar usuário:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ─── Atualizar perfil (nome e telefone) ───
  const updateProfile = async (name: string, phone: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log('[useUserProfile] Atualizando perfil...');
      console.log('[useUserProfile] Nome:', name);
      console.log('[useUserProfile] Telefone:', phone);

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: name || undefined,
          phone: phone || undefined,
        },
      });

      if (updateError) {
        console.error('[useUserProfile] ❌ Erro ao atualizar:', updateError);
        setError(updateError.message || 'Erro ao atualizar perfil');
        return false;
      }

      console.log('[useUserProfile] ✅ Perfil atualizado com sucesso');
      setSuccess(true);
      setUser(prev => prev ? { ...prev, name, phone } : null);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useUserProfile] ❌ Erro:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Atualizar senha ───
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log('[useUserProfile] Atualizando senha...');

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('[useUserProfile] ❌ Erro ao atualizar senha:', updateError);
        setError(updateError.message || 'Erro ao atualizar senha');
        return false;
      }

      console.log('[useUserProfile] ✅ Senha atualizada com sucesso');
      setSuccess(true);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useUserProfile] ❌ Erro:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ───
  const logout = async () => {
    try {
      console.log('[useUserProfile] Fazendo logout...');

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('[useUserProfile] ❌ Erro ao fazer logout:', signOutError);
        return false;
      }

      console.log('[useUserProfile] ✅ Logout realizado');
      setUser(null);

      // Redirecionar para login
      window.location.href = '/login';

      return true;
    } catch (err) {
      console.error('[useUserProfile] ❌ Erro ao logout:', err);
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    success,
    updateProfile,
    updatePassword,
    logout,
  };
}
