import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useCrmData() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [colunasPacientes, setColunasPacientes] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const results = await Promise.all([
        fetch(`${API_URL}/api/funnels`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/api/leads`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/api/pacientes`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/api/tarefas`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/api/atividades`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/api/agendamentos`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/api/orcamentos`).then(r => r.ok ? r.json() : [])
      ]);
      
      setPipelines(results[0] || []);
      setLeads(results[1] || []);
      setPacientes(results[2] || []);
      setTarefas(results[3] || []);
      setAtividades(results[4] || []);
      setAgendamentos(results[5] || []);
      setOrcamentos(results[6] || []);
    } catch (err) {
      console.log('Backend offline');
    }
  };

  const addPipeline = async (nome: string) => {
    try {
      const res = await fetch(`${API_URL}/api/funnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome })
      });
      if (res.ok) {
        const newP = await res.json();
        setPipelines(p => [...p, newP]);
        return newP;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const updatePipeline = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/funnels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updates.nome || updates.name })
      });
      setPipelines(p => p.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deletePipeline = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/funnels/${id}`, { method: 'DELETE' });
      setPipelines(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const addLead = async (lead: any) => {
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      if (res.ok) {
        const newL = await res.json();
        setLeads(l => [...l, newL]);
        return newL;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const updateLead = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setLeads(l => l.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/leads/${id}`, { method: 'DELETE' });
      setLeads(l => l.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const addPaciente = async (paciente: any) => {
    try {
      const res = await fetch(`${API_URL}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paciente)
      });
      if (res.ok) {
        const newPa = await res.json();
        setPacientes(pa => [...pa, newPa]);
        return newPa;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const updatePaciente = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setPacientes(pa => pa.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deletePaciente = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/pacientes/${id}`, { method: 'DELETE' });
      setPacientes(pa => pa.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const convertLeadToPaciente = async (leadId: string, colunaId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const paciente = { nome: lead.name, email: lead.email, phone: lead.phone, coluna_id: colunaId };
    const newPa = await addPaciente(paciente);
    if (newPa) await deleteLead(leadId);
    return newPa;
  };

  const addTarefa = async (tarefa: any) => {
    try {
      const res = await fetch(`${API_URL}/api/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarefa)
      });
      if (res.ok) {
        const newT = await res.json();
        setTarefas(t => [...t, newT]);
        return newT;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const updateTarefa = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/tarefas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setTarefas(t => t.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deleteTarefa = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/tarefas/${id}`, { method: 'DELETE' });
      setTarefas(t => t.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const addAtividade = async (atividade: any) => {
    try {
      const res = await fetch(`${API_URL}/api/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atividade)
      });
      if (res.ok) {
        const newA = await res.json();
        setAtividades(a => [...a, newA]);
        return newA;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deleteAtividade = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/atividades/${id}`, { method: 'DELETE' });
      setAtividades(a => a.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const addAgendamento = async (agendamento: any) => {
    try {
      const res = await fetch(`${API_URL}/api/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
      });
      if (res.ok) {
        const newAg = await res.json();
        setAgendamentos(ag => [...ag, newAg]);
        return newAg;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const updateAgendamento = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setAgendamentos(ag => ag.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/agendamentos/${id}`, { method: 'DELETE' });
      setAgendamentos(ag => ag.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const addOrcamento = async (orcamento: any) => {
    try {
      const res = await fetch(`${API_URL}/api/orcamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orcamento)
      });
      if (res.ok) {
        const newO = await res.json();
        setOrcamentos(o => [...o, newO]);
        return newO;
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const updateOrcamento = async (id: string, updates: any) => {
    try {
      await fetch(`${API_URL}/api/orcamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setOrcamentos(o => o.map(x => x.id === id ? { ...x, ...updates } : x));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const deleteOrcamento = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/orcamentos/${id}`, { method: 'DELETE' });
      setOrcamentos(o => o.filter(x => x.id !== id));
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return {
    pipelines, setPipelines, addPipeline, updatePipeline, deletePipeline,
    colunasPacientes, setColunasPacientes,
    leads, setLeads, addLead, updateLead, deleteLead, convertLeadToPaciente,
    pacientes, setPacientes, addPaciente, updatePaciente, deletePaciente,
    tarefas, setTarefas, addTarefa, updateTarefa, deleteTarefa,
    atividades, setAtividades, addAtividade, deleteAtividade,
    agendamentos, setAgendamentos, addAgendamento, updateAgendamento, deleteAgendamento,
    orcamentos, setOrcamentos, addOrcamento, updateOrcamento, deleteOrcamento,
  };
}
