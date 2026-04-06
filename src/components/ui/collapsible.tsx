import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface CollapsibleContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);

export function Collapsible({ open: controlledOpen, onOpenChange, children }: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen }}>
      <div>{children}</div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = useContext(CollapsibleContext);
  if (!context) return null;

  return (
    <button
      onClick={() => context.setOpen(!context.open)}
      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform ${context.open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function CollapsibleContent({ children }: { children: React.ReactNode }) {
  const context = useContext(CollapsibleContext);
  if (!context || !context.open) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      {children}
    </div>
  );
}
