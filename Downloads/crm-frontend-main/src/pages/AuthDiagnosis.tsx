import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function AuthDiagnosis() {
  const [diagnosis, setDiagnosis] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const runDiagnosis = async () => {
      const newLogs: string[] = [];
      const data: Record<string, any> = {};

      newLogs.push('═══════════════════════════════════════');
      newLogs.push('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
      newLogs.push('═══════════════════════════════════════');

      // 1. Verificar URL
      newLogs.push('\n1️⃣  LOCATION');
      newLogs.push(`   PATH: ${window.location.pathname}`);
      newLogs.push(`   HASH: ${window.location.hash.substring(0, 100)}...`);
      data.path = window.location.pathname;
      data.hash = window.location.hash.substring(0, 100);

      // 2. Verificar sessão atual
      newLogs.push('\n2️⃣  CURRENT SESSION');
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        newLogs.push(`   ❌ Error: ${sessionError.message}`);
        data.sessionError = sessionError.message;
      } else if (session?.session) {
        newLogs.push(`   ✅ User: ${session.session.user.email}`);
        newLogs.push(`   ✅ User ID: ${session.session.user.id}`);
        newLogs.push(`   ✅ Access Token: ${session.session.access_token.substring(0, 20)}...`);
        newLogs.push(`   ✅ Expires at: ${new Date(session.session.expires_at! * 1000).toLocaleString()}`);
        data.session = {
          email: session.session.user.email,
          userId: session.session.user.id,
          expiresAt: new Date(session.session.expires_at! * 1000).toLocaleString(),
        };
      } else {
        newLogs.push('   ❌ No active session');
        data.session = null;
      }

      // 3. Verificar User
      newLogs.push('\n3️⃣  AUTH USER');
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        newLogs.push(`   ❌ Error: ${userError.message}`);
        data.userError = userError.message;
      } else if (user?.user) {
        newLogs.push(`   ✅ Email: ${user.user.email}`);
        newLogs.push(`   ✅ ID: ${user.user.id}`);
        data.user = {
          email: user.user.email,
          id: user.user.id,
        };
      } else {
        newLogs.push('   ❌ No user logged in');
        data.user = null;
      }

      // 4. Verificar localStorage
      newLogs.push('\n4️⃣  LOCAL STORAGE');
      const sbAuth = localStorage.getItem('sb-auth');
      if (sbAuth) {
        newLogs.push('   ✅ sb-auth key exists');
        try {
          const parsed = JSON.parse(sbAuth);
          newLogs.push(`   ✅ Has access_token: ${!!parsed.access_token}`);
          newLogs.push(`   ✅ Has refresh_token: ${!!parsed.refresh_token}`);
          data.localStorage = {
            hasAccessToken: !!parsed.access_token,
            hasRefreshToken: !!parsed.refresh_token,
          };
        } catch (e) {
          newLogs.push('   ⚠️ Could not parse sb-auth');
        }
      } else {
        newLogs.push('   ❌ sb-auth key NOT found in localStorage');
        data.localStorage = null;
      }

      // 5. Verificar parâmetros de URL
      newLogs.push('\n5️⃣  URL PARAMETERS');
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const error = params.get('error');
        const type = params.get('type');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        newLogs.push(`   Error: ${error || 'none'}`);
        newLogs.push(`   Type: ${type || 'none'}`);
        newLogs.push(`   Access Token: ${accessToken ? 'present' : 'missing'}`);
        newLogs.push(`   Refresh Token: ${refreshToken ? 'present' : 'missing'}`);

        data.urlParams = {
          error: error || null,
          type: type || null,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        };
      } else {
        newLogs.push('   ❌ No hash parameters');
        data.urlParams = null;
      }

      // 6. Verificar navegador
      newLogs.push('\n6️⃣  BROWSER INFO');
      newLogs.push(`   User Agent: ${navigator.userAgent.substring(0, 60)}...`);
      newLogs.push(`   Language: ${navigator.language}`);

      // 7. Recomendações
      newLogs.push('\n7️⃣  RECOMENDAÇÕES');
      if (!data.session) {
        newLogs.push('   ⚠️ Nenhuma sessão ativa');
        if (hash && !hash.includes('error')) {
          newLogs.push('   💡 Hash presente mas sem sessão - pode ser problema no callback');
        }
      }

      if (hash && hash.includes('error')) {
        newLogs.push('   ⚠️ Hash contém erro - verifique tipo do link');
      }

      if (!data.localStorage) {
        newLogs.push('   ⚠️ sb-auth não encontrado - sessão pode estar limpa');
      }

      newLogs.push('\n═══════════════════════════════════════');

      setDiagnosis(data);
      setLogs(newLogs);

      // Also log to console
      console.log(newLogs.join('\n'));
    };

    runDiagnosis();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🔍 Auth Diagnosis</h1>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-words">
            {logs.join('\n')}
          </pre>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(diagnosis).map(([key, value]) => (
            <div key={key} className="bg-slate-800 rounded border border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">{key}</h3>
              <pre className="text-xs text-slate-400">
                {typeof value === 'object'
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Esta página mostra o estado atual da autenticação</p>
          <p>Abra F12 → Console para ver logs detalhados</p>
        </div>
      </div>
    </div>
  );
}
