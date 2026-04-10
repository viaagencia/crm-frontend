import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Configuração Supabase Admin ───
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zhqdrayplfkbylrbysed.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurado em .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// ─── Health Check ───
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Endpoint: Convidar Usuário ───
app.post('/api/invite-user', async (req, res) => {
  try {
    const { email, nome, cargo } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[InviteUser API] Recebido pedido de convite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[InviteUser API] Email:', email);
    console.log('[InviteUser API] Nome:', nome);
    console.log('[InviteUser API] Cargo:', cargo);

    // ─── Validação ───
    if (!email || !email.includes('@')) {
      console.warn('[InviteUser API] ❌ Email inválido');
      return res.status(400).json({
        error: 'Email inválido',
        details: 'Forneça um email válido'
      });
    }

    // ─── Redirect URL ───
    // Unificado: tanto invite quanto recovery usam /reset-password
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectTo = `${redirectUrl}/reset-password`;

    console.log('[InviteUser API] Redirect URL:', redirectTo);
    console.log('[InviteUser API] Chamando supabaseAdmin.auth.admin.inviteUserByEmail()...');

    // ─── Chamar Supabase Admin API ───
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      console.error('[InviteUser API] ❌ Erro do Supabase:', error.message);
      return res.status(400).json({
        error: 'Erro ao enviar convite',
        details: error.message
      });
    }

    console.log('[InviteUser API] ✅ Convite enviado com sucesso!');
    console.log('[InviteUser API] User ID:', data?.user?.id);
    console.log('[InviteUser API] Email:', data?.user?.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      message: 'Convite enviado com sucesso',
      user: {
        id: data?.user?.id,
        email: data?.user?.email,
      },
    });

  } catch (err) {
    console.error('[InviteUser API] ❌ Erro inesperado:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    });
  }
});

// ─── Endpoint: Conectar Google Agenda ───
app.post('/api/google/exchange-token', async (req, res) => {
  try {
    const { code } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Google API] Exchange Token Request');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // ─── Validação ───
    if (!code) {
      console.warn('[Google API] ❌ Code não fornecido');
      return res.status(400).json({ error: 'Code é obrigatório' });
    }

    // ─── Obter usuário autenticado via header ───
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn('[Google API] ❌ Token Supabase não fornecido');
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const supabaseToken = authHeader.replace('Bearer ', '');

    // ─── Verificar token com Supabase ───
    console.log('[Google API] Verificando token Supabase...');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(supabaseToken);

    if (userError || !user) {
      console.error('[Google API] ❌ Token inválido:', userError?.message);
      return res.status(401).json({ error: 'Token inválido' });
    }

    console.log('[Google API] ✅ Usuário autenticado:', user.email);

    // ─── Trocar code por tokens no Google ───
    console.log('[Google API] Trocando code por tokens...');

    const googleClientId = process.env.GOOGLE_CLIENT_ID || 'CONFIGURE_CLIENT_ID';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'CONFIGURE_CLIENT_SECRET';
    const redirectUri = 'http://localhost:5173/google-callback';

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[Google API] ❌ Erro do Google:', errorData);
      return res.status(400).json({ error: 'Erro ao trocar code por token' });
    }

    const tokens = await tokenResponse.json();
    console.log('[Google API] ✅ Tokens recebidos do Google');
    console.log('[Google API] Access Token:', tokens.access_token ? '✅' : '❌');
    console.log('[Google API] Refresh Token:', tokens.refresh_token ? '✅' : '❌');

    // ─── Calcular data de expiração ───
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);

    // ─── Salvar ou atualizar no Supabase ───
    console.log('[Google API] Salvando tokens no Supabase...');

    // Primeiro, tentar encontrar integração existente
    const { data: existing } = await supabaseAdmin
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let saveResult;

    if (existing) {
      // Atualizar existente
      console.log('[Google API] Atualizando integração existente...');

      saveResult = await supabaseAdmin
        .from('google_integrations')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || existing.refresh_token,
          expiry_date: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

    } else {
      // Criar nova
      console.log('[Google API] Criando nova integração...');

      saveResult = await supabaseAdmin
        .from('google_integrations')
        .insert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: expiryDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    if (saveResult.error) {
      console.error('[Google API] ❌ Erro ao salvar no Supabase:', saveResult.error);
      return res.status(500).json({ error: 'Erro ao salvar tokens' });
    }

    console.log('[Google API] ✅ Tokens salvos com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      message: 'Google Agenda conectado com sucesso',
      expires_in: tokens.expires_in,
    });

  } catch (err) {
    console.error('[Google API] ❌ Erro inesperado:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Erro desconhecido'
    });
  }
});

// ─── Endpoint: Verificar conexão Google ───
app.get('/api/google/check-connection', async (req, res) => {
  try {
    console.log('[Google API] Verificando conexão...');

    // ─── Obter usuário do header ───
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('[Google API] Sem autenticação, retornando false');
      return res.json({ connected: false });
    }

    const supabaseToken = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(supabaseToken);

    if (userError || !user) {
      console.log('[Google API] Token inválido');
      return res.json({ connected: false });
    }

    // ─── Verificar se tem integração ───
    const { data, error } = await supabaseAdmin
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.log('[Google API] Nenhuma integração encontrada');
      return res.json({ connected: false });
    }

    console.log('[Google API] ✅ Integração encontrada');
    res.json({ connected: true });

  } catch (err) {
    console.error('[Google API] ❌ Erro:', err);
    res.json({ connected: false });
  }
});

// ─── Endpoint: Desconectar Google ───
app.post('/api/google/disconnect', async (req, res) => {
  try {
    console.log('[Google API] Desconectando Google...');

    // ─── Obter usuário ───
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const supabaseToken = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(supabaseToken);

    if (userError || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // ─── Deletar integração ───
    const { error: deleteError } = await supabaseAdmin
      .from('google_integrations')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Google API] ❌ Erro ao deletar:', deleteError);
      return res.status(500).json({ error: 'Erro ao desconectar' });
    }

    console.log('[Google API] ✅ Desconectado com sucesso');
    res.json({ success: true, message: 'Google desconectado' });

  } catch (err) {
    console.error('[Google API] ❌ Erro:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ─── 404 ───
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error('[Server] Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Iniciar Servidor ───
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`✅ Endpoint: POST http://localhost:${PORT}/api/invite-user`);
  console.log(`✅ Health: GET http://localhost:${PORT}/health\n`);
});
