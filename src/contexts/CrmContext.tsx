import React, { createContext, useContext } from 'react';
import { useCrmData } from '@/hooks/useCrmData';

type CrmContextType = ReturnType<typeof useCrmData>;

const CrmContext = createContext<CrmContextType | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const data = useCrmData();
  return <CrmContext.Provider value={data}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within CrmProvider');
  return ctx;
}
