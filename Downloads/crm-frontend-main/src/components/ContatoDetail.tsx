import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Plus, Trash2, Pencil, Check, X, Phone, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import supabase from '@/lib/supabase';
import { useCrm } from '@/contexts/CrmContext';

interface Props {
  contato: any;
  open: boolean;
  onClose: () => void;
  onDelete?: (contato: any) => void;
  onConverterPaciente?: (contato: any) => void;
  onMoverPipeline?: (id: string, pipelineId: string) => void;
}

export function ContatoDetail({ contato, open, onClose, onDelete, onConverterPaciente, onMoverPipeline }: Props) {

  const crm = useCrm();

  const [tarefas, setTarefas] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [anotacoes, setAnotacoes] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);

  const [newTask, setNewTask] = useState('');
  const [newTaskData, setNewTaskData] = useState('');
  const [newTaskHora, setNewTaskHora] = useState('');

  const [atividadeTipo, setAtividadeTipo] = useState('mensagem');
  const [atividadeStatus, setAtividadeStatus] = useState('respondida');
  const [atividadeObs, setAtividadeObs] = useState('');

  const [newNote, setNewNote] = useState('');

  const [newAgData, setNewAgData] = useState('');
  const [newAgHora, setNewAgHora] = useState('');
  const [newAgTipo, setNewAgTipo] = useState('');

  // =====================
  // EDIÇÃO DO LEAD
  // =====================
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editOrigem, setEditOrigem] = useState('');
  const [editPipelineId, setEditPipelineId] = useState('');

  useEffect(() => {
    if (contato) {
      setEditNome(contato.nome || '');
      setEditTelefone(contato.telefone || '');
      setEditEmail(contato.email || '');
      setEditOrigem(contato.origem || '');
      setEditPipelineId(contato.pipelineId || '');
    }
  }, [contato]);

  const salvarLead = async () => {
    await supabase
      .from('leads')
      .update({
        nome: editNome,
        telefone: editTelefone,
        email: editEmail,
        origem: editOrigem,
      })
      .eq('telefone', contato.telefone);

    // ✅ Converter para paciente
    if (editPipelineId === '__pacientes__') {
      setIsEditing(false);
      onConverterPaciente?.(contato);
      return;
    }

    // ✅ Mover para outro funil
    if (onMoverPipeline && editPipelineId && editPipelineId !== contato.pipelineId) {
      onMoverPipeline(contato.id, editPipelineId);
    }

    setIsEditing(false);
  };

  const cancelarEdicao = () => {
    setEditNome(contato.nome || '');
    setEditTelefone(contato.telefone || '');
    setEditEmail(contato.email || '');
    setEditOrigem(contato.origem || '');
    setEditPipelineId(contato.pipelineId || '');
    setIsEditing(false);
  };

  // =====================
  // BUSCAR DADOS
  // =====================
  const buscarTudo = async () => {
    if (!contato?.telefone) return;

    const telefone = contato.telefone;

    const { data: t } = await supabase.from('tasks').select('*').eq('telefone', telefone);
    const { data: a } = await supabase.from('activities').select('*').eq('telefone', telefone);
    const { data: n } = await supabase.from('notes').select('*').eq('telefone', telefone);
    const { data: ag } = await supabase.from('events').select('*').eq('telefone', telefone);

    setTarefas(t || []);
    setAtividades(a || []);
    setAnotacoes(n || []);
    setAgendamentos(ag || []);
  };

  useEffect(() => {
    if (contato) buscarTudo();
  }, [contato]);

  // =====================
  // TAREFA
  // =====================
  const addTask = async () => {
    if (!newTask) return;

    const dataHora = newTaskData && newTaskHora
      ? `${newTaskData}T${newTaskHora}`
      : null;

    await supabase.from('tasks').insert([{
      title: newTask,
      telefone: contato.telefone,
      data_de_vencimento: dataHora,
      status: 'pending'
    }]);

    setNewTask('');
    setNewTaskData('');
    setNewTaskHora('');
    buscarTudo();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    buscarTudo();
  };

  // =====================
  // ATIVIDADE
  // =====================
  const addAtividade = async () => {
    await supabase.from('activities').insert([{
      telefone: contato.telefone,
      type: atividadeTipo,
      status: atividadeStatus,
      observacao: atividadeObs,
      created_at: new Date().toISOString()
    }]);

    setAtividadeObs('');
    buscarTudo();
  };

  const deleteAtividade = async (id: string) => {
    await supabase.from('activities').delete().eq('id', id);
    buscarTudo();
  };

  // =====================
  // ANOTAÇÃO
  // =====================
  const addAnotacao = async () => {
    if (!newNote) return;

    await supabase.from('notes').insert([{
      telefone: contato.telefone,
      content: newNote,
      created_at: new Date().toISOString()
    }]);

    setNewNote('');
    buscarTudo();
  };

  const deleteAnotacao = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    buscarTudo();
  };

  // =====================
  // AGENDA
  // =====================
  const addAgendamento = async () => {
    if (!newAgData || !newAgHora || !newAgTipo) return;

    await supabase.from('events').insert([{
      telefone: contato.telefone,
      title: newAgTipo,
      data_de_vencimento: new Date(`${newAgData}T${newAgHora}`).toISOString()
    }]);

    setNewAgData('');
    setNewAgHora('');
    setNewAgTipo('');
    buscarTudo();
  };

  const deleteAgendamento = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    buscarTudo();
  };

  if (!contato) return null;

  const numeroWhatsApp = contato.telefone?.replace(/\D/g, '');

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">

        <SheetHeader className="pb-4 border-b">

          {!isEditing ? (
            /* ===================== */
            /* MODO VISUALIZAÇÃO     */
            /* ===================== */
            <div className="space-y-3">

              <SheetTitle className="text-left">{contato.nome}</SheetTitle>

              {contato.telefone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{contato.telefone}</span>
                </div>
              )}

              {contato.email && (
                <div className="text-sm text-muted-foreground">{contato.email}</div>
              )}

              {contato.origem && (
                <div className="text-sm text-muted-foreground">Origem: {contato.origem}</div>
              )}

              <div className="flex items-center gap-2 pt-1 flex-wrap">

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/55${numeroWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </a>

                {/* Editar */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  title="Editar contato"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                {/* ✅ Converter em Paciente — só aparece se a prop existir (leads) */}
                {onConverterPaciente && (
                  <Button
                    variant="outline"
                    onClick={() => onConverterPaciente(contato)}
                  >
                    Converter em Paciente
                  </Button>
                )}

                {/* Deletar */}
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onDelete?.(contato)}
                  title="Excluir contato"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

              </div>
            </div>

          ) : (
            /* ===================== */
            /* MODO EDIÇÃO           */
            /* ===================== */
            <div className="space-y-2">

              <Input
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Nome"
              />
              <Input
                value={editTelefone}
                onChange={(e) => setEditTelefone(e.target.value)}
                placeholder="Telefone"
              />
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="E-mail"
              />
              <Input
                value={editOrigem}
                onChange={(e) => setEditOrigem(e.target.value)}
                placeholder="Origem (Instagram, WhatsApp, etc)"
              />

              {/* ✅ Seletor de funil — aparece sempre que há pipelines disponíveis */}
              {crm.pipelines.length > 0 && (
                <Select value={editPipelineId} onValueChange={setEditPipelineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mover para outro funil..." />
                  </SelectTrigger>
                  <SelectContent>
                    {crm.pipelines.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                    {/* Opção Pacientes aparece apenas para leads */}
                    {onConverterPaciente && (
                      <SelectItem value="__pacientes__">
                        → Pacientes
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}

              <div className="flex gap-2 pt-1">
                <Button className="flex-1" onClick={salvarLead}>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button className="flex-1" variant="outline" onClick={cancelarEdicao}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>

            </div>
          )}

        </SheetHeader>

        <Tabs defaultValue="tarefas" className="mt-6">

          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          {/* TAREFAS */}
          <TabsContent value="tarefas" className="space-y-3 mt-4">

            <div className="flex gap-2">
              <Input placeholder="Nova tarefa..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
              <Button onClick={addTask}><Plus /></Button>
            </div>

            <div className="flex gap-2">
              <Input type="date" value={newTaskData} onChange={(e) => setNewTaskData(e.target.value)} />
              <Input type="time" value={newTaskHora} onChange={(e) => setNewTaskHora(e.target.value)} />
            </div>

            {tarefas.map(t => (
              <div key={t.id} className="p-3 border rounded-lg flex justify-between">
                <div>
                  {t.title}
                  {t.data_de_vencimento && (
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(t.data_de_vencimento), "dd/MM/yyyy HH:mm")}
                    </div>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteTask(t.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

          </TabsContent>

          {/* ATIVIDADES */}
          <TabsContent value="atividades" className="space-y-3 mt-4">

            <div className="flex gap-2">
              <Select value={atividadeTipo} onValueChange={setAtividadeTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensagem">Mensagem</SelectItem>
                  <SelectItem value="ligacao">Ligação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={atividadeStatus} onValueChange={setAtividadeStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="respondida">Respondida</SelectItem>
                  <SelectItem value="nao_respondida">Não respondida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea placeholder="Observação..." value={atividadeObs} onChange={(e) => setAtividadeObs(e.target.value)} />
            <Button onClick={addAtividade}>Registrar</Button>

            {atividades.map(a => (
              <div key={a.id} className="p-3 border rounded-lg flex justify-between">
                <div>
                  {a.type} - {a.status}
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteAtividade(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

          </TabsContent>

          {/* ANOTAÇÕES */}
          <TabsContent value="anotacoes" className="space-y-3 mt-4">

            <Textarea placeholder="Nova anotação..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
            <Button onClick={addAnotacao}>Adicionar</Button>

            {anotacoes.map(n => (
              <div key={n.id} className="p-3 border rounded-lg flex justify-between">
                <div>
                  {n.content}
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteAnotacao(n.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

          </TabsContent>

          {/* AGENDA */}
          <TabsContent value="agenda" className="space-y-3 mt-4">

            <div className="flex gap-2">
              <Input type="date" value={newAgData} onChange={(e) => setNewAgData(e.target.value)} />
              <Input type="time" value={newAgHora} onChange={(e) => setNewAgHora(e.target.value)} />
            </div>

            <Input placeholder="Tipo (Consulta...)" value={newAgTipo} onChange={(e) => setNewAgTipo(e.target.value)} />
            <Button onClick={addAgendamento}>Agendar</Button>

            {agendamentos.map(a => (
              <div key={a.id} className="p-3 border rounded-lg flex justify-between">
                <div>
                  {a.title}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(a.data_de_vencimento), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteAgendamento(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

          </TabsContent>

        </Tabs>

      </SheetContent>
    </Sheet>
  );
}
