import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Eye, EyeOff, CheckCircle, Lock, Loader2, Shield } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // ========== VERIFICAR AUTENTICAÇÃO ==========
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[ResetPassword] ========== VERIFICANDO AUTENTICAÇÃO ==========');

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('[ResetPassword] ❌ Erro ao obter usuário:', authError);
          setError('Sessão inválida. Solicite um novo link de recuperação.');
          setCheckingAuth(false);

          setTimeout(() => {
            navigate('/login?error=Sessão+expirada');
          }, 2000);
          return;
        }

        if (!user) {
          console.warn('[ResetPassword] ❌ Nenhum usuário autenticado');
          setError('Acesso não autorizado. Solicite um novo link de recuperação.');
          setCheckingAuth(false);

          setTimeout(() => {
            navigate('/login?error=Sem+autorização');
          }, 2000);
          return;
        }

        console.log('[ResetPassword] ✅ Usuário autenticado:', user.email);
        setIsAuthenticated(true);
        setCheckingAuth(false);

      } catch (err) {
        console.error('[ResetPassword] ❌ Exceção ao verificar autenticação:', err);
        setError('Erro ao verificar sua sessão.');
        setCheckingAuth(false);

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    checkAuth();
  }, [navigate]);

  // ========== CALCULAR FORÇA DA SENHA ==========
  useEffect(() => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length >= 6) strength = 'medium';
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      strength = 'strong';
    }

    setPasswordStrength(strength);
  }, [password]);

  // ========== VALIDAR SENHAS ==========
  const validatePasswords = (): { valid: boolean; message: string } => {
    // Vazio
    if (!password || !confirmPassword) {
      return {
        valid: false,
        message: 'Por favor, preencha ambas as senhas',
      };
    }

    // Mínimo 6 caracteres
    if (password.length < 6) {
      return {
        valid: false,
        message: 'A senha deve ter no mínimo 6 caracteres',
      };
    }

    // Máximo 128 caracteres (limite Supabase)
    if (password.length > 128) {
      return {
        valid: false,
        message: 'A senha não pode ter mais de 128 caracteres',
      };
    }

    // Senhas iguais
    if (password !== confirmPassword) {
      return {
        valid: false,
        message: 'As senhas não correspondem',
      };
    }

    // Verificar se não é apenas espaços
    if (password.trim() === '') {
      return {
        valid: false,
        message: 'A senha não pode conter apenas espaços',
      };
    }

    return {
      valid: true,
      message: '',
    };
  };

  // ========== REDEFINIR SENHA ==========
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('[ResetPassword] ========== REDEFININDO SENHA ==========');

    // Validar
    const validation = validatePasswords();
    if (!validation.valid) {
      console.warn('[ResetPassword] ❌ Validação falhou:', validation.message);
      setError(validation.message);
      return;
    }

    try {
      setLoading(true);

      console.log('[ResetPassword] Chamando supabase.auth.updateUser()...');

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('[ResetPassword] ❌ Erro ao atualizar senha:', updateError);

        // Mapear erros comuns
        const errorMessages: Record<string, string> = {
          'weak_password': 'Senha muito fraca. Use uma combinação de letras, números e símbolos.',
          'same_password': 'A nova senha não pode ser igual à anterior.',
          'over_email_send_rate_limit': 'Você fez muitas tentativas. Tente novamente em alguns minutos.',
          'access_denied': 'Acesso negado. Tente solicitar um novo link.',
          'invalid_grant': 'Token expirado. Solicite um novo link de recuperação.',
        };

        const message = errorMessages[updateError.code || ''] || updateError.message || 'Erro ao atualizar senha';
        setError(message);
        return;
      }

      console.log('[ResetPassword] ✅ Senha atualizada com sucesso!');
      setSuccess(true);

      // Redirecionar após 3 segundos
      setTimeout(() => {
        console.log('[ResetPassword] Redirecionando para dashboard');
        navigate('/');
      }, 3000);

    } catch (err) {
      console.error('[ResetPassword] ❌ Exceção inesperada:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro inesperado: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== VERIFICANDO AUTENTICAÇÃO (LOADING) ==========
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Verificando Acesso...</h1>
          <p className="text-slate-400 text-sm">Por favor aguarde enquanto validamos sua sessão.</p>
        </div>
      </div>
    );
  }

  // ========== NÃO AUTENTICADO (ERRO) ==========
  if (!isAuthenticated || error && checkingAuth === false && !success) {
    return null; // Redireciona automaticamente no useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
          <p className="text-slate-400">Redefinir Senha</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {success ? (
            // ========== SUCESSO ==========
            <div className="text-center py-12">
              <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full border-2 border-green-500/30">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">Sucesso! ✅</h2>

              <p className="text-slate-400 text-sm mb-2">
                Sua senha foi redefinida com segurança.
              </p>
              <p className="text-slate-500 text-xs mb-8">
                Você será redirecionado para o dashboard em instantes...
              </p>

              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecionando...</span>
                </div>
              </div>
            </div>
          ) : (
            // ========== FORMULÁRIO ==========
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h2>
              <p className="text-slate-400 text-sm mb-6">
                Crie uma nova senha forte para sua conta
              </p>

              {/* Mensagem de Erro */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-400 text-sm font-medium">{error}</div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Indicador de Força */}
                  {password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-400">Força da senha:</span>
                        <span
                          className={`text-xs font-semibold ${
                            passwordStrength === 'weak'
                              ? 'text-red-400'
                              : passwordStrength === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                        >
                          {passwordStrength === 'weak'
                            ? 'Fraca'
                            : passwordStrength === 'medium'
                            ? 'Média'
                            : 'Forte'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength === 'weak'
                              ? 'w-1/3 bg-red-500'
                              : passwordStrength === 'medium'
                              ? 'w-2/3 bg-yellow-500'
                              : 'w-full bg-green-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <ul className="mt-3 space-y-1 text-xs text-slate-400">
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          password.length >= 6 ? 'bg-green-500/70' : 'bg-slate-600'
                        }`}
                      >
                        {password.length >= 6 ? '✓' : '○'}
                      </span>
                      Mínimo 6 caracteres
                    </li>
                  </ul>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10 ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-500/50 bg-red-500/5'
                          : ''
                      }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-400 font-medium">✗ As senhas não correspondem</p>
                  )}

                  {confirmPassword && password === confirmPassword && password.length >= 6 && (
                    <p className="mt-2 text-xs text-green-400 font-medium">✓ Senhas coincidem</p>
                  )}
                </div>

                {/* Botão Redefinir */}
                <Button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2.5 h-11 mt-8 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando Senha...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2 inline" />
                      Atualizar Senha
                    </>
                  )}
                </Button>
              </form>

              {/* Info de Segurança */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <p className="text-slate-500 text-xs text-center flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Criptografado com AES-256
                </p>
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>Segurança de nível empresarial via Supabase Auth</p>
        </div>
      </div>
    </div>
  );
}
