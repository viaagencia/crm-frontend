import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
import {
  SortableContext,
  horizontalListSortingStrategy,
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Coluna, Tarefa } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const sortedColunas = [...colunas].sort((a, b) => a.ordem - b.ordem);
  const activeItem = items.find((i) => i.id === activeId);
  const canAddColumn = colunas.length < maxColunas;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find((i) => i.id === active.id);
    if (!activeItem) return;

    const overColumn = colunas.find((c) => c.id === over.id);
    if (overColumn && activeItem.colunaId !== overColumn.id) {
      onItemMove(activeItem.id, overColumn.id);
      return;
    }

    const overItem = items.find((i) => i.id === over.id);
    if (overItem && activeItem.colunaId !== overItem.colunaId) {
      onItemMove(activeItem.id, overItem.colunaId);
    }
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveId(null);
  };

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-10rem)]">
        <SortableContext items={sortedColunas.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {sortedColunas.map((coluna) => (
            <KanbanColumn
              key={coluna.id}
              coluna={coluna}
              items={items.filter((i) => i.colunaId === coluna.id)}
              onItemClick={onItemClick}
              onAddItem={() => onAddItem(coluna.id)}
              onRename={(nome) => renameColumn(coluna.id, nome)}
              onDelete={() => deleteColumn(coluna.id)}
            />
          ))}
        </SortableContext>

        {canAddColumn && (
          addingColumn ? (
            <div className="min-w-[280px] p-3 bg-muted rounded-lg">
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

      <DragOverlay>
        {activeItem ? (
          <KanbanCard item={activeItem} onClick={() => {}} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
