import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, Mail } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [usePassword, setUsePassword] = useState(true);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    console.log('[LoginPage] useEffect - isAuthenticated:', {
      isAuthenticated,
      loading,
      willRedirect: isAuthenticated && !loading
    });

    if (isAuthenticated && !loading) {
      console.log('[LoginPage] ✅ Usuário autenticado, redirecionando para /');
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  // Ler erro da URL se vindo do callback
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setFormError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  // ========== MAGIC LINK ==========
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Por favor, insira seu email');
      return;
    }

    try {
      setMagicLinkLoading(true);

      const emailRedirectTo = `${window.location.origin}/auth/callback`;

      console.log('🔥 AUTH CALL COM REDIRECT CALLBACK');
      console.log('═══════════════════════════════════════');
      console.log('[LoginPage] MAGIC LINK EMAIL (OTP)');
      console.log('═══════════════════════════════════════');
      console.log('[LoginPage] Email:', email);
      console.log('[LoginPage] EMAIL REDIRECT URL:', emailRedirectTo);
      console.log('[LoginPage] SUPABASE CALL:', 'signInWithOtp');
      console.log('═══════════════════════════════════════');

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: emailRedirectTo,
        },
      });

      if (otpError) {
        console.error('[LoginPage] Erro ao enviar magic link:', otpError);
        setFormError(otpError.message || 'Erro ao enviar link de acesso');
        return;
      }

      console.log('[LoginPage] ✅ Magic link enviado com sucesso');
      setMagicLinkSent(true);
    } catch (err) {
      console.error('[LoginPage] Erro inesperado:', err);
      setFormError('Erro ao enviar link de acesso');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Email e senha são obrigatórios');
      return;
    }

    const success = await login(email, password);
    if (success) {
      console.log('[LoginPage] ✅ Login bem-sucedido, redirecionando para dashboard');
      navigate('/');
    } else {
      setFormError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  // ========== MAGIC LINK ENVIADO ==========
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
            <p className="text-slate-400">CRM - Gerenciamento de Leads e Pacientes</p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full border-2 border-blue-500/30">
                  <Mail className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Verifique seu Email</h2>
              <p className="text-slate-400 text-sm mb-4">
                Enviamos um link de acesso para:
                <br />
                <span className="font-semibold text-white block mt-2 break-all">{email}</span>
              </p>

              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 my-6 text-left">
                <p className="text-slate-300 text-sm">
                  👉 Clique no link no email para acessar sua conta.
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  O link expira em 24 horas.
                </p>
              </div>

              <p className="text-slate-400 text-xs mb-6">
                Não recebeu? Verifique a pasta de spam!
              </p>

              <Button
                onClick={() => {
                  setMagicLinkSent(false);
                  setEmail('');
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 h-10"
              >
                Usar outro email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== FORMULÁRIO DE LOGIN ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
          <p className="text-slate-400">CRM - Gerenciamento de Leads e Pacientes</p>
        </div>

        {/* Card de Login */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Fazer Login</h2>

          {/* Mensagens de Erro */}
          {(error || formError) && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-400 text-sm font-medium">{error || formError}</div>
            </div>
          )}

          {/* Abas */}
          <div className="flex gap-2 mb-6 border-b border-slate-700">
            <button
              onClick={() => {
                setUsePassword(true);
                setFormError('');
              }}
              className={`flex-1 pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
                usePassword
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Senha
            </button>
            <button
              onClick={() => {
                setUsePassword(false);
                setFormError('');
              }}
              className={`flex-1 pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
                !usePassword
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* ========== LOGIN COM SENHA ========== */}
          {usePassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Botão Login */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 h-10 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              {/* Link Esqueci Senha */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
            </form>
          ) : (
            // ========== LOGIN COM MAGIC LINK ==========
            <form onSubmit={handleMagicLink} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={magicLinkLoading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-300">
                <p>
                  ✨ Receberá um link no seu email para acessar sem usar senha.
                </p>
              </div>

              {/* Botão Magic Link */}
              <Button
                type="submit"
                disabled={magicLinkLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 h-10 mt-6"
              >
                {magicLinkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Link de Acesso
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Rodapé */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center text-slate-400 text-sm">
            <p>Autenticação segura com Supabase</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>🔒 Seus dados são protegidos com criptografia AES-256</p>
        </div>
      </div>
    </div>
  );
}
