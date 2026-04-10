import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useInviteUser } from '@/hooks/useInviteUser';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (email: string) => void;
}

type CargoType = 'gerenciador' | 'usuario' | 'observador';

export default function AddMemberModal({
  open,
  onOpenChange,
  onSuccess,
}: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState<CargoType>('usuario');

  const { inviteUser, loading, error, success } = useInviteUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('═══════════════════════════════════════');
    console.log('[AddMemberModal] Iniciando convite');
    console.log('[AddMemberModal] Email:', email);
    console.log('[AddMemberModal] Nome:', nome);
    console.log('[AddMemberModal] Cargo:', cargo);
    console.log('═══════════════════════════════════════');

    const result = await inviteUser({
      email,
      nome,
      cargo,
    });

    if (result) {
      console.log('[AddMemberModal] ✅ Convite enviado com sucesso!');

      // Limpar formulário
      setEmail('');
      setNome('');
      setCargo('usuario');

      // Callback
      onSuccess?.(email);

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Limpar formulário ao abrir
      setEmail('');
      setNome('');
      setCargo('usuario');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
          <DialogDescription>
            Convide um novo membro para sua equipe. Um email de convite será enviado.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          // ─── Estado de Sucesso ───
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full border-2 border-green-500/30">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sucesso!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Convite enviado para <span className="font-medium">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              O usuário receberá um email com as instruções
            </p>
          </div>
        ) : (
          // ─── Formulário ───
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="novo.usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome (Opcional)</Label>
              <Input
                id="nome"
                type="text"
                placeholder="João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Select value={cargo} onValueChange={(value) => setCargo(value as CargoType)} disabled={loading}>
                <SelectTrigger id="cargo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="gerenciador">Gerenciador</SelectItem>
                  <SelectItem value="observador">Observador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}

            {/* Botões */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !email}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Convite'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
