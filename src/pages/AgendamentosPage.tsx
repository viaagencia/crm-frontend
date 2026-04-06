import React, { useState } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento } from '@/types/crm';

export default function AgendamentosPage() {
  const crm = useCrm();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ contatoId: '', data: '', hora: '', tipo: 'Consulta' });

  const allContatos = [
    ...crm.leads.map((l) => ({ id: l.id, nome: l.nome, tipo: 'lead' as const })),
    ...crm.pacientes.map((p) => ({ id: p.id, nome: p.nome, tipo: 'paciente' as const })),
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { locale: ptBR });
  const calEnd = endOfWeek(monthEnd, { locale: ptBR });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getAgendamentosForDay = (date: Date) =>
    crm.agendamentos.filter((a) => isSameDay(new Date(a.data), date));

  const handleAdd = () => {
    if (!form.contatoId || !form.data || !form.hora) return;
    const contato = allContatos.find((c) => c.id === form.contatoId);
    if (!contato) return;
    crm.addAgendamento({
      contatoId: form.contatoId,
      contatoTipo: contato.tipo,
      contatoNome: contato.nome,
      data: form.data,
      hora: form.hora,
      tipo: form.tipo,
      status: 'agendado',
    });
    setForm({ contatoId: '', data: '', hora: '', tipo: 'Consulta' });
    setShowDialog(false);
  };

  const updateStatus = (id: string, status: Agendamento['status']) => {
    crm.updateAgendamento(id, { status });
  };

  const prevMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie consultas e compromissos</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>←</Button>
          <CardTitle className="text-lg capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={nextMonth}>→</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} className="p-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
            ))}
            {days.map((day) => {
              const dayAgs = getAgendamentosForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] p-1 border rounded-sm ${
                    isToday(day) ? 'bg-primary/5 border-primary' :
                    !isSameMonth(day, currentMonth) ? 'bg-muted/30 opacity-50' : 'bg-card'
                  }`}
                >
                  <div className="text-xs font-medium text-right mb-1">{format(day, 'd')}</div>
                  {dayAgs.slice(0, 2).map((ag) => (
                    <div key={ag.id} className="text-xs p-0.5 mb-0.5 rounded bg-primary/10 text-primary truncate">
                      {ag.hora} {ag.contatoNome}
                    </div>
                  ))}
                  {dayAgs.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayAgs.length - 2} mais</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming list */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {crm.agendamentos
            .filter((a) => a.status === 'agendado')
            .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
            .slice(0, 10)
            .map((ag) => (
              <div key={ag.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center bg-primary/10 rounded-md p-2 min-w-[50px]">
                    <span className="text-xs text-primary">{format(new Date(ag.data), 'dd/MM')}</span>
                    <span className="text-sm font-bold text-primary">{ag.hora}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{ag.contatoNome}</div>
                    <div className="text-xs text-muted-foreground">{ag.tipo}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => updateStatus(ag.id, 'compareceu')}>✓</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(ag.id, 'faltou')}>✗</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(ag.id, 'cancelado')}>⊘</Button>
                </div>
              </div>
            ))}
          {crm.agendamentos.filter((a) => a.status === 'agendado').length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento pendente</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={form.contatoId} onValueChange={(v) => setForm({ ...form, contatoId: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione o contato" /></SelectTrigger>
              <SelectContent>
                {allContatos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome} ({c.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            <Input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            <Input placeholder="Tipo (ex: Consulta, Retorno)" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Agendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
