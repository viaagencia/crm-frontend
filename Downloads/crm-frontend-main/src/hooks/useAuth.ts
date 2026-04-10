import { useState, useEffect } from 'react';
import supabase, { supabaseAdmin } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Carregar usuário ao montar ───
  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('[useAuth] Validando autenticação');
        console.log('═══════════════════════════════════════════════════════');

        // IMPORTANTE: Validar SESSÃO antes de confiar em getUser()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[useAuth] ❌ Erro ao validar sessão:', sessionError);
          setUser(null);
          setLoading(false);
          return;
        }

        if (!session) {
          console.warn('[useAuth] ⚠️  Nenhuma sessão ativa');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('[useAuth] ✅ Sessão válida detectada');
        console.log('[useAuth] User:', session.user.email);

        // Agora validar o usuário
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('[useAuth] ❌ Erro ao obter usuário:', authError);
          setUser(null);
          setLoading(false);
          return;
        }

        if (authUser) {
          console.log('[useAuth] ✅ Usuário logado:', authUser.email, authUser.id);
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            user_metadata: authUser.user_metadata,
          });
        } else {
          console.warn('[useAuth] ⚠️  Nenhum usuário retornado');
          setUser(null);
        }

        console.log('═══════════════════════════════════════════════════════');
      } catch (err) {
        console.error('[useAuth] ❌ Erro ao carregar usuário:', err);
        setError('Erro ao carregar sessão');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // ─── Listener para mudanças de autenticação ───
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Estado mudou:', event);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ─── Login ───
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[Auth] Erro ao fazer login:', signInError);
        setError(signInError.message || 'Erro ao fazer login');
        return false;
      }

      if (data.user) {
        console.log('[Auth] ✅ Login bem-sucedido:', data.user.email);
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        });
        return true;
      }

      return false;
    } catch (err) {
      console.error('[Auth] Erro ao fazer login:', err);
      setError('Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Sign Up (Registro) ───
  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const redirectTo = `${window.location.origin}/reset-password`;

      console.log('🔥 AUTH CALL COM REDIRECT /reset-password');
      console.log('[Auth] SIGN UP INITIATED');
      console.log('[Auth] Email:', email);
      console.log('[Auth] Redirect URL:', redirectTo);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (signUpError) {
        console.error('[Auth] Erro ao registrar:', signUpError);
        setError(signUpError.message || 'Erro ao registrar');
        return false;
      }

      if (data.user) {
        console.log('[Auth] ✅ Registro bem-sucedido:', data.user.email);
        // Não fazer login automático, deixar usuário confirmar email
        setError('Verifique seu email para confirmar a conta');
        return true;
      }

      return false;
    } catch (err) {
      console.error('[Auth] Erro ao registrar:', err);
      setError('Erro ao registrar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ───
  const logout = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('[Auth] Erro ao fazer logout:', signOutError);
        setError(signOutError.message || 'Erro ao fazer logout');
        return false;
      }

      console.log('[Auth] ✅ Logout bem-sucedido');
      setUser(null);
      return true;
    } catch (err) {
      console.error('[Auth] Erro ao fazer logout:', err);
      setError('Erro ao fazer logout');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset de Senha ───
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const redirectTo = `${window.location.origin}/reset-password`;

      console.log('🔥 AUTH CALL COM REDIRECT /reset-password');
      console.log('[Auth] RESET PASSWORD INITIATED');
      console.log('[Auth] Email:', email);
      console.log('[Auth] Redirect URL:', redirectTo);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (resetError) {
        console.error('[Auth] Erro ao resetar senha:', resetError);
        setError(resetError.message || 'Erro ao resetar senha');
        return false;
      }

      console.log('[Auth] ✅ Email de reset enviado');
      setError(null);
      return true;
    } catch (err) {
      console.error('[Auth] Erro ao resetar senha:', err);
      setError('Erro ao resetar senha');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Atualizar Senha (após reset) ───
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('[Auth] Erro ao atualizar senha:', updateError);
        setError(updateError.message || 'Erro ao atualizar senha');
        return false;
      }

      console.log('[Auth] ✅ Senha atualizada com sucesso');
      return true;
    } catch (err) {
      console.error('[Auth] Erro ao atualizar senha:', err);
      setError('Erro ao atualizar senha');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Convidar Usuário (Admin API) ───
  const inviteUser = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se admin client está disponível
      if (!supabaseAdmin) {
        console.error('[Auth] ❌ Admin client não configurado');
        setError('Serviço de convite não disponível');
        return false;
      }

      const redirectTo = `${window.location.origin}/reset-password`;

      console.log('🔥 AUTH CALL COM REDIRECT /reset-password');
      console.log('═══════════════════════════════════════');
      console.log('[Auth] INVITE USER INITIATED');
      console.log('═══════════════════════════════════════');
      console.log('[Auth] Email:', email);
      console.log('[Auth] Redirect URL:', redirectTo);
      console.log('[Auth] SUPABASE CALL:', 'admin.auth.inviteUserByEmail');
      console.log('═══════════════════════════════════════');

      const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectTo,
      });

      if (inviteError) {
        console.error('[Auth] ❌ Erro ao convidar usuário:', inviteError);
        setError(inviteError.message || 'Erro ao convidar usuário');
        return false;
      }

      console.log('[Auth] ✅ Convite enviado com sucesso para:', email);
      console.log('[Auth] User ID:', data?.user?.id);
      return true;
    } catch (err) {
      console.error('[Auth] ❌ Erro ao convidar usuário:', err);
      setError('Erro ao convidar usuário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    inviteUser,
    isAuthenticated: !!user,
  };
}
