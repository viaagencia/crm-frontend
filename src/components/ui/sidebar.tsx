import React, { useState } from 'react';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  return (
    <aside className={`w-64 bg-gray-900 text-white ${className}`}>
      {children}
    </aside>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <nav className="space-y-2">{children}</nav>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`w-full text-left px-3 py-2 rounded hover:bg-gray-800 ${className}`}>
      {children}
    </button>
  );
}

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return {
    open: isOpen,
    setOpen: setIsOpen,
    toggleSidebar: () => setIsOpen(!isOpen)
  };
}
