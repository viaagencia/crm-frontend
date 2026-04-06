import React, { createContext, useContext, ReactNode } from 'react';
import { useCrmData } from '@/hooks/useCrmData';

interface CrmContextType {
  pipelines: any[];
  leads: any[];
  pacientes: any[];
  tarefas: any[];
  atividades: any[];
  agendamentos: any[];
  orcamentos: any[];
  addPipeline: (nome: string) => Promise<void>;
  addLead: (lead: any) => Promise<void>;
  addPaciente: (paciente: any) => Promise<void>;
  addTarefa: (tarefa: any) => Promise<void>;
  addAtividade: (atividade: any) => Promise<void>;
  addAgendamento: (agendamento: any) => Promise<void>;
  addOrcamento: (orcamento: any) => Promise<void>;
  updateLead: (id: string, lead: any) => Promise<void>;
  updatePaciente: (id: string, paciente: any) => Promise<void>;
  updateTarefa: (id: string, tarefa: any) => Promise<void>;
  updateAgendamento: (id: string, agendamento: any) => Promise<void>;
  updateOrcamento: (id: string, orcamento: any) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  deletePaciente: (id: string) => Promise<void>;
  deleteTarefa: (id: string) => Promise<void>;
  deleteAtividade: (id: string) => Promise<void>;
  deleteAgendamento: (id: string) => Promise<void>;
  deleteOrcamento: (id: string) => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: ReactNode }) {
  const crmData = useCrmData();

  return (
    <CrmContext.Provider value={crmData as any}>
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within CrmProvider');
  }
  return context;
}
