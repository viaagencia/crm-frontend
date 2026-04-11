import React, { useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ContatoDetail } from '@/components/ContatoDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { OrigemSelect } from '@/components/OrigemSelect';
import {
  createLeadInSupabase,
  updateLeadStageInSupabase,
  updateLeadPipelineInSupabase,
  deleteLeadFromSupabase,
} from '@/hooks/useSupabaseLeadsActions';
import { useAuth } from '@/hooks/useAuth';

export default function PacientesPage() {
  const crm = useCrm();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', origem: '' });

  // Função para atualizar colunas pacientes com persistência em Supabase
  const updateColunasPacientes = (updater: any) => {
    if (typeof updater === 'function') {
      crm.updateColunasPacientes(updater(crm.colunasPacientes));
    } else {
      crm.updateColunasPacientes(updater);
    }
  };

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

  // ✅ Adiciona paciente no CRM + Supabase
  const handleAdd = async () => {
    if (!form.nome.trim() || !addDialog || !user?.id) return;

    try {
      // Encontrar o pipeline de pacientes
      const pacientesPipeline = crm.pipelines.find(p => p.nome === 'Pacientes');
      if (!pacientesPipeline) return;

      // Criar paciente no Supabase
      const newLead = await createLeadInSupabase(
        form.nome,
        form.telefone,
        form.origem,
        pacientesPipeline.id,
        addDialog,
        user.id
      );

      if (newLead) {
        // Sincronizar com CRM context
        await crm.addPaciente({
          id: newLead.id,
          nome: newLead.nome,
          telefone: newLead.telefone,
          email: newLead.email,
          origem: newLead.origem,
          colunaId: addDialog,
        });
      }

      setForm({ nome: '', telefone: '', email: '', origem: '' });
      setAddDialog(null);
    } catch (err) {
      console.error('Erro ao criar paciente:', err);
    }
  };

  // ✅ Move paciente de volta para um funil (vira lead novamente)
  const handleMoverParaLead = async (pacienteId: string, pipelineId: string) => {
    const targetPipeline = crm.pipelines.find(p => p.id === pipelineId);
    if (!targetPipeline) return;

    try {
      // Atualizar no Supabase
      await updateLeadPipelineInSupabase(
        pacienteId,
        pipelineId,
        targetPipeline.colunas[0]?.id
      );

      // Converter paciente para lead no CRM context
      crm.convertPacienteToLead(pacienteId, pipelineId, targetPipeline.colunas[0]?.id);
    } catch (err) {
      console.error('Erro ao mover paciente para lead:', err);
    }
  };

  // ✅ Deleta do CRM + Supabase
  const handleDelete = async (contato: any) => {
    try {
      // Deletar do Supabase
      const deleted = await deleteLeadFromSupabase(contato.id);

      if (deleted) {
        // Deletar paciente do CRM context
        crm.deletePaciente(contato.id);
      }

      setSelectedId(null);
    } catch (err) {
      console.error('Erro ao deletar paciente:', err);
    }
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
        setColunas={updateColunasPacientes}
        items={items}
        onItemMove={async (id, colId) => {
          try {
            // Atualizar no Supabase
            await updateLeadStageInSupabase(id, colId);

            // Atualizar paciente no CRM context
            crm.updatePaciente(id, { colunaId: colId });
          } catch (err) {
            console.error('Erro ao mover paciente:', err);
          }
        }}
        onItemClick={setSelectedId}
        onAddItem={(colId) => setAddDialog(colId)}
        tipo="pacientes"
      />

      <ContatoDetail
        contato={selected}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onDelete={handleDelete}
        onMoverPipeline={handleMoverParaLead}
      />

      <Dialog open={!!addDialog} onOpenChange={(o) => !o && setAddDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Paciente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <OrigemSelect value={form.origem} onChange={(v) => setForm({ ...form, origem: v })} />
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
