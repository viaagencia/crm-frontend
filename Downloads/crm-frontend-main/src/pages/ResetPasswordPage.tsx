import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff, Shield, Lock } from 'lucide-react';

/**
 * PÁGINA UNIFICADA DE DEFINIÇÃO DE SENHA
 *
 * Usada para:
 * 1. Primeiro acesso (após convite de usuário)
 * 2. Redefinição de senha (após recuperação)
 *
 * Fluxo:
 * - Verifica sessão automaticamente via Supabase
 * - Se válida: mostra formulário de senha
 * - Se inválida: mostra erro "Link expirado"
 * - Após sucesso: redireciona para /
 */

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // ─── Estados ───
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // ─── Verificar sessão ao carregar ───
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[ResetPasswordPage] ========== VERIFICANDO SESSÃO ==========');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[ResetPasswordPage] ❌ Erro ao obter sessão:', sessionError);
          setError('Erro ao verificar sessão');
          setSessionLoading(false);
          return;
        }

        if (!session) {
          console.warn('[ResetPasswordPage] ❌ Nenhuma sessão ativa');
          console.warn('[ResetPasswordPage] Link pode ser inválido ou expirado');
          setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
          setSessionLoading(false);
          return;
        }

        console.log('[ResetPasswordPage] ✅ Sessão válida:', session.user.email);
        console.log('[ResetPasswordPage] User ID:', session.user.id);
        setHasValidSession(true);
        setSessionLoading(false);

      } catch (err) {
        console.error('[ResetPasswordPage] ❌ Erro inesperado:', err);
        setError('Erro ao verificar sessão');
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  // ─── Calcular força da senha ───
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

  // ─── Validar senhas ───
  const validatePasswords = (): { valid: boolean; message: string } => {
    if (!password || !confirmPassword) {
      return {
        valid: false,
        message: 'Por favor, preencha ambas as senhas',
      };
    }

    if (password.length < 6) {
      return {
        valid: false,
        message: 'A senha deve ter no mínimo 6 caracteres',
      };
    }

    if (password.length > 128) {
      return {
        valid: false,
        message: 'A senha não pode ter mais de 128 caracteres',
      };
    }

    if (password !== confirmPassword) {
      return {
        valid: false,
        message: 'As senhas não correspondem',
      };
    }

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

  // ─── Redefinir senha ───
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('[ResetPasswordPage] ========== REDEFININDO SENHA ==========');

    // Validar
    const validation = validatePasswords();
    if (!validation.valid) {
      console.warn('[ResetPasswordPage] ❌ Validação falhou:', validation.message);
      setError(validation.message);
      return;
    }

    try {
      setLoading(true);

      console.log('[ResetPasswordPage] Chamando supabase.auth.updateUser()...');

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('[ResetPasswordPage] ❌ Erro ao atualizar senha:', updateError);

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

      console.log('[ResetPasswordPage] ✅ Senha atualizada com sucesso!');
      setSuccess(true);

      // Redirecionar para / (dashboard)
      setTimeout(() => {
        console.log('[ResetPasswordPage] Redirecionando para /');
        navigate('/', { replace: true });
      }, 3000);

    } catch (err) {
      console.error('[ResetPasswordPage] ❌ Exceção inesperada:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro inesperado: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── Estado: Carregando sessão ───
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Verificando Acesso...</h1>
          <p className="text-slate-400 text-sm">Por favor aguarde enquanto validamos seu link.</p>
        </div>
      </div>
    );
  }

  // ─── Estado: Sessão inválida ───
  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
            <p className="text-slate-400">Link Inválido</p>
          </div>

          {/* Card */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Link Expirado ou Inválido</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-400 text-sm text-left">{error}</div>
              </div>
            )}

            <p className="text-slate-400 mb-6">
              Seu link de recuperação expirou ou é inválido. Por favor, solicite um novo link.
            </p>

            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 h-11"
            >
              Solicitar Novo Link
            </Button>

            <button
              onClick={() => navigate('/login')}
              className="w-full mt-3 text-slate-400 hover:text-slate-300 text-sm"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Estado: Sucesso ───
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
            <p className="text-slate-400">Senha Redefinida</p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center py-12">
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full border-2 border-green-500/30">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Sucesso! ✅</h2>

            <p className="text-slate-400 text-sm mb-2">
              Sua senha foi redefinida com segurança.
            </p>
            <p className="text-slate-500 text-xs mb-8">
              Você será redirecionado para o CRM em instantes...
            </p>

            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecionando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Estado: Formulário de definição de senha ───
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
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>Segurança de nível empresarial via Supabase Auth</p>
        </div>
      </div>
    </div>
  );
}
