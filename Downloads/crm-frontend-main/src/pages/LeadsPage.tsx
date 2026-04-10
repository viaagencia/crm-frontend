import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useCrm } from '@/contexts/CrmContext';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ContatoDetail } from '@/components/ContatoDetail';
import { OrigemSelect } from '@/components/OrigemSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import supabase from '@/lib/supabase';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  enviarLeadParaSheets,
  atualizarEtapaNaSheets,
  enviarPacienteParaSheets,
  apagarLeadDaSheets,
} from '@/hooks/useGoogleSheetsSync';

export default function LeadsPage() {
  const { pipelineId } = useParams();
  const navigate = useNavigate();
  const crm = useCrm();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', origem: '' });
  const [newPipelineDialog, setNewPipelineDialog] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [deletePipelineConfirm, setDeletePipelineConfirm] = useState(false);

  const [tarefasPorLead, setTarefasPorLead] = useState<any>({});

  useEffect(() => {
    const buscarTodasTarefas = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending');

      if (!data) return;

      const agrupado: any = {};

      data.forEach((t) => {
        if (!t.telefone) return;
        if (!agrupado[t.telefone]) agrupado[t.telefone] = [];
        agrupado[t.telefone].push(t);
      });

      setTarefasPorLead(agrupado);
    };

    buscarTodasTarefas();

    const update = () => buscarTodasTarefas();
    window.addEventListener('crm_update', update);
    return () => window.removeEventListener('crm_update', update);
  }, []);

  if (!pipelineId && crm.pipelines.length > 0) {
    return <Navigate to={`/leads/${crm.pipelines[0].id}`} replace />;
  }

  const pipeline = crm.pipelines.find(p => p.id === pipelineId);

  if (!pipeline && crm.pipelines.length > 0) {
    return <Navigate to={`/leads/${crm.pipelines[0].id}`} replace />;
  }

  if (!pipeline) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Nenhum funil criado</h1>
        <Button onClick={() => setNewPipelineDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Criar Funil de Vendas
        </Button>
      </div>
    );
  }

  const pipelineLeads = crm.leads.filter(l => l.pipelineId === pipelineId);
  const selectedLead = pipelineLeads.find((l) => l.id === selectedLeadId) || null;

  const items = pipelineLeads.map((l) => ({
    id: l.id,
    nome: l.nome,
    telefone: l.telefone,
    colunaId: l.colunaId,
    criadoEm: l.criadoEm,
    origem: l.origem,
    tarefas: tarefasPorLead[l.telefone] || [],
  }));

  function handleCreatePipeline() {
    if (!newPipelineName.trim()) return;
    const p = crm.addPipeline(newPipelineName.trim());
    if (p) navigate(`/leads/${p.id}`);
    setNewPipelineName('');
    setNewPipelineDialog(false);
  }

  const handleAddLead = async () => {
    if (!form.nome.trim() || !addDialog || !pipelineId) return;

    // Adicionar lead (já sincroniza com Supabase)
    await crm.addLead({
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      origem: form.origem,
      colunaId: addDialog,
      pipelineId,
    });

    // Sheets
    enviarLeadParaSheets(form.nome, form.telefone, form.origem, pipeline?.nome || 'Leads');

    setForm({ nome: '', telefone: '', email: '', origem: '' });
    setAddDialog(null);
  };

  // Recebe o objeto contato completo (chamado pelo ContatoDetail)
  const handleConvert = async (contato: any) => {
    const firstCol = crm.colunasPacientes[0];
    if (!firstCol) return;

    const lead = crm.leads.find(l => l.id === contato.id);

    // Converter lead para paciente (já sincroniza com Supabase)
    await crm.convertLeadToPaciente(contato.id, firstCol.id);
    setSelectedLeadId(null);

    if (!lead) return;

    // ✅ Atualiza a MESMA linha na planilha — muda Funil para 'Pacientes'
    // Evita criar nova linha (duplicação)
    await atualizarEtapaNaSheets(lead.telefone, 'Em Tratamento', 'Pacientes');
  };

  const handleMoverPipeline = async (id: string, pipelineId: string) => {
    const targetPipeline = crm.pipelines.find(p => p.id === pipelineId);
    if (!targetPipeline) return;

    // Atualizar lead (já sincroniza com Supabase)
    await crm.updateLead(id, {
      pipelineId,
      colunaId: targetPipeline.colunas[0]?.id,
    });
  };

  // Recebe o objeto contato completo (chamado pelo ContatoDetail)
  const handleDelete = async (contato: any) => {
    const telefone = String(contato.telefone || '').replace(/\D/g, '');

    // Deletar lead (já sincroniza com Supabase)
    await crm.deleteLead(contato.id);
    setSelectedLeadId(null);

    if (telefone) {
      // Sheets
      await apagarLeadDaSheets(telefone);
    }
  };

  const handleDeletePipeline = () => {
    if (!pipeline) return;

    crm.deletePipeline(pipeline.id);
    setDeletePipelineConfirm(false);

    if (crm.pipelines.length > 1) {
      const remaining = crm.pipelines.filter(p => p.id !== pipeline.id);
      navigate(`/leads/${remaining[0].id}`);
    } else {
      navigate('/leads');
    }
  };

  const updatePipelineColunas = (updater: any) => {
    if (!pipeline) return;

    if (typeof updater === 'function') {
      crm.updatePipeline(pipeline.id, { colunas: updater(pipeline.colunas) });
    } else {
      crm.updatePipeline(pipeline.id, { colunas: updater });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{pipeline.nome}</h1>
          <p className="text-muted-foreground text-sm">Gerencie seus leads e oportunidades</p>
        </div>

        <div className="flex gap-2">
          {crm.pipelines.length < 3 && (
            <Button variant="outline" onClick={() => setNewPipelineDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Novo Funil
            </Button>
          )}

          {crm.pipelines.length > 1 && (
            <Button variant="outline" size="icon" onClick={() => setDeletePipelineConfirm(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <KanbanBoard
        colunas={pipeline.colunas}
        setColunas={updatePipelineColunas}
        items={items}
        onItemMove={async (id, colId) => {
          // Atualizar lead (já sincroniza com Supabase)
          await crm.updateLead(id, { colunaId: colId });

          const lead = crm.leads.find(l => l.id === id);
          const coluna = pipeline?.colunas.find(c => c.id === colId);

          if (lead && coluna) {
            // Sheets
            atualizarEtapaNaSheets(lead.telefone, coluna.nome, pipeline?.nome || 'Leads');
          }
        }}
        onItemClick={setSelectedLeadId}
        onAddItem={(colId) => setAddDialog(colId)}
        tipo="vendas"
        maxColunas={15}
      />

      <ContatoDetail
        contato={selectedLead}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onConverterPaciente={handleConvert}
        onDelete={handleDelete}
        onMoverPipeline={handleMoverPipeline}
      />

      <Dialog open={!!addDialog} onOpenChange={(o) => !o && setAddDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <OrigemSelect value={form.origem} onChange={(v) => setForm({ ...form, origem: v })} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(null)}>Cancelar</Button>
            <Button onClick={handleAddLead}>Adicionar Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletePipelineConfirm} onOpenChange={setDeletePipelineConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir funil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{pipeline.nome}"?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePipeline}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={newPipelineDialog} onOpenChange={setNewPipelineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Funil</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Nome do funil"
            value={newPipelineName}
            onChange={(e) => setNewPipelineName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePipeline()}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPipelineDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreatePipeline}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
