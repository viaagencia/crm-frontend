import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Webhook, Calendar as CalIcon, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GoogleAgendaConnect } from '@/components/GoogleAgendaConnect';
import supabase from '@/lib/supabase';

/**
 * PÁGINA: Configurações
 *
 * Seções:
 * 1. Dados Pessoais
 * 2. Segurança
 * 3. Integrações (Google Agenda + n8n)
 */

export default function ConfiguracoesPage() {
  // ─── Estado do usuário ───
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ─── Estado dos dados pessoais ───
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Estado da senha ───
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Estado Google ───
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('[Configuracoes] Carregando dados do usuário...');

        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
          console.error('[Configuracoes] Erro ao carregar:', error);
          setLoading(false);
          return;
        }

        setUser(authUser);
        setName(authUser.user_metadata?.name || '');
        setPhone(authUser.user_metadata?.phone || '');

        console.log('[Configuracoes] ✅ Usuário carregado:', authUser.email);

        // Verificar se Google está conectado
        await checkGoogleConnection(authUser.id);

      } catch (err) {
        console.error('[Configuracoes] Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Verificar conexão Google
  const checkGoogleConnection = async (userId: string) => {
    try {
      console.log('[Configuracoes] Verificando conexão Google...');

      const response = await fetch('/api/google/check-connection');
      const data = await response.json();

      setIsGoogleConnected(data.connected || false);
      console.log('[Configuracoes] Google conectado?', data.connected);

    } catch (err) {
      console.error('[Configuracoes] Erro ao verificar Google:', err);
    }
  };

  // Salvar dados pessoais
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      console.log('[Configuracoes] Atualizando perfil...');

      const { error } = await supabase.auth.updateUser({
        data: { name, phone },
      });

      if (error) {
        throw error;
      }

      console.log('[Configuracoes] ✅ Perfil atualizado');
      setProfileMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });

      setTimeout(() => setProfileMessage(null), 3000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar';
      console.error('[Configuracoes] ❌ Erro:', message);
      setProfileMessage({ type: 'error', text: message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Atualizar senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    // Validações
    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Preencha ambas as senhas' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Senha deve ter no mínimo 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Senhas não correspondem' });
      return;
    }

    setIsSavingPassword(true);

    try {
      console.log('[Configuracoes] Atualizando senha...');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      console.log('[Configuracoes] ✅ Senha atualizada');
      setPasswordMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setPasswordMessage(null), 3000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar';
      console.error('[Configuracoes] ❌ Erro:', message);
      setPasswordMessage({ type: 'error', text: message });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Dados pessoais, segurança e integrações</p>
      </div>

      <div className="space-y-6">
        {/* ═════════════════════════════════════════ */}
        {/* SEÇÃO 1: DADOS PESSOAIS */}
        {/* ═════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSavingProfile}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-600 dark:text-slate-400"
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
                  disabled={isSavingProfile}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>

              {/* Mensagens */}
              {profileMessage && (
                <div className={`p-3 rounded-lg flex gap-3 ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                }`}>
                  {profileMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className={profileMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} >
                    {profileMessage.text}
                  </div>
                </div>
              )}

              {/* Botão */}
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ═════════════════════════════════════════ */}
        {/* SEÇÃO 2: SEGURANÇA */}
        {/* ═════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSavingPassword}
                    className="bg-slate-50 dark:bg-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    disabled={isSavingPassword}
                    className="bg-slate-50 dark:bg-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mensagens */}
              {passwordMessage && (
                <div className={`p-3 rounded-lg flex gap-3 ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className={passwordMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {passwordMessage.text}
                  </div>
                </div>
              )}

              {/* Botão */}
              <Button
                type="submit"
                disabled={isSavingPassword}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Senha'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ═════════════════════════════════════════ */}
        {/* SEÇÃO 3: INTEGRAÇÕES */}
        {/* ═════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalIcon className="h-5 w-5 text-primary" /> Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Agenda */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Google Agenda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conecte sua conta Google para sincronizar automaticamente suas consultas com o Google Calendar.
              </p>
              <GoogleAgendaConnect
                isConnected={isGoogleConnected}
                onConnect={() => setIsGoogleConnected(true)}
                onDisconnect={() => setIsGoogleConnected(false)}
              />
            </div>

            {/* Separador */}
            <div className="border-t" />

            {/* n8n */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Webhook className="w-4 h-4" /> Integração n8n
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure webhooks para automações: follow-ups, lembretes de consulta, reativação de pacientes.
              </p>
              <div className="space-y-3">
                <Input placeholder="URL do Webhook n8n" className="bg-slate-50 dark:bg-slate-900" />
                <Button variant="outline" className="w-full">Salvar Webhook</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
