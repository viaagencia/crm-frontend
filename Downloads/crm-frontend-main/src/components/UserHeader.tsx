import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * COMPONENTE: Exibe usuário logado no header
 *
 * Mostra:
 * - Nome do usuário (ou email se não tiver nome)
 * - Avatar com inicial
 * - Dropdown com opções:
 *   * Minha Conta
 *   * Sair
 */

export function UserHeader() {
  const navigate = useNavigate();
  const { user, logout, loading } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.name || user?.email || 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleNavigatePerfil = () => {
    setIsOpen(false);
    navigate('/perfil');
  };

  // Se ainda está carregando o usuário
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Se não tem usuário
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 px-2 hover:bg-accent h-9"
        >
          <Avatar className="h-7 w-7 bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary text-white text-xs font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground hidden sm:inline-block max-w-[150px] truncate">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Informações do usuário */}
        <div className="px-2 py-1.5 text-sm">
          <div className="font-semibold text-foreground">{user.name || 'Usuário'}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>

        <DropdownMenuSeparator />

        {/* Opções */}
        <DropdownMenuItem onClick={handleNavigatePerfil} className="cursor-pointer gap-2">
          <User className="w-4 h-4" />
          <span>Minha Conta</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
