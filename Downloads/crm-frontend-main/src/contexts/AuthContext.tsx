import React, { createContext, useContext } from 'react';
import { useAuth, AuthUser } from '@/hooks/useAuth';

// ========== TIPOS ==========
interface AuthContextType {
  // Estado
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Funções
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  inviteUser: (email: string) => Promise<boolean>;
}

// ========== CONTEXTO ==========
const AuthContext = createContext<AuthContextType | null>(null);

// ========== PROVIDER ==========
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// ========== HOOK ==========
export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>');
  }

  return ctx;
}
