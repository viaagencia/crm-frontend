import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword, loading: authLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      setLoading(true);

      console.log('═══════════════════════════════════════');
      console.log('[ForgotPassword] SOLICITANDO RESET');
      console.log('═══════════════════════════════════════');
      console.log('[ForgotPassword] Email:', email);
      console.log('[ForgotPassword] Usando contexto: resetPassword()');
      console.log('═══════════════════════════════════════');

      const success = await resetPassword(email);

      if (!success) {
        console.error('[ForgotPassword] ❌ Erro ao solicitar reset');
        setError('Erro ao solicitar reset de senha');
        return;
      }

      console.log('[ForgotPassword] ✅ Email de reset enviado com sucesso');
      setSubmitted(true);
    } catch (err) {
      console.error('[ForgotPassword] ❌ Erro inesperado:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao solicitar reset: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
            <Mail className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
          <p className="text-slate-400">Recuperar Acesso</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Esqueci minha senha</h2>
              <p className="text-slate-400 text-sm mb-6">
                Digite seu email para receber um link de recuperação de senha
              </p>

              {/* Erro */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-400 text-sm">{error}</div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleRequestReset} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </Button>

                {/* Voltar */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Sucesso */}
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Verifique seu email</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Enviamos um link de recuperação para:
                  <br />
                  <span className="font-semibold text-white mt-2 block break-all">{email}</span>
                </p>
                <p className="text-slate-400 text-xs mb-6">
                  Não esqueça de verificar a pasta de spam!
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10 rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </button>
              </div>
            </>
          )}

          {/* Rodapé */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center text-slate-400 text-sm">
            <p>Integrado com Supabase Auth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
