import React, { useState } from 'react';
import { Coluna, Tarefa } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

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

interface KanbanBoardProps {
  colunas: Coluna[];
  setColunas: (cols: Coluna[] | ((prev: Coluna[]) => Coluna[])) => void;
  items: KanbanItem[];
  onItemMove: (itemId: string, newColunaId: string) => void;
  onItemClick: (itemId: string) => void;
  onAddItem: (colunaId: string) => void;
  tipo: 'vendas' | 'pacientes';
  maxColunas?: number;
}

export function KanbanBoard({
  colunas,
  setColunas,
  items,
  onItemMove,
  onItemClick,
  onAddItem,
  tipo,
  maxColunas = 15,
}: KanbanBoardProps) {
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const sortedColunas = [...colunas].sort((a, b) => a.ordem - b.ordem);
  const canAddColumn = colunas.length < maxColunas;

  const addColumn = () => {
    if (!newColumnName.trim() || !canAddColumn) return;
    const newCol: Coluna = {
      id: crypto.randomUUID(),
      nome: newColumnName.trim(),
      ordem: colunas.length,
      tipo,
    };
    setColunas((prev: Coluna[]) => [...prev, newCol]);
    setNewColumnName('');
    setAddingColumn(false);
  };

  const renameColumn = (id: string, nome: string) => {
    setColunas((prev: Coluna[]) => prev.map((c) => (c.id === id ? { ...c, nome } : c)));
  };

  const deleteColumn = (id: string) => {
    const hasItems = items.some((i) => i.colunaId === id);
    if (hasItems) return;
    setColunas((prev: Coluna[]) => prev.filter((c) => c.id !== id));
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (colunaId: string) => {
    if (draggedItem) {
      onItemMove(draggedItem, colunaId);
      setDraggedItem(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-10rem)]">
      {sortedColunas.map((coluna) => (
        <KanbanColumn
          key={coluna.id}
          coluna={coluna}
          items={items.filter((i) => i.colunaId === coluna.id)}
          onItemClick={onItemClick}
          onAddItem={() => onAddItem(coluna.id)}
          onRename={(nome) => renameColumn(coluna.id, nome)}
          onDelete={() => deleteColumn(coluna.id)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggedItem={draggedItem}
        />
      ))}

      {canAddColumn && (
        addingColumn ? (
          <div className="min-w-[280px] p-3 bg-gray-100 rounded-lg border border-gray-300">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Nome da coluna"
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={addColumn}>Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingColumn(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="min-w-[280px] h-12 border-dashed"
            onClick={() => setAddingColumn(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Coluna
          </Button>
        )
      )}
    </div>
  );
}
