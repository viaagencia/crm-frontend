import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanItem {
  id: string;
  nome: string;
  telefone: string;
  colunaId: string;
  criadoEm: string;
  origem?: string;
  ultimoProcedimento?: string;
  tarefas?: any[];
}

interface KanbanCardProps {
  item: KanbanItem;
  onClick: () => void;
  isDragging?: boolean;
}

// 🔥 COR DO TOPO (RESUMO)
function getTaskStatusColor(tarefas?: any[]): string | null {
  if (!tarefas || tarefas.length === 0) return null;

  const now = new Date();

  const pending = tarefas.filter(
    t => t.status !== 'concluida' && t.data_de_vencimento
  );

  if (pending.length === 0) return null;

  let hasOverdue = false;
  let hasToday = false;
  let hasFuture = false;

  for (const t of pending) {
    const d = new Date(t.data_de_vencimento);

    if (d < now) {
      hasOverdue = true;
      continue;
    }

    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (sameDay && d > now) {
      hasToday = true;
      continue;
    }

    if (d > now) {
      hasFuture = true;
    }
  }

  if (hasOverdue) return 'bg-destructive'; // 🔴
  if (hasToday) return 'bg-yellow-500';    // 🟡
  if (hasFuture) return 'bg-blue-500';     // 🔵

  return null;
}

// 🔥 COR INDIVIDUAL DA TAREFA
function getTaskColor(t: any): string {
  if (!t.data_de_vencimento) return 'bg-blue-500';

  const now = new Date();
  const d = new Date(t.data_de_vencimento);

  // 🔴 ATRASADA
  if (d < now) return 'bg-destructive';

  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  // 🟡 HOJE
  if (sameDay && d > now) return 'bg-yellow-500';

  // 🔵 FUTURO
  if (d > now) return 'bg-blue-500';

  return 'bg-blue-500';
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
      {/* 🔥 COR DO TOPO */}
      {statusColor && <div className={`h-1 ${statusColor}`} />}

      <div className="p-3">

        {/* NOME */}
        <div className="font-medium text-sm text-foreground">
          {item.nome}
        </div>

        {/* TELEFONE */}
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          {item.telefone}
        </div>

        {/* ORIGEM */}
        {item.origem && (
          <span className="inline-block mt-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {item.origem}
          </span>
        )}

        {/* PROCEDIMENTO */}
        {item.ultimoProcedimento && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {item.ultimoProcedimento}
          </div>
        )}

        {/* DATA */}
        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(item.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
        </div>

        {/* 🔥 TAREFAS COM COR DINÂMICA */}
        {item.tarefas && item.tarefas.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tarefas.slice(0, 2).map((t) => (
              <span
                key={t.id}
                className={`text-[10px] text-white px-2 py-1 rounded ${getTaskColor(t)}`}
              >
                {t.title}
              </span>
            ))}
          </div>
        )}

      </div>
    </Card>
  );
}