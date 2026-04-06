import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOrigemOptions } from '@/hooks/useOrigemOptions';

interface OrigemSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrigemSelect({ value, onChange }: OrigemSelectProps) {
  const { origens, addOrigem } = useOrigemOptions();
  const [newOrigem, setNewOrigem] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleAddOrigem = () => {
    if (!newOrigem.trim()) return;
    addOrigem(newOrigem.trim());
    onChange(newOrigem.trim());
    setNewOrigem('');
    setPopoverOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Origem do lead" />
        </SelectTrigger>
        <SelectContent>
          {origens.map(o => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" title="Adicionar nova origem">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <p className="text-sm font-medium">Nova origem</p>
            <Input
              value={newOrigem}
              onChange={(e) => setNewOrigem(e.target.value)}
              placeholder="Ex: Facebook Ads"
              onKeyDown={(e) => e.key === 'Enter' && handleAddOrigem()}
            />
            <Button size="sm" onClick={handleAddOrigem} className="w-full">Adicionar</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
