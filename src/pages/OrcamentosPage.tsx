import React, { useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Orcamento, Procedimento } from '@/types/crm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OrcamentosPage() {
  const crm = useCrm();
  const [showDialog, setShowDialog] = useState(false);
  const [contatoId, setContatoId] = useState('');
  const [contatoTipo, setContatoTipo] = useState<'lead' | 'paciente'>('lead');
  const [procs, setProcs] = useState<Procedimento[]>([]);
  const [procNome, setProcNome] = useState('');
  const [procValor, setProcValor] = useState('');

  const allContatos = [
    ...crm.leads.map((l) => ({ id: l.id, nome: l.nome, tipo: 'lead' as const })),
    ...crm.pacientes.map((p) => ({ id: p.id, nome: p.nome, tipo: 'paciente' as const })),
  ];

  const addProc = () => {
    if (!procNome || !procValor) return;
    setProcs([...procs, { id: crypto.randomUUID(), nome: procNome, valor: parseFloat(procValor) }]);
    setProcNome('');
    setProcValor('');
  };

  const handleAdd = () => {
    if (!contatoId || procs.length === 0) return;
    const contato = allContatos.find((c) => c.id === contatoId);
    crm.addOrcamento({
      contatoId,
      contatoTipo: contato?.tipo || 'lead',
      procedimentos: procs,
      valorTotal: procs.reduce((s, p) => s + p.valor, 0),
      status: 'pendente',
    });
    setProcs([]);
    setContatoId('');
    setShowDialog(false);
  };

  const statusColor = (s: Orcamento['status']) => {
    switch (s) {
      case 'aprovado': return 'default';
      case 'reprovado': return 'destructive';
      case 'negociacao': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie propostas e valores</p>
        </div>
        <Button onClick={() => setShowDialog(true)}><Plus className="h-4 w-4 mr-2" /> Novo Orçamento</Button>
      </div>

      <div className="space-y-3">
        {crm.orcamentos.map((orc) => {
          const contato = allContatos.find((c) => c.id === orc.contatoId);
          return (
            <Card key={orc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{contato?.nome || 'Contato removido'}</div>
                  <div className="text-sm text-muted-foreground">
                    {orc.procedimentos.map((p) => p.nome).join(', ')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(orc.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-foreground">
                    R$ {orc.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <Select
                    value={orc.status}
                    onValueChange={(v) => crm.updateOrcamento(orc.id, { status: v as Orcamento['status'] })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="reprovado">Reprovado</SelectItem>
                      <SelectItem value="negociacao">Negociação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {crm.orcamentos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">Nenhum orçamento criado</p>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={contatoId} onValueChange={setContatoId}>
              <SelectTrigger><SelectValue placeholder="Selecione o contato" /></SelectTrigger>
              <SelectContent>
                {allContatos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome} ({c.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input placeholder="Procedimento" value={procNome} onChange={(e) => setProcNome(e.target.value)} />
              <Input type="number" placeholder="Valor" value={procValor} onChange={(e) => setProcValor(e.target.value)} className="w-32" />
              <Button size="icon" onClick={addProc}><Plus className="h-4 w-4" /></Button>
            </div>
            {procs.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">{p.nome}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">R$ {p.valor.toFixed(2)}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setProcs(procs.filter((x) => x.id !== p.id))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {procs.length > 0 && (
              <div className="text-right font-bold">Total: R$ {procs.reduce((s, p) => s + p.valor, 0).toFixed(2)}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={!contatoId || procs.length === 0}>Criar Orçamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
