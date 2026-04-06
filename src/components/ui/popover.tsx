import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = useContext(PopoverContext);
  if (!context) return null;

  return (
    <button onClick={() => context.setOpen(!context.open)} className={className}>
      {children}
    </button>
  );
}

export function PopoverContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = useContext(PopoverContext);
  if (!context || !context.open) return null;

  return (
    <div className={`absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] ${className}`}>
      {children}
    </div>
  );
}
