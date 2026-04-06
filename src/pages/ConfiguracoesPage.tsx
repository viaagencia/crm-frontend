import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Webhook, Calendar as CalIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ConfiguracoesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm">Integrações e preferências do sistema</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" /> Integração n8n
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure webhooks para automações: follow-ups, lembretes de consulta, reativação de pacientes.
            </p>
            <Input placeholder="URL do Webhook n8n" />
            <Button variant="outline">Salvar Webhook</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalIcon className="h-5 w-5 text-primary" /> Google Agenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Integração futura com Google Agenda para sincronização automática de consultas.
            </p>
            <Button variant="outline" disabled>Em breve</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Nome da clínica</p>
            <Input placeholder="Nome da sua clínica" />
            <Button variant="outline">Salvar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
