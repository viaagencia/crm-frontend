import React, { useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ContatoDetail } from '@/components/ContatoDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function PacientesPage() {
  const crm = useCrm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });

  const selected = crm.pacientes.find((p) => p.id === selectedId) || null;

  const items = crm.pacientes.map((p) => ({
    id: p.id,
    nome: p.nome,
    telefone: p.telefone,
    colunaId: p.colunaId,
    criadoEm: p.criadoEm,
    ultimoProcedimento: p.ultimoProcedimento,
    tarefas: p.tarefas,
  }));

  const handleAdd = () => {
    if (!form.nome.trim() || !addDialog) return;
    crm.addPaciente({ nome: form.nome, telefone: form.telefone, email: form.email, colunaId: addDialog });
    setForm({ nome: '', telefone: '', email: '' });
    setAddDialog(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Base de Pacientes</h1>
          <p className="text-muted-foreground text-sm">Acompanhe tratamentos e relacionamento</p>
        </div>
      </div>

      <KanbanBoard
        colunas={crm.colunasPacientes}
        setColunas={crm.setColunasPacientes}
        items={items}
        onItemMove={(id, colId) => crm.updatePaciente(id, { colunaId: colId })}
        onItemClick={setSelectedId}
        onAddItem={(colId) => setAddDialog(colId)}
        tipo="pacientes"
      />

      <ContatoDetail
        contato={selected}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onUpdate={crm.updatePaciente}
        onDelete={crm.deletePaciente}
        agendamentos={crm.agendamentos}
        onAddAgendamento={crm.addAgendamento}
        tipo="paciente"
      />

      <Dialog open={!!addDialog} onOpenChange={(o) => !o && setAddDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Paciente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(null)}>Cancelar</Button>
            <Button onClick={handleAdd}>Adicionar Paciente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
