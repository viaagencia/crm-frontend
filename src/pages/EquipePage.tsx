import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsersRound } from 'lucide-react';

const mockEquipe = [
  { id: '1', nome: 'Admin', email: 'admin@clinica.com', cargo: 'gestor' as const, ativo: true },
];

export default function EquipePage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground text-sm">Gerencie membros e permissões</p>
        </div>
        <Button><UsersRound className="h-4 w-4 mr-2" /> Adicionar Membro</Button>
      </div>

      <div className="space-y-3">
        {mockEquipe.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.nome}</div>
                <div className="text-sm text-muted-foreground">{m.email}</div>
              </div>
              <Badge>{m.cargo}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
