import React, { useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ContatoDetail } from '@/components/ContatoDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { OrigemSelect } from '@/components/OrigemSelect';
import {
  enviarLeadParaSheets,
  enviarPacienteParaSheets,
  apagarLeadDaSheets,
  atualizarEtapaNaSheets,
} from '@/hooks/useGoogleSheetsSync';
import { moverStageNoSupabase, deletarDoSupabase } from '@/hooks/useSupabaseSync';

export default function PacientesPage() {
  const crm = useCrm();
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

  // ✅ Adiciona paciente no CRM + envia para o Sheets
  const handleAdd = async () => {
    if (!form.nome.trim() || !addDialog) return;

    crm.addPaciente({
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      origem: form.origem,
      colunaId: addDialog,
    });

    if (form.telefone) {
      // Sheets
      await enviarPacienteParaSheets(form.nome, form.telefone, form.origem);
    }

    setForm({ nome: '', telefone: '', email: '', origem: '' });
    setAddDialog(null);
  };

  // ✅ Move paciente de volta para um funil (vira lead novamente)
  const handleMoverParaLead = async (pacienteId: string, pipelineId: string) => {
    const targetPipeline = crm.pipelines.find(p => p.id === pipelineId);
    if (!targetPipeline) return;

    const paciente = crm.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;

    crm.convertPacienteToLead(pacienteId, pipelineId, targetPipeline.colunas[0]?.id);

    // ✅ Atualiza no Sheets com o nome real do funil destino
    await atualizarEtapaNaSheets(paciente.telefone, targetPipeline.colunas[0]?.nome || 'Lead', targetPipeline.nome);
  };

  // ✅ Deleta do CRM + apaga do Sheets
  const handleDelete = async (contato: any) => {
    const telefone = String(contato.telefone || '').replace(/\D/g, '');

    crm.deletePaciente(contato.id);
    setSelectedId(null);

    if (telefone) {
      // Sheets
      await apagarLeadDaSheets(telefone);
      // Supabase
      await deletarDoSupabase(telefone);
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
        onItemMove={(id, colId) => {
          crm.updatePaciente(id, { colunaId: colId });

          const paciente = crm.pacientes.find(p => p.id === id);
          const coluna = crm.colunasPacientes.find(c => c.id === colId);
          if (paciente && coluna) {
            // Sheets
            atualizarEtapaNaSheets(paciente.telefone, coluna.nome, 'Pacientes');
            // Supabase
            moverStageNoSupabase(paciente.telefone, colId);
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
