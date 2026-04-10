import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAgendaConnect } from "@/components/GoogleAgendaConnect";
import { useAuthContext } from "@/contexts/AuthContext";

const ConfiguracoesPage = () => {
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add save logic here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e integrações</p>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="integracao">Integrações</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Seu nome completo" defaultValue={user?.user_metadata?.full_name || ""} />
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>Conecte sua conta do Google Calendar para sincronizar agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleAgendaConnect />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Escolha como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-600">
                Configurações de notificação em breve
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
