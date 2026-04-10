import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ========== ROTAS PÚBLICAS ==========
// Estas rotas podem ser acessadas SEM autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password', // Página unificada de definição de senha (invite + recovery)
  '/auth/callback',
  '/auth/diagnosis', // Para debug
];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  // ========== LOGS AGRESSIVOS PARA DEBUG ==========
  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));

    console.log('═══════════════════════════════════════');
    console.log('[ProtectedRoute] VERIFICAÇÃO DE ROTA');
    console.log('═══════════════════════════════════════');
    console.log('[ProtectedRoute] PATH:', location.pathname);
    console.log('[ProtectedRoute] HASH:', location.hash);
    console.log('[ProtectedRoute] É rota pública?', isPublic ? '✅ SIM' : '❌ NÃO');
    console.log('[ProtectedRoute] Authenticated:', isAuthenticated ? '✅ SIM' : '❌ NÃO');
    console.log('[ProtectedRoute] Loading:', loading ? '⏳ SIM' : '❌ NÃO');
    console.log('═══════════════════════════════════════');
  }, [location.pathname, isAuthenticated, loading]);

  // ========== VERIFICAR SE É ROTA PÚBLICA ==========
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  // ========== ROTA PÚBLICA: RENDERIZAR SEM PROTEÇÃO ==========
  if (isPublicRoute) {
    console.log('[ProtectedRoute] ✅ Rota pública autorizada:', location.pathname);
    return <>{children}</>;
  }

  // ========== ROTA PROTEGIDA: AGUARDANDO CARREGAMENTO DE SESSÃO ==========
  if (loading) {
    console.log('[ProtectedRoute] ⏳ Carregando sessão...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Carregando Sistema...</h1>
          <p className="text-slate-400 text-sm">Por favor aguarde enquanto verificamos sua sessão.</p>
        </div>
      </div>
    );
  }

  // ========== ROTA PROTEGIDA: NÃO AUTENTICADO ==========
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] ❌ Acesso negado - usuário não autenticado:', location.pathname);
    console.log('[ProtectedRoute] Redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // ========== ROTA PROTEGIDA: AUTENTICADO ==========
  console.log('[ProtectedRoute] ✅ Acesso autorizado:', location.pathname);
  return <>{children}</>;
}
