import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsersRound, CheckCircle, Clock } from 'lucide-react';
import AddMemberModal from '@/components/AddMemberModal';
import supabase from '@/lib/supabase';

interface TeamMember {
  id: string;
  nome: string;
  email: string;
  cargo: 'gerenciador' | 'usuario' | 'observador';
  ativo: boolean;
  dataCriacao?: string;
}

export default function EquipePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [equipe, setEquipe] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Carregar membros da equipe ao montar ───
  useEffect(() => {
    loadEquipeMembers();
  }, []);

  const loadEquipeMembers = async () => {
    try {
      setLoading(true);
      console.log('[EquipePage] Carregando membros da equipe...');

      // TODO: Implementar endpoint real para buscar membros da equipe
      // Por enquanto, usando dados mock
      const mockEquipe: TeamMember[] = [
        {
          id: '1',
          nome: 'Admin',
          email: 'admin@clinica.com',
          cargo: 'gerenciador',
          ativo: true,
          dataCriacao: new Date().toISOString(),
        },
      ];

      setEquipe(mockEquipe);
      console.log('[EquipePage] ✅ Equipe carregada:', mockEquipe.length, 'membros');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar equipe';
      console.error('[EquipePage] ❌ Erro ao carregar:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (email: string) => {
    console.log('[EquipePage] Membro adicionado:', email);
    // Aqui você poderia recarregar a lista de membros
    // await loadEquipeMembers();
  };

  const getBadgeVariant = (cargo: string) => {
    switch (cargo) {
      case 'gerenciador':
        return 'default';
      case 'usuario':
        return 'secondary';
      case 'observador':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getCargoLabel = (cargo: string) => {
    switch (cargo) {
      case 'gerenciador':
        return 'Gerenciador';
      case 'usuario':
        return 'Usuário';
      case 'observador':
        return 'Observador';
      default:
        return cargo;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground text-sm">Gerencie membros e permissões</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UsersRound className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-500/5">
          <CardContent className="p-4 text-red-600 text-sm">
            Erro ao carregar equipe: {error}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando membros da equipe...
        </div>
      ) : equipe.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <UsersRound className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">Nenhum membro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clique em "Adicionar Membro" para convidar o primeiro usuário
            </p>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Adicionar Primeiro Membro
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Members List */
        <div className="space-y-3">
          {equipe.map((membro) => (
            <Card key={membro.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {membro.nome}
                    {membro.ativo && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{membro.email}</div>
                  {membro.dataCriacao && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(membro.dataCriacao).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                <Badge variant={getBadgeVariant(membro.cargo)}>
                  {getCargoLabel(membro.cargo)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Adicionar Membro */}
      <AddMemberModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleAddMember}
      />
    </div>
  );
}
