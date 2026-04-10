import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * PÁGINA: Perfil do Usuário
 *
 * Seções:
 * 1. 👤 Dados do usuário (nome, email, telefone)
 * 2. 🔒 Segurança (atualizar senha)
 * 3. 📅 Integrações (Google Calendar)
 */

export default function ProfilePage() {
  const { user, loading, error, success, updateProfile, updatePassword } = useUserProfile();

  // ─── Estado do formulário de dados ───
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // ─── Estado do formulário de senha ───
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // ─── Estado da integração Google ───
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Carregar dados quando usuário é carregado
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Atualizar dados do perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const success = await updateProfile(name, phone);

    setIsUpdatingProfile(false);
    if (success) {
      // Limpar mensagens após 3 segundos
      setTimeout(() => {
        // Clear success state if needed
      }, 3000);
    }
  };

  // Atualizar senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validar senhas
    if (!newPassword || !confirmPassword) {
      setPasswordError('Preencha ambas as senhas');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não correspondem');
      return;
    }

    setIsUpdatingPassword(true);

    const success = await updatePassword(newPassword);

    setIsUpdatingPassword(false);

    if (success) {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } else {
      setPasswordError('Erro ao atualizar senha');
    }
  };

  // Conectar Google Agenda
  const handleConnectGoogle = () => {
    setIsConnectingGoogle(true);

    const clientId = 'SEU_CLIENT_ID'; // Será configurado depois
    const redirectUri = `${window.location.origin}/google-callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('access_type', 'offline');

    console.log('[ProfilePage] Redirecionando para Google OAuth');
    window.location.href = authUrl.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Minha Conta</h1>

        {/* ═════════════════════════════════════════ */}
        {/* SEÇÃO 1: DADOS DO USUÁRIO */}
        {/* ═════════════════════════════════════════ */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <span>👤</span> Dados Pessoais
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdatingProfile}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email não pode ser alterado</p>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Digite seu telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isUpdatingProfile}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Mensagens */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-600 dark:text-green-400 text-sm">Dados atualizados com sucesso!</div>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </form>
        </div>

        {/* ═════════════════════════════════════════ */}
        {/* SEÇÃO 2: SEGURANÇA */}
        {/* ═════════════════════════════════════════ */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <span>🔒</span> Segurança
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isUpdatingPassword}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isUpdatingPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagens */}
            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-600 dark:text-red-400 text-sm">{passwordError}</div>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-600 dark:text-green-400 text-sm">Senha atualizada com sucesso!</div>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Senha'
              )}
            </Button>
          </form>
        </div>

        {/* ═════════════════════════════════════════ */}
        {/* SEÇÃO 3: INTEGRAÇÕES */}
        {/* ═════════════════════════════════════════ */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <span>📅</span> Integrações
          </h2>

          <div className="space-y-4">
            {/* Google Calendar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-foreground">Google Agenda</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sincronize seus agendamentos com o Google Calendar
                </p>
              </div>
              <Button
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConnectingGoogle ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Conectar'
                )}
              </Button>
            </div>

            {/* Mais integrações virão */}
            <p className="text-sm text-muted-foreground text-center pt-4">
              Mais integrações em breve...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
