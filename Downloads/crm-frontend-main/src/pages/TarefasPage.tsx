import React, { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addWeeks, addMonths, subWeeks, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ViewMode = 'semana' | 'mes';

interface TarefaBanco {
  id: string;
  title: string;
  status: string;
  data_de_vencimento: string;
  user_id: string;
}

export default function TarefasPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('semana');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tarefas, setTarefas] = useState<TarefaBanco[]>([]);

  useEffect(() => {
    buscarTarefas();
  }, []);

  const buscarTarefas = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.log('ERRO:', error);
    } else {
      setTarefas(data || []);
    }
  };

  const testarSupabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          title: 'Nova tarefa 🔥',
          status: 'pending',
          data_de_vencimento: new Date(),
          user_id: user.id
        }
      ]);

    if (error) {
      console.log(error);
      alert('Erro ao salvar');
    } else {
      alert('Salvou!');
      buscarTarefas();
    }
  };

  const days = viewMode === 'semana'
    ? eachDayOfInterval({
        start: startOfWeek(currentDate, { locale: ptBR }),
        end: endOfWeek(currentDate, { locale: ptBR })
      })
    : eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      });

  const navigate = (dir: number) => {
    if (viewMode === 'semana') {
      setCurrentDate(prev => dir > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const getTasksForDay = (day: Date) => {
    return tarefas.filter(t => {
      if (!t.data_de_vencimento) return false;
      return isSameDay(new Date(t.data_de_vencimento), new Date(day));
    });
  };

  return (
    <div className="p-6">

      <Button onClick={testarSupabase} className="mb-4">
        Testar Supabase
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>

        <div className="flex gap-2">
          <Button onClick={() => setViewMode('semana')}>Semana</Button>
          <Button onClick={() => setViewMode('mes')}>Mês</Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>

        <h2>
          {viewMode === 'semana'
            ? `${format(days[0], "dd MMM", { locale: ptBR })} - ${format(days[days.length - 1], "dd MMM yyyy", { locale: ptBR })}`
            : format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>

        <Button onClick={() => navigate(1)}>
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const tarefasDoDia = getTasksForDay(day);

          return (
            <Card key={day.toISOString()} className={isToday(day) ? 'border-blue-500' : ''}>
              <CardContent>
                <div className="font-bold">
                  {format(day, 'd')}
                </div>

                {tarefasDoDia.map(t => (
                  <div key={t.id} className="text-xs">
                    {t.title}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}