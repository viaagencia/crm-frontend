import { useState, useEffect } from 'react';
import { Lead, Paciente, Coluna, Pipeline, Agendamento, Orcamento, PIPELINE_PADRAO, COLUNAS_PACIENTES_PADRAO } from '@/types/crm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useCrmData() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([PIPELINE_PADRAO]);
  const [colunasPacientes] = useState<Coluna[]>(COLUNAS_PACIENTES_PADRAO);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // Carregar funis do backend quando montar
  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/funnels`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const converted = data.map((f: any) => ({
            id: f.id,
            nome: f.name,
            colunas: [
              { id: crypto.randomUUID(), nome: 'Lead', ordem: 0, tipo: 'vendas' },
              { id: crypto.randomUUID(), nome: 'Contato', ordem: 1, tipo: 'vendas' },
              { id: crypto.randomUUID(), nome: 'Fechamento', ordem: 2, tipo: 'vendas' },
            ],
            criadoEm: f.created_at,
          }));
          setPipelines(converted);
        }
      }
    } catch (err) {
      console.log('Usando funis padrão');
    }
  };

  const addPipeline = async (nome: string) => {
    if (pipelines.length >= 3) return null;
    try {
      const res = await fetch(`${API_URL}/api/funnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome })
      });
      if (res.ok) {
        const newFunnel = await res.json();
        const newPipeline: Pipeline = {
          id: newFunnel.id,
          nome: newFunnel.name,
          colunas: [
            { id: crypto.randomUUID(), nome: 'Lead', ordem: 0, tipo: 'vendas' },
            { id: crypto.randomUUID(), nome: 'Contato', ordem: 1, tipo: 'vendas' },
            { id: crypto.randomUUID(), nome: 'Fechamento', ordem: 2, tipo: 'vendas' },
          ],
          criadoEm: newFunnel.created_at || new Date().toISOString(),
        };
        setPipelines(p => [...p, newPipeline]);
        return newPipeline;
      }
    } catch (err) {
      console.error('Erro ao criar funil:', err);
    }
    return null;
  };

  const updatePipeline = async (id: string, updates: Partial<Pipeline>) => {
    try {
      await fetch(`${API_URL}/api/funnels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updates.nome })
      });
      setPipelines(p => p.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro ao atualizar funil:', err);
    }
  };

  const deletePipeline = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/funnels/${id}`, { method: 'DELETE' });
      setPipelines(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro ao deletar funil:', err);
    }
  };

  const addLead = (lead: any) => {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      tarefas: [],
      anotacoes: [],
      agendamentos: [],
      orcamentos: [],
      atividades: [],
    };
    setLeads(p => [...p, newLead]);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(p => p.filter(l => l.id !== id));
  };

  const convertLeadToPaciente = (leadId: string, colunaId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const paciente: Paciente = {
      id: crypto.randomUUID(),
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      leadOriginalId: lead.id,
      colunaId,
      criadoEm: new Date().toISOString(),
      tarefas: [],
      anotacoes: [],
      agendamentos: [],
      orcamentos: [],
      atividades: [],
    };
    setPacientes(p => [...p, paciente]);
    deleteLead(leadId);
    return paciente;
  };

  const addPaciente = (paciente: any) => {
    const newPaciente: Paciente = {
      ...paciente,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      tarefas: [],
      anotacoes: [],
      agendamentos: [],
      orcamentos: [],
      atividades: [],
    };
    setPacientes(p => [...p, newPaciente]);
    return newPaciente;
  };

  const updatePaciente = (id: string, updates: Partial<Paciente>) => {
    setPacientes(p => p.map(x => x.id === id ? { ...x, ...updates } : x));
  };

  const deletePaciente = (id: string) => {
    setPacientes(p => p.filter(x => x.id !== id));
  };

  const addAgendamento = (ag: any) => {
    const newAg: Agendamento = { ...ag, id: crypto.randomUUID() };
    setAgendamentos(p => [...p, newAg]);
    return newAg;
  };

  const updateAgendamento = (id: string, updates: Partial<Agendamento>) => {
    setAgendamentos(p => p.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addOrcamento = (orc: any) => {
    const newOrc: Orcamento = { ...orc, id: crypto.randomUUID(), criadoEm: new Date().toISOString() };
    setOrcamentos(p => [...p, newOrc]);
    return newOrc;
  };

  const updateOrcamento = (id: string, updates: Partial<Orcamento>) => {
    setOrcamentos(p => p.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  return {
    pipelines, setPipelines, addPipeline, updatePipeline, deletePipeline,
    colunasPacientes, setColunasPacientes: () => {},
    leads, setLeads, addLead, updateLead, deleteLead, convertLeadToPaciente,
    pacientes, setPacientes, addPaciente, updatePaciente, deletePaciente,
    agendamentos, setAgendamentos, addAgendamento, updateAgendamento,
    orcamentos, setOrcamentos, addOrcamento, updateOrcamento,
  };
}
