import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Phone, Calendar } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tarefa } from '@/types/crm';

interface KanbanItem {
  id: string;
  nome: string;
  telefone: string;
  colunaId: string;
  criadoEm: string;
  origem?: string;
  ultimoProcedimento?: string;
  tarefas?: Tarefa[];
}

interface KanbanCardProps {
  item: KanbanItem;
  onClick: () => void;
  isDragging?: boolean;
}

function getTaskStatusColor(tarefas?: Tarefa[]): string | null {
  if (!tarefas || tarefas.length === 0) return null;
  const pending = tarefas.filter(t => t.status !== 'concluida' && t.dataHora);
  if (pending.length === 0) return null;

  let hasOverdue = false;
  let hasToday = false;

  for (const t of pending) {
    const d = new Date(t.dataHora!);
    if (isToday(d)) hasToday = true;
    else if (isPast(d)) hasOverdue = true;
  }

  if (hasOverdue) return 'bg-destructive';
  if (hasToday) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function KanbanCard({ item, onClick, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const statusColor = getTaskStatusColor(item.tarefas);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-pointer hover:shadow-md transition-shadow bg-card border overflow-hidden"
      onClick={onClick}
    >
      {statusColor && <div className={`h-1 ${statusColor}`} />}
      <div className="p-3">
        <div className="font-medium text-sm text-foreground">{item.nome}</div>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          {item.telefone}
        </div>
        {item.origem && (
          <span className="inline-block mt-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {item.origem}
          </span>
        )}
        {item.ultimoProcedimento && (
          <div className="mt-1.5 text-xs text-muted-foreground">{item.ultimoProcedimento}</div>
        )}
        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(item.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      </div>
    </Card>
  );
}
