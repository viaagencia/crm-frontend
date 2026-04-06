import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Lead, Paciente, Tarefa, Anotacao, Agendamento, Atividade } from '@/types/crm';
import { MessageCircle, Plus, Check, Clock, Calendar, Trash2, Phone, Mail, MapPin, Pencil, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { apagarLeadDaSheets } from '@/hooks/useGoogleSheetsSync';

const API_URL = import.meta.env.VITE_API_URL || 'https://darksalmon-viper-304874.hostingersite.com';

interface ContatoDetailProps {
  contato: (Lead | Paciente) | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead | Paciente>) => void;
  onConvert?: (id: string) => void;
  onDelete?: (id: string) => void;
  agendamentos: Agendamento[];
  onAddAgendamento: (ag: Omit<Agendamento, 'id'>) => void;
  tipo: 'lead' | 'paciente';
}

export function ContatoDetail({
  contato, open, onClose, onUpdate, onConvert, onDelete,
  agendamentos, onAddAgendamento, tipo,
}: ContatoDetailProps) {
  const [newTask, setNewTask] = useState('');
  const [newTaskData, setNewTaskData] = useState('');
  const [newTaskHora, setNewTaskHora] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newAgData, setNewAgData] = useState('');
  const [newAgHora, setNewAgHora] = useState('');
  const [newAgTipo, setNewAgTipo] = useState('Consulta');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '', telefone: '', email: '', origem: '' });

  const [atividadeTipo, setAtividadeTipo] = useState<'ligacao' | 'mensagem'>('ligacao');
  const [atividadeStatus, setAtividadeStatus] = useState<string>('atendida');
  const [atividadeObs, setAtividadeObs] = useState('');

  useEffect(() => {
    if (contato) {
      setEditForm({
        nome: contato.nome,
        telefone: contato.telefone,
        email: contato.email || '',
        origem: 'origem' in contato ? (contato as Lead).origem : '',
      });
      setIsEditing(false);
    }
  }, [contato?.id]);

  if (!contato) return null;

  const whatsappUrl = `https://wa.me/${contato.telefone.replace(/\D/g, '')}`;
  const contatoAgendamentos = agendamentos.filter((a) => a.contatoId === contato.id);
  const atividades = contato.atividades || [];

  const handleSaveEdit = () => {
    const updates: Partial<Lead | Paciente> = {
      nome: editForm.nome,
      telefone: editForm.telefone,
      email: editForm.email,
    };
    if ('origem' in contato) {
      (updates as Partial<Lead>).origem = editForm.origem;
    }
    onUpdate(contato.id, updates);
    setIsEditing(false);
    toast.success('Lead atualizado com sucesso!');
  };

  // Enviar tarefa para backend
  const enviarTarefaParaBD = async (tarefa: Tarefa) => {
    try {
      const payload = {
        titulo: tarefa.titulo,
        status: tarefa.status,
        dataHora: tarefa.dataHora,
        [tipo === 'lead' ? 'lead_id' : 'paciente_id']: contato.id,
        telefone: contato.telefone.replace(/\D/g, ''),
      };
      const res = await fetch(`${API_URL}/api/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log('[ContatoDetail] ✅ Tarefa salva no backend');
      } else {
        console.error('[ContatoDetail] Erro ao salvar tarefa:', res.status);
      }
    } catch (e) {
      console.error('[ContatoDetail] Erro ao enviar tarefa:', e);
    }
  };

  // Enviar atividade para backend
  const enviarAtividadeParaBD = async (atividade: Atividade) => {
    try {
      const payload = {
        tipo: atividade.tipo,
        status: atividade.status,
        observacao: atividade.observacao,
        [tipo === 'lead' ? 'lead_id' : 'paciente_id']: contato.id,
        telefone: contato.telefone.replace(/\D/g, ''),
      };
      const res = await fetch(`${API_URL}/api/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log('[ContatoDetail] ✅ Atividade salva no backend');
      } else {
        console.error('[ContatoDetail] Erro ao salvar atividade:', res.status);
      }
    } catch (e) {
      console.error('[ContatoDetail] Erro ao enviar atividade:', e);
    }
  };

  // Enviar anotação para backend
  const enviarAnotacaoParaBD = async (anotacao: Anotacao) => {
    try {
      const payload = {
        texto: anotacao.texto,
        [tipo === 'lead' ? 'lead_id' : 'paciente_id']: contato.id,
        telefone: contato.telefone.replace(/\D/g, ''),
      };
      const res = await fetch(`${API_URL}/api/anotacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log('[ContatoDetail] ✅ Anotação salva no backend');
      } else {
        console.error('[ContatoDetail] Erro ao salvar anotação:', res.status);
      }
    } catch (e) {
      console.error('[ContatoDetail] Erro ao enviar anotação:', e);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const dataHora = newTaskData && newTaskHora ? `${newTaskData}T${newTaskHora}` : newTaskData || undefined;
    const task: Tarefa = {
      id: crypto.randomUUID(),
      titulo: newTask.trim(),
      status: 'pendente',
      dataHora,
      criadoEm: new Date().toISOString(),
    };
    onUpdate(contato.id, { tarefas: [...contato.tarefas, task] });
    // Enviar para backend
    enviarTarefaParaBD(task);
    setNewTask('');
    setNewTaskData('');
    setNewTaskHora('');
  };

  const toggleTask = (taskId: string) => {
    const updated = contato.tarefas.map((t) =>
      t.id === taskId ? { ...t, status: t.status === 'concluida' ? 'pendente' as const : 'concluida' as const } : t
    );
    onUpdate(contato.id, { tarefas: updated });
  };

  const deleteTask = (taskId: string) => {
    onUpdate(contato.id, { tarefas: contato.tarefas.filter((t) => t.id !== taskId) });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Anotacao = { id: crypto.randomUUID(), texto: newNote.trim(), criadoEm: new Date().toISOString() };
    onUpdate(contato.id, { anotacoes: [...contato.anotacoes, note] });
    // Enviar para backend
    enviarAnotacaoParaBD(note);
    setNewNote('');
  };

  const addAgendamento = () => {
    if (!newAgData || !newAgHora) return;
    onAddAgendamento({
      contatoId: contato.id, contatoTipo: tipo, contatoNome: contato.nome,
      data: newAgData, hora: newAgHora, tipo: newAgTipo, status: 'agendado',
    });
    setNewAgData('');
    setNewAgHora('');
  };

  const addAtividade = () => {
    const novaAtividade: Atividade = {
      id: crypto.randomUUID(), tipo: atividadeTipo,
      status: atividadeStatus as Atividade['status'],
      observacao: atividadeObs.trim() || undefined,
      criadoEm: new Date().toISOString(),
    };
    onUpdate(contato.id, { atividades: [...atividades, novaAtividade] });
    // Enviar para backend
    enviarAtividadeParaBD(novaAtividade);
    setAtividadeObs('');
    toast.success('Atividade registrada!');
  };

  const handleDelete = () => {
    if (!onDelete) return;
    const leadName = contato.nome;
    const leadId = contato.id;
    const contatoTelefone = contato.telefone;
    const label = tipo === 'paciente' ? 'Paciente' : 'Lead';

    // Apaga imediatamente do CRM e da planilha (sem delay)
    onDelete(leadId);
    apagarLeadDaSheets(contatoTelefone);

    onClose();
    setDeleteConfirm(false);
    toast.success(`${label} "${leadName}" excluído com sucesso`);
  };

  const statusOptions = atividadeTipo === 'ligacao'
    ? [{ value: 'atendida', label: 'Atendida' }, { value: 'nao_atendida', label: 'Não Atendida' }]
    : [{ value: 'respondida', label: 'Respondida' }, { value: 'nao_respondida', label: 'Não Respondida' }];

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="text-xl font-semibold"
                />
              ) : (
                contato.nome
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input value={editForm.telefone} onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })} placeholder="Telefone" />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                </div>
                {'origem' in contato && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input value={editForm.origem} onChange={(e) => setEditForm({ ...editForm, origem: e.target.value })} placeholder="Origem" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} className="gap-1">
                    <Save className="h-4 w-4" /> Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="gap-1">
                    <X className="h-4 w-4" /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> {contato.telefone}
                </div>
                {contato.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {contato.email}
                  </div>
                )}
                {'origem' in contato && (contato as Lead).origem && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {(contato as Lead).origem}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button asChild className="flex-1 min-w-[120px]">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </a>
              </Button>
              {!isEditing && (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} title="Editar lead">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {tipo === 'lead' && onConvert && (
                <Button variant="outline" onClick={() => onConvert(contato.id)} className="text-xs">
                  Converter em Paciente
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="icon" onClick={() => setDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="tarefas" className="mt-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
              <TabsTrigger value="agendamentos">Agenda</TabsTrigger>
            </TabsList>

            <TabsContent value="tarefas" className="space-y-3 mt-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nova tarefa..." onKeyDown={(e) => e.key === 'Enter' && addTask()} />
                  <Button size="icon" onClick={addTask}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex gap-2">
                  <Input type="date" value={newTaskData} onChange={(e) => setNewTaskData(e.target.value)} className="flex-1" />
                  <Input type="time" value={newTaskHora} onChange={(e) => setNewTaskHora(e.target.value)} className="flex-1" />
                </div>
              </div>
              {contato.tarefas.map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Button size="icon" variant={task.status === 'concluida' ? 'default' : 'outline'} className="h-6 w-6 shrink-0" onClick={() => toggleTask(task.id)}>
                    {task.status === 'concluida' && <Check className="h-3 w-3" />}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${task.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}>{task.titulo}</span>
                    {task.dataHora && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.dataHora), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="atividades" className="space-y-3 mt-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={atividadeTipo} onValueChange={(v) => { setAtividadeTipo(v as 'ligacao' | 'mensagem'); setAtividadeStatus(v === 'ligacao' ? 'atendida' : 'respondida'); }}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ligacao">Ligação</SelectItem>
                      <SelectItem value="mensagem">Mensagem</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={atividadeStatus} onValueChange={setAtividadeStatus}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea value={atividadeObs} onChange={(e) => setAtividadeObs(e.target.value)} placeholder="Observação (opcional)" rows={2} />
                <Button size="sm" onClick={addAtividade}><Plus className="h-4 w-4 mr-1" /> Registrar Atividade</Button>
              </div>
              {atividades.slice().reverse().map((at) => (
                <div key={at.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                  {at.tipo === 'ligacao' ? <Phone className="h-4 w-4 mt-0.5 text-primary" /> : <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{at.tipo === 'ligacao' ? 'Ligação' : 'Mensagem'}</span>
                      <Badge variant={at.status === 'atendida' || at.status === 'respondida' ? 'default' : 'destructive'} className="text-xs">{at.status.replace('_', ' ')}</Badge>
                    </div>
                    {at.observacao && <p className="text-sm text-muted-foreground mt-1">{at.observacao}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(at.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="anotacoes" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Escreva uma anotação..." rows={2} />
              </div>
              <Button size="sm" onClick={addNote}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
              {contato.anotacoes.slice().reverse().map((note) => (
                <div key={note.id} className="p-3 rounded-md bg-muted/50 text-sm">
                  <p>{note.texto}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(note.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="agendamentos" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={newAgData} onChange={(e) => setNewAgData(e.target.value)} />
                <Input type="time" value={newAgHora} onChange={(e) => setNewAgHora(e.target.value)} />
              </div>
              <Input value={newAgTipo} onChange={(e) => setNewAgTipo(e.target.value)} placeholder="Tipo (ex: Consulta)" />
              <Button size="sm" onClick={addAgendamento}><Calendar className="h-4 w-4 mr-1" /> Agendar</Button>
              {contatoAgendamentos.map((ag) => (
                <div key={ag.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div>
                    <div className="text-sm font-medium">{ag.tipo}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(ag.data), "dd/MM/yyyy", { locale: ptBR })} às {ag.hora}</div>
                  </div>
                  <Badge variant={ag.status === 'compareceu' ? 'default' : ag.status === 'faltou' ? 'destructive' : ag.status === 'cancelado' ? 'secondary' : 'outline'}>{ag.status}</Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {tipo === 'paciente' ? 'paciente' : 'lead'}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{contato.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
