import React from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function ReativacaoPage() {
  const crm = useCrm();
  const today = new Date();

  const inativos = crm.pacientes.filter((p) => {
    const lastAg = crm.agendamentos
      .filter((a) => a.contatoId === p.id)
      .sort((a, b) => b.data.localeCompare(a.data))[0];
    if (!lastAg) return differenceInDays(today, new Date(p.criadoEm)) > 30;
    return differenceInDays(today, new Date(lastAg.data)) > 30;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reativação de Pacientes</h1>
        <p className="text-muted-foreground text-sm">Pacientes sem retorno há mais de 30 dias</p>
      </div>

      <div className="space-y-3">
        {inativos.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.nome}</div>
                <div className="text-sm text-muted-foreground">{p.telefone}</div>
              </div>
              <Button asChild variant="outline">
                <a href={`https://wa.me/${p.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
        {inativos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">Nenhum paciente inativo encontrado</p>
        )}
      </div>
    </div>
  );
}
