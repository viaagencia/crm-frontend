import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Email é obrigatório');
      return;
    }

    const success = await resetPassword(email);
    if (success) {
      setSubmitted(true);
    } else {
      setFormError('Erro ao enviar email de reset. Verifique seu email e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Via Clinic</h1>
          <p className="text-slate-400">CRM - Gerenciamento de Leads e Pacientes</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Esqueci minha senha
              </h2>
              <p className="text-slate-400 text-center mb-6 text-sm">
                Digite seu email e enviaremos um link para redefinir sua senha
              </p>

              {/* Mensagens de Erro */}
              {(error || formError) && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-400 text-sm">{error || formError}</div>
                </div>
              )}

              {/* Formulário */}
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

                {/* Botão Enviar */}
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
                    'Enviar Link de Reset'
                  )}
                </Button>

                {/* Voltar para Login */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm mt-4 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Mensagem de Sucesso */}
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Email enviado com sucesso!
                </h3>
                <p className="text-slate-400 mb-6">
                  Verifique seu email para receber o link de reset de senha.
                  <br />
                  <span className="text-sm mt-2 block">
                    Não esqueça de verificar a pasta de spam!
                  </span>
                </p>

                {/* Email digitado */}
                <div className="bg-slate-700 rounded p-4 mb-6 text-slate-300 text-sm break-all">
                  {email}
                </div>

                {/* Botão Voltar */}
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
