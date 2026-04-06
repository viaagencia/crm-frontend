import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Coluna, Tarefa } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface KanbanColumnProps {
  coluna: Coluna;
  items: KanbanItem[];
  onItemClick: (id: string) => void;
  onAddItem: () => void;
  onRename: (nome: string) => void;
  onDelete: () => void;
}

export function KanbanColumn({ coluna, items, onItemClick, onAddItem, onRename, onDelete }: KanbanColumnProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(coluna.nome);

  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });

  const handleRename = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[280px] max-w-[280px] flex flex-col rounded-lg bg-muted/50 ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-center justify-between p-3 pb-2">
        {editing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="h-7 text-sm font-semibold"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{coluna.nome}</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {items.length}
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditName(coluna.nome); setEditing(true); }}>
              <Pencil className="h-4 w-4 mr-2" /> Renomear
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive" disabled={items.length > 0}>
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 p-2 pt-0 space-y-2 overflow-y-auto max-h-[calc(100vh-16rem)]">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onClick={() => onItemClick(item.id)} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2 pt-0">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>
    </div>
  );
}
