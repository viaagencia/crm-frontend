import React, { useState, useMemo } from 'react';
import { useCrm } from '@/contexts/CrmContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addWeeks, addMonths, subWeeks, subMonths, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { Tarefa } from '@/types/crm';

type ViewMode = 'semana' | 'mes';

interface TaskWithOwner {
  tarefa: Tarefa;
  ownerNome: string;
  ownerId: string;
  ownerTipo: 'lead' | 'paciente';
}

export default function TarefasPage() {
  const crm = useCrm();
  const [viewMode, setViewMode] = useState<ViewMode>('semana');
  const [currentDate, setCurrentDate] = useState(new Date());

  const allTasks = useMemo(() => {
    const tasks: TaskWithOwner[] = [];
    crm.leads.forEach(l => {
      l.tarefas.forEach(t => {
        if (t.dataHora) tasks.push({ tarefa: t, ownerNome: l.nome, ownerId: l.id, ownerTipo: 'lead' });
      });
    });
    crm.pacientes.forEach(p => {
      p.tarefas.forEach(t => {
        if (t.dataHora) tasks.push({ tarefa: t, ownerNome: p.nome, ownerId: p.id, ownerTipo: 'paciente' });
      });
    });
    return tasks;
  }, [crm.leads, crm.pacientes]);

  const days = useMemo(() => {
    if (viewMode === 'semana') {
      return eachDayOfInterval({ start: startOfWeek(currentDate, { locale: ptBR }), end: endOfWeek(currentDate, { locale: ptBR }) });
    }
    return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  }, [viewMode, currentDate]);

  const navigate = (dir: number) => {
    if (viewMode === 'semana') setCurrentDate(prev => dir > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    else setCurrentDate(prev => dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const getTasksForDay = (day: Date) => {
    return allTasks.filter(t => t.tarefa.dataHora && isSameDay(new Date(t.tarefa.dataHora), day));
  };

  const getStatusColor = (t: Tarefa) => {
    if (t.status === 'concluida') return 'bg-muted text-muted-foreground';
    if (!t.dataHora) return '';
    const d = new Date(t.dataHora);
    if (isPast(d) && !isToday(d)) return 'border-l-4 border-l-destructive';
    if (isToday(d)) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground text-sm">Calendário global de tarefas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'semana' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('semana')}>Semana</Button>
          <Button variant={viewMode === 'mes' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('mes')}>Mês</Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold text-foreground capitalize">
          {viewMode === 'semana'
            ? `${format(days[0], "dd MMM", { locale: ptBR })} - ${format(days[days.length - 1], "dd MMM yyyy", { locale: ptBR })}`
            : format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className={`grid gap-2 ${viewMode === 'mes' ? 'grid-cols-7' : 'grid-cols-7'}`}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
        {viewMode === 'mes' && Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          return (
            <Card key={day.toISOString()} className={`min-h-[100px] ${isToday(day) ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-2">
                <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(t => (
                    <div key={t.tarefa.id} className={`text-xs p-1 rounded ${getStatusColor(t.tarefa)}`}>
                      <div className="flex items-center gap-1">
                        {t.tarefa.status === 'concluida' ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span className="truncate">{t.tarefa.titulo}</span>
                      </div>
                      <div className="text-muted-foreground truncate">{t.ownerNome}</div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} mais</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
