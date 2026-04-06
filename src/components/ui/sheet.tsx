import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return <>{children}</>;
}

export interface SheetTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function SheetTrigger({ children, onClick }: SheetTriggerProps) {
  return <div onClick={onClick}>{children}</div>;
}

export interface SheetContentProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function SheetContent({ children, onClose }: SheetContentProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg animate-in slide-in-from-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
